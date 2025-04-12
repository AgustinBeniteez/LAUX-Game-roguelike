class Map2 {
    constructor(tileSize = 64) {
        this.tileSize = tileSize;
        this.mapData = [
            [33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33],
            [33, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 33],
            [33, 13, 26, 26, 26, 13, 13, 13, 26, 26, 26, 26, 26, 26, 13, 33],
            [33, 13, 26, 13, 26, 13, 13, 13, 26, 13, 13, 13, 13, 26, 13, 33],
            [33, 13, 26, 26, 26, 13, 13, 13, 26, 13, 26, 26, 13, 26, 13, 33],
            [33, 13, 13, 13, 26, 13, 13, 13, 26, 13, 26, 13, 13, 26, 13, 33],
            [33, 33, 33, 13, 26, 13, 13, 13, 26, 13, 26, 26, 26, 26, 13, 33],
            [33, 13, 13, 13, 26, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 33],
            [33, 13, 26, 26, 26, 13, 13, 33, 33, 33, 33, 33, 33, 33, 33, 33],
            [33, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 33],
            [33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33]
        ];
        this.tileSprites = {};
        this.loadTileSprites();
    }

    loadTileSprites() {
        const tilesetImage = new Image();
        tilesetImage.src = 'sprites/tiles_cesped.png';

        tilesetImage.onload = () => {
            const tileSize = 64;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = tileSize;
            canvas.height = tileSize;

            for (let row = 0; row < Math.floor(tilesetImage.height / tileSize); row++) {
                for (let col = 0; col < Math.floor(tilesetImage.width / tileSize); col++) {
                    const tileIndex = row * Math.floor(tilesetImage.width / tileSize) + col;
                    
                    ctx.clearRect(0, 0, tileSize, tileSize);
                    
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
                    ctx.drawImage(this.tileSprites[tile], x, y, this.tileSize, this.tileSize);
                } else {
                    ctx.fillStyle = tile === 33 ? '#407942' : '#407942';
                    ctx.fillRect(x, y, this.tileSize, this.tileSize);
                }
            }
        }
    }
}