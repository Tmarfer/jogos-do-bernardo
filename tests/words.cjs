const { test } = require('node:test');
const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const { words, validateWords, levelZeroIds } = require('../words.js');

const expected = {
  BOLA: ['BO', 'LA'], CASA: ['CA', 'SA'], PATO: ['PA', 'TO'], GATO: ['GA', 'TO'], SAPO: ['SA', 'PO'],
  VACA: ['VA', 'CA'], FACA: ['FA', 'CA'], MALA: ['MA', 'LA'], MAPA: ['MA', 'PA'], LATA: ['LA', 'TA'],
  DADO: ['DA', 'DO'], DEDO: ['DE', 'DO'], PIPA: ['PI', 'PA'], MOTO: ['MO', 'TO'], BOTA: ['BO', 'TA'],
  BOCA: ['BO', 'CA'], CAMA: ['CA', 'MA'], COCO: ['CO', 'CO'], SUCO: ['SU', 'CO'], RATO: ['RA', 'TO'],
};

test('Banco contém as 20 divisões solicitadas e 20 ilustrações locais sem texto', () => {
  assert.equal(words.length, 20);
  assert.deepEqual(Object.fromEntries(words.map(({ word, syllables }) => [word, syllables])), expected);
  assert.equal(new Set(words.map(({ id }) => id)).size, 20);
  assert.deepEqual(levelZeroIds, ['bola', 'casa', 'gato', 'pato', 'sapo']);
  for (const word of words) {
    const path = join(__dirname, '..', word.image);
    assert.ok(existsSync(path), word.image);
    const svg = readFileSync(path, 'utf8');
    assert.match(svg, /<svg\b/);
    assert.doesNotMatch(svg, /<text\b|<image\b|<script\b|href=|url\(https?:/i);
  }
});

test('Todas as 40 etapas têm quatro alternativas distintas e uma única resposta', () => {
  assert.equal(validateWords(words), true);
  for (const word of words) word.alternatives.forEach((choices, stage) => {
    assert.equal(choices.length, 4);
    assert.equal(new Set(choices).size, 4);
    assert.equal(choices.filter((choice) => choice === expected[word.word][stage]).length, 1);
    assert.ok(choices.every((choice) => /^[A-Z][AEIOU]$/.test(choice) && choice[0] === expected[word.word][stage][0]));
  });
});

test('Validação rejeita alternativas repetidas, letras isoladas e divisões erradas', () => {
  for (const mutate of [
    (bank) => { bank[0].alternatives[0] = ['BO', 'BO', 'BE', 'BI']; },
    (bank) => { bank[0].alternatives[0] = ['BA', 'BU', 'BE', 'BI']; },
    (bank) => { bank[0].alternatives[0] = ['BO', 'B', 'BE', 'BI']; },
    (bank) => { bank[0].syllables = ['BO', 'LO']; },
    (bank) => { bank[1].id = bank[0].id; },
  ]) {
    const bank = JSON.parse(JSON.stringify(words));
    mutate(bank);
    assert.throws(() => validateWords(bank));
  }
});
