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
  apiKey: "AIzaSyB4PSLZ0ZhVGGtfZ1hcluOWsTbvJDxxxTg",
  authDomain: "naruto-shinobi-auction.firebaseapp.com",
  databaseURL: "https://naruto-shinobi-auction-default-rtdb.firebaseio.com",
  projectId: "naruto-shinobi-auction",
  storageBucket: "naruto-shinobi-auction.firebasestorage.app",
  messagingSenderId: "187952563869",
  appId: "1:187952563869:web:839ac2add9ae0f5835f674",
  measurementId: "G-N3QGHDB240"
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
// AUCTION RULES
// =====================================================

// Money is stored in LAKHS.
//
// ₹1 Cr  = 100 Lakhs
// ₹10 Cr = 1000 Lakhs
// ₹20 Cr = 2000 Lakhs

const STARTING_BUDGET = 2000;

const MAX_PLAYERS = 4;

const STARTING_BID = 100;

// From ₹1 Cr to ₹10 Cr:
// increase by ₹50 Lakhs

const SMALL_INCREMENT = 50;

// After ₹10 Cr:
// increase by ₹1 Cr

const BIG_INCREMENT = 100;


// =====================================================
// LOGIN
// =====================================================

signInAnonymously(auth)
  .catch((error) => {

    console.error("Firebase login error:", error);

  });


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
    document.getElementById("teamName")
      .value
      .trim();

  const message =
    document.getElementById("joinMessage");

  if (!name) {

    message.textContent =
      "❌ Enter your team name.";

    return;

  }

  if (!user) {

    message.textContent =
      "⏳ Connecting to Firebase...";

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

  else {

    // Existing team
    // Keep its current budget and players.

    const existingTeam =
      snapshot.val();

    document.getElementById("teamName")
      .value =
      existingTeam.name || name;

  }


  document.getElementById("joinScreen")
    .style.display = "none";

  document.getElementById("gameScreen")
    .style.display = "block";


  const teamSnapshot =
    await get(teamRef);

  const team =
    teamSnapshot.val();

  document.getElementById("myTeam")
    .textContent =
    team.name;


  startRealtimeListeners();

};


// =====================================================
// REALTIME LISTENERS
// =====================================================

function startRealtimeListeners() {

  onValue(
    ref(db, "auction"),
    (snapshot) => {

      const auction =
        snapshot.val();

      if (!auction) {

        createAuction();

        return;

      }

      displayAuction(auction);

    }
  );


  onValue(
    ref(db, "teams"),
    (snapshot) => {

      displayTeams(
        snapshot.val() || {}
      );

    }
  );


  onValue(
    ref(db, "history"),
    (snapshot) => {

      displayHistory(
        snapshot.val() || {}
      );

    }
  );

}


// =====================================================
// CREATE AUCTION
// =====================================================

async function createAuction() {

  const auctionRef =
    ref(db, "auction");

  const snapshot =
    await get(auctionRef);

  if (snapshot.exists()) {
    return;
  }

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
    Number(auction.characterIndex || 0);

  const character =
    characters[index];


  if (!character) {

    document.getElementById("characterName")
      .textContent =
      "🏆 Auction Finished";

    document.getElementById("characterInfo")
      .textContent =
      "All characters have been auctioned.";

    document.getElementById("currentBid")
      .textContent =
      "₹0";

    return;

  }


  document.getElementById("characterName")
    .textContent =
    character.name;


  document.getElementById("characterInfo")
    .textContent =
    character.info;


  document.getElementById("currentBid")
    .textContent =
    formatMoney(
      Number(auction.currentBid || 0)
    );


  if (auction.highestBidderName) {

    document.getElementById("highestBidder")
      .textContent =
      "Highest bidder: " +
      auction.highestBidderName;

  }

  else {

    document.getElementById("highestBidder")
      .textContent =
      "No bids yet";

  }


  if (auction.status === "SOLD") {

    if (auction.currentBid === 0) {

      document.getElementById("gameMessage")
        .textContent =
        "🎁 FREE to " +
        auction.highestBidderName;

    }

    else {

      document.getElementById("gameMessage")
        .textContent =
        "🔨 SOLD to " +
        auction.highestBidderName;

    }

  }

  else if (auction.status === "FINISHED") {

    document.getElementById("gameMessage")
      .textContent =
      "🏆 Auction Finished!";

  }

}


// =====================================================
// BID
// =====================================================

