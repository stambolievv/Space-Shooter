import { GAME } from '../properties.js';
import { shooter, rockets, enemies } from '../constants.js';
import { overlap } from '../mechanics.js';
import { rocketLaunch } from './rocket.js';
import { bombExplosion } from './explosion.js';

class Shooter {
  constructor(game, texture, position) {
    this.game = game;
    this.texture = texture;

    this.velocity = 5;
    this.health = {
      graphics: new PIXI.Graphics(),
      current: 600,
      max: 600
    };
    this.laser = new PIXI.Graphics();

    this.setup(position);
    this.game.addChild(this.texture);
  }

  setup(position) {
    this.texture.anchor.set(0.5, 0.5);
    this.texture.position.set(position.x, position.y);
    this.texture.animationSpeed = 0.3;
    this.texture.loop = true;
    this.texture.play();
  }

  update(mouse) {
    const distX = this.texture.position.x - mouse.x;
    const distY = this.texture.position.y - mouse.y;

    const distance = Math.sqrt(distX ** 2 + distY ** 2);
    const angle = Math.atan2(distY, distX);

    this.texture.rotation = angle - Math.PI / 2;

    const spaceBetweenCursor = 10;
    if (mouse.rightPressed && distance > spaceBetweenCursor) {
      this.texture.position.x -= this.velocity * Math.cos(angle);
      this.texture.position.y -= this.velocity * Math.sin(angle);
    } else {
      this.texture.gotoAndPlay(0);
    }
    this.healthBar();
    this.laserBeam(mouse);
  }

  healthBar() {
    const portion = this.health.current / this.health.max;

    this.health.graphics.clear();
    this.health.graphics
      .beginFill('0x000')
      .drawPolygon([
        16, 10,
        16 + (100), 10,
        8 + (100), 20,
        8, 20,
      ])
      .beginFill('0x00CC99')
      .drawPolygon([
        16, 10,
        16 + (100 * portion), 10,
        8 + (100 * portion), 20,
        8, 20,
      ])
      .endFill();

    this.health.graphics.position.set(this.texture.position.x - this.texture.width * 1.1, this.texture.position.y - this.texture.height);

    this.game.addChild(this.health.graphics);
  }

  shoot(target) {
    const position = { x: this.texture.position.x, y: this.texture.position.y };
    const aim = { x: target.x, y: target.y };
    rocketLaunch(this.game, position, aim);
    GAME.SOUNDS.rocket.play();
  }

  laserBeam(target) {
    this.laser.clear();
    this.laser
      .lineStyle(1, 0xbb2200, 0.4)
      .moveTo(this.texture.position.x, this.texture.position.y)
      .lineTo(target.x, target.y);

    this.game.addChild(this.laser);
  }
}

function initShooter(url) {
  const shooter_sprite_sheet = new PIXI.BaseTexture.from(url);
  shooter.animation.frames.forEach((frame, index) => {
    shooter.animation.sprites[index] = new PIXI.Texture(shooter_sprite_sheet, new PIXI.Rectangle(frame.x, frame.y, frame.w, frame.h));
  });
}

function spawnShooter(stage) {
  const spawnPoint = { x: GAME.WIDTH * 0.5, y: GAME.HEIGHT * 0.5 };

  shooter.object = new Shooter(stage, new PIXI.AnimatedSprite(shooter.animation.sprites), spawnPoint);
}

function animateShooter(stage, deltaTime) {
  shooter.object.update(GAME.MOUSE, enemies.objects);

  if (shooter.object.health.current < 600) { shooter.object.health.current += deltaTime * 0.2; }

  overlap([shooter.object], rockets.objects, (shooter, rocket) => {
    if (!rocket.fromPlayer) {
      rockets.objects.splice(rockets.objects.indexOf(rocket), 1);
      stage.removeChild(rocket.texture);

      shooter.health.current -= 100;
      bombExplosion(stage, shooter.texture.position.x, shooter.texture.position.y);

      if (shooter.health.current <= 0) { GAME.GAMEOVER = true; }
    }
  });
}

export {
  initShooter,
  spawnShooter,
  animateShooter
};