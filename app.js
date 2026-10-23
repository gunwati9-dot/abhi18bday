/**
 * ABHINAV RAIN // LEVEL 18 CYBERPUNK DHH EXPERIENCE
 * Core Application Engine
 */

// ==========================================================================
// 1. NEON PARTICLE BACKGROUND CANVAS
// ==========================================================================
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas ? bgCanvas.getContext('2d') : null;
let bgParticles = [];
const PARTICLE_COUNT = 55;
let mousePos = { x: -1000, y: -1000 };

function resizeBgCanvas() {
  if (!bgCanvas) return;
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeBgCanvas);
resizeBgCanvas();

class CyberParticle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * (bgCanvas ? bgCanvas.width : window.innerWidth);
    this.y = Math.random() * (bgCanvas ? bgCanvas.height : window.innerHeight);
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = (Math.random() - 0.5) * 0.6;
    this.size = Math.random() * 2.2 + 1;
    this.alpha = Math.random() * 0.6 + 0.2;
    this.color = Math.random() > 0.6 ? '#00f0ff' : (Math.random() > 0.3 ? '#b026ff' : '#ff0055');
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Mouse gentle push
    const dx = this.x - mousePos.x;
    const dy = this.y - mousePos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 120 && dist > 0) {
      const force = (120 - dist) / 120;
      this.x += (dx / dist) * force * 2.5;
      this.y += (dy / dist) * force * 2.5;
    }

    if (this.x < 0 || this.x > bgCanvas.width || this.y < 0 || this.y > bgCanvas.height) {
      this.reset();
    }
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function initBgParticles() {
  bgParticles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    bgParticles.push(new CyberParticle());
  }
}
initBgParticles();

function renderBgLoop() {
  if (!bgCtx || !bgCanvas) return;
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

  // Draw connecting cyber lines
  for (let i = 0; i < bgParticles.length; i++) {
    for (let j = i + 1; j < bgParticles.length; j++) {
      const p1 = bgParticles[i];
      const p2 = bgParticles[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 110) {
        bgCtx.save();
        bgCtx.globalAlpha = (1 - dist / 110) * 0.18;
        bgCtx.strokeStyle = p1.color;
        bgCtx.lineWidth = 0.8;
        bgCtx.beginPath();
        bgCtx.moveTo(p1.x, p1.y);
        bgCtx.lineTo(p2.x, p2.y);
        bgCtx.stroke();
        bgCtx.restore();
      }
    }
  }

  bgParticles.forEach(p => {
    p.update();
    p.draw(bgCtx);
  });

  requestAnimationFrame(renderBgLoop);
}
renderBgLoop();

window.addEventListener('mousemove', (e) => {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
});

// ==========================================================================
// 2. LIVE AGE TICKER (Born Oct 24, 2008)
// ==========================================================================
const BIRTH_DATE = new Date(2008, 9, 24, 0, 0, 0); // Oct 24, 2008

function updateLiveAge() {
  const now = new Date();
  
  // Calculate difference
  let years = now.getFullYear() - BIRTH_DATE.getFullYear();
  let bdayThisYear = new Date(now.getFullYear(), BIRTH_DATE.getMonth(), BIRTH_DATE.getDate());
  
  if (now < bdayThisYear) {
    years--;
    bdayThisYear = new Date(now.getFullYear() - 1, BIRTH_DATE.getMonth(), BIRTH_DATE.getDate());
  }

  const diffMs = now - BIRTH_DATE;
  const daysTotal = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const daysSinceBday = Math.floor((now - bdayThisYear) / (1000 * 60 * 60 * 24));
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const elYears = document.getElementById('tickerYears');
  const elDays = document.getElementById('tickerDays');
  const elHours = document.getElementById('tickerHours');
  const elMins = document.getElementById('tickerMins');
  const elSecs = document.getElementById('tickerSecs');

  if (elYears) elYears.textContent = String(years).padStart(2, '0');
  if (elDays) elDays.textContent = String(daysSinceBday).padStart(2, '0');
  if (elHours) elHours.textContent = String(hours).padStart(2, '0');
  if (elMins) elMins.textContent = String(minutes).padStart(2, '0');
  if (elSecs) elSecs.textContent = String(seconds).padStart(2, '0');
}
setInterval(updateLiveAge, 1000);
updateLiveAge();

// ==========================================================================
// 3. AUDIO ENGINE & SYNTHESIZER (Hola Amigo / Cyber DHH Beat)
// ==========================================================================
const audioEl = document.getElementById('bgAudio');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const muteBtn = document.getElementById('muteBtn');
const muteIcon = document.getElementById('muteIcon');
const volumeSlider = document.getElementById('volumeSlider');
const deckStatusEl = document.getElementById('deckStatus');
const trackTimeCurrent = document.getElementById('trackTimeCurrent');
const trackTimeDuration = document.getElementById('trackTimeDuration');
const waveformCanvas = document.getElementById('waveformCanvas');
const waveCtx = waveformCanvas ? waveformCanvas.getContext('2d') : null;
const trackProgressWrap = document.getElementById('trackProgressWrap');
const trackProgressFill = document.getElementById('trackProgressFill');

