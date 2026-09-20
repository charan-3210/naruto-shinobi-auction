// ============================================================
// NARUTO SHINOBI AUCTION
// Firebase + GitHub Pages
// ============================================================

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue,
  runTransaction,
  remove
} from
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyB4PSLZ0ZhVGGtfZ1hcluOWsTbvJDxxxTg",
  authDomain: "naruto-shinobi-auction.firebaseapp.com",
  databaseURL: "https://naruto-shinobi-auction-default-rtdb.firebaseio.com",
  projectId: "naruto-shinobi-auction",
  storageBucket: "naruto-shinobi-auction.firebasestorage.app",
  messagingSenderId: "187952563869",
  appId: "1:187952563869:web:839ac2add9ae0f5835f674",
  measurementId: "G-N3QGHDB240"
};


// ============================================================
// FIREBASE INITIALIZATION
// ============================================================

let app;
let db;
let auth;

try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
  showConnection("❌ Firebase initialization failed");
}


// ============================================================
// GLOBAL STATE
// ============================================================

let currentUser = null;
let currentRoomCode = null;
let currentTeamName = "";
let currentRoom = null;

let roomListener = null;
let auctionListener = null;

let timerInterval = null;
let finishingAuction = false;


// ============================================================
// GAME SETTINGS
// ============================================================

const STARTING_BUDGET = 2000; // ₹20 Cr = 2000 Lakhs
const MAX_TEAMS = 4;
const MAX_CHARACTERS = 4;

const AUCTION_TIME = 10;

const START_BID = 100; // ₹1 Cr
const SMALL_INCREMENT = 50; // ₹50 Lakhs
const BIG_INCREMENT = 100; // ₹1 Cr

const STARTER_CHARACTER_DELAY = 1200;


// ============================================================
// CHARACTERS
// Power is used for team ranking.
// ============================================================

