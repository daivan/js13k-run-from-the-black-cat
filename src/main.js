// ================================
// === INIT ===
// ================================
const c = document.getElementById("c");
const ctx = c.getContext("2d");
c.width = 800;
c.height = 400;


// ZzFX Music library
let // ZzFXMicro - Zuper Zmall Zound Zynth - v1.3.1 by Frank Force ~ 1000 bytes
  zzfxV = .3,               // volume
  zzfxX = new AudioContext, // audio context
  zzfx =                   // play sound
    (p = 1, k = .05, b = 220, e = 0, r = 0, t = .1, q = 0, D = 1, u = 0, y = 0, v = 0, z = 0, l = 0, E = 0, A = 0, F = 0, c = 0, w = 1, m = 0, B = 0
      , N = 0) => {
      let M = Math, d = 2 * M.PI, R = 44100, G = u *= 500 * d / R / R, C = b *= (1 - k + 2 * k * M.random(k = [])) * d / R,
        g = 0, H = 0, a = 0, n = 1, I = 0, J = 0, f = 0, h = N < 0 ? -1 : 1, x = d * h * N * 2 / R, L = M.cos(x), Z = M.sin, K = Z(x) / 4, O = 1 + K,
        X = -2 * L / O, Y = (1 - K) / O, P = (1 + h * L) / 2 / O, Q = -(h + L) / O, S = P, T = 0, U = 0, V = 0, W = 0; e = R * e + 9; m *= R; r *= R; t *=
          R; c *= R; y *= 500 * d / R ** 3; A *= d / R; v *= d / R; z *= R; l = R * l | 0; p *= zzfxV; for (h = e + m + r + t + c | 0; a < h; k[a++]
            = f * p)++J % (100 * F | 0) || (f = q ? 1 < q ? 2 < q ? 3 < q ? Z(g ** 3) : M.max(M.min(M.tan(g), 1), -1) : 1 - (2 * g / d % 2 + 2)
              % 2 : 1 - 4 * M.abs(M.round(g / d) - g / d) : Z(g), f = (l ? 1 - B + B * Z(d * a / l) : 1) * (f < 0 ? -1 : 1) * M.abs(f) ** D * (a <
                e ? a / e : a < e + m ? 1 - (a - e) / m * (1 - w) : a < e + m + r ? w : a < h - c ? (h - a - c) / t * w : 0), f = c ? f / 2 + (c > a ? 0 : (a < h - c ? 1 : (h
                  - a) / c) * k[a - c | 0] / 2 / p) : f, N ? f = W = S * T + Q * (T = U) + P * (U = f) - Y * V - X * (V = W) : 0), x = (b += u += y) * M.cos(A *
                    H++), g += x + x * E * Z(a ** 5), n && ++n > z && (b += v, C += v, n = 0), !l || ++I % l || (b = C, u = G, n = n || 1); p = zzfxX.
                      createBuffer(1, h, R); p.getChannelData(0).set(k); b = zzfxX.createBufferSource();
      b.buffer = p; b.connect(zzfxX.destination); b.start()
    }

// ================================
// === GAME STATE ===
// ================================
let day = true;
let timer = 15000;        // Start timer
let dayLength = 30000;
let nightLength = 30000;

let gravity = 0.3;
let camX = 0;
let gameState = "startMenu"; // "startMenu", "playing", "gameOver", "win"
const maxDistance = 5000;

let craftingOpen = false;
let craftingRecipes = [
  { name: "Axe", cost: { wood: 3, stone: 0 }, time: 3 },
  { name: "Pick Axe", cost: { wood: 5, stone: 2 }, time: 5 },
  { name: "Trap", cost: { wood: 2, stone: 1 }, time: 5 },
  { name: "Bridge", cost: { wood: 3, stone: 0 }, time: 5 },
];
let craftingQueue = null;

// ================================
// === PLAYER ===
// ================================
let player = {
  x: 200,
  y: 300,
  w: 20,
  h: 20,
  vy: 0,
  onGround: false
};
woodDamage = 1;
stoneDamage = 1;

const speed = 3;
let interactCooldown = 0; // ms-ish i din nuvarande 16ms-loop

// =========================
// === MUSIC ===
// =========================
let musicStarted = false;

function playDayMusic() {
  // stoppa nattmusiken om den körs
  if (window.nightMusicInterval) {
    clearInterval(window.nightMusicInterval);
    window.nightMusicInterval = null;
  }
  // stoppa ev gammal dagmusik innan ny start
  if (window.dayMusicInterval) {
    clearInterval(window.dayMusicInterval);
    window.dayMusicInterval = null;
  }

  const dayMelody = [
    [0.3, 0, 440, 0.1, 0.3, 0.2],  // A4
    [0.3, 0, 494, 0.1, 0.2, 0.1],  // B4
    [0.3, 0, 523, 0.1, 0.2, 0.15], // C5
    [0.3, 0, 494, 0.1, 0.2, 0.1],  // B4
    [0.3, 0, 440, 0.1, 0.3, 0.2],  // A4 (längre sustain)
    [0.3, 0, 587, 0.1, 0.2, 0.1],  // D5
    [0.3, 0, 659, 0.1, 0.2, 0.15], // E5
    [0.3, 0, 587, 0.1, 0.3, 0.15], // D5 (längre sustain)
    [0.3, 0, 523, 0.1, 0.2, 0.1],  // C5
    [0.3, 0, 494, 0.1, 0.2, 0.1],  // B4
    [0.3, 0, 440, 0.1, 0.3, 0.15], // A4
    [0.3, 0, 659, 0.1, 0.2, 0.15], // E5
    [0.3, 0, 587, 0.1, 0.2, 0.1],  // D5
    [0.3, 0, 523, 0.1, 0.3, 0.15], // C5 (längre sustain)
    [0.3, 0, 494, 0.1, 0.2, 0.1],  // B4
    [0.3, 0, 440, 0.1, 0.4, 0.2]   // A4 (extra lång, leder fint in i loopen)
  ];
  let noteIndex = 0;

  // 🔹 Spela en ton varannan sekund
  window.dayMusicInterval = setInterval(() => {
    zzfx(...dayMelody[noteIndex]);
    noteIndex = (noteIndex + 1) % dayMelody.length; // loopa igenom
  }, 1000);
}


