// ================================
// === INIT ===
// ================================
const c = document.getElementById("c");
const ctx = c.getContext("2d");
c.width = 800;
c.height = 400;

// ================================
// === GAME STATE ===
// ================================
let day = true;
let timer = 10000;        // Start timer
let dayLength = 10000;
let nightLength = 20000;

let gravity = 0.3;
let camX = 0;
let gameState = "playing"; // "startMenu", "playing", "upgradeMenu", "gameOver", "win"
const maxDistance = 5000;

let craftingOpen = false;
let craftingRecipes = [
  { name: "Trap", cost: { wood: 3, stone: 1 } },
  { name: "Wall", cost: { wood: 5, stone: 0 } },
  { name: "Bridge", cost: { wood: 2, stone: 2 } },
  { name: "Torch", cost: { wood: 1, stone: 0 } },
  { name: "Cat Repeller", cost: { wood: 4, stone: 4 } },
  { name: "Door", cost: { wood: 2, stone: 1 } },
  { name: "Chest", cost: { wood: 6, stone: 0 } },
  { name: "Tower", cost: { wood: 3, stone: 3 } },
  { name: "Spike Pit", cost: { wood: 0, stone: 5 } }
];


// ================================
// === PLAYER ===
// ================================
let player = {
  x:200,
   y:300,
   w:20,
   h:20,
   vy:0,
   onGround:false
};

let interactCooldown = 0; // ms-ish i din nuvarande 16ms-loop

// =========================
// === INVENTORY SYSTEM ===
// =========================
const inventorySize = 8;
let inventory = Array(inventorySize).fill(null); 
// varje slot = {type:"wood"/"stone", count:n} eller null


function addToInventory(type, count) {
  // kolla om typen redan finns i en slot
  for (let i = 0; i < inventory.length; i++) {
    if (inventory[i] && inventory[i].type === type) {
      inventory[i].count += count;
      return;
    }
  }
  // annars lägg i första tomma slot
  for (let i = 0; i < inventory.length; i++) {
    if (inventory[i] === null) {
      inventory[i] = { type, count };
      return;
    }
  }
  // om fullt → loot försvinner (kan göra drop på marken senare om du vill)
}

// ================================
// === BLACK CAT ===
// ================================
let catHeight = c.height / 4;
let cat = {x:0, y:250, w:catHeight, h:catHeight, speed:1, vy:0};

// Cat eyes blinking
let blinking = false;
let blinkCooldown = 1000 + Math.random()*2000; // ms to next blink
let blinkDuration = 0;                          // ms left of the blink
let lastTime = 0;                               // for dt calculation


// ================================
// === MAP ===
// ================================
// (x,y,w,h)
let blocks = [
  {x:0, y:350, w:20000, h:50},   // ground
  {x:300, y:300, w:100, h:20},  // small platform
  {x:500, y:250, w:100, h:20},  // higher platform
  {x:800, y:300, w:150, h:20},  // another platform
  {x:1200, y:300, w:100, h:20},  // another platform
  {x:2200, y:250, w:50, h:20},  // another platform
  {x:2200, y:250, w:150, h:20},  // another platform
];

// ================================
// === STONES ===
// ================================
let stones = [
  {x:800, y:250, w:100, h:100, hp:5},
  {x:1200, y:280, w:80, h:70, hp:5}
];

// ================================
// === TREES (no collision) ===
// ================================
let trees = [
  // trunk-höjd 60 => topp på marken (markens topp = y:350)
  { x: 600,  y: 350-60, w: 22, h: 60, hp: 5, maxHp: 5 },
  { x: 950,  y: 350-60, w: 22, h: 60, hp: 5, maxHp: 5 },
  { x: 1350, y: 350-60, w: 22, h: 60, hp: 5, maxHp: 5 },
];

// ================================
// === TRAPS ===
// ================================
let traps = [];

// ================================
// === KEYS ===
// ================================
let keys = {};
onkeydown = e => keys[e.key] = true;
onkeyup   = e => keys[e.key] = false;

document.addEventListener("keydown", e => {
  if (day && e.key === "f") {
    // lägg fälla på spelarens position (på marken)
    traps.push({ x: player.x, y: c.height - 60, w: 15, h: 15, active: true });
  }
});

