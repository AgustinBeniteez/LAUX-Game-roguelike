// Multiplayer game management
import { createGameRoom, joinGameRoom, updateGameState, listenToGameState, updatePlayerState, listenToPlayerChanges } from './firebase-config.js';
import { initWaitingPhase } from './game-state.js';

let gameStarted = false;

// Store current room and player information
let currentRoomId = null;
let currentPlayerType = null; // 'host' or 'guest'
let playerName = null;

// Create a new game room
export async function hostGame(name) {
    try {
        playerName = name;
        currentPlayerType = 'host';
        currentRoomId = await createGameRoom(name);
        setupGameListeners();
        showRoomCode(currentRoomId);
        initWaitingPhase();
        return currentRoomId;
    } catch (error) {
        console.error('Error creating game room:', error);
        throw error;
    }
}

// Join an existing game room
export async function joinGame(roomId, name) {
    try {
        playerName = name;
        currentPlayerType = 'guest';
        await joinGameRoom(roomId, name);
        currentRoomId = roomId;
        setupGameListeners();
        showRoomCode(roomId);
        initWaitingPhase();
        return true;
    } catch (error) {
        console.error('Error joining game room:', error);
        throw error;
    }
}

// Set up listeners for game state changes
function setupGameListeners() {
    listenToGameState(currentRoomId, (gameState) => {
        if (gameState) {
            if (gameState.gamePhase === 'playing' && !gameStarted) {
                gameStarted = true;
                document.getElementById('hud').style.display = 'block';
                document.getElementById('gameCanvas').style.visibility = 'visible';
            }
            updateLocalGameState(gameState);
        }
    });

    listenToPlayerChanges(currentRoomId, (players) => {
        if (players) {
            updatePlayersUI(players);
            checkGameStart(players);
        }
    });
}

// Show room code in multiplayer mode
function showRoomCode(roomId) {
    const roomCodeElement = document.getElementById('roomCode');
    const pauseRoomCodeElement = document.getElementById('pauseRoomCode');
    
    if (roomCodeElement) {
        roomCodeElement.style.display = 'block';
        roomCodeElement.textContent = `Código de sala: ${roomId}`;
    }
    
    if (pauseRoomCodeElement) {
        pauseRoomCodeElement.textContent = `Código de sala: ${roomId}`;
    }
}

// Update the local game state based on Firebase data
function updateLocalGameState(gameState) {
    // Update game phase
    if (window.gamePhase !== gameState.phase) {
        window.gamePhase = gameState.phase;
    }

    // Update round time
    if (window.roundTime !== gameState.roundTime) {
        window.roundTime = gameState.roundTime;
    }

    // Update enemies
    if (gameState.enemies) {
        window.enemies = gameState.enemies;
    }

    // Update remote player state
    if (gameState.players) {
        const playerRole = isHost ? 'guest' : 'host';
        const remotePlayer = gameState.players[playerRole];
        
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

            if (existingPlayer.isMoving) {
                existingPlayer.animate();
            }
        }
    }
}

// Update the UI to show connected players
function updatePlayersUI(players) {
    const hostInfo = document.getElementById('hostInfo');
    const guestInfo = document.getElementById('guestInfo');

    if (hostInfo && players.host) {
        hostInfo.textContent = `Host: ${players.host.name} ${players.host.isReady ? '(Ready)' : ''}`;
    }

    if (guestInfo && players.guest) {
        guestInfo.textContent = `Guest: ${players.guest.name} ${players.guest.isReady ? '(Ready)' : ''}`;
    }
}

// Check if both players are ready to start
function checkGameStart(players) {
    if (players.host?.isReady && players.guest?.isReady) {
        startGame();
    }
}

// Start the multiplayer game
function startGame() {
    updateGameState(currentRoomId, {
        phase: 1,
        roundTime: 0,
        enemies: [],
        started: true
    });
}

// Update player ready status
export function setPlayerReady(isReady) {
    updatePlayerState(currentRoomId, currentPlayerType, {
        name: playerName,
        isReady: isReady
    });
}

// Sync game state to Firebase
export function syncGameState(gameState) {
    if (currentRoomId && currentPlayerType === 'host') {
        updateGameState(currentRoomId, gameState);
    }
}