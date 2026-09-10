// Original client feedback from messages/en.json and messages/he.json.
// Keep this small subset local so the homepage does not load both full dictionaries.
const STORIES = {
  en: [
    {
      quote: 'From idea to launch, everything was handled – development, cloud setup, and scalability. They guided us through the process with clarity and professionalism. A strong team that knows how to deliver results.',
      name: 'Yogev Moyal', role: 'CTO at Worklik',
    },
    {
      quote: 'Eran played a central role in helping us build and refine our product. His structured approach and technical expertise made a significant difference. It was easy to work with him, and he always focused on delivering real value.',
      name: 'Nadia Senft', role: 'Chief Data Officer at EveryWatch',
    },
    {
      quote: 'Eran delivered a complex solution in a quarter of the expected time. His technical expertise and strategic thinking turned what looked like a two-month project into a two-week reality.',
      name: 'Nitzan Shaulof', role: 'Senior Research Assistant',
    },
  ],
  he: [
    {
      quote: 'מרעיון ועד השקה, הם טיפלו בהכל – פיתוח, הקמת הענן וסקלביליות. הם ליוו אותנו בתהליך בבהירות ובמקצועיות. צוות חזק שיודע איך להביא תוצאות.',
      name: 'יוגב מויאל', role: 'CTO at Worklik',
    },
    {
      quote: 'ערן מילא תפקיד מרכזי בסיוע לנו לבנות וללטש את המוצר שלנו. הגישה המובנית והמומחיות הטכנית שלו עשו הבדל משמעותי. היה קל לעבוד איתו, והוא תמיד התמקד במתן ערך אמיתי.',
      name: 'נדיה סנפט', role: 'Chief Data Officer at EveryWatch',
    },
    {
      quote: 'ערן סיפק פתרון מורכב ברבע מהזמן הצפוי. המומחיות הטכנית והחשיבה האסטרטגית שלו הפכו מה שנראה כפרויקט של חודשיים למציאות של שבועיים.',
      // The Hebrew dictionary has an accidental "Sorry" suffix on this role.
      name: 'ניצן שאולוף', role: 'Senior Research Assistant',
    },
  ],
};

const COPY = {
  en: { title: 'Client success stories', slide: 'slide', carousel: 'carousel', previous: 'Previous client story', next: 'Next client story', pause: 'Pause client stories', play: 'Play client stories', position: (index, total) => `Client story ${index} of ${total}` },
  he: { title: 'סיפורי הצלחה של לקוחות', slide: 'שקופית', carousel: 'קרוסלה', previous: 'סיפור הלקוח הקודם', next: 'סיפור הלקוח הבא', pause: 'השהיית סיפורי הלקוחות', play: 'הפעלת סיפורי הלקוחות', position: (index, total) => `סיפור לקוח ${index} מתוך ${total}` },
};

const ICONS = {
  previous: 'M19 12H5m7-7-7 7 7 7',
  next: 'M5 12h14m-7-7 7 7-7 7',
  pause: 'M9 5v14M15 5v14',
  play: 'm9 5 10 7-10 7Z',
};

