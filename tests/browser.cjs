// Optional development tooling only; the published game has no package dependencies.
const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { mkdir } = require('node:fs/promises');
const { join } = require('node:path');
const playwright = require('playwright');

const baseURL = process.env.TEST_URL || 'http://127.0.0.1:8000';
const engine = process.env.TEST_BROWSER || 'chromium';
const wordList = [['BOLA', 'BO', 'LA'], ['CASA', 'CA', 'SA'], ['GATO', 'GA', 'TO'], ['PATO', 'PA', 'TO'], ['SAPO', 'SA', 'PO']];
let browser;

before(async () => {
  const executablePath = process.env.BROWSER_PATH;
  browser = await playwright[engine].launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
});
after(async () => { await browser?.close(); });

async function newGame(options = {}, initScript) {
  const context = await browser.newContext({ viewport: { width: 768, height: 1024 }, hasTouch: true, isMobile: true, ...options });
  if (initScript) await context.addInitScript(initScript);
  const page = await context.newPage();
  const errors = [];
  const remoteRequests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on('request', (request) => { if (new URL(request.url()).origin !== new URL(baseURL).origin) remoteRequests.push(request.url()); });
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  return { context, page, errors, remoteRequests };
}

async function checkImages(page) {
  await page.locator('#picture').evaluate((image) => image.decode());
  assert.equal(await page.locator('#picture').evaluate((image) => image.complete && image.naturalWidth > 0), true);
}

async function screenshot(page, name) {
  if (!process.env.SCREENSHOT_DIR) return;
  await mkdir(process.env.SCREENSHOT_DIR, { recursive: true });
  await page.screenshot({ path: join(process.env.SCREENSHOT_DIR, `${name}.png`), fullPage: true });
}

for (const [name, viewport] of [['ipad-retrato', { width: 768, height: 1024 }], ['ipad-paisagem', { width: 1024, height: 768 }], ['ipad-com-barra-do-navegador', { width: 1024, height: 650 }], ['celular', { width: 320, height: 740 }]]) {
  test(`Fluxo completo, dicas e repetição em ${name}`, async () => {
    const { context, page, errors, remoteRequests } = await newGame({ viewport });
    try {
      assert.equal(await page.title(), 'Sílabas do Bê');
      assert.equal(await page.locator('#sound-toggle').isChecked(), false);
      assert.deepEqual(await page.locator('.syllable-button').allTextContents(), ['LA', 'BO']);
      const sizes = await page.locator('.syllable-button').evaluateAll((buttons) => buttons.map((button) => ({ width: button.offsetWidth, height: button.offsetHeight })));
      assert.ok(sizes.every(({ width, height }) => width >= 80 && height >= 80));
      await screenshot(page, name);
      await page.getByRole('button', { name: 'Sílaba LA', exact: true }).tap();
      assert.match(await page.locator('#feedback').textContent(), /Comece com BO/);
      assert.deepEqual(await page.locator('.answer-slot').allTextContents(), ['?', '?']);
      assert.match(await page.locator('#progress-label').textContent(), /1 DE 5/);

      for (let i = 0; i < wordList.length; i++) {
        const [word, first, second] = wordList[i];
        await checkImages(page);
        assert.equal(await page.locator('#word-model').getAttribute('aria-label'), `${word}: ${first} mais ${second}`);
        await page.getByRole('button', { name: `Sílaba ${first}`, exact: true }).tap();
        assert.deepEqual(await page.locator('.answer-slot').allTextContents(), [first, '?']);
        assert.equal(await page.getByRole('button', { name: `Sílaba ${first}`, exact: true }).isDisabled(), true);
        // A repeated event cannot erase progress or fill the second slot.
        await page.getByRole('button', { name: `Sílaba ${first}`, exact: true }).dispatchEvent('click');
        assert.deepEqual(await page.locator('.answer-slot').allTextContents(), [first, '?']);
        await page.getByRole('button', { name: `Sílaba ${second}`, exact: true }).tap();
        assert.deepEqual(await page.locator('.answer-slot').allTextContents(), [first, second]);
        assert.equal(await page.locator('#celebration').isVisible(), true);
        assert.equal(await page.locator('#celebration img').count(), 3);
        assert.match(await page.locator('#feedback').textContent(), new RegExp(`Viva! Você montou ${word}`));
        assert.equal(await page.locator('#next-button').evaluate((button) => button === document.activeElement), true);
        if (name.startsWith('ipad')) assert.equal(await page.locator('#next-button').evaluate((button) => button.getBoundingClientRect().bottom <= innerHeight), true, 'O botão para continuar deve caber na tela do iPad');
        if (i === 0) {
          await screenshot(page, `${name}-acerto`);
          // Animation runs only once and ends without automatically advancing.
          await page.waitForTimeout(1200);
          assert.equal(await page.locator('.party-art').evaluate((art) => art.getAnimations({ subtree: true }).length), 0);
          assert.equal(await page.locator('#celebration').isVisible(), true);
        }
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
        await page.locator('#next-button').tap();
        if (i < 4) assert.match(await page.locator('#progress-label').textContent(), new RegExp(`${i + 2} DE 5`));
      }
      assert.equal(await page.locator('#finish').isVisible(), true);
      assert.deepEqual(await page.locator('#finished-words span').allTextContents(), wordList.map(([word]) => word));
      assert.equal(await page.locator('.progress-dot.done').count(), 5);
      await page.locator('#restart-button').tap();
      assert.match(await page.locator('#progress-label').textContent(), /1 DE 5/);
      assert.deepEqual(await page.locator('.answer-slot').allTextContents(), ['?', '?']);
      assert.deepEqual(errors, []);
      assert.deepEqual(remoteRequests, []);
    } finally { await context.close(); }
  });
}

