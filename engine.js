class Engine {
    constructor(canvasId, gameWidth = 120000, gameHeight = 600) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.fps = 0;
        this.fpsUpdateInterval = 1000;
        this.lastFpsUpdate = performance.now();

        // Cargar configuraciones
        this.showFPS = localStorage.getItem('showFPS') === 'on';
        this.damageNumbersEnabled = localStorage.getItem('damageNumbers') !== 'off';
        this.brightness = localStorage.getItem('brightness') || '100';
        this.soundVolume = parseInt(localStorage.getItem('soundVolume')) || 70;
        this.musicVolume = parseInt(localStorage.getItem('musicVolume')) || 70;

        // Aplicar brillo
        document.body.style.filter = `brightness(${this.brightness}%)`;

        // Mostrar/ocultar FPS
        const fpsContainer = document.getElementById('fps-container');
        if (fpsContainer) {
            fpsContainer.style.display = this.showFPS ? 'block' : 'none';
        }
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.fps = 0;
        this.fpsUpdateInterval = 1000;
        this.lastFpsUpdate = performance.now();

        // Cargar configuraciones
        this.showFPS = localStorage.getItem('showFPS') === 'on';
        this.damageNumbersEnabled = localStorage.getItem('damageNumbers') !== 'off';
        this.brightness = localStorage.getItem('brightness') || '100';
        this.soundVolume = parseInt(localStorage.getItem('soundVolume')) || 70;
        this.musicVolume = parseInt(localStorage.getItem('musicVolume')) || 70;

        // Aplicar brillo
        document.body.style.filter = `brightness(${this.brightness}%)`;

      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.entities = [];
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;
      this.isPaused = false;
      this.hud = null;
      this.map = new Map();
      this.cameraX = 0;
      this.cameraY = 0;
      this.minimap = new Minimap();
      
      this.setupCanvas();
      window.addEventListener('resize', () => this.setupCanvas());
      
      // Inicializar sistema de habilidades activables
      this.activeAbilities = {
        E: { cooldown: 0, maxCooldown: 0, icon: null },
        R: { cooldown: 0, maxCooldown: 0, icon: null }
      };
      
      // Cargar habilidades del jugador desde localStorage
      const playerData = JSON.parse(localStorage.getItem('playerData') || '{}');
      if (playerData.abilities) {
        this.activeAbilities.E = {
          ...playerData.abilities[0],
          cooldown: 0,
          maxCooldown: playerData.abilities[0].cooldown * 1000
        };
        this.activeAbilities.R = {
          ...playerData.abilities[1],
          cooldown: 0,
          maxCooldown: playerData.abilities[1].cooldown * 1000
        };
        
        // Actualizar iconos de habilidades
        document.getElementById('skill-e-icon').style.backgroundImage = `url('${this.activeAbilities.E.icon}')`;
        document.getElementById('skill-r-icon').style.backgroundImage = `url('${this.activeAbilities.R.icon}')`;
      }
      
      // Event listeners para habilidades
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.togglePause();
        } else if ((e.key === 'e' || e.key === 'E') && !this.isPaused) {
          this.useAbility('E');
        } else if ((e.key === 'r' || e.key === 'R') && !this.isPaused) {
          this.useAbility('R');
        }
      });
      
      // Mouse position tracking
      this.mouseX = 0;
      this.mouseY = 0;
      window.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = (e.clientX - rect.left) * (this.gameWidth / this.canvas.width) + this.cameraX;
        this.mouseY = (e.clientY - rect.top) * (this.gameHeight / this.canvas.height) + this.cameraY;
      });

      // Setup pause menu button handlers
      document.getElementById('resumeButton').addEventListener('click', () => this.togglePause());
      document.getElementById('settingsButton').addEventListener('click', () => {
        // Add settings functionality here
        console.log('Settings clicked');
      });
    }

    setupCanvas() {
      const windowRatio = window.innerWidth / window.innerHeight;
      const gameRatio = this.gameWidth / this.gameHeight;

      if (windowRatio > gameRatio) {
        this.canvas.height = window.innerHeight;
        this.canvas.width = window.innerHeight * gameRatio;
      } else {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerWidth / gameRatio;
      }

      this.ctx.imageSmoothingEnabled = false;
    }
  
    addEntity(entity) {
      this.entities.push(entity);
    }
  
    update(dt) {
        // Actualizar FPS
        this.frameCount++;
        const currentTime = performance.now();
        if (currentTime - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsUpdate));
            if (this.showFPS) {
                const fpsValue = document.getElementById('fps-value');
                if (fpsValue) {
                    fpsValue.textContent = this.fps;
                }
            }
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
      this.entities.forEach(e => e.update(dt));
    }
  
    render() {
      // Mostrar FPS si está activado
      if (localStorage.getItem('showFPS') === 'on') {
        const now = performance.now();
        const fps = Math.round(1000 / (now - this.lastFrame));
        this.ctx.fillStyle = 'white';
        this.ctx.font = '16px Mineglyph';
        this.ctx.fillText(`FPS: ${fps}`, 10, 20);
        this.lastFrame = now;
      }

      // Actualizar barra de vida del jefe
      const boss = this.entities.find(e => e.isBoss && !e.isDead);
      if (boss) {
        const bossContainer = document.getElementById('boss-health-container');
        const bossHealthBar = document.getElementById('boss-health-bar');
        const bossName = document.getElementById('boss-name');
        
        if (bossContainer && bossHealthBar && bossName) {
          bossContainer.style.display = 'block';
          bossHealthBar.style.width = `${(boss.health / boss.maxHealth) * 100}%`;
          bossHealthBar.style.backgroundColor = '#ff0000';
          bossName.textContent = boss.getBossName();
        }
      } else {
        const bossContainer = document.getElementById('boss-health-container');
        if (bossContainer) {
          bossContainer.style.display = 'none';
        }
      }

      const player = this.entities.find(e => !e.isEnemy);
      if (player) {
        // Mantener al jugador en el centro de la pantalla
        this.cameraX = player.x - this.gameWidth / 2;
        this.cameraY = player.y - this.gameHeight / 2;
        // Actualizar el minimapa
        this.minimap.update(this);
        
        // Asegurar que la cámara no se salga de los límites del mapa
        this.cameraX = Math.max(0, Math.min(this.cameraX, this.map.getMapWidth() - this.gameWidth));
        this.cameraY = Math.max(0, Math.min(this.cameraY, this.map.getMapHeight() - this.gameHeight));
      }

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.save();
      
      // Apply proper scaling
      const scale = Math.min(
        this.canvas.width / this.gameWidth,
        this.canvas.height / this.gameHeight
      );
      this.ctx.scale(scale, scale);
      
      // Center the game view
      const offsetX = (this.canvas.width / scale - this.gameWidth) / 2;
      const offsetY = (this.canvas.height / scale - this.gameHeight) / 2;
      this.ctx.translate(offsetX, offsetY);
      
      // Render map with camera offset
      this.map.render(this.ctx, this.cameraX, this.cameraY);
      
      // Render entities with camera offset
      this.entities.forEach(e => {
        this.ctx.save();
        this.ctx.translate(-this.cameraX, -this.cameraY);
        e.render(this.ctx);
        this.ctx.restore();
      });
      
      this.ctx.restore();
      
      // Update HUD elements
      if (player) {
        const healthBar = document.getElementById('health-bar');
        const healthText = document.getElementById('health-text');
        const speedValue = document.getElementById('speed-value');
        const positionValue = document.getElementById('position-value');

        if (healthBar && healthText) {
          const healthPercentage = (player.health / player.maxHealth) * 100;
          healthBar.style.width = `${healthPercentage}%`;
          healthText.textContent = `${Math.round(player.health)}/${player.maxHealth}`;
        }
        if (speedValue) speedValue.textContent = Math.round(player.speed);
        if (positionValue) positionValue.textContent = `X: ${Math.round(player.x)}, Y: ${Math.round(player.y)}`;
      }
    }

    togglePause() {
      this.isPaused = !this.isPaused;
      const pauseMenu = document.getElementById('pauseMenu');
      pauseMenu.style.display = this.isPaused ? 'flex' : 'none';
      if (!this.isPaused) {
        pauseMenu.style.display = 'none';
      }
    }

    useAbility(key) {
      const ability = this.activeAbilities[key];
      if (!ability || ability.cooldown > 0) return;

      const player = this.entities.find(e => !e.isEnemy);
      if (!player) return;

      // Calcular dirección hacia el cursor
      const dx = this.mouseX - player.x;
      const dy = this.mouseY - player.y;
      const angle = Math.atan2(dy, dx);

      // Crear proyectil
      const projectile = new Projectile({
        x: player.x,
        y: player.y,
        angle: angle,
        speed: 400,
        damage: ability.damage,
        sprite: ability.icon,
        type: key === 'E' ? 'ability_e' : 'ability_r'
      });

      this.addEntity(projectile);

      // Iniciar cooldown
      ability.cooldown = ability.maxCooldown;

      // Actualizar UI de cooldown
      const cooldownOverlay = document.getElementById(`skill-${key.toLowerCase()}-cooldown`);
      const cooldownTimer = document.getElementById(`skill-${key.toLowerCase()}-timer`);
      if (cooldownOverlay && cooldownTimer) {
        cooldownOverlay.style.transform = 'scaleY(1)';
        cooldownTimer.style.display = 'block';

        // Actualizar el temporizador cada 100ms
        const updateTimer = () => {
          if (ability.cooldown <= 0) {
            cooldownOverlay.style.transform = 'scaleY(0)';
            cooldownTimer.style.display = 'none';
            return;
          }

          const secondsLeft = Math.ceil(ability.cooldown / 1000);
          cooldownTimer.textContent = secondsLeft;
          cooldownOverlay.style.transform = `scaleY(${ability.cooldown / ability.maxCooldown})`;

          ability.cooldown = Math.max(0, ability.cooldown - 100);
          setTimeout(updateTimer, 100);
        };

        updateTimer();
      }
    }
  }
  