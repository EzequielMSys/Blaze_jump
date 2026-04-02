// Pause menu module

export class PauseMenu {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.selected = 0;
        this.options = ['Continuar', 'Reiniciar', 'Sair para Menu'];
    }

    update(input, onSelect) {
        if (input.p1Down()) this.selected = (this.selected + 1) % this.options.length;
        if (input.p1Up()) this.selected = (this.selected - 1 + this.options.length) % this.options.length;
        if (input.p1Serve()) {
            onSelect(this.selected);
        }
    }

    render() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.9)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillText('PAUSADO', this.width / 2, 200);

        this.ctx.font = 'bold 32px Arial';
        this.options.forEach((opt, i) => {
            this.ctx.font = i === this.selected ? 'bold 36px Arial' : '32px Arial';
            this.ctx.fillText(opt, this.width / 2, 300 + i * 50);
        });

        this.ctx.font = '24px Arial';
        this.ctx.fillText('ESC/Start - Voltar | ESPAÇO Selecionar', this.width / 2, this.height - 60);
    }
}
