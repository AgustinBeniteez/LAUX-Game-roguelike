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
            [5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5],
            [5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5],
            [5, 3, 3, 20, 7, 7, 7, 7, 7, 7, 7, 7, 17, 3, 3, 5],
            [5, 3, 3, 9, 2, 13, 13, 13, 13, 13, 13, 1, 8, 3, 3, 5],
            [5, 3, 3, 9, 13, 13, 3, 3, 3, 3, 13, 16, 8, 3, 3, 5],
            [5, 3, 3, 9, 13, 13, 3, 6, 6, 3, 13, 13, 8, 3, 3, 5],
            [5, 3, 3, 9, 15, 13, 3, 3, 3, 3, 12, 13, 8, 3, 3, 5],
            [5, 3, 3, 9, 2, 13, 13, 13, 13, 12, 13, 1, 8, 3, 3, 5],
            [5, 3, 3, 19, 10, 10, 10, 10, 10, 10, 10, 10, 18, 3, 3, 5],
            [5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5],
            [5, 0, 0, 1, 2, 0, 0, 3, 3, 0, 2, 1, 0, 0, 0, 5],
            [5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5],
            [5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5],
            [5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5],
            [5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5],
            [5, 0, 0, 1, 2, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 5]
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
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1],
            [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
            [1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
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
        tilesetImage.src = this.mapType === 'lobby' ? 'sprites/lobby_tiles.png' :
                          this.mapType === 'forest' ? 'sprites/tiles_cesped.png' :
                          this.mapType === 'crypt' ? 'sprites/wall_tile.png' :
                          this.mapType === 'swamp' ? 'sprites/floor_tile.png' :
                          'sprites/lobby_tiles.png';

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