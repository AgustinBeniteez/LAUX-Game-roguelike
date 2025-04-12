import BaseMap from './BaseMap.js';

export default class LobbyMap extends BaseMap {
    constructor(engine) {
        const config = {
            width: 800,
            height: 600,
            tileSize: 32,
            floorTilePath: 'sprites/floor_tile.png',
            wallTilePath: 'sprites/wall_tile.png'
        };
        super(engine, config);
    }

    generateMap() {
        const mapWidth = Math.ceil(this.width / this.tileSize);
        const mapHeight = Math.ceil(this.height / this.tileSize);
        const map = [];

        for (let y = 0; y < mapHeight; y++) {
            map[y] = [];
            for (let x = 0; x < mapWidth; x++) {
                // Crear un diseño más interesante para el lobby
                if (x === 0 || x === mapWidth - 1 || y === 0 || y === mapHeight - 1) {
                    map[y][x] = 1; // Paredes exteriores
                } else if ((x === Math.floor(mapWidth / 3) || x === Math.floor(2 * mapWidth / 3)) && 
                           (y > Math.floor(mapHeight / 4) && y < Math.floor(3 * mapHeight / 4))) {
                    map[y][x] = 1; // Columnas decorativas
                } else {
                    map[y][x] = 0; // Suelo
                }
            }
        }

        return map;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(-this.engine.cameraX, -this.engine.cameraY);

        const startX = Math.floor(this.engine.cameraX / this.tileSize);
        const startY = Math.floor(this.engine.cameraY / this.tileSize);
        const endX = startX + Math.ceil(this.engine.canvas.width / this.tileSize) + 1;
        const endY = startY + Math.ceil(this.engine.canvas.height / this.tileSize) + 1;

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                if (y >= 0 && y < this.mapData.length && x >= 0 && x < this.mapData[y].length) {
                    const tile = this.mapData[y][x];
                    const image = tile === 1 ? this.wallTileImage : this.floorTileImage;
                    ctx.drawImage(image, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }

        ctx.restore();
    }

    isWall(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        return this.mapData[tileY]?.[tileX] === 1;
    }

    getSpawnPoint() {
        return {
            x: this.width / 2,
            y: this.height / 2
        };
    }
}