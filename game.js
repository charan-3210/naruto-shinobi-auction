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
// FIREBASE
// =====================================================

const firebaseConfig = {

  apiKey: "AIzaSyB4PSLZ0ZhVGGtfZ1hcluOWsTbvJDxxxTg",

  authDomain:
    "naruto-shinobi-auction.firebaseapp.com",

  databaseURL:
    "https://naruto-shinobi-auction-default-rtdb.firebaseio.com",

  projectId:
    "naruto-shinobi-auction",

  storageBucket:
    "naruto-shinobi-auction.firebasestorage.app",

  messagingSenderId:
    "187952563869",

  appId:
    "1:187952563869:web:839ac2add9ae0f5835f674",

  measurementId:
    "G-N3QGHDB240"
};


// Start Firebase

const app =
  initializeApp(firebaseConfig);

const db =
  getDatabase(app);

const auth =
  getAuth(app);


// =====================================================
// VARIABLES
// =====================================================

let user = null;

let myTeamId = null;


// =====================================================
// GAME SETTINGS
// =====================================================

// Money is stored in LAKHS.
//
// 100 Lakhs = 1 Crore
//
// Starting budget:
// 2000 Lakhs = ₹20 Cr

const STARTING_BUDGET = 2000;

const MAX_PLAYERS = 4;

const STARTING_BID = 100;

// ₹1 Cr → ₹10 Cr
// Increase by ₹50 Lakhs

const SMALL_INCREMENT = 50;

// Above ₹10 Cr
// Increase by ₹1 Cr

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
// JOIN
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
      "❌ Enter a team name.";

    return;

  }


  if (!user) {

    message.textContent =
      "⏳ Connecting to Firebase...";

    return;

  }


  myTeamId = user.uid;


  try {

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


    startRealtimeListeners();


  } catch (error) {

    console.error(error);

    message.textContent =
      "❌ Could not join auction.";

  }

};


// =====================================================
// REALTIME LISTENERS
// =====================================================

