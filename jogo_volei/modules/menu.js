// Menu system module (handles rendering and logic for all menus)

// This module can be integrated into game.js, but kept separate for modularity

export class MenuManager {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.selected = 0;
        this.menus = {
            main: ['Jogador vs Jogador', 'Jogador vs CPU'],
            maps: ['cidade', 'vaporwave', 'praia'],
            elements: ['fire', 'water', 'earth', 'air']
        };
        this.currentMenu = 'main';
    }

    update(input) {
        if (input.p1Down()) this.selected = (this.selected + 1) % this.menus[this.currentMenu].length;
        if (input.p1Up()) this.selected = (this.selected - 1 + this.menus[this.currentMenu].length) % this.menus[this.currentMenu].length;
        return { selected: this.selected, menu: this.currentMenu, option: this.menus[this.currentMenu][this.selected] };
    }

    render(title) {
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold 40px Arial';
        this.ctx.fillText(title, this.width / 2, 150);

        this.ctx.font = 'bold 32px Arial';
        this.menus[this.currentMenu].forEach((item, i) => {
            this.ctx.font = i === this.selected ? 'bold 36px Arial' : '32px Arial';
            this.ctx.fillText(item.toUpperCase(), this.width / 2, 280 + i * 55);
        });

        this.ctx.font = '24px Arial';
        this.ctx.fillText('↑↓ Selecionar | ESPAÇO Confirmar', this.width / 2, this.height - 80);
    }

    setMenu(name) {
        this.currentMenu = name;
        this.selected = 0;
    }
}
