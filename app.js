(() => {
  'use strict';

  const words = [
    { word: 'BOLA', syllables: ['BO', 'LA'], image: 'bola', description: 'Bola colorida' },
    { word: 'CASA', syllables: ['CA', 'SA'], image: 'casa', description: 'Casa com telhado vermelho' },
    { word: 'GATO', syllables: ['GA', 'TO'], image: 'gato', description: 'Gato laranja' },
    { word: 'PATO', syllables: ['PA', 'TO'], image: 'pato', description: 'Pato amarelo' },
    { word: 'SAPO', syllables: ['SA', 'PO'], image: 'sapo', description: 'Sapo verde' },
  ];
  const byId = (id) => document.getElementById(id);
  const ui = {
    picture: byId('picture'), model: byId('word-model'), choices: byId('choices'),
    answer: byId('answer'), feedback: byId('feedback'), celebration: byId('celebration'),
    round: byId('round'), finish: byId('finish'), next: byId('next-button'),
    restart: byId('restart-button'), progress: byId('progress-label'), dots: byId('progress-dots'),
    sound: byId('sound-toggle'), motion: byId('motion-toggle'), instruction: byId('instruction'),
  };
  let index = 0;
  let selected = 0;
  let audioContext;
  let preferences = { sound: false, motion: !window.matchMedia('(prefers-reduced-motion: reduce)').matches };

  // Only these two preferences are stored. Storage may be unavailable in a private browser.
  try {
    const saved = JSON.parse(localStorage.getItem('silabas-do-be-preferences'));
    if (saved && typeof saved.sound === 'boolean') preferences.sound = saved.sound;
    if (saved && typeof saved.motion === 'boolean') preferences.motion = saved.motion;
  } catch { /* The game also works without local storage. */ }

  function applyPreferences() {
    ui.sound.checked = preferences.sound;
    ui.motion.checked = preferences.motion;
    document.documentElement.dataset.motion = preferences.motion ? 'on' : 'off';
  }

  function savePreferences() {
    applyPreferences();
    try { localStorage.setItem('silabas-do-be-preferences', JSON.stringify(preferences)); }
    catch { /* Preferences still apply for this session. */ }
  }

  // A short, quiet melody generated locally, only after a touch. No recordings or voices.
  async function playSuccess() {
    if (!preferences.sound) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    try {
      audioContext ||= new AudioContextClass();
      if (audioContext.state === 'suspended') await audioContext.resume();
      if (!preferences.sound || audioContext.state !== 'running') return;
      [523.25, 659.25, 783.99].forEach((frequency, position) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const start = audioContext.currentTime + position * 0.13;
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.045, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.2);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      });
    } catch { /* Audio is optional: a blocked sound must never interrupt play. */ }
  }

  function feedback(message, kind = '') {
    ui.feedback.textContent = message;
    ui.feedback.className = `feedback ${kind}`.trim();
  }

  function renderProgress(finished = false) {
    ui.progress.textContent = finished ? '5 PALAVRAS MONTADAS' : `PALAVRA ${index + 1} DE ${words.length}`;
    ui.dots.replaceChildren();
    words.forEach((_, position) => {
      const dot = document.createElement('span');
      dot.className = `progress-dot${finished || position < index ? ' done' : position === index ? ' current' : ''}`;
      ui.dots.append(dot);
    });
  }

  function renderRound(moveFocus = false) {
    selected = 0;
    const current = words[index];
    ui.round.hidden = false;
    ui.finish.hidden = true;
    ui.celebration.hidden = true;
    ui.choices.hidden = false;
    ui.instruction.textContent = 'Toque nas sílabas em ordem.';
    ui.picture.src = `assets/${current.image}.svg`;
    ui.picture.alt = current.description;
    ui.model.replaceChildren();
    current.syllables.forEach((syllable, position) => {
      if (position) {
        const separator = document.createElement('span');
        separator.className = 'model-separator';
        separator.textContent = '·';
        separator.setAttribute('aria-hidden', 'true');
        ui.model.append(separator);
      }
      const part = document.createElement('span');
      part.textContent = syllable;
      ui.model.append(part);
    });
    ui.model.setAttribute('aria-label', `${current.word}: ${current.syllables.join(' mais ')}`);
    Array.from(ui.answer.children).forEach((slot, position) => {
      slot.textContent = '?';
      slot.className = 'answer-slot';
      slot.setAttribute('aria-label', `${position ? 'Segunda' : 'Primeira'} sílaba, vazia`);
    });
    const shuffled = [...current.syllables];
    // The opening word is shuffled to demonstrate the game; subsequent rounds vary.
    if (index === 0 || Math.random() < 0.5) shuffled.reverse();
    ui.choices.replaceChildren();
    shuffled.forEach((syllable) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'syllable-button';
      button.textContent = syllable;
      button.setAttribute('aria-label', `Sílaba ${syllable}`);
      button.addEventListener('click', () => choose(syllable, button));
      ui.choices.append(button);
    });
    ui.next.textContent = index === words.length - 1 ? 'Ver minhas palavras →' : 'Próxima palavra →';
    renderProgress();
    feedback(`Vamos montar ${current.word}?`);
    if (moveFocus) ui.choices.querySelector('button').focus({ preventScroll: true });
  }

  function choose(syllable, button) {
    if (selected >= 2 || button.disabled) return;
    const current = words[index];
    if (syllable !== current.syllables[selected]) {
      feedback(selected === 0 ? `Vamos juntos! Comece com ${current.syllables[0]}.` : `Quase lá! Agora toque em ${current.syllables[1]}.`, 'hint');
      return;
    }
    const slot = ui.answer.children[selected];
    slot.textContent = syllable;
    slot.classList.add('filled');
    slot.setAttribute('aria-label', `${selected ? 'Segunda' : 'Primeira'} sílaba: ${syllable}`);
    button.disabled = true;
    selected += 1;
    if (selected < 2) {
      feedback(`Isso! Agora toque em ${current.syllables[1]}.`);
      ui.choices.querySelector('button:not(:disabled)').focus({ preventScroll: true });
      return;
    }
    ui.choices.hidden = true;
    ui.celebration.hidden = false;
    ui.instruction.textContent = 'Você juntou as sílabas!';
    feedback(`Viva! Você montou ${current.word}!`, 'success');
    void playSuccess();
    ui.next.focus({ preventScroll: true });
  }

  function finish() {
    ui.round.hidden = true;
    ui.finish.hidden = false;
    renderProgress(true);
    const collection = byId('finished-words');
    collection.replaceChildren();
    words.forEach(({ word }) => {
      const label = document.createElement('span');
      label.textContent = word;
      collection.append(label);
    });
    feedback('Que alegria aprender com você!', 'success');
    ui.restart.focus({ preventScroll: true });
  }

  ui.next.addEventListener('click', () => {
    if (selected !== 2) return;
    if (index === words.length - 1) finish();
    else { index += 1; renderRound(true); }
  });
  ui.restart.addEventListener('click', () => { index = 0; renderRound(true); });
  ui.sound.addEventListener('change', () => {
    preferences.sound = ui.sound.checked;
    if (!preferences.sound && audioContext) void audioContext.suspend().catch(() => {});
    savePreferences();
  });
  ui.motion.addEventListener('change', () => { preferences.motion = ui.motion.checked; savePreferences(); });
  applyPreferences();
  renderRound();
})();
