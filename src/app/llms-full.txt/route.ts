import { renderLlmsFullTxt } from '@/lib/ai-markdown';

export const dynamic = 'force-static';

export function GET() {
  return new Response(renderLlmsFullTxt(), {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