const characters = [

  // OTSUTSUKI
  {
    id: "kaguya",
    name: "Kaguya Otsutsuki",
    power: 100,
    attack: 100,
    defense: 100,
    speed: 94,
    hax: 100,
    intelligence: 96,
    synergy: 92
  },

  {
    id: "isshiki",
    name: "Isshiki Otsutsuki",
    power: 100,
    attack: 100,
    defense: 98,
    speed: 100,
    hax: 100,
    intelligence: 99,
    synergy: 94
  },

  {
    id: "hagoromo",
    name: "Hagoromo Otsutsuki",
    power: 99,
    attack: 98,
    defense: 99,
    speed: 92,
    hax: 100,
    intelligence: 100,
    synergy: 100
  },

  {
    id: "hamura",
    name: "Hamura Otsutsuki",
    power: 96,
    attack: 95,
    defense: 96,
    speed: 92,
    hax: 95,
    intelligence: 94,
    synergy: 94
  },

  {
    id: "momoshiki",
    name: "Momoshiki Otsutsuki",
    power: 98,
    attack: 98,
    defense: 94,
    speed: 97,
    hax: 99,
    intelligence: 96,
    synergy: 94
  },

  {
    id: "kinshiki",
    name: "Kinshiki Otsutsuki",
    power: 94,
    attack: 98,
    defense: 94,
    speed: 91,
    hax: 87,
    intelligence: 84,
    synergy: 87
  },

  {
    id: "toneri",
    name: "Toneri Otsutsuki",
    power: 91,
    attack: 91,
    defense: 89,
    speed: 91,
    hax: 95,
    intelligence: 89,
    synergy: 88
  },

  // NARUTO / SASUKE
  {
    id: "naruto",
    name: "Naruto Uzumaki",
    power: 99,
    attack: 99,
    defense: 98,
    speed: 97,
    hax: 96,
    intelligence: 94,
    synergy: 100
  },

  {
    id: "sasuke",
    name: "Sasuke Uchiha",
    power: 98,
    attack: 98,
    defense: 94,
    speed: 98,
    hax: 99,
    intelligence: 98,
    synergy: 96
  },

  {
    id: "madara",
    name: "Madara Uchiha",
    power: 99,
    attack: 100,
    defense: 98,
    speed: 95,
    hax: 100,
    intelligence: 99,
    synergy: 98
  },

  {
    id: "hashirama",
    name: "Hashirama Senju",
    power: 98,
    attack: 98,
    defense: 100,
    speed: 90,
    hax: 96,
    intelligence: 94,
    synergy: 100
  },

  {
    id: "obito",
    name: "Obito Uchiha",
    power: 96,
    attack: 94,
    defense: 93,
    speed: 96,
    hax: 100,
    intelligence: 95,
    synergy: 96
  },

  {
    id: "itachi",
    name: "Itachi Uchiha",
    power: 95,
    attack: 92,
    defense: 88,
    speed: 94,
    hax: 99,
    intelligence: 100,
    synergy: 98
  },

  {
    id: "minato",
    name: "Minato Namikaze",
    power: 96,
    attack: 94,
    defense: 89,
    speed: 100,
    hax: 95,
    intelligence: 99,
    synergy: 98
  },

  {
    id: "tobirama",
    name: "Tobirama Senju",
    power: 93,
    attack: 91,
    defense: 88,
    speed: 96,
    hax: 94,
    intelligence: 99,
    synergy: 96
  },

  {
    id: "jiraiya",
    name: "Jiraiya",
    power: 88,
    attack: 88,
    defense: 86,
    speed: 83,
    hax: 91,
    intelligence: 94,
    synergy: 96
  },

  {
    id: "pain",
    name: "Pain",
    power: 95,
    attack: 94,
    defense: 92,
    speed: 88,
    hax: 98,
    intelligence: 94,
    synergy: 95
  },

  {
    id: "nagato",
    name: "Nagato",
    power: 96,
    attack: 95,
    defense: 91,
    speed: 82,
    hax: 100,
    intelligence: 95,
    synergy: 94
  },

  {
    id: "kakashi",
    name: "Kakashi Hatake",
    power: 90,
    attack: 88,
    defense: 85,
    speed: 91,
    hax: 92,
    intelligence: 98,
    synergy: 98
  },

  {
    id: "guy",
    name: "Might Guy",
    power: 94,
    attack: 100,
    defense: 88,
    speed: 99,
    hax: 82,
    intelligence: 78,
    synergy: 90
  },

  {
    id: "lee",
    name: "Rock Lee",
    power: 83,
    attack: 91,
    defense: 79,
    speed: 92,
    hax: 65,
    intelligence: 72,
    synergy: 84
  },

  {
    id: "neji",
    name: "Neji Hyuga",
    power: 84,
    attack: 83,
    defense: 80,
    speed: 87,
    hax: 86,
    intelligence: 88,
    synergy: 89
  },

  {
    id: "gaara",
    name: "Gaara",
    power: 86,
    attack: 85,
    defense: 95,
    speed: 75,
    hax: 90,
    intelligence: 88,
    synergy: 92
  },

  {
    id: "killerbee",
    name: "Killer B",
    power: 91,
    attack: 94,
    defense: 90,
    speed: 87,
    hax: 91,
    intelligence: 82,
    synergy: 91
  },

  {
    id: "orochimaru",
    name: "Orochimaru",
    power: 91,
    attack: 89,
    defense: 91,
    speed: 82,
    hax: 96,
    intelligence: 99,
    synergy: 92
  },

  {
    id: "kabuto",
    name: "Kabuto Yakushi",
    power: 87,
    attack: 84,
    defense: 86,
    speed: 84,
    hax: 92,
    intelligence: 98,
    synergy: 88
  },

  {
    id: "deidara",
    name: "Deidara",
    power: 84,
    attack: 88,
    defense: 72,
    speed: 79,
    hax: 90,
    intelligence: 87,
    synergy: 84
  },

  {
    id: "sasori",
    name: "Sasori",
    power: 85,
    attack: 88,
    defense: 82,
    speed: 78,
    hax: 91,
    intelligence: 91,
    synergy: 86
  },

  {
    id: "kisame",
    name: "Kisame Hoshigaki",
    power: 86,
    attack: 91,
    defense: 91,
    speed: 75,
    hax: 85,
    intelligence: 78,
    synergy: 88
  },

  {
    id: "kakuzu",
    name: "Kakuzu",
    power: 84,
    attack: 86,
    defense: 94,
    speed: 73,
    hax: 86,
    intelligence: 83,
    synergy: 86
  },

  {
    id: "hidan",
    name: "Hidan",
    power: 76,
    attack: 84,
    defense: 82,
    speed: 72,
    hax: 88,
    intelligence: 68,
    synergy: 74
  },

  {
    id: "konan",
    name: "Konan",
    power: 79,
    attack: 81,
    defense: 74,
    speed: 78,
    hax: 87,
    intelligence: 89,
    synergy: 84
  },

  {
    id: "shikamaru",
    name: "Shikamaru Nara",
    power: 73,
    attack: 61,
    defense: 70,
    speed: 67,
    hax: 82,
    intelligence: 100,
    synergy: 98
  },

  {
    id: "shino",
    name: "Shino Aburame",
    power: 72,
    attack: 72,
    defense: 71,
    speed: 68,
    hax: 82,
    intelligence: 88,
    synergy: 84
  },

  {
    id: "temari",
    name: "Temari",
    power: 72,
    attack: 77,
    defense: 67,
    speed: 70,
    hax: 77,
    intelligence: 82,
    synergy: 82
  },

  {
    id: "kankuro",
    name: "Kankuro",
    power: 70,
    attack: 73,
    defense: 72,
    speed: 64,
    hax: 79,
    intelligence: 81,
    synergy: 80
  },

  {
    id: "choji",
    name: "Choji Akimichi",
    power: 71,
    attack: 86,
    defense: 80,
    speed: 60,
    hax: 69,
    intelligence: 65,
    synergy: 78
  },

  {
    id: "ino",
    name: "Ino Yamanaka",
    power: 68,
    attack: 61,
    defense: 64,
    speed: 68,
    hax: 79,
    intelligence: 84,
    synergy: 90
  },

  {
    id: "sakura",
    name: "Sakura Haruno",
    power: 84,
    attack: 94,
    defense: 85,
    speed: 79,
    hax: 76,
    intelligence: 87,
    synergy: 91
  },

  {
    id: "tsunade",
    name: "Tsunade",
    power: 91,
    attack: 96,
    defense: 94,
    speed: 76,
    hax: 86,
    intelligence: 92,
    synergy: 97
  },

  {
    id: "sarutobi",
    name: "Hiruzen Sarutobi",
    power: 91,
    attack: 90,
    defense: 86,
    speed: 81,
    hax: 88,
    intelligence: 98,
    synergy: 94
  },

  {
    id: "danzo",
    name: "Danzo Shimura",
    power: 82,
    attack: 83,
    defense: 81,
    speed: 77,
    hax: 91,
    intelligence: 93,
    synergy: 78
  },

  {
    id: "jiraiya2",
    name: "Jiraiya Sage Mode",
    power: 93,
    attack: 92,
    defense: 89,
    speed: 85,
    hax: 94,
    intelligence: 96,
    synergy: 97
  },

  {
    id: "naruto_sage",
    name: "Naruto Sage Mode",
    power: 92,
    attack: 92,
    defense: 90,
    speed: 90,
    hax: 91,
    intelligence: 91,
    synergy: 97
  },

  {
    id: "sasuke_ms",
    name: "Sasuke Mangekyo",
    power: 91,
    attack: 91,
    defense: 82,
    speed: 93,
    hax: 96,
    intelligence: 96,
    synergy: 92
  }

];