function startRealtimeListeners() {


  // AUCTION

  onValue(
    ref(db, "auction"),
    snapshot => {

      const auction =
        snapshot.val();


      if (!auction) {

        createAuction();

        return;

      }


      displayAuction(auction);

    }
  );


  // TEAMS

  onValue(
    ref(db, "teams"),
    snapshot => {

      displayTeams(
        snapshot.val() || {}
      );

    }
  );


  // HISTORY

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
// CREATE AUCTION
// =====================================================

async function createAuction() {

  const auctionRef =
    ref(db, "auction");


  const result =
    await runTransaction(
      auctionRef,
      current => {

        if (current !== null) {

          return;

        }


        return {

          characterIndex: 0,

          currentBid: STARTING_BID,

          highestBidder: null,

          highestBidderName: null,

          status: "OPEN"

        };

      }
    );

}


// =====================================================
// DISPLAY AUCTION
// =====================================================

function displayAuction(auction) {

  const index =
    auction.characterIndex;


  if (
    index === undefined ||
    index >= characters.length
  ) {

    document.getElementById(
      "characterName"
    ).textContent =
      "🏆 AUCTION FINISHED";

    document.getElementById(
      "characterInfo"
    ).textContent =
      "All shinobi have been auctioned.";

    disableButtons();

    return;

  }


  const character =
    characters[index];


  document.getElementById(
    "characterName"
  ).textContent =
    character.name;


  document.getElementById(
    "characterInfo"
  ).textContent =
    character.info;


  document.getElementById(
    "currentBid"
  ).textContent =
    formatMoney(
      auction.currentBid
    );


  document.getElementById(
    "highestBidder"
  ).textContent =

    auction.highestBidderName

      ? "🔥 Highest bidder: " +
        auction.highestBidderName

      : "No bids yet";


  if (auction.status === "SOLD") {

    document.getElementById(
      "gameMessage"
    ).textContent =
      "🔨 SOLD to " +
      auction.highestBidderName;

  }


  if (auction.status === "OPEN") {

    document.getElementById(
      "gameMessage"
    ).textContent =
      "Auction is LIVE!";

  }


  if (auction.status === "FINISHED") {

    document.getElementById(
      "gameMessage"
    ).textContent =
      "🏆 Auction completed!";

    disableButtons();

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


  if (
    !auction ||
    auction.status !== "OPEN"
  ) {

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


  // Maximum 4 players

  if (
    players.length >= MAX_PLAYERS
  ) {

    showMessage(
      "❌ You already have 4 players!"
    );

    return;

  }


  let newBid;


  // FIRST BID = ₹1 Cr

  if (!auction.highestBidder) {

    newBid =
      STARTING_BID;

  }

  // ₹1 Cr up to ₹10 Cr
  // + ₹50 Lakhs

  else if (
    auction.currentBid < 1000
  ) {

    newBid =
      auction.currentBid +
      SMALL_INCREMENT;

  }

  // Above ₹10 Cr
  // + ₹1 Cr

  else {

    newBid =
      auction.currentBid +
      BIG_INCREMENT;

  }


  // Cannot bid more than budget

  if (newBid > team.budget) {

    showMessage(
      "❌ Not enough budget!"
    );

    return;

  }


  const auctionRef =
    ref(db, "auction");


  const result =
    await runTransaction(
      auctionRef,
      current => {

        if (!current) {

          return;

        }


        if (
          current.status !== "OPEN"
        ) {

          return;

        }


        // Recalculate using
        // current Firebase value

        let bid;


        if (!current.highestBidder) {

          bid = STARTING_BID;

        }

        else if (
          current.currentBid < 1000
        ) {

          bid =
            current.currentBid +
            SMALL_INCREMENT;

        }

        else {

          bid =
            current.currentBid +
            BIG_INCREMENT;

        }


        if (bid > team.budget) {

          return;

        }


        return {

          ...current,

          currentBid: bid,

          highestBidder: myTeamId,

          highestBidderName: team.name

        };

      }
    );


  if (!result.committed) {

    showMessage(
      "⚠️ Bid failed. Try again."
    );

    return;

  }


  showMessage(
    "🔥 Bid placed: " +
    formatMoney(newBid)
  );

};


// =====================================================
// SOLD
// =====================================================

window.sellPlayer = async function () {

  const auctionRef =
    ref(db, "auction");


  const auctionSnapshot =
    await get(auctionRef);


  const auction =
    auctionSnapshot.val();


  if (!auction) {

    return;

  }


  if (
    auction.status !== "OPEN"
  ) {

    showMessage(
      "Auction is not open."
    );

    return;

  }


  if (!auction.highestBidder) {

    showMessage(
      "❌ No bidder."
    );

    return;

  }


  const winnerId =
    auction.highestBidder;


  const winnerRef =
    ref(db, "teams/" + winnerId);


  const winnerSnapshot =
    await get(winnerRef);


  const winner =
    winnerSnapshot.val();


  if (!winner) {

    return;

  }


  const players =
    winner.players || [];


  if (
    players.length >= MAX_PLAYERS
  ) {

    showMessage(
      "❌ Winner already has 4 players."
    );

    return;

  }


  const character =
    characters[
      auction.characterIndex
    ];


  // Add player

  players.push({

    name: character.name,

    price: auction.currentBid

  });


  // Deduct money

  const newBudget =
    winner.budget -
    auction.currentBid;


  await update(
    winnerRef,
    {

      budget: newBudget,

      players: players

    }
  );


  // Mark SOLD

  await update(
    auctionRef,
    {

      status: "SOLD"

    }
  );


  // History

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

  const auctionRef =
    ref(db, "auction");


  const snapshot =
    await get(auctionRef);


  const auction =
    snapshot.val();


  if (!auction) {

    return;

  }


  // NEXT should normally happen
  // after SOLD

  if (
    auction.status !== "SOLD"
  ) {

    showMessage(
      "❌ Sell the current player first."
    );

    return;

  }


  const nextIndex =
    auction.characterIndex + 1;


  // Finished

  if (
    nextIndex >= characters.length
  ) {

    await update(
      auctionRef,
      {

        characterIndex:
          nextIndex,

        currentBid: 0,

        highestBidder: null,

        highestBidderName: null,

        status: "FINISHED"

      }
    );

    return;

  }


  // New player

  await update(
    auctionRef,
    {

      characterIndex:
        nextIndex,

      currentBid:
        STARTING_BID,

      highestBidder:
        null,

      highestBidderName:
        null,

      status:
        "OPEN"

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


  Object.values(teams)
    .sort(
      (a, b) =>
        a.joinedAt - b.joinedAt
    )
    .forEach(team => {

      const div =
        document.createElement("div");


      div.className =
        "team";


      const players =
        team.players || [];


      div.innerHTML = `

        <div class="team-name">
          🏆 ${escapeHTML(team.name)}
        </div>

        <div>
          Budget:
          <b>
            ${formatMoney(team.budget)}
          </b>
        </div>

        <div>
          Players:
          <b>
            ${players.length} / 4
          </b>
        </div>

        <br>

        ${
          players.length

          ? players.map(
              player => `

                <div>
                  ⚔️
                  ${escapeHTML(player.name)}
                  —
                  ${formatMoney(player.price)}
                </div>

              `
            ).join("")

          : "<div>No players yet</div>"
        }

      `;


      container.appendChild(div);

    });


  // YOUR TEAM

  if (
    myTeamId &&
    teams[myTeamId]
  ) {

    const myTeam =
      teams[myTeamId];


    document.getElementById(
      "myTeam"
    ).textContent =
      myTeam.name;


    document.getElementById(
      "myBudget"
    ).textContent =
      formatMoney(myTeam.budget);


    document.getElementById(
      "myPlayers"
    ).textContent =
      `${(myTeam.players || []).length} / 4`;

  }

}


// =====================================================
// HISTORY
// =====================================================

function displayHistory(history) {

  const container =
    document.getElementById(
      "history"
    );


  container.innerHTML = "";


  const entries =
    Object.values(history)
      .sort(
        (a, b) =>
          b.time - a.time
      );


  if (!entries.length) {

    container.innerHTML =
      "<p>No players sold yet.</p>";

    return;

  }


  entries.forEach(item => {

    const div =
      document.createElement("div");


    div.className =
      "history-item";


    div.innerHTML = `

      🔨

      <b>
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
// MONEY
// =====================================================

function formatMoney(lakhs) {

  if (lakhs >= 100) {

    const crore =
      lakhs / 100;


    return "₹" +
      (
        Number.isInteger(crore)

          ? crore

          : crore.toFixed(2)
      ) +
      " Cr";

  }


  return "₹" +
    lakhs +
    " L";

}


// =====================================================
// MESSAGE
// =====================================================

function showMessage(message) {

  document.getElementById(
    "gameMessage"
  ).textContent =
    message;

}


// =====================================================
// DISABLE BUTTONS
// =====================================================

function disableButtons() {

  document.getElementById(
    "bidButton"
  ).disabled = true;


  document.getElementById(
    "soldButton"
  ).disabled = true;


  document.getElementById(
    "nextButton"
  ).disabled = true;

}


// =====================================================
// SECURITY: HTML ESCAPE
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