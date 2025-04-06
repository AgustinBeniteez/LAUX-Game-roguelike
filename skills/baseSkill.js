class Skill {
    constructor(name, cooldown, damage) {
        this.name = name;
        this.cooldown = cooldown;
        this.damage = damage;
        this.currentCooldown = 0;
    }

    canUse() {
        return this.currentCooldown <= 0;
    }

    update(dt) {
        if (this.currentCooldown > 0) {
            this.currentCooldown -= dt;
        }
    }

    use(x, y, targetX, targetY) {
        if (!this.canUse()) return null;
        this.currentCooldown = this.cooldown;
        return this.createProjectile(x, y, targetX, targetY);
    }

    createProjectile(x, y, targetX, targetY) {
        // Método a ser sobrescrito por las clases hijas
        return null;
    }
}

window.Skill = Skill;