// ============================================================
// HELPERS
// ============================================================

function $(id) {
  return document.getElementById(id);
}


function showConnection(message) {
  const el = $("connectionStatus");

  if (el) {
    el.textContent = message;
  }

  const allMessages = document.querySelectorAll(
    "#connectionStatus, #firebaseStatus"
  );

  allMessages.forEach(item => {
    item.textContent = message;
  });
}


function formatMoney(lakhs) {
  if (lakhs >= 100) {
    const crores = lakhs / 100;

    if (Number.isInteger(crores)) {
      return `₹${crores} Cr`;
    }

    return `₹${crores.toFixed(2)} Cr`;
  }

  return `₹${lakhs} L`;
}


function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function randomRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}


function shuffleArray(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}


function getCharacter(id) {
  return characters.find(character => character.id === id);
}


function getNextBid(currentBid) {
  if (!currentBid || currentBid < START_BID) {
    return START_BID;
  }

  if (currentBid < 1000) {
    return currentBid + SMALL_INCREMENT;
  }

  return currentBid + BIG_INCREMENT;
}


function getRoomRef() {
  return ref(db, `rooms/${currentRoomCode}`);
}


function getAuctionRef() {
  return ref(db, `rooms/${currentRoomCode}/auction`);
}


function getTeamRef(uid) {
  return ref(db, `rooms/${currentRoomCode}/teams/${uid}`);
}


function getTeamsArray(room) {
  if (!room || !room.teams) {
    return [];
  }

  return Object.entries(room.teams).map(([uid, team]) => ({
    uid,
    ...team
  }));
}


function isMyTeam(uid) {
  return currentUser && uid === currentUser.uid;
}


// ============================================================
// AUTHENTICATION
// ============================================================

function startFirebaseAuth() {

  if (!auth) {
    showConnection("❌ Firebase not initialized");
    return;
  }

  showConnection("⏳ Connecting to Firebase...");

  onAuthStateChanged(auth, user => {

    if (user) {

      currentUser = user;

      showConnection("🟢 Connected to Firebase");

      console.log("Firebase user:", user.uid);

      autoJoinFromURL();

    } else {

      signInAnonymously(auth)
        .then(() => {
          console.log("Anonymous sign-in started");
        })
        .catch(error => {

          console.error("Anonymous authentication error:", error);

          showConnection(
            "❌ Authentication failed: " + error.message
          );

          alert(
            "Firebase Authentication failed.\n\n" +
            error.message
          );
        });

    }

  });

}


if (auth) {
  startFirebaseAuth();
}


// ============================================================
// URL ROOM HANDLING
// ============================================================

function autoJoinFromURL() {

  const params = new URLSearchParams(window.location.search);

  const room = params.get("room");

  if (!room) {
    return;
  }

  const roomCode = room.toUpperCase();

  const roomInput = $("joinRoomCode");

  if (roomInput) {
    roomInput.value = roomCode;
  }

  showJoinRoom();
}


// ============================================================
// HOME / SCREEN NAVIGATION
// ============================================================

function hideAllScreens() {

  const screens = [
    "homeScreen",
    "createRoomScreen",
    "joinRoomScreen",
    "lobbyScreen",
    "gameScreen"
  ];

  screens.forEach(id => {

    const element = $(id);

    if (element) {
      element.style.display = "none";
    }

  });

}


function showScreen(id) {

  hideAllScreens();

  const screen = $(id);

  if (screen) {
    screen.style.display = "block";
  }

}


