// Game state synchronization for multiplayer mode
let multiplayerGameState = {
    players: {},
    enemies: [],
    projectiles: [],
    wave: 1,
    enemiesKilled: 0,
    totalEnemiesKilled: 0,
    gamePhase: 'waiting', // waiting, ready, playing
    readyPlayers: {}
};

// Update player position and state
function updatePlayerPosition(player) {
    if (!currentRoomId) return;
    
    const playerRole = isHost ? 'host' : 'guest';
    multiplayerGameState.players[playerRole] = {
        x: player.x,
        y: player.y,
        health: player.health,
        class: player.class,
        currentFrame: player.currentFrame,
        direction: player.direction,
        isMoving: player.isMoving
    };
    
    updateGameState(currentRoomId, multiplayerGameState);
}

// Update local game state
let isPaused = false;
let isGameStarted = false;

// Ready check system
function setPlayerReady(playerRole) {
    if (!currentRoomId) return;
    multiplayerGameState.readyPlayers[playerRole] = true;
    updateGameState(currentRoomId, multiplayerGameState);
}

function checkAllPlayersReady() {
    return multiplayerGameState.readyPlayers.host && multiplayerGameState.readyPlayers.guest;
}

function startGame() {
    if (!checkAllPlayersReady()) return;
    isGameStarted = true;
    multiplayerGameState.gamePhase = 'playing';
    updateGameState(currentRoomId, multiplayerGameState);
    
    // Show HUD and map
    document.getElementById('hud').style.display = 'block';
    document.getElementById('gameCanvas').style.visibility = 'visible';
    document.getElementById('readyButton').style.display = 'none';
}

// Initialize game UI for waiting phase
function initWaitingPhase() {
    document.getElementById('hud').style.display = 'none';
    document.getElementById('gameCanvas').style.visibility = 'hidden';
    
    const readyButton = document.createElement('button');
    readyButton.id = 'readyButton';
    readyButton.className = 'menu-button';
    readyButton.textContent = 'Listo';
    readyButton.style.position = 'fixed';
    readyButton.style.bottom = '20px';
    readyButton.style.right = '20px';
    readyButton.onclick = () => {
        const playerRole = isHost ? 'host' : 'guest';
        setPlayerReady(playerRole);
        readyButton.disabled = true;
        readyButton.textContent = 'Esperando...';
    };
    document.body.appendChild(readyButton);
}

function updateLocalGameState() {
    if (!currentRoomId) return;

    // Update player state
    const localPlayer = engine.entities.find(e => !e.isEnemy && !e.isDead);
    if (localPlayer) {
        multiplayerGameState.players[isHost ? 'host' : 'guest'] = {
            x: localPlayer.x,
            y: localPlayer.y,
            health: localPlayer.health,
            class: localPlayer.class,
            currentFrame: localPlayer.currentFrame,
            playerName: localPlayer.playerName,
            isPaused: isPaused
        };
    }

    // Send updated state to Firebase
    updateGameState(currentRoomId, multiplayerGameState);
}

function applyRemoteGameState(remoteState) {
    if (!remoteState || !currentRoomId) return;

    const playerRole = isHost ? 'guest' : 'host';
    const remotePlayer = remoteState.players[playerRole];

    // Update remote player pause state
    if (remotePlayer && remotePlayer.isPaused) {
        engine.isPaused = true;
        document.getElementById('pauseMenu').style.display = 'flex';
    }

    // Update remote player
    if (remotePlayer) {
        let existingPlayer = engine.entities.find(
            e => !e.isEnemy && e !== engine.entities.find(e => !e.isEnemy && !e.isDead)
        );

        if (!existingPlayer) {
            existingPlayer = new Entity(remotePlayer.x, remotePlayer.y);
            existingPlayer.class = remotePlayer.class;
            existingPlayer.isRemotePlayer = true;
            existingPlayer.loadSprite(
                remotePlayer.class === 'warrior' ? 'sprites/player_espada_sprite.png' : 'sprites/player_barita_sprite.png',
                32, 32, 4
            );
            engine.addEntity(existingPlayer);
        }

        existingPlayer.x = remotePlayer.x;
        existingPlayer.y = remotePlayer.y;
        existingPlayer.health = remotePlayer.health;
        existingPlayer.currentFrame = remotePlayer.currentFrame;
        existingPlayer.direction = remotePlayer.direction;
        existingPlayer.isMoving = remotePlayer.isMoving;

        // Actualizar animación según el estado
        if (existingPlayer.isMoving) {
            existingPlayer.animate();
        }
    }

    // Sync game progress
    if (isHost) {
        currentWave = remoteState.wave;
        gameState.enemiesKilled = remoteState.enemiesKilled;
        gameState.totalEnemiesKilled = remoteState.totalEnemiesKilled;
        document.getElementById('enemies-value').textContent = gameState.totalEnemiesKilled;
    }
}

// Start multiplayer game state sync
function startMultiplayerSync() {
    if (!currentRoomId) return;

    // Update local state periodically
    setInterval(updateLocalGameState, 50);

    // Listen for remote state changes
    listenToGameState(currentRoomId, applyRemoteGameState);
}

export {
    startMultiplayerSync,
    updateLocalGameState,
    applyRemoteGameState
};