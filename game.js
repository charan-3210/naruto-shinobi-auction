import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue,
  runTransaction
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

  apiKey: "PASTE_YOUR_API_KEY_HERE",

  authDomain:
    "naruto-shinobi-auction.firebaseapp.com",

  databaseURL:
    "PASTE_YOUR_DATABASE_URL_HERE",

  projectId:
    "naruto-shinobi-auction",

  storageBucket:
    "PASTE_YOUR_STORAGE_BUCKET_HERE",

  messagingSenderId:
    "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",

  appId:
    "PASTE_YOUR_APP_ID_HERE"

};


// =====================================================
// FIREBASE START
// =====================================================

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

const auth = getAuth(app);

let user = null;
let myTeamId = null;


// =====================================================
// CHARACTERS
// =====================================================

const characters = [

  {
    name: "Naruto Uzumaki",
    info: "Seventh Hokage • Jinchuriki"
  },

  {
    name: "Sasuke Uchiha",
    info: "Sharingan • Rinnegan"
  },

  {
    name: "Madara Uchiha",
    info: "Legendary Uchiha • Ten Tails"
  },

  {
    name: "Itachi Uchiha",
    info: "Mangekyo Sharingan • Akatsuki"
  },

  {
    name: "Minato Namikaze",
    info: "Yellow Flash • Fourth Hokage"
  },

  {
    name: "Hashirama Senju",
    info: "First Hokage • Wood Style"
  },

  {
    name: "Might Guy",
    info: "Eight Gates • Taijutsu Master"
  },

  {
    name: "Kakashi Hatake",
    info: "Copy Ninja • Sharingan"
  },

  {
    name: "Pain",
    info: "Six Paths • Rinnegan"
  },

  {
    name: "Obito Uchiha",
    info: "Kamui • Sharingan"
  },

  {
    name: "Jiraiya",
    info: "Legendary Sannin • Sage Mode"
  },

  {
    name: "Orochimaru",
    info: "Legendary Sannin • Forbidden Jutsu"
  }

];


// =====================================================
// CONSTANTS
// =====================================================

const STARTING_BUDGET = 2000;

const MAX_PLAYERS = 4;

const STARTING_BID = 100;

const SMALL_INCREMENT = 50;

const BIG_INCREMENT = 100;


// Money is stored in Lakhs.
// 100 Lakhs = 1 Crore.
// 2000 Lakhs = 20 Crore.


// =====================================================
// LOGIN
// =====================================================

signInAnonymously(auth);

onAuthStateChanged(auth, (currentUser) => {

  if (currentUser) {

    user = currentUser;

  }

});


// =====================================================
// JOIN AUCTION
// =====================================================

window.joinAuction = async function () {

  const name =
    document.getElementById("teamName").value.trim();

  const message =
    document.getElementById("joinMessage");

  if (!name) {

    message.textContent =
      "Enter your team name.";

    return;

  }

  if (!user) {

    message.textContent =
      "Connecting to Firebase...";

    return;

  }


  myTeamId = user.uid;


  const teamRef =
    ref(db, "teams/" + myTeamId);


  const snapshot =
    await get(teamRef);


  if (!snapshot.exists()) {

    await set(teamRef, {

      name: name,

      budget: STARTING_BUDGET,

      players: [],

      joinedAt: Date.now()

    });

  }


  document.getElementById("joinScreen")
    .style.display = "none";

  document.getElementById("gameScreen")
    .style.display = "block";


  document.getElementById("myTeam")
    .textContent = name;


  startRealtimeListeners();

};


// =====================================================
// REALTIME LISTENERS
// =====================================================

function startRealtimeListeners() {

  onValue(ref(db, "auction"), (snapshot) => {

    const auction = snapshot.val();

    if (!auction) {

      createAuction();

      return;

    }

    displayAuction(auction);

  });


  onValue(ref(db, "teams"), (snapshot) => {

    displayTeams(snapshot.val() || {});

  });


  onValue(ref(db, "history"), (snapshot) => {

    displayHistory(snapshot.val() || {});

  });

}


// =====================================================
// CREATE AUCTION
// =====================================================

async function createAuction() {

  const auctionRef =
    ref(db, "auction");


  const snapshot =
    await get(auctionRef);


  if (snapshot.exists()) return;


  await set(auctionRef, {

    characterIndex: 0,

    currentBid: STARTING_BID,

    highestBidder: null,

    highestBidderName: null,

    status: "OPEN"

  });

}


// =====================================================
// DISPLAY AUCTION
// =====================================================

function displayAuction(auction) {

  const index =
    auction.characterIndex || 0;


  const character =
    characters[index];


  if (!character) {

    document.getElementById("characterName")
      .textContent = "Auction Finished";

    return;

  }


  document.getElementById("characterName")
    .textContent = character.name;


  document.getElementById("characterInfo")
    .textContent = character.info;


  document.getElementById("currentBid")
    .textContent = formatMoney(auction.currentBid);


  document.getElementById("highestBidder")
    .textContent =
      auction.highestBidderName
      ? "Highest bidder: " + auction.highestBidderName
      : "No bids yet";


  if (auction.status === "SOLD") {

    document.getElementById("gameMessage")
      .textContent =
        "🔨 SOLD to " + auction.highestBidderName;

  }

}


// =====================================================
// BID
// =====================================================