function playNightMusic() {
  // stoppa dagmusiken om den körs
  if (window.dayMusicInterval) {
    clearInterval(window.dayMusicInterval);
    window.dayMusicInterval = null;
  }
  // stoppa ev gammal nattmusik innan ny start
  if (window.nightMusicInterval) {
    clearInterval(window.nightMusicInterval);
    window.nightMusicInterval = null;
  }

  // 🔹 Mörkare melodi (A-moll känsla)
  const nightMelody = [
    [0.7, 0, 220, 0.3, 0.7, 0.25],  // A3
    [0.7, 0, 233, 0.2, 0.6, 0.2],   // Bb3 (dissonans)
    [0.7, 0, 196, 0.3, 0.8, 0.25],  // G3
    [0.7, 0, 370, 0.2, 0.6, 0.2],   // F#4 (tritonus, kusligt)
    [0.7, 0, 220, 0.25, 0.7, 0.25], // A3
    [0.7, 0, 247, 0.2, 0.6, 0.2],   // B3
    [0.7, 0, 311, 0.3, 0.7, 0.25],  // Eb4 (mörk färg)
    [0.7, 0, 196, 0.25, 0.7, 0.2]   // G3
  ];

  let noteIndex = 0;

  // 🔹 Långsammare tempo än dagmusiken
  window.nightMusicInterval = setInterval(() => {
    zzfx(...nightMelody[noteIndex]);
    noteIndex = (noteIndex + 1) % nightMelody.length;
  }, 500);
}


// =========================
// === SFX ===
// =========================
let sfxVolume = 0.1; // ändra här för alla effekter

function playJumpSound() {
  zzfx(...[sfxVolume, , 440, , 0.05, 0.2, 1, 1.5, 0, 0, 0, 0, 0.01]);
}

function playHitSound() {
  zzfx(...[sfxVolume, , 80, , 0.02, 0.05, 3, 0.5, 0, 0, 0, 0, 0.01]);
}

function playCraftSound() {
  zzfx(...[sfxVolume, , 220, , 0.1, 0.3, 1, 1, 0, 0, 0, 0, 0.02]);
}

// =========================
// === INVENTORY SYSTEM ===
// =========================
const inventorySize = 8;
let craftingMessage = null;
let inventory = {
  wood: 0,
  stone: 0
};

// varje slot = {type:"wood"/"stone", count:n} eller null


function addToInventory(type, count) {
  if (!(type in inventory)) {
    // om det är en ny resurs vi inte sett innan
    inventory[type] = 0;
  }
  inventory[type] += count;
}

function hasResources(recipe) {
  const cost = recipe.cost || {};

  if (cost.wood && inventory.wood < cost.wood) return false;
  if (cost.stone && inventory.stone < cost.stone) return false;

  return true;
}

function spendResources(recipe) {
  const cost = recipe.cost || {};

  if (cost.wood) inventory.wood -= cost.wood;
  if (cost.stone) inventory.stone -= cost.stone;
}

function refundResources(recipe) {
  const cost = recipe.cost || {};

  if (cost.wood) inventory.wood = (inventory.wood || 0) + cost.wood;
  if (cost.stone) inventory.stone = (inventory.stone || 0) + cost.stone;
}

// ================================
// === BLACK CAT ===
// ================================
let catHeight = c.height / 4;
let cat = { x: 0, y: 250, w: catHeight, h: catHeight, speed: 2, vy: 0 };

// Cat eyes blinking
let blinking = false;
let blinkCooldown = 1000 + Math.random() * 2000; // ms to next blink
let blinkDuration = 0;                          // ms left of the blink
let lastTime = 0;                               // for dt calculation


// ================================
// === MAP ===
// ================================
// (x,y,w,h)
let signs = [
  { x: 400, y: 180, text: "Press A/D to move" },
  { x: 1150, y: 180, text: "Press W to jump" },
  { x: 1650, y: 180, text: "Safe pillar" },
  { x: 4000, y: 180, text: "Press SPACE to break the stone" },
  { x: 5000, y: 180, text: "Press C to craft a bridge" },
  { x: 7500, y: 180, text: "Collect 5 blue orbs to pass" },
  { x: 10000, y: 180, text: "You made it! Congrats!" },
];

