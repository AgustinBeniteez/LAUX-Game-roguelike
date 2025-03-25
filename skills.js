class SkillSystem {
    constructor() {
        this.primarySkill = null;
        this.secondarySkill = null;
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

        this.selectedSkills = [];
        this.cooldowns = new Array(5).fill(0);
        this.setupEventListeners();
        this.initializeSkillIcons();
    }

    setupEventListeners() {
        document.addEventListener('weaponSelected', (event) => {
            const { weaponIndex } = event.detail;
            if (weaponIndex >= 0 && weaponIndex < this.skills.length) {
                // Si ya está seleccionada, deseleccionar
                if (this.selectedSkills[weaponIndex] === this.skills[weaponIndex]) {
                    if (this.primarySkill === this.skills[weaponIndex]) {
                        this.primarySkill = null;
                    } else if (this.secondarySkill === this.skills[weaponIndex]) {
                        this.secondarySkill = null;
                    }
                    this.selectedSkills[weaponIndex] = null;
                } else {
                    // Seleccionar nueva habilidad
                    if (!this.primarySkill) {
                        this.primarySkill = this.skills[weaponIndex];
                    } else if (!this.secondarySkill && this.skills[weaponIndex] !== this.primarySkill) {
                        this.secondarySkill = this.skills[weaponIndex];
                    }
                    this.selectedSkills[weaponIndex] = this.skills[weaponIndex];
                }
                this.updateSkillIcon(weaponIndex);
            }
        });
    }

    initializeSkillIcons() {
        const skillIcons = document.querySelectorAll('.skill-icon');
        skillIcons.forEach((icon, index) => {
            if (this.selectedSkills[index]) {
                this.updateSkillIcon(index);
            }
        });
    }

    updateSkillIcon(index) {
        const skill = this.selectedSkills[index];
        if (skill) {
            const event = new CustomEvent('weaponSelected', {
                detail: {
                    weaponIndex: index,
                    iconUrl: skill.icon
                }
            });
            document.dispatchEvent(event);
        }
    }

    useSkill(index, targetX, targetY) {
        const skill = this.selectedSkills[index];
        if (!skill || this.cooldowns[index] > 0) return false;

        // Crear el proyectil
        const player = engine.entities.find(e => !e.isEnemy && !e.isDead);
        if (!player) return false;

        // Disparar el proyectil primario
        if (this.primarySkill) {
            const primaryProjectile = new Projectile(
                player.x,
                player.y,
                targetX,
                targetY,
                this.primarySkill.projectileType,
                this.primarySkill.damage
            );
            engine.addEntity(primaryProjectile);
        }

        // Disparar el proyectil secundario si está disponible
        if (this.secondarySkill) {
            const secondaryProjectile = new Projectile(
                player.x,
                player.y,
                targetX,
                targetY,
                this.secondarySkill.projectileType,
                this.secondarySkill.damage
            );
            engine.addEntity(secondaryProjectile);
        }

        // Iniciar cooldown
        this.cooldowns[index] = skill.cooldown;
        const event = new CustomEvent('skillUsed', {
            detail: {
                skillIndex: index,
                cooldownTime: skill.cooldown * 1000
            }
        });
        document.dispatchEvent(event);

        // Actualizar cooldown
        const updateCooldown = () => {
            if (this.cooldowns[index] > 0) {
                this.cooldowns[index] -= 0.1;
                setTimeout(updateCooldown, 100);
            }
        };
        updateCooldown();

        return true;
    }
}

// Crear instancia global del sistema de habilidades
const skillSystem = new SkillSystem();