// CPU AI for player 2

import { clamp, lerp } from '../utils/helpers.js';

export class CPU {
    constructor(difficulty = 'easy') {
        this.difficulty = difficulty;
        this.speed = { easy: 2, medium: 4, hard: 7 }[difficulty];
        this.accuracy = { easy: 0.6, medium: 0.85, hard: 1.0 }[difficulty];
        this.reactionDelay = { easy: 30, medium: 15, hard: 0 }[difficulty];
        this.targetY = 300;
        this.frameCount = 0;
    }

    update(ball, dt, courtHeight) {
        this.frameCount++;

        if (this.frameCount % this.reactionDelay !== 0) return;

        // Predict ball landing on our side (right side)
        let predictY = ball.y + ball.vy * 60; // Predict 1 sec ahead
        predictY = clamp(predictY, 50 + 50, courtHeight - 50 - 50); // Within court

        // Accuracy noise
        predictY += (Math.random() - 0.5) * 100 * (1 - this.accuracy);

        this.targetY = lerp(this.targetY, predictY, 0.1);

        // Move towards target
        const dy = this.targetY - 300; // Center is 300
        const moveY = dy * this.speed * dt * 0.01;
        // Apply to player vy in game.js
        return moveY;
    }
}
