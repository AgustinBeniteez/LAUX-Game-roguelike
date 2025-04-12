window.MainProjectile = window.MainProjectile = class MainProjectile extends Entity {
    constructor(x, y, targetX, targetY, skillType, damage, speed = 400) {
        super(x, y);
        this.skillType = skillType;
        this.damage = damage;
        this.speed = speed;
        this.lifetime = config && config.lifetime ? config.lifetime : 2;
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
                name: 'Guardián Perseguidor',
                sprite: 'sprites/main_skills/sprite_main_skill_R_Guardian.png',
                damage: damage * 1.8,
                isHunter: true,
                lifetime: 3
            },
            mainproyectil_sentinel_r: {
                name: 'Escudo Protector',
                sprite: 'sprites/main_skills/sprite_main_skill_R_Sentinel.png',
                isNotProjectile: true,
                isShield: true,
                shieldAmount: damage * 2
            }
        };

        const config = projectileConfig[skillType];
        if (config) {
            this.name = config.name;
            // Aseguramos que el daño base se multiplique correctamente
            this.damage = config.damage || (damage * 1.0);
            this.loadSprite(config.sprite, 32, 32, 1);
        } else {
            // Si no hay configuración, mantener el daño base
            this.damage = damage;
        }

        // Manejar habilidades especiales (teletransporte, escudo y perseguidor)
        if (config && (config.isTeleport || config.isShield || config.isHunter)) {
            const player = engine.entities.find(e => !e.isEnemy);
            if (player) {
                if (config.isTeleport) {
                    // Realizar teletransporte al punto donde se hizo clic
                    player.x = targetX;
                    player.y = targetY;
                    // Actualizar la posición de la cámara inmediatamente
                    engine.cameraX = player.x - engine.gameWidth / 2;
                    engine.cameraY = player.y - engine.gameHeight / 2;
                    // Forzar un nuevo renderizado del mapa
                    engine.map.render(engine.ctx, engine.cameraX, engine.cameraY);
                } else if (config.isHunter) {
                    // El proyectil perseguidor no se elimina inmediatamente
                    this.isHunter = true;
                    return;
                } else if (config.isShield) {
                    // Aplicar escudo
                    if (!player.shield) player.shield = 0;
                    player.shield += config.shieldAmount;

                    // Actualizar la barra de vida para mostrar el escudo
                    const healthBar = document.getElementById('health-bar');
                    if (healthBar) {
                        // Crear o actualizar la barra de escudo
                        let shieldBar = document.getElementById('shield-bar');
                        if (!shieldBar) {
                            shieldBar = document.createElement('div');
                            shieldBar.id = 'shield-bar';
                            shieldBar.style.cssText = `
                                position: absolute;
                                top: 0;
                                right: 0;
                                height: 100%;
                                background: rgba(255, 255, 255, 0.7);
                                border-radius: 0 5px 5px 0;
                                transition: width 0.3s ease;
                            `;
                            healthBar.parentElement.appendChild(shieldBar);
                        }
                        // Calcular y actualizar el ancho de la barra de escudo
                        const maxHealth = player.maxHealth || 100;
                        const shieldPercentage = (player.shield / maxHealth) * 100;
                        shieldBar.style.width = `${shieldPercentage}%`;
                    }

                    // Efecto visual temporal
                    const shieldEffect = document.createElement('div');
                    shieldEffect.style.position = 'absolute';
                    shieldEffect.style.width = '100%';
                    shieldEffect.style.height = '100%';
                    shieldEffect.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                    shieldEffect.style.borderRadius = '5px';
                    document.querySelector('.health-bar').appendChild(shieldEffect);
                    setTimeout(() => shieldEffect.remove(), 300);
                }
                
                // Eliminamos la entidad del proyectil inmediatamente
                const index = engine.entities.indexOf(this);
                if (index > -1) {
                    engine.entities.splice(index, 1);
                }
                
                // Evitamos que se cree el tooltip y se inicialicen las velocidades
                return;
            }
        }

        // Encontrar el enemigo más cercano
        const enemies = engine.entities.filter(e => e.isEnemy && !e.isDead);
        if (enemies.length > 0 && (this.isHunter || !config || !config.isNotProjectile)) {
            let closestEnemy = enemies[0];
            let closestDistance = Math.sqrt(
                Math.pow(closestEnemy.x - x, 2) + 
                Math.pow(closestEnemy.y - y, 2)
            );
            
            enemies.forEach(enemy => {
                const distance = Math.sqrt(
                    Math.pow(enemy.x - x, 2) + 
                    Math.pow(enemy.y - y, 2)
                );
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestEnemy = enemy;
                }
            });
            
            // Calcular dirección hacia el enemigo más cercano
            const dx = closestEnemy.x - x;
            const dy = closestEnemy.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            this.velocityX = (dx / distance) * speed;
            this.velocityY = (dy / distance) * speed;
        } else {
            // Si no hay enemigos, ir en la dirección del cursor
            const dx = targetX - x;
            const dy = targetY - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            this.velocityX = (dx / distance) * speed;
            this.velocityY = (dy / distance) * speed;
        }

        this.width = 32;
        this.height = 32;

        // Añadir tooltip al proyectil solo si no es un proyectil de teletransporte
        if (!config || !config.isNotProjectile) {
            this.createTooltip();
        }
    }

    createTooltip() {
        // Crear el elemento del proyectil si no existe
        if (!this.element) {
            this.element = document.createElement('div');
            this.element.style.position = 'absolute';
            this.element.style.width = this.width + 'px';
            this.element.style.height = this.height + 'px';
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

    checkCollision(entity) {
        return this.x < entity.x + entity.width &&
               this.x + this.width > entity.x &&
               this.y < entity.y + entity.height &&
               this.y + this.height > entity.y;
    }

    update(dt) {
        if (engine.isPaused) return;

        // Actualizar dirección si es un proyectil perseguidor
        if (this.isHunter) {
            const enemies = engine.entities.filter(e => e.isEnemy && !e.isDead);
            if (enemies.length > 0) {
                let closestEnemy = enemies[0];
                let closestDistance = Math.sqrt(
                    Math.pow(closestEnemy.x - this.x, 2) + 
                    Math.pow(closestEnemy.y - this.y, 2)
                );
                
                enemies.forEach(enemy => {
                    const distance = Math.sqrt(
                        Math.pow(enemy.x - this.x, 2) + 
                        Math.pow(enemy.y - this.y, 2)
                    );
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestEnemy = enemy;
                    }
                });
                
                // Actualizar velocidad hacia el enemigo más cercano
                const dx = closestEnemy.x - this.x;
                const dy = closestEnemy.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                this.velocityX = (dx / distance) * this.speed;
                this.velocityY = (dy / distance) * this.speed;
            }
        }

        this.x += this.velocityX * dt;
        this.y += this.velocityY * dt;

        // Actualizar la barra de escudo si existe
        const player = engine.entities.find(e => !e.isEnemy);
        if (player) {
            const shieldBar = document.getElementById('shield-bar');
            if (shieldBar) {
                if (player.shield <= 0) {
                    shieldBar.remove(); // Eliminar la barra si no hay escudo
                } else {
                    const maxHealth = player.maxHealth || 100;
                    const shieldPercentage = (player.shield / maxHealth) * 100;
                    shieldBar.style.width = `${shieldPercentage}%`;
                }
            }
        }

        this.timeAlive += dt;
        if (this.timeAlive >= this.lifetime) {
            // Safely remove tooltip and element if they exist
            if (this.tooltip) {
                this.tooltip.remove();
            }
            if (this.element) {
                this.element.remove();
            }
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

                // Safely remove tooltip and element if they exist
                if (this.tooltip) {
                    this.tooltip.remove();
                }
                if (this.element) {
                    this.element.remove();
                }
                const projectileIndex = engine.entities.indexOf(this);
                if (projectileIndex > -1) {
                    engine.entities.splice(projectileIndex, 1);
                }
            }
        });
    }
}