// Game state synchronization for multiplayer mode
let multiplayerGameState = {
    players: {},
    enemies: [],
    projectiles: [],
    wave: 1,
    enemiesKilled: 0,
    totalEnemiesKilled: 0
};

// Update local game state
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
            currentFrame: localPlayer.currentFrame
        };
    }

    // Update enemies state
    multiplayerGameState.enemies = engine.entities
        .filter(e => e.isEnemy && !e.isDead)
        .map(enemy => ({
            x: enemy.x,
            y: enemy.y,
            health: enemy.health,
            type: enemy.bossType || 'normal'
        }));

    // Update projectiles state
    multiplayerGameState.projectiles = engine.entities
        .filter(e => e instanceof Projectile)
        .map(proj => ({
            x: proj.x,
            y: proj.y,
            velocityX: proj.velocityX,
            velocityY: proj.velocityY,
            weaponType: proj.weaponType
        }));

    // Update game progress
    multiplayerGameState.wave = currentWave;
    multiplayerGameState.enemiesKilled = gameState.enemiesKilled;
    multiplayerGameState.totalEnemiesKilled = gameState.totalEnemiesKilled;

    // Send updated state to Firebase
    updateGameState(currentRoomId, multiplayerGameState);
}

// Apply remote game state
function applyRemoteGameState(remoteState) {
    if (!remoteState || !currentRoomId) return;

    const playerRole = isHost ? 'guest' : 'host';
    const remotePlayer = remoteState.players[playerRole];

    // Update remote player
    if (remotePlayer) {
        let existingPlayer = engine.entities.find(
            e => !e.isEnemy && e !== engine.entities.find(e => !e.isEnemy && !e.isDead)
        );

        if (!existingPlayer) {
            existingPlayer = new Entity(remotePlayer.x, remotePlayer.y);
            existingPlayer.class = remotePlayer.class;
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