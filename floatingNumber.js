class FloatingNumber {
    constructor(x, y, value, color = '#ff0000') {
        this.x = x;
        this.y = y;
        this.value = value;
        this.color = color;
        this.alpha = 1.0;
        this.scale = 1.0;
        this.lifetime = 1.0; // Duración total de la animación en segundos
        this.timeAlive = 0;
        this.initialY = y;
        this.enabled = true;
    }

    update(dt) {
        if (this.timeAlive >= this.lifetime) {
            const index = engine.entities.indexOf(this);
            if (index > -1) {
                engine.entities.splice(index, 1);
            }
            return;
        }

        // Actualizar posición y apariencia
        this.timeAlive += dt;
        const progress = this.timeAlive / this.lifetime;

        // Mover hacia arriba
        this.y = this.initialY - (50 * progress); // Sube 50 píxeles en total

        // Desvanecer gradualmente
        this.alpha = 1.0 - progress;

        // Escalar ligeramente al inicio
        this.scale = 1.0 + (0.5 * Math.sin(progress * Math.PI));
    }

    render(ctx) {

        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.font = `${Math.floor(20 * this.scale)}px 'Mineglyph', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(this.value), this.x, this.y);
        ctx.restore();
    }
}

