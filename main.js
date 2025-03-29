const assetManager = new AssetManager();
const engine = new Engine('gameCanvas', 1000, 500);

// Load game state and player data
const gameState = JSON.parse(localStorage.getItem('gameState')) || {
  currentWave: 1,
  waveTimer: 120,
  nextWaveTimer: 30,
  isWaveActive: true,
  isBossSpawned: false,
  entities: []
};

const playerData = JSON.parse(localStorage.getItem('playerData')) || {
  class: 'mage',
  health: 120,
  speed: 120,
  level: 1,
  experience: 0,
  x: 100,
  y: 100
};

let skillSelectionActive = false;

function showSkillSelection() {
  skillSelectionActive = true;
  engine.isPaused = true;
  
  // Mostrar botones de mejora de habilidades
  const skillsBar = document.getElementById('skills-bar');
  if (!skillsBar) return;
  
  const skillBoxes = skillsBar.getElementsByClassName('skill-box');
  for (let i = 0; i < skillBoxes.length; i++) {
    const skill = window.skillSystem.equippedSkills[i];
    if (skill) {
      const upgradeButton = document.createElement('button');
      upgradeButton.className = 'upgrade-button';
      upgradeButton.style.cssText = 'position: absolute;top: 0px;background: rgb(29 117 192);color: white;border: none;padding: 11px 10px;cursor: pointer;';
      upgradeButton.textContent = ' LVL +1';
      
      upgradeButton.addEventListener('click', () => {
        window.skillSystem.upgradeSkill(i);
        upgradeButton.remove();
        engine.isPaused = false;
        skillSelectionActive = false;
      });
      
      skillBoxes[i].appendChild(upgradeButton);
    }
  }
}

const player = new Entity(100, 100);
const selectedSkin = localStorage.getItem('selectedSkin') || 'default';
const skinSprites = {
  default: 'sprites/player_sprite.png',
  magenta: 'sprites/player_sprite_skin1.png',
  azul: 'sprites/player_sprite_skin2.png',
  amarillo: 'sprites/player_sprite_skin3.png'
};
player.loadSprite(skinSprites[selectedSkin], 32, 32, 4);
player.health = playerData.health;
player.maxHealth = playerData.health;
player.speed = 100; // Velocidad reducida del jugador
player.class = playerData.class;
player.mana = playerData.mana;
player.maxMana = playerData.maxMana;
player.stamina = playerData.stamina;
player.maxStamina = playerData.maxStamina;
player.experience = 0;
player.level = playerData.level;

// Actualizar la barra de experiencia
function updateHUD() {
    // Actualizar barra de experiencia
    const expBar = document.getElementById('exp-bar');
    if (expBar) {
        const expForNextLevel = 5 + (player.level - 1) * 4;
        expBar.style.width = `${(player.experience / expForNextLevel) * 100}%`;
    }

    // Actualizar barra de vida
    const healthBar = document.getElementById('health-bar');
    const healthText = document.getElementById('health-text');
    if (healthBar && healthText) {
        const healthPercentage = (player.health / player.maxHealth) * 100;
        healthBar.style.width = `${healthPercentage}%`;
        healthText.textContent = `${Math.round(player.health)}/${player.maxHealth}`;
    }
}

// Verificar nivel y mostrar selección de habilidades
function checkLevelUp() {
    const expForNextLevel = 5 + (player.level - 1) * 4; // Dynamic experience requirement
    if (player.experience >= expForNextLevel) {
        player.experience -= expForNextLevel;
        player.level++;
        showSkillSelection();
        checkLevelUp();
        updateExpBar();
    }
}
// Asegurarse de que el inventario tenga la habilidad seleccionada
player.inventory = Array.isArray(playerData.inventory) && playerData.inventory.length > 0 ? playerData.inventory : [];
if (player.inventory.length === 0 && playerData.selectedSkill && playerData.skillStats) {
  player.inventory.push({
    type: 'skill',
    name: playerData.skillStats.name,
    damage: playerData.skillStats.damage,
    speed: playerData.skillStats.speed,
    icon: playerData.skillStats.icon
  });
}
player.equippedWeapon = playerData.equippedWeapon;