let audioCtx = null;
let mediaSourceNode = null;
let analyserNode = null;
let freqDataArray = null;
let synthInterval = null;
let isSynthMode = false;
let isAudioPlaying = false;
let waveData = new Array(36).fill(0.06);

// Initialize Web Audio and real audio element analyser
function initWebAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  setupAudioAnalyser();
}

function setupAudioAnalyser() {
  if (!audioCtx || !audioEl || mediaSourceNode) return;
  try {
    mediaSourceNode = audioCtx.createMediaElementSource(audioEl);
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 128;
    analyserNode.smoothingTimeConstant = 0.8;
    freqDataArray = new Uint8Array(analyserNode.frequencyBinCount);
    
    mediaSourceNode.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);
  } catch (e) {
    console.warn('MediaElementSource note:', e);
  }
}

// Generate an 808 kick, snare, or hi-hat synthesized sound
function playSynthDrum(type) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  if (type === 'kick') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.18);
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'snare') {
    // Noise buffer
    const bufferSize = audioCtx.sampleRate * 0.12;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start(now);
  } else if (type === 'hihat') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(8000, now);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

let synthBeatStep = 0;
function startSynthBeat() {
  isSynthMode = true;
  if (synthInterval) clearInterval(synthInterval);
  synthBeatStep = 0;
  
  synthInterval = setInterval(() => {
    if (!isAudioPlaying) return;
    // 16-step trap pattern: 130 BPM (~115ms per 16th note)
    if (synthBeatStep % 8 === 0 || synthBeatStep === 6 || synthBeatStep === 12) {
      playSynthDrum('kick');
    }
    if (synthBeatStep % 8 === 4) {
      playSynthDrum('snare');
    }
    if (synthBeatStep % 2 === 0 || synthBeatStep === 7 || synthBeatStep === 15) {
      playSynthDrum('hihat');
    }
    synthBeatStep = (synthBeatStep + 1) % 16;
  }, 115);
}

function stopSynthBeat() {
  if (synthInterval) clearInterval(synthInterval);
  isSynthMode = false;
}

function updateWaveformVisualizer() {
  if (!waveCtx || !waveformCanvas) return;
  const w = waveformCanvas.width;
  const h = waveformCanvas.height;
  waveCtx.clearRect(0, 0, w, h);

  const barCount = 36;
  const barWidth = (w / barCount) - 2;

  if (isAudioPlaying) {
    if (analyserNode && freqDataArray && !audioEl.paused) {
      analyserNode.getByteFrequencyData(freqDataArray);
      for (let i = 0; i < barCount; i++) {
        const bin = Math.floor((i / barCount) * (freqDataArray.length * 0.7));
        const val = (freqDataArray[bin] || 0) / 255;
        waveData[i] = Math.max(0.08, val * 1.1);
      }
    } else {
      // Dynamic simulated spectrum for synth beat or standby
      for (let i = 0; i < barCount; i++) {
        const factor = Math.sin((Date.now() * 0.008) + i * 0.4) * 0.5 + 0.5;
        const beatKick = (synthBeatStep % 4 === 0) ? 0.35 : 0;
        waveData[i] = Math.min(1, Math.max(0.1, factor * 0.8 + beatKick + (Math.random() * 0.15)));
      }
    }
  } else {
    for (let i = 0; i < barCount; i++) {
      waveData[i] = 0.06;
    }
  }

  for (let i = 0; i < barCount; i++) {
    const barHeight = waveData[i] * (h - 6);
    const x = i * (barWidth + 2) + 2;
    const y = h - barHeight - 3;

    const grad = waveCtx.createLinearGradient(0, y, 0, h);
    grad.addColorStop(0, '#00f0ff');
    grad.addColorStop(0.5, '#b026ff');
    grad.addColorStop(1, '#ff0055');

    waveCtx.fillStyle = grad;
    waveCtx.shadowBlur = isAudioPlaying ? 10 : 0;
    waveCtx.shadowColor = '#00f0ff';
    waveCtx.fillRect(x, y, barWidth, barHeight);
  }

  requestAnimationFrame(updateWaveformVisualizer);
}

if (waveformCanvas) {
  waveformCanvas.width = waveformCanvas.offsetWidth || 400;
  waveformCanvas.height = 52;
  updateWaveformVisualizer();
}

