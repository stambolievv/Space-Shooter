import { GAME } from './properties.js';
import { initShooter, spawnShooter, animateShooter } from './entities/shooter.js';
import { initRocket, animateRocket } from './entities/rocket.js';
import { initExplosion } from './entities/explosion.js';
import { initEnemy, spawnEnemy, animateEnemy } from './entities/enemy.js';
import { shooter } from './constants.js';

const app = new PIXI.Application({
  width: GAME.WIDTH,
  height: GAME.HEIGHT,
  antialias: true,
  autoDensity: true.width,
});
document.body.appendChild(app.view);

const stage = new PIXI.Container();

app.loader
  .add('background', 'assets/images/background.png')
  .add('Devans', 'assets/fonts/Devans.woff')
  .add('enemy1', 'assets/images/enemy1.png')
  .add('enemy2', 'assets/images/enemy2.png')
  .add('shooter', 'assets/images/shooter.png')
  .add('rocket', 'assets/images/rocket.png')
  .add('explosion', 'assets/images/explosion.png')
  .add('soundBackground', 'assets/audio/background.wav')
  .add('soundExplosion', 'assets/audio/explosion.wav')
  .add('soundRocket', 'assets/audio/rocket.wav')
  .add('soundGameover', 'assets/audio/gameover.wav')
  .load(preload);

function preload() {
  initBackground(app.loader.resources['background'].url);

  setText();
  setSound(app.loader.resources['soundBackground'].sound, app.loader.resources['soundExplosion'].sound, app.loader.resources['soundRocket'].sound, app.loader.resources['soundGameover'].sound);

  initEnemy(app.loader.resources['enemy1'].url, app.loader.resources['enemy2'].url);
  spawnEnemy(stage);

  initShooter(app.loader.resources['shooter'].url);
  spawnShooter(stage);

  initRocket(app.loader.resources['rocket'].url);

  initExplosion(app.loader.resources['explosion'].url);

  app.stage.addChild(stage);
  app.ticker.add((deltaTime) => animate(deltaTime));
}

/* Game loop */
function animate(deltaTime) {
  if (GAME.GAMEOVER && !GAME.FINISHED) {
    stage.removeChildren();
    app.stage.removeChild(stage);
    gameover();
    return GAME.FINISHED = true;
  }
  if (GAME.GAMEOVER) { return; }

  animateShooter(stage, deltaTime);
  animateRocket(stage, deltaTime);
  animateEnemy(stage, deltaTime);

  updateText();
}
// Spawn enemy between 4 and 8 seconds at start. This time progressively decrease over time. 
setInterval(() => spawnEnemy(stage), (Math.random() * 4 + 4) * (1000 - Math.floor(app.ticker.lastTime / 100)));

/* Handle background image and text on display. */
function initBackground(url) {
  GAME.BACKGROUND = new PIXI.TilingSprite.from(url, GAME.WIDTH, GAME.HEIGHT);
  GAME.BACKGROUND.width = GAME.WIDTH;
  GAME.BACKGROUND.height = GAME.HEIGHT;

  app.stage.addChild(GAME.BACKGROUND);
}
function setText() {
  const style = { fontFamily: 'Devans', fontSize: 26, fill: 0xffffff, align: 'left', strokeThickness: 2 };

  GAME.TEXT.SCORE = new PIXI.Text('', style);
  GAME.TEXT.SCORE.position.set(GAME.WIDTH * 0.01, GAME.HEIGHT * 0.01);

  GAME.TEXT.HIGHSCORE = new PIXI.Text('', style);
  GAME.TEXT.HIGHSCORE.position.set(GAME.WIDTH * 0.01, GAME.HEIGHT * 0.04);

  app.stage.addChild(GAME.TEXT.SCORE, GAME.TEXT.HIGHSCORE);
}
function updateText() {
  GAME.TEXT.SCORE.text = 'Score: ' + GAME.SCORE;
  GAME.TEXT.SCORE.updateText();

  GAME.TEXT.HIGHSCORE.text = 'High Score: ' + GAME.HIGHSCORE;
  GAME.TEXT.HIGHSCORE.updateText();
}
function setSound(...data) {
  GAME.SOUNDS = data.reduce((obj, sound, index) => {
    const soundName = sound.url.split('/').pop().slice(0, -4);
    const soundSetting = soundName == 'background' ? { volume: 0.1, loop: true } : { volume: 0.3, loop: false };

    sound.volume = soundSetting.volume;
    sound.loop = soundSetting.loop;
    if (index == 0) { sound.play(); }

    return Object.assign(obj, { [soundName]: sound });
  }, {});
}

