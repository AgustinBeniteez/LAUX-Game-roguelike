class Minimap {
    constructor(width = 200, height = 200) {
        this.width = width;
        this.height = height;
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
        
        // Estilo del mini-mapa
        this.canvas.style.position = 'fixed';
        this.canvas.style.bottom = '10px';
        this.canvas.style.right = '10px';
        this.canvas.style.width = '200px';
        this.canvas.style.height = '200px';
        this.canvas.style.border = '2px solid #333';
        this.canvas.style.borderRadius = '10px';
        this.canvas.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.canvas.style.zIndex = '800';
        
        document.body.appendChild(this.canvas);
    }

    update(engine) {
        const mapWidth = engine.map.getMapWidth();
        const mapHeight = engine.map.getMapHeight();
        
        // Limpiar el canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Dibujar el fondo
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Escalar las coordenadas del mapa al mini-mapa
        const scaleX = this.width / mapWidth;
        const scaleY = this.height / mapHeight;
        
        // Dibujar los enemigos y jefes
        engine.entities.forEach(entity => {
            if (entity.isExperienceOrb) {
                const x = entity.x * scaleX;
                const y = entity.y * scaleY;
                this.ctx.beginPath();
                this.ctx.fillStyle = '#5abdef';
                this.ctx.arc(x, y, 3, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (entity.isBoss) {
                const x = entity.x * scaleX;
                const y = entity.y * scaleY;
                this.ctx.beginPath();
                this.ctx.fillStyle = '#e8c32c';
                this.ctx.arc(x, y, 8, 0, Math.PI * 2);
                this.ctx.fill();
            } else if (entity.isEnemy) {
                const x = entity.x * scaleX;
                const y = entity.y * scaleY;
                this.ctx.beginPath();
                this.ctx.fillStyle = '#ff0000';
                this.ctx.arc(x, y, 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        // Dibujar el jugador
        const player = engine.entities.find(e => !e.isEnemy);
        if (player) {
            this.ctx.fillStyle = '#00ff00';
            const playerX = player.x * scaleX;
            const playerY = player.y * scaleY;
            this.ctx.beginPath();
            this.ctx.arc(playerX, playerY, 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}