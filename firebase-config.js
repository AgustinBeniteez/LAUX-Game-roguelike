import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js';
import { getDatabase, ref, set, get, update, remove, onValue } from 'https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js';

// Firebase configuration
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

// Room management functions
const createRoom = async () => {
  const roomId = Math.random().toString(36).substring(2, 8);
  await database.ref(`rooms/${roomId}`).set({
    players: 1,
    status: 'waiting',
    gameState: null
  });
  return roomId;
};

const joinRoom = async (roomId) => {
  const roomRef = database.ref(`rooms/${roomId}`);
  const snapshot = await roomRef.once('value');
  const room = snapshot.val();
  
  if (!room || room.players >= 2) {
    throw new Error('Room is full or does not exist');
  }
  
  await roomRef.update({
    players: room.players + 1,
    status: room.players + 1 === 2 ? 'ready' : 'waiting'
  });
  
  return room;
};

const leaveRoom = async (roomId) => {
  const roomRef = database.ref(`rooms/${roomId}`);
  const snapshot = await roomRef.once('value');
  const room = snapshot.val();
  
  if (!room) return;
  
  if (room.players <= 1) {
    await roomRef.remove();
  } else {
    await roomRef.update({
      players: room.players - 1,
      status: 'waiting'
    });
  }
};

const updateGameState = (roomId, gameState) => {
  return database.ref(`rooms/${roomId}/gameState`).set(gameState);
};

const listenToGameState = (roomId, callback) => {
  database.ref(`rooms/${roomId}/gameState`).on('value', (snapshot) => {
    callback(snapshot.val());
  });
};

export {
  createRoom,
  joinRoom,
  leaveRoom,
  updateGameState,
  listenToGameState
};