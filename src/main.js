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

let gravity = 0.5;
let camX = 0;
let gameState = "playing"; // "startMenu", "playing", "upgradeMenu", "gameOver", "win"
const maxDistance = 5000;

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

// ================================
// === DRAW PLAYING GAMESTATE ===
// ================================
function drawTraps() {
  for (let t of traps) {
    if (t.active) {
      ctx.fillStyle = "orange";
      ctx.fillRect(t.x - camX, t.y, t.w, t.h);
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


    // --- Interaction (space) ---
  if(keys[" "]) {
    for (let s of stones) {
      if (
        player.x + player.w > s.x - 10 &&
        player.x < s.x + s.w + 10 &&
        player.y + player.h > s.y - 10 &&
        player.y < s.y + s.h + 10
      ) {
        if (!s.hitCooldown) {
          s.hp--;
          s.hitCooldown = 10; // frames delay så man inte spammar för snabbt
        }
      }
    }
    keys[" "] = false; // gör så att man måste släppa och trycka igen
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

    drawCat();

    drawPlayer();

    drawTraps();

    // UI
    drawUI();
  }
}

// ================================
// === START ===
// ================================
loop();
