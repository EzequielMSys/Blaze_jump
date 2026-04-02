// Main game state machine

import { Player } from './player.js';
import { Ball } from './ball.js';
import { CPU } from './cpu.js';
import { checkNetCollision, resolvePlayerNet } from './collision.js';
import { loadImage, chooseRandom } from '../utils/helpers.js';

const STATES = {
    MENU: 'menu',
    SELECT_MAP: 'selectMap',
    SELECT_CHAR_P1: 'selectCharP1',
    SELECT_CHAR_P2: 'selectCharP2',
    GAME: 'game',
    PAUSE: 'pause',
    GAME_OVER: 'gameOver'
};

const MAPS = {
    cidade: 'assets/backgrounds/cidade.gif',
    vaporwave: 'assets/backgrounds/vaporwave.png',
    praia: 'assets/backgrounds/praia.gif'
};

const ELEMENTS = ['fire', 'water', 'earth', 'air'];

export function initGame(ctx, canvas, input, audio) {
    const CANVAS_WIDTH = 1200;
    const CANVAS_HEIGHT = 600;
    const NET_LEFT = 580;
    const NET_RIGHT = 620;
    const COURT_TOP = 50;
    const COURT_BOTTOM = CANVAS_HEIGHT - 50;

    let state = STATES.MENU;
    let background = null;
    let mapKey = null;
    let p1Element = 'fire';
    let p2Element = 'fire';
    let p1 = null;
    let p2 = null;
    let ball = new Ball();
    let cpu = null;
    let scoreP1 = 0;
    let scoreP2 = 0;
    let mode = null; // 'coop' or 'cpu'
    let cpuDifficulty = 'medium';
    let paused = false;
    let gameOverTimer = 0;
    let dt = 0;
    let lastTime = 0;
    let servePlayer = 0; // 0 for P1, 1 for P2

    // Menu elements
    let selectedOption = 0;
    let menuOptions = ['Jogador vs Jogador', 'Jogador vs CPU'];

function loadMenuBackground() {
    loadImage('assets/backgrounds/fundo_principal.png', '#111').then(img => {
        background = img;
    }).catch(e => {
        console.warn('Menu bg fail:', e);
        background = null;
    });
}

function loadBackground(map) {
        loadImage(MAPS[map], '#333').then(img => {
            background = img;
            mapKey = map;
            audio.playMap(map);
        }).catch(e => {
            console.warn('Bg load fail:', e);
            background = null;
        });
    }

    function resetGame() {
        scoreP1 = 0;
        scoreP2 = 0;
        servePlayer = Math.floor(Math.random() * 2);
        p1 = new Player(100, true, p1Element);
        p2 = mode === 'coop' ? new Player(1100 - 60, false, p2Element) : new Player(1100 - 60, false, p2Element);
        cpu = mode === 'cpu' ? new CPU(cpuDifficulty) : null;
        ball.reset();
        // Sprites fallback ready, no await
    }

    function onScore(winner) { // 0 P1, 1 P2
        if (winner === 0) scoreP2++;
        else scoreP1++;
        servePlayer = winner;
        if (scoreP1 >= 15 || scoreP2 >= 15) {
            state = STATES.GAME_OVER;
            gameOverTimer = 180; // 3 sec @60fps
        }
        ball.reset();
    }

    function handleMenuInput() {
        if (input.p1Down()) {
        selectedOption = (selectedOption + 1) % (state === STATES.MENU ? menuOptions.length : Object.keys(MAPS).length || ELEMENTS.length);
        }
        if (input.p1Up()) {
        selectedOption = (selectedOption - 1 + (state === STATES.MENU ? menuOptions.length : Object.keys(MAPS).length || ELEMENTS.length)) % (state === STATES.MENU ? menuOptions.length : Object.keys(MAPS).length || ELEMENTS.length);
        }
        if (input.p1Serve()) {
            if (state === STATES.MENU) {
                mode = selectedOption === 0 ? 'coop' : 'cpu';
                cpuDifficulty = 'medium'; // Hardcode or add submenu
                state = STATES.SELECT_MAP;
                selectedOption = 0;
            } else if (state === STATES.SELECT_MAP) {
                const maps = Object.keys(MAPS);
                loadBackground(maps[selectedOption]);
                state = STATES.SELECT_CHAR_P1;
                selectedOption = 0;
            } else if (state === STATES.SELECT_CHAR_P1) {
                p1Element = ELEMENTS[selectedOption];
                state = mode === 'coop' ? STATES.SELECT_CHAR_P2 : STATES.GAME;
                selectedOption = 0;
            } else if (state === STATES.SELECT_CHAR_P2) {
                p2Element = ELEMENTS[selectedOption];
                state = STATES.GAME;
            } else if (state === STATES.GAME_OVER) {
                state = STATES.MENU;
            }
        }
    }

function update(time) {
        dt = Math.min((time - lastTime) / 16, 3);
        lastTime = time;

            if (state === STATES.MENU || state === STATES.SELECT_MAP || state === STATES.SELECT_CHAR_P1 || state === STATES.SELECT_CHAR_P2) {
                handleMenuInput();
                return;
            }

        if (state === STATES.GAME) {
            if (!p1 || !p2) return;

            // Serve
            if (input.p1Serve() && servePlayer === 0) {
                ball.vx = 5;
                ball.vy = (Math.random() - 0.5) * 2;
            }
            if ((input.p2Serve() || (mode === 'cpu' && Math.random() < 0.02)) && servePlayer === 1) {
                ball.vx = -5;
                ball.vy = (Math.random() - 0.5) * 2;
            }

            // Update players
            p1.update(input, dt);
            resolvePlayerNet(p1);
            if (mode === 'coop') {
                p2.update(input, dt);
            } else {
                const cpuMove = cpu.update(ball, dt, CANVAS_HEIGHT);
                p2.vy = cpuMove;
                p2.y += p2.vy;
                p2.y = clamp(p2.y, COURT_TOP + p2.height/2, COURT_BOTTOM - p2.height/2);
            }
            resolvePlayerNet(p2);

            // Update ball
            ball.update(dt, CANVAS_HEIGHT, NET_LEFT, NET_RIGHT, [p1, p2], onScore);

            // Check win
            if (state === STATES.GAME_OVER) {
                gameOverTimer--;
                if (gameOverTimer <= 0) {
                    state = STATES.MENU;
                }
            }

            // Pause
            if (input.p1Pause() || input.p2Pause()) {
                state = paused ? STATES.GAME : STATES.PAUSE;
                paused = !paused;
                if (paused) audio.pause();
                else audio.resume();
            }
        } else if (state === STATES.PAUSE || state === STATES.GAME_OVER) {
            if (input.p1Pause()) {
                if (state === STATES.PAUSE) state = STATES.GAME;
            }
            if (input.p1Serve()) {
                if (state === STATES.PAUSE) resetGame();
                else if (state === STATES.GAME_OVER) state = STATES.MENU;
            }
        }
    }

    function render() {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Background - menu usa fundo_principal
        if (state === STATES.MENU && background) {
            ctx.drawImage(background, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        }

        // Court lines
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, COURT_TOP);
        ctx.lineTo(CANVAS_WIDTH, COURT_TOP);
        ctx.lineTo(CANVAS_WIDTH, COURT_BOTTOM);
        ctx.lineTo(0, COURT_BOTTOM);
        ctx.lineTo(0, COURT_TOP);
        ctx.stroke();

        // Net
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(NET_LEFT, COURT_TOP, NET_RIGHT - NET_LEFT, COURT_BOTTOM - COURT_TOP);

        if (state === STATES.GAME || state === STATES.PAUSE) {
            p1?.render(ctx);
            p2?.render(ctx);
            ball.render(ctx);

            // Score
            ctx.fillStyle = 'white';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${scoreP1} - ${scoreP2}`, CANVAS_WIDTH / 2, 40);

            // Serve indicator
            if (servePlayer === 0) {
                ctx.fillText('Seu saque! (SPACE)', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30);
            }
        }

        // UI Overlays
        renderUI();
    }

    function renderUI() {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.font = 'bold 36px Arial';

        if (state === STATES.MENU) {
            ctx.fillText('Vôlei Elemental', CANVAS_WIDTH / 2, 200);
            menuOptions.forEach((opt, i) => {
                ctx.font = i === selectedOption ? 'bold 40px Arial' : '36px Arial';
                ctx.fillText(opt, CANVAS_WIDTH / 2, 300 + i * 60);
            });
            ctx.font = '24px Arial';
            ctx.fillText('↑↓ Selecionar | ESPAÇO Confirmar', CANVAS_WIDTH / 2, 500);
        } else if (state === STATES.SELECT_MAP) {
            ctx.fillText('Escolha o Mapa', CANVAS_WIDTH / 2, 200);
            Object.keys(MAPS).forEach((map, i) => {
                ctx.font = i === selectedOption ? 'bold 32px Arial' : '28px Arial';
                ctx.fillText(map.charAt(0).toUpperCase() + map.slice(1), CANVAS_WIDTH / 2, 300 + i * 50);
            });
        } else if (state === STATES.SELECT_CHAR_P1) {
            ctx.fillText('Jogador 1 - Escolha Elemento', CANVAS_WIDTH / 2, 200);
            ELEMENTS.forEach((el, i) => {
                ctx.font = i === selectedOption ? 'bold 32px Arial' : '28px Arial';
                ctx.fillText(el.charAt(0).toUpperCase() + el.slice(1), CANVAS_WIDTH / 2, 300 + i * 50);
            });
        } else if (state === STATES.SELECT_CHAR_P2 && mode === 'coop') {
            ctx.fillText('Jogador 2 - Escolha Elemento', CANVAS_WIDTH / 2, 200);
            ELEMENTS.forEach((el, i) => {
                ctx.font = i === selectedOption ? 'bold 32px Arial' : '28px Arial';
                ctx.fillText(el.charAt(0).toUpperCase() + el.slice(1), CANVAS_WIDTH / 2, 300 + i * 50);
            });
        } else if (state === STATES.PAUSE) {
            ctx.font = 'bold 48px Arial';
            ctx.fillText('PAUSADO', CANVAS_WIDTH / 2, 250);
            ctx.font = '32px Arial';
            ctx.fillText('ESC - Continuar', CANVAS_WIDTH / 2, 350);
            ctx.fillText('ESPAÇO - Reiniciar', CANVAS_WIDTH / 2, 400);
        } else if (state === STATES.GAME_OVER) {
            const winner = scoreP1 >= 15 ? 'Jogador 1' : (mode === 'coop' ? 'Jogador 2' : 'CPU');
            ctx.font = 'bold 48px Arial';
            ctx.fillText(`Vencedor: ${winner}`, CANVAS_WIDTH / 2, 250);
            ctx.fillText('ESPAÇO - Menu', CANVAS_WIDTH / 2, 350);
        }

        ctx.textAlign = 'left';
    }

    function resize() {
        // Canvas is fixed size, CSS handles scaling
    }

    loadMenuBackground();
    audio.playMenu();

    return {
        update,
        render,
        resize
    };
}
