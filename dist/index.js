var O = Object.defineProperty;
var I = (a, e, t) => e in a ? O(a, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : a[e] = t;
var s = (a, e, t) => (I(a, typeof e != "symbol" ? e + "" : e, t), t);
import { Container as d, Graphics as w, TextStyle as T, Text as U, Application as E } from "pixi.js";
const F = {
  keys: ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"],
  timeWindow: 3e3,
  caseSensitive: !1
}, c = 20, M = 3, R = 0.2;
class L {
  constructor() {
    s(this, "container");
    s(this, "body", []);
    s(this, "direction", "right");
    s(this, "moveTimer", 0);
    s(this, "graphics");
    s(this, "nextDirection", null);
    s(this, "color", 65280);
    this.container = new d(), this.graphics = new w(), this.container.addChild(this.graphics), this.reset();
  }
  reset() {
    this.body = [], this.direction = "right", this.moveTimer = 0;
    for (let e = M - 1; e >= 0; e--)
      this.body.push({ x: e * c, y: 0 });
    this.draw();
  }
  update(e) {
    this.moveTimer += e / 60, this.moveTimer >= R && (this.move(), this.moveTimer = 0);
  }
  setDirection(e) {
    ({
      up: "down",
      down: "up",
      left: "right",
      right: "left"
    })[e] !== this.direction && e !== this.direction && (this.direction = e);
  }
  grow() {
    const e = this.body[this.body.length - 1];
    this.body.push({ ...e });
  }
  checkFoodCollision(e) {
    const t = this.body[0];
    return t.x === e.x && t.y === e.y;
  }
  checkWallCollision() {
    const e = this.body[0];
    return e.x < 0 || e.x >= 800 || e.y < 0 || e.y >= 600;
  }
  checkSelfCollision() {
    const e = this.body[0];
    return this.body.slice(1).some(
      (i) => i.x === e.x && i.y === e.y
    );
  }
  setNextDirection(e) {
    e && e !== this.direction && (this.nextDirection = e);
  }
  setColor(e) {
    this.color = e, this.draw();
  }
  move() {
    if (this.nextDirection) {
      const t = {
        up: "down",
        down: "up",
        left: "right",
        right: "left"
      };
      this.nextDirection !== t[this.direction] && (this.direction = this.nextDirection), this.nextDirection = null;
    }
    const e = { ...this.body[0] };
    switch (this.direction) {
      case "up":
        e.y -= c;
        break;
      case "down":
        e.y += c;
        break;
      case "left":
        e.x -= c;
        break;
      case "right":
        e.x += c;
        break;
    }
    this.body.unshift(e), this.body.pop(), this.draw();
  }
  draw() {
    this.graphics.clear(), this.body.forEach((e, t) => {
      t === 0 ? this.drawSnakeHead(e) : this.drawBodySegment(e, t);
    });
  }
  drawSnakeHead(e) {
    const t = c - 2, i = e.x + c / 2, n = e.y + c / 2;
    this.graphics.beginFill(this.color), this.graphics.drawRoundedRect(
      i - t / 2,
      n - t / 2,
      t,
      t,
      6
    ), this.graphics.endFill(), this.graphics.beginFill(0);
    const o = 2;
    switch (this.direction) {
      case "right":
        this.graphics.drawCircle(i + 3, n - 3, o), this.graphics.drawCircle(i + 3, n + 3, o);
        break;
      case "left":
        this.graphics.drawCircle(i - 3, n - 3, o), this.graphics.drawCircle(i - 3, n + 3, o);
        break;
      case "up":
        this.graphics.drawCircle(i - 3, n - 3, o), this.graphics.drawCircle(i + 3, n - 3, o);
        break;
      case "down":
        this.graphics.drawCircle(i - 3, n + 3, o), this.graphics.drawCircle(i + 3, n + 3, o);
        break;
    }
    this.graphics.endFill();
  }
  drawBodySegment(e, t) {
    const i = c - 4, n = e.x + c / 2, o = e.y + c / 2, r = Math.min(t * 0.5, 4), h = i - r, p = this.adjustColorBrightness(this.color, -0.2);
    if (this.graphics.beginFill(p), this.graphics.drawRoundedRect(
      n - h / 2,
      o - h / 2,
      h,
      h,
      4
    ), this.graphics.endFill(), t % 2 === 0) {
      const x = this.adjustColorBrightness(this.color, -0.4);
      this.graphics.beginFill(x), this.graphics.drawRoundedRect(
        n - h / 4,
        o - h / 4,
        h / 2,
        h / 2,
        2
      ), this.graphics.endFill();
    }
  }
  adjustColorBrightness(e, t) {
    const i = e >> 16 & 255, n = e >> 8 & 255, o = e & 255, r = Math.max(0, Math.min(255, i + i * t)), h = Math.max(0, Math.min(255, n + n * t)), p = Math.max(0, Math.min(255, o + o * t));
    return r << 16 | h << 8 | p;
  }
  getDirection() {
    return this.direction;
  }
  getBody() {
    return this.body;
  }
}
const g = 20, P = 800 / g, $ = 600 / g;
class H {
  constructor() {
    s(this, "container");
    s(this, "position");
    s(this, "graphics");
    this.container = new d(), this.graphics = new w(), this.container.addChild(this.graphics), this.position = { x: 0, y: 0 }, this.reset([]);
  }
  // Accepts snakeBody: Position[]
  reset(e) {
    const t = [];
    for (let o = 0; o < P; o++)
      for (let r = 0; r < $; r++)
        t.push({ x: o * g, y: r * g });
    const i = new Set(e.map((o) => `${o.x},${o.y}`)), n = t.filter((o) => !i.has(`${o.x},${o.y}`));
    n.length > 0 ? this.position = n[Math.floor(Math.random() * n.length)] : this.position = { x: 0, y: 0 }, this.draw();
  }
  update(e) {
  }
  draw() {
    this.graphics.clear();
    const e = this.position.x + g / 2, t = this.position.y + g / 2, i = (g - 6) / 2;
    this.graphics.beginFill(16724787), this.graphics.drawCircle(e, t, i), this.graphics.endFill(), this.graphics.beginFill(16737894, 0.7), this.graphics.drawCircle(e - 2, t - 2, i * 0.6), this.graphics.endFill(), this.graphics.beginFill(16777215, 0.5), this.graphics.drawCircle(e - 3, t - 3, i * 0.3), this.graphics.endFill(), this.graphics.lineStyle(2, 9127187), this.graphics.moveTo(e, t - i + 1), this.graphics.lineTo(e, t - i - 4), this.graphics.lineStyle(0), this.graphics.beginFill(2263842), this.graphics.drawEllipse(e + 2, t - i - 1, 3, 2), this.graphics.endFill();
  }
}
const u = class u {
  constructor() {
    s(this, "currentDirection", "right");
    s(this, "nextDirection", null);
    s(this, "isInitialized", !1);
  }
  static getInstance() {
    return u.instance || (u.instance = new u()), u.instance;
  }
  initialize() {
    this.isInitialized || (window.addEventListener("keydown", this.handleKeyDown.bind(this)), this.isInitialized = !0);
  }
  getCurrentDirection() {
    return this.currentDirection;
  }
  getAndConsumeNextDirection() {
    const e = this.nextDirection;
    return this.nextDirection = null, e;
  }
  setCurrentDirection(e) {
    this.currentDirection = e;
  }
  handleKeyDown(e) {
    const t = {
      up: "down",
      down: "up",
      left: "right",
      right: "left"
    };
    let i = null;
    switch (e.key) {
      case "ArrowUp":
        i = "up";
        break;
      case "ArrowDown":
        i = "down";
        break;
      case "ArrowLeft":
        i = "left";
        break;
      case "ArrowRight":
        i = "right";
        break;
    }
    i && i !== this.currentDirection && i !== t[this.currentDirection] && (this.nextDirection = i);
  }
};
s(u, "instance");
let A = u;
class z {
  constructor() {
    s(this, "container");
    s(this, "particles", []);
    this.container = new d();
  }
  burstAt(e, t, i = 16776960, n = 18) {
    for (let o = 0; o < n; o++) {
      const r = Math.PI * 2 * o / n + Math.random() * 0.2, h = 2 + Math.random() * 2, p = Math.cos(r) * h, x = Math.sin(r) * h, m = new w();
      m.beginFill(i), m.drawCircle(0, 0, 3 + Math.random() * 2), m.endFill(), m.x = e, m.y = t, this.container.addChild(m), this.particles.push({ gfx: m, vx: p, vy: x, life: 30 + Math.random() * 10 });
    }
  }
  update() {
    for (let e = this.particles.length - 1; e >= 0; e--) {
      const t = this.particles[e];
      t.gfx.x += t.vx, t.gfx.y += t.vy, t.vx *= 0.95, t.vy *= 0.95, t.life--, t.gfx.alpha = Math.max(0, t.life / 40), t.life <= 0 && (this.container.removeChild(t.gfx), t.gfx.destroy(), this.particles.splice(e, 1));
    }
  }
}
const l = 20, K = 800 / l, B = 600 / l;
class N {
  constructor() {
    s(this, "container");
    s(this, "position");
    s(this, "graphics");
    s(this, "isActive", !1);
    s(this, "animationTimer", 0);
    this.container = new d(), this.graphics = new w(), this.container.addChild(this.graphics), this.position = { x: 0, y: 0 }, this.hide();
  }
  spawn(e, t) {
    const i = [];
    for (let r = 0; r < K; r++)
      for (let h = 0; h < B; h++)
        i.push({ x: r * l, y: h * l });
    const n = new Set(e.map((r) => `${r.x},${r.y}`));
    n.add(`${t.x},${t.y}`);
    const o = i.filter((r) => !n.has(`${r.x},${r.y}`));
    o.length > 0 ? (this.position = o[Math.floor(Math.random() * o.length)], this.isActive = !0, this.animationTimer = 0, this.draw(), this.container.visible = !0) : this.hide();
  }
  hide() {
    this.isActive = !1, this.container.visible = !1;
  }
  update(e) {
    this.isActive && (this.animationTimer += e, this.draw());
  }
  draw() {
    this.graphics.clear();
    const e = this.position.x + l / 2, t = this.position.y + l / 2, i = Math.sin(this.animationTimer * 0.2) * 0.3 + 0.7;
    this.graphics.beginFill(6737151, 0.3 * i), this.graphics.drawCircle(e, t, l / 2 + 2), this.graphics.endFill(), this.graphics.beginFill(16776960);
    const n = [
      e - 3,
      t - 8,
      // Top left
      e + 1,
      t - 8,
      // Top right
      e - 2,
      t - 2,
      // Middle left
      e + 4,
      t - 2,
      // Middle right  
      e + 1,
      t + 2,
      // Lower middle right
      e + 6,
      t + 8,
      // Bottom right
      e + 2,
      t + 8,
      // Bottom left
      e + 3,
      t + 2,
      // Lower middle left
      e - 2,
      t + 2,
      // Lower left
      e - 6,
      t - 4
      // Upper left
    ];
    this.graphics.drawPolygon(n), this.graphics.endFill(), this.graphics.beginFill(16777215, 0.8);
    const o = [
      e - 1,
      t - 6,
      e + 1,
      t - 6,
      e - 1,
      t - 1,
      e + 2,
      t - 1,
      e + 1,
      t + 1,
      e + 4,
      t + 6,
      e + 2,
      t + 6,
      e + 2,
      t + 1,
      e - 1,
      t + 1,
      e - 4,
      t - 2
    ];
    if (this.graphics.drawPolygon(o), this.graphics.endFill(), Math.random() < 0.3) {
      this.graphics.beginFill(65535, 0.8);
      for (let r = 0; r < 3; r++) {
        const h = e + (Math.random() - 0.5) * l, p = t + (Math.random() - 0.5) * l;
        this.graphics.drawCircle(h, p, 1);
      }
      this.graphics.endFill();
    }
  }
}
class _ {
  // frames
  constructor() {
    s(this, "container");
    s(this, "popupText");
    s(this, "timer", 0);
    s(this, "duration", 60);
    this.container = new d();
    const e = new T({
      fontFamily: "Arial",
      fontSize: 40,
      fill: "#ffe066",
      stroke: "#000",
      strokeThickness: 5,
      align: "center",
      dropShadow: !0,
      dropShadowColor: "#333",
      dropShadowBlur: 4,
      dropShadowDistance: 2
    });
    this.popupText = new U("", e), this.popupText.anchor.set(0.5), this.popupText.position.set(400, 100), this.popupText.visible = !1, this.container.addChild(this.popupText);
  }
  show(e) {
    this.popupText.text = e, this.popupText.visible = !0, this.timer = this.duration, this.popupText.alpha = 1;
  }
  update() {
    this.popupText.visible && (this.timer--, this.timer < 20 && (this.popupText.alpha = this.timer / 20), this.timer <= 0 && (this.popupText.visible = !1));
  }
}
const k = [
  {
    name: "Dark",
    background: 1710618,
    snake: 65280,
    food: 16729156,
    powerUp: 3381759,
    particle: 16769126,
    uiText: "#fff",
    combo: "#ffe066"
  },
  {
    name: "Light",
    background: 16316664,
    snake: 2263091,
    food: 14492194,
    powerUp: 2258892,
    particle: 16761600,
    uiText: "#222",
    combo: "#ffb700"
  },
  {
    name: "Retro",
    background: 2236996,
    snake: 65535,
    food: 16711935,
    powerUp: 16776960,
    particle: 65535,
    uiText: "#00ffff",
    combo: "#ff00ff"
  }
];
let v = 2;
const G = [], f = {
  getTheme() {
    return k[v];
  },
  nextTheme() {
    v = (v + 1) % k.length, G.forEach((a) => a(k[v]));
  },
  onThemeChange(a) {
    G.push(a);
  }
}, b = [
  {
    name: "Classic",
    color: 65280,
    particle: 16769126
  },
  {
    name: "Neon",
    color: 65535,
    particle: 16711935
  },
  {
    name: "Rainbow",
    color: 16711680,
    // Will cycle in code
    particle: 16777215
  },
  {
    name: "Retro",
    color: 16776960,
    particle: 65535
  }
];
let S = 0;
const D = [], C = {
  getSkin() {
    return b[S];
  },
  nextSkin() {
    S = (S + 1) % b.length, D.forEach((a) => a(b[S]));
  },
  onSkinChange(a) {
    D.push(a);
  }
};
class W {
  constructor() {
    s(this, "container");
    s(this, "achievements");
    s(this, "gameStats");
    s(this, "onAchievementUnlocked");
    this.container = new d(), this.container.visible = !1, this.gameStats = {
      score: 0,
      level: 1,
      survivalTime: 0,
      comboCount: 0,
      powerUpCount: 0
    }, this.achievements = [
      {
        id: "first-food",
        name: "First Food",
        description: "Eat your first food",
        isUnlocked: !1,
        condition: (e) => e.score >= 10
      },
      {
        id: "score-100",
        name: "Score 100",
        description: "Reach 100 points",
        isUnlocked: !1,
        condition: (e) => e.score >= 100
      },
      {
        id: "score-500",
        name: "Score 500",
        description: "Reach 500 points",
        isUnlocked: !1,
        condition: (e) => e.score >= 500
      },
      {
        id: "level-5",
        name: "Level 5",
        description: "Reach level 5",
        isUnlocked: !1,
        condition: (e) => e.level >= 5
      },
      {
        id: "combo-master",
        name: "Combo Master",
        description: "Get a 10x combo",
        isUnlocked: !1,
        condition: (e) => e.comboCount >= 10
      },
      {
        id: "power-user",
        name: "Power User",
        description: "Collect 5 power-ups",
        isUnlocked: !1,
        condition: (e) => e.powerUpCount >= 5
      }
    ];
  }
  setOnAchievementUnlocked(e) {
    this.onAchievementUnlocked = e;
  }
  updateScore(e) {
    this.gameStats.score = e, this.checkAchievements();
  }
  updateLevel(e) {
    this.gameStats.level = e, this.checkAchievements();
  }
  updateSurvivalTime() {
    this.gameStats.survivalTime++, this.checkAchievements();
  }
  updateComboCount() {
    this.gameStats.comboCount++, this.checkAchievements();
  }
  updatePowerUpCount() {
    this.gameStats.powerUpCount++, this.checkAchievements();
  }
  checkAchievements() {
    for (const e of this.achievements)
      !e.isUnlocked && e.condition(this.gameStats) && (e.isUnlocked = !0, this.onAchievementUnlocked && this.onAchievementUnlocked(e.name));
  }
  getUnlockedAchievements() {
    return this.achievements.filter((e) => e.isUnlocked).map((e) => e.name);
  }
  resetGameSession() {
    this.gameStats = {
      score: 0,
      level: 1,
      survivalTime: 0,
      comboCount: 0,
      powerUpCount: 0
    };
  }
}
class q {
  constructor() {
    s(this, "container");
    s(this, "graphics");
    s(this, "titleText");
    s(this, "restartText");
    s(this, "onRestart", null);
    this.container = new d(), this.container.visible = !1, this.createOverlay();
  }
  createOverlay() {
    this.graphics = new w(), this.graphics.beginFill(0, 0.8), this.graphics.drawRect(0, 0, 800, 600), this.graphics.endFill(), this.container.addChild(this.graphics);
    const e = new T({
      fontFamily: "Arial",
      fontSize: 48,
      fill: "#ff4444",
      fontWeight: "bold"
    });
    this.titleText = new U("GAME OVER", e), this.titleText.anchor.set(0.5), this.titleText.position.set(400, 250), this.container.addChild(this.titleText);
    const t = new T({
      fontFamily: "Arial",
      fontSize: 24,
      fill: "#ffffff"
    });
    this.restartText = new U("Press SPACE to restart", t), this.restartText.anchor.set(0.5), this.restartText.position.set(400, 320), this.container.addChild(this.restartText);
  }
  show(e) {
    this.container.visible = !0, this.onRestart = e;
    const t = (i) => {
      i.code === "Space" && (this.hide(), this.onRestart && this.onRestart(), window.removeEventListener("keydown", t));
    };
    window.addEventListener("keydown", t);
  }
  hide() {
    this.container.visible = !1;
  }
}
class Y {
  constructor(e, t) {
    s(this, "app");
    s(this, "gameContainer");
    s(this, "snake");
    s(this, "food");
    s(this, "powerUp");
    s(this, "gameState");
    s(this, "isRunning", !1);
    s(this, "isPaused", !1);
    s(this, "inputManager");
    s(this, "externalUI");
    s(this, "gameOverOverlay");
    s(this, "particles");
    s(this, "powerUpTimer", 0);
    s(this, "powerUpActive", !1);
    s(this, "powerUpDuration", 300);
    // 5 seconds at 60fps
    s(this, "powerUpChance", 0.01);
    // probability per frame
    s(this, "comboPopup");
    s(this, "comboCount", 0);
    // food eaten in combo window
    s(this, "comboTimer", 0);
    // time remaining for combo
    s(this, "comboWindow", 1800);
    // 30 seconds at 60fps
    s(this, "currentSkin");
    s(this, "achievements");
    this.app = e, this.externalUI = t, this.gameContainer = new d(), this.app.stage.addChild(this.gameContainer), this.gameState = {
      score: 0,
      level: 1,
      speed: 1,
      isGameOver: !1
    }, this.snake = new L(), this.food = new H(), this.powerUp = new N(), this.gameContainer.addChild(this.snake.container), this.gameContainer.addChild(this.food.container), this.gameContainer.addChild(this.powerUp.container), this.gameOverOverlay = new q(), this.app.stage.addChild(this.gameOverOverlay.container), this.particles = new z(), this.app.stage.addChild(this.particles.container), this.comboPopup = new _(), this.app.stage.addChild(this.comboPopup.container), f.onThemeChange((i) => this.applyTheme(i)), window.addEventListener("keydown", (i) => {
      i.key.toLowerCase() === "t" && this.nextTheme();
    }), this.currentSkin = C.getSkin(), this.snake.setColor(this.currentSkin.color), C.onSkinChange((i) => {
      this.currentSkin = i, this.snake.setColor(i.color), this.externalUI.updateSkin(i.name);
    }), window.addEventListener("keydown", (i) => {
      i.key.toLowerCase() === "s" && this.nextSkin();
    }), window.addEventListener("keydown", (i) => {
      i.code === "Space" ? (i.preventDefault(), this.togglePause()) : i.code === "Escape" && (i.preventDefault(), this.restart());
    }), this.achievements = new W(), this.achievements.setOnAchievementUnlocked((i) => {
      this.externalUI.unlockAchievement(i);
    }), this.app.stage.addChild(this.achievements.container), this.inputManager = A.getInstance(), this.inputManager.initialize(), this.applyTheme(f.getTheme()), this.externalUI.updateTheme(f.getTheme().name), this.externalUI.updateSkin(this.currentSkin.name), this.externalUI.updateGameStatus("ready"), this.app.ticker.add(this.update.bind(this)), console.log("[Game] Constructor complete, ticker added");
  }
  nextTheme() {
    f.nextTheme(), this.externalUI.updateTheme(f.getTheme().name);
  }
  nextSkin() {
    C.nextSkin();
  }
  togglePause() {
    !this.isRunning || this.gameState.isGameOver || (this.isPaused = !this.isPaused, this.externalUI.updateGameStatus(this.isPaused ? "paused" : "playing"), console.log(`[Game] ${this.isPaused ? "Paused" : "Resumed"}`));
  }
  restart() {
    (this.isRunning || this.gameState.isGameOver) && this.start();
  }
  start() {
    console.log("[Game] Start called"), this.isRunning = !0, this.isPaused = !1, this.gameState.isGameOver = !1, this.gameState.score = 0, this.gameState.level = 1, this.gameState.speed = 1, this.comboCount = 0, this.comboTimer = 0, this.powerUpTimer = 0, this.powerUpActive = !1, this.powerUp.hide(), this.snake.reset(), this.food.reset(this.snake.getBody()), this.gameOverOverlay.hide(), this.externalUI.updateScore(this.gameState.score), this.externalUI.updateLevel(this.gameState.level), this.externalUI.updateGameStatus("playing"), this.achievements.resetGameSession(), console.log("[Game] Start complete, isRunning:", this.isRunning);
  }
  update(e) {
    if (!this.isRunning || this.gameState.isGameOver || this.isPaused)
      return;
    const t = this.inputManager.getAndConsumeNextDirection();
    this.snake.setNextDirection(t), !this.powerUp.isActive && !this.powerUpActive && Math.random() < this.powerUpChance && this.powerUp.spawn(this.snake.getBody(), this.food.position), this.snake.update(e * this.gameState.speed), this.inputManager.setCurrentDirection(this.snake.getDirection()), this.food.update(e), this.powerUp.update(e), this.particles.update(), this.comboPopup.update(), this.comboTimer > 0 && this.comboTimer--, this.comboTimer === 0 && (this.comboCount = 0), this.powerUpActive && (this.powerUpTimer--, this.powerUpTimer <= 0 && (this.gameState.speed = 1 + (this.gameState.level - 1) * 0.2, this.powerUpActive = !1)), this.checkCollisions(), this.externalUI.updateScore(this.gameState.score), this.externalUI.updateLevel(this.gameState.level), this.achievements.updateSurvivalTime();
  }
  checkCollisions() {
    if (this.snake.checkFoodCollision(this.food.position)) {
      this.snake.grow(), this.comboTimer > 0 ? this.comboCount++ : this.comboCount = 1, this.comboTimer = this.comboWindow;
      let e = 0;
      this.comboCount > 0 && this.comboCount % 5 === 0 && (e = this.comboCount * 10, console.log(`[Combo] ${this.comboCount} foods in 30s! +${e}`), this.comboPopup.show(`${this.comboCount} foods in 30s! +${e}`), this.particles.burstAt(this.food.position.x, this.food.position.y, this.currentSkin.particle, 48), this.achievements.updateComboCount()), this.particles.burstAt(this.food.position.x, this.food.position.y, this.currentSkin.particle), this.food.reset(this.snake.getBody()), this.gameState.score += 10 + e, this.achievements.updateScore(this.gameState.score), this.checkLevelUp();
    }
    this.powerUp.isActive && this.snake.getBody()[0].x === this.powerUp.position.x && this.snake.getBody()[0].y === this.powerUp.position.y && (this.powerUp.hide(), this.powerUpActive = !0, this.powerUpTimer = this.powerUpDuration, this.gameState.speed = 2 + (this.gameState.level - 1) * 0.2, this.particles.burstAt(this.powerUp.position.x, this.powerUp.position.y, 6737151), this.achievements.updatePowerUpCount()), (this.snake.checkWallCollision() || this.snake.checkSelfCollision()) && this.gameOver();
  }
  checkLevelUp() {
    const e = Math.floor(this.gameState.score / 100) + 1;
    e > this.gameState.level && (this.gameState.level = e, this.gameState.speed = 1 + (this.gameState.level - 1) * 0.2, this.externalUI.updateLevel(this.gameState.level), this.achievements.updateLevel(this.gameState.level), console.log(`[Game] Level up! New level: ${this.gameState.level}, speed: ${this.gameState.speed}`));
  }
  gameOver() {
    console.log("[Game] Game over!");
    const e = this.gameState.score;
    this.isRunning = !1, this.isPaused = !1, this.gameState.isGameOver = !0, this.externalUI.updateGameStatus("game-over"), this.externalUI.gameCompleted(e), this.particles.burstAt(this.snake.getBody()[0].x, this.snake.getBody()[0].y, 16711680, 36), this.gameOverOverlay.show(() => {
      this.start();
    });
  }
  applyTheme(e) {
    this.app.renderer.background.color = e.background;
  }
}
class y {
  /**
   * Set a cookie with no expiration date (persistent)
   */
  static setCookie(e, t) {
    const i = /* @__PURE__ */ new Date();
    i.setFullYear(i.getFullYear() + 10), document.cookie = `${e}=${encodeURIComponent(t)}; expires=${i.toUTCString()}; path=/; SameSite=Strict`;
  }
  /**
   * Get a cookie value by name
   */
  static getCookie(e) {
    const t = e + "=", i = document.cookie.split(";");
    for (let n = 0; n < i.length; n++) {
      let o = i[n];
      for (; o.charAt(0) === " "; )
        o = o.substring(1, o.length);
      if (o.indexOf(t) === 0)
        return decodeURIComponent(o.substring(t.length, o.length));
    }
    return null;
  }
  /**
   * Load game statistics from cookies
   */
  static loadStats() {
    try {
      const e = this.getCookie(this.COOKIE_NAME);
      if (e) {
        const t = JSON.parse(e);
        return {
          ...this.DEFAULT_STATS,
          ...t
        };
      }
    } catch (e) {
      console.warn("[CookieManager] Error loading stats from cookies:", e);
    }
    return { ...this.DEFAULT_STATS };
  }
  /**
   * Save game statistics to cookies
   */
  static saveStats(e) {
    try {
      const t = JSON.stringify(e);
      this.setCookie(this.COOKIE_NAME, t), console.log("[CookieManager] Stats saved:", e);
    } catch (t) {
      console.error("[CookieManager] Error saving stats to cookies:", t);
    }
  }
  /**
   * Record a completed game
   */
  static recordGame(e) {
    const t = this.loadStats(), i = {
      gamesPlayed: t.gamesPlayed + 1,
      highestScore: Math.max(t.highestScore, e),
      totalScore: t.totalScore + e,
      averageScore: 0,
      // Will be calculated below
      lastPlayed: (/* @__PURE__ */ new Date()).toISOString()
    };
    return i.averageScore = Math.round(i.totalScore / i.gamesPlayed), this.saveStats(i), i;
  }
  /**
   * Update highest score if current score is higher
   */
  static updateHighScore(e) {
    const t = this.loadStats();
    return e > t.highestScore ? (t.highestScore = e, this.saveStats(t), !0) : !1;
  }
  /**
   * Get formatted statistics for display
   */
  static getFormattedStats() {
    const e = this.loadStats();
    return {
      gamesPlayed: e.gamesPlayed.toLocaleString(),
      highestScore: e.highestScore.toLocaleString(),
      averageScore: e.averageScore.toLocaleString(),
      lastPlayed: e.lastPlayed ? new Date(e.lastPlayed).toLocaleDateString() : "Never"
    };
  }
  /**
   * Reset all statistics (for testing or user preference)
   */
  static resetStats() {
    this.saveStats({ ...this.DEFAULT_STATS }), console.log("[CookieManager] All stats reset");
  }
  /**
   * Check if this is the first time playing
   */
  static isFirstTime() {
    return this.loadStats().gamesPlayed === 0;
  }
}
s(y, "COOKIE_NAME", "snake_game_stats"), s(y, "DEFAULT_STATS", {
  gamesPlayed: 0,
  highestScore: 0,
  totalScore: 0,
  averageScore: 0,
  lastPlayed: ""
});
class j {
  constructor(e = {}) {
    s(this, "config");
    s(this, "keySequenceDetector");
    s(this, "gameOverlay", null);
    s(this, "pixiApp", null);
    s(this, "game", null);
    s(this, "isGameOpen", !1);
    this.config = {
      container: document.body,
      keySequence: F,
      width: 800,
      height: 600,
      zIndex: 1e4,
      autoStart: !1,
      closeOnEscape: !0,
      showInstructions: !0,
      onGameOpen: () => {
      },
      onGameClose: () => {
      },
      onHighScore: () => {
      },
      ...e
    }, this.keySequenceDetector = new X(
      this.config.keySequence,
      () => this.toggleGame()
    ), this.config.autoStart && this.openGame();
  }
  /**
   * Manually trigger the game (bypassing key sequence)
   */
  openGame() {
    this.isGameOpen || (this.createGameOverlay(), this.initializeGame(), this.isGameOpen = !0, this.config.onGameOpen());
  }
  /**
   * Close the game
   */
  closeGame() {
    this.isGameOpen && (this.destroyGameOverlay(), this.isGameOpen = !1, this.config.onGameClose());
  }
  /**
   * Toggle game open/close
   */
  toggleGame() {
    this.isGameOpen ? this.closeGame() : this.openGame();
  }
  /**
   * Destroy the easter egg instance and clean up
   */
  destroy() {
    this.keySequenceDetector.destroy(), this.closeGame();
  }
  /**
   * Update configuration
   */
  updateConfig(e) {
    this.config = { ...this.config, ...e };
  }
  createGameOverlay() {
    this.gameOverlay = document.createElement("div"), this.gameOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: ${this.config.zIndex};
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      font-family: Arial, sans-serif;
    `;
    const e = document.createElement("div");
    e.id = "snake-easter-egg-container", e.style.cssText = `
      position: relative;
      border: 3px solid #333;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
    `;
    const t = document.createElement("button");
    if (t.textContent = "×", t.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      width: 30px;
      height: 30px;
      border: none;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      font-size: 18px;
      cursor: pointer;
      border-radius: 50%;
      z-index: 1;
    `, t.addEventListener("click", () => this.closeGame()), this.config.showInstructions) {
      const n = document.createElement("div");
      n.style.cssText = `
        color: white;
        margin-bottom: 20px;
        text-align: center;
        font-size: 14px;
      `, n.innerHTML = `
        <p>🐍 Hidden Snake Game Discovered!</p>
        <p>Use arrow keys to control • Press ESC to close</p>
      `, this.gameOverlay.appendChild(n);
    }
    if (this.gameOverlay.appendChild(e), e.appendChild(t), this.config.closeOnEscape) {
      const n = (o) => {
        o.key === "Escape" && (this.closeGame(), document.removeEventListener("keydown", n));
      };
      document.addEventListener("keydown", n);
    }
    const i = typeof this.config.container == "string" ? document.querySelector(this.config.container) : this.config.container;
    i && i.appendChild(this.gameOverlay);
  }
  initializeGame() {
    if (!this.gameOverlay)
      return;
    const e = this.gameOverlay.querySelector("#snake-easter-egg-container");
    if (!e)
      return;
    this.pixiApp = new E({
      width: this.config.width,
      height: this.config.height,
      backgroundColor: 0,
      antialias: !0
    }), e.appendChild(this.pixiApp.view);
    const t = new J((i) => {
      this.config.onHighScore(i);
    });
    this.game = new Y(this.pixiApp, t), this.game.start();
  }
  destroyGameOverlay() {
    this.pixiApp && (this.pixiApp.destroy(!0), this.pixiApp = null), this.game && (this.game = null), this.gameOverlay && (this.gameOverlay.remove(), this.gameOverlay = null);
  }
}
class X {
  constructor(e, t) {
    s(this, "sequence", []);
    s(this, "timeWindow");
    s(this, "caseSensitive");
    s(this, "currentIndex", 0);
    s(this, "lastKeyTime", 0);
    s(this, "callback");
    this.sequence = e.keys, this.timeWindow = e.timeWindow || 3e3, this.caseSensitive = e.caseSensitive || !1, this.callback = t, document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }
  handleKeyDown(e) {
    const t = Date.now(), i = this.sequence[this.currentIndex], n = this.caseSensitive ? e.code : e.code.toLowerCase(), o = this.caseSensitive ? i : i.toLowerCase();
    t - this.lastKeyTime > this.timeWindow && (this.currentIndex = 0), n === o ? (this.currentIndex++, this.lastKeyTime = t, this.currentIndex >= this.sequence.length && (this.callback(), this.currentIndex = 0)) : this.currentIndex = 0;
  }
  destroy() {
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
  }
}
class J {
  constructor(e) {
    s(this, "onHighScore");
    this.onHighScore = e;
  }
  updateScore(e) {
    y.updateHighScore(e) && this.onHighScore(e);
  }
  updateLevel() {
  }
  updateTheme() {
  }
  updateSkin() {
  }
  updateAchievements() {
  }
  updateGameStatus() {
  }
  unlockAchievement() {
  }
  gameCompleted(e) {
    y.recordGame(e);
  }
}
export {
  j as SnakeGameEasterEgg
};
