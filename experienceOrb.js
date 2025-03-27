class ExperienceOrb {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.sprite = new Image();
        this.sprite.src = 'sprites/orbe_exp.png';
        this.expValue = 10;
        this.isCollected = false;
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

        // Si el jugador está cerca, mover el orbe hacia él
        const collectionRange = 100;
        const collectionDistance = 30;

        if (distance < collectionRange) {
            const speed = 300;
            const vx = (dx / distance) * speed * dt;
            const vy = (dy / distance) * speed * dt;
            this.x += vx;
            this.y += vy;

            // Recolectar el orbe si está muy cerca del jugador
            if (distance < collectionDistance) {
                this.isCollected = true;
                player.experience = (player.experience || 0) + this.expValue;
                
                // Verificar niveles de experiencia
                const expForNextLevel = 100;
                if (player.experience >= expForNextLevel) {
                    player.experience -= expForNextLevel;
                    engine.isPaused = true;
                    
                    // Mostrar selección de habilidades
                    const skillSelection = document.getElementById('skill-selection');
                    skillSelection.style.display = 'block';
                }

                // Actualizar HUD de experiencia
                const expBar = document.getElementById('exp-bar');
                if (expBar) {
                    expBar.style.width = `${(player.experience / expForNextLevel) * 100}%`;
                }

                // Eliminar el orbe
                const index = engine.entities.indexOf(this);
                if (index > -1) {
                    engine.entities.splice(index, 1);
                }
            }
        }
    }

    render(ctx) {
        if (this.isCollected) return;
        
        if (this.sprite.complete) {
            ctx.drawImage(
                this.sprite,
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );
        }
    }
}