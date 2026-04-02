// Player class

import { clamp, ELEMENT_NAMES } from '../utils/helpers.js';

export class Player {
    constructor(x, isLeft, element = 'fire') {
        this.x = x;
        this.y = 300; // Center height
        this.width = 60;
        this.height = 100;
        this.speed = 4;
        this.vy = 0;
        this.isLeft = isLeft;
        this.element = element;
        this.name = ELEMENT_NAMES[element];
        this.color = {
            fire: '#ff4400',
            water: '#0066ff',
            earth: '#8b4513',
            air: '#88ccff'
        }[element];
        this.sprite = null;
    }

    update(input, dt) {
        const up = this.isLeft ? input.p1Up() : input.p2Up();
        const down = this.isLeft ? input.p1Down() : input.p2Down();

        if (up) this.vy = -this.speed;
        else if (down) this.vy = this.speed;
        else this.vy *= 0.9; // Friction

        this.y += this.vy;
        this.y = clamp(this.y, 50 + this.height/2, 550 - this.height/2); // Court limits
        this.x = clamp(this.x, this.isLeft ? 100 : 1100 - this.width, this.isLeft ? 580 : 620); // Don't cross net
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        
        // Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;
        
        // Fallback colored rect (sprite async handled elsewhere)
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        ctx.shadowBlur = 0;
        ctx.restore();

        // Name
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.name, this.x + this.width/2, this.y - this.height/2 - 10);
        ctx.textBaseline = 'alphabetic';
    }

    get bounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y - this.height/2,
            bottom: this.y + this.height/2
        };
    }
}
