class ExperienceOrb extends Entity {
    constructor(x, y) {
        super(x, y);
        this.width = 32;
        this.height = 32;
        this.loadSprite('sprites/orbe_exp.png');
        this.expValue = 25;
        this.isCollected = false;
        this.experience = 0;
        this.baseSpeed = 200;
        this.maxSpeed = 500;
        this.attractionRange = 200;
        this.collectionRange = 40;
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
                
                // Inicializar experiencia si no existe
                if (typeof player.experience === 'undefined') {
                    player.experience = 0;
                }
                
                // Añadir experiencia
                player.experience += this.expValue;
                
                // Verificar niveles de experiencia
                const expForNextLevel = 100;
                if (player.experience >= expForNextLevel) {
                    player.experience -= expForNextLevel;
                    engine.isPaused = true;
                    
                    // Mostrar botones de mejora de habilidades
                    const skillsBar = document.getElementById('skills-bar');
                    const skillBoxes = skillsBar.getElementsByClassName('skill-box');
                    
                    for (let i = 0; i < skillBoxes.length; i++) {
                        const skill = window.skillSystem.equippedSkills[i];
                        if (skill) {
                            const upgradeButton = document.createElement('button');
                            upgradeButton.className = 'upgrade-button';
                            upgradeButton.style.cssText = 'position: absolute; top: -25px; left: 50%; transform: translateX(-50%); background: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 12px;';
                            upgradeButton.textContent = '¡Subes de nivel! +1';
                            
                            upgradeButton.addEventListener('click', () => {
                                window.skillSystem.upgradeSkill(i);
                                upgradeButton.remove();
                                engine.isPaused = false;
                            });
                            
                            skillBoxes[i].appendChild(upgradeButton);
                        }
                    }
                }
                
                // Verificar si es el último enemigo de la fase
                const remainingEnemies = engine.entities.filter(e => e.isEnemy && !e.isDead).length;
                if (remainingEnemies === 0) {
                    // Forzar subida de nivel al completar la fase
                    player.experience = expForNextLevel;
                    const expBar = document.getElementById('exp-bar');
                    if (expBar) {
                        expBar.style.width = '100%';
                    }
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