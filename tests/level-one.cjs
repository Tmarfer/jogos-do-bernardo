const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { mkdir } = require('node:fs/promises');
const { join } = require('node:path');
const playwright = require('playwright');
const { words } = require('../words.js');
const baseURL = process.env.TEST_URL || 'http://127.0.0.1:8000';
const engine = process.env.TEST_BROWSER || 'chromium';
let browser;

before(async () => {
  browser = await playwright[engine].launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}) });
});
after(async () => { await browser?.close(); });

async function game(options = {}, init) {
  const context = await browser.newContext({ viewport: { width: 768, height: 1024 }, hasTouch: true, isMobile: true, ...options });
  if (init) await context.addInitScript(init);
  const page = await context.newPage();
  const errors = [], remote = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on('request', (request) => { if (new URL(request.url()).origin !== new URL(baseURL).origin) remote.push(request.url()); });
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  return { page, context, errors, remote };
}

async function current(page) {
  const src = await page.locator('#picture').getAttribute('src');
  return words.find((word) => word.image === src);
}
function choice(page, syllable) { return page.getByRole('button', { name: new RegExp(`^Sílaba ${syllable}(?:, ajuda)?$`) }); }
async function noReveal(page, word) {
  assert.equal(await page.locator('#word-model').isVisible(), false);
  assert.equal(await page.locator('#word-model').textContent(), '');
  assert.equal(await page.locator('#word-model').getAttribute('aria-label'), null);
  assert.equal(await page.locator('#completed-word').textContent(), '');
  assert.equal(await page.locator('#picture').getAttribute('alt'), 'Figura da palavra desta rodada');
  assert.ok(!(await page.locator('#game').innerText()).includes(word.word));
  assert.ok(!(await page.locator('#game').ariaSnapshot()).includes(word.word));
}
async function complete(page) {
  const word = await current(page);
  for (const syllable of word.syllables) await choice(page, syllable).tap();
  return word;
}
async function shot(page, name) {
  if (!process.env.SCREENSHOT_DIR) return;
  await mkdir(process.env.SCREENSHOT_DIR, { recursive: true });
  await page.screenshot({ path: join(process.env.SCREENSHOT_DIR, `${name}.png`), fullPage: true });
}

test('30 palavras, 60 etapas, erros, ajuda e COCO sem repetição nas seis rodadas', async () => {
  const { page, context, errors, remote } = await game({}, () => {
    let seed = 725;
    Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  });
  try {
    await page.locator('#level-one').tap();
    const seen = new Set();
    for (let session = 0; session < 6; session++) {
      const sessionWords = [];
      for (let round = 0; round < 5; round++) {
        const word = await current(page);
        assert.ok(!seen.has(word.id), 'As 30 palavras devem aparecer antes de repetir');
        assert.ok(word.levels.includes(1));
        seen.add(word.id);
        sessionWords.push(word.word);
        assert.match(await page.locator('#progress-label').textContent(), new RegExp(`${round + 1} DE 5`));
        await page.locator('#picture').evaluate((image) => image.decode());
        assert.equal(await page.locator('#picture').evaluate((image) => image.naturalWidth > 0), true);
        assert.deepEqual(await page.locator('.answer-slot').allTextContents(), ['?', '?']);
        for (let stage = 0; stage < 2; stage++) {
          await noReveal(page, word);
          const options = await page.locator('#choices button').allTextContents();
          assert.deepEqual([...options].sort(), [...word.alternatives[stage]].sort());
          assert.equal(await page.locator('.help-highlight').count(), 0);
          const visuals = await page.locator('#choices button').evaluateAll((buttons) => buttons.map((button) => {
            const css = getComputedStyle(button);
            return [css.backgroundColor, css.color, css.width, css.height, css.borderColor];
          }));
          assert.ok(visuals.every((visual) => JSON.stringify(visual) === JSON.stringify(visuals[0])), 'Nenhuma alternativa deve ter aparência especial');
          const correct = word.syllables[stage];
          const wrong = options.find((option) => option !== correct);
          await choice(page, wrong).tap();
          await choice(page, wrong).tap();
          assert.equal(await page.locator('#feedback').textContent(), 'Vamos tentar outra?');
          assert.deepEqual(await page.locator('.answer-slot').allTextContents(), [stage ? word.syllables[0] : '?', '?']);
          assert.deepEqual(await page.locator('#choices button').allTextContents(), options, 'Erro não deve embaralhar opções');
          assert.equal(await page.locator('.help-highlight').count(), 0);
          await page.locator('#help-button').tap();
          assert.equal(await page.locator('.help-highlight').count(), 1);
          assert.equal(await page.locator('.help-highlight').textContent(), correct);
          assert.deepEqual(await page.locator('#choices button').allTextContents(), options);
          assert.deepEqual(await page.locator('.answer-slot').allTextContents(), [stage ? word.syllables[0] : '?', '?']);
          const oldButton = await choice(page, correct).elementHandle();
          await choice(page, correct).tap();
          if (stage === 0) {
            // Even COCO must require a fresh click in stage 2; stale first-stage events cannot complete it.
            await oldButton.evaluate((button) => button.dispatchEvent(new MouseEvent('click', { bubbles: true })));
            assert.deepEqual(await page.locator('.answer-slot').allTextContents(), [correct, '?']);
            assert.equal(await page.locator('#choices button:disabled').count(), 0);
          }
          await oldButton.dispose();
        }
        assert.deepEqual(await page.locator('.answer-slot').allTextContents(), word.syllables);
        assert.equal(await page.locator('#completed-word').textContent(), word.word);
        assert.equal(await page.locator('#word-model').getAttribute('aria-label'), `${word.word}: ${word.syllables.join(' mais ')}`);
        assert.equal(await page.locator('#word-model').isVisible(), true);
        assert.equal(await page.locator('#celebration img').count(), 3);
        assert.equal(await page.locator('#next-button').evaluate((button) => button === document.activeElement), true);
        await page.locator('#next-button').tap();
      }
      assert.equal(new Set(sessionWords).size, 5);
      assert.deepEqual(await page.locator('#finished-words span').allTextContents(), sessionWords);
      assert.equal(await page.locator('#finish-back-button').isVisible(), true);
      if (session < 5) await page.locator('#restart-button').tap();
    }
    assert.equal(seen.size, 30);
    await page.locator('#restart-button').tap();
    assert.equal(await page.locator('#round').isVisible(), true);
    assert.deepEqual(errors, []);
    assert.deepEqual(remote, []);
  } finally { await context.close(); }
});

