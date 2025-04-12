class TrainingDummy extends Entity {
    constructor(x, y) {
        // Ajustamos la posición inicial más hacia la derecha y cerca del borde inferior
        super(x + 110, window.innerHeight - 102, null, true); // 102 = 100 (altura) + 2 (margen)
        this.health = 200;
        this.maxHealth = 200;
        this.speed = 0; // El dummy no se mueve
        this.damageRate = 0; // El dummy no hace daño
        this.isDummy = true;
        this.lastDamageTime = 0;
        this.healingDelay = 2000; // 2 segundos en milisegundos
        this.loadSprite('sprites/dummy_sprite.png', 32, 32, 1);
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Verificar si es tiempo de curar
        const currentTime = Date.now();
        if (currentTime - this.lastDamageTime >= this.healingDelay && this.health < this.maxHealth) {
            this.health = this.maxHealth;
            // Crear número flotante para mostrar la curación
            engine.addEntity(new FloatingNumber(this.x, this.y, '+' + (this.maxHealth - this.health), '#00ff00'));
        }
    }

    takeDamage(amount, attacker) {
        super.takeDamage(amount, attacker);
        this.lastDamageTime = Date.now();
    }

    render(ctx) {
        super.render(ctx);
        
        // Personalizar la barra de vida para el dummy
        const healthBarWidth = this.width;
        const healthBarHeight = 10;
        const healthBarY = this.y - healthBarHeight - 5;
        
        // Fondo de la barra de vida
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.roundRect(this.x, healthBarY, healthBarWidth, healthBarHeight, 3);
        ctx.fill();
        
        // Barra de vida con el nuevo color
        ctx.fillStyle = '#bba780';
        ctx.beginPath();
        ctx.roundRect(this.x, healthBarY, (this.health / this.maxHealth) * healthBarWidth, healthBarHeight, 3);
        ctx.fill();
        
        // Número de vida
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
            Math.ceil(this.health),
            this.x + healthBarWidth / 2,
            healthBarY + healthBarHeight - 1
        );
    }
}