function showCreateRoom() {
  showScreen("createRoomScreen");
}


function showJoinRoom() {
  showScreen("joinRoomScreen");
}


function goHome() {

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  currentRoomCode = null;
  currentRoom = null;

  showScreen("homeScreen");
}


function showLobby() {
  showScreen("lobbyScreen");
}


function showGame() {
  showScreen("gameScreen");
}


// ============================================================
// CREATE ROOM
// ============================================================

async function createRoom() {

  if (!currentUser) {
    alert("Firebase is still connecting. Please wait a moment.");
    return;
  }

  const input = $("createTeamName");

  const teamName = input
    ? input.value.trim()
    : "";

  if (!teamName) {
    alert("Enter your team name.");
    return;
  }

  const button = $("createRoomButton");

  if (button) {
    button.disabled = true;
    button.textContent = "CREATING...";
  }

  try {

    let roomCode = null;
    let roomExists = true;

    for (let attempt = 0; attempt < 10; attempt++) {

      const candidate = randomRoomCode();

      const snapshot = await get(
        ref(db, `rooms/${candidate}`)
      );

      if (!snapshot.exists()) {

        roomCode = candidate;
        roomExists = false;

        break;
      }
    }

    if (roomExists || !roomCode) {
      throw new Error("Could not generate a room code.");
    }

    currentRoomCode = roomCode;
    currentTeamName = teamName;

    const room = {

      hostUid: currentUser.uid,

      status: "LOBBY",

      createdAt: Date.now(),

      teams: {

        [currentUser.uid]: {

          name: teamName,

          budget: STARTING_BUDGET,

          players: [],

          joinedAt: Date.now()

        }

      },

      auction: null,

      history: []

    };

    await set(
      ref(db, `rooms/${roomCode}`),
      room
    );

    setRoomURL(roomCode);

    showLobby();

    listenToRoom();

    updateLobbyUI(room);

  } catch (error) {

    console.error("Create room error:", error);

    alert(
      "Could not create room.\n\n" +
      error.message
    );

  } finally {

    if (button) {
      button.disabled = false;
      button.textContent = "CREATE ROOM";
    }

  }

}


// ============================================================
// JOIN ROOM
// ============================================================

async function joinRoom() {

  if (!currentUser) {
    alert("Firebase is still connecting. Please wait.");
    return;
  }

  const codeInput = $("joinRoomCode");
  const nameInput = $("joinTeamName");

  const roomCode = codeInput
    ? codeInput.value.trim().toUpperCase()
    : "";

  const teamName = nameInput
    ? nameInput.value.trim()
    : "";

  if (!roomCode) {
    alert("Enter the room code.");
    return;
  }

  if (!teamName) {
    alert("Enter your team name.");
    return;
  }

  try {

    const roomRef = ref(db, `rooms/${roomCode}`);

    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
      alert("Room not found.");
      return;
    }

    const room = snapshot.val();

    if (room.status !== "LOBBY") {
      alert("This auction has already started.");
      return;
    }

    const teams = room.teams || {};

    const teamCount = Object.keys(teams).length;

    if (teamCount >= MAX_TEAMS) {

      if (!teams[currentUser.uid]) {
        alert("Room is full. Maximum 4 teams.");
        return;
      }

    }

    currentRoomCode = roomCode;
    currentTeamName = teamName;

    await update(
      ref(db, `rooms/${roomCode}/teams/${currentUser.uid}`),
      {
        name: teamName,
        budget: STARTING_BUDGET,
        players: [],
        joinedAt: Date.now()
      }
    );

    setRoomURL(roomCode);

    showLobby();

    listenToRoom();

  } catch (error) {

    console.error("Join room error:", error);

    alert(
      "Could not join room.\n\n" +
      error.message
    );

  }

}


// ============================================================
// ROOM URL
// ============================================================

function setRoomURL(roomCode) {

  const url =
    `${window.location.origin}${window.location.pathname}?room=${roomCode}`;

  const linkElement = $("roomLink");

  if (linkElement) {
    linkElement.textContent = url;
  }

  const codeElement = $("displayRoomCode");

  if (codeElement) {
    codeElement.textContent = roomCode;
  }

}


async function copyRoomLink() {

  const url =
    `${window.location.origin}${window.location.pathname}?room=${currentRoomCode}`;

  try {

    await navigator.clipboard.writeText(url);

    alert("Room link copied!");

  } catch {

    prompt(
      "Copy this room link:",
      url
    );

  }

}


// ============================================================
// ROOM LISTENER
// ============================================================

