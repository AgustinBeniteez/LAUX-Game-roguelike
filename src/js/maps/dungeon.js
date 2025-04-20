import BaseMap from './BaseMap.js';

export default class DungeonMap extends BaseMap {
    constructor(engine) {
        const config = {
            width: 1000,
            height: 800,
            tileSize: 32,
            floorTilePath: 'src/assets/images/tiles/floor_tile.png',
            wallTilePath: 'src/assets/images/tiles/wall_tile.png'
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
                // Crear un diseño de mazmorra con salas y pasillos
                if (x === 0 || x === mapWidth - 1 || y === 0 || y === mapHeight - 1) {
                    map[y][x] = 1; // Paredes exteriores
                } else if ((x % 8 === 0 || y % 6 === 0) && 
                           (x > 2 && x < mapWidth - 2 && y > 2 && y < mapHeight - 2)) {
                    map[y][x] = 1; // Paredes interiores formando salas
                } else {
                    map[y][x] = 0; // Suelo
                }
            }
        }

        // Crear algunas aberturas para pasillos
        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                if (map[y][x] === 1 && 
                    ((x % 8 === 0 && y % 3 === 0) || (y % 6 === 0 && x % 4 === 0))) {
                    map[y][x] = 0; // Crear pasillos
                }
            }
        }

        return map;
    }

    getSpawnPoint() {
        return {
            x: this.tileSize * 2,
            y: this.tileSize * 2
        };
    }
}