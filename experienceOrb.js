class ExperienceOrb extends Entity {
    constructor(x, y) {
        super(x, y);
        this.width = 16;
        this.height = 16;
        this.loadSprite('src/assets/images/orbs/orbe_exp.png', 16, 16, 1);
        this.expValue = 25;
        this.isCollected = false;
        this.experience = 0;
        this.baseSpeed = 200;
        this.maxSpeed = 500;
        this.attractionRange = 96;
        this.collectionRange = 20;
        this.isExperienceOrb = true;
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
                
                // Actualizar el nivel del jugador
                if (typeof player.level === 'undefined') {
                    player.level = 1;
                }
                
                // Verificar niveles de experiencia
                const expForNextLevel = 5 * this.expValue * Math.pow(2, player.level - 1); // 5 orbes nivel 1, 10 nivel 2, 20 nivel 3, etc.
                const expNeeded = expForNextLevel * 25; // Multiplicamos por 25 ya que cada orbe da 25 de experiencia
                if (player.experience >= expForNextLevel) {
                    player.experience -= expForNextLevel;
                    player.level += 1;
                    engine.isPaused = true;
                    
                    // Actualizar la visualización del nivel
                    const levelDisplay = document.getElementById('level-display');
                    if (levelDisplay) {
                        levelDisplay.textContent = `Nivel: ${player.level}`;
                    }
                    
                    // Variable para rastrear si ya se ha usado la mejora del nivel
                    window.skillSystem.levelUpgradeUsed = false;

                    // Mostrar botones de mejora de habilidades
                    const skillsBar = document.getElementById('skills-bar');
                    const skillBoxes = skillsBar.getElementsByClassName('skill-box');
                    
                    // Crear botones de mejora solo para las habilidades E y R (slots 0 y 1)
                    Array.from(skillBoxes).forEach((skillBox, index) => {
                        if (index <= 1 && window.skillSystem.equippedSkills[index] !== null && window.skillSystem.equippedSkills[index] !== undefined) {
                            const upgradeButton = document.createElement('button');
                            upgradeButton.className = 'upgrade-button';
                            upgradeButton.style.cssText = 'position: absolute; top: 0px; right: 0px; background: rgb(49 197 192); color: white; border: none; padding: 11px 10px; cursor: pointer; font-size: 12px; border-radius: 0 0 0 5px; z-index: 10;';
                            upgradeButton.textContent = 'LvL +1';
                            upgradeButton.dataset.slotIndex = index.toString();
                            
                            // Añadir evento de clic para mejorar la habilidad específica
                            upgradeButton.addEventListener('click', () => {
                                if (!window.skillSystem.levelUpgradeUsed) {
                                    const slotIndex = parseInt(upgradeButton.dataset.slotIndex);
                                    // Mejorar la habilidad del slot específico
                                    window.skillSystem.upgradeSkill(slotIndex);
                                    window.skillSystem.levelUpgradeUsed = true;
                                    
                                    // Remover todos los botones de mejora y actualizar el estilo
                                    const allUpgradeButtons = skillsBar.getElementsByClassName('upgrade-button');
                                    Array.from(allUpgradeButtons).forEach(button => {
                                        button.style.background = '#666';
                                        button.style.cursor = 'not-allowed';
                                        button.disabled = true;
                                    });
                                    
                                    // Reanudar el juego después de un breve retraso para mostrar el cambio visual
                                    setTimeout(() => {
                                        Array.from(allUpgradeButtons).forEach(button => button.remove());
                                        engine.isPaused = false;
                                    }, 500);
                                }
                            });
                            
                            // Añadir el botón al slot de habilidad
                            skillBox.appendChild(upgradeButton);
                    }
                })
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
                0, 0, 16, 16, // Usar el tamaño exacto del sprite
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );
        }
    }
}