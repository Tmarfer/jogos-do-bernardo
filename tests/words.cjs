const { test } = require('node:test');
const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const { words, levels, validateWords, levelZeroIds, planRound, noteShown } = require('../words.js');

const expected = {
  BOLA: ['BO', 'LA'], CASA: ['CA', 'SA'], PATO: ['PA', 'TO'], GATO: ['GA', 'TO'], SAPO: ['SA', 'PO'],
  VACA: ['VA', 'CA'], FACA: ['FA', 'CA'], MALA: ['MA', 'LA'], MAPA: ['MA', 'PA'], LATA: ['LA', 'TA'],
  DADO: ['DA', 'DO'], DEDO: ['DE', 'DO'], PIPA: ['PI', 'PA'], MOTO: ['MO', 'TO'], BOTA: ['BO', 'TA'],
  BOCA: ['BO', 'CA'], CAMA: ['CA', 'MA'], COCO: ['CO', 'CO'], SUCO: ['SU', 'CO'], RATO: ['RA', 'TO'],
  FOCA: ['FO', 'CA'], LOBO: ['LO', 'BO'], LUVA: ['LU', 'VA'], PENA: ['PE', 'NA'], SINO: ['SI', 'NO'],
  NAVE: ['NA', 'VE'], REDE: ['RE', 'DE'], ROSA: ['RO', 'SA'], RODA: ['RO', 'DA'], FOGO: ['FO', 'GO'],
  BANANA: ['BA', 'NA', 'NA'], BATATA: ['BA', 'TA', 'TA'], TOMATE: ['TO', 'MA', 'TE'], PANELA: ['PA', 'NE', 'LA'], CANETA: ['CA', 'NE', 'TA'],
  CAVALO: ['CA', 'VA', 'LO'], BONECA: ['BO', 'NE', 'CA'], JANELA: ['JA', 'NE', 'LA'], SAPATO: ['SA', 'PA', 'TO'], MACACO: ['MA', 'CA', 'CO'],
  PIPOCA: ['PI', 'PO', 'CA'], PETECA: ['PE', 'TE', 'CA'], CEBOLA: ['CE', 'BO', 'LA'], GIRAFA: ['GI', 'RA', 'FA'], CAMISA: ['CA', 'MI', 'SA'],
};

