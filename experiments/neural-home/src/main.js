import { createCardMotion } from './card-motion.js';
import { createContactDialog } from './contact-dialog.js';
import { initializeLocalization } from './localization.js';
import { createTestimonials } from './testimonials.js';
import './contact-dialog.css';
import './interaction-polish.css';
import './testimonials.css';
import './mobile-performance.css';

const { chapterNames, motionLabels } = initializeLocalization();
const root = document.documentElement;
const coarsePointer = matchMedia('(pointer: coarse)');
function selectRendererProfile() {
  const shortSide = Math.min(window.screen?.width || innerWidth, window.screen?.height || innerHeight);
  return coarsePointer.matches && (shortSide <= 900 || innerWidth < 700) ? 'mobile' : 'desktop';
}
let rendererProfile = selectRendererProfile();
root.dataset.renderer = rendererProfile;
const journey = document.querySelector('.journey');
const stage = document.querySelector('.journey-stage');
const curtain = document.querySelector('.journey-curtain');
const progressFill = document.querySelector('.journey-progress > span');
const canvas = document.querySelector('#neural-canvas');
const fieldCanvas = document.querySelector('#neural-field');
const chapters = [...document.querySelectorAll('.chapter')];
const beats = [...document.querySelectorAll('.story-beat')];
const cardMotion = createCardMotion({beats, lightweight:rendererProfile === 'mobile'});
const trustBeat = beats.find(beat => beat.dataset.key === 'trust');
const trustIndex = beats.indexOf(trustBeat);
const finalCopy = document.querySelector('.contact-content');
const testimonials = createTestimonials({beat:trustBeat,locale:root.lang});
const contactDialog = createContactDialog({siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY});
const navLinks = [...document.querySelectorAll('.chapter-nav a')];
const label = document.querySelector('.current-checkpoint');
const motionToggle = document.querySelector('[data-motion-toggle]');
const mobileMenu = document.querySelector('.mobile-menu');
const counter = document.querySelector('[data-beat-counter]');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const shortViewport = matchMedia('(max-height: 500px)');
const names = chapterNames;
const legacyChapters = { '#services': '#agents', '#work': '#results', '#about': '#team' };
const chapterForHash = hash => chapters.findIndex(chapter => `#${chapter.id}` === (legacyChapters[hash] || hash));
const chapterStarts = chapters.map(chapter => beats.indexOf(chapter.querySelector('.story-beat')));
// Mobile moves between checkpoints faster, with more scroll reserved for reading.
let readingHold = rendererProfile === 'mobile' ? .4 : .2;
let scrollSpeed = rendererProfile === 'mobile' ? 1.6875 : 1.35;
const openingLength = .5;
const endingLength = .5;
let scene = null, active = false, journeyReady = false, sceneHasFrame = false, destroyed = false;
let field = null;
let sceneController = null, backgroundHidden = true;
let previousScroll = scrollY, lastScrollTime = performance.now();
let generation = 0, scheduledFrame = 0, loadTimer = 0, loadingDeadline = 0;
let unit = innerHeight * 1.6 / scrollSpeed, timeline = 0, currentBeat = 0;
let motionPaused = false, pendingFocus = null, resumeBeat = null, stageVisible = true;
let layoutWidth = innerWidth, layoutHeight = innerHeight;
root.dataset.sceneState = 'static';
const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const smooth = (a, b, n) => { const t = clamp((n-a)/(b-a)); return t*t*(3-2*t); };
const setStyle = (element, name, value) => {
  if (element && element.style.getPropertyValue(name) !== value) element.style.setProperty(name,value);
};
const setAttribute = (element, name, value) => {
  if (element.getAttribute(name) !== value) element.setAttribute(name,value);
};
function viewportHeight() {
  // The stage uses 100svh, which stays stable while a phone's browser bars move.
  return rendererProfile === 'mobile' ? stage.clientHeight || innerHeight : innerHeight;
}
function updateTestimonials(value = timeline) {
  testimonials.update({active:!trustBeat.inert && trustBeat.classList.contains('is-active'),
    approaching:trustIndex-value > 0 && trustIndex-value < .85});
}
function clearMobileStyles() {
  beats.forEach(beat => { beat.style.removeProperty('opacity'); beat.style.removeProperty('transform'); });
  finalCopy?.style.removeProperty('transform');
  curtain?.style.removeProperty('opacity');
  progressFill?.style.removeProperty('transform');
}