function listenToRoom() {

  if (!currentRoomCode) {
    return;
  }

  if (roomListener) {
    roomListener();
    roomListener = null;
  }

  if (auctionListener) {
    auctionListener();
    auctionListener = null;
  }

  const roomRef = getRoomRef();

  roomListener = onValue(
    roomRef,
    snapshot => {

      if (!snapshot.exists()) {

        alert("This room no longer exists.");

        goHome();

        return;
      }

      currentRoom = snapshot.val();

      updateLobbyUI(currentRoom);

      if (currentRoom.status === "PLAYING") {

        showGame();

        renderGame(currentRoom);

      } else if (currentRoom.status === "LOBBY") {

        showLobby();

      } else if (currentRoom.status === "FINISHED") {

        showGame();

        renderGame(currentRoom);

      }

    },

    error => {

      console.error("Room listener error:", error);

      showConnection(
        "❌ Database error: " + error.message
      );

    }
  );


  auctionListener = onValue(
    getAuctionRef(),
    snapshot => {

      const auction = snapshot.val();

      if (auction) {
        displayAuction(auction);
      }

    }
  );

}


// ============================================================
// LOBBY
// ============================================================

function updateLobbyUI(room) {

  if (!room) {
    return;
  }

  const codeElement = $("displayRoomCode");

  if (codeElement) {
    codeElement.textContent =
      currentRoomCode || "------";
  }

  const list = $("lobbyPlayers");

  if (!list) {
    return;
  }

  const teams = getTeamsArray(room);

  list.innerHTML = "";

  teams.forEach((team, index) => {

    const div = document.createElement("div");

    div.className = "player-card";

    const hostText =
      team.uid === room.hostUid
        ? " 👑 HOST"
        : "";

    div.innerHTML = `
      <strong>${index + 1}. ${escapeHtml(team.name)}</strong>
      <span>${hostText}</span>
    `;

    list.appendChild(div);

  });

  const startButton = $("startAuctionButton");

  if (startButton) {

    if (
      currentUser &&
      currentUser.uid === room.hostUid
    ) {

      startButton.style.display = "block";

      startButton.disabled =
        teams.length < 1;

    } else {

      startButton.style.display = "none";

    }

  }

}


// ============================================================
// START AUCTION
// ============================================================

async function startAuction() {

  if (!currentUser || !currentRoomCode) {
    return;
  }

  try {

    const snapshot = await get(getRoomRef());

    if (!snapshot.exists()) {
      return;
    }

    const room = snapshot.val();

    if (room.hostUid !== currentUser.uid) {

      alert("Only the room host can start the auction.");

      return;
    }

    if (room.status !== "LOBBY") {
      return;
    }

    const teams = getTeamsArray(room);

    if (teams.length < 1) {
      alert("At least one team is required.");
      return;
    }

    const order = shuffleArray(
      characters.map(character => character.id)
    );

    const firstCharacter = getCharacter(order[0]);

    const now = Date.now();

    await update(
      getRoomRef(),
      {

        status: "PLAYING",

        "auction": {

          status: "ACTIVE",

          characterIndex: 0,

          characterId: firstCharacter.id,

          currentBid: START_BID,

          highestBidder: null,

          highestBidderName: null,

          endTime: now + AUCTION_TIME * 1000,

          round: 1

        },

        characterOrder: order,

        history: []

      }
    );

  } catch (error) {

    console.error("Start auction error:", error);

    alert(
      "Could not start auction.\n\n" +
      error.message
    );

  }

}


// ============================================================
// DISPLAY GAME
// ============================================================

function renderGame(room) {

  if (!room) {
    return;
  }

  renderTeams(room);

  renderHistory(room);

  renderRanking(room);

  if (room.auction) {
    displayAuction(room.auction);
  }

}


// ============================================================
// TEAM DISPLAY
// ============================================================

function renderTeams(room) {

  const container =
    $("teamStats") ||
    $("teamsContainer");

  if (!container) {
    return;
  }

  const teams = getTeamsArray(room);

  container.innerHTML = "";

  teams.forEach(team => {

    const players = team.players || [];

    const card = document.createElement("div");

    card.className =
      "team-card" +
      (isMyTeam(team.uid) ? " my-team" : "");

    card.innerHTML = `

      <h3>
        ${escapeHtml(team.name)}
        ${isMyTeam(team.uid) ? " ⭐" : ""}
      </h3>

      <div>
        Budget:
        <strong>${formatMoney(team.budget || 0)}</strong>
      </div>

      <div>
        Characters:
        <strong>${players.length}/${MAX_CHARACTERS}</strong>
      </div>

      <div class="team-players">

        ${
          players.length
            ? players.map(p => `
                <div>
                  ${escapeHtml(p.name)}
                  —
                  ${formatMoney(p.price)}
                </div>
              `).join("")
            : "<div>No characters yet</div>"
        }

      </div>

    `;

    container.appendChild(card);

  });

}


// ============================================================
// AUCTION DISPLAY
// ============================================================

