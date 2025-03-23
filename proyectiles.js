class Projectile extends Entity {
    constructor(x, y, targetX, targetY, weaponType = 'basic', damage = 20, speed = 400) {
        super(x, y);
        this.weaponType = weaponType;
        this.speed = speed;
        this.lifetime = 2; // Tiempo de vida en segundos
        this.timeAlive = 0;
        this.startX = x; // Posición inicial X
        this.startY = y; // Posición inicial Y
        this.maxRange = 400; // Rango máximo del proyectil
        this.opacity = 1.0; // Opacidad para el efecto de desvanecimiento
        
        // Configurar daño y sprite según el tipo de varita
        switch(weaponType) {
            case 'crystal':
                this.damage = damage * 0.2;
                this.loadSprite('sprites/proyectil_sprite_3.png', 32, 32, 1);
                break;
            case 'nature':
                this.damage = damage * 0.2;
                this.loadSprite('sprites/proyectil_sprite_2.png', 32, 32, 1);
                break;
            default:
                this.damage = damage * 0.2;
                this.loadSprite('sprites/proyectil_sprite_1.png', 32, 32, 1);
        }
        
        // Calcular la dirección del proyectil
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.velocityX = (dx / distance) * speed;
        this.velocityY = (dy / distance) * speed;
        this.width = 32;
        this.height = 32;
    }

    update(dt) {
        // No actualizar si el juego está pausado
        if (engine.isPaused) return;

        // Actualizar posición
        this.x += this.velocityX * dt;
        this.y += this.velocityY * dt;

        // Actualizar tiempo de vida
        this.timeAlive += dt;
        if (this.timeAlive >= this.lifetime) {
            // Eliminar el proyectil cuando expire su tiempo de vida
            const index = engine.entities.indexOf(this);
            if (index > -1) {
                engine.entities.splice(index, 1);
            }
            return;
        }

        // Detectar colisiones con enemigos
        engine.entities.forEach(entity => {
            if (entity.isEnemy && !entity.isDead) {
                // Verificar colisión con el enemigo
                if (this.checkCollision(entity)) {
                    // Aplicar daño al enemigo
                    entity.health -= this.damage;
                    
                    // Eliminar el proyectil al impactar
                    const index = engine.entities.indexOf(this);
                    if (index > -1) {
                        engine.entities.splice(index, 1);
                    }

                    // Verificar si el enemigo murió
                    if (entity.health <= 0) {
                        entity.isDead = true;
                        const index = engine.entities.indexOf(entity);
                        if (index > -1) {
                            engine.entities.splice(index, 1);
                            gameState.enemiesKilled++;
                            gameState.totalEnemiesKilled++;
                            document.getElementById('enemies-value').textContent = gameState.totalEnemiesKilled;
                            enemiesInWave--;
                            saveGame();
                        }
                    }
                }
            }
        });
    }

    checkCollision(entity) {
        return this.x < entity.x + entity.width &&
               this.x + this.width > entity.x &&
               this.y < entity.y + entity.height &&
               this.y + this.height > entity.y;
    }

    render(ctx) {
        if (this.sprite) {
            // Calcular la distancia recorrida
            const dx = this.x - this.startX;
            const dy = this.y - this.startY;
            const distanceTraveled = Math.sqrt(dx * dx + dy * dy);
            
            // Ajustar la opacidad basada en la distancia
            if (distanceTraveled > this.maxRange * 0.7) {
                this.opacity = Math.max(0, 1 - (distanceTraveled - this.maxRange * 0.7) / (this.maxRange * 0.3));
            }
            
            // Eliminar el proyectil si excede el rango máximo
            if (distanceTraveled >= this.maxRange) {
                const index = engine.entities.indexOf(this);
                if (index > -1) {
                    engine.entities.splice(index, 1);
                }
                return;
            }
            
            ctx.globalAlpha = this.opacity;
            ctx.drawImage(
                this.sprite,
                0,
                0,
                this.frameWidth,
                this.frameHeight,
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );
            ctx.globalAlpha = 1.0;
    }
}
}