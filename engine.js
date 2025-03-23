class Engine {
    constructor(canvasId, gameWidth = 120000, gameHeight = 600) {
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
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.togglePause();
        }
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
      this.entities.forEach(e => e.update(dt));
    }
  
    render() {
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
        document.getElementById('health-value').textContent = Math.ceil(player.health);
        document.getElementById('speed-value').textContent = player.speed;
        document.getElementById('position-value').textContent = `X: ${Math.round(player.x)}, Y: ${Math.round(player.y)}`;
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
  }
  