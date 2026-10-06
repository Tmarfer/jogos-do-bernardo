const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { mkdir } = require('node:fs/promises');
const { join } = require('node:path');
const playwright = require('playwright');
const { words } = require('../words.js');
const baseURL = process.env.TEST_URL || 'http://127.0.0.1:8000';
let browser;
before(async () => {
  browser = await playwright[process.env.TEST_BROWSER || 'chromium'].launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}) });
});
after(async () => { await browser?.close(); });

async function game(options = {}, init) {
  const context = await browser.newContext({ viewport: { width: 768, height: 1024 }, hasTouch: true, isMobile: true, ...options });
  if (init) await context.addInitScript(init);
  const page = await context.newPage();
  const errors = [], external = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on('request', (request) => { if (new URL(request.url()).origin !== new URL(baseURL).origin) external.push(request.url()); });
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  return { page, context, errors, external };
}
// Read the rendered illustration instead of exposing internal game state for tests.
async function wordAt(page) {
  const src = await page.locator('#picture').getAttribute('src');
  return words.find((word) => word.image === src);
}
function choice(page, syllable) { return page.getByRole('button', { name: new RegExp(`^Sílaba ${syllable}(?:, ajuda)?$`) }); }
async function checkHidden(page, word) {
  assert.equal(await page.locator('#word-model').isVisible(), false);
  assert.equal(await page.locator('#word-model').textContent(), '');
  assert.equal(await page.locator('#completed-word').textContent(), '');
  assert.ok(!(await page.locator('#game').innerText()).includes(word.word));
  assert.ok(!(await page.locator('#game').ariaSnapshot()).includes(word.word));
}
async function shot(page, name) {
  if (!process.env.SCREENSHOT_DIR) return;
  await mkdir(process.env.SCREENSHOT_DIR, { recursive: true });
  await page.screenshot({ path: join(process.env.SCREENSHOT_DIR, `${name}.png`), fullPage: true });
}

test('Nível 2: 15 palavras, 45 etapas, seis alternativas, ajuda, erros e sílabas repetidas', async () => {
  const { context, page, errors, external } = await game();
  try {
    await page.locator('#level-two').tap();
    const seen = new Set();
    for (let session = 0; session < 3; session++) {
      const finished = [];
      for (let round = 0; round < 5; round++) {
        const word = await wordAt(page);
        assert.ok(word.levels.includes(2));
        assert.ok(!seen.has(word.id));
        seen.add(word.id);
        finished.push(word.word);
        await page.locator('#picture').evaluate((image) => image.decode());
        assert.match(await page.locator('#progress-label').textContent(), new RegExp(`${round + 1} DE 5`));
        assert.deepEqual(await page.locator('.answer-slot').allTextContents(), ['?', '?', '?']);
        for (let stage = 0; stage < 3; stage++) {
          await checkHidden(page, word);
          const options = await page.locator('#choices button').allTextContents();
          assert.equal(new Set(options).size, 6);
          assert.deepEqual([...options].sort(), [...word.alternatives[stage]].sort());
          assert.equal(await page.locator('.help-highlight').count(), 0);
          const visual = await page.locator('#choices button').evaluateAll((buttons) => buttons.map((button) => {
            const css = getComputedStyle(button);
            return [css.backgroundColor, css.color, css.width, css.height, css.borderColor];
          }));
          assert.ok(visual.every((value) => JSON.stringify(value) === JSON.stringify(visual[0])));
          const correct = word.syllables[stage];
          const wrong = options.find((option) => option !== correct);
          await choice(page, wrong).tap();
          assert.equal(await page.locator('#feedback').textContent(), 'Vamos tentar outra?');
          assert.deepEqual(await page.locator('#choices button').allTextContents(), options);
          const expected = word.syllables.map((syllable, position) => position < stage ? syllable : '?');
          assert.deepEqual(await page.locator('.answer-slot').allTextContents(), expected);
          await page.locator('#help-button').tap();
          assert.equal(await page.locator('.help-highlight').textContent(), correct);
          assert.deepEqual(await page.locator('.answer-slot').allTextContents(), expected);
          const oldButton = await choice(page, correct).elementHandle();
          await choice(page, correct).tap();
          await oldButton.evaluate((button) => button.dispatchEvent(new MouseEvent('click', { bubbles: true })));
          await oldButton.dispose();
          assert.deepEqual(await page.locator('.answer-slot').allTextContents(), word.syllables.map((syllable, position) => position <= stage ? syllable : '?'));
          assert.equal(await page.locator('.answer-slot').nth(stage).getAttribute('aria-label'), `${['Primeira', 'Segunda', 'Terceira'][stage]} sílaba: ${correct}`);
          if (stage < 2) {
            assert.equal(await page.locator('#celebration').isVisible(), false);
            assert.equal(await page.locator('#choices button:disabled').count(), 0);
          }
        }
        assert.equal(await page.locator('#completed-word').textContent(), word.word);
        assert.equal(await page.locator('#word-model').getAttribute('aria-label'), `${word.word}: ${word.syllables.join(' mais ')}`);
        assert.equal(await page.locator('#celebration img').count(), 3);
        assert.equal(await page.locator('#next-button').evaluate((button) => button === document.activeElement), true);
        await page.locator('#next-button').tap();
      }
      assert.equal(new Set(finished).size, 5);
      assert.deepEqual(await page.locator('#finished-words span').allTextContents(), finished);
      if (session < 2) await page.locator('#restart-button').tap();
    }
    assert.equal(seen.size, 15);
    assert.ok(seen.has('banana') && seen.has('batata'));
    await page.locator('#finish-back-button').tap();
    assert.equal(await page.locator('#home').isVisible(), true);
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
  } finally { await context.close(); }
});

