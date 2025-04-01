// Menú de desarrollador para LAUX Game

// Estilos CSS para el panel de desarrollador
const devPanelStyles = `
        #fps-container {
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: #792459;
        padding: 5px 10px;
        border-radius: 3px;
        font-family: 'Mineglyph', sans-serif;
        font-size: 14px;
        z-index: 9999;
        display: none;
    }
        #dev-panel {
        width: 300px;
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.8);
        border: 2px solid #450c30;
        border-radius: 5px;
        padding: 10px;
        z-index: 9999;
        display: none;
    }
    #dev-panel button {
    display: block;
    width: 100%;
    margin: 5px 0;
    padding: 8px;
    background: #000000;
    color: #bf4b94;
    border: 1px solid #450c30;
    border-radius: 3px;
    cursor: pointer;
    font-family: 'Mineglyph', sans-serif;
    transition: all 0.3s ease;
}
    #dev-panel button:hover {
        background: #450c30;
        color: #333;
    }
    #dev-panel .input-group {
        display: flex;
        gap: 5px;
        margin: 5px 0;
    }
   #dev-panel input, #dev-panel select {
        flex: 1;
        width: 199px;
        padding: 8px;
        background: #000000;
        color: #ffffff;
        border: 1px solid #450c30;
        border-radius: 3px;
        font-family: 'Mineglyph', sans-serif;
    }
    #dev-panel select option {
        background: #333;
        color: #450c30;
    }
`;

// Crear y añadir los estilos
const styleSheet = document.createElement('style');
styleSheet.textContent = devPanelStyles;
document.head.appendChild(styleSheet);

// Crear el contenedor de FPS
const fpsContainer = document.createElement('div');
fpsContainer.id = 'fps-container';
fpsContainer.style.display = 'none';
document.body.appendChild(fpsContainer);

// Crear el panel de desarrollador
const devPanel = document.createElement('div');
devPanel.id = 'dev-panel';

// Añadir botones al panel
devPanel.innerHTML = `
    <button onclick="devCommands.toggleFPS()">📊 Mostrar/Ocultar FPS</button>
`;

document.body.appendChild(devPanel);

// Variables para controlar estados del juego
let isCounterPaused = false;
let isInvulnerable = false;
let timeScale = 1;

// Objeto global para almacenar las funciones del menú de desarrollador
window.devCommands = {
    // Curar al personaje al máximo
    heal: () => {
        const player = engine.entities.find(e => !e.isEnemy);
        if (player) {
            player.health = player.maxHealth;
            console.log('🩹 Personaje curado al máximo');
        }
    },

    // Generar orbes de experiencia
    spawnExperienceOrbs: (amount = 5) => {
        const player = engine.entities.find(e => !e.isEnemy);
        if (player) {
            const orbAmount = parseInt(document.getElementById('orbAmount').value) || amount;
            for (let i = 0; i < orbAmount; i++) {
                const offsetX = (Math.random() - 0.5) * 100;
                const offsetY = (Math.random() - 0.5) * 100;
                const orb = new ExperienceOrb(player.x + offsetX, player.y + offsetY);
                engine.entities.push(orb);
            }
            console.log(`🔮 Generados ${orbAmount} orbes de experiencia`);
        }
    },

    // Eliminar todos los enemigos
    killAll: () => {
        const enemies = engine.entities.filter(e => e.isEnemy);
        enemies.forEach(enemy => {
            enemy.health = 0;
            engine.entities = engine.entities.filter(e => e !== enemy);
        });
        console.log(`💀 Eliminados ${enemies.length} enemigos`);
    },

    // Pausar/Reanudar el contador y enemigos
    toggleCounter: () => {
        const player = engine.entities.find(e => !e.isEnemy);
        if (player) {
            engine.isPaused = !engine.isPaused;
            isCounterPaused = engine.isPaused;
            console.log(`⏯️ ${engine.isPaused ? 'Enemigos pausados' : 'Enemigos reanudados'}`);
        }
    },

    // Alternar invulnerabilidad
    toggleInvulnerability: () => {
        isInvulnerable = !isInvulnerable;
        const player = engine.entities.find(e => !e.isEnemy);
        if (player) {
            player.isInvulnerable = isInvulnerable;
            // Hacer que los enemigos ignoren al jugador cuando está invulnerable
            engine.entities.forEach(entity => {
                if (entity.isEnemy) {
                    if (isInvulnerable) {
                        entity._originalUpdate = entity.update;
                        entity.update = () => {};
                    } else if (entity._originalUpdate) {
                        entity.update = entity._originalUpdate;
                        delete entity._originalUpdate;
                    }
                }
            });
            console.log(`🛡️ Invulnerabilidad ${isInvulnerable ? 'activada' : 'desactivada'}`);
        }
    },



    // Alternar visualización de FPS
    toggleFPS: () => {
        const showFPS = localStorage.getItem('showFPS') === 'on' ? 'off' : 'on';
        localStorage.setItem('showFPS', showFPS);
        const fpsContainer = document.getElementById('fps-container');
        if (fpsContainer) {
            fpsContainer.style.display = showFPS === 'on' ? 'block' : 'none';
            if (showFPS === 'on' && !window.fpsInterval) {
                let frameCount = 0;
                let lastTime = performance.now();
                window.fpsInterval = setInterval(() => {
                    const currentTime = performance.now();
                    frameCount++;
                    if (currentTime - lastTime >= 1000) {
                        fpsContainer.textContent = `FPS: ${frameCount}`;
                        frameCount = 0;
                        lastTime = currentTime;
                    }
                }, 1000 / 60);
            } else if (showFPS === 'off' && window.fpsInterval) {
                clearInterval(window.fpsInterval);
                window.fpsInterval = null;
            }
        }
        console.log(`📊 FPS ${showFPS === 'on' ? 'activados' : 'desactivados'}`);
    },



    // Mostrar ayuda
    help: () => {
        console.log(`
🛠️ Comandos de desarrollador disponibles:

devCommands.heal() - Cura al personaje al máximo
devCommands.levelUp(n) - Sube n niveles (por defecto 1)
devCommands.killAll() - Elimina todos los enemigos
devCommands.nextWave() - Avanza a la siguiente oleada
devCommands.help() - Muestra esta ayuda
        `);
    }
};

// Variable para rastrear si el modo desarrollador está activado
let devModeEnabled = false;

// Función para crear los botones del panel
function createDevButtons() {
    devPanel.innerHTML = `
        <button onclick="devCommands.toggleFPS()">📊 Mostrar/Ocultar FPS</button>
        <button onclick="devCommands.heal()">🩹 Curar</button>
        <div class="input-group">
            <input type="number" id="orbAmount" value="5" min="1" max="100">
            <button onclick="devCommands.spawnExperienceOrbs()">🔮 Generar Orbes</button>
        </div>
        <button onclick="devCommands.killAll()">💀 Eliminar Enemigos</button>
        <button onclick="devCommands.toggleCounter()">⏯️ Pausar/Reanudar</button>
        <button onclick="devCommands.toggleInvulnerability()">= Pause Enemigos Vivos</button>
    `;
}

// Función para activar el modo desarrollador
window.devmode = () => {
    if (!devModeEnabled) {
        devModeEnabled = true;
        console.log('🛠️ Modo desarrollador activado');
        devPanel.style.display = 'block';
        createDevButtons();
    } else {
        console.log('🛠️ El modo desarrollador ya está activado');
    }
};

// Mensaje inicial en consola
console.log('🎮 Escribe "devmode()" en la consola para activar el modo desarrollador');