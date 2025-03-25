class SkillSystem {
    constructor() {
        this.equippedSkills = new Array(5).fill(null);
        this.skillLevels = new Array(5).fill(1); // Nivel de cada habilidad equipada
        this.maxEquippedSkills = 1; // Inicialmente solo 1 slot disponible
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
                icon: 'sprites/proyectil_sprite_5.png',
                cooldown: 6.0,
                damage: 65,
                projectileType: 'dark',
                projectileSprite: 'sprites/proyectil_sprite_5.png'
            }
        ];

        this.cooldowns = new Array(5).fill(0);
        this.setupEventListeners();
        this.initializeSkillIcons();
        this.updateHUDSlots();
    }

    setupEventListeners() {
        // Seleccionar la primera habilidad por defecto
        this.equippedSkills[0] = this.skills[0];
        this.updateSkillIcon(0);

        document.addEventListener('weaponSelected', (event) => {
            const { weaponIndex } = event.detail;
            if (weaponIndex >= 0 && weaponIndex < this.skills.length) {
                const selectedSkill = this.skills[weaponIndex];
                
                // Buscar si la habilidad ya está equipada
                const existingSlotIndex = this.equippedSkills.findIndex(skill => skill && skill.name === selectedSkill.name);
                
                if (existingSlotIndex !== -1) {
                    // Mejorar la habilidad existente
                    this.skillLevels[existingSlotIndex]++;
                    this.updateSkillIcon(existingSlotIndex);
                } else {
                    // Buscar el primer slot vacío disponible
                    let slotIndex = this.equippedSkills.findIndex(slot => slot === null);
                    
                    // Si no hay slots vacíos, reemplazar la primera habilidad
                    if (slotIndex === -1) {
                        slotIndex = 0;
                        this.skillLevels[slotIndex] = 1;
                    }
                    
                    // Equipar la habilidad en el slot
                    this.equippedSkills[slotIndex] = selectedSkill;
                    this.skillLevels[slotIndex] = 1;
                    this.updateSkillIcon(slotIndex);
                }
                
                this.updateHUDSlots();
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
            skillBox.style.cssText = 'width: 50px; height: 50px; border: 2px solid #fff; border-radius: 5px; position: relative; overflow: hidden;';
            
            // Agregar estilo para slots bloqueados
            if (i >= this.maxEquippedSkills) {
                skillBox.style.opacity = '0.5';
                skillBox.style.border = '2px solid #666';
            }
            
            const skillIcon = document.createElement('div');
            skillIcon.className = 'skill-icon';
            skillIcon.style.cssText = 'width: 100%; height: 100%; background-size: contain; background-repeat: no-repeat; background-position: center;';
            
            const cooldownOverlay = document.createElement('div');
            cooldownOverlay.className = 'cooldown-overlay';
            cooldownOverlay.style.cssText = 'position: absolute; bottom: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); transform-origin: bottom; transform: scaleY(0); transition: transform 0.1s linear;';
            
            // Agregar indicador de nivel
            if (this.equippedSkills[i]) {
                const levelIndicator = document.createElement('div');
                levelIndicator.className = 'level-indicator';
                levelIndicator.style.cssText = 'position: absolute; top: 2px; right: 2px; background: rgba(255, 255, 255, 0.9); color: #000; font-size: 10px; padding: 1px 3px; border-radius: 3px;';
                levelIndicator.textContent = `Lv${this.skillLevels[i]}`;
                skillBox.appendChild(levelIndicator);
            }
            
            skillBox.appendChild(skillIcon);
            skillBox.appendChild(cooldownOverlay);
            skillsBar.appendChild(skillBox);
            
            // Actualizar icono si hay una habilidad equipada
            if (this.equippedSkills[i]) {
                this.updateSkillIcon(i);
            }
        }
        
    }

    useSkill(index, targetX, targetY) {
        const skill = this.equippedSkills[index];
        if (!skill || this.cooldowns[index] > 0 || index >= this.maxEquippedSkills) return false;

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

        for (let i = 0; i < projectileCount; i++) {
            const angle = (i - (projectileCount - 1) / 2) * spreadAngle;
            const rad = angle * Math.PI / 180;
            
            // Calcular la dirección ajustada
            const dx = targetX - player.x;
            const dy = targetY - player.y;
            const baseAngle = Math.atan2(dy, dx);
            const finalAngle = baseAngle + rad;
            
            const distance = Math.sqrt(dx * dx + dy * dy);
            const adjustedX = player.x + Math.cos(finalAngle) * distance;
            const adjustedY = player.y + Math.sin(finalAngle) * distance;

            // Disparar el proyectil con daño ajustado según el nivel
            const projectile = new Projectile(
                player.x,
                player.y,
                adjustedX,
                adjustedY,
                skill.projectileType,
                skill.damage * (1 + (level - 1) * 0.2) // 20% más de daño por nivel
            );
            engine.addEntity(projectile);
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
}

// Crear instancia global del sistema de habilidades
const skillSystem = new SkillSystem();