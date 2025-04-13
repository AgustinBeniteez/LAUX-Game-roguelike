class MapSelector {
    constructor(engine) {
        this.engine = engine;
        this.isMenuOpen = false;
        this.centerTilePosition = {
            x: 7,
            y: 5
        };
        this.unlockedLevels = 1; // Inicialmente solo el primer nivel está desbloqueado
        this.createMapMenu();
        this.createPromptIndicator();
        this.setupKeyboardListener();
        // Exponer la función globalmente
        window.abrirSelectorMap = () => this.toggleMenu(true);
    }

    createMapMenu() {
        const mapMenu = document.createElement('div');
        mapMenu.id = 'map-selection-menu';
        mapMenu.style.cssText = `
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: 40px;
            border-radius: 15px;
            z-index: 3;
            border: 2px solid rgb(232 177 109);
            flex-direction: row;
            gap: 20px;
            align-items: center;
        `;

        const maps = [
            { name: 'Bosque Maldito', type: 'forest', level: 1, image: 'src/background_homegame.gif' },
            { name: 'Cripta Oscura', type: 'crypt', level: 2, image: 'src/splashart_map2.png' },
            { name: 'Pantano Venenoso', type: 'swamp', level: 3, image: 'src/splashart_map3.png' }
        ];

        maps.forEach((map, index) => {
            const mapContainer = document.createElement('div');
            mapContainer.style.cssText = `
                position: relative;
                width: 200px;
                text-align: center;
            `;

            // Contenedor para la imagen y el número
            const imageContainer = document.createElement('div');
            imageContainer.style.cssText = `
                position: relative;
                width: 200px;
                height: 150px;
                border-radius: 13px;
                border: 3px solid rgb(232 177 109);
                margin-bottom: 10px;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                z-index: 2;
                ${map.level > this.unlockedLevels ? 'filter: grayscale(100%);' : ''}
            `;
            
            if (map.level <= this.unlockedLevels) {
                imageContainer.onmouseover = () => {
                    imageContainer.style.transform = 'scale(1.05)';
                    imageContainer.style.boxShadow = '0 0 15px rgb(232 177 109)';
                };
                imageContainer.onmouseout = () => {
                    imageContainer.style.transform = 'scale(1)';
                    imageContainer.style.boxShadow = 'none';
                };
            }

            // Imagen del mapa
            const mapImage = document.createElement('img');
            mapImage.src = map.image;
            mapImage.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 10px;
            `;

            // Número de nivel
            const levelNumber = document.createElement('div');
            levelNumber.style.cssText = `
                position: absolute;
                top: -15px;
                left: -15px;
                width: 40px;
                height: 40px;
                background: rgb(232 177 109);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                font-weight: bold;
                color: #000;
                z-index: 2;
                font-family: 'Mineglyph', sans-serif;
            `;
            levelNumber.textContent = map.level;

            // Candado para niveles bloqueados
            if (map.level > this.unlockedLevels) {
                const lock = document.createElement('div');
                lock.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 40px;
                    color: #E8B16D;
                    z-index: 2;
                `;
                lock.innerHTML = '🔒';
                imageContainer.appendChild(lock);
            }

            // Nombre del mapa
            const mapName = document.createElement('div');
            mapName.textContent = map.name;
            mapName.style.cssText = `
                color: white;
                font-size: 16px;
                margin-top: 10px;
                font-weight: bold;
                font-family: 'Mineglyph', sans-serif;
            `;

            // Línea conectora
            if (index < maps.length - 1) {
                const connector = document.createElement('div');
                connector.style.cssText = `
                    position: absolute;
                    top: 75px;
                    right: -20px;
                    width: 17px;
                    height: 4px;
                    background: rgb(232 177 109);
                    z-index: 0;
                `;
                mapContainer.appendChild(connector);
            }

            imageContainer.appendChild(mapImage);
            imageContainer.appendChild(levelNumber);
            mapContainer.appendChild(imageContainer);
            mapContainer.appendChild(mapName);

            // Evento de clic solo si el nivel está desbloqueado
            if (map.level <= this.unlockedLevels) {
                mapContainer.style.cursor = 'pointer';
                mapContainer.onclick = () => this.selectMap(map.type);
            }

            mapMenu.appendChild(mapContainer);
        });

        document.body.appendChild(mapMenu);
    }

    isPlayerInCenter(player) {
        const mapWidth = this.engine.map.getMapWidth();
        const mapHeight = this.engine.map.getMapHeight();
        const centerX = Math.floor(mapWidth / 2);
        const centerY = Math.floor(mapHeight / 3);
        
        // Aumentar el área de tolerancia para una mejor detección
        const tolerance = 200;
        
        const playerCenterX = Math.floor(player.x);
        const playerCenterY = Math.floor(player.y);
        
        return Math.abs(playerCenterX - centerX) <= tolerance && 
               Math.abs(playerCenterY - centerY) <= tolerance;
    }

    toggleMenu(show) {
        const menu = document.getElementById('map-selection-menu');
        if (menu) {
            if (show) {
                menu.style.display = 'flex';
                menu.style.flexDirection = 'row';
            } else {
                menu.style.display = 'none';
            }
            this.isMenuOpen = show;
            this.engine.isPaused = show;
        }
    }

    selectMap(mapType) {
        const mapLevel = {
            forest: 1,
            crypt: 2,
            swamp: 3
        }[mapType];

        if (mapLevel > this.unlockedLevels) {
            return; // No permitir seleccionar niveles bloqueados
        }

        this.toggleMenu(false);
        // Limpiar entidades existentes excepto el jugador
        this.engine.entities = this.engine.entities.filter(entity => !entity.isEnemy);
        // Cambiar el mapa
        this.engine.map.changeMap(mapType);
        this.engine.map.hasMapChanged = true;
        // Actualizar variables globales
        window.currentMapType = mapType;
        // Si estamos en el lobby, desactivar las oleadas
        if (mapType === 'lobby') {
            window.isWaveActive = false;
            window.currentWave = 0;
            window.enemiesInWave = 0;
            window.maxEnemiesInWave = 0;
            window.waveTimer = 0;
            window.isBossSpawned = false;
        } else {
            window.isWaveActive = true;
            window.nextWaveTimer = 0;
            window.currentWave = 1;
            window.enemiesInWave = 0;
            window.maxEnemiesInWave = 12; // Aumentado para más enemigos por oleada
            window.waveTimer = 120; // 2 minutos para la primera oleada
            window.isBossSpawned = false;
            window.spawnInterval = 2; // Reducido para spawns más frecuentes
        }
        // Reposicionar al jugador en el centro
        const player = this.engine.entities.find(e => !e.isEnemy);
        if (player) {
            player.x = (this.engine.map.getMapWidth() / 2);
            player.y = (this.engine.map.getMapHeight() / 2);
        }
        // Ocultar el prompt si no estamos en el lobby
        const prompt = document.getElementById('map-prompt');
        if (prompt && mapType !== 'lobby') {
            prompt.style.display = 'none';
        }
    }

    createPromptIndicator() {
        const prompt = document.createElement('div');
        prompt.id = 'map-prompt';
        prompt.style.cssText = `
            display: none;
            position: fixed;
            top: 75%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.85);
            color: rgb(224, 149, 57);
            padding: 20px 30px;
            border-radius: 8px;
            font-size: 24px;
            z-index: 2;
            text-align: center;
            border: 2px solid rgb(209, 150, 89);
            box-shadow: 0 0 15px rgb(209, 150, 89);
            animation: pulse 2s infinite;
            backdrop-filter: blur(5px);
            align-items: center;
            font-family: 'Mineglyph', sans-serif;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                50% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.8; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        const keyIndicator = document.createElement('span');
        keyIndicator.style.cssText = `
            display: inline-block;
            background: rgb(224, 149, 57);
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            margin: 0 8px;
            font-weight: bold;
            font-size: 28px;
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
            box-shadow: 0 0 8px rgb(209, 150, 89);
            transition: all 0.2s ease;
        `;

        keyIndicator.onmouseover = () => {
            keyIndicator.style.transform = 'scale(1.1)';
            keyIndicator.style.boxShadow = '0 0 12px rgb(209, 150, 89)';
        };

        keyIndicator.onmouseout = () => {
            keyIndicator.style.transform = 'scale(1)';
            keyIndicator.style.boxShadow = '0 0 8px rgb(209, 150, 89)';
        };
        keyIndicator.textContent = 'F';

        // Cargar las traduccioness
        fetch('translations.json')
            .then(response => response.json())
            .then(translations => {
                // Obtener el idioma actual del localStorage o usar 'es' por defecto
                const currentLanguage = localStorage.getItem('language') || 'es';
                const translation = translations[currentLanguage].pressToChangeMap;
                
                // Dividir la traducción en partes antes y después de 'F'
                const [before, after] = translation.split('F');
                
                const textBefore = document.createTextNode(before);
                const textAfter = document.createTextNode(after);

                prompt.appendChild(textBefore);
                prompt.appendChild(keyIndicator);
                prompt.appendChild(textAfter);
            });

        document.body.appendChild(prompt);
    }

    setupKeyboardListener() {
        document.addEventListener('keydown', (event) => {
            if ((event.key === 'Escape' || event.key.toLowerCase() === 'f') && this.isMenuOpen) {
                this.toggleMenu(false);
                return;
            }

            if (window.currentMapType === 'lobby') {
                const player = this.engine.entities.find(e => !e.isEnemy);
                const isInCenter = this.isPlayerInCenter(player);
                const prompt = document.getElementById('map-prompt');
                
                if (prompt) {
                    if (isInCenter && !this.isMenuOpen) {
                        prompt.style.display = 'flex';
                        if (event.key.toLowerCase() === 'f') {
                            this.toggleMenu(true);
                        }
                    } else {
                        prompt.style.display = 'none';
                        if (this.isMenuOpen && !isInCenter) {
                            this.toggleMenu(false);
                        }
                    }
                }
            }
        });
    }

    update(player) {
        // La lógica se ha movido al setupKeyboardListener
    }
}