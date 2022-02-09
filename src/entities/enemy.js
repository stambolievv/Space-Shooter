import { GAME } from '../properties.js';
import { enemies, shooter, rockets } from '../constants.js';
import { overlap, removeWorldOutBounds } from '../mechanics.js';
import { rocketLaunch } from './rocket.js';
import { bombExplosion } from './explosion.js';

class Enemy {
  constructor(game, texture, position) {
    this.game = game;
    this.texture = texture;

    this.velocity = 0.5;
    this.health = {
      graphics: new PIXI.Graphics(),
      current: 300,
      max: 300
    };
    this.shootingSpeed = 0;

    this.setup(position);
    this.game.addChild(this.texture);
  }

  setup(position) {
    this.texture.anchor.set(0.5, 0.5);
    this.texture.scale.set(0.7, 0.7);
    this.texture.position.set(position.x, position.y);
    this.texture.animationSpeed = 0.1;
    this.texture.loop = true;
    this.texture.play();
  }

  update(target) {
    const distX = this.texture.position.x - target.x;
    const distY = this.texture.position.y - target.y;

    const angle = Math.atan2(distY, distX);
    const distance = Math.sqrt(distX ** 2 + distY ** 2);

    this.texture.rotation = angle - Math.PI / 2;

    const spaceBetweenShooter = 75;
    if (distance > spaceBetweenShooter) {
      this.texture.position.x -= this.velocity * Math.cos(angle);
      this.texture.position.y -= this.velocity * Math.sin(angle);
    } else {
      this.texture.gotoAndPlay(0);
    }

    this.healthBar();
  }

  healthBar() {
    const portion = this.health.current / this.health.max;

    this.health.graphics.clear();
    this.health.graphics
      .beginFill('0xCA1010')
      .drawPolygon([
        16, 10,
        16 + (50 * portion), 10,
        8 + (50 * portion), 20,
        8, 20,
      ])
      .endFill();

    this.health.graphics.position.set(this.texture.position.x - this.texture.width * 1, this.texture.position.y - this.texture.height);

    this.game.addChild(this.health.graphics);
  }

  shoot(target) {
    const position = { x: this.texture.position.x, y: this.texture.position.y };
    const aim = { x: target.x, y: target.y };
    rocketLaunch(this.game, position, aim, false);
  }
}

function initEnemy(...url) {
  url.forEach((src, index) => {
    const enemy_sprite_sheet = new PIXI.BaseTexture.from(src);

    enemies.animation.sprites[index] = [];
    enemies.animation.frames.forEach(frame => {
      enemies.animation.sprites[index].push(new PIXI.Texture(enemy_sprite_sheet, new PIXI.Rectangle(frame.x, frame.y, frame.w, frame.h)));
    });
  });
}

function spawnEnemy(stage) {
  const randomSpawn = Math.random() < 0.5;
  const outOfScreen = 25;
  const spawnPoint = {
    x: randomSpawn ? (Math.random() < 0.5 ? -outOfScreen : GAME.WIDTH + outOfScreen) : (Math.random() * GAME.WIDTH),
    y: randomSpawn ? (Math.random() * GAME.HEIGHT) : (Math.random() < 0.5 ? -outOfScreen : GAME.HEIGHT + outOfScreen)
  };

  const randomSprite = Math.floor(Math.random() * enemies.animation.sprites.length);

  enemies.objects.push(new Enemy(stage, new PIXI.AnimatedSprite(enemies.animation.sprites[randomSprite]), spawnPoint));
}

function animateEnemy(stage, deltaTime) {
  enemies.objects.forEach((enemy, index, array) => {
    enemy.update(shooter.object.texture.position);

    enemy.shootingSpeed += deltaTime;
    if (enemy.shootingSpeed > 100) {
      enemy.shoot(shooter.object.texture.position);
      enemy.shootingSpeed = 0;
    }

    removeWorldOutBounds(stage, enemy, index, array);
  });

  overlap(enemies.objects, rockets.objects, (enemy, rocket) => {
    if (rocket.fromPlayer) {
      rockets.objects.splice(rockets.objects.indexOf(rocket), 1);
      stage.removeChild(rocket.texture);

      enemy.health.current -= 100;
      bombExplosion(stage, enemy.texture.position.x, enemy.texture.position.y);

      if (enemy.health.current == 0) {
        checkScore(100);
        checkHighScore();

        enemy.health.graphics.destroy();
        enemies.objects.splice(enemies.objects.indexOf(enemy), 1);
        stage.removeChild(enemy.texture);
      }
    }
  });
}

function checkScore(point) {
  GAME.SCORE += point;
}

function checkHighScore() {
  if (GAME.SCORE > GAME.HIGHSCORE) {
    localStorage.setItem('ss-highscore', GAME.SCORE);
    GAME.HIGHSCORE = GAME.SCORE;
  }
}

export {
  initEnemy,
  spawnEnemy,
  animateEnemy
};