for (const [name, viewport] of [['retrato', { width: 768, height: 1024 }], ['paisagem', { width: 1024, height: 768 }], ['paisagem-compacta', { width: 1024, height: 650 }], ['celular', { width: 320, height: 740 }]]) {
  test(`Nível 1: toque e layout em ${name}`, async () => {
    const { page, context, errors } = await game({ viewport });
    try {
      await page.locator('#level-one').tap();
      await page.locator('#picture').evaluate((image) => image.decode());
      await shot(page, `nivel1-${name}`);
      const sizes = await page.locator('#choices button').evaluateAll((buttons) => buttons.map((button) => ({ width: button.offsetWidth, height: button.offsetHeight })));
      assert.ok(sizes.every(({ width, height }) => width >= 80 && height >= 80));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      if (name !== 'celular') assert.equal(await page.locator('#choices').evaluate((options) => options.getBoundingClientRect().bottom <= innerHeight), true);
      await complete(page);
      await shot(page, `nivel1-${name}-acerto`);
      if (name !== 'celular') assert.equal(await page.locator('#next-button').evaluate((button) => button.getBoundingClientRect().bottom <= innerHeight), true);
      await page.locator('#back-button').tap();
      assert.equal(await page.locator('#home').isVisible(), true);
      await page.locator('#level-zero').tap();
      assert.equal(await page.locator('#word-model').isVisible(), true);
      assert.equal(await page.locator('#choices button').count(), 2);
      assert.equal(await page.locator('#voice-controls').isVisible(), false);
      await page.locator('#home-link').tap();
      assert.equal(await page.locator('#home').isVisible(), true);
      assert.deepEqual(errors, []);
    } finally { await context.close(); }
  });
}

test('Palavras não mostradas têm prioridade mesmo ao interromper e trocar de nível', async () => {
  const { page, context, errors } = await game();
  try {
    const seen = new Set();
    for (let i = 0; i < 30; i++) {
      await page.locator('#level-one').tap();
      const word = await current(page);
      assert.ok(!seen.has(word.id));
      seen.add(word.id);
      await page.locator('#back-button').tap();
      if (i === 5) {
        await page.locator('#level-zero').tap();
        await page.locator('#back-button').tap();
      }
    }
    assert.equal(seen.size, 30);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

function fakeSpeech() {
  window.__spoken = [];
  window.__utterances = [];
  window.__cancels = 0;
  window.__voices = [
    { name: 'Remote Brazilian', lang: 'pt-BR', localService: false },
    { name: 'Local Portuguese', lang: 'pt-PT', localService: true },
    { name: 'Local Brazilian', lang: 'pt-BR', localService: true },
  ];
  window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
    getVoices: () => window.__voices,
    cancel: () => { window.__cancels++; },
    addEventListener: (name, listener) => { if (name === 'voiceschanged') window.__voicesChanged = listener; },
    speak: (utterance) => {
      window.__lastUtterance = utterance;
      window.__utterances.push(utterance);
      window.__spoken.push({ text: utterance.text, rate: utterance.rate, lang: utterance.lang, local: utterance.voice.localService, voice: utterance.voice.name, gesture: navigator.userActivation.isActive });
    },
  } });
  window.AudioContext = undefined;
  window.webkitAudioContext = undefined;
}

