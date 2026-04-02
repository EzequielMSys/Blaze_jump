// Collision detection utils (exported for use in ball.js etc.)

import { distance, rectCircleCollide } from '../utils/helpers.js';

export function checkBallPlayerCollision(ball, player) {
    return rectCircleCollide(player.bounds, ball);
}

export function checkNetCollision(ball, netLeft = 580, netRight = 620) {
    return ball.x + ball.radius > netLeft && ball.x - ball.radius < netRight;
}

export function resolvePlayerNet(player) {
    // Enforce no crossing net
    if (player.isLeft && player.x > 580) player.x = 580;
    if (!player.isLeft && player.x + player.width < 620) player.x = 620 - player.width;
}