function displayAuction(auction) {

  if (!auction) {
    return;
  }

  const character =
    getCharacter(auction.characterId);

  if (!character) {
    return;
  }

  const nameElement =
    $("characterName") ||
    $("currentCharacter");

  if (nameElement) {
    nameElement.textContent = character.name;
  }

  const powerElement =
    $("characterPower");

  if (powerElement) {
    powerElement.textContent =
      `Power ${character.power}`;
  }

  const bidElement =
    $("currentBid");

  if (bidElement) {

    bidElement.textContent =
      formatMoney(auction.currentBid || START_BID);

  }

  const bidderElement =
    $("highestBidder");

  if (bidderElement) {

    bidderElement.textContent =
      auction.highestBidderName
        ? `Highest Bidder: ${auction.highestBidderName}`
        : "No bids yet";

  }

  const nextBidElement =
    $("nextBid");

  if (nextBidElement) {

    if (auction.highestBidder) {

      nextBidElement.textContent =
        `Next bid: ${formatMoney(getNextBid(auction.currentBid))}`;

    } else {

      nextBidElement.textContent =
        `Starting bid: ${formatMoney(START_BID)}`;

    }

  }

  updateBidButton(auction);

  updateTimer(auction);

}


// ============================================================
// BID BUTTON
// ============================================================

function updateBidButton(auction) {

  const button =
    $("bidButton") ||
    $("placeBidButton");

  if (!button) {
    return;
  }

  if (
    !currentUser ||
    !currentRoom ||
    auction.status !== "ACTIVE"
  ) {

    button.disabled = true;

    return;

  }

  const myTeam =
    currentRoom.teams &&
    currentRoom.teams[currentUser.uid];

  if (!myTeam) {

    button.disabled = true;

    return;

  }

  const players =
    myTeam.players || [];

  const budget =
    Number(myTeam.budget || 0);

  const nextBid =
    auction.highestBidder
      ? getNextBid(Number(auction.currentBid))
      : START_BID;

  if (players.length >= MAX_CHARACTERS) {

    button.disabled = true;

    button.textContent = "MAX 4 CHARACTERS";

    return;

  }

  if (budget < nextBid) {

    button.disabled = true;

    button.textContent = "NOT ENOUGH BUDGET";

    return;

  }

  button.disabled = false;

  button.textContent =
    `BID ${formatMoney(nextBid)}`;

}


// ============================================================
// PLACE BID
// ============================================================

async function placeBid() {

  if (!currentUser || !currentRoomCode) {
    return;
  }

  try {

    const roomSnapshot =
      await get(getRoomRef());

    if (!roomSnapshot.exists()) {
      return;
    }

    const room =
      roomSnapshot.val();

    const auction =
      room.auction;

    if (!auction || auction.status !== "ACTIVE") {
      return;
    }

    const team =
      room.teams &&
      room.teams[currentUser.uid];

    if (!team) {

      alert("You are not in this room.");

      return;

    }

    const players =
      team.players || [];

    if (players.length >= MAX_CHARACTERS) {

      alert("Your team already has 4 characters.");

      return;

    }

    const nextBid =
      auction.highestBidder
        ? getNextBid(Number(auction.currentBid))
        : START_BID;

    const budget =
      Number(team.budget || 0);

    if (budget < nextBid) {

      alert(
        `You need ${formatMoney(nextBid)} to bid.`
      );

      return;

    }

    const auctionRef =
      getAuctionRef();

    const result =
      await runTransaction(
        auctionRef,
        current => {

          if (!current) {
            return;
          }

          if (current.status !== "ACTIVE") {
            return;
          }

          if (
            current.endTime &&
            Date.now() >= current.endTime
          ) {
            return;
          }

          const currentBid =
            Number(current.currentBid || START_BID);

          const bid =
            current.highestBidder
              ? getNextBid(currentBid)
              : START_BID;

          return {

            ...current,

            currentBid: bid,

            highestBidder:
              currentUser.uid,

            highestBidderName:
              team.name,

            endTime:
              Date.now() + AUCTION_TIME * 1000

          };

        }
      );

    if (!result.committed) {
      return;
    }

  } catch (error) {

    console.error("Bid error:", error);

    alert(
      "Bid failed.\n\n" +
      error.message
    );

  }

}


// ============================================================
// TIMER
// ============================================================

function updateTimer(auction) {

  if (timerInterval) {
    clearInterval(timerInterval);
  }

  const timerElement =
    $("auctionTimer") ||
    $("timer");

  if (!timerElement) {
    return;
  }

  function tick() {

    if (!auction || auction.status !== "ACTIVE") {

      timerElement.textContent = "0";

      return;

    }

    const remaining =
      Math.max(
        0,
        Math.ceil(
          (Number(auction.endTime) - Date.now()) / 1000
        )
      );

    timerElement.textContent =
      `${remaining}s`;

    if (remaining <= 0) {

      clearInterval(timerInterval);

      timerInterval = null;

      finishAuction();

    }

  }

  tick();

  timerInterval =
    setInterval(tick, 250);

}


// ============================================================
// FINISH AUCTION
// ============================================================
//
// A transaction changes ACTIVE -> FINALIZING.
// Only the client that successfully changes the state
// continues the sale/skip process.
// ============================================================

