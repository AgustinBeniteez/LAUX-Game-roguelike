class Projectile extends Entity {
    constructor(x, y, targetX, targetY, damage, speed = 400) {
        super(x, y);
        this.damage = damage;
        this.speed = speed;
        this.lifetime = 2;
        this.timeAlive = 0;
        this.width = 32;
        this.height = 32;

        // Calcular dirección del proyectil
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.velocityX = (dx / distance) * speed;
        this.velocityY = (dy / distance) * speed;
    }

    checkCollision(entity) {
        return this.x < entity.x + entity.width &&
               this.x + this.width > entity.x &&
               this.y < entity.y + entity.height &&
               this.y + this.height > entity.y;
    }

    applyDamage(entity) {
        entity.health -= this.damage;
        const damageNumber = new FloatingNumber(entity.x + entity.width / 2, entity.y, this.damage);
        engine.addEntity(damageNumber);

        if (entity.health <= 0 && !entity.isDead) {
            entity.isDead = true;
            const expOrb = new ExperienceOrb(entity.x, entity.y);
            engine.addEntity(expOrb);
            
            const index = engine.entities.indexOf(entity);
            if (index > -1) {
                engine.entities.splice(index, 1);
                if (typeof enemiesInWave !== 'undefined') {
                    enemiesInWave--;
                }
                if (typeof saveGame === 'function') {
                    saveGame();
                }
            }
        }
    }

    update(dt) {
        if (engine.isPaused) return;

        this.x += this.velocityX * dt;
        this.y += this.velocityY * dt;

        this.timeAlive += dt;
        if (this.timeAlive >= this.lifetime) {
            const index = engine.entities.indexOf(this);
            if (index > -1) {
                engine.entities.splice(index, 1);
            }
            return;
        }

        // Detectar colisiones con enemigos
        engine.entities.forEach(entity => {
            if (entity.isEnemy && !entity.isDead && this.checkCollision(entity)) {
                this.applyDamage(entity);
                const index = engine.entities.indexOf(this);
                if (index > -1) {
                    engine.entities.splice(index, 1);
                }
            }
        });
    }
}

window.Projectile = Projectile;