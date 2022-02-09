export const GAME = {
  WIDTH: window.innerWidth,
  HEIGHT: window.innerHeight,
  MOUSE: { x: 0, y: 0, leftPressed: false, rightPressed: false, },
  BACKGROUND: null,
  TEXT: { SCORE: null, HIGHSCORE: null },
  SOUNDS: null,
  SCORE: 0,
  HIGHSCORE: Number(localStorage.getItem('ss-highscore')) || 0,
  GAMEOVER: false,
  FINISHED: false,
};