/* Handle Game Over */
function gameover() {
  Object.values(GAME.SOUNDS).forEach(s => s.stop());
  GAME.SOUNDS.gameover.play();

  const style = {
    fontFamily: 'Devans',
    fontSize: 126,
    fill: ['#2e92bf', '#6ed2ff'],
    align: 'center',
    strokeThickness: 2,
    dropShadow: true,
    dropShadowColor: '#4d93b3',
    dropShadowAngle: 1
  };
  const gameoverText = new PIXI.Text('GAME OVER!', style);
  gameoverText.anchor.set(0.5, 0.5);
  gameoverText.position.set(GAME.WIDTH * 0.5, GAME.HEIGHT * 0.5);

  const playagainText = new PIXI.Text('Play again', style);
  playagainText.anchor.set(0.5, 0.5);
  playagainText.scale.set(0.5, 0.5);

  const playagainBG = new PIXI.Graphics()
    .beginFill('0x6ed2ff')
    .lineStyle(3, '0X4d93b3', 0.5)
    .drawRoundedRect(playagainText.position.x, playagainText.position.y, 300, 80, 20)
    .endFill();

  const playagainBtn = new PIXI.Sprite(app.renderer.generateTexture(playagainBG));
  playagainBtn.anchor.set(0.5, 0.5);
  playagainBtn.position.set(GAME.WIDTH * 0.5, GAME.HEIGHT * 0.5);

  playagainBtn.interactive = true;
  playagainBtn.buttonMode = true;
  playagainBtn.on('click', () => window.location.reload());
  playagainBtn.on('mouseover', () => playagainBtn.tint = '0xDDDDDD');
  playagainBtn.on('mouseout', () => playagainBtn.tint = '0xFFFFFF');
  playagainBtn.addChild(playagainText);

  app.stage.addChild(playagainBtn);
  app.stage.addChild(gameoverText);

  let count = 0;
  app.ticker.add(() => {
    gameoverText.scale.set(count / 30);
    gameoverText.y = GAME.HEIGHT * 0.5 - count * 5;
    gameoverText.alpha = count * 0.05;

    playagainBtn.scale.set(count / 30);
    playagainBtn.y = GAME.HEIGHT * 0.8 - count * 5;
    playagainBtn.alpha = count * 0.05;

    if (count > 30) { return; }
    count += 0.5;
  });
}

//?    /////////////////////////
//?   //// EVENT LISTENERS ////
//?  /////////////////////////
document.addEventListener('contextmenu', e => e.preventDefault());
app.renderer.view.addEventListener('mousemove', e => {
  GAME.MOUSE.x = e.offsetX;
  GAME.MOUSE.y = e.offsetY;
});
app.renderer.view.addEventListener('mouseup', e => {
  if (e.button == 0) { GAME.MOUSE.leftPressed = false; }
  if (e.button == 2) { GAME.MOUSE.rightPressed = false; }
});
app.renderer.view.addEventListener('mousedown', e => {
  if (e.button == 0) {
    GAME.MOUSE.leftPressed = true;
    shooter.object.shoot(GAME.MOUSE);
  }
  if (e.button == 2) { GAME.MOUSE.rightPressed = true; }
});
app.renderer.view.addEventListener('mouseout', e => {
  GAME.MOUSE.leftPressed = false;
  GAME.MOUSE.rightPressed = false;
});

window.addEventListener('resize', e => {
  GAME.WIDTH = window.innerWidth;
  GAME.HEIGHT = window.innerHeight;

  GAME.BACKGROUND.width = GAME.WIDTH;
  GAME.BACKGROUND.height = GAME.HEIGHT;

  app.renderer.resize(GAME.WIDTH, GAME.HEIGHT);
});