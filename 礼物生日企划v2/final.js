"use strict";

const STORAGE_KEY = "stardewBirthdayAdventure.v1";
const FINAL_LETTER = `亲爱的礼物：

祝你19岁生日快乐。

我们都说：要是人生是星露谷就好了。
随时可以到达的海边，
送出礼物就能获得的友谊，
努力种地总会有收获，
失败了也只是会掉落几件东西。

可相信，或许你真的可以把人生活成星露谷。
总有一天你会生活到你喜欢的环境，身边都是自己热爱的美好，
你对待朋友的真心本就会换来同样的真情，
你总是默默为了自己的目标而努力，相信上天也会给你应得的回报，
人生的容错很高，或许一次失败确实什么都不会发生。

就像星露谷永远可以存档重开一样，
希望你一直有破釜沉舟、从头再来的勇气。
星露谷总会有下一个春夏秋冬，
人生也是。

当然，更希望你未来的每一天都一切顺遂无忧，
希望你永远带着你的那份纯粹快乐地活着。
就像在星露谷一样，
突发奇想去挖矿钓鱼也可以，
想装饰自己的小家也可以，
或者什么都不干也可以
——爷爷只是希望你远离世俗开开心心。
（爸爸们也希望呀）

总之，
祝十九岁和未来的礼物
（引用星露谷的话：）
人生从此将展开新的一页。.
.....但前途必然是光明的！

爱你的，
爸爸们（24爸爸代笔）
`;

const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");
const letterText = document.getElementById("letterText");
const replayButton = document.getElementById("replayButton");
const farmButton = document.getElementById("farmButton");
const endingSong = document.getElementById("endingSong");
const world = { width: 960, height: 640 };
const fireworks = [];
const stars = Array.from({ length: 110 }, (_, i) => ({
  x: (i * 89) % world.width,
  y: 24 + ((i * 137) % 300),
  size: 2 + (i % 3),
  twinkle: i * 0.37
}));

let lastTime = 0;
let letterIndex = 0;
let audioContext = null;
let audioEnabled = false;

function fitCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  ctx.setTransform(canvas.width / world.width, 0, 0, canvas.height / world.height, 0, 0);
  ctx.imageSmoothingEnabled = false;
}

function drawPixelRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function spawnFirework() {
  const side = Math.random() < 0.62;
  const firework = {
    x: side ? 70 + Math.random() * 470 : 580 + Math.random() * 310,
    y: 45 + Math.random() * 180,
    age: 0,
    ring: 18 + Math.random() * 16,
    color: ["#ffd769", "#ff7b77", "#99e4ff", "#dca3ff", "#aaffbb"][Math.floor(Math.random() * 5)]
  };
  fireworks.push(firework);
  playFireworkSound(firework.x / world.width);
}

function render(time = 0) {
  const delta = Math.min(50, time - lastTime || 16);
  lastTime = time;

  const sky = ctx.createLinearGradient(0, 0, 0, world.height);
  sky.addColorStop(0, "#0b1028");
  sky.addColorStop(0.62, "#1c2347");
  sky.addColorStop(1, "#32355b");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, world.width, world.height);

  stars.forEach(star => {
    const glow = 0.55 + Math.sin(time * 0.002 + star.twinkle) * 0.35;
    ctx.globalAlpha = glow;
    drawPixelRect(star.x, star.y, star.size, star.size, "#fff4bc");
  });
  ctx.globalAlpha = 1;

  drawPixelRect(0, 500, world.width, 140, "#1c513d");
  for (let x = 0; x < world.width; x += 42) {
    drawPixelRect(x, 506 + (x % 84 ? 12 : 0), 38, 72, "#2c7d55");
    drawPixelRect(x + 10, 554, 16, 48, "#6b4429");
  }
  drawPixelRect(410, 455, 140, 82, "#b85a32");
  drawPixelRect(392, 432, 176, 34, "#8e3829");
  drawPixelRect(460, 490, 38, 47, "#593223");
  drawPixelRect(430, 478, 24, 22, "#ffd98e");
  drawPixelRect(510, 478, 24, 22, "#ffd98e");

  if (Math.random() < 0.08) spawnFirework();
  fireworks.forEach(fw => {
    fw.age += delta / 16;
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i) / 24;
      const r = fw.age * (fw.ring / 12);
      ctx.globalAlpha = Math.max(0, 1 - fw.age / 46);
      drawPixelRect(fw.x + Math.cos(angle) * r, fw.y + Math.sin(angle) * r, 6, 6, fw.color);
      if (i % 3 === 0) {
        drawPixelRect(fw.x + Math.cos(angle) * r * 0.55, fw.y + Math.sin(angle) * r * 0.55, 4, 4, "#fff8c8");
      }
    }
    ctx.globalAlpha = 1;
  });

  for (let i = fireworks.length - 1; i >= 0; i--) {
    if (fireworks[i].age > 48) fireworks.splice(i, 1);
  }

  requestAnimationFrame(render);
}

function typeLetter() {
  letterText.textContent += FINAL_LETTER[letterIndex] || "";
  letterIndex += 1;
  if (letterIndex < FINAL_LETTER.length) {
    setTimeout(typeLetter, 42);
  }
}

function resetAdventure() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ opened: [], eggHouse: false, eggTree: false, finalSeen: false }));
  window.location.href = "./index.html";
}

function returnToCompletedFarm() {
  sessionStorage.setItem("stardewBirthdayAdventure.returnToFarm", "1");
}

function ensureAudioContext() {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
  }
  return audioContext;
}

function playFireworkSound(panValue = 0.5) {
  if (!audioEnabled) return;
  const context = ensureAudioContext();
  const now = context.currentTime;
  const noiseBuffer = context.createBuffer(1, context.sampleRate * 0.55, context.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2.2);
  }

  const noise = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const panner = context.createStereoPanner ? context.createStereoPanner() : null;

  noise.buffer = noiseBuffer;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(620 + Math.random() * 720, now);
  filter.Q.value = 0.8;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.16, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);

  noise.connect(filter);
  if (panner) {
    panner.pan.value = panValue * 2 - 1;
    filter.connect(panner).connect(gain).connect(context.destination);
  } else {
    filter.connect(gain).connect(context.destination);
  }
  noise.start(now);
  noise.stop(now + 0.56);

  const sparkle = context.createOscillator();
  const sparkleGain = context.createGain();
  sparkle.type = "triangle";
  sparkle.frequency.setValueAtTime(1200 + Math.random() * 900, now);
  sparkle.frequency.exponentialRampToValueAtTime(420, now + 0.35);
  sparkleGain.gain.setValueAtTime(0.0001, now);
  sparkleGain.gain.linearRampToValueAtTime(0.055, now + 0.02);
  sparkleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.36);
  sparkle.connect(sparkleGain).connect(context.destination);
  sparkle.start(now);
  sparkle.stop(now + 0.38);
}

async function enableEndingAudio() {
  audioEnabled = true;
  const context = ensureAudioContext();
  await context.resume();
  endingSong.volume = 0.36;
  try {
    await endingSong.play();
  } catch {
    audioEnabled = false;
  }
}

window.addEventListener("resize", fitCanvas);
replayButton.addEventListener("click", resetAdventure);
farmButton.addEventListener("click", returnToCompletedFarm);
document.addEventListener("pointerdown", () => {
  if (!audioEnabled) enableEndingAudio();
}, { once: true });

fitCanvas();
enableEndingAudio();
setTimeout(typeLetter, 450);
for (let i = 0; i < 8; i++) spawnFirework();
requestAnimationFrame(render);
