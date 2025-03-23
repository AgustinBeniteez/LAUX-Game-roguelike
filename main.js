const assetManager = new AssetManager();
const engine = new Engine('gameCanvas', 800, 600);

// Load game state and player data
const gameState = JSON.parse(localStorage.getItem('gameState')) || {
  currentWave: 1,
  enemiesKilled: 0,
  totalEnemiesKilled: 0,
  waveTimer: 120,
  nextWaveTimer: 30,
  isWaveActive: true,
  isBossSpawned: false,
  entities: []
};

const playerData = JSON.parse(localStorage.getItem('playerData')) || {
  class: 'warrior',
  health: 120,
  speed: 120,
  level: 1,
  experience: 0,
  x: 100,
  y: 100
};

const player = new Entity(100, 100);
player.loadSprite(playerData.class === 'wizard' ? 'sprites/player_sprite.png' : 'sprites/player_sprite.png', 32, 32, 4);
player.health = playerData.health;
player.maxHealth = playerData.health;
player.speed = 100; // Velocidad reducida del jugador
player.class = playerData.class;
player.mana = playerData.mana;
player.maxMana = playerData.maxMana;
player.stamina = playerData.stamina;
player.maxStamina = playerData.maxStamina;
player.inventory = playerData.inventory;
player.equippedWeapon = playerData.equippedWeapon;

// Update HUD values
document.getElementById('mana-value').textContent = player.mana;
document.getElementById('stamina-value').textContent = player.stamina;
document.getElementById('weapon-value').textContent = player.equippedWeapon ? player.equippedWeapon.name : '-';

// Show/hide mana and stamina based on class
document.getElementById('mana-container').style.display = player.class === 'wizard' ? 'block' : 'none';
document.getElementById('stamina-container').style.display = player.class === 'warrior' ? 'block' : 'none';

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
    enemiesKilled: gameState.enemiesKilled,
    totalEnemiesKilled: gameState.totalEnemiesKilled,
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
  document.getElementById('enemies-value').textContent = enemiesInWave;
  document.getElementById('next-wave-timer').textContent = 
    isWaveActive ? `${Math.ceil(waveTimer)}s` : `${Math.ceil(nextWaveTimer)}s`;
}

// Función para gestionar las oleadas
function waveManager(dt) {
  if (isWaveActive) {
    waveTimer -= dt;
    
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
      
      // Mostrar menú de selección de armas
      const weaponSelection = document.getElementById('weapon-selection');
      weaponSelection.style.display = 'block';
      
      // Configurar las armas disponibles
      const weapons = [
        { name: 'Espada de Fuego', description: 'Daño aumentado y efecto de quemadura', sprite: 'sprites/player_espada_sprite.png', cooldown: 2.0 },
        { name: 'Varita de Hielo', description: 'Ralentiza enemigos y daño mágico', sprite: 'sprites/player_barita_sprite.png', cooldown: 2.0 },
        { name: 'Hacha de Tormenta', description: 'Daño en área y efecto de aturdimiento', sprite: 'sprites/player_espada_sprite.png', cooldown: 2.0 }
      ];
      
      // Actualizar información de las cartas
      weapons.forEach((weapon, index) => {
        document.getElementById(`weapon-name-${index}`).textContent = weapon.name;
        document.getElementById(`weapon-desc-${index}`).textContent = 
          player.equippedWeapon && player.equippedWeapon.name === weapon.name
            ? 'Mejora: Reduce tiempo entre disparos a 1.5s'
            : weapon.description;
      });
      
      // Manejar selección de arma
      const selectWeapon = (index) => {
        const selectedWeapon = weapons[index];
        if (player.equippedWeapon && player.equippedWeapon.name === selectedWeapon.name) {
          player.shootCooldown = 1.5; // Mejora el tiempo de disparo
        } else {
          player.shootCooldown = selectedWeapon.cooldown;
        }
        player.loadWeaponSprite(selectedWeapon.sprite, 32, 32, 4);
        player.equippedWeapon = selectedWeapon;
        document.getElementById('weapon-value').textContent = selectedWeapon.name;
        weaponSelection.style.display = 'none';
        clearInterval(timer);
      };
      
      // Iniciar temporizador de selección
      let timeLeft = 30;
      const timerElement = document.getElementById('weapon-selection-timer');
      const timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
          clearInterval(timer);
          // Seleccionar arma aleatoria si no se eligió ninguna
          const randomWeapon = Math.floor(Math.random() * weapons.length);
          selectWeapon(randomWeapon);
        }
      }, 1000);
      
      // Agregar eventos de clic a las cartas
      document.querySelectorAll('.weapon-card').forEach((card, index) => {
        card.onclick = () => {
          document.querySelectorAll('.weapon-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          selectWeapon(index);
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

// Entrada de teclado
let keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

// Mouse click event for shooting
window.addEventListener('click', (e) => {
  if (!engine.isPaused && !player.isDead && player.class === 'wizard') {
    const rect = engine.canvas.getBoundingClientRect();
    const scaleX = engine.gameWidth / engine.canvas.width;
    const scaleY = engine.gameHeight / engine.canvas.height;
    
    const targetX = (e.clientX - rect.left) * scaleX;
    const targetY = (e.clientY - rect.top) * scaleY;
    
    player.shoot(targetX, targetY);
  }
});

// Load weapon sprite for wizard
if (player.class === 'wizard') {
  player.loadWeaponSprite('sprites/player_barita_sprite.png', 32, 32, 4);
  player.equippedWeapon = 'wand';
  player.mana = 100;
  player.maxMana = 100;
}

// Load weapon sprite for warrior
if (player.class === 'Warrior') {
  player.loadWeaponSprite('sprites/player_espada_sprite.png', 32, 32, 4);
}

// Game loop
let lastTime = 0;
function gameLoop(time) {
  let dt = (time - lastTime) / 1000;
  lastTime = time;

  if (!engine.isPaused && !player.isDead) {
    // Mover el jugador y ajustar la cámara
    const moveSpeed = 200 * dt;
    if (keys['ArrowRight'] || keys['d']) player.x += moveSpeed;
    if (keys['ArrowLeft'] || keys['a']) player.x -= moveSpeed;
    if (keys['ArrowUp'] || keys['w']) player.y -= moveSpeed;
    if (keys['ArrowDown'] || keys['s']) player.y += moveSpeed;
    
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