document.addEventListener("keydown", e => {
  if (e.code === "KeyC") {
    craftingOpen = !craftingOpen;
  }
});

// ================================
// === MOUSE ===
// ================================

let mouse = {x:0,y:0};
c.addEventListener("mousemove", e => {
  const rect = c.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});


// ================================
// === DRAW PLAYING GAMESTATE ===
// ================================
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
      const tooltip = Object.entries(recipe.cost)
        .filter(([k, v]) => v > 0)
        .map(([k, v]) => `${v} ${k}`)
        .join(", ");
      const tw = ctx.measureText(tooltip).width + 10;
      const th = 20;
      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.fillRect(mx + 10, my + 10, tw, th);
      ctx.fillStyle = "#fff";
      ctx.fillText(tooltip, mx + 10 + tw / 2, my + 10 + th / 2);
    }
  });
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
  // kolla om allt är tomt
  if (inventory.every(slot => slot === null)) return; 

  const slotSize = 40;
  const spacing = 6;
  const totalWidth = inventorySize * (slotSize + spacing) - spacing;
  const startX = (c.width - totalWidth) / 2; 
  const y = c.height - slotSize - 10;

  ctx.font = "14px Arial";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";

  for (let i = 0; i < inventorySize; i++) {
    const x = startX + i * (slotSize + spacing);

    // ruta
    ctx.fillStyle = "rgba(50,50,50,0.7)";
    ctx.fillRect(x, y, slotSize, slotSize);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(x, y, slotSize, slotSize);

    // innehåll
    const item = inventory[i];
    if (item) {
      if (item.type === "wood") {
        ctx.fillStyle = "#8B4513"; // brun för trä
        ctx.fillRect(x + 10, y + 10, 20, 20);
      } else if (item.type === "stone") {
        ctx.fillStyle = "#777"; // grå för sten
        ctx.fillRect(x + 10, y + 10, 20, 20);
      }
      // antal
      ctx.fillStyle = "#fff";
      ctx.fillText(item.count, x + slotSize - 3, y + slotSize - 3);
    }
  }
}



function drawTrees() {
  for (const t of trees) {
    // trunk
    ctx.fillStyle = day ? "#8B4513" : "#555";     // brun på dagen, grå på natten
    ctx.fillRect(t.x - camX, t.y, t.w, t.h);

    // krona (en enkel grön boll/ellips ovanför stammen)
    const cx = t.x - camX + t.w/2;
    const cy = t.y - 10; // lite ovanför stammen
    ctx.fillStyle = day ? "#2e8b57" : "#444";     // grön / mörkgrå
    ctx.beginPath();
    ctx.ellipse(cx, cy, t.w*1.4, 18, 0, 0, Math.PI*2);
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
    ctx.font = "16px sans-serif";
    ctx.fillText("Zzz", cat.x - camX, cat.y - 10);

  // Night
  } else {
    ctx.fillStyle = "black";
    ctx.fillRect(cat.x - camX, cat.y, cat.w, cat.h);
    
    if (!blinking) {
      // ögon relativt kattens storlek
      let eyeY = cat.y + cat.h/2 - 20;
      let eyeX1 = cat.x - camX + cat.w*0.3;
      let eyeX2 = cat.x - camX + cat.w*0.7;
      let eyeR  = cat.h*0.20;  // ögonradie ~15% av kattens höjd
      let pupilR = eyeR * 0.4;

      ctx.fillStyle = "yellow";
      ctx.beginPath();
      ctx.arc(eyeX1, eyeY, eyeR, 0, Math.PI*2);
      ctx.arc(eyeX2, eyeY, eyeR, 0, Math.PI*2);
      ctx.fill();

      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(eyeX1, eyeY, pupilR, 0, Math.PI*2);
      ctx.arc(eyeX2, eyeY, pupilR, 0, Math.PI*2);
      ctx.fill();
    }
}

}

function drawPlayer() {
  ctx.fillStyle = "lime";
  ctx.fillRect(player.x - camX, player.y, player.w, player.h);
}

function drawBackground() {
  ctx.fillStyle = day ? "#88d" : "#000";
  ctx.fillRect(0,0,c.width,c.height);
}