// Actualizar HUD inicial
updateHUD();

// Actualizar HUD cada frame
engine.onUpdate = function() {
    updateHUD();
};

engine.addEntity(player);

// Save game function
function saveGame() {
  if (player.isDead) return;

  const currentPlayerData = {
    ...playerData,
    health: player.health,
    experience: player.experience,
    mana: player.mana,
    stamina: player.stamina,
    inventory: player.inventory,
    equippedWeapon: player.equippedWeapon,
    x: player.x,
    y: player.y
  };

  const currentGameState = {
    currentWave,
    waveTimer,
    nextWaveTimer,
    isWaveActive,
    isBossSpawned,
    entities: engine.entities
      .filter(e => e.isEnemy)
      .map(e => ({
        x: e.x,
        y: e.y,
        health: e.health,
        isBoss: e.width === 300
      }))
  };

  localStorage.setItem('playerData', JSON.stringify(currentPlayerData));
  localStorage.setItem('gameState', JSON.stringify(currentGameState));
}

// Auto-save every 30 seconds
setInterval(saveGame, 30000);

// Sistema de oleadas y jefes
let currentWave = gameState.currentWave || 1;
let enemiesInWave = 0;
let maxEnemiesInWave = 5;
let waveTimer = gameState.waveTimer || 120; // 2 minutos por oleada
let nextWaveTimer = gameState.nextWaveTimer || 30; // 30 segundos entre oleadas
let isWaveActive = gameState.isWaveActive;
let isBossSpawned = gameState.isBossSpawned;

// Restaurar enemigos guardados
if (gameState.entities && gameState.entities.length > 0) {
  gameState.entities.forEach(entityData => {
    const enemy = new Entity(entityData.x, entityData.y, null, true);
    if (entityData.isBoss) {
      enemy.width = 300;
      enemy.height = 300;
      enemy.health = entityData.health;
      enemy.maxHealth = 800;
      enemy.speed = 70;
      enemy.damageRate = 35;
      enemy.loadSprite('sprites/plant_enemy_boss_sprite.png', 32, 32, 4);
    } else {
      enemy.health = entityData.health;
      enemy.loadSprite('sprites/plant_enemy_sprite.png', 32, 32, 4);
    }
    enemy.target = player;
    engine.addEntity(enemy);
    enemiesInWave++;
  });
}

// Función para generar enemigos aleatorios
function spawnEnemy(isBoss = false) {
  // Generar posición en los bordes del mapa
  const mapWidth = engine.map.getMapWidth();
  const mapHeight = engine.map.getMapHeight();
  let enemyX, enemyY;
  
  // Decidir aleatoriamente si aparece en borde horizontal o vertical
  if (Math.random() < 0.5) {
    // Borde horizontal (arriba o abajo)
    enemyX = Math.random() * mapWidth;
    enemyY = Math.random() < 0.5 ? 0 : mapHeight;
  } else {
    // Borde vertical (izquierda o derecha)
    enemyX = Math.random() < 0.5 ? 0 : mapWidth;
    enemyY = Math.random() * mapHeight;
  }
  
  const enemy = new Entity(enemyX, enemyY, null, true);
  
  if (isBoss) {
    enemy.width = 300;
    enemy.height = 300;
    enemy.health = 800;
    enemy.maxHealth = 800;
    enemy.speed = 70;
    enemy.damageRate = 35;
    enemy.loadSprite('sprites/plant_enemy_boss_sprite.png', 32, 32, 4);
  } else {
    // Enemigo tipo 3 (desde fase 3)
    if (currentWave >= 3 && Math.random() < 0.3) {
      enemy.health = 200;
      enemy.maxHealth = 200;
      enemy.speed = 90;
      enemy.damageRate = 25;
      enemy.loadSprite('sprites/plant_enemy_3_sprite.png', 32, 32, 4);
    }
    // Enemigo tipo 2 (desde fase 2)
    else if (currentWave >= 2 && Math.random() < 0.4) {
      enemy.health = 150;
      enemy.maxHealth = 150;
      enemy.speed = 100;
      enemy.damageRate = 20;
      enemy.loadSprite('sprites/plant_enemy_2_sprite.png', 32, 32, 4);
    }
    // Enemigo básico
    else {
      enemy.health = 100;
      enemy.maxHealth = 100;
      enemy.speed = 85; // Velocidad reducida del enemigo básico
      enemy.damageRate = 15;
      enemy.loadSprite('sprites/plant_enemy_sprite.png', 32, 32, 4);
    }
  }
  enemy.target = player;
  engine.addEntity(enemy);
  enemiesInWave++;
}

