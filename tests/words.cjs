const { test } = require('node:test');
const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const { words, levels, validateWords, levelZeroIds } = require('../words.js');

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

test('Banco contém 45 divisões e figuras locais; os níveis têm 20, 30 e 15 palavras', () => {
  assert.equal(words.length, 45);
  assert.deepEqual(Object.fromEntries(words.map(({ word, syllables }) => [word, syllables])), expected);
  assert.equal(new Set(words.map(({ id }) => id)).size, 45);
  assert.equal(levelZeroIds.length, 20);
  assert.deepEqual(levels.map(({ id }) => words.filter((word) => word.levels.includes(id)).length), [20, 30, 15]);
  assert.ok(['bola', 'casa', 'gato', 'pato', 'sapo'].every((id) => levelZeroIds.includes(id)));
  for (const word of words) {
    const path = join(__dirname, '..', word.image);
    assert.ok(existsSync(path), word.image);
    const svg = readFileSync(path, 'utf8');
    assert.match(svg, /<svg\b/);
    assert.doesNotMatch(svg, /<text\b|<image\b|<script\b|href=|url\(https?:/i);
  }
});

test('105 etapas: quatro ou seis alternativas distintas e uma única resposta', () => {
  assert.equal(validateWords(words), true);
  assert.equal(words.reduce((total, word) => total + word.syllables.length, 0), 105);
  for (const word of words) word.alternatives.forEach((choices, stage) => {
    const count = word.syllables.length === 3 ? 6 : 4;
    assert.equal(choices.length, count);
    assert.equal(new Set(choices).size, count);
    assert.equal(choices.filter((choice) => choice === expected[word.word][stage]).length, 1);
    assert.ok(choices.every((choice) => /^[A-Z][AEIOU]$/.test(choice)));
    assert.equal(choices.filter((choice) => choice[0] === expected[word.word][stage][0]).length, count === 6 ? 5 : 4);
  });
});

test('Validação rejeita alternativas repetidas, letras isoladas e divisões erradas', () => {
  for (const mutate of [
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
