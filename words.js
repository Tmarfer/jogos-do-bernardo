// Add words here. Each stage has complete syllables and exactly one correct answer.
(function (root) {
  'use strict';
  const words = [
    { id: 'bola', word: 'BOLA', syllables: ['BO', 'LA'], image: 'assets/bola.svg', description: 'Bola colorida', alternatives: [['BA', 'BO', 'BE', 'BI'], ['LI', 'LU', 'LA', 'LE']] },
    { id: 'casa', word: 'CASA', syllables: ['CA', 'SA'], image: 'assets/casa.svg', description: 'Casa com telhado vermelho', alternatives: [['CA', 'CO', 'CU', 'CE'], ['SA', 'SE', 'SI', 'SO']] },
    { id: 'pato', word: 'PATO', syllables: ['PA', 'TO'], image: 'assets/pato.svg', description: 'Pato amarelo', alternatives: [['PA', 'PE', 'PI', 'PO'], ['TA', 'TE', 'TI', 'TO']] },
    { id: 'gato', word: 'GATO', syllables: ['GA', 'TO'], image: 'assets/gato.svg', description: 'Gato laranja', alternatives: [['GA', 'GO', 'GU', 'GE'], ['TA', 'TE', 'TI', 'TO']] },
    { id: 'sapo', word: 'SAPO', syllables: ['SA', 'PO'], image: 'assets/sapo.svg', description: 'Sapo verde', alternatives: [['SA', 'SE', 'SI', 'SO'], ['PA', 'PE', 'PI', 'PO']] },
    { id: 'vaca', word: 'VACA', syllables: ['VA', 'CA'], image: 'assets/vaca.svg', description: 'Vaca branca com manchas', alternatives: [['VA', 'VE', 'VI', 'VO'], ['CA', 'CO', 'CU', 'CE']] },
    { id: 'faca', word: 'FACA', syllables: ['FA', 'CA'], image: 'assets/faca.svg', description: 'Faca de mesa com ponta arredondada', alternatives: [['FA', 'FE', 'FI', 'FO'], ['CA', 'CO', 'CU', 'CE']] },
    { id: 'mala', word: 'MALA', syllables: ['MA', 'LA'], image: 'assets/mala.svg', description: 'Mala de viagem com alça', alternatives: [['MA', 'ME', 'MI', 'MO'], ['LA', 'LE', 'LI', 'LU']] },
    { id: 'mapa', word: 'MAPA', syllables: ['MA', 'PA'], image: 'assets/mapa.svg', description: 'Mapa aberto com caminhos e uma marca de destino', alternatives: [['MA', 'ME', 'MI', 'MO'], ['PA', 'PE', 'PI', 'PO']] },
    { id: 'lata', word: 'LATA', syllables: ['LA', 'TA'], image: 'assets/lata.svg', description: 'Lata de metal', alternatives: [['LA', 'LE', 'LI', 'LU'], ['TA', 'TE', 'TI', 'TO']] },
    { id: 'dado', word: 'DADO', syllables: ['DA', 'DO'], image: 'assets/dado.svg', description: 'Dado com bolinhas', alternatives: [['DA', 'DE', 'DI', 'DO'], ['DA', 'DE', 'DI', 'DO']] },
    { id: 'dedo', word: 'DEDO', syllables: ['DE', 'DO'], image: 'assets/dedo.svg', description: 'Mão apontando com um dedo', alternatives: [['DA', 'DE', 'DI', 'DO'], ['DA', 'DE', 'DI', 'DO']] },
    { id: 'pipa', word: 'PIPA', syllables: ['PI', 'PA'], image: 'assets/pipa.svg', description: 'Pipa colorida com rabiola', alternatives: [['PA', 'PE', 'PI', 'PO'], ['PA', 'PE', 'PI', 'PO']] },
    { id: 'moto', word: 'MOTO', syllables: ['MO', 'TO'], image: 'assets/moto.svg', description: 'Moto com duas rodas', alternatives: [['MA', 'ME', 'MI', 'MO'], ['TA', 'TE', 'TI', 'TO']] },
    { id: 'bota', word: 'BOTA', syllables: ['BO', 'TA'], image: 'assets/bota.svg', description: 'Bota de chuva', alternatives: [['BA', 'BE', 'BI', 'BO'], ['TA', 'TE', 'TI', 'TO']] },
    { id: 'boca', word: 'BOCA', syllables: ['BO', 'CA'], image: 'assets/boca.svg', description: 'Boca sorrindo', alternatives: [['BA', 'BE', 'BI', 'BO'], ['CA', 'CO', 'CU', 'CE']] },
    { id: 'cama', word: 'CAMA', syllables: ['CA', 'MA'], image: 'assets/cama.svg', description: 'Cama com travesseiro e cobertor', alternatives: [['CA', 'CO', 'CU', 'CE'], ['MA', 'ME', 'MI', 'MO']] },
    { id: 'coco', word: 'COCO', syllables: ['CO', 'CO'], image: 'assets/coco.svg', description: 'Coco marrom inteiro e aberto', alternatives: [['CA', 'CO', 'CU', 'CE'], ['CA', 'CO', 'CU', 'CE']] },
    { id: 'suco', word: 'SUCO', syllables: ['SU', 'CO'], image: 'assets/suco.svg', description: 'Copo de suco com uma laranja', alternatives: [['SA', 'SE', 'SO', 'SU'], ['CA', 'CO', 'CU', 'CE']] },
    { id: 'rato', word: 'RATO', syllables: ['RA', 'TO'], image: 'assets/rato.svg', description: 'Rato cinza com orelhas redondas', alternatives: [['RA', 'RE', 'RI', 'RO'], ['TA', 'TE', 'TI', 'TO']] },
  ];

  const levels = [
    { id: 0, title: 'Junte as sílabas', buttonId: 'level-zero', syllableCount: 2, choiceCount: 2 },
    { id: 1, title: 'Escolha as sílabas', buttonId: 'level-one', syllableCount: 2, choiceCount: 4 },
    { id: 2, title: 'Palavras maiores', buttonId: 'level-two', syllableCount: 3, choiceCount: 6 },
  ];
  words.forEach((word) => { word.levels = [0, 1]; });

  function alternativesFor(syllable, count) {
    const family = ['A', 'E', 'I', 'O', 'U'].map((vowel) => syllable[0] + vowel);
    if (count === 4) return [syllable, ...family.filter((option) => option !== syllable)].slice(0, 4);
    const neighbor = { B: 'P', C: 'G', D: 'T', F: 'V', G: 'C', J: 'G', L: 'R', M: 'N', N: 'M', P: 'B', R: 'L', S: 'T', T: 'D', V: 'F' };
    return [...family, neighbor[syllable[0]] + syllable[1]];
  }

  const newWords = [
    ['foca', 'FOCA', ['FO', 'CA'], 'Foca cinza com nadadeiras', [1]],
    ['lobo', 'LOBO', ['LO', 'BO'], 'Lobo cinza amigável', [1]],
    ['luva', 'LUVA', ['LU', 'VA'], 'Luva de lã', [1]],
    ['pena', 'PENA', ['PE', 'NA'], 'Pena colorida', [1]],
    ['sino', 'SINO', ['SI', 'NO'], 'Sino dourado', [1]],
    ['nave', 'NAVE', ['NA', 'VE'], 'Nave espacial com uma janela', [1]],
    ['rede', 'REDE', ['RE', 'DE'], 'Rede de descanso', [1]],
    ['rosa', 'ROSA', ['RO', 'SA'], 'Rosa com caule e folhas', [1]],
    ['roda', 'RODA', ['RO', 'DA'], 'Roda com raios', [1]],
    ['fogo', 'FOGO', ['FO', 'GO'], 'Chama de fogo ilustrada', [1]],
    ['banana', 'BANANA', ['BA', 'NA', 'NA'], 'Banana amarela descascada', [2]],
    ['batata', 'BATATA', ['BA', 'TA', 'TA'], 'Batatas marrons', [2]],
    ['tomate', 'TOMATE', ['TO', 'MA', 'TE'], 'Tomate vermelho', [2]],
    ['panela', 'PANELA', ['PA', 'NE', 'LA'], 'Panela com tampa e duas alças', [2]],
    ['caneta', 'CANETA', ['CA', 'NE', 'TA'], 'Caneta com tampa', [2]],
    ['cavalo', 'CAVALO', ['CA', 'VA', 'LO'], 'Cavalo marrom com crina', [2]],
    ['boneca', 'BONECA', ['BO', 'NE', 'CA'], 'Boneca de pano com vestido', [2]],
    ['janela', 'JANELA', ['JA', 'NE', 'LA'], 'Janela com cortinas', [2]],
    ['sapato', 'SAPATO', ['SA', 'PA', 'TO'], 'Sapato com cadarço', [2]],
    ['macaco', 'MACACO', ['MA', 'CA', 'CO'], 'Macaco marrom com orelhas redondas', [2]],
    ['pipoca', 'PIPOCA', ['PI', 'PO', 'CA'], 'Pipocas em um potinho listrado', [2]],
    ['peteca', 'PETECA', ['PE', 'TE', 'CA'], 'Peteca com penas coloridas', [2]],
    ['cebola', 'CEBOLA', ['CE', 'BO', 'LA'], 'Cebola com casca e raízes', [2]],
    ['girafa', 'GIRAFA', ['GI', 'RA', 'FA'], 'Girafa amarela com pescoço comprido', [2]],
    ['camisa', 'CAMISA', ['CA', 'MI', 'SA'], 'Camisa com gola e botões', [2]],
  ];
  newWords.forEach(([id, word, syllables, description, membership]) => {
    words.push({ id, word, syllables, image: `assets/${id}.svg`, description, levels: membership, alternatives: syllables.map((syllable) => alternativesFor(syllable, membership.includes(2) ? 6 : 4)) });
  });

  // Speech-only spelling: accents make short syllables pronounceable rather than acronyms.
  // Written words/choices stay unchanged. Override open E/O sounds in their word context.
  const speechVowels = { A: 'á', E: 'ê', I: 'í', O: 'ô', U: 'ú' };
  const openVowels = {
    bola: { 0: 'bó' }, moto: { 0: 'mó' }, bota: { 0: 'bó' }, foca: { 0: 'fó' },
    rosa: { 0: 'ró' }, roda: { 0: 'ró' }, rede: { 0: 'ré' }, panela: { 1: 'né' }, caneta: { 1: 'né' },
    boneca: { 1: 'né' }, janela: { 1: 'né' }, pipoca: { 1: 'pó' },
    peteca: { 1: 'té' }, cebola: { 1: 'bó' },
  };
  words.forEach((word) => {
    word.spokenSyllables = word.syllables.map((syllable, stage) =>
      openVowels[word.id]?.[stage] || syllable[0].toLowerCase() + speechVowels[syllable[1]]);
  });

  function validateWords(bank) {
    const ids = new Set();
    const names = new Set();
    for (const item of bank) {
      if (!/^[a-z]+$/.test(item.id) || ids.has(item.id) || names.has(item.word)) throw new Error('Identificador ou palavra repetida no banco.');
      if (!Array.isArray(item.levels) || !item.levels.length || new Set(item.levels).size !== item.levels.length || item.levels.some((id) => !levels.some((level) => level.id === id))) throw new Error(`Níveis inválidos: ${item.id}`);
      if (!/^[A-Z]+$/.test(item.word) || item.levels.some((id) => item.syllables.length !== levels[id].syllableCount) || item.syllables.join('') !== item.word) throw new Error(`Divisão inválida: ${item.id}`);
      if (item.image !== `assets/${item.id}.svg` || !item.description || item.alternatives.length !== item.syllables.length) throw new Error(`Figura ou etapas inválidas: ${item.id}`);
      if (!Array.isArray(item.spokenSyllables) || item.spokenSyllables.length !== item.syllables.length || item.spokenSyllables.some((spoken, stage) =>
        typeof spoken !== 'string' || !/^[bcdfgjlmnprstv][áéêíóôú]$/.test(spoken) || spoken.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase() !== item.syllables[stage])) throw new Error(`Pronúncia inválida: ${item.id}`);
      item.alternatives.forEach((options, stage) => {
        const correct = item.syllables[stage];
        const count = item.levels.includes(2) ? 6 : 4;
        if (!/^[BCDFGJLMNPRSTV][AEIOU]$/.test(correct) || options.length !== count || new Set(options).size !== count || options.filter((option) => option === correct).length !== 1 || options.some((option) => !/^[BCDFGJLMNPRSTV][AEIOU]$/.test(option)) || (count === 4 && options.some((option) => option[0] !== correct[0])) || (count === 6 && options.filter((option) => option[0] === correct[0]).length !== 5)) throw new Error(`Alternativas inválidas: ${item.id}, etapa ${stage + 1}`);
      });
      ids.add(item.id);
      names.add(item.word);
    }
    if (levels.some((level) => bank.filter((word) => word.levels.includes(level.id)).length < 5)) throw new Error('Cada nível precisa de pelo menos cinco palavras.');
    return true;
  }

  validateWords(words);
  const data = { words, levels, validateWords, levelZeroIds: words.filter((word) => word.levels.includes(0)).map((word) => word.id) };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else root.SilabasData = data;
})(typeof window !== 'undefined' ? window : globalThis);