async function togglePlay() {
  initWebAudio();

  if (isAudioPlaying) {
    // Pause
    if (audioEl) audioEl.pause();
    stopSynthBeat();
    isAudioPlaying = false;
    if (playIcon) playIcon.textContent = '▶';
    if (deckStatusEl) deckStatusEl.textContent = 'STANDBY // PAUSED';
  } else {
    // Play
    isAudioPlaying = true;
    if (playIcon) playIcon.textContent = '❚❚';
    if (deckStatusEl) deckStatusEl.textContent = 'CONNECTING AUDIO...';

    if (audioEl) {
      audioEl.volume = volumeSlider ? parseFloat(volumeSlider.value) : 0.8;
      audioEl.play().then(() => {
        if (deckStatusEl) deckStatusEl.textContent = 'PLAYING // HOLA AMIGO (SM)';
        showCyberToast('🎵 Playing: Hola Amigo — Seedhe Maut ft. KR$NA');
      }).catch(err => {
        console.log('Audio playback error or autoplay block, fallback to synth beat:', err);
        startSynthBeat();
        if (deckStatusEl) deckStatusEl.textContent = 'PLAYING // CYBER DHH SYNTH';
        showCyberToast('🎵 Playing Cyber DHH Beat! (hola-amigo.mp3 loaded)');
      });
    } else {
      startSynthBeat();
    }
  }
}

if (playPauseBtn) {
  playPauseBtn.addEventListener('click', togglePlay);
}

if (muteBtn && audioEl) {
  muteBtn.addEventListener('click', () => {
    audioEl.muted = !audioEl.muted;
    if (muteIcon) muteIcon.textContent = audioEl.muted ? '🔇' : '🔊';
  });
}

if (volumeSlider && audioEl) {
  volumeSlider.addEventListener('input', (e) => {
    audioEl.volume = parseFloat(e.target.value);
  });
}

if (audioEl) {
  audioEl.addEventListener('loadedmetadata', () => {
    if (trackTimeDuration && !isNaN(audioEl.duration)) {
      trackTimeDuration.textContent = formatTime(audioEl.duration);
    }
  });

  audioEl.addEventListener('timeupdate', () => {
    if (!isNaN(audioEl.duration) && audioEl.duration > 0) {
      const cur = formatTime(audioEl.currentTime);
      const dur = formatTime(audioEl.duration);
      if (trackTimeCurrent) trackTimeCurrent.textContent = cur;
      if (trackTimeDuration) trackTimeDuration.textContent = dur;

      if (trackProgressFill) {
        const pct = (audioEl.currentTime / audioEl.duration) * 100;
        trackProgressFill.style.width = pct + '%';
      }
    }
  });
}

// Click on progress bar to seek
if (trackProgressWrap && audioEl) {
  trackProgressWrap.addEventListener('click', (e) => {
    if (!isNaN(audioEl.duration) && audioEl.duration > 0) {
      const rect = trackProgressWrap.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      audioEl.currentTime = pct * audioEl.duration;
    }
  });
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// ==========================================================================
// 4. BROTHER'S TRANSMISSION MESSAGE (Shailesh)
// ==========================================================================
const TRANSMISSION_RAW = `Happy 18th Birthday, Abhinav! You truly are the best brother I could have ever asked for in this world. I know we fight and argue a lot, and half the time we don’t even talk properly—we just stay annoyed at each other. But no matter how much we fight or how angry I get, you will always be the most important person in my life. You’re officially turning 18 now, and your JEE exam is around the corner. I have full faith that you will crack it with a top rank and make us all proud. Just give it your absolute best. You’ll always be the best brother to me. — From your brother, Shailesh`;

const messageContainer = document.getElementById('transmissionMessageText');
const retypeBtn = document.getElementById('retypeBtn');
const voiceReadoutBtn = document.getElementById('voiceReadoutBtn');
const copyMessageBtn = document.getElementById('copyMessageBtn');

function formatHighlightedMessage(text) {
  let html = text;
  html = html.replace('best brother', '<span class="highlight-brother">best brother</span>');
  html = html.replace('most important person in my life', '<span class="highlight-important">most important person in my life</span>');
  html = html.replace('crack it with a top rank', '<span class="highlight-jee">crack it with a top rank</span>');
  html = html.replace('best brother to me', '<span class="highlight-brother">best brother to me</span>');
  return html;
}

function typeMessage() {
  if (!messageContainer) return;
  messageContainer.innerHTML = '';
  
  const words = TRANSMISSION_RAW.split(' ');
  let currentText = '';
  let i = 0;

  const timer = setInterval(() => {
    if (i < words.length) {
      currentText += (i === 0 ? '' : ' ') + words[i];
      messageContainer.innerHTML = formatHighlightedMessage(currentText);
      i++;
    } else {
      clearInterval(timer);
    }
  }, 45);
}

// Initial reveal
typeMessage();

if (retypeBtn) {
  retypeBtn.addEventListener('click', () => {
    typeMessage();
    showCyberToast('🔄 Retransmitting Brotherhood Signal...');
  });
}

// Voice Readout with Web Speech API
if (voiceReadoutBtn) {
  voiceReadoutBtn.addEventListener('click', () => {
    if (!('speechSynthesis' in window)) {
      showCyberToast('❌ Speech synthesis not supported in this browser.');
      return;
    }
    
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      showCyberToast('⏹ Audio transmission stopped.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(TRANSMISSION_RAW);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(v => v.lang.includes('IN') || v.name.includes('India')) || voices[0];
    if (indianVoice) utterance.voice = indianVoice;

    window.speechSynthesis.speak(utterance);
    showCyberToast('🔊 Transmitting Brotherhood Voice...');
  });
}

// Copy Message
if (copyMessageBtn) {
  copyMessageBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(TRANSMISSION_RAW).then(() => {
      showCyberToast('📋 Transmission Copied to Clipboard!');
    }).catch(() => {
      showCyberToast('Transmission logged.');
    });
  });
}

