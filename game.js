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
  databaseURL:
    "https://naruto-shinobi-auction-default-rtdb.firebaseio.com",
  projectId: "naruto-shinobi-auction",
  storageBucket:
    "naruto-shinobi-auction.firebasestorage.app",
  messagingSenderId: "187952563869",
  appId:
    "1:187952563869:web:839ac2add9ae0f5835f674",
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
// GAME SETTINGS
// =====================================================

// Money is stored in LAKHS.
//
// ₹20 Cr = 2000 Lakhs
// ₹1 Cr  = 100 Lakhs
// ₹50 L  = 50 Lakhs
// ₹10 Cr = 1000 Lakhs

const STARTING_BUDGET = 2000;

const MAX_PLAYERS = 4;

const STARTING_BID = 100;

const SMALL_INCREMENT = 50;

// After ₹10 Cr:
// increase by ₹1 Cr
const BIG_INCREMENT = 100;


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
// AUTHENTICATION
// =====================================================

signInAnonymously(auth)
  .catch(error => {

    console.error(error);

    const message =
      document.getElementById("joinMessage");

    message.textContent =
      "Firebase login failed.";

  });


onAuthStateChanged(auth, currentUser => {

  if (currentUser) {

    user = currentUser;

  }

});


// =====================================================
// JOIN AUCTION
// =====================================================

window.joinAuction = async function () {

  const input =
    document.getElementById("teamName");

  const message =
    document.getElementById("joinMessage");

  const name =
    input.value.trim();


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


  try {

    const teamRef =
      ref(db, "teams/" + myTeamId);

    const teamSnapshot =
      await get(teamRef);


    // -------------------------------------------------
    // CREATE TEAM
    // -------------------------------------------------

    if (!teamSnapshot.exists()) {

      await set(teamRef, {

        name: name,

        budget: STARTING_BUDGET,

        players: [],

        joinedAt: Date.now()

      });

    }


    // -------------------------------------------------
    // CREATE AUCTION / SELECT HOST
    // -------------------------------------------------

    const auctionRef =
      ref(db, "auction");


    await runTransaction(
      auctionRef,
      current => {

        // First person becomes auctioneer/host
        if (!current) {

          return {

            characterIndex: 0,

            currentBid: STARTING_BID,

            highestBidder: null,

            highestBidderName: null,

            status: "OPEN",

            hostId: myTeamId

          };

        }


        return current;

      }
    );


    // -------------------------------------------------
    // SHOW GAME
    // -------------------------------------------------

    document.getElementById("joinScreen")
      .style.display = "none";

    document.getElementById("gameScreen")
      .style.display = "block";


    startRealtimeListeners();


  } catch (error) {

    console.error(error);

    message.textContent =
      "Unable to join auction.";

  }

};


// =====================================================
// REALTIME LISTENERS
// =====================================================

function startRealtimeListeners() {


  onValue(
    ref(db, "auction"),
    snapshot => {

      const auction =
        snapshot.val();


      if (!auction) {

        return;

      }


      displayAuction(auction);

    }
  );


  onValue(
    ref(db, "teams"),
    snapshot => {

      displayTeams(
        snapshot.val() || {}
      );

    }
  );


  onValue(
    ref(db, "history"),
    snapshot => {

      displayHistory(
        snapshot.val() || {}
      );

    }
  );

}


// =====================================================
// DISPLAY AUCTION
// =====================================================

