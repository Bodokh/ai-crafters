import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const routeUrl = new URL('../src/app/api/contact/route.ts', import.meta.url);
const source = await readFile(routeUrl, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
let moduleVersion = 0;

// Run the actual route and installed SDK, resolving packages from the route file.
async function loadRoute() {
  const moduleSource = `
    import { createRequire } from 'node:module';
    const require = createRequire(${JSON.stringify(routeUrl.href)});
    const exports = {};
    (function (require, exports) {
      ${compiled}
    })(require, exports);
    export const POST = exports.POST;
    // Isolate module-level environment reads between tests: ${moduleVersion++}
  `;
  return import(`data:text/javascript;base64,${Buffer.from(moduleSource).toString('base64')}`);
}

const validPayload = {
  firstName: 'Ada',
  lastName: 'Example Company',
  email: 'ada@example.com',
  message: 'Help us automate our reporting.',
  locale: 'en',
};

async function fixture(t, providerReply) {
  const environment = {
    RESEND_API_KEY: 're_test_contact_delivery',
    RESEND_BASE_URL: 'https://api.resend.com',
    CONTACT_FORM_RECIPIENT: ' leads@example.com, team@example.com ',
    CONTACT_FORM_FROM: 'AI Crafters <contact@example.com>',
    RECAPTCHA_SECRET_KEY: undefined,
  };
  for (const [name, value] of Object.entries(environment)) {
    const previous = process.env[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
    t.after(() => {
      if (previous === undefined) delete process.env[name];
      else process.env[name] = previous;
    });
  }

  const calls = [];
  const errors = [];
  t.mock.method(console, 'error', (...args) => errors.push(args));
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url: String(url), options });
    // All network is intercepted. No request can send a real email.
    if (String(url) !== 'https://api.resend.com/emails') {
      throw new Error('Unexpected request in contact delivery test.');
    }
    return providerReply();
  });

  const { POST } = await loadRoute();
  return {
    calls,
    errors,
    submit: (payload = validPayload) => POST(new Request('https://example.com/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })),
  };
}

test('acknowledges a provider-accepted message and preserves the delivery payload', async (t) => {
  const { submit, calls, errors } = await fixture(t, () => Response.json({ id: 'msg_test_accepted' }));
  const response = await submit();

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].options.method, 'POST');
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    from: 'AI Crafters <contact@example.com>',
    to: ['leads@example.com', 'team@example.com'],
    subject: 'New contact request from Ada',
    text: 'Name: Ada\nCompany: Example Company\nEmail: ada@example.com\nLocale: en\nMessage:\nHelp us automate our reporting.',
  });
  assert.deepEqual(errors, []);
});

test('rejects a provider error without exposing provider details or lead data', async (t) => {
  const { submit, errors } = await fixture(t, () => Response.json({
    name: 'validation_error',
    statusCode: 422,
    message: 'Rejected ada@example.com: private provider diagnostic.',
  }, { status: 422 }));
  const response = await submit();

  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { message: 'Unable to send your message. Please try again.' });
  assert.deepEqual(errors, [['Contact email was not accepted by the email service.']]);
});

test('rejects network failures returned as errors by the installed SDK', async (t) => {
  const { submit, errors } = await fixture(t, () => {
    throw new Error('Private network diagnostic for ada@example.com');
  });
  const response = await submit();

  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { message: 'Unable to send your message. Please try again.' });
  assert.deepEqual(errors, [['Contact email was not accepted by the email service.']]);
});

for (const [label, acknowledgement] of [
  ['missing id', {}],
  ['null payload', null],
  ['empty id', { id: '' }],
  ['whitespace id', { id: '   ' }],
  ['non-string id', { id: 123 }],
]) {
  test(`rejects an HTTP success with ${label}`, async (t) => {
    const { submit, errors } = await fixture(t, () => Response.json(acknowledgement));
    const response = await submit();

    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { message: 'Unable to send your message. Please try again.' });
    assert.deepEqual(errors, [['Contact email was not accepted by the email service.']]);
  });
}

test('keeps field validation and does not call the provider for invalid input', async (t) => {
  const { submit, calls } = await fixture(t, () => Response.json({ id: 'must_not_send' }));
  const response = await submit({ firstName: ' ', lastName: '', email: 'invalid', message: '' });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { errors: {
    firstName: 'This field is required.',
    lastName: 'This field is required.',
    email: 'Enter a valid email address.',
    message: 'This field is required.',
  } });
  assert.equal(calls.length, 0);
});

test('keeps invalid-payload rejection and does not call the provider', async (t) => {
  const { submit, calls } = await fixture(t, () => Response.json({ id: 'must_not_send' }));
  const response = await submit(null);

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { message: 'Invalid request payload.' });
  assert.equal(calls.length, 0);
});
