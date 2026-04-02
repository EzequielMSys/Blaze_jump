// Input handling: Keyboard + Gamepad API for SNES USB support

export function initInput(canvas) {
    const keys = {};
    const gamepads = [];
    let prevGamepads = [];

    // Keyboard
    canvas.addEventListener('keydown', (e) => {
        keys[e.code] = true;
    });
    canvas.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    // Prevent default for arrows
    canvas.addEventListener('keydown', (e) => {
        if (['ArrowUp', 'ArrowDown', 'KeyW', 'KeyS', 'KeyI', 'KeyK', 'Space', 'Escape'].includes(e.code)) {
            e.preventDefault();
        }
    });

    // Gamepad polling
    function pollGamepads() {
        prevGamepads = gamepads.slice();
        const pads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (let i = 0; i < pads.length; i++) {
            if (pads[i]) gamepads[i] = pads[i];
        }
    }

    setInterval(pollGamepads, 16); // ~60fps

    return {
        get keys() { return keys; },
        get gamepads() { return gamepads; },
        get prevGamepads() { return prevGamepads; },
        
        // Player 1 inputs (P1: WASD/Arrows, Gamepad 0)
        p1Up: () => keys['KeyW'] || keys['ArrowUp'] || gamepads[0]?.axes[1] < -0.5,
        p1Down: () => keys['KeyS'] || keys['ArrowDown'] || gamepads[0]?.axes[1] > 0.5,
        p1Serve: () => keys['Space'] || gamepads[0]?.buttons[0].pressed || gamepads[0]?.buttons[1].pressed,
        p1Pause: () => keys['Escape'] || gamepads[0]?.buttons[7].pressed || gamepads[0]?.buttons[8].pressed, // Start/Select

        // Player 2 inputs (P2: IK/Arrows, Gamepad 1)
        p2Up: () => keys['KeyI'] || gamepads[1]?.axes[1] < -0.5,
        p2Down: () => keys['KeyK'] || gamepads[1]?.axes[1] > 0.5,
        p2Serve: () => false, // P2 doesn't serve
        p2Pause: () => keys['Escape'] || gamepads[1]?.buttons[7].pressed || gamepads[1]?.buttons[8].pressed
    };
}