function displayAuction(auction) {

  const index =
    Number.isInteger(auction.characterIndex)
      ? auction.characterIndex
      : 0;


  const character =
    characters[index];


  // -------------------------------------------------
  // AUCTION FINISHED
  // -------------------------------------------------

  if (!character) {

    document.getElementById("characterName")
      .textContent =
      "🏆 Auction Finished";

    document.getElementById("characterInfo")
      .textContent =
      "All Shinobi have been auctioned.";

    document.getElementById("currentBid")
      .textContent =
      "FINISHED";

    document.getElementById("highestBidder")
      .textContent =
      "Auction complete";

    document.getElementById("gameMessage")
      .textContent =
      "🏆 Auction Finished!";

    return;

  }


  // -------------------------------------------------
  // CHARACTER
  // -------------------------------------------------

  document.getElementById("characterName")
    .textContent =
    character.name;


  document.getElementById("characterInfo")
    .textContent =
    character.info;


  // -------------------------------------------------
  // BID
  // -------------------------------------------------

  document.getElementById("currentBid")
    .textContent =
    formatMoney(auction.currentBid);


  document.getElementById("highestBidder")
    .textContent =
      auction.highestBidderName
        ? "🔥 Highest bidder: " +
          auction.highestBidderName
        : "No bids yet";


  // -------------------------------------------------
  // STATUS
  // -------------------------------------------------

  if (auction.status === "SOLD") {

    document.getElementById("gameMessage")
      .textContent =
      "🔨 SOLD to " +
      (auction.highestBidderName || "winner");

  }


  else if (auction.status === "FINISHED") {

    document.getElementById("gameMessage")
      .textContent =
      "🏆 Auction Finished";

  }


  else if (auction.status === "OPEN") {

    document.getElementById("gameMessage")
      .textContent =
      auction.highestBidder
        ? "🔥 Bidding is live!"
        : "💰 Opening bid: ₹1 Cr";

  }


  // -------------------------------------------------
  // HOST INFORMATION
  // -------------------------------------------------

  if (auction.hostId === myTeamId) {

    document.getElementById("gameMessage")
      .textContent +=
      " | 👑 You are the Auctioneer";

  }

}


// =====================================================
// PLACE BID
// =====================================================

window.placeBid = async function () {

  if (!myTeamId || !user) {

    showMessage(
      "Join the auction first."
    );

    return;

  }


  try {

    const rootRef =
      ref(db);


    const result =
      await runTransaction(
        rootRef,
        root => {

          if (!root) {

            return root;

          }


          const auction =
            root.auction;


          const teams =
            root.teams || {};


          const team =
            teams[myTeamId];


          // -------------------------------------------
          // VALIDATION
          // -------------------------------------------

          if (!auction) {

            return;

          }


          if (auction.status !== "OPEN") {

            return;

          }


          if (!team) {

            return;

          }


          const players =
            team.players || [];


          // Maximum 4 characters
          if (
            players.length >= MAX_PLAYERS
          ) {

            return;

          }


          // -------------------------------------------
          // CALCULATE NEXT BID
          // -------------------------------------------

          const currentBid =
            Number(auction.currentBid);


          const increment =
            currentBid < 1000
              ? SMALL_INCREMENT
              : BIG_INCREMENT;


          const newBid =
            currentBid + increment;


          // -------------------------------------------
          // BUDGET CHECK
          // -------------------------------------------

          if (
            newBid > Number(team.budget)
          ) {

            return;

          }


          // -------------------------------------------
          // UPDATE AUCTION
          // -------------------------------------------

          root.auction = {

            ...auction,

            currentBid: newBid,

            highestBidder: myTeamId,

            highestBidderName: team.name

          };


          return root;

        }
      );


    if (!result.committed) {

      showMessage(
        "❌ Bid failed. Try again."
      );

      return;

    }


    showMessage(
      "🔥 Bid placed successfully!"
    );


  } catch (error) {

    console.error(error);

    showMessage(
      "❌ Error placing bid."
    );

  }

};


// =====================================================
// SELL PLAYER
// =====================================================