/** A short entrance preview, then independent playback while the card is readable. */
export function createTestimonials({ beat, locale = document.documentElement.lang } = {}) {
  const card = beat?.querySelector('.client-quote');
  if (!card) return { update() {}, dispose() {} };

  const language = locale === 'he' ? 'he' : 'en';
  const stories = STORIES[language], copy = COPY[language];
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const originalAttributes = new Map(['role', 'aria-roledescription', 'aria-label'].map(name => [name, card.getAttribute(name)]));
  const originalContent = [...card.children].filter(node => node.matches('blockquote, figcaption'));
  let active = false, approaching = false, inViewport = false, nearViewport = false, manualPause = false;
  let disposed = false, initialized = false;
  let entryPresent = false, entryPending = true;
  let current = 0, timer = 0, timerGeneration = 0, deck, controls, announcement, counter, playback;
  const slides = [], decorations = [];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function setIcon(button, name) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const path = document.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute('d', ICONS[name]);
    svg.append(path);
    button.replaceChildren(svg);
  }

  function button(name, handler) {
    const node = element('button', `testimonial-control testimonial-control--${name}`);
    node.type = 'button';
    node.setAttribute('aria-label', copy[name]);
    setIcon(node, name);
    node.addEventListener('click', handler, options);
    return node;
  }

  function paint(manual = false) {
    slides.forEach((slide, index) => {
      const selected = index === current;
      slide.classList.toggle('is-current', selected);
      slide.setAttribute('aria-hidden', String(!selected));
      slide.inert = !selected;
    });
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(stories.length).padStart(2, '0')}`;
    // Short screens can scroll within a quote; the next story starts at its top.
    deck.scrollTop = 0;
    if (manual) announcement.textContent = `${copy.position(current + 1, stories.length)}: ${stories[current].name}`;
  }

  function move(direction) {
    // Give a manually chosen story its full reading interval, without stopping autoplay.
    clearTimer();
    entryPending = false;
    current = (current + direction + stories.length) % stories.length;
    paint(true);
    reconcile();
  }

  function initialize() {
    if (initialized) return;
    initialized = true;
    card.classList.add('testimonial-carousel');
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', copy.carousel);
    card.setAttribute('aria-label', copy.title);
    deck = element('div', 'testimonial-slides');
    stories.forEach((story, index) => {
      const slide = element('div', 'testimonial-slide');
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', copy.slide);
      slide.setAttribute('aria-label', copy.position(index + 1, stories.length));
      const quote = element('blockquote', 'testimonial-quote', language === 'he' ? `״${story.quote}״` : `“${story.quote}”`);
      const author = element('div', 'testimonial-author');
      const name = element('span', 'testimonial-name', story.name);
      const role = element('span', 'testimonial-role', story.role);
      role.dir = 'auto';
      author.append(name, role);
      slide.append(quote, author);
      slides.push(slide);
      deck.append(slide);
    });
    controls = element('div', 'testimonial-controls');
    counter = element('span', 'testimonial-position');
    counter.dir = 'ltr';
    counter.setAttribute('aria-hidden', 'true');
    const actions = element('div', 'testimonial-actions');
    playback = button('pause', () => {
      manualPause = !manualPause;
      reconcile();
    });
    actions.append(button('previous', () => move(-1)), playback, button('next', () => move(1)));
    controls.append(counter, actions);
    announcement = element('span', 'testimonial-announcement');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    originalContent.forEach(node => node.remove());
    card.append(deck, controls, announcement);
    decorations.push(deck, controls, announcement);
    paint();
  }

  function clearTimer() {
    if (!timer) return;
    clearTimeout(timer);
    timer = 0;
    timerGeneration++;
  }

  function availability() {
    const enhanced = document.documentElement.classList.contains('is-enhanced');
    const readable = inViewport && (!enhanced || (active && !beat.inert));
    // The scroll controller can prewarm an approaching beat while it is still
    // inert; static pages use a small viewport margin instead of a timeline.
    const nearby = enhanced ? approaching : nearViewport;
    return { readable, nearby, eligible: readable || nearby };
  }

  function reconcile() {
    if (disposed) return;
    const { readable, eligible } = availability();
    if (eligible && !entryPresent) {
      entryPresent = true;
      entryPending = true;
    } else if (!eligible) {
      entryPresent = false;
      entryPending = true;
    }
    if (eligible) initialize();
    if (!initialized) return;
    // Removing this class snaps any in-flight crossfade to its final state.
    // Hidden checkpoints therefore keep no pending visual transition.
    card.classList.toggle('testimonial-can-transition', eligible && !document.hidden);
    // One preview swap is allowed during approach; recurring playback waits
    // for a readable card. Reduced motion changes only the CSS transition.
    const shouldRun = eligible && (entryPending || readable) && !document.hidden && !manualPause;
    if (!shouldRun) clearTimer();
    else if (!timer) {
      const token = ++timerGeneration;
      timer = setTimeout(() => {
        if (disposed || token !== timerGeneration) return;
        timer = 0;
        const next = availability();
        if (!next.eligible || (!entryPending && !next.readable) || document.hidden || manualPause) { reconcile(); return; }
        entryPending = false;
        current = (current + 1) % stories.length;
        paint();
        reconcile();
      }, entryPending ? 1000 : 8000);
    }
    const name = manualPause ? 'play' : 'pause';
    if (playback.dataset.icon !== name) {
      playback.dataset.icon = name;
      playback.setAttribute('aria-label', copy[name]);
      setIcon(playback, name);
    }
  }

  const observer = new IntersectionObserver(entries => {
    inViewport = entries[0].isIntersecting;
    reconcile();
  }, { threshold: 0 });
  observer.observe(card);
  const nearObserver = new IntersectionObserver(entries => {
    nearViewport = entries[0].isIntersecting;
    reconcile();
  }, { threshold: 0, rootMargin: '180px 0px' });
  nearObserver.observe(card);
  document.addEventListener('visibilitychange', reconcile, options);

  return {
    update(state = {}) {
      if (disposed) return;
      active = Boolean(state.active);
      approaching = Boolean(state.approaching);
      reconcile();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      clearTimer();
      observer.disconnect();
      nearObserver.disconnect();
      controller.abort();
      decorations.forEach(node => node.remove());
      if (initialized) {
        card.classList.remove('testimonial-carousel', 'testimonial-can-transition');
        originalAttributes.forEach((value, name) => value === null ? card.removeAttribute(name) : card.setAttribute(name, value));
        card.prepend(...originalContent);
      }
    },
  };
}