test('Banco tem 500 ou mais palavras, as 45 divisões originais e figuras locais', () => {
  assert.ok(words.length >= 500);
  assert.equal(new Set(words.map(({ id }) => id)).size, words.length);
  for (const [name, syllables] of Object.entries(expected)) {
    assert.deepEqual(words.find((word) => word.word === name).syllables, syllables);
  }
  assert.deepEqual(levels.map(({ syllableCount }) => syllableCount), [2, 2, 3, 3, 4, 4]);
  assert.deepEqual(levels.map(({ choiceCount }) => choiceCount), [2, 4, 6, 6, 6, 6]);
  assert.ok(['bola', 'casa', 'gato', 'pato', 'sapo'].every((id) => levelZeroIds.includes(id)));
  for (const id of ['foca', 'lobo', 'luva', 'pena', 'sino', 'nave', 'rede', 'rosa', 'roda', 'fogo']) {
    assert.deepEqual(words.find((word) => word.id === id).levels, [1]);
  }
  for (const id of ['banana', 'batata', 'tomate', 'panela', 'caneta', 'cavalo', 'boneca', 'janela', 'sapato', 'macaco', 'pipoca', 'peteca', 'cebola', 'girafa', 'camisa']) {
    assert.deepEqual(words.find((word) => word.id === id).levels, [2]);
  }
  for (const word of words) {
    const path = join(__dirname, '..', word.image);
    assert.ok(existsSync(path), word.image);
    const svg = readFileSync(path, 'utf8');
    assert.match(svg, /<svg\b/);
    assert.doesNotMatch(svg, /<text\b|<image\b|<script\b|href=|url\(https?:/i);
  }
});

test('Alternativas seguem o modo de cada nível e têm uma única resposta', () => {
  assert.equal(validateWords(words), true);
  for (const word of words) word.alternatives.forEach((choices, stage) => {
    const correct = word.syllables[stage];
    const mode = word.levels.some((id) => id === 3 || id === 5) ? 'contrast' : word.levels.some((id) => id === 2 || id === 4) ? 'family' : 'vowel';
    const count = mode === 'vowel' ? 4 : 6;
    assert.equal(choices.length, count);
    assert.equal(new Set(choices).size, count);
    assert.equal(choices.filter((choice) => choice === correct).length, 1);
    assert.ok(choices.every((choice) => /^[BCDFGJLMNPRSTV][AEIOU]$/.test(choice)));
    const same = choices.filter((choice) => choice[0] === correct[0]).length;
    if (mode === 'vowel') assert.equal(same, 4);
    if (mode === 'family') assert.equal(same, 5);
    if (mode === 'contrast') assert.ok(new Set(choices.map((choice) => choice[0])).size >= 2);
  });
});

test('Pronúncia tem sílabas inteiras, com acentos só na fala e vogais abertas no contexto', () => {
  const expectedSpeech = {
    BANANA: ['bá', 'ná', 'ná'], VACA: ['vá', 'cá'], COCO: ['cô', 'cô'],
    BOLA: ['bó', 'lá'], BOCA: ['bô', 'cá'], CEBOLA: ['cê', 'bó', 'lá'],
    BONECA: ['bô', 'né', 'cá'], FOGO: ['fô', 'gô'], FOCA: ['fó', 'cá'],
    PIPA: ['pí', 'pá'], SUCO: ['sú', 'cô'], GIRAFA: ['gí', 'rá', 'fá'],
    REDE: ['ré', 'dê'], PENA: ['pê', 'ná'],
  };
  for (const [name, syllables] of Object.entries(expectedSpeech)) {
    assert.deepEqual(words.find((word) => word.word === name).spokenSyllables, syllables);
  }
  for (const word of words) {
    assert.equal(word.spokenSyllables.length, word.syllables.length);
    word.spokenSyllables.forEach((spoken, stage) => {
      assert.match(spoken, /^[bcdfgjlmnprstv][áéêíóôú]$/);
      assert.equal(spoken.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase(), word.syllables[stage]);
    });
    assert.equal(word.word, word.syllables.join(''), 'A grafia da palavra não recebe os acentos da fala');
  }
});

test('A rodada sorteia palavras novas primeiro e só marca as que aparecem', () => {
  const random = () => 0.5;
  for (const level of levels) {
    const pool = words.filter((word) => word.levels.includes(level.id));
    const presented = new Set();
    const shown = [];
    while (shown.length < pool.length) {
      const round = planRound(pool, presented, 5, random);
      for (const word of round) {
        if (shown.length >= pool.length) break;
        assert.ok(!shown.includes(word.id));
        noteShown(presented, pool.length, word.id);
        shown.push(word.id);
      }
    }
    assert.equal(new Set(shown).size, pool.length);
  }
  const pool = words.filter((word) => word.levels.includes(2));
  const presented = new Set();
  const round = planRound(pool, presented, 5, random);
  noteShown(presented, pool.length, round[0].id);
  noteShown(presented, pool.length, round[1].id);
  assert.deepEqual([...presented], [round[0].id, round[1].id]);
  const next = planRound(pool, presented, 5, random);
  assert.ok(next.slice(0, 5).every((word) => !presented.has(word.id)));
  const mostlySeen = new Set(pool.slice(0, pool.length - 3).map((word) => word.id));
  const mixed = planRound(pool, mostlySeen, 5, random);
  const unseenIds = new Set(pool.filter((word) => !mostlySeen.has(word.id)).map((word) => word.id));
  assert.equal(mixed.slice(0, 3).filter((word) => unseenIds.has(word.id)).length, 3);
  assert.ok(mixed.slice(3).every((word) => mostlySeen.has(word.id)));
});

test('Validação rejeita alternativas repetidas, letras isoladas, divisões e pronúncias erradas', () => {
  for (const mutate of [
    (bank) => { bank[0].spokenSyllables = ['b', 'o']; },
    (bank) => { bank[0].spokenSyllables = ['ba', 'la']; },
    (bank) => { bank[0].spokenSyllables = ['bó']; },
    (bank) => { bank[0].spokenSyllables = ['bó', 'má']; },
    (bank) => { bank[0].alternatives[0] = ['BO', 'BO', 'BE', 'BI']; },
    (bank) => { bank[0].alternatives[0] = ['BA', 'BU', 'BE', 'BI']; },
    (bank) => { bank[0].alternatives[0] = ['BO', 'B', 'BE', 'BI']; },
    (bank) => { bank[0].syllables = ['BO', 'LO']; },
    (bank) => { bank[1].id = bank[0].id; },
    (bank) => { bank.find((word) => word.id === 'banana').levels = [1]; },
    (bank) => { bank.find((word) => word.id === 'banana').alternatives.pop(); },
    (bank) => { bank[0].levels = [99]; },
  ]) {
    const bank = JSON.parse(JSON.stringify(words));
    mutate(bank);
    assert.throws(() => validateWords(bank));
  }
});
