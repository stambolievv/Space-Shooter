import { rockets } from '../constants.js';
import { removeWorldOutBounds } from '../mechanics.js';
import { bombExplosion } from './explosion.js';

class Rocket {
  constructor(game, texture, position, angle, target, fromPlayer) {
    this.game = game;
    this.texture = texture;

    this.fromPlayer = fromPlayer;
    this.velocity = fromPlayer ? 10 : 5;
    this.angle = angle;
    this.target = target;

    this.setup(position);
    this.game.addChild(this.texture);
  }

  setup(position) {
    this.texture.anchor.set(0.5, 0.7);
    this.texture.scale.set(0.7, 0.7);
    this.texture.position.set(position.x, position.y);
    this.texture.animationSpeed = 1.5;
    this.texture.loop = true;
    this.texture.play();
  }

  update() {
    this.texture.rotation = this.angle - Math.PI / 2;

    this.texture.position.x -= this.velocity * Math.cos(this.angle);
    this.texture.position.y -= this.velocity * Math.sin(this.angle);

    this.lockedAim();
  }

  lockedAim() {
    const distX = this.texture.position.x - this.target.x;
    const distY = this.texture.position.y - this.target.y;

    const distance = Math.sqrt(distX ** 2 + distY ** 2);

    const spaceForExplotion = 5;
    if (!this.fromPlayer && distance < spaceForExplotion) {
      this.game.removeChild(this.texture);
      bombExplosion(this.game, this.texture.position.x, this.texture.position.y);
    }
  }
}

function initRocket(url) {
  const rocket_sprite_sheet = new PIXI.BaseTexture.from(url);
  rockets.animation.frames.forEach((frame, index) => {
    rockets.animation.sprites[index] = new PIXI.Texture(rocket_sprite_sheet, new PIXI.Rectangle(frame.x, frame.y, frame.w, frame.h));
  });
}

function rocketLaunch(stage, position, aim, fromPlayer = true) {
  const distX = position.x - aim.x;
  const distY = position.y - aim.y;

  const angle = Math.atan2(distY, distX);

  rockets.objects.push(new Rocket(stage, new PIXI.AnimatedSprite(rockets.animation.sprites), position, angle, aim, fromPlayer));
}

function animateRocket(stage, deltaTime) {
  rockets.objects.forEach((rocket, index, array) => {
    rocket.update();
    removeWorldOutBounds(stage, rocket, index, array);
  });
}

export {
  initRocket,
  rocketLaunch,
  animateRocket
};