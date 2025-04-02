class Map {
    constructor(tileSize = 64) {
        this.tileSize = tileSize;
        this.mapData = [
            [1, 1, 2, 1, 1, 1, 1, 1, 2, 33, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1, 1, 1, 1, 32, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 2, 1, 1, 34, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
            [1, 32, 2, 0, 2, 0, 1, 0, 2, 33, 2, 0, 0, 0, 1, 33, 0, 2, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 3],
            [13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 19, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13],
            [13, 13, 16, 17, 12, 18, 13, 13, 13, 13, 13, 16, 13, 12, 13, 13, 17, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13],
            [13, 22, 13, 13, 13, 13, 13, 13, 13, 13, 14, 13, 25, 13, 13, 12, 16, 13, 13, 13, 13, 12, 13, 16, 13, 13, 13, 19, 13, 13, 13, 13],
            [13, 13, 13, 13, 13, 19, 17, 13, 12, 13, 13, 17, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 19, 13, 13, 13, 13, 13],
            [13, 19, 13, 23, 16, 13, 13, 25, 13, 22, 16, 14, 13, 15, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13],
            [13, 13, 13, 13, 13, 13, 17, 13, 15, 13, 13, 13, 13, 13, 12, 13, 13, 13, 16, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13],
            [23, 12, 22, 13, 13, 13, 13, 21, 22, 13, 12, 13, 18, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 12, 13, 13, 13, 13, 13],
            [13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 19, 13, 13, 15, 13, 17, 19, 13, 13, 13, 16, 13, 13, 13, 13, 13, 13],
            [13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 16, 13, 13, 13, 13, 13, 12, 13, 13, 13, 17, 13, 13, 13, 13, 13, 13],
            [13, 13, 13, 25, 13, 13, 13, 13, 22, 13, 13, 13, 22, 13, 13, 12, 13, 13, 13, 13, 13, 13, 13, 14, 13, 13, 13, 13, 13, 13, 13, 13],
            [13, 13, 13, 13, 13, 13, 13, 13, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13],
            [13, 13, 13, 13, 12, 17, 13, 13, 13, 25, 13, 13, 13, 13, 13, 17, 13, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13],
            [13, 17, 12, 25, 19, 13, 13, 13, 13, 13, 19, 13, 13, 13, 13, 13, 19, 13, 13, 13, 13, 13, 13, 13, 12, 15, 13, 19, 13, 13, 13, 13],
            [13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 17, 13, 12, 13, 13, 13, 13],
            [13, 13, 13, 13, 13, 13, 13, 13, 17, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 19, 13, 13, 13, 13, 13, 13, 13]
        ];
        this.tileSprites = {};
        this.loadTileSprites();
    }

    loadTileSprites() {
        // Cargar el tileset completo
        const tilesetImage = new Image();
        tilesetImage.src = 'sprites/tiles_cesped.png';

        // Cuando el tileset se cargue, crear los tiles individuales usando un canvas
        tilesetImage.onload = () => {
            const tileSize = 64; // Tamaño de cada tile
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = tileSize;
            canvas.height = tileSize;

            // Crear tiles individuales
            for (let row = 0; row < Math.floor(tilesetImage.height / tileSize); row++) {
                for (let col = 0; col < Math.floor(tilesetImage.width / tileSize); col++) {
                    const tileIndex = row * Math.floor(tilesetImage.width / tileSize) + col;
                    
                    // Limpiar el canvas
                    ctx.clearRect(0, 0, tileSize, tileSize);
                    
                    // Dibujar la porción del tileset correspondiente
                    ctx.drawImage(
                        tilesetImage,
                        col * tileSize,
                        row * tileSize,
                        tileSize,
                        tileSize,
                        0,
                        0,
                        tileSize,
                        tileSize
                    );

                    // Convertir el tile a una imagen
                    const tileImage = new Image();
                    tileImage.src = canvas.toDataURL();
                    this.tileSprites[tileIndex] = tileImage;
                }
            }
        };
    }

    getMapWidth() {
        return this.mapData[0].length * this.tileSize;
    }

    getMapHeight() {
        return this.mapData.length * this.tileSize;
    }

    render(ctx, cameraX, cameraY) {
        const startCol = Math.floor(cameraX / this.tileSize);
        const endCol = startCol + Math.ceil(ctx.canvas.width / this.tileSize) + 1;
        const startRow = Math.floor(cameraY / this.tileSize);
        const endRow = startRow + Math.ceil(ctx.canvas.height / this.tileSize) + 1;

        for (let row = startRow; row < endRow; row++) {
            if (row < 0 || row >= this.mapData.length) continue;
            
            for (let col = startCol; col < endCol; col++) {
                if (col < 0 || col >= this.mapData[0].length) continue;
                
                const tile = this.mapData[row][col];
                const x = col * this.tileSize - cameraX;
                const y = row * this.tileSize - cameraY;
                
                if (this.tileSprites[tile]) {
                    // Asegurarse de que los tiles se rendericen a 32x32 píxeles
                    ctx.drawImage(this.tileSprites[tile], x, y, 64, 64);
                } else {
                    // Fallback rendering if sprite not loaded
                    ctx.fillStyle = tile === 1 ? '#407942' : '#407942';
                    ctx.fillRect(x, y, 64, 64);
                }
            }
        }
    }
}