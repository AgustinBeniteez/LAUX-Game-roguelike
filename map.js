const MAP_TYPE_LOBBY = 'lobby';

class Map {
    constructor(tileSize = 64) {
        this.hasMapChanged = false;
        this.centerTilePosition = {
            x: 7,
            y: 5
        };
        this.tileSize = tileSize;
        this.mapType = MAP_TYPE_LOBBY;
        this.mapData = [
            [6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6],
            [6, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6],
            [6, 3, 3, 24, 18, 18, 18, 18, 18, 18, 18, 18, 25, 3, 3, 6],
            [6, 3, 3, 19, 30, 27, 21, 21, 21, 27, 27, 31, 20, 3, 3, 6],
            [6, 3, 3, 19, 21, 27, 21, 7, 8, 21, 21, 21, 20, 3, 3, 6],
            [6, 3, 3, 19, 5, 27, 27, 14, 15, 21, 21, 5, 20, 3, 3, 6],
            [6, 3, 3, 19, 21, 21, 27, 27, 21, 21, 27, 21, 20, 3, 3, 6],
            [6, 3, 3, 19, 31, 21, 21, 27, 21, 21, 21, 30, 20, 3, 3, 6],
            [6, 3, 3, 22, 17, 17, 17, 17, 17, 17, 17, 17, 23, 3, 3, 6],
            [6, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6],
            [6, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 6],
            [6, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 12, 13, 6],
            [6, 13, 12, 13, 16, 13, 13, 13, 13, 13, 13, 12, 13, 13, 16, 6],
            [6, 16, 13, 13, 13, 13, 13, 13, 13, 13, 12, 16, 12, 13, 13, 6],
            [6, 11, 10, 11, 11, 10, 10, 10, 11, 10, 11, 11, 10, 10, 10, 6]
        ];
        this.forestMapData = [
            [1, 1, 2, 1, 1, 1, 1, 1, 2, 33, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1, 1, 1, 1, 32, 1, 1, 1, 1, 1, 31, 1, 33],
            [1, 2, 1, 1, 34, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 27, 26, 0, 1],
            [1, 32, 2, 0, 2, 0, 1, 0, 2, 33, 2, 2, 1, 1, 1, 33, 0, 2, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 34, 1],
            [1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 30, 1, 1, 29, 1, 1, 1, 1, 1, 1, 26, 27, 1, 1],
            [1, 0, 1, 0, 2, 0, 1, 2, 1, 2, 1, 1, 2, 1, 28, 2, 0, 1, 2, 1, 1, 1, 1, 28, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 28, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 3, 2, 1, 1, 1, 2, 2, 1, 2, 1, 2, 1, 1],
            [1, 2, 9, 13, 13, 13, 13, 13, 13, 13, 13, 19, 13, 13, 13, 13, 13, 13, 13, 8, 1, 1, 1, 1, 1, 1, 2, 26, 26, 2, 2, 2],
            [1, 2, 9, 17, 12, 18, 13, 13, 13, 13, 13, 16, 13, 12, 13, 13, 17, 13, 13, 8, 2, 2, 2, 2, 2, 1, 2, 33, 32, 1, 2, 1],
            [1, 1, 9, 13, 13, 13, 13, 13, 13, 13, 14, 13, 25, 13, 13, 12, 16, 13, 15, 8, 1, 2, 2, 32, 1, 33, 1, 26, 32, 1, 2, 2],
            [2, 1, 9, 13, 13, 19, 17, 13, 12, 13, 13, 17, 13, 13, 13, 13, 13, 13, 13, 13, 3, 2, 2, 1, 2, 2, 2, 0, 1, 2, 2, 1],
            [1, 2, 9, 23, 16, 13, 13, 25, 13, 22, 16, 14, 13, 15, 13, 13, 13, 13, 13, 13, 8, 1, 33, 1, 26, 2, 2, 1, 1, 2, 2, 0],
            [1, 1, 9, 13, 13, 13, 17, 13, 15, 13, 13, 13, 13, 13, 12, 13, 13, 13, 16, 13, 8, 32, 2, 1, 2, 2, 2, 1, 0, 2, 2, 2],
            [2, 2, 9, 13, 13, 13, 13, 21, 22, 13, 12, 13, 18, 13, 13, 18, 13, 13, 13, 13, 8, 1, 2, 34, 1, 2, 1, 26, 2, 2, 2, 1],
            [2, 1, 9, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 19, 13, 13, 15, 13, 8, 26, 1, 1, 2, 31, 2, 2, 2, 2, 2, 1],
            [2, 1, 5, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 16, 13, 13, 13, 13, 13, 3, 1, 2, 1, 33, 2, 2, 2, 1, 2, 2],
            [2, 1, 1, 9, 13, 13, 13, 13, 22, 13, 13, 13, 22, 13, 13, 12, 13, 13, 13, 13, 13, 8, 2, 2, 2, 2, 1, 1, 2, 1, 1, 1],
            [2, 1, 2, 5, 13, 17, 13, 13, 12, 25, 13, 13, 13, 13, 13, 17, 13, 13, 13, 13, 13, 8, 2, 2, 1, 26, 2, 1, 2, 1, 1, 1],
            [1, 1, 1, 2, 5, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 4, 2, 1, 1, 2, 1, 2, 2, 1, 1, 2],
            [1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 2, 0, 0, 1, 2, 1, 0, 1, 1, 2, 27, 1, 0, 0, 1, 2, 1, 1, 27, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1],
            [1, 0, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 27, 1, 0, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1]
        ];
        this.cryptMapData = [
            [25, 26, 27, 7, 10, 26, 27, 10, 10, 26, 27, 10, 29, 30, 31, 8, 9 , 5, 2, 12 , 13, 1 , 1, 12, 13, 2, 0, 2, 6, 6, 16, 15],
            [14, 33, 34, 24, 10, 33, 34, 25, 24, 33, 34, 10, 29, 30, 30, 8, 9 , 6, 4, 19 , 20, 1 , 1, 19, 20, 2, 6, 2, 6, 6, 2, 6],
            [11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 28, 30, 31, 8, 9 , 2, 4, 0 , 2, 1 , 1, 5, 6, 2, 6, 2, 6, 6, 2, 0],
            [18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 3, 30, 31, 8, 9 , 6, 4, 6 , 6, 1 , 1, 6, 2, 2, 2, 6, 6, 6, 2, 17],
            [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 22, 30, 31, 8, 9 , 5, 6, 2 , 6, 1 , 12, 13, 2, 6, 2, 2, 6, 6, 2, 6],
            [15, 15, 12, 13, 15, 15, 15, 12, 13, 15, 15, 15, 6, 30, 31, 8, 9 , 6, 6, 6 , 6, 1 , 19, 20, 6, 2, 2, 6, 6, 6, 2, 17],
            [15, 15, 19, 20, 15, 15, 15, 19, 20, 15, 15, 15, 23, 30, 31, 8, 9 , 0, 4, 6 , 6, 1 , 5, 6, 6, 2, 6, 2, 6, 6, 2, 17],
            [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 6, 30, 31, 8, 9 , 6, 6, 6 , 6, 1 , 6, 2, 2, 6, 6, 2, 6, 6, 2, 17],
            [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 6, 30, 31, 8, 9 , 5, 6, 12 , 13, 1 , 6, 6, 2, 2, 6, 12, 13, 6, 2, 17],
            [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 6, 30, 31, 8, 9 , 6, 4, 19 , 20, 1 , 2, 6, 2, 2, 2, 19, 20, 6, 2, 17],
            [15, 6, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 6, 30, 31, 8, 9 , 6, 4, 6 , 6, 1 , 2, 6, 2, 2, 2, 6, 6, 6, 2, 17],
            [15, 15, 12, 13, 15, 15, 15, 12, 13, 15, 15, 15, 6, 30, 31, 8, 9 , 6, 6, 6 , 6, 1 , 6, 6, 6, 2, 2, 6, 6, 6, 2, 17],
            [15, 15, 19, 20, 15, 15, 15, 19, 20, 15, 15, 15, 23, 30, 31, 8, 9 , 0, 4, 6 , 6, 1 , 5, 6, 6, 2, 6, 2, 6, 6, 2, 17],
            [15, 6, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 6, 30, 31, 8, 9 , 6, 4, 6 , 6, 1 , 2, 6, 2, 2, 2, 6, 6, 6, 2, 17],
            [15, 6, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 6, 30, 31, 8, 9 , 6, 4, 6 , 6, 1 , 2, 6, 2, 2, 2, 6, 6, 6, 2, 17],
            [15, 6, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 6, 30, 31, 8, 9 , 6, 4, 6 , 6, 1 , 2, 6, 2, 2, 2, 6, 6, 6, 2, 17],
            [15, 6, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 6, 30, 31, 8, 9 , 6, 4, 6 , 6, 1 , 2, 6, 2, 2, 2, 6, 6, 6, 2, 17],
            [10, 10, 10, 25, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 24, 10, 10, 10, 10, 25, 10, 10, 10, 10, 25, 10, 10],
            [10,10, 10, 10, 10, 10, 24, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 25, 10, 10, 10, 10, 24, 25, 10, 10, 10],


        ];
        this.swampMapData = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2, 0, 0, 0, 1],
            [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1],
            [1, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 1],
            [1, 2, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 2, 1],
            [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1],
            [1, 2, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 2, 1],
            [1, 0, 0, 2, 0, 2, 0, 0, 0, 0, 2, 0, 2, 0, 0, 1],
            [1, 0, 2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2, 0, 1],
            [1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ];
        this.tileSprites = {};
        this.loadTileSprites();
    }

    loadTileSprites() {
        const tilesetImage = new Image();
        tilesetImage.src = this.mapType === 'lobby' ? 'src/assets/images/tiles/lobby_tiles.png' :
                          this.mapType === 'forest' ? 'src/assets/images/tiles/tiles_cesped.png' :
                          this.mapType === 'crypt' ? 'src/assets/images/tiles/tiles_sakura.png' :
                          this.mapType === 'swamp' ? 'src/assets/images/tiles/floor_tile.png' :
                          'src/assets/images/tiles/tiles_cesped.png';

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

    changeMap(mapType, mapData) {
        this.mapType = mapType;
        if (mapData) {
            this.mapData = mapData;
        } else {
            switch(mapType) {
                case 'forest':
                    this.mapData = this.forestMapData;
                    break;
                case 'crypt':
                    this.mapData = this.cryptMapData;
                    break;
                case 'swamp':
                    this.mapData = this.swampMapData;
                    break;
            }
        }
        this.loadTileSprites();
        const event = new CustomEvent('mapChanged', { detail: { mapType: this.mapType } });
        document.dispatchEvent(event);
    }

    isPlayerInCenter(player) {
        if (this.mapType !== MAP_TYPE_LOBBY) return false;
        const tileX = Math.floor(player.x / this.tileSize);
        const tileY = Math.floor(player.y / this.tileSize);
        return tileX === this.centerTilePosition.x && tileY === this.centerTilePosition.y;
    }

    checkPlayerPosition(player) {
        if (this.isPlayerInCenter(player) && this.mapType === MAP_TYPE_LOBBY) {
            window.abrirSelectorMap();
        }
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
                    ctx.fillStyle = tile === 1 ? '#407942' : '#407942';
                    ctx.fillRect(x, y, this.tileSize, this.tileSize);
                }
            }
        }
    }
}