// Función para actualizar los contadores del HUD
function updateWaveHUD() {
  document.getElementById('wave-value').textContent = currentWave;
  const timeInSeconds = isWaveActive ? Math.ceil(waveTimer) : Math.ceil(nextWaveTimer);
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  document.getElementById('next-wave-timer').textContent = formattedTime;

  // Actualizar la barra de progreso
  const progressBar = document.getElementById('wave-progress');
  if (progressBar) {
    const totalTime = isWaveActive ? 120 : 30; // 120s para oleada, 30s entre oleadas
    const currentTime = isWaveActive ? waveTimer : nextWaveTimer;
    const progress = Math.max(0, Math.min(1, currentTime / totalTime));
    progressBar.style.transform = `scaleX(${progress})`;
  }
}

// Función para gestionar las oleadas
// Actualizar la experiencia y nivel del jugador
function updatePlayerExperience() {
  const expBar = document.getElementById('exp-bar');
  const levelText = document.getElementById('level-text');
  if (expBar && levelText) {
    const expForNextLevel = 100;
    expBar.style.width = `${(player.experience / expForNextLevel) * 100}%`;
    levelText.textContent = `Level ${player.level}`;
    
    if (player.experience >= expForNextLevel) {
      player.experience -= expForNextLevel;
      player.level++;
      levelText.textContent = `Level ${player.level}`;
      showSkillSelection();
    }
  }
}

