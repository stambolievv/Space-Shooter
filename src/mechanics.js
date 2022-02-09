import { GAME } from './properties.js';

/**
 * @param {Array} AA 
 * @param {Array} BB 
 * @param {Function} callback 
 */
function overlap(AA, BB, callback) {
  AA.forEach(a => {
    const a_hitbox = {
      x: a.texture.position.x - a.texture.width * 0.4,
      y: a.texture.position.y - a.texture.height * 0.4,
      w: a.texture.width * 0.8,
      h: a.texture.height * 0.8,
    };
    BB.forEach(b => {
      const b_hitbox = {
        x: b.texture.position.x - b.texture.width * 0.5,
        y: b.texture.position.y - b.texture.height * 0.25,
        w: b.texture.width,
        h: b.texture.height * 0.5
      };
      if (a_hitbox.x < b_hitbox.x + b_hitbox.w && a_hitbox.x + a_hitbox.w > b_hitbox.x &&
        a_hitbox.y < b_hitbox.y + b_hitbox.h && a_hitbox.y + a_hitbox.h > b_hitbox.y) {
        return callback(a, b);
      }
    });
  });
}

/**
 * 
 * @param {Object} object 
 * @param {Number} index 
 * @param {Array} array 
 */
function removeWorldOutBounds(game, object, index, array) {
  const boundaries = object.texture.getBounds();

  if (boundaries.x + boundaries.width < 0 || boundaries.x > GAME.WIDTH ||
    boundaries.y + boundaries.height < 0 || boundaries.y > GAME.HEIGHT) {

    array.splice(index, 1);
    object.health?.graphics.destroy();
    game.removeChild(object.texture);
  }
}

export {
  overlap,
  removeWorldOutBounds
};