import { initGame } from './modules/game.js';
import { initInput } from './modules/input.js';
import { initAudio } from './modules/audio.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.focus();

let game, input, audio;

function init() {
    try {
        audio = initAudio();
        input = initInput(canvas);
        game = initGame(ctx, canvas, input, audio);
        
        // Game loop
        function loop(time) {
            game.update(time);
            game.render();
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    } catch (e) {
        console.error('Init error:', e);
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.fillText('Error: ' + e.message, 50, 50);
    }
}

canvas.addEventListener('click', () => {
    if (audio && audio.audioCtx && audio.audioCtx.state === 'suspended') {
        audio.audioCtx.resume();
    }
}, {once: true});

window.addEventListener('load', init);
window.addEventListener('resize', () => game?.resize());