// ==========================================================================
// 5. JEE MOTIVATION & HYPE CARD
// ==========================================================================
// Countdown to upcoming JEE Exam (Targeting Jan 24, 2027)
const JEE_TARGET_DATE = new Date(2027, 0, 24, 9, 0, 0);

function updateJeeCountdown() {
  const now = new Date();
  const diff = JEE_TARGET_DATE - now;

  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
  const minutes = Math.max(0, Math.floor((diff / (1000 * 60)) % 60));
  const seconds = Math.max(0, Math.floor((diff / 1000) % 60));

  const cdDays = document.getElementById('jeeDays');
  const cdHours = document.getElementById('jeeHours');
  const cdMins = document.getElementById('jeeMins');
  const cdSecs = document.getElementById('jeeSecs');

  if (cdDays) cdDays.textContent = String(days).padStart(2, '0');
  if (cdHours) cdHours.textContent = String(hours).padStart(2, '0');
  if (cdMins) cdMins.textContent = String(minutes).padStart(2, '0');
  if (cdSecs) cdSecs.textContent = String(seconds).padStart(2, '0');
}
setInterval(updateJeeCountdown, 1000);
updateJeeCountdown();

// Hype quotes collection
const HYPE_QUOTES = [
  "“Khoon mein daudti hai zidd! Abhinav, AIR 1 is within your strike range!”",
  "“Seedhe Maut mindset: Mehnat itni khamoshi se karo ki tumhara result shor macha de!”",
  "“Physics mastered, Chemistry locked in, Maths crushed. Pure domination!”",
  "“Jab tak phodenge nahi, tab tak chodenge nahi! Best brother is born to win.”",
  "“TBS4L Energy: 18 saal ka champion, agla IITian legend!”"
];

const hypeQuoteEl = document.getElementById('hypeQuoteText');
const overdriveBtn = document.getElementById('overdriveBtn');
let hypeIdx = 0;

if (overdriveBtn) {
  overdriveBtn.addEventListener('click', () => {
    // Screen shake & shockwave
    document.body.style.animation = 'screenShake 0.4s ease';
    setTimeout(() => { document.body.style.animation = ''; }, 450);

    // Audio hit
    initWebAudio();
    playSynthDrum('kick');
    setTimeout(() => playSynthDrum('snare'), 150);

    // Rotate quote
    hypeIdx = (hypeIdx + 1) % HYPE_QUOTES.length;
    if (hypeQuoteEl) {
      hypeQuoteEl.textContent = HYPE_QUOTES[hypeIdx];
      hypeQuoteEl.style.color = '#00f0ff';
      setTimeout(() => { hypeQuoteEl.style.color = '#fff'; }, 300);
    }

    // Trigger confetti
    launchCelebrationConfetti(60);
    showCyberToast('⚡ JEE OVERDRIVE ENGAGED! AIR 1 MODE ACTIVATED!');
  });
}