function waveManager(dt) {
  if (isWaveActive) {
    waveTimer -= dt;
    updatePlayerExperience();
    
    // Generar enemigos durante la oleada
    if (enemiesInWave < maxEnemiesInWave && Math.random() < 0.1) {
      spawnEnemy();
    }
    
    // Generar jefe cuando queden 50 segundos
    if (!isBossSpawned && waveTimer <= 50) {
      spawnEnemy(true);
      isBossSpawned = true;
    }
    
    // Finalizar oleada si se acaba el tiempo o se eliminan todos los enemigos
    if (waveTimer <= 0 || (enemiesInWave === 0 && isBossSpawned)) {
      isWaveActive = false;
      nextWaveTimer = 30;
      engine.isPaused = true; // Pausar el juego durante la selección de cartas
      
      // Eliminar todos los enemigos restantes con una animación suave
      engine.entities.forEach(entity => {
        if (entity.isEnemy) {
          entity.isDead = true;
          entity.width *= 0.8;
          entity.height *= 0.8;
          entity.opacity = 0;
          setTimeout(() => {
            const index = engine.entities.indexOf(entity);
            if (index > -1) {
              engine.entities.splice(index, 1);
            }
          }, 500);
        }
      });
      enemiesInWave = 0;
      currentWave++; // Incrementar el número de oleada
      
      // Mostrar menú de selección de cartas
      const skillSelection = document.createElement('div');
      skillSelection.id = 'skill-selection';
      skillSelection.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; gap: 20px; z-index: 1000;';
      
      // Crear 3 cartas de habilidades aleatorias
      const availableSkills = window.skillSystem.skills.filter(skill => !window.skillSystem.equippedSkills.includes(skill));
      for (let i = 0; i < 3; i++) {
        const randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
        if (randomSkill) {
          const card = document.createElement('div');
          card.className = 'skill-card';
          card.style.cssText = 'width: 150px; height: 200px; background: rgba(0, 0, 0, 0.8); border: 2px solid #4CAF50; border-radius: 10px; padding: 10px; cursor: pointer; color: white; text-align: center;';
          card.innerHTML = `
            <img src="${randomSkill.icon}" style="width: 64px; height: 64px; margin-bottom: 10px;">
            <h3>${randomSkill.name}</h3>
            <p>Daño: ${randomSkill.damage}</p>
            <p>Velocidad: ${randomSkill.speed}</p>
          `;
          skillSelection.appendChild(card);
        }
      }
      
      document.body.appendChild(skillSelection);
      nextWaveTimer = 30; // Establecer temporizador a 30 segundos
      
      // Manejar selección de habilidad
      const selectSkill = (index, isAutoSelected = false) => {
        const selectedSkill = skillSystem.skills[index];
        if (selectedSkill) {
          // Empezar a buscar desde el slot 2
          let slotIndex = 1; // Índice 1 corresponde al slot 2
          while (slotIndex < skillSystem.equippedSkills.length) {
            if (!skillSystem.equippedSkills[slotIndex]) {
              skillSystem.equippedSkills[slotIndex] = selectedSkill;
              skillSystem.updateSkillIcon(slotIndex);
              break;
            }
            slotIndex++;
          }
        }
        
        skillSelection.style.display = 'none';
        if (timer) clearInterval(timer);
        isWaveActive = false;
        nextWaveTimer = isAutoSelected ? 30 : 5; // 5 segundos si fue selección manual, 30 si fue automática
        engine.isPaused = false;
      };
      
      // Iniciar temporizador de selección
      let timeLeft = 30; // 30 segundos para seleccionar
      const timerElement = document.getElementById('weapon-selection-timer');
      const nextWaveTimerElement = document.getElementById('next-wave-timer');
      let timer = setInterval(() => {
        timeLeft--;
        
        // Verificar que los elementos existan antes de actualizar
        if (timerElement) {
          timerElement.textContent = Math.ceil(timeLeft);
        }
        if (nextWaveTimerElement) {
          nextWaveTimerElement.textContent = `${Math.ceil(timeLeft)}s`;
        }
        
        // Si se acaba el tiempo, seleccionar habilidad aleatoria
        if (timeLeft <= 0) {
          const randomSkill = Math.floor(Math.random() * 3);
          selectSkill(randomSkill, true); // true indica que fue selección automática
          clearInterval(timer);
        }
      }, 1000);
      
      // Agregar eventos de clic a las cartas
      document.querySelectorAll('.skill-card').forEach((card, index) => {
        card.onclick = () => {
          document.querySelectorAll('.skill-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          selectSkill(index, false); // false indica que fue selección manual
          clearInterval(timer);
        };
      });
      
      // Agregar eventos de clic a las cartas
      document.querySelectorAll('.skill-card').forEach((card, index) => {
        card.onclick = () => {
          document.querySelectorAll('.skill-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          selectSkill(index);
        };
      });

    }
  } else {
    nextWaveTimer -= dt;
    
    // Iniciar nueva oleada
    if (nextWaveTimer <= 0) {
      currentWave++;
      maxEnemiesInWave = Math.min(5 + currentWave * 2, 20);
      waveTimer = 120;
      enemiesInWave = 0;
      isBossSpawned = false;
      isWaveActive = true;
    }
  }
  
  updateWaveHUD();
}

// Generar enemigo inicial
spawnEnemy();

// Cargar controles personalizados
const defaultControls = {
  up: 'w',
  down: 's',
  left: 'a',
  right: 'd'
};
let gameControls = JSON.parse(localStorage.getItem('gameControls'));
if (!gameControls) {
  gameControls = defaultControls;
  localStorage.setItem('gameControls', JSON.stringify(defaultControls));
}

// Entrada de teclado
let keys = {};
window.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  keys[key] = true;
});
window.addEventListener('keyup', e => {
  const key = e.key.toLowerCase();
  keys[key] = false;
  
  // Cuando se suelta una tecla de movimiento, verificar si el jugador está quieto
  if (!keys['arrowup'] && !keys[gameControls.up] &&
      !keys['arrowdown'] && !keys[gameControls.down] &&
      !keys['arrowleft'] && !keys[gameControls.left] &&
      !keys['arrowright'] && !keys[gameControls.right]) {
    player.isMoving = false;
    player.currentFrame = 0; // Volver al primer frame del sprite
  }
});