async function finishAuction() {

  if (
    finishingAuction ||
    !currentRoomCode
  ) {
    return;
  }

  finishingAuction = true;

  try {

    const auctionRef =
      getAuctionRef();

    const claim =
      await runTransaction(
        auctionRef,
        current => {

          if (!current) {
            return;
          }

          if (current.status !== "ACTIVE") {
            return;
          }

          if (
            current.endTime &&
            Date.now() < Number(current.endTime)
          ) {
            return;
          }

          return {

            ...current,

            status: "FINALIZING"

          };

        }
      );

    if (!claim.committed) {

      finishingAuction = false;

      return;

    }

    const auction =
      claim.snapshot.val();

    const character =
      getCharacter(auction.characterId);

    if (!character) {
      finishingAuction = false;
      return;
    }

    // --------------------------------------------------------
    // NO BID = SKIP
    // --------------------------------------------------------

    if (!auction.highestBidder) {

      await addHistory({

        type: "SKIP",

        character: character.name,

        characterId: character.id,

        price: 0,

        teamName: "No Bid",

        timestamp: Date.now()

      });

    }

    // --------------------------------------------------------
    // SOLD
    // --------------------------------------------------------

    else {

      const winnerUid =
        auction.highestBidder;

      const winnerRef =
        getTeamRef(winnerUid);

      const winnerResult =
        await runTransaction(
          winnerRef,
          team => {

            if (!team) {
              return;
            }

            const players =
              team.players || [];

            if (players.length >= MAX_CHARACTERS) {
              return;
            }

            const budget =
              Number(team.budget || 0);

            const price =
              Number(auction.currentBid || START_BID);

            if (budget < price) {
              return;
            }

            return {

              ...team,

              budget:
                budget - price,

              players: [

                ...players,

                {

                  id: character.id,

                  name: character.name,

                  price,

                  power: character.power,

                  attack: character.attack,

                  defense: character.defense,

                  speed: character.speed,

                  hax: character.hax,

                  intelligence: character.intelligence,

                  synergy: character.synergy,

                  purchasedAt: Date.now()

                }

              ]

            };

          }
        );

      if (winnerResult.committed) {

        await addHistory({

          type: "SOLD",

          character: character.name,

          characterId: character.id,

          price: Number(auction.currentBid),

          teamName:
            auction.highestBidderName,

          teamUid:
            auction.highestBidder,

          timestamp: Date.now()

        });

      }

    }

    // --------------------------------------------------------
    // NEXT CHARACTER
    // --------------------------------------------------------

    await advanceAuction(auction);

  } catch (error) {

    console.error(
      "Finish auction error:",
      error
    );

  } finally {

    finishingAuction = false;

  }

}


// ============================================================
// ADD HISTORY
// ============================================================

async function addHistory(entry) {

  const historyRef =
    ref(db, `rooms/${currentRoomCode}/history`);

  await runTransaction(
    historyRef,
    history => {

      const list =
        Array.isArray(history)
          ? history
          : [];

      return [
        ...list,
        entry
      ];

    }
  );

}


// ============================================================
// NEXT CHARACTER
// ============================================================

async function advanceAuction(previousAuction) {

  const roomSnapshot =
    await get(getRoomRef());

  if (!roomSnapshot.exists()) {
    return;
  }

  const room =
    roomSnapshot.val();

  const order =
    room.characterOrder || [];

  const oldIndex =
    Number(previousAuction.characterIndex || 0);

  const nextIndex =
    oldIndex + 1;

  // No more characters
  if (
    nextIndex >= order.length
  ) {

    await update(
      getRoomRef(),
      {

        status: "FINISHED",

        auction: {

          ...previousAuction,

          status: "FINISHED"

        }

      }
    );

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    return;
  }

  const nextId =
    order[nextIndex];

  const nextCharacter =
    getCharacter(nextId);

  if (!nextCharacter) {
    return;
  }

  await new Promise(
    resolve =>
      setTimeout(
        resolve,
        STARTER_CHARACTER_DELAY
      )
  );

  await update(
    getRoomRef(),
    {

      auction: {

        status: "ACTIVE",

        characterIndex: nextIndex,

        characterId: nextId,

        currentBid: START_BID,

        highestBidder: null,

        highestBidderName: null,

        endTime:
          Date.now() +
          AUCTION_TIME * 1000,

        round: nextIndex + 1

      }

    }
  );

}


// ============================================================
// HISTORY DISPLAY
// ============================================================

function renderHistory(room) {

  const container =
    $("auctionHistory") ||
    $("history");

  if (!container) {
    return;
  }

  const history =
    room.history || [];

  if (!history.length) {

    container.innerHTML =
      "<div>No auction history yet.</div>";

    return;

  }

  container.innerHTML =
    [...history]
      .reverse()
      .map(item => {

        if (item.type === "SKIP") {

          return `
            <div class="history-item">
              ⏭️
              <strong>
                ${escapeHtml(item.character)}
              </strong>
              — No bids
            </div>
          `;

        }

        return `
          <div class="history-item">
            🔥
            <strong>
              ${escapeHtml(item.character)}
            </strong>

            —

            ${escapeHtml(item.teamName)}

            —

            <strong>
              ${formatMoney(item.price)}
            </strong>
          </div>
        `;

      })
      .join("");

}


// ============================================================
// TEAM POWER RANKING
// ============================================================