window.sellPlayer = async function () {

  if (!myTeamId) return;


  try {

    const rootRef =
      ref(db);


    const result =
      await runTransaction(
        rootRef,
        root => {

          if (!root) return root;


          const auction =
            root.auction;


          const teams =
            root.teams || {};


          // -------------------------------------------
          // AUCTION VALIDATION
          // -------------------------------------------

          if (!auction) return;

          if (auction.status !== "OPEN")
            return;


          // Only auctioneer can sell
          if (
            auction.hostId !== myTeamId
          ) {

            return;

          }


          if (!auction.highestBidder)
            return;


          const winnerId =
            auction.highestBidder;


          const winner =
            teams[winnerId];


          if (!winner)
            return;


          const character =
            characters[
              auction.characterIndex
            ];


          if (!character)
            return;


          const players =
            winner.players || [];


          if (
            players.length >= MAX_PLAYERS
          ) {

            return;

          }


          const price =
            Number(auction.currentBid);


          const budget =
            Number(winner.budget);


          if (price > budget)
            return;


          // -------------------------------------------
          // ADD PLAYER
          // -------------------------------------------

          players.push({

            name: character.name,

            price: price

          });


          // -------------------------------------------
          // UPDATE WINNER
          // -------------------------------------------

          teams[winnerId] = {

            ...winner,

            budget: budget - price,

            players: players

          };


          // -------------------------------------------
          // MARK SOLD
          // -------------------------------------------

          root.auction = {

            ...auction,

            status: "SOLD"

          };


          // -------------------------------------------
          // HISTORY
          // -------------------------------------------

          if (!root.history)
            root.history = {};


          const historyId =
            String(Date.now());


          root.history[historyId] = {

            character: character.name,

            team: winner.name,

            price: price,

            time: Date.now()

          };


          root.teams = teams;


          return root;

        }
      );


    if (!result.committed) {

      showMessage(
        "❌ SOLD failed."
      );

      return;

    }


    showMessage(
      "🔨 Player SOLD successfully!"
    );


  } catch (error) {

    console.error(error);

    showMessage(
      "❌ Error selling player."
    );

  }

};


// =====================================================
// NEXT PLAYER
// =====================================================

window.nextPlayer = async function () {

  if (!myTeamId) return;


  try {

    const auctionRef =
      ref(db, "auction");


    const result =
      await runTransaction(
        auctionRef,
        auction => {

          if (!auction)
            return auction;


          // Only auctioneer
          if (
            auction.hostId !== myTeamId
          ) {

            return;

          }


          // Must sell before NEXT
          if (
            auction.status !== "SOLD"
          ) {

            return;

          }


          const nextIndex =
            auction.characterIndex + 1;


          // -------------------------------------------
          // AUCTION FINISHED
          // -------------------------------------------

          if (
            nextIndex >= characters.length
          ) {

            return {

              ...auction,

              characterIndex: nextIndex,

              status: "FINISHED",

              currentBid: 0,

              highestBidder: null,

              highestBidderName: null

            };

          }


          // -------------------------------------------
          // NEXT CHARACTER
          // -------------------------------------------

          return {

            ...auction,

            characterIndex: nextIndex,

            currentBid: STARTING_BID,

            highestBidder: null,

            highestBidderName: null,

            status: "OPEN"

          };

        }
      );


    if (!result.committed) {

      showMessage(
        "❌ NEXT is available only after SOLD."
      );

      return;

    }


    showMessage(
      "➡️ Next Shinobi!"
    );


  } catch (error) {

    console.error(error);

    showMessage(
      "❌ Error moving to next player."
    );

  }

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
          💰 Budget:
          <b>${formatMoney(team.budget)}</b>
        </div>

        <div>
          👥 Players:
          ${players.length} / ${MAX_PLAYERS}
        </div>

        <div>
          ${
            players.length
              ? players.map(player => `
                  <div>
                    ⚔️
                    ${escapeHTML(player.name)}
                    —
                    ${formatMoney(player.price)}
                  </div>
                `).join("")
              : "<div>No players yet</div>"
          }
        </div>

      `;


      container.appendChild(div);

    });


  // -------------------------------------------------
  // MY TEAM
  // -------------------------------------------------

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
      formatMoney(myTeam.budget);


    document.getElementById("myPlayers")
      .textContent =
      `${(myTeam.players || []).length} / ${MAX_PLAYERS}`;

  }

}


// =====================================================
// AUCTION HISTORY
// =====================================================

function displayHistory(history) {

  const container =
    document.getElementById("history");


  container.innerHTML = "";


  const entries =
    Object.values(history)
      .sort(
        (a, b) =>
          Number(b.time) -
          Number(a.time)
      );


  entries.forEach(item => {

    const div =
      document.createElement("div");


    div.className =
      "history-item";


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


    container.appendChild(div);

  });

}


// =====================================================
// MONEY FORMAT
// =====================================================

function formatMoney(lakhs) {

  const value =
    Number(lakhs);


  if (!Number.isFinite(value))
    return "₹0 L";


  if (value >= 100) {

    const crore =
      value / 100;


    const formatted =
      Number.isInteger(crore)
        ? crore
        : crore.toFixed(2);


    return "₹" +
      formatted +
      " Cr";

  }


  return "₹" +
    value +
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
// HTML SECURITY
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