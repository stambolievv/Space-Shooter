import { GAME } from '../properties.js';
import { explosions } from '../constants.js';

class Explosion {
  constructor(game, texture, position) {
    this.game = game;
    this.texture = texture;

    this.setup(position);
    this.game.addChild(this.texture);
  }

  setup(position) {
    this.texture.anchor.set(0.5, 0.5);
    this.texture.scale.set(0.7, 0.7);
    this.texture.position.set(position.x, position.y);
    this.texture.animationSpeed = 0.7;
    this.texture.loop = false;
    this.texture.play();

    this.texture.onComplete = () => {
      this.game.removeChild(this.texture);
    };
  }
}

function initExplosion(url) {
  const explosion_sprite_sheet = new PIXI.BaseTexture.from(url);
  explosions.animation.frames.forEach((frame, index) => {
    explosions.animation.sprites[index] = new PIXI.Texture(explosion_sprite_sheet, new PIXI.Rectangle(frame.x, frame.y, frame.w, frame.h));
  });
}

function bombExplosion(stage, posX, posY) {
  const spawnPoint = { x: posX, y: posY };

  explosions.objects = new Explosion(stage, new PIXI.AnimatedSprite(explosions.animation.sprites), spawnPoint);
  GAME.SOUNDS.explosion.play();
}

export {
  initExplosion,
  bombExplosion
};