export default class BaseMap {
    constructor(engine, config = {}) {
        this.engine = engine;
        this.width = config.width || 800;
        this.height = config.height || 600;
        this.tileSize = config.tileSize || 32;
        this.floorTileImage = new Image();
        this.wallTileImage = new Image();
        this.loadTileImages(config);
        this.mapData = this.generateMap();
    }

    loadTileImages(config) {
        this.floorTileImage.src = config.floorTilePath || 'src/assets/images/tiles/floor_tile.png';
        this.wallTileImage.src = config.wallTilePath || 'src/assets/images/tiles/wall_tile.png';
    }

    generateMap() {
        const mapWidth = Math.ceil(this.width / this.tileSize);
        const mapHeight = Math.ceil(this.height / this.tileSize);
        const map = [];

        for (let y = 0; y < mapHeight; y++) {
            map[y] = [];
            for (let x = 0; x < mapWidth; x++) {
                if (x === 0 || x === mapWidth - 1 || y === 0 || y === mapHeight - 1) {
                    map[y][x] = 1; // Pared
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

    getSpawnPoint() {
        return {
            x: this.width / 2,
            y: this.height / 2
        };
    }

    isWall(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);
        return this.mapData[tileY]?.[tileX] === 1;
    }
}