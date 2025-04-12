class MapManager {
    constructor(engine) {
        this.engine = engine;
        this.currentMap = null;
        this.maps = {};
    }

    async loadMap(mapName) {
        if (!this.maps[mapName]) {
            try {
                const MapClass = await import(`./${mapName}.js`).then(module => module.default);
                this.maps[mapName] = new MapClass(this.engine);
            } catch (error) {
                console.error(`Error al cargar el mapa ${mapName}:`, error);
                return false;
            }
        }

        this.currentMap = this.maps[mapName];
        const spawnPoint = this.currentMap.getSpawnPoint();
        
        // Actualizar la posición del jugador al punto de spawn del nuevo mapa
        const player = this.engine.entities.find(e => !e.isEnemy);
        if (player) {
            player.x = spawnPoint.x;
            player.y = spawnPoint.y;
        }

        return true;
    }

    getCurrentMap() {
        return this.currentMap;
    }

    isWall(x, y) {
        return this.currentMap?.isWall(x, y) ?? false;
    }

    draw(ctx) {
        this.currentMap?.draw(ctx);
    }
}