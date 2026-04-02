// Ball physics

import { clamp, rectCircleCollide, distance } from '../utils/helpers.js';

export class Ball {
    constructor() {
        this.reset();
        this.trail = [];
    }

    reset() {
        this.x = 600;
        this.y = 300;
        this.vx = 0;
        this.vy = 0;
        this.radius = 20;
        this.color = '#ffff88';
    }

    update(dt, courtHeight, netLeft, netRight, players, onScore) {
        // Physics
        this.vy += 0.2 * dt; // Gravity
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Walls
        if (this.y - this.radius <= 50 || this.y + this.radius >= courtHeight - 50) {
            this.vy *= -0.8;
            this.y = clamp(this.y, 50 + this.radius, courtHeight - 50 - this.radius);
        }

        // Net collision (solid wall)
        if (this.x + this.radius > netLeft && this.x - this.radius < netRight) {
            if (this.vx > 0) {
                this.x = netLeft - this.radius;
                this.vx *= -0.8;
            } else {
                this.x = netRight + this.radius;
                this.vx *= -0.8;
            }
        }

        // Player collision
        for (let player of players) {
            if (rectCircleCollide(player.bounds, this)) {
                // Rebound with player vy influence
                const relY = (this.y - player.y) / 50;
                this.vy = -this.vy * 0.8 + player.vy * 0.5 + relY * 3;
                this.vx = player.isLeft ? Math.abs(this.vx) * 1.2 : -Math.abs(this.vx) * 1.2;
                // Push ball away
                const dx = this.x - player.x;
                const dist = Math.hypot(dx, this.y - player.y);
                this.x += (dx / dist) * this.radius * 0.5;
            }
        }

        // Score
        if (this.y > courtHeight) {
            if (this.x < 600) onScore(1); // P2 scores
            else onScore(0); // P1 scores
            this.reset();
        }

        // Trail
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > 10) this.trail.shift();
    }

    render(ctx) {
        // Trail
        for (let i = 0; i < this.trail.length; i++) {
            ctx.save();
            ctx.globalAlpha = i / this.trail.length * 0.5;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, this.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Main ball
        ctx.shadowColor = 'rgba(255,255,0,0.8)';
        ctx.shadowBlur = 20;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}