function calculateTeamPower(team) {

  const players =
    team.players || [];

  if (!players.length) {
    return 0;
  }

  let total = 0;

  players.forEach(player => {

    const base =
      Number(player.power || 0);

    const attack =
      Number(player.attack || 0);

    const defense =
      Number(player.defense || 0);

    const speed =
      Number(player.speed || 0);

    const hax =
      Number(player.hax || 0);

    const intelligence =
      Number(player.intelligence || 0);

    const synergy =
      Number(player.synergy || 0);

    const characterScore =
      (
        base * 0.30 +
        attack * 0.12 +
        defense * 0.12 +
        speed * 0.12 +
        hax * 0.14 +
        intelligence * 0.10 +
        synergy * 0.10
      );

    total += characterScore;

  });

  // Small team-completeness bonus
  const sizeBonus =
    players.length * 2;

  return Math.round(
    total + sizeBonus
  );

}


function renderRanking(room) {

  const container =
    $("teamRanking") ||
    $("powerRanking");

  if (!container) {
    return;
  }

  const teams =
    getTeamsArray(room)
      .map(team => ({

        ...team,

        power:
          calculateTeamPower(team)

      }));

  teams.sort(
    (a, b) =>
      b.power - a.power
  );

  if (!teams.length) {

    container.innerHTML =
      "<div>No teams yet.</div>";

    return;

  }

  container.innerHTML =
    teams.map((team, index) => {

      return `

        <div class="ranking-item">

          <strong>
            #${index + 1}
            ${escapeHtml(team.name)}
          </strong>

          <span>
            Power: ${team.power}
          </span>

        </div>

      `;

    }).join("");

}


// ============================================================
// START NEW GAME
// ============================================================

async function restartGame() {

  if (!currentUser || !currentRoomCode) {
    return;
  }

  try {

    const snapshot =
      await get(getRoomRef());

    if (!snapshot.exists()) {
      return;
    }

    const room =
      snapshot.val();

    if (
      room.hostUid !== currentUser.uid
    ) {

      alert(
        "Only the room host can start a new game."
      );

      return;

    }

    const teams =
      room.teams || {};

    const resetTeams = {};

    Object.entries(teams)
      .forEach(([uid, team]) => {

        resetTeams[uid] = {

          ...team,

          budget:
            STARTING_BUDGET,

          players: [],

          joinedAt:
            team.joinedAt || Date.now()

        };

      });

    const order =
      shuffleArray(
        characters.map(
          character => character.id
        )
      );

    const firstCharacter =
      getCharacter(order[0]);

    await update(
      getRoomRef(),
      {

        status: "PLAYING",

        teams: resetTeams,

        characterOrder: order,

        history: [],

        auction: {

          status: "ACTIVE",

          characterIndex: 0,

          characterId:
            firstCharacter.id,

          currentBid: START_BID,

          highestBidder: null,

          highestBidderName: null,

          endTime:
            Date.now() +
            AUCTION_TIME * 1000,

          round: 1

        }

      }
    );

  } catch (error) {

    console.error(
      "Restart game error:",
      error
    );

    alert(
      "Could not start new game.\n\n" +
      error.message
    );

  }

}


// ============================================================
// LEAVE ROOM
// ============================================================

async function leaveRoom() {

  if (!currentRoomCode || !currentUser) {
    goHome();
    return;
  }

  const confirmLeave =
    confirm("Leave this room?");

  if (!confirmLeave) {
    return;
  }

  try {

    const snapshot =
      await get(getRoomRef());

    if (snapshot.exists()) {

      const room =
        snapshot.val();

      const teams =
        room.teams || {};

      const teamIds =
        Object.keys(teams);

      if (
        room.hostUid === currentUser.uid &&
        teamIds.length > 1
      ) {

        const nextHost =
          teamIds.find(
            id =>
              id !== currentUser.uid
          );

        await update(
          getRoomRef(),
          {
            hostUid: nextHost
          }
        );

      }

    }

    await remove(
      getTeamRef(currentUser.uid)
    );

  } catch (error) {

    console.error(
      "Leave room error:",
      error
    );

  }

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  currentRoomCode = null;
  currentRoom = null;
  currentTeamName = "";

  window.history.replaceState(
    {},
    document.title,
    window.location.pathname
  );

  goHome();

}


// ============================================================
// EXPOSE FUNCTIONS TO HTML
// ============================================================

window.showCreateRoom = showCreateRoom;
window.showJoinRoom = showJoinRoom;
window.goHome = goHome;

window.createRoom = createRoom;
window.joinRoom = joinRoom;

window.copyRoomLink = copyRoomLink;

window.startAuction = startAuction;
window.placeBid = placeBid;

window.restartGame = restartGame;
window.leaveRoom = leaveRoom;


// ============================================================
// INITIAL UI
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    hideAllScreens();

    const params =
      new URLSearchParams(
        window.location.search
      );

    if (params.get("room")) {

      showJoinRoom();

    } else {

      showScreen("homeScreen");

    }

  }
);
