// ============================================================
// NARUTO SHINOBI AUCTION - MULTIPLAYER
// ============================================================

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
  onValue,
  runTransaction
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
// FIREBASE
// ============================================================

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let currentUser = null;
let currentRoomCode = null;
let currentRoom = null;

let roomListener = null;
let auctionListener = null;
let timerInterval = null;
let finishingAuction = false;

let authReadyResolve;

const authReady = new Promise(resolve => {
  authReadyResolve = resolve;
});


// ============================================================
// GAME SETTINGS
// ============================================================

const STARTING_BUDGET = 2000;
const MAX_TEAMS = 4;
const MAX_CHARACTERS = 4;

const AUCTION_TIME = 10;

const START_BID = 100;
const SMALL_INCREMENT = 50;
const BIG_INCREMENT = 100;


// ============================================================
// CHARACTERS
// ============================================================

const characters = [

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
// BASIC HELPERS
// ============================================================

function $(id) {
  return document.getElementById(id);
}


function showConnection(message) {

  const element = $("connectionStatus");

  if (element) {
    element.textContent = message;
  }

}


function formatMoney(lakhs) {

  lakhs = Number(lakhs || 0);

  if (lakhs >= 100) {

    const crores = lakhs / 100;

    return Number.isInteger(crores)
      ? `₹${crores} Cr`
      : `₹${crores.toFixed(2)} Cr`;
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

  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let result = "";

  for (let i = 0; i < 6; i++) {

    result +=
      chars[Math.floor(Math.random() * chars.length)];

  }

  return result;

}


function shuffle(array) {

  const result = [...array];

  for (
    let i = result.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(Math.random() * (i + 1));

    [
      result[i],
      result[j]
    ] =
    [
      result[j],
      result[i]
    ];

  }

  return result;

}


function getCharacter(id) {

  return characters.find(
    character => character.id === id
  );

}


function getNextBid(currentBid) {

  currentBid = Number(currentBid || 0);

  if (currentBid < START_BID) {
    return START_BID;
  }

  if (currentBid < 1000) {
    return currentBid + SMALL_INCREMENT;
  }

  return currentBid + BIG_INCREMENT;

}


// ============================================================
// AUTHENTICATION
// ============================================================

onAuthStateChanged(auth, user => {

  if (user) {

    currentUser = user;

    console.log(
      "Firebase authentication ready:",
      user.uid
    );

    showConnection(
      "🟢 Connected to Firebase"
    );

    authReadyResolve(user);

    checkRoomURL();

  } else {

    showConnection(
      "⏳ Signing in..."
    );

    signInAnonymously(auth)
      .catch(error => {

        console.error(
          "Anonymous sign-in failed:",
          error
        );

        showConnection(
          "❌ Firebase authentication failed"
        );

        alert(
          "Firebase authentication failed:\n\n" +
          error.message
        );

      });

  }

});


// ============================================================
// WAIT FOR AUTH
// ============================================================

async function waitForAuth() {

  if (currentUser) {
    return currentUser;
  }

  showConnection(
    "⏳ Connecting to Firebase..."
  );

  return await authReady;

}


// ============================================================
// URL ROOM
// ============================================================

function checkRoomURL() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const room =
    params.get("room");

  if (!room) {
    return;
  }

  const input =
    $("joinRoomCode");

  if (input) {

    input.value =
      room.trim().toUpperCase();

  }

  showJoinRoom();

}


// ============================================================
// SCREENS
// ============================================================

function hideScreens() {

  [
    "homeScreen",
    "createRoomScreen",
    "joinRoomScreen",
    "lobbyScreen",
    "gameScreen"
  ].forEach(id => {

    const element = $(id);

    if (element) {
      element.style.display = "none";
    }

  });

}


function showScreen(id) {

  hideScreens();

  const element = $(id);

  if (!element) {

    console.error(
      "Screen not found:",
      id
    );

    return;

  }

  element.style.display = "block";

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

  showScreen("homeScreen");

}


// ============================================================
// ROOM REFERENCES
// ============================================================

function roomRef(code = currentRoomCode) {

  return ref(
    db,
    `rooms/${code}`
  );

}


function teamRef(
  uid,
  code = currentRoomCode
) {

  return ref(
    db,
    `rooms/${code}/teams/${uid}`
  );

}


function auctionRef(
  code = currentRoomCode
) {

  return ref(
    db,
    `rooms/${code}/auction`
  );

}


// ============================================================
// CREATE ROOM
// ============================================================

async function createRoom() {

  try {

    const user =
      await waitForAuth();

    const input =
      $("createTeamName");

    const teamName =
      input
        ? input.value.trim()
        : "";

    if (!teamName) {

      alert(
        "Please enter your team name."
      );

      return;

    }

    const button =
      $("createRoomButton");

    if (button) {

      button.disabled = true;
      button.textContent = "CREATING...";

    }

    let code = null;

    for (let i = 0; i < 10; i++) {

      const candidate =
        randomRoomCode();

      const existing =
        await get(
          roomRef(candidate)
        );

      if (!existing.exists()) {

        code = candidate;

        break;

      }

    }

    if (!code) {

      throw new Error(
        "Could not create a unique room."
      );

    }

    const room = {

      hostUid: user.uid,

      status: "LOBBY",

      createdAt: Date.now(),

      teams: {

        [user.uid]: {

          name: teamName,

          budget: STARTING_BUDGET,

          players: [],

          joinedAt: Date.now()

        }

      },

      auction: null,

      characterOrder: [],

      history: []

    };

    await set(
      roomRef(code),
      room
    );

    currentRoomCode = code;
    currentRoom = room;

    updateRoomURL(code);

    showLobby();

    listenToRoom();

  } catch (error) {

    console.error(
      "CREATE ROOM ERROR:",
      error
    );

    alert(
      "Could not create room:\n\n" +
      error.message
    );

  } finally {

    const button =
      $("createRoomButton");

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

  try {

    // IMPORTANT:
    // Wait for Firebase authentication first.
    const user =
      await waitForAuth();

    const codeInput =
      $("joinRoomCode");

    const nameInput =
      $("joinTeamName");

    const code =
      codeInput
        ? codeInput.value.trim().toUpperCase()
        : "";

    const teamName =
      nameInput
        ? nameInput.value.trim()
        : "";

    if (!code) {

      alert(
        "Enter the room code."
      );

      return;

    }

    if (code.length !== 6) {

      alert(
        "Room code must contain 6 characters."
      );

      return;

    }

    if (!teamName) {

      alert(
        "Enter your team name."
      );

      return;

    }

    const button =
      document.querySelector(
        '#joinRoomScreen button[onclick="joinRoom()"]'
      );

    if (button) {

      button.disabled = true;
      button.textContent = "JOINING...";

    }

    console.log(
      "Trying to join room:",
      code
    );

    const snapshot =
      await get(
        roomRef(code)
      );

    if (!snapshot.exists()) {

      throw new Error(
        "Room not found. Check the room code."
      );

    }

    const room =
      snapshot.val();

    console.log(
      "Room found:",
      room
    );

    // Allow joining only before auction starts.
    if (
      room.status !== "LOBBY"
    ) {

      throw new Error(
        "This auction has already started. Join before the host starts the auction."
      );

    }

    const teams =
      room.teams || {};

    const teamIds =
      Object.keys(teams);

    // If this user is already inside,
    // update their name instead of creating another team.
    if (
      !teams[user.uid] &&
      teamIds.length >= MAX_TEAMS
    ) {

      throw new Error(
        "This room already has 4 players."
      );

    }

    await set(
      teamRef(user.uid, code),
      {

        name: teamName,

        budget: teams[user.uid]
          ? Number(
              teams[user.uid].budget ??
              STARTING_BUDGET
            )
          : STARTING_BUDGET,

        players: teams[user.uid]
          ? teams[user.uid].players || []
          : [],

        joinedAt:
          teams[user.uid]?.joinedAt ||
          Date.now()

      }
    );

    currentRoomCode = code;

    updateRoomURL(code);

    showLobby();

    listenToRoom();

    console.log(
      "Successfully joined:",
      code
    );

  } catch (error) {

    console.error(
      "JOIN ROOM ERROR:",
      error
    );

    alert(
      "Could not join room:\n\n" +
      error.message
    );

  } finally {

    const button =
      document.querySelector(
        '#joinRoomScreen button[onclick="joinRoom()"]'
      );

    if (button) {

      button.disabled = false;
      button.textContent = "JOIN ROOM";

    }

  }

}


// ============================================================
// ROOM URL
// ============================================================

function updateRoomURL(code) {

  const url =
    `${window.location.origin}${window.location.pathname}?room=${code}`;

  const display =
    $("displayRoomCode");

  if (display) {
    display.textContent = code;
  }

  const link =
    $("roomLink");

  if (link) {
    link.textContent = url;
  }

  window.history.replaceState(
    {},
    document.title,
    `?room=${code}`
  );

}


async function copyRoomLink() {

  if (!currentRoomCode) {
    return;
  }

  const url =
    `${window.location.origin}${window.location.pathname}?room=${currentRoomCode}`;

  try {

    await navigator.clipboard.writeText(url);

    alert(
      "Room link copied!"
    );

  } catch {

    prompt(
      "Copy this room link:",
      url
    );

  }

}


// ============================================================
// SHOW LOBBY
// ============================================================

function showLobby() {

  showScreen("lobbyScreen");

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
  }

  if (auctionListener) {
    auctionListener();
  }

  roomListener =
    onValue(
      roomRef(),
      snapshot => {

        if (!snapshot.exists()) {

          alert(
            "This room was deleted."
          );

          currentRoomCode = null;

          goHome();

          return;

        }

        currentRoom =
          snapshot.val();

        renderRoom(currentRoom);

      },

      error => {

        console.error(
          "Room listener error:",
          error
        );

        alert(
          "Database connection error:\n\n" +
          error.message
        );

      }
    );


  auctionListener =
    onValue(
      auctionRef(),
      snapshot => {

        if (!snapshot.exists()) {
          return;
        }

        displayAuction(
          snapshot.val()
        );

      }
    );

}


// ============================================================
// RENDER ROOM
// ============================================================

function renderRoom(room) {

  renderLobby(room);

  if (
    room.status === "PLAYING" ||
    room.status === "FINISHED"
  ) {

    showScreen("gameScreen");

    renderTeams(room);
    renderHistory(room);
    renderRanking(room);

  }

}


// ============================================================
// LOBBY
// ============================================================

function renderLobby(room) {

  if (
    room.status !== "LOBBY"
  ) {
    return;
  }

  showLobby();

  const display =
    $("displayRoomCode");

  if (display) {

    display.textContent =
      currentRoomCode;

  }

  const players =
    $("lobbyPlayers");

  if (!players) {
    return;
  }

  players.innerHTML = "";

  const teams =
    room.teams || {};

  Object.entries(teams)
    .forEach(
      ([uid, team], index) => {

        const div =
          document.createElement("div");

        div.className =
          "player-card";

        const host =
          uid === room.hostUid
            ? " 👑 HOST"
            : "";

        div.innerHTML = `
          <strong>
            ${index + 1}.
            ${escapeHtml(team.name)}
          </strong>

          <span>
            ${host}
          </span>
        `;

        players.appendChild(div);

      }
    );


  const startButton =
    $("startAuctionButton");

  if (startButton) {

    if (
      currentUser &&
      currentUser.uid === room.hostUid
    ) {

      startButton.style.display =
        "block";

    } else {

      startButton.style.display =
        "none";

    }

  }

}


// ============================================================
// START AUCTION
// ============================================================

async function startAuction() {

  try {

    const user =
      await waitForAuth();

    const snapshot =
      await get(
        roomRef()
      );

    if (!snapshot.exists()) {
      return;
    }

    const room =
      snapshot.val();

    if (
      room.hostUid !== user.uid
    ) {

      alert(
        "Only the host can start the auction."
      );

      return;

    }

    if (
      room.status !== "LOBBY"
    ) {
      return;
    }

    const teamCount =
      Object.keys(
        room.teams || {}
      ).length;

    if (teamCount < 1) {
      return;
    }

    const order =
      shuffle(
        characters.map(
          character => character.id
        )
      );

    const first =
      getCharacter(order[0]);

    await update(
      roomRef(),
      {

        status: "PLAYING",

        characterOrder: order,

        history: [],

        auction: {

          status: "ACTIVE",

          characterIndex: 0,

          characterId: first.id,

          currentBid: START_BID,

          highestBidder: null,

          highestBidderName: null,

          endTime:
            Date.now() +
            AUCTION_TIME * 1000

        }

      }
    );

  } catch (error) {

    console.error(
      "Start error:",
      error
    );

    alert(
      error.message
    );

  }

}


// ============================================================
// DISPLAY AUCTION
// ============================================================

function displayAuction(auction) {

  if (!auction) {
    return;
  }

  const character =
    getCharacter(
      auction.characterId
    );

  if (!character) {
    return;
  }

  const name =
    $("characterName");

  if (name) {
    name.textContent =
      character.name;
  }

  const power =
    $("characterPower");

  if (power) {

    power.textContent =
      `Power ${character.power}`;

  }

  const bid =
    $("currentBid");

  if (bid) {

    bid.textContent =
      formatMoney(
        auction.currentBid
      );

  }

  const bidder =
    $("highestBidder");

  if (bidder) {

    bidder.textContent =
      auction.highestBidderName
        ? `Highest Bidder: ${auction.highestBidderName}`
        : "No bids yet";

  }

  const next =
    $("nextBid");

  if (next) {

    const nextAmount =
      auction.highestBidder
        ? getNextBid(
            auction.currentBid
          )
        : START_BID;

    next.textContent =
      `Next bid: ${formatMoney(nextAmount)}`;

  }

  updateBidButton(auction);

  startTimer(auction);

}


// ============================================================
// BID BUTTON
// ============================================================

function updateBidButton(auction) {

  const button =
    $("bidButton");

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

  const team =
    currentRoom.teams &&
    currentRoom.teams[currentUser.uid];

  if (!team) {

    button.disabled = true;

    button.textContent =
      "NOT IN ROOM";

    return;

  }

  const players =
    team.players || [];

  if (
    players.length >= MAX_CHARACTERS
  ) {

    button.disabled = true;

    button.textContent =
      "MAX 4 CHARACTERS";

    return;

  }

  const nextBid =
    auction.highestBidder
      ? getNextBid(
          auction.currentBid
        )
      : START_BID;

  if (
    Number(team.budget || 0) <
    nextBid
  ) {

    button.disabled = true;

    button.textContent =
      "NOT ENOUGH BUDGET";

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

  try {

    const user =
      await waitForAuth();

    if (!currentRoomCode) {
      return;
    }

    const roomSnapshot =
      await get(
        roomRef()
      );

    if (!roomSnapshot.exists()) {
      return;
    }

    const room =
      roomSnapshot.val();

    const auction =
      room.auction;

    if (
      !auction ||
      auction.status !== "ACTIVE"
    ) {
      return;
    }

    const team =
      room.teams &&
      room.teams[user.uid];

    if (!team) {

      alert(
        "You are not part of this room."
      );

      return;

    }

    const players =
      team.players || [];

    if (
      players.length >= MAX_CHARACTERS
    ) {
      return;
    }

    const nextBid =
      auction.highestBidder
        ? getNextBid(
            auction.currentBid
          )
        : START_BID;

    if (
      Number(team.budget || 0) <
      nextBid
    ) {

      alert(
        "Not enough budget."
      );

      return;

    }

    const result =
      await runTransaction(
        auctionRef(),
        current => {

          if (!current) {
            return;
          }

          if (
            current.status !==
            "ACTIVE"
          ) {
            return;
          }

          if (
            Date.now() >=
            Number(current.endTime)
          ) {
            return;
          }

          const bid =
            current.highestBidder
              ? getNextBid(
                  current.currentBid
                )
              : START_BID;

          return {

            ...current,

            currentBid: bid,

            highestBidder:
              user.uid,

            highestBidderName:
              team.name,

            endTime:
              Date.now() +
              AUCTION_TIME * 1000

          };

        }
      );

    console.log(
      "Bid result:",
      result.committed
    );

  } catch (error) {

    console.error(
      "Bid error:",
      error
    );

    alert(
      "Bid failed:\n\n" +
      error.message
    );

  }

}


// ============================================================
// TIMER
// ============================================================

function startTimer(auction) {

  if (timerInterval) {

    clearInterval(
      timerInterval
    );

  }

  const timer =
    $("auctionTimer");

  if (!timer) {
    return;
  }

  function updateTimer() {

    const remaining =
      Math.max(
        0,
        Math.ceil(
          (
            Number(auction.endTime) -
            Date.now()
          ) / 1000
        )
      );

    timer.textContent =
      `${remaining}s`;

    if (remaining <= 0) {

      clearInterval(
        timerInterval
      );

      timerInterval = null;

      finishAuction();

    }

  }

  updateTimer();

  timerInterval =
    setInterval(
      updateTimer,
      250
    );

}


// ============================================================
// FINISH AUCTION
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

    const result =
      await runTransaction(
        auctionRef(),
        auction => {

          if (!auction) {
            return;
          }

          if (
            auction.status !==
            "ACTIVE"
          ) {
            return;
          }

          if (
            Date.now() <
            Number(auction.endTime)
          ) {
            return;
          }

          return {
            ...auction,
            status: "FINALIZING"
          };

        }
      );

    if (!result.committed) {
      return;
    }

    const auction =
      result.snapshot.val();

    const character =
      getCharacter(
        auction.characterId
      );

    if (!character) {
      return;
    }

    // No bidder
    if (
      !auction.highestBidder
    ) {

      await addHistory({

        type: "SKIP",

        character:
          character.name,

        price: 0,

        teamName:
          "No Bid",

        timestamp:
          Date.now()

      });

    }

    // Winner
    else {

      const winner =
        auction.highestBidder;

      const winnerResult =
        await runTransaction(
          teamRef(winner),
          team => {

            if (!team) {
              return;
            }

            const players =
              team.players || [];

            const price =
              Number(
                auction.currentBid
              );

            const budget =
              Number(
                team.budget || 0
              );

            if (
              players.length >=
              MAX_CHARACTERS
            ) {
              return;
            }

            if (
              budget < price
            ) {
              return;
            }

            return {

              ...team,

              budget:
                budget - price,

              players: [

                ...players,

                {

                  id:
                    character.id,

                  name:
                    character.name,

                  price:

                    price,

                  power:
                    character.power,

                  attack:
                    character.attack,

                  defense:
                    character.defense,

                  speed:
                    character.speed,

                  hax:
                    character.hax,

                  intelligence:
                    character.intelligence,

                  synergy:
                    character.synergy

                }

              ]

            };

          }
        );

      if (winnerResult.committed) {

        await addHistory({

          type: "SOLD",

          character:
            character.name,

          price:
            Number(
              auction.currentBid
            ),

          teamName:
            auction.highestBidderName,

          timestamp:
            Date.now()

        });

      }

    }

    await nextCharacter(
      auction
    );

  } catch (error) {

    console.error(
      "Finish error:",
      error
    );

  } finally {

    finishingAuction = false;

  }

}


