(() => {
  'use strict';

  const { words, levels } = window.SilabasData;
  const ordinals = ['Primeira', 'Segunda', 'Terceira'];
  const byId = (id) => document.getElementById(id);
  const ui = {
    picture: byId('picture'), model: byId('word-model'), choices: byId('choices'),
    answer: byId('answer'), feedback: byId('feedback'), celebration: byId('celebration'),
    round: byId('round'), finish: byId('finish'), next: byId('next-button'),
    restart: byId('restart-button'), progress: byId('progress-label'), dots: byId('progress-dots'),
    sound: byId('sound-toggle'), motion: byId('motion-toggle'), instruction: byId('instruction'),
    home: byId('home'), game: byId('game'), title: byId('page-title'), level: byId('level-label'),
    completed: byId('completed-word'), voiceControls: byId('voice-controls'), voiceNote: byId('voice-note'),
    listen: byId('listen-button'), help: byId('help-button'),
  };
  let level = 0;
  let roundWords = [];
  let index = 0;
  let selected = 0;
  let roundVersion = 0;
  let speechVersion = 0;
  let speechFailed = false;
  let activeUtterance;
  let replaySyllables = false;
  const presented = levels.map(() => new Set());
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

  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function wordPool() {
    return words.filter((word) => word.levels.includes(level));
  }

  function startSession(chosenLevel) {
    cancelSpeech();
    level = chosenLevel;
    const pool = wordPool();
    // Reserve a round, but mark words as presented only when actually shown.
    roundWords = [
      ...shuffle(pool.filter((word) => !presented[level].has(word.id))),
      ...shuffle(pool.filter((word) => presented[level].has(word.id))),
    ].slice(0, 5);
    index = 0;
    ui.home.hidden = true;
    ui.game.hidden = false;
    ui.game.dataset.level = String(level);
    ui.game.classList.toggle('selection-level', level > 0);
    ui.title.textContent = levels[level].title;
    ui.level.textContent = `NÍVEL ${level}`;
    document.querySelector('.settings').open = false;
    renderRound(true);
  }

  function showHome() {
    cancelSpeech();
    roundVersion += 1;
    ui.home.hidden = false;
    ui.game.hidden = true;
    ui.title.textContent = 'Vamos brincar?';
    document.querySelector('.settings').open = false;
    byId(levels[level].buttonId).focus({ preventScroll: true });
  }

  function cancelSpeech() {
    speechVersion += 1;
    activeUtterance = undefined;
    try { window.speechSynthesis?.cancel(); } catch { /* Voice is optional. */ }
  }

  function localPortugueseVoice() {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return undefined;
    try {
      const local = window.speechSynthesis.getVoices().filter((voice) => voice.localService === true && /^pt(?:[-_]|$)/i.test(voice.lang));
      return local.find((voice) => /^pt[-_]BR$/i.test(voice.lang)) || local[0];
    } catch { return undefined; }
  }

  function updateVoiceNote() {
    if (level === 0 || ui.game.hidden) return;
    if (!preferences.sound) ui.voiceNote.textContent = 'Som desligado. Um adulto pode dizer o nome da figura.';
    else if (!localPortugueseVoice() || speechFailed) ui.voiceNote.textContent = 'Sem voz disponível. Um adulto pode dizer o nome da figura.';
    else ui.voiceNote.textContent = replaySyllables ? 'Toque de novo para ouvir as sílabas separadas.' : 'Toque em Ouvir de novo para ouvir a palavra inteira.';
  }

  function speak(text, articulateSyllables = false) {
    cancelSpeech();
    speechFailed = false;
    const voice = localPortugueseVoice();
    if (!preferences.sound || !voice) { updateVoiceNote(); return false; }
    const version = speechVersion;
    try {
      // Accented syllables in one phrase avoid abbreviation/letter-name heuristics.
      // Commas provide pauses without sending a series of isolated two-letter utterances.
      const utterance = new window.SpeechSynthesisUtterance(`${text.toLowerCase()}${articulateSyllables ? '.' : ''}`);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = articulateSyllables ? 0.72 : 0.82;
      utterance.pitch = 1;
      utterance.volume = 0.65;
      utterance.onerror = (event) => {
        if (version !== speechVersion || event.error === 'canceled' || event.error === 'interrupted') return;
        cancelSpeech();
        speechFailed = true;
        updateVoiceNote();
      };
      utterance.onend = () => { if (version === speechVersion) activeUtterance = undefined; };
      activeUtterance = utterance; // Retain the utterance while Safari is speaking.
      // One synchronous call during the touch, without timers or callback-triggered speech.
      window.speechSynthesis.speak(utterance);
      updateVoiceNote();
      return true;
    } catch { cancelSpeech(); speechFailed = true; updateVoiceNote(); return false; }
  }

  function giveHelp() {
    if (level === 0 || selected >= roundWords[index].syllables.length || ui.game.hidden || ui.round.hidden) return;
    const correct = roundWords[index].syllables[selected];
    const button = Array.from(ui.choices.children).find((choice) => choice.textContent === correct);
    button.classList.add('help-highlight');
    button.setAttribute('aria-label', `Sílaba ${correct}, ajuda`);
    feedback('Toque na sílaba destacada. Vamos juntos!', 'hint');
    speak(roundWords[index].spokenSyllables[selected], true);
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
    ui.progress.textContent = finished ? '5 PALAVRAS MONTADAS' : `PALAVRA ${index + 1} DE 5`;
    ui.dots.replaceChildren();
    roundWords.forEach((_, position) => {
      const dot = document.createElement('span');
      dot.className = `progress-dot${finished || position < index ? ' done' : position === index ? ' current' : ''}`;
      ui.dots.append(dot);
    });
  }

  function renderModel(current) {
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
  }

  function renderChoices(moveFocus) {
    const current = roundWords[index];
    const stage = selected;
    const version = roundVersion;
    const options = level === 0 ? current.syllables : current.alternatives[stage];
    const shuffled = shuffle(options);
    ui.choices.replaceChildren();
    shuffled.forEach((syllable) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'syllable-button';
      button.textContent = syllable;
      button.setAttribute('aria-label', `Sílaba ${syllable}`);
      button.addEventListener('click', () => choose(syllable, button, stage, version));
      ui.choices.append(button);
    });
    if (moveFocus) ui.choices.querySelector('button').focus({ preventScroll: true });
  }

  function renderRound(moveFocus = false) {
    cancelSpeech();
    roundVersion += 1;
    selected = 0;
    speechFailed = false;
    replaySyllables = false;
    const current = roundWords[index];
    presented[level].add(current.id);
    if (presented[level].size === wordPool().length) presented[level].clear();
    ui.round.hidden = false;
    ui.finish.hidden = true;
    ui.celebration.hidden = true;
    ui.choices.hidden = false;
    ui.completed.hidden = true;
    ui.completed.textContent = '';
    ui.voiceControls.hidden = level === 0;
    ui.voiceNote.hidden = level === 0;
    ui.help.disabled = false;
    ui.instruction.textContent = level === 0 ? 'Toque nas sílabas em ordem.' : 'Escolha a primeira sílaba.';
    ui.picture.src = current.image;
    ui.picture.alt = level === 0 ? current.description : 'Figura da palavra desta rodada';
    ui.model.hidden = level > 0;
    ui.model.replaceChildren();
    ui.model.removeAttribute('aria-label');
    if (level === 0) renderModel(current);
    ui.answer.replaceChildren();
    current.syllables.forEach((_, position) => {
      const slot = document.createElement('span');
      slot.textContent = '?';
      slot.className = 'answer-slot';
      slot.setAttribute('aria-label', `${ordinals[position]} sílaba, vazia`);
      ui.answer.append(slot);
    });
    renderChoices(moveFocus);
    ui.next.textContent = index === 4 ? 'Ver minhas palavras →' : 'Próxima palavra →';
    renderProgress();
    feedback(level === 0 ? `Vamos montar ${current.word}?` : 'Olhe a figura. Vamos juntos!');
    if (level > 0) speak(current.word);
  }

  function choose(syllable, button, stage, version) {
    const current = roundWords[index];
    if (selected >= current.syllables.length || button.disabled || ui.game.hidden || ui.round.hidden || version !== roundVersion || (level > 0 && stage !== selected)) return;
    if (syllable !== current.syllables[selected]) {
      feedback(level > 0 ? 'Vamos tentar outra?' : selected === 0 ? `Vamos juntos! Comece com ${current.syllables[0]}.` : `Quase lá! Agora toque em ${current.syllables[1]}.`, 'hint');
      return;
    }
    const slot = ui.answer.children[selected];
    slot.textContent = syllable;
    slot.classList.add('filled');
    slot.setAttribute('aria-label', `${ordinals[selected]} sílaba: ${syllable}`);
    button.disabled = true;
    selected += 1;
    if (selected < current.syllables.length) {
      if (level > 0) {
        cancelSpeech();
        ui.instruction.textContent = `Agora escolha a ${ordinals[selected].toLowerCase()} sílaba.`;
        feedback(selected === current.syllables.length - 1 ? 'Isso! Falta só mais uma sílaba.' : 'Isso! Continue assim.');
        renderChoices(true);
      } else {
        feedback(`Isso! Agora toque em ${current.syllables[1]}.`);
        ui.choices.querySelector('button:not(:disabled)').focus({ preventScroll: true });
      }
      return;
    }
    ui.choices.hidden = true;
    cancelSpeech();
    ui.voiceControls.hidden = true;
    ui.voiceNote.hidden = true;
    ui.help.disabled = true;
    ui.completed.textContent = current.word;
    ui.completed.hidden = false;
    renderModel(current);
    ui.model.hidden = false;
    ui.picture.alt = current.description;
    ui.celebration.hidden = false;
    ui.instruction.textContent = 'Você juntou as sílabas!';
    feedback(`Viva! Você montou ${current.word}!`, 'success');
    void playSuccess();
    ui.next.focus({ preventScroll: true });
  }

  function finish() {
    cancelSpeech();
    ui.round.hidden = true;
    ui.finish.hidden = false;
    renderProgress(true);
    const collection = byId('finished-words');
    collection.replaceChildren();
    roundWords.forEach(({ word }) => {
      const label = document.createElement('span');
      label.textContent = word;
      collection.append(label);
    });
    feedback('Que alegria aprender com você!', 'success');
    ui.restart.focus({ preventScroll: true });
  }

  ui.next.addEventListener('click', () => {
    if (!roundWords.length || selected !== roundWords[index].syllables.length) return;
    if (ui.game.hidden || ui.round.hidden) return;
    if (index === 4) finish();
    else { index += 1; renderRound(true); }
  });
  ui.restart.addEventListener('click', () => startSession(level));
  levels.forEach((config) => byId(config.buttonId).addEventListener('click', () => startSession(config.id)));
  byId('back-button').addEventListener('click', showHome);
  byId('finish-back-button').addEventListener('click', showHome);
  byId('home-link').addEventListener('click', (event) => { event.preventDefault(); showHome(); });
  ui.listen.addEventListener('click', () => {
    if (level === 0 || ui.game.hidden || ui.round.hidden) return;
    const current = roundWords[index];
    if (selected >= current.syllables.length) return;
    if (speak(replaySyllables ? current.spokenSyllables.join(', ') : current.word, replaySyllables)) {
      replaySyllables = !replaySyllables;
      updateVoiceNote();
    }
  });
  ui.help.addEventListener('click', giveHelp);
  ui.sound.addEventListener('change', () => {
    preferences.sound = ui.sound.checked;
    cancelSpeech();
    if (!preferences.sound && audioContext) void audioContext.suspend().catch(() => {});
    savePreferences();
    if (level > 0 && !ui.game.hidden && !ui.round.hidden && selected < roundWords[index].syllables.length) {
      if (preferences.sound) speak(roundWords[index].word);
      else updateVoiceNote();
    }
  });
  ui.motion.addEventListener('change', () => { preferences.motion = ui.motion.checked; savePreferences(); });
  applyPreferences();
  localPortugueseVoice(); // Let the browser load its installed voices before the first touch.
  try { window.speechSynthesis?.addEventListener('voiceschanged', updateVoiceNote); } catch { /* No speech support. */ }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelSpeech();
      if (audioContext) void audioContext.suspend().catch(() => {});
    }
  });
})();