test('Sons opcionais, desligamento de animações e preferências após recarregar', async () => {
  const { context, page, errors } = await newGame({}, () => {
    window.__notes = 0;
    window.__audioContexts = [];
    const NativeAudio = window.AudioContext || window.webkitAudioContext;
    if (NativeAudio) {
      window.AudioContext = new Proxy(NativeAudio, {
        construct(target, args) {
          const context = new target(...args);
          window.__audioContexts.push(context);
          const nativeCreate = context.createOscillator.bind(context);
          context.createOscillator = () => { window.__notes++; return nativeCreate(); };
          return context;
        },
      });
    }
  });
  try {
    await page.getByRole('button', { name: 'Sílaba BO', exact: true }).tap();
    await page.getByRole('button', { name: 'Sílaba LA', exact: true }).tap();
    assert.equal(await page.evaluate(() => window.__notes), 0);
    await page.locator('summary').tap();
    await page.locator('#sound-toggle').check();
    await page.locator('#motion-toggle').uncheck();
    await page.locator('summary').tap();
    await page.locator('#next-button').tap();
    await page.getByRole('button', { name: 'Sílaba CA', exact: true }).tap();
    await page.getByRole('button', { name: 'Sílaba SA', exact: true }).tap();
    await page.waitForFunction(() => window.__notes === 3);
    assert.equal(await page.locator('.pig').first().evaluate((pig) => getComputedStyle(pig).animationName), 'none');
    await page.locator('summary').tap();
    await page.locator('#sound-toggle').uncheck();
    await page.waitForFunction(() => window.__audioContexts.every((context) => context.state === 'suspended'));
    await page.reload();
    assert.equal(await page.locator('#sound-toggle').isChecked(), false);
    assert.equal(await page.locator('#motion-toggle').isChecked(), false);
    assert.equal(await page.locator('html').getAttribute('data-motion'), 'off');
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

test('Movimento reduzido, armazenamento indisponível e navegação por teclado', async () => {
  const { context, page, errors } = await newGame({ reducedMotion: 'reduce', isMobile: false }, () => {
    Storage.prototype.getItem = () => { throw new Error('Storage blocked'); };
    Storage.prototype.setItem = () => { throw new Error('Storage blocked'); };
    window.AudioContext = undefined;
    window.webkitAudioContext = undefined;
  });
  try {
    assert.equal(await page.locator('#motion-toggle').isChecked(), false);
    await page.locator('summary').click();
    await page.locator('#sound-toggle').check();
    await page.locator('summary').click();
    await page.getByRole('button', { name: 'Sílaba BO', exact: true }).focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.textContent), 'LA');
    await page.keyboard.press('Space');
    assert.match(await page.locator('#feedback').textContent(), /Viva!/);
    assert.equal(await page.locator('.pig').first().evaluate((pig) => getComputedStyle(pig).animationName), 'none');
    await page.keyboard.press('Enter');
    assert.match(await page.locator('#progress-label').textContent(), /2 DE 5/);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});
