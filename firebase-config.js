// Firebase configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, set, onValue, push, child, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyBdQ8Vw702Qy4_s3FmZ5oJ78oKAfWJMLuc",
  authDomain: "lauxgame.firebaseapp.com",
  databaseURL: "https://lauxgame-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "lauxgame",
  storageBucket: "lauxgame.firebasestorage.app",
  messagingSenderId: "537869553051",
  appId: "1:537869553051:web:280a380103a26597dae53e",
  measurementId: "G-BC4SSF6FHS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Game room management
export async function createGameRoom(hostName) {
  const roomsRef = ref(database, 'rooms');
  const newRoomRef = push(roomsRef);
  const roomId = newRoomRef.key;

  await set(newRoomRef, {
    host: {
      name: hostName,
      isReady: false
    },
    gameState: {
      phase: 1,
      roundTime: 0,
      enemies: [],
      started: false
    }
  });

  return roomId;
}

export async function joinGameRoom(roomId, playerName) {
  const roomRef = ref(database, `rooms/${roomId}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error('Room not found');
  }

  await set(ref(database, `rooms/${roomId}/guest`), {
    name: playerName,
    isReady: false
  });

  return true;
}

export function updateGameState(roomId, gameState) {
  const gameStateRef = ref(database, `rooms/${roomId}/gameState`);
  set(gameStateRef, gameState);
}

export function listenToGameState(roomId, callback) {
  const gameStateRef = ref(database, `rooms/${roomId}/gameState`);
  onValue(gameStateRef, (snapshot) => {
    callback(snapshot.val());
  });
}

export function updatePlayerState(roomId, playerType, state) {
  const playerRef = ref(database, `rooms/${roomId}/${playerType}`);
  set(playerRef, state);
}

export function listenToPlayerChanges(roomId, callback) {
  const roomRef = ref(database, `rooms/${roomId}`);
  onValue(roomRef, (snapshot) => {
    const room = snapshot.val();
    if (room) {
      callback({
        host: room.host,
        guest: room.guest
      });
    }
  });
}