window.placeBid = async function () {

  if (!myTeamId) return;


  const auctionSnapshot =
    await get(ref(db, "auction"));


  const auction =
    auctionSnapshot.val();


  if (!auction ||
      auction.status !== "OPEN") {

    showMessage("Auction is not open.");

    return;

  }


  const teamSnapshot =
    await get(ref(db, "teams/" + myTeamId));


  const team =
    teamSnapshot.val();


  if (!team) return;


  const players =
    team.players || [];


  if (players.length >= MAX_PLAYERS) {

    showMessage(
      "❌ You already have 4 characters!"
    );

    return;

  }


  const increment =
    auction.currentBid < 1000
      ? SMALL_INCREMENT
      : BIG_INCREMENT;


  const newBid =
    auction.currentBid + increment;


  if (newBid > team.budget) {

    showMessage(
      "❌ Not enough budget!"
    );

    return;

  }


  const auctionRef =
    ref(db, "auction");


  await runTransaction(
    auctionRef,
    (current) => {

      if (!current) return current;


      if (current.status !== "OPEN")
        return;


      if (
        current.currentBid !==
        auction.currentBid
      ) {

        return;

      }


      return {

        ...current,

        currentBid: newBid,

        highestBidder: myTeamId,

        highestBidderName: team.name

      };

    }
  );


  showMessage(
    "🔥 Bid placed: " +
    formatMoney(newBid)
  );

};


// =====================================================
// SELL PLAYER
// =====================================================

window.sellPlayer = async function () {

  const auctionSnapshot =
    await get(ref(db, "auction"));


  const auction =
    auctionSnapshot.val();


  if (!auction ||
      !auction.highestBidder) {

    showMessage("No bidder.");

    return;

  }


  if (auction.status !== "OPEN") return;


  const winnerId =
    auction.highestBidder;


  const winnerRef =
    ref(db, "teams/" + winnerId);


  const winnerSnapshot =
    await get(winnerRef);


  const winner =
    winnerSnapshot.val();


  if (!winner) return;


  const character =
    characters[auction.characterIndex];


  const players =
    winner.players || [];


  if (players.length >= MAX_PLAYERS) {

    showMessage(
      "Winner already has 4 players."
    );

    return;

  }


  players.push({

    name: character.name,

    price: auction.currentBid

  });


  const newBudget =
    winner.budget - auction.currentBid;


  await update(winnerRef, {

    budget: newBudget,

    players: players

  });


  await update(
    ref(db, "auction"),
    {

      status: "SOLD"

    }
  );


  await set(
    ref(
      db,
      "history/" + Date.now()
    ),
    {

      character: character.name,

      team: winner.name,

      price: auction.currentBid,

      time: Date.now()

    }
  );


  showMessage(
    "🔨 " +
    character.name +
    " SOLD to " +
    winner.name
  );

};


// =====================================================
// NEXT PLAYER
// =====================================================

window.nextPlayer = async function () {

  const auctionSnapshot =
    await get(ref(db, "auction"));


  const auction =
    auctionSnapshot.val();


  if (!auction) return;


  const nextIndex =
    auction.characterIndex + 1;


  if (nextIndex >= characters.length) {

    await update(
      ref(db, "auction"),
      {

        characterIndex: nextIndex,

        status: "FINISHED",

        currentBid: 0,

        highestBidder: null,

        highestBidderName: null

      }
    );

    return;

  }


  await update(
    ref(db, "auction"),
    {

      characterIndex: nextIndex,

      currentBid: STARTING_BID,

      highestBidder: null,

      highestBidderName: null,

      status: "OPEN"

    }
  );

};


// =====================================================
// TEAMS
// =====================================================

function displayTeams(teams) {

  const container =
    document.getElementById("teams");


  container.innerHTML = "";


  Object.values(teams).forEach(team => {

    const div =
      document.createElement("div");


    div.className = "team";


    const players =
      team.players || [];


    div.innerHTML = `

      <div class="team-name">
        ${escapeHTML(team.name)}
      </div>

      <div>
        Budget:
        <b>${formatMoney(team.budget)}</b>
      </div>

      <div>
        Players:
        ${players.length} / 4
      </div>

      ${
        players.length
        ? players.map(
            p =>
            `<div>
              ${escapeHTML(p.name)}
              — ${formatMoney(p.price)}
            </div>`
          ).join("")
        : "<div>No players</div>"
      }

    `;


    container.appendChild(div);

  });


  if (myTeamId && teams[myTeamId]) {

    const myTeam =
      teams[myTeamId];


    document.getElementById("myBudget")
      .textContent =
        formatMoney(myTeam.budget);


    document.getElementById("myPlayers")
      .textContent =
        `${(myTeam.players || []).length} / 4`;

  }

}


// =====================================================
// HISTORY
// =====================================================

function displayHistory(history) {

  const container =
    document.getElementById("history");


  container.innerHTML = "";


  const entries =
    Object.values(history)
      .sort((a, b) => b.time - a.time);


  entries.forEach(item => {

    const div =
      document.createElement("div");


    div.className =
      "history-item";


    div.innerHTML = `

      🔨 <b>${escapeHTML(item.character)}</b>

      sold to

      <b>${escapeHTML(item.team)}</b>

      for

      <b>${formatMoney(item.price)}</b>

    `;


    container.appendChild(div);

  });

}


// =====================================================
// MONEY
// =====================================================

function formatMoney(lakhs) {

  if (lakhs >= 100) {

    const crore =
      lakhs / 100;


    return "₹" +
      (Number.isInteger(crore)
        ? crore
        : crore.toFixed(2))
      + " Cr";

  }


  return "₹" + lakhs + " L";

}


// =====================================================
// MESSAGE
// =====================================================

function showMessage(message) {

  document.getElementById("gameMessage")
    .textContent = message;

}


// =====================================================
// SECURITY
// =====================================================

function escapeHTML(text) {

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}