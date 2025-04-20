class Entity {
    constructor(x, y, spriteSrc = null, isEnemy = false, bossType = null) {
      this.x = x;
      this.y = y;
      this.width = bossType ? 150 : 100;
      this.height = bossType ? 150 : 100;
      this.sprite = null;
      this.frameWidth = 0;
      this.frameHeight = 0;
      this.totalFrames = 1;
      this.currentFrame = 0;
      this.fps = 4; // Ajustar FPS para una animación más suave
      this.frameTimer = 0;
      this.animationSpeed = 0.15; // Nueva variable para controlar la velocidad de animación
      this.isMoving = false; // Estado de movimiento
      this.lastDirection = 'right'; // Última dirección
      this.isEnemy = isEnemy;
      this.isBoss = bossType !== null;
      this.bossType = bossType;
      this.experience = 0;
      this.level = 1;
      this.statusEffects = {}; // Almacena efectos de estado activos
      this.skillPoints = 0; // Puntos de habilidad disponibles
      
      // Mostrar la barra de vida del jefe si es un jefe
      if (this.isBoss) {
        const bossHealthContainer = document.getElementById('boss-health-container');
        const bossName = document.getElementById('boss-name');
        if (bossHealthContainer && bossName) {
          bossHealthContainer.style.display = 'block';
          bossName.textContent = this.getBossName();
        }
      }
      
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
            this.spritePath = 'src/assets/images/enemies/boss_champi_sprite.png';
            break;
          case 'crystalBoss':
            this.speed = 60;
            this.health = 1200;
            this.maxHealth = 1200;
            this.damageRate = 35;
            this.width = 180;
            this.height = 180;
            this.spritePath = 'src/assets/images/enemies/plant_enemy_boss_sprite.png';
            break;
          case 'shadowBoss':
            this.speed = 120;
            this.health = 900;
            this.maxHealth = 900;
            this.damageRate = 30;
            this.width = 130;
            this.height = 130;
            this.spritePath = 'src/assets/images/enemies/plant_enemy_4_sprite.png';
            break;
          case 'mushroomBoss':
            this.speed = 50;
            this.health = 1500;
            this.maxHealth = 1500;
            this.damageRate = 40;
            this.width = 300;
            this.height = 300;
            this.spritePath = 'src/assets/images/enemies/boss_champi_sprite.png';
            this.lastSpawnTime = 0;
            this.spawnCooldown = 5.0; // Tiempo entre generación de mini champiñones
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
        this.loadSprite(localStorage.getItem('selectedSkin') || 'src/assets/images/characters/player/player_sprite.png');
      }
    }

    loadSprite(src, frameWidth = null, frameHeight = null, totalFrames = 4) {
      this.sprite = new Image();
      this.sprite.src = src;
      this.spriteUp = new Image();
      this.spriteUp.src = 'src/assets/images/characters/player/player_sprite_up.png';
      this.spriteDown = new Image();
      this.spriteDown.src = 'src/assets/images/characters/player/player_sprite_down.png';
      this.spriteHorizontal = new Image();
      this.spriteHorizontal.src = 'src/assets/images/characters/player/player_sprite_horizontal(1).png';
      this.currentDirection = 'right';
      this.isMoving = false;
      this.animationSpeed = 0.15;
      
      this.sprite.onload = () => {
        this.frameWidth = frameWidth || this.sprite.width / 4;
        this.frameHeight = frameHeight || this.sprite.height;
        this.width = this.frameWidth * 2;
        this.height = this.frameHeight * 2;
        this.totalFrames = totalFrames;
        this.currentFrame = 0;
      };
    }
  
    takeDamage(damage) {
      // El daño afecta directamente a la vida
      this.health = Math.max(0, this.health - damage);
      
      // Verificar si la entidad murió
      if (this.health <= 0) {
        this.isDead = true;
      }
    }

    applyStatusEffect(effectType, duration, params = {}) {
      this.statusEffects[effectType] = {
        duration,
        params,
        startTime: Date.now(),
        visualElement: null
      };

     
    }

    updateStatusEffects() {
      const currentTime = Date.now();
      Object.entries(this.statusEffects).forEach(([effectType, effect]) => {
        if (currentTime - effect.startTime >= effect.duration) {
          // Eliminar el elemento visual si existe
          if (effect.visualElement) {
            effect.visualElement.remove();
          }
          // Restaurar el sprite original cuando termina el efecto
          if (this.sprite && effectType === 'slow') {
            this.sprite.style.filter = '';
          }
          delete this.statusEffects[effectType];
        } else if (effect.visualElement) {
          // Actualizar posición del elemento visual y seguir al enemigo
          effect.visualElement.style.left = `${this.x}px`;
          effect.visualElement.style.top = `${this.y}px`;
        }
      });
    }

    getBossName() {
      switch(this.bossType) {
        case 'plantBoss':
          return 'BOSS PLANTA';
        case 'crystalBoss':
          return 'BOSS CRISTAL';
        case 'shadowBoss':
          return 'BOSS SOMBRA';
        case 'mushroomBoss':
          return 'BOSS CHAMPIÑÓN';
        default:
          return 'BOSS';
      }
    }

    update(dt) {
      // Actualizar efectos de estado
      this.updateStatusEffects();

      // Actualizar barra de vida del jefe si es un jefe
      if (this.isBoss) {
        const bossHealthBar = document.getElementById('boss-health-bar');
        if (bossHealthBar) {
          const healthPercentage = (this.health / this.maxHealth) * 100;
          bossHealthBar.style.width = `${healthPercentage}%`;
        }
      }

      // Lógica para generar mini champiñones si es el jefe champiñón
      if (this.isBoss && this.bossType === 'mushroomBoss' && !this.isDead) {
        const currentTime = Date.now() / 1000;
        if (currentTime - this.lastSpawnTime >= this.spawnCooldown) {
          // Generar mini champiñones alrededor del jefe
          for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 2 / 3) * i;
            const spawnDistance = 100;
            const miniX = this.x + Math.cos(angle) * spawnDistance;
            const miniY = this.y + Math.sin(angle) * spawnDistance;

            const miniEnemy = new Entity(miniX, miniY, null, true);
            miniEnemy.health = 25;
            miniEnemy.maxHealth = 25;
            miniEnemy.speed = 120;
            miniEnemy.damageRate = 10;
            miniEnemy.width = 35;
            miniEnemy.height = 35;
            miniEnemy.loadSprite('src/assets/images/enemies/mini_champi_sprite.png', 16, 16, 4);
            miniEnemy.target = this.target;
            engine.addEntity(miniEnemy);
          }
          this.lastSpawnTime = currentTime;
        }
      }
      
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
          const expOrb = new ExperienceOrb(this.x, this.y);
          engine.addEntity(expOrb);
          
          // Otorgar puntos de habilidad al subir de nivel
          const oldLevel = Math.floor(this.experience / 100) + 1;
          const newLevel = Math.floor((this.experience + expOrb.value) / 100) + 1;
          if (newLevel > oldLevel) {
            this.skillPoints++;
            skillSystem.skillPoints++;
            skillSystem.updateHUDSlots(); // Actualizar la interfaz para mostrar los nuevos puntos
          }
          
          // Marcar como muerto y eliminar el enemigo
          this.isDead = true;
          const index = engine.entities.indexOf(this);
          if (index > -1) {
            engine.entities.splice(index, 1);
          }
          return;
        }
        this.isDead = true;
        this.deathSprite = new Image();
        const selectedSkin = localStorage.getItem('selectedSkin') || 'default';
        const deathSpritePath = `src/assets/images/characters/player/player_sprite_dead.png`;
        
        
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
          deathText.style.fontSize = '7rem';
          deathText.style.fontFamily  = 'Mineglyph';
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
            padding: 15px 30px;
            font-size: 20px;
            cursor: pointer;
            background: #4caf4f2c;
            border: none;
            border-radius: 5px;
            color: white;
            font-family: 'Mineglyph', sans-serif;
            transition: background 0.3s;
          `;
          playAgainButton.onmouseover = () => {
            playAgainButton.style.background = '#4caf50';
          };
          playAgainButton.onmouseout = () => {
            playAgainButton.style.background = '#4caf4f2c';
          };
          playAgainButton.onclick = () => {
            location.reload();
          };

          const exitButton = document.createElement('button');
          exitButton.setAttribute('data-translate', 'exit');
          exitButton.style.cssText = `
            padding: 15px 30px;
            font-size: 20px;
            cursor: pointer;
            background: #f4433627;
            border: none;
            border-radius: 5px;
            color: white;
            font-family: 'Mineglyph', sans-serif;
            transition: background 0.3s;
          `;
          exitButton.onmouseover = () => {
            exitButton.style.background = '#f44336';
          };
          exitButton.onmouseout = () => {
            exitButton.style.background = '#f4433627';
          };
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

      if (this.isEnemy && !engine.isPaused) {
        // Si no tenemos posición objetivo, establecer una aleatoria cerca del centro
        if (!this.targetX || !this.targetY) {
          const centerX = engine.map.getMapWidth() / 2;
          const centerY = engine.map.getMapHeight() / 2;
          const randomAngle = Math.random() * Math.PI * 2;
          const randomDistance = Math.random() * 400; // Distancia máxima desde el centro
          this.targetX = centerX + Math.cos(randomAngle) * randomDistance;
          this.targetY = centerY + Math.sin(randomAngle) * randomDistance;
        }

        const dx = this.target ? this.target.x - this.x : this.targetX - this.x;
        const dy = this.target ? this.target.y - this.y : this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const followDistance = 20; // Distancia a la que el enemigo seguirá al jugador
        const aggroRange = 1000; // Rango de detección del jugador (10 unidades de ancho)
        const damageRange = 80; // Rango en el que el enemigo puede hacer daño
        const minEnemyDistance = 60; // Distancia mínima entre enemigos

        // Comprobar si el jugador está dentro del rango de agro
        if (this.target && Math.abs(this.target.x - this.x) <= aggroRange) {
          this.targetX = this.target.x;
          this.targetY = this.target.y;
        }

        // Comprobar si el jugador está dentro del rango de agro
        if (this.target && Math.abs(this.target.x - this.x) <= aggroRange) {
          this.targetX = this.target.x;
          this.targetY = this.target.y;
        }
        
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
          // No aplicar daño si el jugador está en el lobby
          if (window.currentMapType !== 'lobby') {
            // Deal damage when enemy is within damage range
            this.target.health = Math.max(0, this.target.health - this.damageRate * dt);
            // Visual feedback when taking damage
            if (this.target.health < this.target.maxHealth) {
              const healthValueElement = document.getElementById('health-value');
              if (healthValueElement) {
                healthValueElement.style.color = '#ff4444';
                setTimeout(() => {
                  healthValueElement.style.color = '';
                }, 100);
              }
            }
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
        const healthBarHeight = this.isBoss ? 10 : 5;
        const healthBarY = this.y - healthBarHeight - 5;
        
        // Background of health bar
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.roundRect(this.x, healthBarY, healthBarWidth, healthBarHeight, this.isBoss ? 5 : 3);
        ctx.fill();
        
        // Health bar
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.roundRect(this.x, healthBarY, (this.health / this.maxHealth) * healthBarWidth, healthBarHeight, this.isBoss ? 5 : 3);
        ctx.fill();
      }

      if (!this.isEnemy && !this.isDead) {
        let currentSprite = this.sprite;
        // Solo cambiar el sprite si el jugador está en movimiento
        if (this.isMoving) {
          if (this.currentDirection === 'up' && this.spriteUp.complete) {
            currentSprite = this.spriteUp;
          } else if (this.currentDirection === 'down' && this.spriteDown.complete) {
            currentSprite = this.spriteDown;
          } else if ((this.currentDirection === 'left' || this.currentDirection === 'right') && this.spriteHorizontal.complete) {
            currentSprite = this.spriteHorizontal;
          }
        }

        if (currentSprite && currentSprite.complete) {
          // Solo actualizar la animación si el personaje está en movimiento
          if (this.isMoving) {
            this.frameTimer += 1/60; // Usar un timer más suave
            if (this.frameTimer >= 1/this.fps) {
              this.frameTimer = 0;
              this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            }
          }

          ctx.drawImage(
            currentSprite,
            this.currentFrame * this.frameWidth, 0,
            this.frameWidth, this.frameHeight,
            this.x, this.y,
            this.width, this.height
          );
        }
      } else if (this.sprite && this.sprite.complete) {
        // Draw enemy sprite
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