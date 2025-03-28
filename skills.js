class SkillSystem {
    constructor() {
        this.equippedSkills = new Array(5).fill(null);
        this.skillLevels = new Array(5).fill(1); // Nivel de cada habilidad equipada
        this.maxEquippedSkills = 5; // Todos los slots disponibles desde el inicio
        this.lastAutoFireTime = new Array(5).fill(0); // Tiempo del último disparo automático
        this.maxSkillLevel = 10; // Nivel máximo de cada habilidad
        this.skills = [
            {
                name: 'Proyectil de Fuego',
                icon: 'sprites/proyectil_sprite_1.png',
                cooldown: 2.0,
                damage: 25,
                projectileType: 'fire',
                projectileSprite: 'sprites/proyectil_sprite_1.png'
            },
            {
                name: 'Rayo de Hielo',
                icon: 'sprites/proyectil_sprite_2.png',
                cooldown: 3.0,
                damage: 35,
                projectileType: 'ice',
                projectileSprite: 'sprites/proyectil_sprite_2.png'
            },
            {
                name: 'Explosión de Energía',
                icon: 'sprites/proyectil_sprite_3.png',
                cooldown: 4.0,
                damage: 45,
                projectileType: 'energy',
                projectileSprite: 'sprites/proyectil_sprite_3.png'
            },
            {
                name: 'Onda de Choque',
                icon: 'sprites/proyectil_sprite_4.png',
                cooldown: 5.0,
                damage: 55,
                projectileType: 'shock',
                projectileSprite: 'sprites/proyectil_sprite_4.png'
            },
            {
                name: 'Vórtice Oscuro',
                icon: 'sprites/proyectil_sprite_leaves.png',
                cooldown: 5.0,
                damage: 65,
                projectileType: 'dark',
                projectileSprite: 'sprites/proyectil_sprite_leaves.png'
            }
        ];

        this.cooldowns = new Array(5).fill(0);
        this.setupEventListeners();
        this.initializeSkillIcons();
        this.updateHUDSlots();
        this.startAutoFire();
    }

    setupEventListeners() {
        // No seleccionar ninguna habilidad por defecto
        this.equippedSkills[0] = null;
        this.updateSkillIcon(0);

        document.addEventListener('weaponSelected', (event) => {
            const { weaponIndex } = event.detail;
            if (weaponIndex >= 0 && weaponIndex < this.skills.length) {
                const selectedSkill = this.skills[weaponIndex];
                const existingSkillIndex = this.equippedSkills.findIndex(skill => skill && skill.name === selectedSkill.name);

                if (existingSkillIndex !== -1) {
                    // Upgrade skill level if already equipped
                    this.upgradeSkill(existingSkillIndex);
                } else {
                    // Find the first empty slot
                    let slotIndex = this.equippedSkills.findIndex(slot => slot === null);

                    if (slotIndex === -1) {
                        // Prompt to replace an existing skill
                        slotIndex = prompt('No hay huecos disponibles. Elige una habilidad para reemplazar:', this.equippedSkills.map(skill => skill.name).join(', '));
                        if (slotIndex === null || slotIndex < 0 || slotIndex >= this.equippedSkills.length) return;
                    }

                    // Equip the new skill
                    this.equippedSkills[slotIndex] = selectedSkill;
                    this.skillLevels[slotIndex] = 1; // Inicializar nivel de habilidad a 1
                    this.updateSkillIcon(slotIndex);
                    this.updateHUDSlots();
                }

                // Resume the game after selection
                engine.isPaused = false;
                // La selección de habilidades ha sido desactivada
            }
        });
    }

    initializeSkillIcons() {
        const skillIcons = document.querySelectorAll('.skill-icon');
        skillIcons.forEach((icon, index) => {
            if (this.equippedSkills[index]) {
                this.updateSkillIcon(index);
            }
        });
    }

    unlockSkillSlot() {
        if (this.maxEquippedSkills < 5) {
            this.maxEquippedSkills++;
            this.updateHUDSlots();
            return true;
        }
        return false;
    }

    updateSkillIcon(index) {
        const skill = this.equippedSkills[index];
        if (skill) {
            const skillIcon = document.querySelector(`#skill-slot-${index} .skill-icon`);
            if (skillIcon) {
                skillIcon.style.backgroundImage = `url('${skill.icon}')`;
            }
        }
    }

    updateHUDSlots() {
        const skillsBar = document.getElementById('skills-bar');
        skillsBar.innerHTML = '';
        
        // Crear 5 slots de habilidades
        for (let i = 0; i < 5; i++) {
            const skillBox = document.createElement('div');
            skillBox.id = `skill-slot-${i}`;
            skillBox.className = 'skill-box';
            skillBox.style.cssText = 'width: 50px; height: 50px; border: 2px solid #fff; border-radius: 5px; position: relative; overflow: hidden; margin: 0 5px; box-shadow: 0 0 10px rgba(255, 255, 255, 0.7); background: rgba(0, 0, 0, 0.3);';
            
            // Todos los slots tienen el mismo estilo
            skillBox.style.opacity = '1';
            skillBox.style.border = '2px solid #fff';
            skillBox.style.boxShadow = '0 0 5px rgba(255, 255, 255, 0.5)';
            
            const skillIcon = document.createElement('div');
            skillIcon.className = 'skill-icon';
            skillIcon.style.cssText = 'width: 100%; height: 100%; background-size: contain; background-repeat: no-repeat; background-position: center;';
            
            const cooldownOverlay = document.createElement('div');
            cooldownOverlay.className = 'cooldown-overlay';
            cooldownOverlay.style.cssText = 'position: absolute; bottom: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); transform-origin: bottom; transform: scaleY(0); transition: transform 0.1s linear; pointer-events: none;';
            
            const levelIndicator = document.createElement('div');
            levelIndicator.className = 'level-indicator';
            levelIndicator.style.cssText = 'position: absolute; top: 2px; right: 2px; background: rgba(255, 255, 255, 0.9); color: #000; font-size: 10px; padding: 1px 3px; border-radius: 3px;';
            levelIndicator.textContent = `Lv${this.skillLevels[i]}`;
            skillBox.appendChild(levelIndicator);
            
            // Agregar botón de mejora para cada slot
            const upgradeButton = document.createElement('button');
            upgradeButton.className = 'upgrade-button';
            upgradeButton.style.cssText = 'position: absolute; bottom: 2px; right: 2px; background: gold; color: black; border: none; border-radius: 3px; padding: 2px 4px; font-size: 10px; cursor: pointer; display: none;';
            upgradeButton.textContent = '+';
            upgradeButton.onclick = () => this.upgradeSkill(i);
            skillBox.appendChild(upgradeButton);
            
            // Mostrar botón de mejora si hay una habilidad equipada y no está al nivel máximo
            if (this.equippedSkills[i] && this.skillLevels[i] < this.maxSkillLevel) {
                upgradeButton.style.display = 'block';
            }
            
            skillBox.appendChild(skillIcon);
            skillBox.appendChild(cooldownOverlay);
            skillsBar.appendChild(skillBox);
            
            if (this.equippedSkills[i]) {
                this.updateSkillIcon(i);
                // Mostrar botón de mejora si hay una habilidad equipada y no está al nivel máximo
                const upgradeButton = skillBox.querySelector('.upgrade-button');
                if (upgradeButton && this.skillLevels[i] < this.maxSkillLevel) {
                    upgradeButton.style.display = 'block';
                }
            }
        }
        
    }

    upgradeSkill(index) {
        if (!this.equippedSkills[index] || this.skillLevels[index] >= this.maxSkillLevel) return;
        
        // Crear una copia de la habilidad base si no existe
        if (!this.equippedSkills[index].baseStats) {
            this.equippedSkills[index].baseStats = {
                damage: this.equippedSkills[index].damage,
                cooldown: this.equippedSkills[index].cooldown
            };
        }
        
        this.skillLevels[index]++;
        const level = this.skillLevels[index];
        
        // Calcular las estadísticas basadas en el nivel actual
        const baseStats = this.equippedSkills[index].baseStats;
        this.equippedSkills[index].damage = Math.floor(baseStats.damage * (1 + (level - 1) * 0.2)); // +20% por nivel
        this.equippedSkills[index].cooldown = Math.max(0.5, baseStats.cooldown * Math.pow(0.9, level - 1)); // -10% por nivel
        
        // Actualizar el indicador de nivel solo para este slot
        const skillBox = document.querySelector(`#skill-slot-${index}`);
        if (skillBox) {
            const levelIndicator = skillBox.querySelector('.level-indicator');
            if (levelIndicator) {
                levelIndicator.textContent = `Lv${this.skillLevels[index]}`;
            }
            
            // Ocultar botón de mejora si alcanza el nivel máximo
            const upgradeButton = skillBox.querySelector('.upgrade-button');
            if (upgradeButton && this.skillLevels[index] >= this.maxSkillLevel) {
                upgradeButton.style.display = 'none';
            }
        }
    }

    useSkill(index, targetX, targetY) {
        const skill = this.equippedSkills[index];
        if (!skill || this.cooldowns[index] > 0) return false;

        // Crear el proyectil
        const player = engine.entities.find(e => !e.isEnemy && !e.isDead);
        if (!player) return false;

        const level = this.skillLevels[index];
        const projectileCount = Math.min(level, 3); // Máximo 3 proyectiles
        const spreadAngle = 15; // Grados de separación entre proyectiles

        // Iniciar cooldown antes de crear los proyectiles
        this.cooldowns[index] = skill.cooldown;
        const cooldownOverlay = document.querySelector(`#skill-slot-${index} .cooldown-overlay`);
        if (cooldownOverlay) {
            cooldownOverlay.style.transform = 'scaleY(1)';
            cooldownOverlay.style.transition = `transform ${skill.cooldown}s linear`;
            setTimeout(() => {
                cooldownOverlay.style.transform = 'scaleY(0)';
            }, skill.cooldown * 1000);
        }

        // Crear proyectiles según el tipo de habilidad
        for (let i = 0; i < projectileCount; i++) {
            const angle = (i - (projectileCount - 1) / 2) * spreadAngle;
            const rad = angle * Math.PI / 180;
            
            // Calcular la dirección ajustada
            const dx = targetX - player.x;
            const dy = targetY - player.y;
            const baseAngle = Math.atan2(dy, dx);
            const finalAngle = baseAngle + rad;
            
            // Crear el proyectil con el tipo específico de la habilidad
            const projectile = new Projectile(
                player.x,
                player.y,
                player.x + Math.cos(finalAngle) * 1000,
                player.y + Math.sin(finalAngle) * 1000,
                skill.projectileType,
                skill.damage * (1 + (level - 1) * 0.2)
            );
            
            engine.entities.push(projectile);
        }

        // Emitir evento de uso de habilidad
        const event = new CustomEvent('skillUsed', {
            detail: {
                skillIndex: index,
                cooldownTime: skill.cooldown * 1000
            }
        });
        document.dispatchEvent(event);

        // Actualizar cooldown con requestAnimationFrame para mejor rendimiento
        const startTime = performance.now();
        const updateCooldown = (currentTime) => {
            const elapsed = (currentTime - startTime) / 1000;
            if (elapsed < skill.cooldown) {
                this.cooldowns[index] = skill.cooldown - elapsed;
                requestAnimationFrame(updateCooldown);
            } else {
                this.cooldowns[index] = 0;
            }
        };
        requestAnimationFrame(updateCooldown);

        return true;
    }

    startAutoFire() {
        setInterval(() => {
            if (engine.isPaused || engine.isRoundTransition) return;
            
            const player = engine.entities.find(e => !e.isEnemy && !e.isDead);
            if (!player) return;
            
            // Encontrar el enemigo más cercano
            const nearestEnemy = engine.entities
                .filter(e => e.isEnemy && !e.isDead)
                .reduce((nearest, current) => {
                    const distToCurrent = Math.hypot(current.x - player.x, current.y - player.y);
                    const distToNearest = nearest ? Math.hypot(nearest.x - player.x, nearest.y - player.y) : Infinity;
                    return distToCurrent < distToNearest ? current : nearest;
                }, null);
            
            if (nearestEnemy) {
                // Disparar todas las habilidades equipadas si están disponibles
                for (let i = 0; i < this.maxEquippedSkills; i++) {
                    const skill = this.equippedSkills[i];
                    if (skill) {
                        const currentTime = Date.now();
                        if (currentTime - this.lastAutoFireTime[i] >= skill.cooldown * 1000) {
                            this.useSkill(i, nearestEnemy.x, nearestEnemy.y);
                            this.lastAutoFireTime[i] = currentTime;
                        }
                    }
                }
            }
        }, 100); // Verificar cada 100ms
    }
}

// Crear instancia global del sistema de habilidades
const skillSystem = new SkillSystem();