function layout() {
  layoutWidth = innerWidth;
  layoutHeight = viewportHeight();
  readingHold = rendererProfile === 'mobile' ? .4 : .2;
  scrollSpeed = rendererProfile === 'mobile' ? 1.6875 : 1.35;
  unit = layoutHeight * (innerWidth < 700 ? 1.65 : 1.6) / scrollSpeed;
  root.style.setProperty('--journey-height', `${layoutHeight + unit * (openingLength + beats.length - 1 + readingHold + endingLength)}px`);
}
function resizeJourney() {
  let position = Math.max(0,-journey.getBoundingClientRect().top/unit);
  const top = scrollY + journey.getBoundingClientRect().top;
  const previousHold = readingHold;
  layout();
  if (previousHold !== readingHold && position > openingLength) {
    // Retain the reading/transition phase when switching between device profiles.
    const travel = position - openingLength;
    const index = Math.min(Math.floor(travel),beats.length-1);
    const phase = travel - index;
    const nextPhase = phase <= previousHold ? phase / previousHold * readingHold :
      index === beats.length-1 ? readingHold + phase - previousHold :
      readingHold + (phase-previousHold)/(1-previousHold)*(1-readingHold);
    position = openingLength + index + nextPhase;
  }
  window.scrollTo({top:top+position*unit,behavior:'instant'});
  update();
}
function paintBackgroundFade(opacity) {
  if (rendererProfile === 'mobile') setStyle(curtain,'opacity',opacity.toFixed(4));
  else setStyle(root,'--journey-black',opacity.toFixed(4));
  const hidden = opacity >= .999;
  if (hidden !== backgroundHidden) { backgroundHidden = hidden; applyPause(); }
}
function sceneProgressAt(raw, contentTimeline) {
  const last = beats.length - 1;
  const departure = last - 1 + readingHold;
  // Finish the last camera/signal leg as the closing fade completes.
  const sceneTimeline = raw <= departure ? contentTimeline :
    last - 1 + smooth(departure,last,raw);
  return sceneTimeline / last;
}
function paint(value) {
  currentBeat = Math.round(value);
  if (root.dataset.beat !== String(currentBeat)) root.dataset.beat = String(currentBeat);
  const chapterIndex = chapters.indexOf(beats[currentBeat].closest('.chapter'));
  if (root.dataset.chapter !== String(chapterIndex)) root.dataset.chapter = String(chapterIndex);
  if (label && label.textContent !== names[chapterIndex]) label.textContent = names[chapterIndex];
  const countText = `${String(currentBeat+1).padStart(2,'0')} / ${beats.length}`;
  if (counter && counter.textContent !== countText) counter.textContent = countText;
  const visibleChapters = new Set();
  beats.forEach((beat, i) => {
    const relative = i - value;
    const arriving = relative >= 0;
    const amount = Math.abs(relative);
    const opacity = amount >= 1 ? 0 : arriving ? 1-smooth(.18,.86,amount) : 1-smooth(.06,.62,amount);
    const visible = opacity > .001;
    if (beat.classList.contains('is-active') !== visible) beat.classList.toggle('is-active', visible);
    const inert = i !== currentBeat || opacity < .7;
    if (beat.inert !== inert) beat.inert = inert;
    setAttribute(beat,'aria-hidden',String(inert));
    setStyle(beat,rendererProfile === 'mobile' ? 'opacity' : '--beat-opacity',opacity.toFixed(4));
    if (!visible) return;
    visibleChapters.add(beat.closest('.chapter'));
    if (beat.dataset.key === 'contact') {
      // The finale settles inward from its own center while the footer fades in place.
      if (rendererProfile === 'mobile') setStyle(finalCopy,'transform',`scale(${1 + .18 * amount})`);
      else setStyle(beat,'--beat-scale',String(1 + .18 * amount));
      return;
    }
    const direction = beat.dataset.side === 'right' ? 1 : -1;
    const x = direction * (arriving ? 170 : -95) * amount;
    const z = (arriving ? -360 : 230) * amount;
    const y = (arriving ? 22 : -20) * amount;
    const scale = 1 - (arriving ? .045 : -.025) * amount;
    if (rendererProfile === 'mobile') {
      setStyle(beat,'transform',`perspective(900px) translate3d(${x}px,${y}px,${z}px) scale(${scale})`);
    } else {
      setStyle(beat,'--beat-x',`${x}px`);
      setStyle(beat,'--beat-z',`${z}px`);
      setStyle(beat,'--beat-y',`${y}px`);
      setStyle(beat,'--beat-scale',String(scale));
    }
  });
  chapters.forEach(chapter => {
    const visible = visibleChapters.has(chapter);
    if (chapter.classList.contains('is-active') !== visible) chapter.classList.toggle('is-active', visible);
    if (chapter.inert !== !visible) chapter.inert = !visible;
    setAttribute(chapter,'aria-hidden',String(!visible));
  });
  navLinks.forEach(link => {
    if (link.hash === `#${chapters[chapterIndex].id}`) setAttribute(link,'aria-current','step');
    else if (link.hasAttribute('aria-current')) link.removeAttribute('aria-current');
  });
  if (pendingFocus === currentBeat && Math.abs(value-currentBeat) < .02 && !beats[currentBeat].inert) {
    beats[currentBeat].querySelector('h1,h2,h3')?.focus({preventScroll:true});
    pendingFocus = null;
  }
  updateTestimonials(value);
}
function update() {
  scheduledFrame = 0;
  if (!journeyReady || destroyed) return;
  const scrollPosition = Math.max(0,-journey.getBoundingClientRect().top/unit);
  const endingStart = openingLength + beats.length - 1 + readingHold;
  const finalDeparture = openingLength + beats.length - 2 + readingHold;
  // Darken ahead of the final message, reaching black as it settles into place.
  const endingFade = smooth(finalDeparture-.15,endingStart-readingHold,scrollPosition);
  paintBackgroundFade(Math.max(1-smooth(0,openingLength,scrollPosition),endingFade));
  const travel = Math.max(0,scrollPosition-openingLength);
  const raw = Math.min(travel,beats.length-1);
  const index = Math.floor(raw);
  timeline = Math.min(beats.length-1, index + smooth(readingHold,1,raw-index));
  const progress = sceneProgressAt(travel,timeline);
  if (rendererProfile === 'mobile') setStyle(progressFill,'transform',`scaleX(${progress.toFixed(5)})`);
  else setStyle(root,'--progress',progress.toFixed(5));
  if (root.dataset.progress !== progress.toFixed(5)) root.dataset.progress = progress.toFixed(5);
  paint(timeline);
  cardMotion.update(travel,readingHold);
  scene?.setProgress(progress);
  // Distant parallax follows all scrolling, including the stationary reading holds.
  field?.setProgress(clamp(scrollPosition/(endingStart+endingLength)));
  scene?.setTravel?.(clamp(scrollPosition/(endingStart+endingLength)));
}
function scheduleUpdate() { if (!scheduledFrame && journeyReady) scheduledFrame = requestAnimationFrame(update); }
function applyPause() {
  const paused = (journeyReady && motionPaused) || document.hidden || !stageVisible;
  root.style.setProperty('--ambient-play-state',paused ? 'paused' : 'running');
  updateTestimonials();
  // A fully black curtain hides the renderer; resume as soon as the fade begins.
  scene?.setPaused(paused || backgroundHidden);
  field?.setPaused(paused || backgroundHidden);
}
function goToBeat(index, instant = false, focus = false, fromBlack = false) {
  const next = clamp(index,0,beats.length-1);
  if (!journeyReady) { beats[next].scrollIntoView({behavior:'auto'}); return; }
  const top = scrollY + journey.getBoundingClientRect().top;
  pendingFocus = focus ? next : null;
  const destination = fromBlack ? 0 : openingLength + next + readingHold/2;
  window.scrollTo({top:top + unit*destination,behavior:instant?'instant':'smooth'});
  if (instant) update();
}
function restoreStatic() {
  const wasEnhanced = journeyReady;
  resumeBeat = currentBeat;
  generation++;
  active = false;
  journeyReady = false;
  sceneHasFrame = false;
  sceneController?.abort(); sceneController = null;
  clearTimeout(loadTimer);
  clearTimeout(loadingDeadline);
  cancelAnimationFrame(scheduledFrame);
  scheduledFrame = 0;
  scene?.dispose(); scene = null;
  field?.dispose(); field = null;
  root.classList.remove('is-enhanced','scene-ready','field-ready');
  clearMobileStyles();
  delete root.dataset.journeyBoot;
  cardMotion.setEnabled(false);
  root.dataset.sceneState = 'static';
  paintBackgroundFade(0);
  if (motionToggle) motionToggle.hidden = true;
  [...chapters,...beats].forEach(element => {
    element.classList.remove('is-active'); element.inert = false; element.removeAttribute('aria-hidden');
  });
  if (wasEnhanced && !destroyed) beats[currentBeat].scrollIntoView({behavior:'instant'});
}
function initialBeat() {
  if (resumeBeat !== null) return resumeBeat;
  const chapter = chapterForHash(location.hash);
  if (chapter >= 0) return chapterStarts[chapter];
  const visible = beats.findIndex(beat => beat.getBoundingClientRect().bottom > innerHeight*.4);
  return Math.max(0,visible);
}
async function loadScene(token, profile, signal) {
  let created = null;
  try {
    const options = {cardSides:beats.map(beat=>beat.dataset.side), signal, initiallyPaused:true,
      onReady: () => {
        if (token !== generation || destroyed) return;
        clearTimeout(loadingDeadline);
        sceneHasFrame = true;
        root.classList.add('scene-ready');
        if (profile === 'mobile') root.classList.add('field-ready');
        root.dataset.sceneState = 'ready';
        update(); applyPause();
      },
      onError: () => { if (token === generation && !destroyed) restoreStatic(); },
    };
    if (profile === 'mobile') {
      // Select before importing: phones never load Three.js or the desktop field.
      const {createMobileNeuralScene} = await import('./mobile-scene.js');
      if (token !== generation || destroyed) return;
      created = await createMobileNeuralScene({...options,canvas:fieldCanvas});
    } else {
      const [{createNeuralScene},{createNeuralField}] = await Promise.all([import('./scene.js'),import('./field.js')]);
      if (token !== generation || destroyed) return;
      field = createNeuralField({canvas:fieldCanvas});
      if (field) { applyPause(); root.classList.add('field-ready'); }
      created = await createNeuralScene({...options,canvas});
    }
    if (token !== generation || destroyed) { created.dispose(); return; }
    clearTimeout(loadingDeadline);
    scene = created;
    root.dataset.sceneState = 'prepared';
    // Preserve any scrolling that happened while the graphics were preparing.
    update();
    applyPause();
  } catch(error) {
    created?.dispose();
    if (token === generation && !destroyed) { restoreStatic(); console.warn('The neural journey is unavailable; all content remains readable.',error?.message); }
  }
}
function prepareScene() {
  // Replace only graphics; scroll position, current cards and pause state survive.
  const token = ++generation;
  sceneController?.abort();
  clearTimeout(loadTimer);
  clearTimeout(loadingDeadline);
  scene?.dispose(); scene = null;
  field?.dispose(); field = null;
  sceneHasFrame = false;
  root.classList.remove('scene-ready','field-ready');
  root.dataset.sceneState = 'loading';
  sceneController = new AbortController();
  const signal = sceneController.signal;
  const profile = rendererProfile;
  loadingDeadline = setTimeout(()=>{if (token === generation && !scene) restoreStatic();},20000);
  loadTimer = setTimeout(()=>loadScene(token,profile,signal),0);
}
function syncRendererProfile() {
  const next = selectRendererProfile();
  if (next === rendererProfile) return false;
  rendererProfile = next;
  root.dataset.renderer = next;
  clearMobileStyles();
  cardMotion.setLightweight(next === 'mobile');
  if (journeyReady) { update(); prepareScene(); }
  return true;
}
function start() {
  if (destroyed || active || preference.matches || shortViewport.matches) return;
  syncRendererProfile();
  const entryBeat = initialBeat();
  active = true;
  journeyReady = true;
  root.dataset.sceneState = 'loading';
  root.classList.add('is-enhanced');
  delete root.dataset.journeyBoot;
  layout(); paint(entryBeat);
  cardMotion.setEnabled(true);
  if (motionToggle) motionToggle.hidden = false;
  paintBackgroundFade(1);
  goToBeat(entryBeat,true,false,entryBeat === 0 && resumeBeat === null);
  prepareScene();
}
function onPreference() {
  syncRendererProfile();
  if (preference.matches || shortViewport.matches) restoreStatic(); else start();
}
function followHash() {
  const chapter = chapterForHash(location.hash);
  if (chapter >= 0 && journeyReady) goToBeat(chapterStarts[chapter],true,true);
}
document.addEventListener('click',event => {
  if (mobileMenu?.open && (event.target.closest?.('.mobile-menu a, [data-contact-open]') || !mobileMenu.contains(event.target))) {
    mobileMenu.open = false;
  }
  const link = event.target.closest?.('a[href^="#"]');
  if (!link || !journeyReady || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  if (link.hash === '#main') { event.preventDefault(); goToBeat(currentBeat,false,true); return; }
  const chapter = chapterForHash(link.hash);
  if (chapter < 0) return;
  event.preventDefault();
  history.pushState(null,'',link.hash);
  goToBeat(chapterStarts[chapter],false,true);
});
document.addEventListener('keydown',event => {
  if (event.key === 'Escape' && mobileMenu?.open) {
    mobileMenu.open = false;
    mobileMenu.querySelector('summary')?.focus();
  }
});
motionToggle?.addEventListener('click',()=>{
  motionPaused = !motionPaused;
  motionToggle.setAttribute('aria-pressed',String(motionPaused));
  motionToggle.textContent = motionPaused ? motionLabels.resume : motionLabels.pause;
  applyPause();
});
document.querySelector('[data-next-beat]')?.addEventListener('click',()=>goToBeat(currentBeat+1,false,true));
document.querySelector('[data-previous-beat]')?.addEventListener('click',()=>goToBeat(currentBeat-1,false,true));
const observer = new IntersectionObserver(([entry])=>{stageVisible=entry.isIntersecting;applyPause();},{threshold:0});
observer.observe(stage);
window.addEventListener('scroll',()=>{
  const now = performance.now();
  const activity = clamp(Math.abs(scrollY-previousScroll)/Math.max(16,Math.min(80,now-lastScrollTime))/1.5);
  field?.setActivity(activity);
  scene?.setActivity?.(activity);
  previousScroll = scrollY; lastScrollTime = now;
  scheduleUpdate();
},{passive:true});
window.addEventListener('resize',()=>{
  const changed = syncRendererProfile();
  if (journeyReady) {
    if (!changed && rendererProfile === 'mobile' && innerWidth === layoutWidth && viewportHeight() === layoutHeight) return;
    resizeJourney();
  }
  scene?.resize();
  field?.resize();
},{passive:true});
document.addEventListener('visibilitychange',applyPause);
preference.addEventListener('change',onPreference);
shortViewport.addEventListener('change',onPreference);
coarsePointer.addEventListener('change',()=>{
  if (syncRendererProfile() && journeyReady) resizeJourney();
});
window.addEventListener('popstate',followHash);
window.addEventListener('hashchange',followHash);
window.addEventListener('pagehide',event=>{
  if(event.persisted) {scene?.setPaused(true);field?.setPaused(true);}
  else {destroyed=true;observer.disconnect();restoreStatic();cardMotion.dispose();testimonials.dispose();contactDialog.dispose();}
});
window.addEventListener('pageshow',event=>{if(event.persisted){update();applyPause();}});
start();