function drawPlattform() {
  ctx.fillStyle = day ? "#8B4513" : "#303030ff"; 
  for (let b of blocks) {
    ctx.fillRect(b.x - camX, b.y, b.w, b.h);
  }

  // stones
  ctx.fillStyle = "gray";
  for (let s of stones) {
    ctx.fillRect(s.x - camX, s.y, s.w, s.h);
    // hp bar ovanpå stenen
    ctx.fillStyle = "red";
    ctx.fillRect(s.x - camX, s.y-5, (s.w)*(s.hp/5), 3);
    ctx.fillStyle = "gray";
  }


}

function drawUI() {
  // Timer and day/night text
  ctx.fillStyle = "white";
  ctx.font = "14px sans-serif";
  ctx.fillText(day ? "DAY" : "NIGHT", 10, 20);
  ctx.fillText("Timer: " + Math.ceil(timer/1000), 10, 40);

  // Progress bar
  let playerProgress = Math.min(player.x / maxDistance, 1);
  let catProgress = Math.min(cat.x / maxDistance, 1);
  // backgrund
  ctx.fillStyle = "#333";
  ctx.fillRect(20, 20, c.width - 40, 10);
  // player (green)
  ctx.fillStyle = "lime";
  ctx.fillRect(20, 20, (c.width - 40) * playerProgress, 10);
  // cat (red, narrower on top)
  ctx.fillStyle = "red";
  ctx.fillRect(20, 20, (c.width - 40) * catProgress, 10);
  // frame
  ctx.strokeStyle = "white";
  ctx.strokeRect(20, 20, c.width - 40, 10);
}

// ================================
// === DRAW GAMEOVER GAMESTATE ===
// ================================
function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0,0,c.width,c.height);

  ctx.fillStyle = "red";
  ctx.font = "30px sans-serif";
  ctx.fillText("GAME OVER", c.width/2 - 80, c.height/2);

  ctx.fillStyle = "white";
  ctx.font = "16px sans-serif";
  ctx.fillText("Press F5 to restart", c.width/2 - 100, c.height/2 + 30);
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

  // Game over state
  if (gameState === "gameOver") {
    drawGameOver();
  }

  // Playing state
  if (gameState === "playing") {
    requestAnimationFrame(loop);
    
      // timer
    timer -= 16;
    if (timer <= 0) {
      day = !day;
      timer = day ? dayLength : nightLength;
    }

    if (interactCooldown > 0) interactCooldown -= 16;

    // ---- INPUT (WASD) ----
    const speed = 2;
    let dx = 0;
    if (keys["a"]) dx -= speed;
    if (keys["d"]) dx += speed;
    if (keys["w"] && player.onGround) {
      player.vy = -8;
      player.onGround = false;
    }

    // Samla alla kollisioner som påverkar spelaren
    const colliders = blocks.concat(stones); // förutsätter att du har stones[]

    // physics + collisions (player)
    player.vy += gravity;
    player.y += player.vy;
    player.onGround = false;
    for (let b of blocks) {
      if (player.x < b.x+b.w && player.x+player.w > b.x &&
          player.y < b.y+b.h && player.y+player.h > b.y) {
        // kollision ovanpå block
        if (player.vy > 0) {
          player.y = b.y - player.h;
          player.vy = 0;
          player.onGround = true;
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
          s.hp--;
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
          t.hp--;
          didHit = true;
          if (t.hp <= 0) {
            console.log('added to inventory')
            addToInventory("wood", 5); // t.ex. 5 trä per träd
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
    cat.stunnedUntil = Date.now() + 3000; // katten stannar i 3 sek
  }
}

// stoppa katten om stunned
if (cat.stunnedUntil && Date.now() < cat.stunnedUntil) {
  // katten rör sig inte
} else {
  cat.x += cat.speed;
}

      // Cat blinking
      if (blinking) {
        blinkDuration -= 30;
        if (blinkDuration <= 0) {
          blinking = false;
          blinkCooldown = 1500 + Math.random()*2000; // ny paus till nästa blink
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
    camX = player.x - c.width/2;
    if (camX < 0) camX = 0;

    // draw background
    drawBackground();

    // draw ground
    drawPlattform();

    drawTrees(); 

    drawCat();

    drawPlayer();

    drawTraps();

    // UI
    drawUI();

    drawInventory();

    drawCrafting();
  }
}

// ================================
// === START ===
// ================================
loop();
