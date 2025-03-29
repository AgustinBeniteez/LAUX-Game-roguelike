class ExperienceOrb extends Entity {
    constructor(x, y) {
        super(x, y);
        this.width = 16;
        this.height = 16;
        this.loadSprite('sprites/orbe_exp.png');
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
                    
                    // Mostrar botones de mejora de habilidades
                    const skillsBar = document.getElementById('skills-bar');
                    const skillBoxes = skillsBar.getElementsByClassName('skill-box');
                    
                    for (let i = 0; i < skillBoxes.length; i++) {
                        const skill = window.skillSystem.equippedSkills[i];
                        if (skill) {
                            const upgradeButton = document.createElement('button');
                            upgradeButton.className = 'upgrade-button';
                            upgradeButton.style.cssText = 'position: absolute; top: 0px; background: rgb(49 197 192); color: white; border: none; padding: 11px 10px; cursor: pointer;';
                            upgradeButton.textContent = 'LVL +1';
                            
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