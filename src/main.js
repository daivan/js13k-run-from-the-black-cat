// ================================
// === INIT ===
// ================================
const c = document.getElementById("c");
const ctx = c.getContext("2d");
c.width = 800;
c.height = 400;

let keys = {};
onkeydown = e => keys[e.key] = true;
onkeyup   = e => keys[e.key] = false;

let gameOver = false;

// ================================
// === GAME STATE ===
// ================================
let day = true;
let timer = 10000;        // starta med dag (50 sek)
let dayLength = 10000;
let nightLength = 20000;
let player = {x:200, y:300, w:20, h:20, vy:0, onGround:false};

// katten nu mycket större
let catHeight = c.height / 4;
let cat = {x:0, y:250, w:catHeight, h:catHeight, speed:1, vy:0};

let gravity = 0.5;
let camX = 0;

// enkel bana: lista med block (x,y,w,h)
let blocks = [
  {x:0, y:350, w:20000, h:50},   // marken
  {x:300, y:300, w:100, h:20},  // liten plattform
  {x:500, y:250, w:100, h:20},  // högre plattform
  {x:800, y:300, w:150, h:20},  // annan plattform
  {x:1200, y:300, w:100, h:20},  // annan plattform
  {x:2200, y:250, w:50, h:20},  // annan plattform
  {x:2200, y:250, w:150, h:20},  // annan plattform
];

// blink-logik för ögon
let blinkTimer = 0;
let blinkInterval = 2000 + Math.random()*2000;
let blinking = false;

// ================================
// === LOOP ===
// ================================
function loop() {
  requestAnimationFrame(loop);

  // timer
  timer -= 16;
  if (timer <= 0) {
    day = !day;
    timer = day ? dayLength : nightLength;
  }



  // input
  if (keys["ArrowRight"]) player.x += 2;
  if (keys["ArrowLeft"])  player.x -= 2;
  if (keys[" "] && player.onGround) { player.vy = -8; player.onGround=false; }

  // fysik + kollisioner (spelare)
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

  // fysik + kollisioner (katt, förenklad)
  if (!day) {
    cat.x += cat.speed;
  }

  // kamera följer spelaren
  camX = player.x - c.width/2;
  if (camX < 0) camX = 0;

  // rita bakgrund
  ctx.fillStyle = day ? "#88d" : "#000";
  ctx.fillRect(0,0,c.width,c.height);

  // rita banan
  ctx.fillStyle = "#444";
  for (let b of blocks) {
    ctx.fillRect(b.x - camX, b.y, b.w, b.h);
  }

  // rita spelare
  ctx.fillStyle = "lime";
  ctx.fillRect(player.x - camX, player.y, player.w, player.h);

  // rita katt
if (day) {
  ctx.fillStyle = "black";
  ctx.fillRect(cat.x - camX, cat.y, cat.w, cat.h);

  ctx.fillStyle = "white";
  ctx.font = "16px sans-serif";
  ctx.fillText("Zzz", cat.x - camX, cat.y - 10);
} else {
  if (!blinking) {
    ctx.fillStyle = "black";
    ctx.fillRect(cat.x - camX, cat.y, cat.w, cat.h);

    // ögon relativt kattens storlek
    let eyeY = cat.y + cat.h/2;
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
  // UI
  ctx.fillStyle = "white";
  ctx.font = "14px sans-serif";
  ctx.fillText(day ? "DAY" : "NIGHT", 10, 20);
  ctx.fillText("Timer: " + Math.ceil(timer/1000), 10, 40);


  // ================================
  // === COLLISION DETECTION ===
  // ================================
  if (!day && !gameOver) {
    if (player.x < cat.x + cat.w &&
        player.x + player.w > cat.x &&
        player.y < cat.y + cat.h &&
        player.y + player.h > cat.y) {
      gameOver = true;
    }
  }

  // ================================
  // === GAME OVER TEXT ===
  // ================================
  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0,0,c.width,c.height);

    ctx.fillStyle = "red";
    ctx.font = "30px sans-serif";
    ctx.fillText("GAME OVER", c.width/2 - 80, c.height/2);

    ctx.fillStyle = "white";
    ctx.font = "16px sans-serif";
    ctx.fillText("Tryck F5 för att starta om", c.width/2 - 100, c.height/2 + 30);
  }
}
loop();