for (const [level, seed, repeatedWord] of [[1, 1, 'COCO'], [2, 8520, 'BANANA']]) {
  test(`Nível ${level}: ouvir alterna palavra/sílabas, preserva repetições e reinicia por palavra`, async () => {
    const { page, context, errors, remote } = await game({}, fakeSpeech);
    try {
      await page.evaluate((initialSeed) => {
        let value = initialSeed;
        Math.random = () => ((value = (value * 16807) % 2147483647) - 1) / 2147483646;
      }, seed);
      await page.locator('summary').tap();
      await page.locator('#sound-toggle').check();
      await page.locator('summary').tap();
      await page.locator(level === 1 ? '#level-one' : '#level-two').tap();
      const word = await current(page);
      assert.equal(word.word, repeatedWord);
      assert.equal(await page.evaluate(() => window.__spoken.at(-1).text), word.word.toLowerCase());
      await page.locator('#listen-button').tap();
      assert.equal(await page.evaluate(() => window.__spoken.at(-1).text), word.word.toLowerCase());
      // Help and wrong answers do not consume the replay alternation.
      await page.locator('#help-button').tap();
      await choice(page, word.alternatives[0].find((part) => part !== word.syllables[0])).tap();
      const before = await page.evaluate(() => window.__spoken.length);
      const cancels = await page.evaluate(() => window.__cancels);
      await page.locator('#listen-button').tap();
      const split = await page.evaluate((start) => window.__spoken.slice(start), before);
      assert.deepEqual(split.map((part) => part.text), [`${word.spokenSyllables.join(', ')}.`]);
      assert.equal(split[0].text, level === 1 ? 'cô, cô.' : 'bá, ná, ná.');
      assert.ok(split.every((part) => part.rate < 0.82 && part.gesture && part.local && part.lang === 'pt-BR'));
      assert.ok(await page.evaluate(() => window.__cancels) > cancels);
      assert.deepEqual(await page.locator('.answer-slot').allTextContents(), word.syllables.map(() => '?'));
      await noReveal(page, word);
      // Finishing the phrase must not start another utterance outside the original gesture.
      await page.evaluate(() => window.__utterances.at(-1).onend());
      assert.equal(await page.evaluate(() => window.__spoken.length), before + 1);
      await page.locator('#listen-button').tap();
      assert.equal(await page.evaluate(() => window.__spoken.at(-1).text), word.word.toLowerCase());
      // Late events from canceled speech cannot replace the current playback/fallback.
      await page.evaluate(() => window.__utterances.at(-2).onerror({ error: 'synthesis-failed' }));
      assert.doesNotMatch(await page.locator('#voice-note').textContent(), /Sem voz/);
      await page.locator('summary').tap();
      await page.locator('#sound-toggle').uncheck();
      await page.locator('summary').tap();
      const mutedBefore = await page.evaluate(() => window.__spoken.length);
      await page.locator('#listen-button').tap();
      assert.equal(await page.evaluate(() => window.__spoken.length), mutedBefore);
      await page.locator('summary').tap();
      await page.locator('#sound-toggle').check();
      await page.locator('summary').tap();
      await page.locator('#listen-button').tap();
      assert.equal(await page.evaluate(() => window.__spoken.at(-1).text), `${word.spokenSyllables.join(', ')}.`);
      await complete(page);
      await page.locator('#next-button').tap();
      const nextWord = await current(page);
      await page.locator('#listen-button').tap();
      assert.equal(await page.evaluate(() => window.__spoken.at(-1).text), nextWord.word.toLowerCase());
      await page.locator('#listen-button').tap();
      assert.equal(await page.evaluate(() => window.__spoken.at(-1).text), `${nextWord.spokenSyllables.join(', ')}.`);
      await page.locator('#back-button').tap();
      await page.locator(level === 1 ? '#level-two' : '#level-one').tap();
      const otherWord = await current(page);
      await page.locator('#listen-button').tap();
      assert.equal(await page.evaluate(() => window.__spoken.at(-1).text), otherWord.word.toLowerCase());
      assert.deepEqual(errors, []);
      assert.deepEqual(remote, []);
    } finally { await context.close(); }
  });
}

