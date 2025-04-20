class MainProjectile extends Projectile {
    constructor(x, y, targetX, targetY, skillType, damage, speed = 400) {
        super(x, y, targetX, targetY, damage, speed);
        this.skillType = skillType;
        this.width = 32;
        this.height = 32;
        
        // Configuración de proyectiles según el tipo
        const projectileConfig = {
            mainproyectil_arcane_e: {
                name: 'Bola de Daño',
                sprite: 'src/assets/images/skills/sprite_main_skill_E_Arcane.png',
                damage: damage * 1.3,
                areaEffect: true
            },
            mainproyectil_guardian_e: {
                name: 'Bola de Cristal',
                sprite: 'src/assets/images/skills/sprite_main_skill_E_Guardian.png',
                damage: damage * 1.4
            },
            mainproyectil_sentinel_e: {
                name: 'Estrella de Daño',
                sprite: 'src/assets/images/skills/sprite_main_skill_E_Sentinel.png',
                damage: damage * 1.5
            },
            mainproyectil_arcane_r: {
                name: 'Teletransporte Arcano',
                sprite: 'src/assets/images/skills/sprite_main_skill_R_Arcane.png',
                isNotProjectile: true,
                isTeleport: true
            },
            mainproyectil_guardian_r: {
                name: 'Escudo Protector',
                sprite: 'src/assets/images/skills/sprite_main_skill_R_Guardian.png',
                isNotProjectile: true
            },
            mainproyectil_sentinel_r: {
                name: 'Escudo Protector',
                sprite: 'src/assets/images/skills/sprite_main_skill_R_Sentinel.png',
                isNotProjectile: true,
                isShield: true,
                shieldAmount: damage * 2
            }
        };

        const config = projectileConfig[skillType];
        if (config) {
            this.name = config.name;
            this.damage = config.damage || (damage * 1.0);
            this.loadSprite(config.sprite, 32, 32, 1);

            // Manejar habilidades especiales
            if (config.isNotProjectile) {
                this.handleSpecialAbility(config, targetX, targetY);
                return;
            }
        }

        this.createTooltip();
        this.initializeTargeting(targetX, targetY);
    }

    handleSpecialAbility(config, targetX, targetY) {
        const player = engine.entities.find(e => !e.isEnemy);
        if (!player) return;

        if (config.isTeleport) {
            player.x = targetX;
            player.y = targetY;
        } else if (config.isShield) {
            if (!player.shield) player.shield = 0;
            player.shield += config.shieldAmount;
            this.createShieldEffect();
        }

        const index = engine.entities.indexOf(this);
        if (index > -1) {
            engine.entities.splice(index, 1);
        }
    }

    createShieldEffect() {
        try {
            const shieldEffect = document.createElement('div');
            shieldEffect.style.cssText = `
                position: absolute;
                width: 100%;
                height: 100%;
                background-color: rgba(255, 255, 255, 0.3);
                border-radius: 5px;
            `;
            const healthBar = document.querySelector('#health-bar') || document.querySelector('.health-bar');
            if (healthBar) {
                healthBar.appendChild(shieldEffect);
                setTimeout(() => {
                    if (shieldEffect && shieldEffect.parentNode) {
                        shieldEffect.remove();
                    }
                }, 300);
            } else {
                console.warn('No se encontró el elemento health-bar');
            }
        } catch (error) {
            console.error('Error al crear el efecto de escudo:', error);
        }
    }

    initializeTargeting(targetX, targetY) {
        const enemies = engine.entities.filter(e => e.isEnemy && !e.isDead);
        if (enemies.length > 0) {
            const closestEnemy = this.findClosestEnemy(enemies);
            this.setVelocityToTarget(closestEnemy.x, closestEnemy.y);
        } else {
            this.setVelocityToTarget(targetX, targetY);
        }
    }

    findClosestEnemy(enemies) {
        return enemies.reduce((closest, enemy) => {
            const distance = Math.sqrt(
                Math.pow(enemy.x - this.x, 2) + 
                Math.pow(enemy.y - this.y, 2)
            );
            if (!closest || distance < closest.distance) {
                return { ...enemy, distance };
            }
            return closest;
        }, null);
    }

    setVelocityToTarget(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.velocityX = (dx / distance) * this.speed;
        this.velocityY = (dy / distance) * this.speed;
    }

    createTooltip() {
        try {
            if (!document.body) {
                console.warn('El elemento body no está disponible');
                return;
            }

            if (!this.element) {
                this.element = document.createElement('div');
                this.element.style.cssText = `
                    position: absolute;
                    width: ${this.width}px;
                    height: ${this.height}px;
                `;
                document.body.appendChild(this.element);
            }

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

            this.setupTooltipEvents(tooltip);
            this.tooltip = tooltip;
        } catch (error) {
            console.error('Error al crear el tooltip:', error);
        }
    }

    setupTooltipEvents(tooltip) {
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
    }

    update(dt) {
        if (engine.isPaused) return;

        super.update(dt);

        // Limpiar elementos visuales al eliminar el proyectil
        if (this.timeAlive >= this.lifetime || !engine.entities.includes(this)) {
            if (this.tooltip) this.tooltip.remove();
            if (this.element) this.element.remove();
        }
    }
}

window.MainProjectile = MainProjectile;