// ==========================================================================
// 6. PHOTO VAULT (ALL 15 PHOTOS)
// ==========================================================================
const PHOTO_DATA = [
  { file: 'photo1.jpg', title: 'The Legend — Baby Mode', tag: 'Childhood', desc: 'Where the journey started. Pure boss energy since 2008.' },
  { file: 'photo2.jpg', title: 'Full Drip & Attitude', tag: 'Attitude', desc: 'Certified swagger. Seedhe Maut style locked in.' },
  { file: 'photo3.jpg', title: 'Little Gangster', tag: 'Childhood', desc: 'Tiny champ plotting big moves even back then.' },
  { file: 'photo4.jpg', title: 'OG Aura', tag: 'Attitude', desc: 'Unmatched confidence. Future IITian in the making.' },
  { file: 'photo5.jpg', title: 'Duo of Doom', tag: 'Brothers', desc: 'Brothers in arms. Fights, laughs, and brotherhood forever.' },
  { file: 'photo6.jpg', title: 'Chill Mode Activated', tag: 'Attitude', desc: 'Effortless cool. Keeping it real in every frame.' },
  { file: 'photo7.jpg', title: 'The Young Champion', tag: 'Childhood', desc: 'Growing up fast, learning fast, ready to conquer.' },
  { file: 'photo8.jpg', title: 'Seedhe Maut Mentality', tag: 'Attitude', desc: 'Raw focus. No excuses, only grind and glory.' },
  { file: 'photo9.jpg', title: 'Golden Days', tag: 'Childhood', desc: 'Innocent days before the JEE battle began.' },
  { file: 'photo10.jpg', title: 'Brotherhood Odyssey', tag: 'Brothers', desc: 'Making memories, standing tall side by side.' },
  { file: 'photo11.jpg', title: 'The Unstoppable Pair', tag: 'Brothers', desc: 'No one messes with the Rain brothers. Period.' },
  { file: 'photo12.jpg', title: '18 Years of Excellence', tag: 'Attitude', desc: 'Standing at the threshold of adulthood. Level 18 unlocked.' },
  { file: 'photo13.jpg', title: 'Festival & Celebrations', tag: 'Brothers', desc: 'Smiles that outshine every neon light in the city.' },
  { file: 'photo14.jpg', title: 'Ready to Crack JEE', tag: 'Attitude', desc: 'The look of a champion about to make everyone proud.' },
  { file: 'photo15.jpg', title: 'Timeless Memory', tag: 'Childhood', desc: 'The sweetest throwback in the entire vault.' }
];

const galleryGrid = document.getElementById('galleryGrid');
const polaroidStage = document.getElementById('polaroidStage');
const polaroidWrap = document.getElementById('polaroidWrap');
const filterBtns = document.querySelectorAll('.filter-btn');
const viewBtns = document.querySelectorAll('.view-btn');

function renderGallery(filter = 'all') {
  if (!galleryGrid) return;
  galleryGrid.innerHTML = '';

  const filtered = filter === 'all' 
    ? PHOTO_DATA 
    : PHOTO_DATA.filter(p => p.tag.toLowerCase() === filter.toLowerCase());

  filtered.forEach((p, idx) => {
    const card = document.createElement('div');
    card.className = 'photo-card cyber-card';
    card.innerHTML = `
      <div class="hud-corner hud-tl"></div>
      <div class="hud-corner hud-tr"></div>
      <div class="hud-corner hud-bl"></div>
      <div class="hud-corner hud-br"></div>
      <div class="photo-card-img-wrap">
        <span class="photo-hud-badge">LOG_${String(idx + 1).padStart(2, '0')} // ${p.tag.toUpperCase()}</span>
        <img src="${p.file}" alt="${p.title}" loading="lazy" onerror="this.src='photo1.jpg'">
      </div>
      <div class="photo-card-body">
        <div class="photo-card-tag">// ${p.tag}</div>
        <div class="photo-card-title">${p.title}</div>
        <div class="photo-card-desc">${p.desc}</div>
      </div>
    `;
    card.addEventListener('click', () => openLightbox(p.file, p.title, p.desc, p.tag));
    galleryGrid.appendChild(card);
  });
}

// Render initial grid
renderGallery();

// Filter buttons
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderGallery(btn.dataset.filter);
  });
});

// View switch (Grid vs Polaroid)
viewBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    viewBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const view = btn.dataset.view;
    if (view === 'grid') {
      galleryGrid.style.display = 'grid';
      if (polaroidWrap) polaroidWrap.classList.remove('active');
    } else {
      galleryGrid.style.display = 'none';
      if (polaroidWrap) {
        polaroidWrap.classList.add('active');
        renderPolaroidCarousel();
      }
    }
  });
});

// Polaroid Carousel Render
let polaroidIndex = 0;
function renderPolaroidCarousel() {
  if (!polaroidStage) return;
  polaroidStage.innerHTML = '';

  PHOTO_DATA.forEach((p, i) => {
    const item = document.createElement('div');
    item.className = 'polaroid-item';
    
    // Stack cards with 3D offset
    const offset = (i - polaroidIndex);
    const zIndex = 20 - Math.abs(offset);
    const rotate = offset * 4;
    const transX = offset * 25;
    const scale = Math.max(0.7, 1 - Math.abs(offset) * 0.08);
    const opacity = Math.abs(offset) > 3 ? 0 : 1;

    item.style.zIndex = zIndex;
    item.style.transform = `translateX(${transX}px) scale(${scale}) rotate(${rotate}deg)`;
    item.style.opacity = opacity;
    item.style.pointerEvents = offset === 0 ? 'auto' : 'none';

    item.innerHTML = `
      <div class="polaroid-img-box">
        <img src="${p.file}" alt="${p.title}">
      </div>
      <div class="polaroid-caption">
        <h4>${p.title}</h4>
        <p>// ${p.tag} · ${p.desc}</p>
      </div>
    `;

    item.addEventListener('click', () => openLightbox(p.file, p.title, p.desc, p.tag));
    polaroidStage.appendChild(item);
  });
}

