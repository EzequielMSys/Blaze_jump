// Utility functions

export const ELEMENT_NAMES = {
    fire: 'Ignis',
    water: 'Aquara',
    earth: 'Terron',
    air: 'Zephyr'
};

export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

export function lerp(start, end, t) {
    return start + (end - start) * t;
}

export function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

export function rectCircleCollide(rect, circle) {
    const dx = circle.x - Math.max(rect.left, Math.min(circle.x, rect.right));
    const dy = circle.y - Math.max(rect.top, Math.min(circle.y, rect.bottom));
(circle.r ** 2);
}

export function chooseRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function loadImage(src, fallbackColor = '#888') {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = fallbackColor;
            ctx.fillRect(0, 0, 64, 64);
            resolve(canvas);
        };
        img.src = src;
    });
}

export function drawImageCentered(ctx, img, x, y, width = img.width, height = img.height) {
    ctx.drawImage(img, x - width/2, y - height/2, width, height);
}
