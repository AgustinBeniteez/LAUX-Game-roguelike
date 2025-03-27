class Entity {
    constructor(x, y, spriteSrc = null, isEnemy = false, bossType = null) {
      this.x = x;
      this.y = y;
      this.width = 100;
      this.height = 100;
      this.sprite = null;
      this.frameWidth = 0;
      this.frameHeight = 0;
      this.totalFrames = 1;
      this.currentFrame = 0;
      this.fps = 10;
      this.frameTimer = 0;
      this.isEnemy = isEnemy;
      this.isBoss = bossType !== null;
      this.bossType = bossType;
      this.experience = 0;
      
      // Configuración de jefes
      if (this.isBoss) {
        switch(bossType) {
          case 'plantBoss':
            this.speed = 80;
            this.health = 1000;
            this.maxHealth = 1000;
            this.damageRate = 25;
            this.width = 150;
            this.height = 150;
            this.spritePath = 'sprites/plant_enemy_boss_sprite.png';
            break;
          case 'crystalBoss':
            this.speed = 60;
            this.health = 1200;
            this.maxHealth = 1200;
            this.damageRate = 35;
            this.width = 180;
            this.height = 180;
            this.spritePath = 'sprites/plant_enemy_boss_sprite.png'; // Misma ruta temporal
            break;
          case 'shadowBoss':
            this.speed = 120;
            this.health = 900;
            this.maxHealth = 900;
            this.damageRate = 30;
            this.width = 130;
            this.height = 130;
            this.spritePath = 'sprites/plant_enemy_4_sprite.png'; // Misma ruta temporal
            break;
        }
        if (spriteSrc === null) {
          spriteSrc = this.spritePath;
        }
      } else {
        this.speed = isEnemy ? 100 : 200;
        this.health = 100;
        this.maxHealth = 100;
        this.damageRate = isEnemy ? 15 : 0;
      }
      this.isDead = false;
      this.deathSprite = null;
      this.class = null;
      this.mana = 0;
      this.maxMana = 0;
      this.stamina = 0;
      this.maxStamina = 0;
      this.inventory = [];
      this.selectedProjectile = null;
      this.projectileType = null;
      this.projectileDamage = 20;
      this.lastShotTime = 0;
      this.shootCooldown = 2.0; // Time between shots in seconds
      this.manaCost = 10; // Mana cost per shot
      
      if (spriteSrc) {
        this.loadSprite(spriteSrc);
      }
    }

    loadSprite(src, frameWidth = null, frameHeight = null, totalFrames = 1) {
      this.sprite = new Image();
      this.sprite.src = src;
      this.sprite.onload = () => {
        this.frameWidth = frameWidth || this.sprite.width;
        this.frameHeight = frameHeight || this.sprite.height;
        this.width = this.frameWidth * 2;
        this.height = this.frameHeight * 2;
        this.totalFrames = totalFrames;
      };
    }
  
    update(dt) {
      // Auto-shooting for all equipped skills
      if (!this.isDead && !engine.isPaused) {
        const currentTime = Date.now() / 1000;
        
        // Encontrar el enemigo más cercano una sola vez
        let closestEnemy = null;
        let minDistance = Infinity;
        
        engine.entities.forEach(entity => {
          if (entity.isEnemy && !entity.isDead) {
            const dx = entity.x - this.x;
            const dy = entity.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minDistance) {
              minDistance = distance;
              closestEnemy = entity;
            }
          }
        });
        
        if (closestEnemy) {
          // Iterar sobre todas las habilidades equipadas
          skillSystem.equippedSkills.forEach((skill, index) => {
            if (skill && index < skillSystem.maxEquippedSkills) {
              if (currentTime - (this.lastShotTimes?.[index] || 0) >= skill.cooldown) {
                const projectile = new Projectile(
                  this.x,
                  this.y,
                  closestEnemy.x,
                  closestEnemy.y,
                  skill.projectileType,
                  skill.damage
                );
                engine.addEntity(projectile);
                
                // Actualizar el tiempo del último disparo para esta habilidad
                if (!this.lastShotTimes) this.lastShotTimes = {};
                this.lastShotTimes[index] = currentTime;
                
                // Disparar evento para actualizar el cooldown visual
                const event = new CustomEvent('skillCooldown', {
                  detail: {
                    skillIndex: index,
                    progress: 1,
                    duration: skill.cooldown * 1000
                  }
                });
                document.dispatchEvent(event);
              }
            }
          });
        }
      }

      // Regenerate stamina over time for warrior
      if (this.class === 'warrior' && this.stamina < this.maxStamina) {
        this.stamina = Math.min(this.maxStamina, this.stamina + 15 * dt);
        document.getElementById('stamina-value').textContent = Math.ceil(this.stamina);
      }

      if (this.health <= 0 && !this.isDead) {
        if (this.isEnemy) {
          // Crear orbe de experiencia cuando muere un enemigo
          const expOrb = new ExperienceOrb(this.x + this.width/2, this.y + this.height/2);
          engine.addEntity(expOrb);
          
          // Subir de nivel automáticamente al matar al último enemigo de la fase
          const remainingEnemies = engine.entities.filter(e => e.isEnemy && !e.isDead).length;
          if (remainingEnemies === 0) {
            const player = engine.entities.find(e => !e.isEnemy && !e.isDead);
            if (player) {
              if (typeof player.experience === 'undefined') {
                player.experience = 0;
              }
              player.experience = 100; // Forzar subida de nivel
              const expBar = document.getElementById('exp-bar');
              if (expBar) {
                expBar.style.width = '100%';
              }
            }
          }
          
          this.isDead = true;
          const index = engine.entities.indexOf(this);
          if (index > -1) {
            engine.entities.splice(index, 1);
          }
          return;
        }
        this.isDead = true;
        this.deathSprite = new Image();
        this.deathSprite.src = 'sprites/player_sprite_dead.png';
        setTimeout(() => {
          const deathPanel = document.createElement('div');
          deathPanel.id = 'deathPanel';
          deathPanel.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            z-index: 4;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: Arial, sans-serif;
          `;
          
          const deathText = document.createElement('div');
          deathText.setAttribute('data-translate', 'youDied');
          deathText.style.fontSize = '48px';
          deathText.style.marginBottom = '30px';
          deathPanel.appendChild(deathText);

          const buttonContainer = document.createElement('div');
          buttonContainer.style.cssText = `
            display: flex;
            gap: 20px;
          `;

          const playAgainButton = document.createElement('button');
          playAgainButton.setAttribute('data-translate', 'playAgain');
          playAgainButton.style.cssText = `
            padding: 10px 20px;
            font-size: 18px;
            cursor: pointer;
            background: #4CAF50;
            border: none;
            border-radius: 5px;
            color: white;
          `;
          playAgainButton.onclick = () => {
            location.reload();
          };

          const exitButton = document.createElement('button');
          exitButton.setAttribute('data-translate', 'exit');
          exitButton.style.cssText = `
            padding: 10px 20px;
            font-size: 18px;
            cursor: pointer;
            background: #f44336;
            border: none;
            border-radius: 5px;
            color: white;
          `;
          exitButton.onclick = () => {
            window.location.href = 'index.html';
          };

          buttonContainer.appendChild(playAgainButton);
          buttonContainer.appendChild(exitButton);
          deathPanel.appendChild(buttonContainer);
          document.body.appendChild(deathPanel);
          loadTranslations();
        }, 1000);
        return;
      }

      if (this.isDead) return;

      if (this.totalFrames > 1) {
        this.frameTimer += dt;
        if (this.frameTimer >= 1 / this.fps) {
          this.frameTimer = 0;
          this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
        }
      }

      if (this.isEnemy && this.target && !engine.isPaused) {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const followDistance = 20; // Distancia a la que el enemigo seguirá al jugador
        const damageRange = 80; // Rango en el que el enemigo puede hacer daño
        const minEnemyDistance = 60; // Distancia mínima entre enemigos
        
        // Calcular fuerzas de separación entre enemigos
        let separationX = 0;
        let separationY = 0;
        
        engine.entities.forEach(entity => {
          if (entity !== this && entity.isEnemy && !entity.isDead) {
            const enemyDx = this.x - entity.x;
            const enemyDy = this.y - entity.y;
            const enemyDistance = Math.sqrt(enemyDx * enemyDx + enemyDy * enemyDy);
            
            if (enemyDistance < minEnemyDistance) {
              const separationForce = (minEnemyDistance - enemyDistance) / minEnemyDistance;
              separationX += (enemyDx / enemyDistance) * separationForce;
              separationY += (enemyDy / enemyDistance) * separationForce;
            }
          }
        });
        
        if (distance > followDistance) {
          // El enemigo se mueve hacia el jugador con separación
          const vx = ((dx / distance) * this.speed + separationX * this.speed * 0.5) * dt;
          const vy = ((dy / distance) * this.speed + separationY * this.speed * 0.5) * dt;
          this.x += vx;
          this.y += vy;
        } else if (distance <= damageRange && this.damageRate > 0 && this.target.health > 0) {
          // Deal damage when enemy is within damage range
          this.target.health = Math.max(0, this.target.health - this.damageRate * dt);
          // Visual feedback when taking damage
          if (this.target.health < this.target.maxHealth) {
            document.getElementById('health-value').style.color = '#ff4444';
            setTimeout(() => {
              document.getElementById('health-value').style.color = '';
            }, 100);
          }
        }
      }
    }
  
    setProjectileType(type, damage = 20) {
      this.projectileType = type;
      this.projectileDamage = damage;
    }

    shoot(targetX, targetY) {
      const currentTime = Date.now() / 1000;
      if (this.class === 'wizard') {
        if (currentTime - this.lastShotTime < 1) { // Disparo cada 1 segundo
          return;
        }
        this.lastShotTime = currentTime;

        // Encontrar el enemigo más cercano
        let nearestEnemy = null;
        let minDistance = Infinity;
        
        engine.entities.forEach(entity => {
          if (entity.isEnemy && !entity.isDead) {
            const dx = entity.x - this.x;
            const dy = entity.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
              minDistance = distance;
              nearestEnemy = entity;
            }
          }
        });

        if (!nearestEnemy) return;

        // Usar la posición del enemigo más cercano como objetivo
        const enemyX = nearestEnemy.x + nearestEnemy.width / 2;
        const enemyY = nearestEnemy.y + nearestEnemy.height / 2;
        
        let projectile;
        if (this.selectedProjectile) {
          projectile = new Projectile(
            this.x + this.width / 2,
            this.y + this.height / 2,
            enemyX,
            enemyY,
            this.selectedProjectile.type,
            this.selectedProjectile.damage,
            200
          );
          engine.addEntity(projectile);
        }
          
          engine.addEntity(projectile);
        
        
        // Auto-shoot
        setTimeout(() => {
          if (!engine.isPaused && !this.isDead) {
            this.shoot(targetX, targetY);
          }
        }, 1000); // Disparo automático cada 1 segundo
      } else if (this.class === 'warrior') {
        if (currentTime - this.lastShotTime < 0.8 || this.stamina < 25) {
          return;
        }
        this.stamina -= 25;
        this.lastShotTime = currentTime;
        // Trigger sword animation by advancing frames
        this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
        // Area damage for warrior's sword attack
        engine.entities.forEach(entity => {
          if (entity.isEnemy) {
            const dx = entity.x - this.x;
            const dy = entity.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 100) { // Sword range
              entity.health -= 30; // Sword damage
              if (entity.health <= 0) {
                engine.entities = engine.entities.filter(e => e !== entity);
              }
            }
          }
        });
        document.getElementById('stamina-value').textContent = Math.ceil(this.stamina);
      }
    }

    render(ctx) {
      if (this.isDead && this.deathSprite && this.deathSprite.complete) {
        ctx.drawImage(
          this.deathSprite,
          0, 0,
          this.deathSprite.width, this.deathSprite.height,
          this.x, this.y,
          this.width, this.height
        );
        return;
      }

      // Render health bar for enemies
      if (this.isEnemy && !this.isDead) {
        const healthBarWidth = this.width;
        const healthBarHeight = 5;
        const healthBarY = this.y - healthBarHeight - 5;
        
        // Background of health bar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.roundRect(this.x, healthBarY, healthBarWidth, healthBarHeight, 3);
        ctx.fill();
        
        // Health bar
        const healthPercentage = this.health / this.maxHealth;
        ctx.fillStyle = `rgb(${255 * (1 - healthPercentage)}, ${255 * healthPercentage}, 0)`;
        ctx.beginPath();
        ctx.roundRect(this.x, healthBarY, healthBarWidth * healthPercentage, healthBarHeight, 3);
        ctx.fill();
      }

      if (this.sprite && this.sprite.complete) {
        // Draw the main player sprite
        ctx.drawImage(
          this.sprite,
          this.currentFrame * this.frameWidth, 0,
          this.frameWidth, this.frameHeight,
          this.x, this.y,
          this.width, this.height
        );

        // Draw the weapon sprite if it exists (for wizard)
        if (this.weaponSprite && this.weaponSprite.complete && this.class === 'wizard') {
          ctx.drawImage(
            this.weaponSprite,
            this.currentFrame * this.weaponFrameWidth, 0,
            this.weaponFrameWidth, this.weaponFrameHeight,
            this.x, this.y,
            this.width, this.height
          );
        }
        // Draw the weapon sprite if it exists (for warrior)
        if (this.weaponSprite && this.weaponSprite.complete && this.class === 'warrior') {
          // Calculate the position to draw the sword relative to the player
          const swordX = this.x + this.width / 4; // Adjust sword position horizontally
          const swordY = this.y + this.height / 4; // Adjust sword position vertically
          
          ctx.save(); // Save the current context state
          
          // Rotate the sword based on the current frame
          ctx.translate(swordX + this.width / 2, swordY + this.height / 2);
          ctx.rotate((this.currentFrame / this.totalFrames) * Math.PI * 2);
          ctx.translate(-(swordX + this.width / 2), -(swordY + this.height / 2));
          
          ctx.drawImage(
            this.weaponSprite,
            this.currentFrame * this.weaponFrameWidth, 0,
            this.weaponFrameWidth, this.weaponFrameHeight,
            swordX, swordY,
            this.width, this.height
          );
          
          ctx.restore(); // Restore the context state
        }
      } else {
        // Fallback to colored rectangle if no sprite is loaded
        ctx.fillStyle = 'grey';
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
    }
  }