const polPrevBtn = document.getElementById('polPrev');
const polNextBtn = document.getElementById('polNext');

if (polPrevBtn) {
  polPrevBtn.addEventListener('click', () => {
    polaroidIndex = (polaroidIndex - 1 + PHOTO_DATA.length) % PHOTO_DATA.length;
    renderPolaroidCarousel();
  });
}
if (polNextBtn) {
  polNextBtn.addEventListener('click', () => {
    polaroidIndex = (polaroidIndex + 1) % PHOTO_DATA.length;
    renderPolaroidCarousel();
  });
}

// Hero Hologram Rotating Showcase
const heroHoloImg = document.getElementById('heroHoloImg');
const heroHoloCaption = document.getElementById('heroHoloCaption');
const heroHoloTag = document.getElementById('heroHoloTag');
let heroHoloIdx = 0;
const HERO_PHOTOS = [
  PHOTO_DATA[0], // Baby mode
  PHOTO_DATA[1], // Full drip
  PHOTO_DATA[4], // Duo of doom
  PHOTO_DATA[10], // Unstoppable pair
  PHOTO_DATA[11]  // 18 years
];

function updateHeroHolo(idx) {
  heroHoloIdx = (idx + HERO_PHOTOS.length) % HERO_PHOTOS.length;
  const item = HERO_PHOTOS[heroHoloIdx];
  if (heroHoloImg) {
    heroHoloImg.style.opacity = '0';
    setTimeout(() => {
      heroHoloImg.src = item.file;
      heroHoloImg.style.opacity = '1';
    }, 250);
  }
  if (heroHoloCaption) heroHoloCaption.textContent = item.title;
  if (heroHoloTag) heroHoloTag.textContent = `[MEM_0${heroHoloIdx + 1} // ${item.tag.toUpperCase()}]`;

  // Update dots
  document.querySelectorAll('.holo-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === heroHoloIdx);
  });
}

setInterval(() => {
  updateHeroHolo(heroHoloIdx + 1);
}, 4200);

document.querySelectorAll('.holo-dot').forEach(dot => {
  dot.addEventListener('click', (e) => {
    updateHeroHolo(parseInt(e.target.dataset.index, 10));
  });
});

// ==========================================================================
// 7. LIGHTBOX MODAL
// ==========================================================================
const lightboxModal = document.getElementById('lightboxModal');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxDesc = document.getElementById('lightboxDesc');
const lightboxTag = document.getElementById('lightboxTag');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
let currentLightboxIdx = 0;

function openLightbox(file, title, desc, tag) {
  if (!lightboxModal) return;
  currentLightboxIdx = PHOTO_DATA.findIndex(p => p.file === file);
  if (currentLightboxIdx === -1) currentLightboxIdx = 0;

  updateLightboxContent();
  lightboxModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function updateLightboxContent() {
  const p = PHOTO_DATA[currentLightboxIdx];
  if (lightboxImg) lightboxImg.src = p.file;
  if (lightboxTitle) lightboxTitle.textContent = p.title;
  if (lightboxDesc) lightboxDesc.textContent = p.desc;
  if (lightboxTag) lightboxTag.textContent = `// ${p.tag.toUpperCase()} · MEMORY #${currentLightboxIdx + 1}`;
}

function closeLightbox() {
  if (!lightboxModal) return;
  lightboxModal.classList.remove('active');
  document.body.style.overflow = '';
}

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxPrev) {
  lightboxPrev.addEventListener('click', () => {
    currentLightboxIdx = (currentLightboxIdx - 1 + PHOTO_DATA.length) % PHOTO_DATA.length;
    updateLightboxContent();
  });
}
if (lightboxNext) {
  lightboxNext.addEventListener('click', () => {
    currentLightboxIdx = (currentLightboxIdx + 1) % PHOTO_DATA.length;
    updateLightboxContent();
  });
}

