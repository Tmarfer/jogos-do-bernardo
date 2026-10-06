// Add words here. Each stage has four complete syllables, including one correct answer.
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

  function validateWords(bank) {
    const ids = new Set();
    const names = new Set();
    for (const item of bank) {
      if (!/^[a-z]+$/.test(item.id) || ids.has(item.id) || names.has(item.word)) throw new Error('Identificador ou palavra repetida no banco.');
      if (!/^[A-Z]+$/.test(item.word) || item.syllables.length !== 2 || item.syllables.join('') !== item.word) throw new Error(`Divisão inválida: ${item.id}`);
      if (item.image !== `assets/${item.id}.svg` || !item.description || item.alternatives.length !== 2) throw new Error(`Figura ou etapas inválidas: ${item.id}`);
      item.alternatives.forEach((options, stage) => {
        const correct = item.syllables[stage];
        if (!/^[BCDFGLMPRSTV][AEIOU]$/.test(correct) || options.length !== 4 || new Set(options).size !== 4 || options.filter((option) => option === correct).length !== 1 || options.some((option) => !/^[BCDFGLMPRSTV][AEIOU]$/.test(option) || option[0] !== correct[0])) throw new Error(`Alternativas inválidas: ${item.id}, etapa ${stage + 1}`);
      });
      ids.add(item.id);
      names.add(item.word);
    }
    if (bank.length < 5) throw new Error('Uma rodada precisa de pelo menos cinco palavras.');
    return true;
  }

  validateWords(words);
  const data = { words, validateWords, levelZeroIds: ['bola', 'casa', 'gato', 'pato', 'sapo'] };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else root.SilabasData = data;
})(typeof window !== 'undefined' ? window : globalThis);
