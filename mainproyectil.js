class MainProjectile extends Entity {
    constructor(x, y, targetX, targetY, skillType, damage, speed = 400) {
        super(x, y);
        this.skillType = skillType;
        this.damage = damage;
        this.speed = speed;
        this.lifetime = 2;
        this.timeAlive = 0;
        
        // Configuración de proyectiles según el tipo
        const projectileConfig = {
            mainproyectil_arcane_e: {
                name: 'Bola de Daño',
                sprite: 'sprites/main_skills/sprite_main_skill_E_Arcane.png',
                damage: damage * 1.3,
                areaEffect: true
            },
            mainproyectil_guardian_e: {
                name: 'Bola de Cristal',
                sprite: 'sprites/main_skills/sprite_main_skill_E_Guardian.png',
                damage: damage * 1.4
            },
            mainproyectil_sentinel_e: {
                name: 'Estrella de Daño',
                sprite: 'sprites/main_skills/sprite_main_skill_E_Sentinel.png',
                damage: damage * 1.5
            },
            mainproyectil_arcane_r: {
                name: 'Teletransporte Arcano',
                sprite: 'sprites/main_skills/sprite_main_skill_R_Arcane.png',
                isNotProjectile: true,
                isTeleport: true
            },
            mainproyectil_guardian_r: {
                name: 'Escudo Protector',
                sprite: 'sprites/main_skills/sprite_main_skill_R_Guardian.png',
                isNotProjectile: true
            },
            mainproyectil_sentinel_r: {
                name: 'Teletransporte',
                sprite: 'sprites/main_skills/sprite_main_skill_R_Sentinel.png',
                isNotProjectile: true
            }
        };

        const config = projectileConfig[skillType];
        if (config) {
            this.name = config.name;
            this.damage = config.damage;
            this.loadSprite(config.sprite, 32, 32, 1);
        }

        // Manejar teletransporte para Arcane R
        if (config && config.isTeleport) {
            const player = engine.entities.find(e => !e.isEnemy);
            if (player) {
                // Primero realizamos el teletransporte
                player.x = targetX;
                player.y = targetY;
                
                
                // Luego eliminamos la entidad del proyectil
                setTimeout(() => {
                    const index = engine.entities.indexOf(this);
                    if (index > -1) {
                        engine.entities.splice(index, 1);
                    }
                }, 50);
                
                // Evitamos que se cree el tooltip y se inicialicen las velocidades
                return;
            }
        }

        // Calcular dirección hacia el cursor para proyectiles normales
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.velocityX = (dx / distance) * speed;
        this.velocityY = (dy / distance) * speed;

        this.width = 32;
        this.height = 32;

        // Añadir tooltip al proyectil
        this.createTooltip();
    }

    createTooltip() {
        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 14px;
            pointer-events: none;
            display: none;
            z-index: 1000;
            font-family: 'Mineglyph', sans-serif;
        `;
        tooltip.textContent = this.name;
        document.body.appendChild(tooltip);

        this.element.addEventListener('mouseover', (e) => {
            tooltip.style.display = 'block';
            tooltip.style.left = e.pageX + 10 + 'px';
            tooltip.style.top = e.pageY - 20 + 'px';
        });

        this.element.addEventListener('mouseout', () => {
            tooltip.style.display = 'none';
        });

        this.element.addEventListener('mousemove', (e) => {
            tooltip.style.left = e.pageX + 10 + 'px';
            tooltip.style.top = e.pageY - 20 + 'px';
        });

        this.tooltip = tooltip;
    }

    update(dt) {
        if (engine.isPaused) return;

        this.x += this.velocityX * dt;
        this.y += this.velocityY * dt;

        this.timeAlive += dt;
        if (this.timeAlive >= this.lifetime) {
            this.tooltip.remove();
            const index = engine.entities.indexOf(this);
            if (index > -1) {
                engine.entities.splice(index, 1);
            }
            return;
        }

        // Detectar colisiones con enemigos
        engine.entities.forEach(entity => {
            if (entity.isEnemy && !entity.isDead && this.checkCollision(entity)) {
                entity.health -= this.damage;
                
                const damageNumber = new FloatingNumber(entity.x + entity.width / 2, entity.y, this.damage);
                engine.addEntity(damageNumber);

                if (entity.health <= 0) {
                    entity.isDead = true;
                    const expOrb = new ExperienceOrb(entity.x, entity.y);
                    engine.addEntity(expOrb);
                    
                    const index = engine.entities.indexOf(entity);
                    if (index > -1) {
                        engine.entities.splice(index, 1);
                        enemiesInWave--;
                        saveGame();
                    }
                }

                this.tooltip.remove();
                const projectileIndex = engine.entities.indexOf(this);
                if (projectileIndex > -1) {
                    engine.entities.splice(projectileIndex, 1);
                }
            }
        });
    }
}