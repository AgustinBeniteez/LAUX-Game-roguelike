// Habilidad Arcana
class ArcaneSkill extends Skill {
    constructor(name, cooldown, damage) {
        super(name, cooldown, damage);
        this.skillType = 'arcane';
    }

    createProjectile(x, y, targetX, targetY) {
        const skillType = `mainproyectil_${this.skillType}_${this.name.toLowerCase()}`;
        return new MainProjectile(x, y, targetX, targetY, skillType, this.damage);
    }
}

// Habilidad Guardian
class GuardianSkill extends Skill {
    constructor(name, cooldown, damage) {
        super(name, cooldown, damage);
        this.skillType = 'guardian';
    }

    createProjectile(x, y, targetX, targetY) {
        const skillType = `mainproyectil_${this.skillType}_${this.name.toLowerCase()}`;
        return new MainProjectile(x, y, targetX, targetY, skillType, this.damage);
    }
}

// Habilidad Sentinel
class SentinelSkill extends Skill {
    constructor(name, cooldown, damage) {
        super(name, cooldown, damage);
        this.skillType = 'sentinel';
    }

    createProjectile(x, y, targetX, targetY) {
        const skillType = `mainproyectil_${this.skillType}_${this.name.toLowerCase()}`;
        return new MainProjectile(x, y, targetX, targetY, skillType, this.damage);
    }
}

// Exportar las clases
window.ArcaneSkill = ArcaneSkill;
window.GuardianSkill = GuardianSkill;
window.SentinelSkill = SentinelSkill;