let blocks = [
  { x: 0, y: 350, w: 5000, h: 50 },   // ground
  { x: 5150, y: 350, w: 2850, h: 50 },   // ground
  { x: 8150, y: 350, w: 350, h: 50 },   // ground
  { x: 8650, y: 350, w: 350, h: 50 },   // ground
  { x: 9150, y: 350, w: 10000, h: 50 },   // ground

  // night 1
  { x: 1000, y: 280, w: 100, h: 20 },  // small platform
  { x: 1150, y: 240, w: 100, h: 20 },  // small platform
  { x: 1300, y: 200, w: 100, h: 20 },  // small platform
  { x: 1450, y: 160, w: 100, h: 20 },  // small platform
  { x: 1600, y: 140, w: 100, h: 1000 },  // small platform

  { x: 1800, y: 0, w: 20, h: 300 },  // Vertical bar

  { x: 1800, y: 280, w: 750, h: 20 },  // small platform
  { x: 1900, y: 210, w: 750, h: 20 },  // small platform
  { x: 1800, y: 140, w: 750, h: 20 },  // small platform
  { x: 1900, y: 70, w: 750, h: 20 },  // small platform
  { x: 1800, y: 0, w: 750, h: 20 },  // small platform

  { x: 2600, y: 70, w: 100, h: 1000 },  // Vertical bar

  { x: 5500, y: 280, w: 100, h: 20 },  // small platform
  { x: 5650, y: 240, w: 100, h: 20 },  // small platform
  { x: 5800, y: 200, w: 100, h: 20 },  // small platform
  { x: 5950, y: 160, w: 100, h: 20 },  // small platform
  { x: 6100, y: 120, w: 100, h: 20 },  // small platform
  { x: 6100, y: 30, w: 100, h: 20 },  // small platform
  { x: 6100, y: 280, w: 100, h: 20 },  // small platform
  { x: 6250, y: 80, w: 100, h: 20 },  // small platform
  { x: 6250, y: 160, w: 100, h: 20 },  // small platform
  { x: 6400, y: 30, w: 100, h: 20 },  // small platform
  { x: 6400, y: 120, w: 100, h: 20 },  // small platform
  { x: 6550, y: 160, w: 100, h: 20 },  // small platform
  { x: 6700, y: 200, w: 100, h: 20 },  // small platform
  { x: 6850, y: 240, w: 100, h: 20 },  // small platform
  { x: 7000, y: 280, w: 100, h: 20 },  // small platform
];

// === stopp block ===
let stopBlocks = [
  { x: 7500, y: 100, w: 50, h: 300, required: 5 },  // försvinner vid 5
  //  { x: 5000, y: 300, w: 50, h: 200, required: 10 }  // försvinner vid 10
];
// lägg till stopBlocks i blocks
stopBlocks.forEach(b => blocks.push(b));

let collectibles = [
  { x: 1580, y: 340, collected: false },
  { x: 2710, y: 340, collected: false },
  { x: 5800, y: 340, collected: false },
  { x: 6100, y: 10, collected: false },
  { x: 6300, y: 340, collected: false },
  { x: 6470, y: 10, collected: false },
  { x: 6440, y: 90, collected: false },
];

let collectedCount = 0;

// ================================
// === STONES ===
// ================================
let stones = [
  { x: 4000, y: 200, w: 100, h: 150, hp: 30 },
  { x: 8200, y: 200, w: 100, h: 150, hp: 30 },
  { x: 8700, y: 200, w: 100, h: 150, hp: 30 },
  { x: 9300, y: 200, w: 100, h: 150, hp: 30 },
];



