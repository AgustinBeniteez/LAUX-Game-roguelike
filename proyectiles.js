class Projectile extends Entity {
    constructor(x, y, targetX, targetY, skillType = 'fire', damage = 20, speed = 400, secondarySkillType = null) {
        super(x, y);
        this.skillType = skillType;
        this.secondarySkillType = secondarySkillType;
        this.speed = speed;
        this.lifetime = 2; // Tiempo de vida en segundos
        this.timeAlive = 0;
        this.startX = x; // Posición inicial X
        this.startY = y; // Posición inicial Y
        this.maxRange = 400; // Rango máximo del proyectil
        this.opacity = 1.0; // Opacidad para el efecto de desvanecimiento
        
        // Configurar daño y sprite según el tipo de habilidad
        const skillConfig = {
            'fire': {
                damage: damage,
                sprite: 'sprites/proyectil_sprite_1.png',
                effects: { burnDamage: damage * 0.2, burnDuration: 3 }
            },
            'ice': {
                damage: damage * 1.2,
                sprite: 'sprites/frezee.png',
                effects: { slowEffect: true, slowDuration: 3, slowAmount: 0.7 }
            },
            'energy': {
                damage: damage * 1.4,
                sprite: 'sprites/proyectil_sprite_3.png',
                effects: { areaEffect: true, areaRadius: 80, areaDamageMultiplier: 0.5 }
            },
            'shock': {
                damage: damage * 1.6,
                sprite: 'sprites/proyectil_sprite_4.png',
                effects: { chainEffect: true, chainRange: 100, chainCount: 3, chainDamageMultiplier: 0.7 }
            },
            'dark': {
                damage: damage * 1.8,
                sprite: 'sprites/proyectil_sprite_leaves.png',
                effects: { vortexEffect: true, vortexRadius: 100, vortexPull: 50, vortexDamageMultiplier: 0.2 }
            }
        };

        const config = skillConfig[skillType] || skillConfig['fire'];
        this.damage = config.damage;
        this.loadSprite(config.sprite, 32, 32, 1);
        this.effects = config.effects;
        
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

        // Efectos especiales según la combinación de habilidades
        if (this.secondarySkillType) {
            switch(this.skillType + '_' + this.secondarySkillType) {
                case 'fire_ice':
                    // Efecto de vapor que daña y ralentiza
                    this.damage *= 1.5;
                    this.slowEffect = true;
                    break;
                case 'energy_shock':
                    // Efecto de tormenta eléctrica con mayor área
                    this.areaRadius *= 1.5;
                    this.chainEffect = true;
                    break;
                case 'dark_ice':
                    // Efecto de congelación oscura
                    this.vortexEffect = true;
                    this.slowEffect = true;
                    this.damage *= 1.3;
                    break;
            }
        }

        // Detectar colisiones con enemigos
        engine.entities.forEach(entity => {
            if (entity.isEnemy && !entity.isDead) {
                // Verificar colisión con el enemigo
                if (this.checkCollision(entity)) {
                    // Aplicar daño al enemigo
                    entity.health -= this.damage;
                    
                    // Crear número flotante de daño
                    const damageNumber = new FloatingNumber(entity.x + entity.width / 2, entity.y, this.damage);
                    engine.addEntity(damageNumber);
                    
                    // Comportamiento especial para cada tipo de habilidad
                    if (this.skillType === 'energy') {
                        // Efecto de área para la explosión de energía
                        engine.entities.forEach(nearbyEntity => {
                            if (nearbyEntity.isEnemy && !nearbyEntity.isDead && nearbyEntity !== entity) {
                                const dx = nearbyEntity.x - this.x;
                                const dy = nearbyEntity.y - this.y;
                                const distance = Math.sqrt(dx * dx + dy * dy);
                                
                                if (distance <= this.areaRadius) {
                                    // El daño disminuye con la distancia
                                    const damageMultiplier = 1 - (distance / this.areaRadius);
                                    nearbyEntity.health -= this.damage * damageMultiplier;
                                }
                            }
                        });
                    } else if (this.skillType === 'shock') {
                        // Efecto de cadena para la onda de choque
                        let chainedEnemies = 0;
                        const maxChains = 3;
                        const chainRange = 120;
                        
                        const chainLightning = (sourceEntity) => {
                            if (chainedEnemies >= maxChains) return;
                            
                            engine.entities.forEach(nearbyEntity => {
                                if (nearbyEntity.isEnemy && !nearbyEntity.isDead && nearbyEntity !== sourceEntity) {
                                    const dx = nearbyEntity.x - sourceEntity.x;
                                    const dy = nearbyEntity.y - sourceEntity.y;
                                    const distance = Math.sqrt(dx * dx + dy * dy);
                                    
                                    if (distance <= chainRange) {
                                        nearbyEntity.health -= this.damage * 0.7;
                                        chainedEnemies++;
                                        chainLightning(nearbyEntity);
                                    }
                                }
                            });
                        };
                        
                        chainLightning(entity);
                    } else if (this.skillType === 'ice') {
                        // Efecto de ralentización
                        entity.speed *= 0.7;
                        entity.applyStatusEffect('slow', 3000, { speedMultiplier: 0.7 });
                        setTimeout(() => {
                            if (entity && !entity.isDead) {
                                entity.speed /= 0.7;
                            }
                        }, 3000);
                    } else if (this.skillType === 'dark') {
                        // Efecto de vórtice
                        const vortexRadius = 100;
                        engine.entities.forEach(nearbyEntity => {
                            if (nearbyEntity.isEnemy && !nearbyEntity.isDead) {
                                const dx = nearbyEntity.x - this.x;
                                const dy = nearbyEntity.y - this.y;
                                const distance = Math.sqrt(dx * dx + dy * dy);
                                
                                if (distance <= vortexRadius) {
                                    const angle = Math.atan2(dy, dx);
                                    nearbyEntity.x -= Math.cos(angle) * 50 * engine.deltaTime;
                                    nearbyEntity.y -= Math.sin(angle) * 50 * engine.deltaTime;
                                    nearbyEntity.health -= this.damage * 0.2;
                                }
                            }
                        });
                    }
                    // Eliminar el proyectil al impactar
                    const index = engine.entities.indexOf(this);
                    if (index > -1) {
                        engine.entities.splice(index, 1);
                    }

                    // Verificar si el enemigo murió
                    if (entity.health <= 0) {
                        entity.isDead = true;
                        // Crear orbe de experiencia en la posición del enemigo
                        const expOrb = new ExperienceOrb(entity.x, entity.y);
                        engine.addEntity(expOrb);
                        
                        const index = engine.entities.indexOf(entity);
                        if (index > -1) {
                            engine.entities.splice(index, 1);
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