window.placeBid = async function () {

  if (!myTeamId) {

    return;

  }


  const auctionSnapshot =
    await get(ref(db, "auction"));

  const auction =
    auctionSnapshot.val();


  if (!auction ||
      auction.status !== "OPEN") {

    showMessage(
      "❌ Auction is not open."
    );

    return;

  }


  const teamSnapshot =
    await get(
      ref(db, "teams/" + myTeamId)
    );

  const team =
    teamSnapshot.val();


  if (!team) {

    return;

  }


  const players =
    team.players || [];


  // =========================================
  // MAX 4 CHARACTERS
  // =========================================

  if (players.length >= MAX_PLAYERS) {

    showMessage(
      "❌ You already have 4 characters!"
    );

    return;

  }


  // =========================================
  // ₹0 TEAM CANNOT BID
  // =========================================

  if (Number(team.budget) <= 0) {

    showMessage(
      "🎁 You have ₹0. The next character will be FREE for you."
    );

    return;

  }


  // =========================================
  // CALCULATE NEXT BID
  // =========================================

  const currentBid =
    Number(auction.currentBid);


  const increment =
    currentBid < 1000
      ? SMALL_INCREMENT
      : BIG_INCREMENT;


  const newBid =
    currentBid + increment;


  // =========================================
  // NOT ENOUGH MONEY
  // =========================================

  if (newBid > Number(team.budget)) {

    showMessage(
      "❌ Not enough budget!"
    );

    return;

  }


  // =========================================
  // FIREBASE TRANSACTION
  // =========================================

  const auctionRef =
    ref(db, "auction");


  const result =
    await runTransaction(
      auctionRef,
      (current) => {

        if (!current) {
          return current;
        }


        if (current.status !== "OPEN") {
          return;
        }


        // Someone else bid first
        if (
          Number(current.currentBid) !==
          currentBid
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


  if (!result.committed) {

    showMessage(
      "⚠️ Someone else bid first. Try again."
    );

    return;

  }


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


  if (!auction) {

    return;

  }


  if (auction.status !== "OPEN") {

    showMessage(
      "❌ Auction is not open."
    );

    return;

  }


  if (!auction.highestBidder) {

    showMessage(
      "❌ No bidder."
    );

    return;

  }


  await finalizeSale(auction);

};


// =====================================================
// FINALIZE SALE
// =====================================================

async function finalizeSale(auction) {

  const winnerId =
    auction.highestBidder;

  const winnerRef =
    ref(db, "teams/" + winnerId);


  const winnerSnapshot =
    await get(winnerRef);

  const winner =
    winnerSnapshot.val();


  if (!winner) {

    showMessage(
      "❌ Winner not found."
    );

    return;

  }


  const character =
    characters[
      Number(auction.characterIndex)
    ];


  if (!character) {

    return;

  }


  const players =
    winner.players || [];


  if (players.length >= MAX_PLAYERS) {

    showMessage(
      "❌ Winner already has 4 characters."
    );

    return;

  }


  const price =
    Number(auction.currentBid || 0);


  // =========================================
  // CHECK MONEY
  // =========================================

  if (price > Number(winner.budget)) {

    showMessage(
      "❌ Winner does not have enough money."
    );

    return;

  }


  // =========================================
  // ADD CHARACTER
  // =========================================

  players.push({

    name: character.name,

    price: price

  });


  const newBudget =
    Number(winner.budget) - price;


  // =========================================
  // UPDATE TEAM
  // =========================================

  await update(
    winnerRef,
    {

      budget: newBudget,

      players: players

    }
  );


  // =========================================
  // MARK SOLD
  // =========================================

  await update(
    ref(db, "auction"),
    {

      status: "SOLD"

    }
  );


  // =========================================
  // HISTORY
  // =========================================

  await set(
    ref(
      db,
      "history/" +
      Date.now() +
      "_" +
      Math.random()
        .toString(36)
        .slice(2)
    ),
    {

      character: character.name,

      team: winner.name,

      price: price,

      time: Date.now(),

      free: price === 0

    }
  );


  if (price === 0) {

    showMessage(
      "🎁 " +
      character.name +
      " given FREE to " +
      winner.name
    );

  }

  else {

    showMessage(
      "🔨 " +
      character.name +
      " SOLD to " +
      winner.name
    );

  }

}


// =====================================================
// FIND TEAM ELIGIBLE FOR FREE CHARACTER
// =====================================================

async function findFreeTeam() {

  const snapshot =
    await get(ref(db, "teams"));

  const teams =
    snapshot.val() || {};


  const eligible =
    Object.entries(teams)

      .filter(([id, team]) => {

        const budget =
          Number(team.budget || 0);

        const players =
          team.players || [];


        return (
          budget <= 0 &&
          players.length < MAX_PLAYERS
        );

      })

      .sort((a, b) => {

        const teamA = a[1];
        const teamB = b[1];


        // Team with fewer characters gets priority
        const playersA =
          (teamA.players || []).length;

        const playersB =
          (teamB.players || []).length;


        if (playersA !== playersB) {

          return playersA - playersB;

        }


        // If equal, earlier joined team gets priority
        return (
          Number(teamA.joinedAt || 0) -
          Number(teamB.joinedAt || 0)
        );

      });


  if (eligible.length === 0) {

    return null;

  }


  return {

    id: eligible[0][0],

    team: eligible[0][1]

  };

}


// =====================================================
// NEXT PLAYER
// =====================================================

window.nextPlayer = async function () {

  const auctionRef =
    ref(db, "auction");


  const snapshot =
    await get(auctionRef);


  const auction =
    snapshot.val();


  if (!auction) {

    return;

  }


  // =========================================
  // CURRENT CHARACTER MUST BE SOLD
  // =========================================

  if (auction.status !== "SOLD") {

    showMessage(
      "❌ Sell the current character first."
    );

    return;

  }


  const nextIndex =
    Number(auction.characterIndex) + 1;


  // =========================================
  // AUCTION FINISHED
  // =========================================

  if (nextIndex >= characters.length) {

    await update(
      auctionRef,
      {

        characterIndex: nextIndex,

        currentBid: 0,

        highestBidder: null,

        highestBidderName: null,

        status: "FINISHED"

      }
    );


    showMessage(
      "🏆 Auction Finished!"
    );

    return;

  }


  // =========================================
  // MOVE TO NEXT CHARACTER
  // =========================================

  await update(
    auctionRef,
    {

      characterIndex: nextIndex,

      currentBid: STARTING_BID,

      highestBidder: null,

      highestBidderName: null,

      status: "OPEN"

    }
  );


  // =========================================
  // CHECK FOR ₹0 TEAM
  // =========================================

  const freeTeam =
    await findFreeTeam();


  if (!freeTeam) {

    return;

  }


  // =========================================
  // GIVE NEXT CHARACTER FREE
  // =========================================

  const freeAuctionSnapshot =
    await get(auctionRef);


  const freeAuction =
    freeAuctionSnapshot.val();


  // Make sure nobody has bid
  if (
    !freeAuction ||
    freeAuction.status !== "OPEN" ||
    freeAuction.highestBidder
  ) {

    return;

  }


  // =========================================
  // CLAIM FREE CHARACTER SAFELY
  // =========================================

  const claimResult =
    await runTransaction(
      auctionRef,
      (current) => {

        if (!current) {
          return;
        }


        if (
          current.status !== "OPEN"
        ) {

          return;

        }


        if (
          current.highestBidder
        ) {

          return;

        }


        if (
          Number(current.characterIndex) !==
          nextIndex
        ) {

          return;

        }


        return {

          ...current,

          currentBid: 0,

          highestBidder:
            freeTeam.id,

          highestBidderName:
            freeTeam.team.name,

          status: "SOLD",

          freeCharacter: true

        };

      }
    );


  if (!claimResult.committed) {

    return;

  }


  // =========================================
  // ADD FREE CHARACTER TO TEAM
  // =========================================

  const teamRef =
    ref(
      db,
      "teams/" +
      freeTeam.id
    );


  const latestTeamSnapshot =
    await get(teamRef);


  const latestTeam =
    latestTeamSnapshot.val();


  if (!latestTeam) {
    return;
  }


  const latestPlayers =
    latestTeam.players || [];


  if (
    latestPlayers.length >=
    MAX_PLAYERS
  ) {

    return;

  }


  // Make sure character hasn't already
  // been added
  const alreadyHasCharacter =
    latestPlayers.some(
      p =>
        p.name ===
        characters[nextIndex].name
    );


  if (alreadyHasCharacter) {

    return;

  }


  latestPlayers.push({

    name:
      characters[nextIndex].name,

    price: 0

  });


  await update(
    teamRef,
    {

      budget: 0,

      players: latestPlayers

    }
  );


  // =========================================
  // ADD FREE CHARACTER TO HISTORY
  // =========================================

  await set(
    ref(
      db,
      "history/free_" +
      nextIndex +
      "_" +
      Date.now()
    ),
    {

      character:
        characters[nextIndex].name,

      team:
        latestTeam.name,

      price: 0,

      time: Date.now(),

      free: true

    }
  );


  showMessage(
    "🎁 " +
    characters[nextIndex].name +
    " goes FREE to " +
    latestTeam.name
  );

};


// =====================================================
// TEAMS
// =====================================================

function displayTeams(teams) {

  const container =
    document.getElementById("teams");


  container.innerHTML = "";


  Object.values(teams)
    .forEach(team => {

      const div =
        document.createElement("div");


      div.className =
        "team";


      const players =
        team.players || [];


      div.innerHTML = `

        <div class="team-name">
          ${escapeHTML(team.name)}
        </div>

        <div>
          Budget:
          <b>
            ${formatMoney(team.budget)}
          </b>
        </div>

        <div>
          Players:
          ${players.length} / 4
        </div>

        ${
          players.length
            ? players.map(
                p => `
                  <div>
                    ${escapeHTML(p.name)}
                    —
                    ${formatMoney(p.price)}
                  </div>
                `
              ).join("")

            : "<div>No players</div>"
        }

      `;


      container.appendChild(div);

    });


  // =========================================
  // UPDATE MY TEAM
  // =========================================

  if (
    myTeamId &&
    teams[myTeamId]
  ) {

    const myTeam =
      teams[myTeamId];


    document.getElementById("myTeam")
      .textContent =
      myTeam.name;


    document.getElementById("myBudget")
      .textContent =
      formatMoney(
        Number(myTeam.budget)
      );


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
      .sort(
        (a, b) =>
          Number(b.time || 0) -
          Number(a.time || 0)
      );


  entries.forEach(item => {

    const div =
      document.createElement("div");


    div.className =
      "history-item";


    if (Number(item.price) === 0) {

      div.innerHTML = `

        🎁 <b>
          ${escapeHTML(item.character)}
        </b>

        went FREE to

        <b>
          ${escapeHTML(item.team)}
        </b>

      `;

    }

    else {

      div.innerHTML = `

        🔨 <b>
          ${escapeHTML(item.character)}
        </b>

        sold to

        <b>
          ${escapeHTML(item.team)}
        </b>

        for

        <b>
          ${formatMoney(item.price)}
        </b>

      `;

    }


    container.appendChild(div);

  });

}


// =====================================================
// MONEY FORMAT
// =====================================================

function formatMoney(lakhs) {

  const amount =
    Number(lakhs || 0);


  if (amount >= 100) {

    const crore =
      amount / 100;


    return "₹" +
      (
        Number.isInteger(crore)
          ? crore
          : crore.toFixed(2)
      ) +
      " Cr";

  }


  return "₹" +
    amount +
    " L";

}


// =====================================================
// MESSAGE
// =====================================================

function showMessage(message) {

  const element =
    document.getElementById(
      "gameMessage"
    );


  if (element) {

    element.textContent =
      message;

  }

}


// =====================================================
// SECURITY
// =====================================================

function escapeHTML(text) {

  return String(text)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}
// =====================================================
// RESTART AUCTION
// =====================================================

window.restartAuction = async function () {

  const message =
    document.getElementById("restartMessage");

  const confirmRestart =
    confirm(
      "⚠️ Restart the entire auction?\n\n" +
      "All teams, characters, budgets and history " +
      "will be reset."
    );

  if (!confirmRestart) {
    return;
  }

  try {

    // Reset auction
    await set(
      ref(db, "auction"),
      {
        characterIndex: 0,
        currentBid: STARTING_BID,
        highestBidder: null,
        highestBidderName: null,
        status: "OPEN"
      }
    );


    // Reset all teams
    const teamsSnapshot =
      await get(ref(db, "teams"));

    const teams =
      teamsSnapshot.val() || {};


    const updates = {};


    Object.keys(teams).forEach(teamId => {

      updates[
        "teams/" + teamId + "/budget"
      ] = STARTING_BUDGET;

      updates[
        "teams/" + teamId + "/players"
      ] = [];

    });


    if (Object.keys(updates).length > 0) {

      await update(
        ref(db),
        updates
      );

    }


    // Delete auction history
    await set(
      ref(db, "history"),
      null
    );


    if (message) {

      message.textContent =
        "✅ Auction restarted!";

    }

    showMessage(
      "🔄 Auction restarted!"
    );

  }

  catch (error) {

    console.error(
      "Restart error:",
      error
    );

    if (message) {

      message.textContent =
        "❌ Restart failed.";

    }

  }

};