// ============================================================
// HISTORY
// ============================================================

async function addHistory(item) {

  await runTransaction(
    ref(
      db,
      `rooms/${currentRoomCode}/history`
    ),
    history => {

      const list =
        Array.isArray(history)
          ? history
          : [];

      return [
        ...list,
        item
      ];

    }
  );

}


// ============================================================
// NEXT CHARACTER
// ============================================================

async function nextCharacter(
  previous
) {

  const snapshot =
    await get(
      roomRef()
    );

  if (!snapshot.exists()) {
    return;
  }

  const room =
    snapshot.val();

  const order =
    room.characterOrder || [];

  const currentIndex =
    Number(
      previous.characterIndex || 0
    );

  const nextIndex =
    currentIndex + 1;

  if (
    nextIndex >=
    order.length
  ) {

    await update(
      roomRef(),
      {

        status:
          "FINISHED",

        auction: {
          ...previous,
          status:
            "FINISHED"
        }

      }
    );

    return;

  }

  const nextId =
    order[nextIndex];

  const next =
    getCharacter(nextId);

  if (!next) {
    return;
  }

  await update(
    roomRef(),
    {

      auction: {

        status:
          "ACTIVE",

        characterIndex:
          nextIndex,

        characterId:
          next.id,

        currentBid:
          START_BID,

        highestBidder:
          null,

        highestBidderName:
          null,

        endTime:
          Date.now() +
          AUCTION_TIME * 1000

      }

    }
  );

}