// Close on backdrop or ESC
if (lightboxModal) {
  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal) closeLightbox();
  });
}
window.addEventListener('keydown', (e) => {
  if (!lightboxModal || !lightboxModal.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft' && lightboxPrev) lightboxPrev.click();
  if (e.key === 'ArrowRight' && lightboxNext) lightboxNext.click();
});

// ==========================================================================
// 8. BIRTHDAY CONFETTI & NEON CELEBRATION FX
// ==========================================================================
const confettiCanvas = document.getElementById('confettiCanvas');
const confCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
let confettiParticles = [];
let confettiAnimationId = null;

function resizeConfetti() {
  if (!confettiCanvas) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfetti);
resizeConfetti();

class NeonConfetti {
  constructor() {
    this.x = Math.random() * window.innerWidth;
    this.y = -20 - Math.random() * 200;
    this.size = Math.random() * 8 + 6;
    this.vx = (Math.random() - 0.5) * 5;
    this.vy = Math.random() * 4 + 3;
    this.rotation = Math.random() * 360;
    this.rotSpeed = (Math.random() - 0.5) * 8;
    this.color = ['#00f0ff', '#b026ff', '#ff0055', '#ffd700', '#00ff88'][Math.floor(Math.random() * 5)];
    this.isSpecial18 = Math.random() < 0.15;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotSpeed;
    this.vx += (Math.random() - 0.5) * 0.2;
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;

    if (this.isSpecial18) {
      ctx.font = 'bold 16px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('18', 0, 0);
    } else {
      ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    }
    ctx.restore();
  }
}

function launchCelebrationConfetti(count = 140) {
  initWebAudio();
  playSynthDrum('kick');
  setTimeout(() => playSynthDrum('snare'), 200);

  for (let i = 0; i < count; i++) {
    confettiParticles.push(new NeonConfetti());
  }

  if (!confettiAnimationId) {
    animateConfetti();
  }
}

function animateConfetti() {
  if (!confCtx || !confettiCanvas) return;
  confCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i];
    p.update();
    p.draw(confCtx);

    if (p.y > window.innerHeight + 50) {
      confettiParticles.splice(i, 1);
    }
  }

  if (confettiParticles.length > 0) {
    confettiAnimationId = requestAnimationFrame(animateConfetti);
  } else {
    confettiAnimationId = null;
  }
}

// Celebration triggers
const heroConfettiBtn = document.getElementById('heroConfettiBtn');
const floatingFxBtn = document.getElementById('floatingFxBtn');

if (heroConfettiBtn) {
  heroConfettiBtn.addEventListener('click', () => {
    launchCelebrationConfetti(160);
    showCyberToast('🎉 HAPPY 18TH BIRTHDAY ABHINAV! LEVEL 18 UNLOCKED!');
  });
}

if (floatingFxBtn) {
  floatingFxBtn.addEventListener('click', () => {
    launchCelebrationConfetti(180);
    showCyberToast('💥 NEON CELEBRATION PROTOCOL ACTIVATED!');
  });
}

// ==========================================================================
// 9. NAYAAB MINI-GAME (Easter Egg)
// ==========================================================================
const gameCanvas = document.getElementById('nayaabGameCanvas');
const gCtx = gameCanvas ? gameCanvas.getContext('2d') : null;
const gameOverlay = document.getElementById('gameOverlay');
const startGameBtn = document.getElementById('startGameBtn');
const gameScoreEl = document.getElementById('gameScore');
const gameTimeEl = document.getElementById('gameTime');
const gameOverlayTitle = document.getElementById('gameOverlayTitle');
const gameOverlayDesc = document.getElementById('gameOverlayDesc');

let gameRunning = false;
let gameScore = 0;
let gameTimeLeft = 30;
let gameTimerId = null;
let gameAnimId = null;
let gamePaddle = { x: 300, w: 90, h: 14 };
let gameDrops = [];

function resizeGame() {
  if (!gameCanvas) return;
  gameCanvas.width = 640;
  gameCanvas.height = 360;
  gamePaddle.x = gameCanvas.width / 2;
}
resizeGame();

function spawnGameDrop() {
  const isBomb = Math.random() < 0.28;
  gameDrops.push({
    x: 30 + Math.random() * (gameCanvas.width - 60),
    y: -20,
    vy: 2.2 + Math.random() * 2.5,
    isBomb,
    char: isBomb ? '☠' : 'न'
  });
}