test('Voz local em português: início, replay, ajuda, erros e cancelamento ao desligar', async () => {
  const { page, context, errors } = await game({}, fakeSpeech);
  try {
    await page.locator('#level-one').tap();
    const word = await current(page);
    await page.locator('#listen-button').tap();
    assert.equal(await page.evaluate(() => window.__spoken.length), 0);
    assert.match(await page.locator('#voice-note').textContent(), /Som desligado/);
    await page.locator('summary').tap();
    await page.locator('#sound-toggle').check();
    await page.locator('summary').tap();
    assert.equal(await page.evaluate(() => window.__spoken.at(-1).text), word.word.toLowerCase());
    await page.locator('#listen-button').tap();
    assert.equal(await page.evaluate(() => window.__spoken.length), 2);
    const wrong = word.alternatives[0].find((option) => option !== word.syllables[0]);
    await choice(page, wrong).tap();
    assert.equal(await page.evaluate(() => window.__spoken.length), 2);
    await page.locator('#help-button').tap();
    assert.equal(await page.evaluate(() => window.__spoken.at(-1).text), `${word.spokenSyllables[0]}.`);
    await choice(page, word.syllables[0]).tap();
    await page.locator('#help-button').tap();
    assert.equal(await page.evaluate(() => window.__spoken.at(-1).text), `${word.spokenSyllables[1]}.`);
    await choice(page, word.syllables[1]).tap();
    await page.locator('#next-button').tap();
    const nextWord = await current(page);
    assert.equal(await page.evaluate(() => window.__spoken.at(-1).text), nextWord.word.toLowerCase());
    assert.equal(await page.evaluate(() => window.__spoken.every((utterance) => utterance.local && utterance.voice === 'Local Brazilian' && utterance.lang === 'pt-BR' && utterance.gesture)), true);
    // Simulate a synthesis failure: the guardian fallback appears and the game stays playable.
    await page.evaluate(() => window.__lastUtterance.onerror({ error: 'synthesis-failed' }));
    assert.match(await page.locator('#voice-note').textContent(), /Um adulto pode/);
    const spokenBefore = await page.evaluate(() => window.__spoken.length);
    const canceledBefore = await page.evaluate(() => window.__cancels);
    await page.locator('summary').tap();
    await page.locator('#sound-toggle').uncheck();
    await page.locator('summary').tap();
    assert.ok(await page.evaluate(() => window.__cancels) > canceledBefore);
    await page.locator('#listen-button').tap();
    await page.locator('#help-button').tap();
    assert.equal(await page.evaluate(() => window.__spoken.length), spokenBefore);
    await page.locator('#back-button').tap();
    assert.ok(await page.evaluate(() => window.__cancels) > canceledBefore);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('Voz ausente ou somente remota: sem serviço externo; vozes tardias exigem novo toque', async () => {
  const { page, context, errors, remote } = await game({}, fakeSpeech);
  try {
    await page.evaluate(() => { window.__voices = [{ name: 'Remote', lang: 'pt-BR', localService: false }]; });
    await page.locator('summary').tap();
    await page.locator('#sound-toggle').check();
    await page.locator('summary').tap();
    await page.locator('#level-one').tap();
    assert.match(await page.locator('#voice-note').textContent(), /Sem voz disponível/);
    await page.locator('#listen-button').tap();
    assert.equal(await page.evaluate(() => window.__spoken.length), 0);
    await page.evaluate(() => { window.__voices = [{ name: 'Downloaded Portuguese', lang: 'pt-BR', localService: true }]; window.__voicesChanged(); });
    assert.equal(await page.evaluate(() => window.__spoken.length), 0);
    await page.locator('#listen-button').tap();
    assert.equal(await page.evaluate(() => window.__spoken.length), 1);
    assert.equal(await page.evaluate(() => window.__spoken[0].gesture), true);
    await complete(page);
    assert.equal(await page.locator('#celebration').isVisible(), true);
    assert.deepEqual(errors, []);
    assert.deepEqual(remote, []);
  } finally { await context.close(); }
});

test('Navegação, ajuda pelo teclado e Nível 1 sem armazenamento nem APIs de voz', async () => {
  const { page, context, errors } = await game({ isMobile: false, reducedMotion: 'reduce' }, () => {
    Storage.prototype.getItem = () => { throw new Error('No storage'); };
    Storage.prototype.setItem = () => { throw new Error('No storage'); };
    Object.defineProperty(window, 'speechSynthesis', { value: undefined, configurable: true });
    window.SpeechSynthesisUtterance = undefined;
  });
  try {
    await page.locator('#level-one').focus();
    await page.keyboard.press('Enter');
    const word = await current(page);
    await page.locator('#help-button').focus();
    await page.keyboard.press('Space');
    assert.equal(await page.locator('.help-highlight').textContent(), word.syllables[0]);
    for (const syllable of word.syllables) {
      await choice(page, syllable).focus();
      await page.keyboard.press('Enter');
    }
    assert.equal(await page.locator('.pig').first().evaluate((pig) => getComputedStyle(pig).animationName), 'none');
    await page.keyboard.press('Enter');
    assert.match(await page.locator('#progress-label').textContent(), /2 DE 5/);
    await page.locator('#back-button').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#level-one').evaluate((button) => button === document.activeElement), true);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});