for (const [name, viewport] of [['retrato', { width: 768, height: 1024 }], ['paisagem', { width: 1024, height: 768 }], ['paisagem-compacta', { width: 1024, height: 650 }], ['celular', { width: 320, height: 740 }]]) {
  test(`Três níveis e layout do Nível 2 em ${name}`, async () => {
    const { page, context, errors } = await game({ viewport });
    try {
      assert.equal(await page.locator('.level-button').count(), 3);
      await page.locator('#level-two').tap();
      const word = await wordAt(page);
      await page.locator('#picture').evaluate((image) => image.decode());
      await shot(page, `nivel2-${name}`);
      const sizes = await page.locator('#choices button').evaluateAll((buttons) => buttons.map((button) => ({ width: button.offsetWidth, height: button.offsetHeight })));
      assert.ok(sizes.every(({ width, height }) => width >= 80 && height >= 80));
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      if (name !== 'celular') assert.equal(await page.locator('#choices').evaluate((options) => options.getBoundingClientRect().bottom <= innerHeight), true);
      for (const syllable of word.syllables) await choice(page, syllable).tap();
      await shot(page, `nivel2-${name}-acerto`);
      if (name !== 'celular') assert.equal(await page.locator('#next-button').evaluate((button) => button.getBoundingClientRect().bottom <= innerHeight), true);
      for (const [button, spaces, options] of [['level-zero', 2, 2], ['level-one', 2, 4], ['level-two', 3, 6]]) {
        await page.locator('#back-button').tap();
        await page.locator(`#${button}`).tap();
        assert.equal(await page.locator('.answer-slot').count(), spaces);
        assert.equal(await page.locator('#choices button').count(), options);
        assert.deepEqual(await page.locator('.answer-slot').allTextContents(), Array(spaces).fill('?'));
      }
      assert.deepEqual(errors, []);
    } finally { await context.close(); }
  });
}

test('Histórico do Nível 2 mantém prioridade ao interromper e visitar outros níveis', async () => {
  const { context, page, errors } = await game();
  try {
    const seen = new Set();
    for (let i = 0; i < 15; i++) {
      await page.locator('#level-two').tap();
      const word = await wordAt(page);
      assert.ok(!seen.has(word.id));
      seen.add(word.id);
      await page.locator('#back-button').tap();
      if (i === 4 || i === 9) {
        await page.locator(i === 4 ? '#level-zero' : '#level-one').tap();
        await page.locator('#back-button').tap();
      }
    }
    assert.equal(seen.size, 15);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('Voz e ajuda nas três etapas, teclado, som desligado e movimento reduzido', async () => {
  const { context, page, errors } = await game({ reducedMotion: 'reduce', isMobile: false }, () => {
    window.__spoken = [];
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      getVoices: () => [{ name: 'Local', lang: 'pt-BR', localService: true }],
      cancel() {}, addEventListener() {},
      speak: (utterance) => { window.__spoken.push({ text: utterance.text, local: utterance.voice.localService, gesture: navigator.userActivation.isActive }); },
    } });
    window.AudioContext = undefined;
    window.webkitAudioContext = undefined;
  });
  try {
    await page.locator('summary').click();
    await page.locator('#sound-toggle').check();
    await page.locator('summary').click();
    await page.locator('#level-two').focus();
    await page.keyboard.press('Enter');
    const word = await wordAt(page);
    assert.equal(await page.evaluate(() => window.__spoken.at(-1).text), word.word.toLowerCase());
    for (const [stage, syllable] of word.syllables.entries()) {
      await page.locator('#help-button').focus();
      await page.keyboard.press('Space');
      assert.equal(await page.evaluate(() => window.__spoken.at(-1).text), `${word.spokenSyllables[stage]}.`);
      await choice(page, syllable).focus();
      await page.keyboard.press('Enter');
    }
    assert.equal(await page.evaluate(() => window.__spoken.every((utterance) => utterance.local && utterance.gesture)), true);
    assert.equal(await page.locator('.pig').first().evaluate((pig) => getComputedStyle(pig).animationName), 'none');
    await page.keyboard.press('Enter');
    const before = await page.evaluate(() => window.__spoken.length);
    await page.locator('summary').click();
    await page.locator('#sound-toggle').uncheck();
    await page.locator('summary').click();
    await page.locator('#listen-button').click();
    await page.locator('#help-button').click();
    assert.equal(await page.evaluate(() => window.__spoken.length), before);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});
