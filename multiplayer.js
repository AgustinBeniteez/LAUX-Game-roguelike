// Multiplayer interface management
let currentRoomId = null;
let isHost = false;

// Create the multiplayer menu interface
function createMultiplayerMenu() {
    const multiplayerMenu = document.createElement('div');
    multiplayerMenu.id = 'multiplayer-menu';
    multiplayerMenu.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        padding: 20px;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        gap: 15px;
        z-index: 1000;
    `;

    const title = document.createElement('h2');
    title.textContent = 'Multijugador';
    title.style.color = 'white';
    title.style.textAlign = 'center';

    const createRoomButton = document.createElement('button');
    createRoomButton.textContent = 'Crear Sala';
    createRoomButton.className = 'menu-button';
    createRoomButton.onclick = createGameRoom;

    const joinRoomContainer = document.createElement('div');
    joinRoomContainer.style.display = 'flex';
    joinRoomContainer.style.gap = '10px';

    const roomCodeInput = document.createElement('input');
    roomCodeInput.type = 'text';
    roomCodeInput.placeholder = 'Código de sala';
    roomCodeInput.style.cssText = `
        padding: 10px;
        border-radius: 5px;
        border: none;
        background: rgba(255, 255, 255, 0.1);
        color: white;
    `;

    const joinRoomButton = document.createElement('button');
    joinRoomButton.textContent = 'Unirse';
    joinRoomButton.className = 'menu-button';
    joinRoomButton.onclick = () => joinGameRoom(roomCodeInput.value);

    const backButton = document.createElement('button');
    backButton.textContent = 'Volver';
    backButton.className = 'menu-button';
    backButton.onclick = () => multiplayerMenu.remove();

    joinRoomContainer.appendChild(roomCodeInput);
    joinRoomContainer.appendChild(joinRoomButton);

    multiplayerMenu.appendChild(title);
    multiplayerMenu.appendChild(createRoomButton);
    multiplayerMenu.appendChild(joinRoomContainer);
    multiplayerMenu.appendChild(backButton);

    document.body.appendChild(multiplayerMenu);
}

// Create a new game room
async function createGameRoom() {
    try {
        const roomId = await createRoom();
        currentRoomId = roomId;
        isHost = true;
        
        // Show room code to share
        const roomInfo = document.createElement('div');
        roomInfo.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            color: white;
            z-index: 1001;
        `;
        
        roomInfo.innerHTML = `
            <h3>Código de sala: ${roomId}</h3>
            <p>Esperando a otro jugador...</p>
            <button class="menu-button" onclick="this.parentElement.remove()">Cerrar</button>
        `;
        
        document.body.appendChild(roomInfo);

        // Listen for second player
        listenToGameState(roomId, (gameState) => {
            if (gameState && gameState.status === 'ready') {
                window.location.href = 'game.html?mode=multiplayer&room=' + roomId;
            }
        });
    } catch (error) {
        console.error('Error creating room:', error);
        alert('Error al crear la sala');
    }
}

// Join an existing game room
async function joinGameRoom(roomId) {
    if (!roomId) {
        alert('Por favor ingresa un código de sala');
        return;
    }

    try {
        const room = await joinRoom(roomId);
        currentRoomId = roomId;
        isHost = false;
        window.location.href = 'game.html?mode=multiplayer&room=' + roomId;
    } catch (error) {
        console.error('Error joining room:', error);
        alert('Error al unirse a la sala');
    }
}

// Leave the current room
async function leaveGameRoom() {
    if (currentRoomId) {
        await leaveRoom(currentRoomId);
        currentRoomId = null;
        isHost = false;
        window.location.href = 'index.html';
    }
}

// Update game state in multiplayer mode
function updateMultiplayerState(gameState) {
    if (currentRoomId) {
        updateGameState(currentRoomId, gameState);
    }
}

// Export functions and variables
export {
    createMultiplayerMenu,
    createGameRoom,
    joinGameRoom,
    leaveGameRoom,
    updateMultiplayerState,
    currentRoomId,
    isHost
};