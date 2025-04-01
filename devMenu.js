// Menú de desarrollador para LAUX Game

// Estilos CSS para el panel de desarrollador
const devPanelStyles = `
    #dev-panel {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.8);
        border: 2px solid #ffd700;
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
        background: #333;
        color: #ffd700;
        border: 1px solid #ffd700;
        border-radius: 3px;
        cursor: pointer;
        font-family: 'Mineglyph', sans-serif;
        transition: all 0.3s ease;
    }
    #dev-panel button:hover {
        background: #ffd700;
        color: #333;
    }
    #dev-panel .input-group {
        display: flex;
        gap: 5px;
        margin: 5px 0;
    }
    #dev-panel input, #dev-panel select {
        flex: 1;
        padding: 8px;
        background: #333;
        color: #ffd700;
        border: 1px solid #ffd700;
        border-radius: 3px;
        font-family: 'Mineglyph', sans-serif;
    }
    #dev-panel select option {
        background: #333;
        color: #ffd700;
    }
`;

// Crear y añadir los estilos
const styleSheet = document.createElement('style');
styleSheet.textContent = devPanelStyles;
document.head.appendChild(styleSheet);

// Crear el panel de desarrollador
const devPanel = document.createElement('div');
devPanel.id = 'dev-panel';
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

    // Cambiar velocidad del jugador
    toggleTimeScale: () => {
        const player = engine.entities.find(e => !e.isEnemy);
        if (player) {
            if (!player._originalSpeed) {
                player._originalSpeed = player.speed || 5;
            }
            // Ciclo entre velocidades: Normal -> Rápida -> Muy Rápida -> Híper Rápida
            const speedLevels = [1, 2, 3, 4];
            const speedNames = ['Normal', 'Rápida', 'Muy Rápida', 'Híper Rápida'];
            // Usar una comparación más precisa para encontrar el índice actual
            let currentSpeedIndex = speedLevels.findIndex(level => 
                Math.abs(player.speed - player._originalSpeed * level) < 0.1
            );
            if (currentSpeedIndex === -1) currentSpeedIndex = 0;
            currentSpeedIndex = (currentSpeedIndex + 1) % speedLevels.length;
            
            const speedMultiplier = speedLevels[currentSpeedIndex];
            player.speed = player._originalSpeed * speedMultiplier;
            
            const timeScaleButton = document.querySelector('button[onclick="devCommands.toggleTimeScale()"]');
            if (timeScaleButton) {
                timeScaleButton.textContent = `🏃 Velocidad ${speedNames[currentSpeedIndex]}`;
            }
            console.log(`🏃 Velocidad del jugador: ${speedNames[currentSpeedIndex]}`);
        }
    },

    // Añadir habilidades secundarias
    addSecondarySkill: () => {
        const player = engine.entities.find(e => !e.isEnemy);
        if (player && player.skillSystem) {
            const skillSelect = document.getElementById('skillSelect');
            const selectedSkill = JSON.parse(skillSelect.value);

            // Buscar un slot vacío en el sistema de habilidades
            const emptySlotIndex = player.skillSystem.equippedSkills.findIndex(skill => skill === null);
            
            if (emptySlotIndex !== -1) {
                // Crear el objeto de habilidad en el formato correcto
                const newSkill = {
                    name: selectedSkill.name,
                    icon: 'sprites/proyectil_sprite_1.png', // Icono por defecto
                    cooldown: selectedSkill.cooldown,
                    damage: selectedSkill.damage,
                    projectileType: 'dev',
                    projectileSprite: 'sprites/proyectil_sprite_1.png'
                };

                // Equipar la habilidad en el slot vacío
                player.skillSystem.equippedSkills[emptySlotIndex] = newSkill;
                player.skillSystem.skillLevels[emptySlotIndex] = 1;
                player.skillSystem.updateSkillIcon(emptySlotIndex);
                player.skillSystem.updateHUDSlots();

                console.log(`🎯 Habilidad secundaria añadida: ${selectedSkill.name} en slot ${emptySlotIndex + 1}`);
            } else {
                console.log('❌ No hay slots disponibles para nuevas habilidades');
            }
        } else {
            console.log('❌ El sistema de habilidades no está inicializado');
        }
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
    const availableSkills = [
        { name: 'Escudo de Hielo', cooldown: 10, damage: 0, defense: 20 },
        { name: 'Explosión de Fuego', cooldown: 8, damage: 30, defense: 0 },
        { name: 'Viento Cortante', cooldown: 6, damage: 20, defense: 5 },
        { name: 'Rayo Paralizante', cooldown: 12, damage: 15, defense: 10 }
    ];

    devPanel.innerHTML = `
        <button onclick="devCommands.heal()">🩹 Curar</button>
        <div class="input-group">
            <input type="number" id="orbAmount" value="5" min="1" max="100">
            <button onclick="devCommands.spawnExperienceOrbs()">🔮 Generar Orbes</button>
        </div>
        <button onclick="devCommands.killAll()">💀 Eliminar Enemigos</button>
        <button onclick="devCommands.toggleCounter()">⏯️ Pausar/Reanudar</button>
        <button onclick="devCommands.toggleInvulnerability()">= Pause Enemigos Vivos</button>
        <div class="input-group">
            <select id="skillSelect">
                ${availableSkills.map(skill => `
                    <option value='${JSON.stringify(skill)}'>
                        ${skill.name} (Daño: ${skill.damage}, Defensa: ${skill.defense}, CD: ${skill.cooldown}s)
                    </option>
                `).join('')}
            </select>
            <button onclick="devCommands.addSecondarySkill()">🎯 Añadir Habilidad</button>
        </div>
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