// ============================================================
// TEAMS
// ============================================================

function renderTeams(room) {

  const container =
    $("teamStats");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const teams =
    room.teams || {};

  Object.entries(teams)
    .forEach(
      ([uid, team]) => {

        const players =
          team.players || [];

        const card =
          document.createElement("div");

        card.className =
          "team-card" +
          (
            currentUser &&
            uid === currentUser.uid
              ? " my-team"
              : ""
          );

        card.innerHTML = `

          <h3>
            ${escapeHtml(team.name)}
            ${
              currentUser &&
              uid === currentUser.uid
                ? " ⭐"
                : ""
            }
          </h3>

          <div>
            Budget:
            <strong>
              ${formatMoney(team.budget)}
            </strong>
          </div>

          <div>
            Characters:
            <strong>
              ${players.length}/4
            </strong>
          </div>

          <div class="team-players">

            ${
              players.length
                ? players.map(player => `
                    <div>
                      ${escapeHtml(player.name)}
                      —
                      ${formatMoney(player.price)}
                    </div>
                  `).join("")
                : "<div>No characters</div>"
            }

          </div>

        `;

        container.appendChild(card);

      }
    );

}


// ============================================================
// HISTORY DISPLAY
// ============================================================

function renderHistory(room) {

  const container =
    $("auctionHistory");

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

        if (
          item.type === "SKIP"
        ) {

          return `
            <div class="history-item">
              ⏭️
              ${escapeHtml(item.character)}
              — No bids
            </div>
          `;

        }

        return `
          <div class="history-item">
            🔥
            ${escapeHtml(item.character)}
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
// POWER RANKING
// ============================================================

function teamPower(team) {

  const players =
    team.players || [];

  if (!players.length) {
    return 0;
  }

  let total = 0;

  players.forEach(player => {

    total +=
      Number(player.power || 0) * 0.30;

    total +=
      Number(player.attack || 0) * 0.12;

    total +=
      Number(player.defense || 0) * 0.12;

    total +=
      Number(player.speed || 0) * 0.12;

    total +=
      Number(player.hax || 0) * 0.14;

    total +=
      Number(player.intelligence || 0) * 0.10;

    total +=
      Number(player.synergy || 0) * 0.10;

  });

  return Math.round(total);

}


function renderRanking(room) {

  const container =
    $("teamRanking");

  if (!container) {
    return;
  }

  const teams =
    Object.entries(
      room.teams || {}
    )
      .map(
        ([uid, team]) => ({

          uid,
          ...team,

          power:
            teamPower(team)

        })
      )
      .sort(
        (a, b) =>
          b.power - a.power
      );

  container.innerHTML =
    teams.map(
      (team, index) => `

        <div class="ranking-item">

          <strong>
            #${index + 1}
            ${escapeHtml(team.name)}
          </strong>

          <span>
            Power ${team.power}
          </span>

        </div>

      `
    ).join("");

}


// ============================================================
// RESTART GAME
// ============================================================

async function restartGame() {

  try {

    const user =
      await waitForAuth();

    const snapshot =
      await get(
        roomRef()
      );

    if (!snapshot.exists()) {
      return;
    }

    const room =
      snapshot.val();

    if (
      room.hostUid !== user.uid
    ) {

      alert(
        "Only the host can start a new game."
      );

      return;

    }

    const resetTeams = {};

    Object.entries(
      room.teams || {}
    ).forEach(
      ([uid, team]) => {

        resetTeams[uid] = {

          ...team,

          budget:
            STARTING_BUDGET,

          players: []

        };

      }
    );

    const order =
      shuffle(
        characters.map(
          character => character.id
        )
      );

    const first =
      getCharacter(order[0]);

    await update(
      roomRef(),
      {

        status:
          "PLAYING",

        teams:
          resetTeams,

        characterOrder:
          order,

        history: [],

        auction: {

          status:
            "ACTIVE",

          characterIndex:
            0,

          characterId:
            first.id,

          currentBid:
            START_BID,

          highestBidder:
            null,

          highestBidderName:
            null,

          endTime:
            Date.now() +
            AUCTION_TIME * 1000

        }

      }
    );

  } catch (error) {

    console.error(
      "Restart error:",
      error
    );

    alert(
      error.message
    );

  }

}


// ============================================================
// LEAVE ROOM
// ============================================================

async function leaveRoom() {

  if (!currentUser || !currentRoomCode) {

    goHome();

    return;

  }

  if (
    !confirm(
      "Leave this room?"
    )
  ) {
    return;
  }

  try {

    const snapshot =
      await get(
        roomRef()
      );

    if (snapshot.exists()) {

      const room =
        snapshot.val();

      if (
        room.hostUid ===
        currentUser.uid
      ) {

        const ids =
          Object.keys(
            room.teams || {}
          )
            .filter(
              id =>
                id !==
                currentUser.uid
            );

        if (ids.length) {

          await update(
            roomRef(),
            {
              hostUid:
                ids[0]
            }
          );

        }

      }

    }

    await remove(
      teamRef(
        currentUser.uid
      )
    );

  } catch (error) {

    console.error(
      "Leave error:",
      error
    );

  }

  currentRoomCode = null;
  currentRoom = null;

  if (timerInterval) {

    clearInterval(
      timerInterval
    );

    timerInterval = null;

  }

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

window.showCreateRoom =
  showCreateRoom;

window.showJoinRoom =
  showJoinRoom;

window.goHome =
  goHome;

window.createRoom =
  createRoom;

window.joinRoom =
  joinRoom;

window.copyRoomLink =
  copyRoomLink;

window.startAuction =
  startAuction;

window.placeBid =
  placeBid;

window.restartGame =
  restartGame;

window.leaveRoom =
  leaveRoom;


// ============================================================
// INITIAL SCREEN
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const params =
      new URLSearchParams(
        window.location.search
      );

    if (
      params.get("room")
    ) {

      showJoinRoom();

    } else {

      showScreen("homeScreen");

    }

  }
);
