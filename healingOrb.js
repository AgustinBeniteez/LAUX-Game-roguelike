class HealingOrb extends Entity {
    constructor(x, y) {
        super(x, y);
        this.width = 16;
        this.height = 16;
        this.loadSprite('src/assets/images/heal.png', 32, 32, 1);
        this.healValue = 20;
        this.isCollected = false;
        this.baseSpeed = 200;
        this.maxSpeed = 500;
        this.attractionRange = 96;
        this.collectionRange = 20;
        this.isHealingOrb = true;
        this.minimapColor = '#00FF00';
    }

    update(dt) {
        if (this.isCollected) return;

        // Buscar al jugador
        const player = engine.entities.find(e => !e.isEnemy && !e.isDead);
        if (!player) return;

        // Calcular distancia al jugador
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Si el jugador está cerca, mover el orbe hacia él con velocidad variable
        if (distance < this.attractionRange) {
            // Calcular velocidad basada en la distancia
            const speedMultiplier = 1 - (distance / this.attractionRange);
            const currentSpeed = this.baseSpeed + (this.maxSpeed - this.baseSpeed) * speedMultiplier;
            
            const vx = (dx / distance) * currentSpeed * dt;
            const vy = (dy / distance) * currentSpeed * dt;
            this.x += vx;
            this.y += vy;

            // Recolectar el orbe si está muy cerca del jugador
            if (distance < this.collectionRange) {
                this.isCollected = true;
                
                // Curar al jugador
                if (player.health < player.maxHealth) {
                    player.health = Math.min(player.health + this.healValue, player.maxHealth);
                    
                    // Crear número flotante para mostrar la curación
                    const floatingNumber = new FloatingNumber(
                        this.x,
                        this.y,
                        `+${this.healValue}`,
                        '#00FF00'
                    );
                    engine.entities.push(floatingNumber);
                }
                
                // Eliminar el orbe
                const index = engine.entities.indexOf(this);
                if (index > -1) {
                    engine.entities.splice(index, 1);
                }
            }
        }
    }
}