// ================================
// === TREES (no collision) ===
// ================================
let trees = [
  // 2300 till 3500
  { x: 1500, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 3020, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 3075, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 3200, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 3500, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 3600, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 3700, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 3810, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },

  { x: 4200, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 4500, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 4600, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 4700, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },

  { x: 5200, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 5300, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 5350, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 5450, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 5550, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },

  { x: 5700, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 5790, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 5850, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },

  { x: 6150, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 6240, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 6880, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },

  { x: 7050, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 7250, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 7350, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },

  { x: 7050, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 7250, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
  { x: 7350, y: 350 - 60, w: 22, h: 60, hp: 10, maxHp: 10 },
];

// ================================
// === TRAPS ===
// ================================
let traps = [];

// ================================
// === KEYS ===
// ================================
let keys = {};
let prevKeys = {};
const keyPressed = key => keys[key] && !prevKeys[key];
const keyReleased = key => !keys[key] && prevKeys[key];
onkeydown = e => keys[e.key] = true;
onkeyup = e => keys[e.key] = false;

document.addEventListener("keydown", e => {
  if (e.code === "KeyC") {
    craftingOpen = !craftingOpen;
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (craftingQueue) {
      refundResources(craftingQueue.recipe); // få tillbaka allt
      craftingQueue = null;
    } else if (craftingOpen) {
      craftingOpen = false;
    }
  }
});
// ================================
// === MOUSE ===
// ================================

let mouse = { x: 0, y: 0 };
c.addEventListener("mousemove", e => {
  const rect = c.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

c.addEventListener("mousedown", e => {
  if (!craftingOpen) return;

  const rect = c.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const slotSize = 50;
  const spacing = 8;
  const cols = 3;
  const startX = (c.width - (cols * (slotSize + spacing) - spacing + 20)) / 2 + 10;
  const startY = (c.height - (3 * (slotSize + spacing) - spacing + 20)) / 2 + 10;

  craftingRecipes.forEach((recipe, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (slotSize + spacing);
    const y = startY + row * (slotSize + spacing);

    if (mx > x && mx < x + slotSize && my > y && my < y + slotSize) {
      if (!craftingQueue) {
        if (hasResources(recipe)) {
          console.log("has resources:", hasResources(recipe))
          console.log("Klick p!!å:", recipe.name);
          spendResources(recipe); // ta resurser direkt
          craftingQueue = { recipe: recipe, timeLeft: recipe.time };
          craftingOpen = false;
        } else {
          craftingMessage = "Not enough resources!";
          setTimeout(() => craftingMessage = null, 2000); // 2s meddelande
        }
      }
    }
  });
});

// For startMenu
c.addEventListener("mousemove", (e) => {
  const r = c.getBoundingClientRect();
  mouse.x = e.clientX - r.left;
  mouse.y = e.clientY - r.top;
});

// ================================
// === DRAW PLAYING START MENU ===
// ================================

// === START MENU EYES ===
//let mouse = { x: c.width/2, y: c.height/2 }; // följer musen på menyn
const eyeR = 60;           // ögats radie
const pupilR = 18;         // pupillens radie
const eyeOffsetX = 130;    // hur långt från mitten vänster/höger öga placeras
const eyeY = c.height / 2;   // höjd för ögonen
function drawEye(cx, cy) {
  // sclera (gul, med glow)
  ctx.save();
  ctx.shadowColor = "rgba(255, 230, 80, 0.9)";
  ctx.shadowBlur = 25;
  ctx.fillStyle = "rgb(255, 220, 60)";
  ctx.beginPath();
  ctx.arc(cx, cy, eyeR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // beräkna pupillens position mot musen (clampad i ögat)
  const dx = mouse.x - cx;
  const dy = mouse.y - cy;
  const dist = Math.hypot(dx, dy) || 1;
  const maxOffset = eyeR - pupilR - 6;
  const px = cx + (dx / dist) * Math.min(dist, maxOffset);
  const py = cy + (dy / dist) * Math.min(dist, maxOffset);

  // pupill (svart)
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(px, py, pupilR, 0, Math.PI * 2);
  ctx.fill();

  // liten highlight på pupillen
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.arc(px - pupilR * 0.4, py - pupilR * 0.4, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawStartMenu() {
  // svart bakgrund
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, c.width, c.height);

  // ögon
  const cx = c.width / 2;
  drawEye(cx - eyeOffsetX, eyeY);
  drawEye(cx + eyeOffsetX, eyeY);

  // titel
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "red";
  ctx.font = "36px monospace";
  ctx.shadowColor = "rgba(255,0,0,0.35)";
  ctx.shadowBlur = 10;
  ctx.fillText("Run from the black cat", c.width / 2, eyeY - eyeR - 50);

  // rita
  ctx.font = "18px monospace"; // sätt fonten först!
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.shadowBlur = 0;

  const ClickToStartText = "Click to Start";
  const ClickToStartTextWidth = ctx.measureText(ClickToStartText).width;

  const ClickToStartTextX = 800 - 180;
  const ClickToStartTextY = c.height - 20;

  // check hover
  const ClickToStartTextHovering =
    mouse.x >= ClickToStartTextX &&
    mouse.x <= ClickToStartTextX + ClickToStartTextWidth &&
    mouse.y >= ClickToStartTextY - 24 &&
    mouse.y <= ClickToStartTextY;

  ctx.fillStyle = ClickToStartTextHovering ? "yellow" : "white";
  ctx.fillText(ClickToStartText, ClickToStartTextX, ClickToStartTextY);



  // kolla klick
  c.addEventListener("click", e => {
    if (gameState === "startMenu") {
      const mx = e.offsetX;
      const my = e.offsetY;
      // Klick på "Click to Start"
      if (ClickToStartTextHovering) {
        if (zzfxX.state === "suspended") {
          zzfxX.resume(); // musik
        }
        playDayMusic();
        gameState = "playing";
      }
    }
  });
}

function drawSigns() {
  ctx.font = "16px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";

  for (let s of signs) {
    // 🔄 Välj färg beroende på dag/natt
    ctx.fillStyle = day ? "black" : "white";
    ctx.fillText(s.text, s.x - camX, s.y - 10);
  }
}

// ================================
// === DRAW WIN BLOCKS ===
// ================================
function drawWin() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.fillStyle = "yellow";
  ctx.font = "40px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("YOU WIN!", c.width / 2, c.height / 2);

  ctx.font = "20px monospace";
  ctx.fillText("Press F5 to restart", c.width / 2, c.height / 2 + 50);
}

// ================================
// === DRAW PLAYING GAMESTATE ===
// ================================

// Ritas i din drawUI eller där du ritar HUD-element
function drawOrbCount() {
  if (collectedCount <= 0) return; // Rita inget om man inte har några orbs

  ctx.font = "20px monospace";
  ctx.fillStyle = "cyan";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  // Sätt position precis under timern (t.ex. 30px nedanför)
  const x = 20;
  const y = 60; // justera beroende på var timern sitter

  ctx.fillText(`Blue Orbs: ${collectedCount}`, x, y);
}

function drawCrafting() {
  if (!craftingOpen) return;

  const slotSize = 50;
  const spacing = 8;
  const cols = 3;
  const rows = 3;
  const panelWidth = cols * (slotSize + spacing) - spacing + 20;
  const panelHeight = rows * (slotSize + spacing) - spacing + 20;
  const startX = (c.width - panelWidth) / 2;
  const startY = (c.height - panelHeight) / 2;

  // bakgrundspanel
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(startX, startY, panelWidth, panelHeight);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "12px Arial";

  craftingRecipes.forEach((recipe, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + 10 + col * (slotSize + spacing);
    const y = startY + 10 + row * (slotSize + spacing);

    // ruta
    ctx.fillStyle = "rgba(60,60,60,0.9)";
    ctx.fillRect(x, y, slotSize, slotSize);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(x, y, slotSize, slotSize);

    // namn
    ctx.fillStyle = "#fff";
    ctx.fillText(recipe.name, x + slotSize / 2, y + slotSize / 2);
  });

  // Tooltip (om musen är över)
  const mx = mouse.x;
  const my = mouse.y;
  craftingRecipes.forEach((recipe, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + 10 + col * (slotSize + spacing);
    const y = startY + 10 + row * (slotSize + spacing);

    if (mx > x && mx < x + slotSize && my > y && my < y + slotSize) {
      const costText = Object.entries(recipe.cost)
        .filter(([k, v]) => v > 0)
        .map(([k, v]) => `${v} ${k}`)
        .join(", ");

      const tooltip = costText + (costText ? ", " : "") + `${recipe.time}s`;

      const tw = ctx.measureText(tooltip).width + 10;
      const th = 20;
      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.fillRect(mx + 10, my + 10, tw, th);
      ctx.fillStyle = "#fff";
      ctx.fillText(tooltip, mx + 10 + tw / 2, my + 10 + th / 2);
    }

  });
}

function drawCraftingProgress() {
  if (craftingQueue) {
    const barWidth = 200;
    const barHeight = 20;
    const x = (c.width - barWidth) / 2;
    const y = c.height - 60;

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = "lime";
    const progress = 1 - (craftingQueue.timeLeft / craftingQueue.recipe.time);
    ctx.fillRect(x, y, barWidth * progress, barHeight);
  }

  if (craftingQueue) {
    const barWidth = 200;
    const barHeight = 20;
    const x = (c.width - barWidth) / 2;
    const y = c.height - 60;

    const progress = (craftingQueue.recipe.time - craftingQueue.timeLeft) / craftingQueue.recipe.time;

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "lime";
    ctx.fillRect(x, y, barWidth * progress, barHeight);

    ctx.strokeStyle = "#fff";
    ctx.strokeRect(x, y, barWidth, barHeight);

    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(craftingQueue.recipe.name + " (" + craftingQueue.recipe.time + "s)", x + barWidth / 2, y - 5);
  }
}

function drawTraps() {
  for (let t of traps) {
    if (t.active) {
      ctx.fillStyle = "orange";
      ctx.fillRect(t.x - camX, t.y, t.w, t.h);
    }
  }
}

function drawInventory() {
  // kolla om allt är 0
  if (Object.values(inventory).every(amount => amount === 0)) return;

  const slotSize = 40;
  const spacing = 6;

  // 🔥 Bara keys som har mer än 0
  const keys = Object.keys(inventory).filter(key => inventory[key] > 0);

  const totalWidth = keys.length * (slotSize + spacing) - spacing;
  const startX = (c.width - totalWidth) / 2;
  const y = c.height - slotSize - 10;

  ctx.font = "14px Arial";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";

  keys.forEach((key, i) => {
    const x = startX + i * (slotSize + spacing);

    // ruta
    ctx.fillStyle = "rgba(50,50,50,0.7)";
    ctx.fillRect(x, y, slotSize, slotSize);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(x, y, slotSize, slotSize);

    // ikon
    if (key === "wood") {
      ctx.fillStyle = "#8B4513"; // brun
      ctx.fillRect(x + 10, y + 10, 20, 20);
    } else if (key === "stone") {
      ctx.fillStyle = "#777"; // grå
      ctx.fillRect(x + 10, y + 10, 20, 20);
    }

    // antal
    ctx.fillStyle = "#fff";
    ctx.fillText(inventory[key], x + slotSize - 3, y + slotSize - 3);
  });
}

function drawCollectibles() {
  collectibles.forEach(c => {
    if (!c.collected) {
      ctx.fillStyle = "blue";
      ctx.beginPath();
      ctx.arc(c.x - camX, c.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawTrees() {
  for (const t of trees) {
    // trunk
    ctx.fillStyle = day ? "#5e2b08ff" : "#555";     // brun på dagen, grå på natten
    ctx.fillRect(t.x - camX, t.y, t.w, t.h);

    // krona (en enkel grön boll/ellips ovanför stammen)
    const cx = t.x - camX + t.w / 2;
    const cy = t.y - 10; // lite ovanför stammen
    ctx.fillStyle = day ? "#2e8b57" : "#444";     // grön / mörkgrå
    ctx.beginPath();
    ctx.ellipse(cx, cy, t.w * 1.4, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // liten HP-indikator (diskret)
    if (t.hp < t.maxHp && t.hp > 0) {
      const bw = t.w;           // bar width
      const bh = 3;
      const bx = t.x - camX;
      const by = t.y - 6;
      ctx.fillStyle = "#333";
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = "#4caf50";
      ctx.fillRect(bx, by, bw * (t.hp / t.maxHp), bh);
      ctx.strokeStyle = "#000";
      ctx.strokeRect(bx, by, bw, bh);
    }
  }
}

function drawCat() {
  // Day
  if (day === true) {
    ctx.fillStyle = "black";
    ctx.fillRect(cat.x - camX, cat.y, cat.w, cat.h);

    ctx.fillStyle = "white";
    ctx.font = "16px monospace";
    ctx.fillText("Zzz", cat.x - camX + 20, cat.y - 10);

    // Night
  } else {
    ctx.fillStyle = "black";
    ctx.fillRect(cat.x - camX, cat.y, cat.w, cat.h - 10);

    if (!blinking) {
      // ögon relativt kattens storlek
      let eyeY = cat.y + cat.h / 2 - 20;
      let eyeX1 = cat.x - camX + cat.w * 0.3;
      let eyeX2 = cat.x - camX + cat.w * 0.7;
      let eyeR = cat.h * 0.20;  // ögonradie ~15% av kattens höjd
      let pupilR = eyeR * 0.4;

      ctx.fillStyle = "yellow";
      ctx.beginPath();
      ctx.arc(eyeX1, eyeY, eyeR, 0, Math.PI * 2);
      ctx.arc(eyeX2, eyeY, eyeR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(eyeX1, eyeY, pupilR, 0, Math.PI * 2);
      ctx.arc(eyeX2, eyeY, pupilR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

}

function drawPlayer() {
  ctx.fillStyle = "lime";
  ctx.fillRect(player.x - camX, player.y, player.w, player.h);

  if (craftingQueue) {
    ctx.fillStyle = "yellow";
    ctx.fillRect(player.x - camX, player.y - 10, player.w, 5); // liten gul stapel ovanför
  }
}

function drawBackground() {
  let gradient;

  if (day) {
    // 🌞 Dag-himmel
    gradient = ctx.createLinearGradient(0, 0, 0, c.height);
    gradient.addColorStop(0, "#87CEEB"); // ljusblå upptill
    gradient.addColorStop(1, "#ffffff"); // vit nedtill
  } else {
    // 🌙 Natt-himmel
    gradient = ctx.createLinearGradient(0, 0, 0, c.height);
    gradient.addColorStop(0, "#0a0a4bff"); // mörkblå upptill
    gradient.addColorStop(1, "#000000"); // svart nedtill
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, c.width, c.height);
}

function drawPlattform() {
  ctx.fillStyle = day ? "#8B4513" : "#303030ff";
  for (let b of blocks) {
    ctx.fillRect(b.x - camX, b.y, b.w, b.h);
  }

  // stones
  ctx.fillStyle = "gray";
  for (let s of stones) {
    // Om maxHp inte finns, sätt det till s.hp (första gången vi ritar stenen)
    if (!s.maxHp) s.maxHp = s.hp;

    // Rita själva stenen
    ctx.fillRect(s.x - camX, s.y, s.w, s.h);

    // === HP BAR ===
    const maxBarWidth = 40; // Alltid samma längd
    const hpPercent = Math.max(0, s.hp / s.maxHp); // Procent

    const barX = s.x - camX + (s.w / 2) - (maxBarWidth / 2);
    const barY = s.y - 8;

    // Bakgrund
    ctx.fillStyle = "darkred";
    ctx.fillRect(barX, barY, maxBarWidth, 4);

    // Fyllnad
    ctx.fillStyle = "red";
    ctx.fillRect(barX, barY, maxBarWidth * hpPercent, 4);

    // Outline
    ctx.strokeStyle = "black";
    ctx.strokeRect(barX, barY, maxBarWidth, 4);

    ctx.fillStyle = "gray";
  }

}

function drawUI() {
  // Timer and day/night text
  ctx.fillStyle = "white";
  ctx.font = "14px monospace";
  ctx.fillText(day ? "DAY" : "NIGHT", 10, 20);
  ctx.fillText("Timer: " + Math.ceil(timer / 1000), 10, 40);
}

// ================================
// === DRAW GAMEOVER GAMESTATE ===
// ================================
function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.fillStyle = "red";
  ctx.font = "30px monospace";
  ctx.fillText("GAME OVER", c.width / 2 - 80, c.height / 2);

  ctx.fillStyle = "white";
  ctx.font = "16px monospace";
  ctx.fillText("Press F5 to restart", c.width / 2 - 100, c.height / 2 + 30);
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y;
}


// ================================
// === LOOP ===
// ================================
function loop() {
  requestAnimationFrame(loop);



  // start menu state
  if (gameState === "startMenu") {
    drawStartMenu();
  }

  // Game over state
  if (gameState === "gameOver") {
    drawGameOver();
  }
  // Game over state
  if (gameState === "win") {
    drawWin();
  }

  // Playing state
  if (gameState === "playing") {
    // timer
    timer -= 16;
    if (timer <= 0) {
      day = !day;
      timer = day ? dayLength : nightLength;
      if (day) {
        playDayMusic();
      } else {
        playNightMusic();
      }
    }

    // Kolla om spelaren ramlat ner eller hamnat för långt åt höger
    if (player.y > c.height + 200 || player.x > c.width + camX + 200) {
      gameState = "gameOver";
    }

    if (interactCooldown > 0) interactCooldown -= 16;

    // ---- INPUT (WASD) ----

    let dx = 0;
    if (!craftingQueue) {
      if (keys["a"]) dx -= speed;
      if (keys["d"]) dx += speed;
      if (keyPressed("w") && player.onGround) {
        playJumpSound();
        player.vy = -7.5;
        player.onGround = false;
      }

    }



    // Samla alla kollisioner som påverkar spelaren
    const colliders = blocks.concat(stones); // förutsätter att du har stones[]

    // physics + collisions (player)
    player.vy += gravity;
    player.y += player.vy;
    player.onGround = false;

    // Vertikal kollision
    for (let b of blocks) {
      if (player.x < b.x + b.w && player.x + player.w > b.x &&
        player.y < b.y + b.h && player.y + player.h > b.y) {

        // Om spelaren rör sig neråt (landar ovanpå block)
        if (player.vy > 0 && player.y + player.h > b.y && player.y < b.y) {
          player.y = b.y - player.h; // Placera ovanpå block
          player.vy = 0;
          player.onGround = true;
        }
        // Om spelaren rör sig uppåt (träffar block underifrån)
        else if (player.vy < 0 && player.y < b.y + b.h && player.y + player.h > b.y + b.h) {
          player.y = b.y + b.h; // Placera under block
          player.vy = 0; // Stoppa hoppet
        }
      }
    }

    // ---- HORIZONTAL PASS ----
    player.x += dx;
    for (const s of colliders) {
      if (player.x < s.x + s.w &&
        player.x + player.w > s.x &&
        player.y < s.y + s.h &&
        player.y + player.h > s.y) {
        // Sidokrock: skjuts ut åt sidan, men VY lämnas orörd (fortsätter falla)
        if (dx > 0) player.x = s.x - player.w;       // krock från vänster
        else if (dx < 0) player.x = s.x + s.w;       // krock från höger
      }
    }

    // ---- VERTICAL PASS ----
    player.vy += gravity;
    player.y += player.vy;
    player.onGround = false; // blir true ENDAST vid landning från ovan

    for (const s of colliders) {
      if (player.x < s.x + s.w &&
        player.x + player.w > s.x &&
        player.y < s.y + s.h &&
        player.y + player.h > s.y) {
        if (player.vy > 0) {
          // Landar ovanpå
          player.y = s.y - player.h;
          player.vy = 0;
          player.onGround = true;
        } else if (player.vy < 0) {
          // Slår i underkant
          player.y = s.y + s.h;
          player.vy = 0;
        }
      }
    }


    // ==== INTERACT WITH WORLD (SPACE) ====
    // "Hugga" = slå på objekt i närheten; träden saknar kollision.
    if (keys[" "] && interactCooldown <= 0) {
      const reach = 12; // hur nära man måste vara
      const hitOnce = () => { interactCooldown = 200; }; // ~200ms mellan slag

      let didHit = false;

      // 1) STONES (om du har stones-array med hp)
      if (typeof stones !== "undefined") {
        for (const s of stones) {
          // närhets-AABB (lite generös)
          if (player.x + player.w > s.x - reach &&
            player.x < s.x + s.w + reach &&
            player.y + player.h > s.y - reach &&
            player.y < s.y + s.h + reach) {
            if (s.hp > 0) {
              playHitSound();
              s.hp = s.hp - stoneDamage;
              s.hitCooldown = 10; // valfritt: liten visuell feedback du ev. redan använder
              didHit = true;
              if (s.hp <= 0) {
                console.log('added to inventory')
                addToInventory("stone", 3); // t.ex. 3 stenar per sten
              }
              break; // slå bara en sak per knapptryck
            }

          }
        }
        // rensa bort sönder-slagna stenar
        stones = stones.filter(s => s.hp > 0);
      }

      // 2) TREES
      if (!didHit) {
        for (const t of trees) {
          if (player.x + player.w > t.x - reach &&
            player.x < t.x + t.w + reach &&
            player.y + player.h > t.y - reach &&
            player.y < t.y + t.h + reach) {
            if (t.hp > 0) {
              playHitSound();
              t.hp = t.hp - woodDamage;
              didHit = true;
              if (t.hp <= 0) {
                console.log('added to inventory')
                addToInventory("wood", 1); // t.ex. 1 trä per träd
              }
              break;
            }

          }
        }
        // ta bort fällda träd (när hp når 0)
        trees = trees.filter(t => t.hp > 0);
      }

      if (didHit) {
        hitOnce();
      }

      // kräver “tryck/släpp” för nästa slag (kan du ta bort om du vill hålla inne)
      keys[" "] = false;
    }

    // cooldown för stenar
    for (let s of stones) {
      if (s.hitCooldown) s.hitCooldown--;
    }

    // ta bort döda stenar
    stones = stones.filter(s => s.hp > 0);

    // Night
    if (day === false) {

      //////////////////
      // Cat

      // Cat movement
      // Cat vs traps
      for (let t of traps) {
        if (t.active &&
          cat.x < t.x + t.w &&
          cat.x + cat.w > t.x &&
          cat.y < t.y + t.h &&
          cat.y + cat.h > t.y) {
          t.active = false;                // fällan används upp
          cat.stunnedUntil = Date.now() + 10000; // katten stannar i 3 sek
        }
      }
      // Se till att katten har vx
      if (cat.vx === undefined) cat.vx = 0;

      // Kattens AI
      if (!(cat.stunnedUntil && Date.now() < cat.stunnedUntil)) {
        const catCenterX = cat.x + cat.w / 2;
        const playerCenterX = player.x + player.w / 2;

        // Rörelse på marken
        if (cat.onGround) {
          if (catCenterX < playerCenterX - 5) {
            cat.x += cat.speed;
          } else if (catCenterX > playerCenterX + 5) {
            cat.x -= cat.speed;
          }

          // Hopplogik
          const horizontalDistance = Math.abs(catCenterX - playerCenterX);
          const verticalDifference = player.y - cat.y;

          if (
            horizontalDistance < 150 && // nära horisontellt
            verticalDifference < -50    // spelaren ovanför
          ) {
            cat.vy = -15;
            cat.vx = (playerCenterX > catCenterX) ? 4 : -4; // fart åt rätt håll
            cat.onGround = false;
          }
        }
      }

      // Om katten är i luften
      if (!cat.onGround) {
        cat.x += cat.vx; // rörelse i luften
      }

      // Gravitation
      cat.vy += gravity;
      cat.y += cat.vy;

      // Håll katten på marknivå
      const groundLevel = c.height - 40; // Markens Y-position
      if (cat.y + cat.h > groundLevel) {
        cat.y = groundLevel - cat.h; // Sätt katten på marken
        cat.vy = 0;                  // Stoppa fall
        cat.vx = 0;                  // Nollställ horisontell fart efter hopp
        cat.onGround = true;
      } else {
        cat.onGround = false;
      }




      // Cat blinking
      if (blinking) {
        blinkDuration -= 30;
        if (blinkDuration <= 0) {
          blinking = false;
          blinkCooldown = 1500 + Math.random() * 2000; // ny paus till nästa blink
        }
      } else {
        blinkCooldown -= 10;
        if (blinkCooldown <= 0) {
          blinking = true;
          blinkDuration = 180;
        }
      }

      // Cat + player collision (GameOver)
      if (player.x < cat.x + cat.w &&
        player.x + player.w > cat.x &&
        player.y < cat.y + cat.h &&
        player.y + player.h > cat.y) {
        gameState = "gameOver";
      }
    }

    // Day
    if (day === true) {
      // Cat
      blinking = false;
      blinkDuration = 0;
    }

    // camera logic
    camX = player.x - c.width / 2;
    if (camX < 0) camX = 0;

    /*
      { name: "Axe", cost: { wood: 3, stone: 0 }, time: 3 },
  { name: "Pick Axe", cost: { wood: 5, stone: 0 }, time: 5 },
  { name: "Trap", cost: { wood: 2, stone: 0 }, time: 5 },
  { name: "Axe +1", cost: { wood: 10, stone: 1 }, time: 1 },
  { name: "Pick Axe +1", cost: { wood: 4, stone: 4 }, time: 10 },
  { name: "Bridge", cost: { wood: 5, stone: 0 }, time: 2 },
  { name: "Axe +2", cost: { wood: 20, stone: 5 }, time: 6 },
  { name: "Pick Axe +2", cost: { wood: 3, stone: 3 }, time: 8 },
  { name: "Trap +2", cost: { wood: 8, stone: 0 }, time: 2 }
*/
    if (craftingQueue) {
      playCraftSound();
      craftingQueue.timeLeft -= 1 / 60; // om loopen körs 60fps
      if (craftingQueue.timeLeft <= 0) {

        console.log("klar:", craftingQueue.recipe.name);
        if (craftingQueue.recipe.name === "Axe") {
          woodDamage = 5;
        }
        if (craftingQueue.recipe.name === "Pick Axe") {
          stoneDamage = 5;
        }

        // 🟢 Nytt: Om man bygger en bro, lägg till block
        if (craftingQueue.recipe.name === "Bridge") {
          // Lägg blocket precis framför spelaren
          blocks.push({
            x: player.x + player.w + 10, // lite framför
            y: player.y + player.h - 10,      // lite ovanför marken
            w: 100,
            h: 20
          });
        }

        // 🟢 Bygg fälla
        if (craftingQueue.recipe.name === "Trap") {
          traps.push({
            x: player.x,
            y: c.height - 60, // på marknivå
            w: 15,
            h: 15,
            active: true
          });
        }

        // ge spelaren saken (lägg till i inventory)
        let name = craftingQueue.recipe.name.toLowerCase();
        inventory[name] = (inventory[name] || 0) + 1;

        craftingQueue = null; // klart
      }
    }

    // draw background
    drawBackground();

    // draw ground
    drawPlattform();

    drawTrees();

    drawCollectibles();

    drawCat();

    drawPlayer();

    drawTraps();

    // UI
    drawUI();

    drawInventory();

    drawCrafting();

    drawCraftingProgress();

    drawOrbCount();

    drawSigns();

    // I din loop, efter att spelaren rört sig
    if (player.x >= 10000) {
      gameState = "win";
    }

    collectibles.forEach(c => {
      if (!c.collected &&
        player.x < c.x + 10 && player.x + player.w > c.x - 10 &&
        player.y < c.y + 10 && player.y + player.h > c.y - 10) {
        c.collected = true;
        collectedCount++;
        console.log("Collected:", collectedCount);

        stopBlocks.forEach(block => {
          if (collectedCount >= block.required) {
            // ta bort blocket från blocks[]
            blocks = blocks.filter(b => b !== block);
          }
        });
      }
    });

    if (craftingMessage) {
      ctx.fillStyle = "red";
      ctx.font = "20px Arial";
      ctx.fillText(craftingMessage, c.width / 2 - 80, c.height / 2 - 100);
    }
  }
  prevKeys = { ...keys }; // spara tidigare key state
}

// ================================
// === START ===
// ================================
loop();