// Mouse click event disabled for shooting - only automatic shooting is enabled
window.addEventListener('click', (e) => {
  // Click event listener kept for other potential future interactions
});

// Inicializar stats del jugador según su clase
if (player.class === 'wizard') {
  player.mana = 100;
  player.maxMana = 100;
  skillSystem.primarySkill = skillSystem.skills[0];
}

if (player.class === 'warrior') {
  player.stamina = 100;
  player.maxStamina = 100;
  skillSystem.primarySkill = skillSystem.skills[0];
}

// Inicializar el icono de habilidad
document.addEventListener('DOMContentLoaded', () => {
  if (skillSystem.primarySkill) {
    const skillIcon = document.getElementById('selected-skill-icon');
    if (skillIcon) {
      skillIcon.style.backgroundImage = `url('${skillSystem.primarySkill.icon}')`;
    }
  }
});

// Game loop
let lastTime = performance.now();
let frameCount = 0;
let fps = 0;
let fpsUpdateInterval = 1000;
let lastFpsUpdate = performance.now();

function gameLoop(time) {
  let dt = (time - lastTime) / 1000;
  lastTime = time;
  
  frameCount++;
  if (time - lastFpsUpdate >= fpsUpdateInterval) {
    fps = Math.round((frameCount * 1000) / (time - lastFpsUpdate));
    frameCount = 0;
    lastFpsUpdate = time;
  }

  if (!engine.isPaused && !player.isDead) {
    // Mover el jugador y ajustar la cámara
    const moveSpeed = 200 * dt;
    let moveX = 0;
    let moveY = 0;
    
    if (keys['arrowright'] || keys[gameControls.right]) {
      moveX += 1;
      player.currentDirection = 'right';
      player.isMoving = true;
    }
    if (keys['arrowleft'] || keys[gameControls.left]) {
      moveX -= 1;
      player.currentDirection = 'left';
      player.isMoving = true;
    }
    if (keys['arrowup'] || keys[gameControls.up]) {
      moveY -= 1;
      player.currentDirection = 'up';
      player.isMoving = true;
    }
    if (keys['arrowdown'] || keys[gameControls.down]) {
      moveY += 1;
      player.currentDirection = 'down';
      player.isMoving = true;
    }

    // Establecer el estado de movimiento
    if (moveX === 0 && moveY === 0) {
      player.isMoving = false;
    } else {
      player.isMoving = true;
    }
    
    // Actualizar la animación continuamente
    player.frameTimer += dt * player.animationSpeed;
    if (player.frameTimer >= 1/player.fps) {
      player.frameTimer = 0;
      player.currentFrame = (player.currentFrame + 1) % player.totalFrames;
    }
    
    player.x += moveX * moveSpeed;
    player.y += moveY * moveSpeed;
    
    // Mantener al jugador dentro de los límites del mapa
    player.x = Math.max(0, Math.min(player.x, engine.map.getMapWidth()));
    player.y = Math.max(0, Math.min(player.y, engine.map.getMapHeight()));

    // Actualizar sistema de oleadas
    waveManager(dt);

    // Actualizar contador de enemigos
    enemiesInWave = engine.entities.filter(entity => entity.isEnemy && !entity.isDead).length;
  }

  engine.update(dt);
  engine.render();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