function updateGameLoop() {
  if (!gCtx || !gameCanvas) return;
  gCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Draw paddle
  gCtx.save();
  gCtx.shadowBlur = 18;
  gCtx.shadowColor = '#00f0ff';
  gCtx.fillStyle = '#00f0ff';
  gCtx.fillRect(gamePaddle.x - gamePaddle.w / 2, gameCanvas.height - 24, gamePaddle.w, gamePaddle.h);
  gCtx.fillStyle = '#fff';
  gCtx.fillRect(gamePaddle.x - gamePaddle.w / 2, gameCanvas.height - 24, gamePaddle.w, 3);
  gCtx.restore();

  // Spawn drops
  if (Math.random() < 0.08) spawnGameDrop();

  // Process drops
  for (let i = gameDrops.length - 1; i >= 0; i--) {
    const d = gameDrops[i];
    d.y += d.vy;

    gCtx.save();
    gCtx.shadowBlur = 12;
    gCtx.shadowColor = d.isBomb ? '#ff0055' : '#00f0ff';
    gCtx.fillStyle = d.isBomb ? '#ff0055' : '#fff';
    gCtx.font = d.isBomb ? '24px sans-serif' : 'bold 26px Teko, sans-serif';
    gCtx.textAlign = 'center';
    gCtx.textBaseline = 'middle';
    gCtx.fillText(d.char, d.x, d.y);
    gCtx.restore();

    // Check collision with paddle
    const paddleTop = gameCanvas.height - 24;
    if (d.y >= paddleTop - 8 && d.y <= paddleTop + 14) {
      if (Math.abs(d.x - gamePaddle.x) < gamePaddle.w / 2 + 12) {
        if (d.isBomb) {
          gameScore = Math.max(0, gameScore - 20);
          playSynthDrum('snare');
        } else {
          gameScore += 10;
          playSynthDrum('hihat');
        }
        if (gameScoreEl) gameScoreEl.textContent = gameScore;
        gameDrops.splice(i, 1);
        continue;
      }
    }

    if (d.y > gameCanvas.height + 30) {
      gameDrops.splice(i, 1);
    }
  }

  if (gameRunning) {
    gameAnimId = requestAnimationFrame(updateGameLoop);
  }
}

function startGame() {
  gameRunning = true;
  gameScore = 0;
  gameTimeLeft = 30;
  gameDrops = [];
  if (gameScoreEl) gameScoreEl.textContent = 0;
  if (gameTimeEl) gameTimeEl.textContent = 30;
  if (gameOverlay) gameOverlay.classList.add('hidden');

  initWebAudio();

  if (gameTimerId) clearInterval(gameTimerId);
  gameTimerId = setInterval(() => {
    gameTimeLeft--;
    if (gameTimeEl) gameTimeEl.textContent = gameTimeLeft;
    if (gameTimeLeft <= 0) {
      endGame();
    }
  }, 1000);

  updateGameLoop();
}

function endGame() {
  gameRunning = false;
  if (gameTimerId) clearInterval(gameTimerId);
  if (gameAnimId) cancelAnimationFrame(gameAnimId);

  const title = gameScore >= 120 
    ? '🏆 SEEDHE MAUT GOD TIER' 
    : (gameScore >= 60 ? '🔥 SOLID HUSTLE, BHAI' : '⚡ WARM UP COMPLETE');

  if (gameOverlayTitle) gameOverlayTitle.textContent = title;
  if (gameOverlayDesc) gameOverlayDesc.innerHTML = `MISSION COMPLETE!<br>FINAL SCORE: <strong style="color:#00f0ff;font-size:1.4rem;">${gameScore}</strong><br>JEE me bhi aise hi top rank uthayenge!`;
  if (startGameBtn) startGameBtn.textContent = 'RUN IT BACK';
  if (gameOverlay) gameOverlay.classList.remove('hidden');

  if (gameScore >= 60) {
    launchCelebrationConfetti(80);
  }
}

if (startGameBtn) {
  startGameBtn.addEventListener('click', startGame);
}

if (gameCanvas) {
  gameCanvas.addEventListener('mousemove', (e) => {
    const rect = gameCanvas.getBoundingClientRect();
    const scaleX = gameCanvas.width / rect.width;
    gamePaddle.x = (e.clientX - rect.left) * scaleX;
  });

  gameCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = gameCanvas.getBoundingClientRect();
    const scaleX = gameCanvas.width / rect.width;
    gamePaddle.x = (e.touches[0].clientX - rect.left) * scaleX;
  }, { passive: false });
}

window.addEventListener('keydown', (e) => {
  if (!gameRunning) return;
  if (e.key === 'ArrowLeft') gamePaddle.x = Math.max(gamePaddle.w / 2, gamePaddle.x - 24);
  if (e.key === 'ArrowRight') gamePaddle.x = Math.min(gameCanvas.width - gamePaddle.w / 2, gamePaddle.x + 24);
});

// ==========================================================================
// 10. CYBER TOAST NOTIFICATIONS
// ==========================================================================
let toastTimer = null;
function showCyberToast(msg) {
  let toast = document.getElementById('cyberToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cyberToast';
    toast.className = 'cyber-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = msg;
  toast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 4500);
}

// Add CSS keyframe for screenShake if not present
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes screenShake {
    0% { transform: translate(0, 0); }
    20% { transform: translate(-8px, 6px); }
    40% { transform: translate(8px, -6px); }
    60% { transform: translate(-5px, 3px); }
    80% { transform: translate(5px, -3px); }
    100% { transform: translate(0, 0); }
  }
`;
document.head.appendChild(shakeStyle);
