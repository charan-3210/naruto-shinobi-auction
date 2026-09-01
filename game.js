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
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
let listenersStarted = false;


// =====================================================
// CHARACTER DATABASE
// =====================================================

const characters = [

  // =========================
  // OTSUTSUKI
  // =========================

  {
    name: "Kaguya Otsutsuki",
    info: "Rabbit Goddess • Rinne Sharingan • Ten Tails",
    power: 100,
    attack: 100,
    defense: 100,
    speed: 90,
    hax: 100,
    intelligence: 90,
    synergy: 95
  },

  {
    name: "Hagoromo Otsutsuki",
    info: "Sage of Six Paths • Rinnegan",
    power: 99,
    attack: 98,
    defense: 99,
    speed: 90,
    hax: 99,
    intelligence: 100,
    synergy: 95
  },

  {
    name: "Isshiki Otsutsuki",
    info: "Sukunahikona • Daikokuten",
    power: 99,
    attack: 100,
    defense: 96,
    speed: 100,
    hax: 100,
    intelligence: 98,
    synergy: 90
  },

  {
    name: "Momoshiki Otsutsuki",
    info: "Rinnegan • Chakra Absorption",
    power: 96,
    attack: 96,
    defense: 90,
    speed: 95,
    hax: 98,
    intelligence: 90,
    synergy: 90
  },

  {
    name: "Kinshiki Otsutsuki",
    info: "Divine Weapons • Ōtsutsuki Warrior",
    power: 90,
    attack: 95,
    defense: 90,
    speed: 88,
    hax: 82,
    intelligence: 80,
    synergy: 85
  },

  {
    name: "Toneri Otsutsuki",
    info: "Tenseigan • Moon",
    power: 91,
    attack: 92,
    defense: 88,
    speed: 90,
    hax: 95,
    intelligence: 85,
    synergy: 85
  },

  {
    name: "Hamura Otsutsuki",
    info: "Byakugan • Six Paths Power",
    power: 96,
    attack: 94,
    defense: 95,
    speed: 90,
    hax: 95,
    intelligence: 95,
    synergy: 92
  },

  {
    name: "Indra Otsutsuki",
    info: "Mangekyo Sharingan • Powerful Chakra",
    power: 94,
    attack: 95,
    defense: 88,
    speed: 92,
    hax: 95,
    intelligence: 96,
    synergy: 90
  },

  {
    name: "Ashura Otsutsuki",
    info: "Six Paths Chakra • Powerful Life Force",
    power: 94,
    attack: 93,
    defense: 96,
    speed: 85,
    hax: 90,
    intelligence: 88,
    synergy: 92
  },


  // =========================
  // TOP TIER
  // =========================

  {
    name: "Madara Uchiha",
    info: "Ten Tails Jinchuriki • Rinne Sharingan",
    power: 98,
    attack: 98,
    defense: 97,
    speed: 94,
    hax: 99,
    intelligence: 98,
    synergy: 95
  },

  {
    name: "Naruto Uzumaki",
    info: "Six Paths Sage Mode • Seventh Hokage",
    power: 97,
    attack: 97,
    defense: 96,
    speed: 98,
    hax: 95,
    intelligence: 92,
    synergy: 98
  },

  {
    name: "Sasuke Uchiha",
    info: "Rinnegan • Eternal Mangekyo Sharingan",
    power: 96,
    attack: 95,
    defense: 90,
    speed: 98,
    hax: 99,
    intelligence: 98,
    synergy: 95
  },

  {
    name: "Hashirama Senju",
    info: "First Hokage • Sage Mode • Wood Style",
    power: 94,
    attack: 94,
    defense: 98,
    speed: 86,
    hax: 94,
    intelligence: 92,
    synergy: 96
  },

  {
    name: "Might Guy",
    info: "Eight Gates • Taijutsu Master",
    power: 95,
    attack: 100,
    defense: 80,
    speed: 100,
    hax: 70,
    intelligence: 82,
    synergy: 85
  },

  {
    name: "Minato Namikaze",
    info: "Yellow Flash • Flying Raijin",
    power: 92,
    attack: 90,
    defense: 85,
    speed: 100,
    hax: 96,
    intelligence: 99,
    synergy: 98
  },

  {
    name: "Obito Uchiha",
    info: "Ten Tails • Kamui • Sharingan",
    power: 94,
    attack: 94,
    defense: 93,
    speed: 94,
    hax: 100,
    intelligence: 94,
    synergy: 92
  },

  {
    name: "Itachi Uchiha",
    info: "Mangekyo Sharingan • Genjutsu",
    power: 90,
    attack: 88,
    defense: 82,
    speed: 90,
    hax: 98,
    intelligence: 100,
    synergy: 94
  },


  // =========================
  // KAGE / SANNIN
  // =========================

  {
    name: "Tobirama Senju",
    info: "Second Hokage • Flying Raijin",
    power: 88,
    attack: 87,
    defense: 85,
    speed: 96,
    hax: 92,
    intelligence: 99,
    synergy: 96
  },

  {
    name: "Hiruzen Sarutobi",
    info: "Third Hokage • Professor",
    power: 85,
    attack: 84,
    defense: 84,
    speed: 82,
    hax: 85,
    intelligence: 98,
    synergy: 92
  },

  {
    name: "Jiraiya",
    info: "Legendary Sannin • Sage Mode",
    power: 86,
    attack: 85,
    defense: 87,
    speed: 82,
    hax: 88,
    intelligence: 92,
    synergy: 95
  },

  {
    name: "Orochimaru",
    info: "Legendary Sannin • Forbidden Jutsu",
    power: 87,
    attack: 82,
    defense: 92,
    speed: 80,
    hax: 94,
    intelligence: 98,
    synergy: 90
  },

  {
    name: "Pain",
    info: "Six Paths • Rinnegan",
    power: 89,
    attack: 91,
    defense: 90,
    speed: 82,
    hax: 96,
    intelligence: 92,
    synergy: 95
  },

  {
    name: "Kakashi Hatake",
    info: "Copy Ninja • Sharingan",
    power: 84,
    attack: 82,
    defense: 80,
    speed: 88,
    hax: 90,
    intelligence: 98,
    synergy: 96
  },

  {
    name: "Gaara",
    info: "Fifth Kazekage • Sand Manipulation",
    power: 80,
    attack: 80,
    defense: 94,
    speed: 72,
    hax: 82,
    intelligence: 88,
    synergy: 92
  },

  {
    name: "Killer B",
    info: "Eight Tails Jinchuriki • Seven Swords",
    power: 86,
    attack: 90,
    defense: 90,
    speed: 85,
    hax: 84,
    intelligence: 82,
    synergy: 88
  },


  // =========================
  // AKATSUKI
  // =========================

  {
    name: "Nagato",
    info: "Rinnegan • Six Paths",
    power: 90,
    attack: 92,
    defense: 90,
    speed: 75,
    hax: 97,
    intelligence: 94,
    synergy: 93
  },

  {
    name: "Kisame Hoshigaki",
    info: "Samehada • Monster of the Mist",
    power: 78,
    attack: 85,
    defense: 90,
    speed: 72,
    hax: 80,
    intelligence: 80,
    synergy: 86
  },

  {
    name: "Deidara",
    info: "Explosive Clay • C4",
    power: 78,
    attack: 90,
    defense: 70,
    speed: 80,
    hax: 88,
    intelligence: 84,
    synergy: 82
  },

  {
    name: "Sasori",
    info: "Puppet Master • Third Kazekage",
    power: 76,
    attack: 82,
    defense: 78,
    speed: 72,
    hax: 88,
    intelligence: 90,
    synergy: 86
  },

  {
    name: "Kakuzu",
    info: "Five Hearts • Earth Grudge",
    power: 77,
    attack: 84,
    defense: 91,
    speed: 70,
    hax: 82,
    intelligence: 84,
    synergy: 82
  },

  {
    name: "Konan",
    info: "Paper Ninjutsu • Akatsuki",
    power: 70,
    attack: 75,
    defense: 72,
    speed: 78,
    hax: 84,
    intelligence: 86,
    synergy: 88
  },

  {
    name: "Hidan",
    info: "Immortality • Jashin Ritual",
    power: 65,
    attack: 76,
    defense: 88,
    speed: 65,
    hax: 80,
    intelligence: 60,
    synergy: 70
  }

];


// =====================================================
// AUCTION RULES
// =====================================================

const STARTING_BUDGET = 2000;
const MAX_PLAYERS = 4;
const STARTING_BID = 100;
const SMALL_INCREMENT = 50;
const BIG_INCREMENT = 100;


// =====================================================
// SHUFFLE
// =====================================================

function shuffleCharacters() {

  const shuffled = [...characters];

  for (
    let i = shuffled.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [
      shuffled[i],
      shuffled[j]
    ] = [
      shuffled[j],
      shuffled[i]
    ];

  }

  return shuffled;

}


// =====================================================
// LOGIN
// =====================================================

signInAnonymously(auth)
  .then(() => {

    console.log(
      "Firebase login successful"
    );

  })
  .catch(error => {

    console.error(
      "Firebase login error:",
      error
    );

    const message =
      document.getElementById(
        "joinMessage"
      );

    if (message) {

      message.textContent =
        "❌ Firebase error: " +
        error.code;

    }

  });


onAuthStateChanged(
  auth,
  currentUser => {

    if (currentUser) {

      user = currentUser;

    }

  }
);


// =====================================================
// JOIN AUCTION
// =====================================================

window.joinAuction =
async function () {

  const name =
    document
      .getElementById("teamName")
      .value
      .trim();

  const message =
    document.getElementById(
      "joinMessage"
    );


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


  myTeamId =
    user.uid;


  const teamRef =
    ref(
      db,
      "teams/" +
      myTeamId
    );


  const snapshot =
    await get(teamRef);


  if (!snapshot.exists()) {

    await set(
      teamRef,
      {

        name: name,

        budget:
          STARTING_BUDGET,

        players: [],

        joinedAt:
          Date.now()

      }
    );

  }


  document
    .getElementById("joinScreen")
    .style.display = "none";


  document
    .getElementById("gameScreen")
    .style.display = "block";


  const teamSnapshot =
    await get(teamRef);

  const team =
    teamSnapshot.val();


  document
    .getElementById("myTeam")
    .textContent =
      team.name;


  startRealtimeListeners();

};


// =====================================================
// REALTIME LISTENERS
// =====================================================

function startRealtimeListeners() {

  if (listenersStarted) return;

  listenersStarted = true;


  onValue(
    ref(db, "auction"),
    snapshot => {

      const auction =
        snapshot.val();


      if (!auction) {

        createAuction();

        return;

      }


      displayAuction(
        auction
      );

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
// CREATE AUCTION
// =====================================================

async function createAuction() {

  const auctionRef =
    ref(db, "auction");


  const snapshot =
    await get(
      auctionRef
    );


  if (snapshot.exists()) {

    return;

  }


  await set(
    auctionRef,
    {

      characterIndex: 0,

      currentBid:
        STARTING_BID,

      highestBidder: null,

      highestBidderName: null,

      status: "OPEN",

      characterOrder:
        shuffleCharacters()
          .map(c => c.name)

    }
  );

}


// =====================================================
// GET CURRENT CHARACTER
// =====================================================

function getCurrentCharacter(
  auction
) {

  const order =
    auction.characterOrder;


  if (
    !order ||
    !Array.isArray(order)
  ) {

    return characters[
      Number(
        auction.characterIndex || 0
      )
    ];

  }


  const name =
    order[
      Number(
        auction.characterIndex || 0
      )
    ];


  return characters.find(
    c => c.name === name
  );

}


// =====================================================
// DISPLAY AUCTION
// =====================================================

function displayAuction(
  auction
) {

  const character =
    getCurrentCharacter(
      auction
    );


  if (!character) {

    document
      .getElementById(
        "characterName"
      )
      .textContent =
        "🏆 Auction Finished";

    document
      .getElementById(
        "characterInfo"
      )
      .textContent =
        "All characters have been auctioned.";

    return;

  }


  document
    .getElementById(
      "characterName"
    )
    .textContent =
      character.name;


  document
    .getElementById(
      "characterInfo"
    )
    .textContent =
      character.info;


  document
    .getElementById(
      "currentBid"
    )
    .textContent =
      formatMoney(
        Number(
          auction.currentBid || 0
        )
      );


  document
    .getElementById(
      "highestBidder"
    )
    .textContent =
      auction.highestBidderName
        ? "Highest bidder: " +
          auction.highestBidderName
        : "No bids yet";


  if (
    auction.status === "SOLD"
  ) {

    if (
      Number(auction.currentBid) === 0
    ) {

      showMessage(
        "🎁 FREE to " +
        auction.highestBidderName
      );

    }

    else {

      showMessage(
        "🔨 SOLD to " +
        auction.highestBidderName
      );

    }

  }


  if (
    auction.status === "FINISHED"
  ) {

    showMessage(
      "🏆 Auction Finished!"
    );

  }

}


// =====================================================
// BID
// =====================================================

window.placeBid =
async function () {

  if (!myTeamId) {

    return;

  }


  const auctionSnapshot =
    await get(
      ref(db, "auction")
    );


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
      ref(
        db,
        "teams/" +
        myTeamId
      )
    );


  const team =
    teamSnapshot.val();


  if (!team) return;


  const players =
    team.players || [];


  if (
    players.length >=
    MAX_PLAYERS
  ) {

    showMessage(
      "❌ You already have 4 characters!"
    );

    return;

  }


  if (
    Number(team.budget) <= 0
  ) {

    showMessage(
      "🎁 You have ₹0. " +
      "The next character will be FREE for you."
    );

    return;

  }


  const currentBid =
    Number(
      auction.currentBid
    );


  const increment =
    currentBid < 1000
      ? SMALL_INCREMENT
      : BIG_INCREMENT;


  const newBid =
    currentBid + increment;


  if (
    newBid >
    Number(team.budget)
  ) {

    showMessage(
      "❌ Not enough budget!"
    );

    return;

  }


  const result =
    await runTransaction(
      ref(db, "auction"),
      current => {

        if (!current) return;

        if (
          current.status !==
          "OPEN"
        ) {

          return;

        }


        if (
          Number(
            current.currentBid
          ) !== currentBid
        ) {

          return;

        }


        return {

          ...current,

          currentBid:
            newBid,

          highestBidder:
            myTeamId,

          highestBidderName:
            team.name

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

window.sellPlayer =
async function () {

  const snapshot =
    await get(
      ref(db, "auction")
    );


  const auction =
    snapshot.val();


  if (
    !auction ||
    auction.status !== "OPEN"
  ) {

    showMessage(
      "❌ Auction is not open."
    );

    return;

  }


  if (
    !auction.highestBidder
  ) {

    showMessage(
      "❌ No bidder."
    );

    return;

  }


  await finalizeSale(
    auction
  );

};


// =====================================================
// FINALIZE SALE
// =====================================================

async function finalizeSale(
  auction
) {

  const winnerId =
    auction.highestBidder;


  const winnerRef =
    ref(
      db,
      "teams/" +
      winnerId
    );


  const snapshot =
    await get(
      winnerRef
    );


  const winner =
    snapshot.val();


  if (!winner) return;


  const character =
    getCurrentCharacter(
      auction
    );


  if (!character) return;


  const players =
    winner.players || [];


  if (
    players.length >=
    MAX_PLAYERS
  ) {

    showMessage(
      "❌ Winner already has 4 characters."
    );

    return;

  }


  const price =
    Number(
      auction.currentBid || 0
    );


  if (
    price >
    Number(winner.budget)
  ) {

    showMessage(
      "❌ Winner does not have enough money."
    );

    return;

  }


  players.push({

    name:
      character.name,

    price: price

  });


  await update(
    winnerRef,
    {

      budget:
        Number(winner.budget) -
        price,

      players:
        players

    }
  );


  await update(
    ref(db, "auction"),
    {

      status: "SOLD"

    }
  );


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

      character:
        character.name,

      team:
        winner.name,

      price:
        price,

      time:
        Date.now(),

      free:
        price === 0

    }
  );


  showMessage(
    price === 0
      ? "🎁 " +
        character.name +
        " FREE to " +
        winner.name
      : "🔨 " +
        character.name +
        " SOLD to " +
        winner.name
  );

}


// =====================================================
// FREE CHARACTER
// =====================================================

async function findFreeTeam() {

  const snapshot =
    await get(
      ref(db, "teams")
    );


  const teams =
    snapshot.val() || {};


  const eligible =
    Object.entries(teams)

      .filter(
        ([id, team]) => {

          return (
            Number(
              team.budget || 0
            ) <= 0 &&
            (team.players || [])
              .length < MAX_PLAYERS
          );

        }
      )

      .sort(
        (a, b) => {

          const playersA =
            (a[1].players || [])
              .length;

          const playersB =
            (b[1].players || [])
              .length;


          if (
            playersA !== playersB
          ) {

            return (
              playersA -
              playersB
            );

          }


          return (
            Number(
              a[1].joinedAt || 0
            ) -
            Number(
              b[1].joinedAt || 0
            )
          );

        }
      );


  if (
    eligible.length === 0
  ) {

    return null;

  }


  return {

    id:
      eligible[0][0],

    team:
      eligible[0][1]

  };

}


// =====================================================
// NEXT PLAYER
// =====================================================

window.nextPlayer =
async function () {

  const auctionRef =
    ref(db, "auction");


  const snapshot =
    await get(
      auctionRef
    );


  const auction =
    snapshot.val();


  if (!auction) return;


  if (
    auction.status !==
    "SOLD"
  ) {

    showMessage(
      "❌ Sell the current character first."
    );

    return;

  }


  const nextIndex =
    Number(
      auction.characterIndex
    ) + 1;


  if (
    nextIndex >=
    auction.characterOrder.length
  ) {

    await update(
      auctionRef,
      {

        characterIndex:
          nextIndex,

        currentBid:
          0,

        highestBidder:
          null,

        highestBidderName:
          null,

        status:
          "FINISHED"

      }
    );


    showMessage(
      "🏆 Auction Finished!"
    );

    return;

  }


  // -----------------------------------------
  // NEXT CHARACTER
  // -----------------------------------------

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
        "OPEN",

      freeCharacter:
        false

    }
  );


  // -----------------------------------------
  // FREE CHARACTER
  // -----------------------------------------

  const freeTeam =
    await findFreeTeam();


  if (!freeTeam) return;


  const freeSnapshot =
    await get(
      auctionRef
    );


  const freeAuction =
    freeSnapshot.val();


  if (
    !freeAuction ||
    freeAuction.status !== "OPEN" ||
    freeAuction.highestBidder
  ) {

    return;

  }


  const claimResult =
    await runTransaction(
      auctionRef,
      current => {

        if (!current) return;

        if (
          current.status !==
          "OPEN"
        ) return;

        if (
          current.highestBidder
        ) return;

        if (
          Number(
            current.characterIndex
          ) !== nextIndex
        ) return;

        return {

          ...current,

          currentBid:
            0,

          highestBidder:
            freeTeam.id,

          highestBidderName:
            freeTeam.team.name,

          status:
            "SOLD",

          freeCharacter:
            true

        };

      }
    );


  if (
    !claimResult.committed
  ) {

    return;

  }


  // -----------------------------------------
  // ADD FREE CHARACTER
  // -----------------------------------------

  const teamRef =
    ref(
      db,
      "teams/" +
      freeTeam.id
    );


  const latestSnapshot =
    await get(
      teamRef
    );


  const latestTeam =
    latestSnapshot.val();


  if (!latestTeam) return;


  const players =
    latestTeam.players || [];


  if (
    players.length >=
    MAX_PLAYERS
  ) {

    return;

  }


  players.push({

    name:
      getCurrentCharacter(
        freeAuction
      ).name,

    price:
      0

  });


  await update(
    teamRef,
    {

      budget:
        0,

      players:
        players

    }
  );


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
        getCurrentCharacter(
          freeAuction
        ).name,

      team:
        latestTeam.name,

      price:
        0,

      time:
        Date.now(),

      free:
        true

    }
  );

};


// =====================================================
// CHARACTER POWER SCORE
// =====================================================

function calculateCharacterScore(
  player
) {

  const character =
    characters.find(
      c =>
        c.name ===
        player.name
    );


  if (!character) return 0;


  return (
    character.power * 0.25 +
    character.attack * 0.15 +
    character.defense * 0.15 +
    character.speed * 0.10 +
    character.hax * 0.15 +
    character.intelligence * 0.10 +
    character.synergy * 0.10
  );

}


// =====================================================
// TEAM SCORE
// =====================================================

function calculateTeamScore(
  team
) {

  const players =
    team.players || [];


  if (
    players.length === 0
  ) {

    return 0;

  }


  const scores =
    players.map(
      player =>
        calculateCharacterScore(
          player
        )
    );


  const totalPower =
    scores.reduce(
      (sum, score) =>
        sum + score,
      0
    );


  const averagePower =
    totalPower /
    players.length;


  const strongest =
    Math.max(
      ...scores
    );


  const sortedScores =
    [...scores]
      .sort(
        (a, b) =>
          b - a
      );


  const depth =
    sortedScores
      .slice(
        0,
        MAX_PLAYERS
      )
      .reduce(
        (sum, score) =>
          sum + score,
        0
      );


  const finalScore =
    strongest * 0.25 +
    totalPower * 0.35 +
    averagePower * 0.20 +
    depth * 0.20;


  return Number(
    finalScore.toFixed(2)
  );

}


// =====================================================
// RANK TEAMS
// =====================================================

function rankTeams(
  teams
) {

  return Object.entries(
    teams
  )

    .map(
      ([id, team]) => ({

        id:

          id,

        name:

          team.name,

        players:

          team.players || [],

        budget:

          Number(
            team.budget || 0
          ),

        score:

          calculateTeamScore(
            team
          )

      })
    )

    .sort(
      (a, b) =>
        b.score -
        a.score
    );

}


// =====================================================
// DISPLAY TEAMS
// =====================================================

function displayTeams(
  teams
) {

  const container =
    document.getElementById(
      "teams"
    );


  if (!container) return;


  container.innerHTML =
    "";


  const rankedTeams =
    rankTeams(
      teams
    );


  rankedTeams.forEach(
    (team, index) => {

      const div =
        document.createElement(
          "div"
        );


      div.className =
        "team";


      let medal =
        "🏅";


      if (
        index === 0
      ) medal = "🥇";


      else if (
        index === 1
      ) medal = "🥈";


      else if (
        index === 2
      ) medal = "🥉";


      const players =
        team.players || [];


      div.innerHTML = `

        <div class="team-name">

          ${medal}
          #${index + 1}

          ${escapeHTML(
            team.name
          )}

        </div>

        <div>

          ⭐ Power Score:
          <b>
            ${team.score}/100
          </b>

        </div>

        <div>

          💰 Budget:
          <b>
            ${formatMoney(
              team.budget
            )}
          </b>

        </div>

        <div>

          👥 Players:
          ${players.length}
          / ${MAX_PLAYERS}

        </div>

        <hr>

        ${
          players.length

            ? players
                .map(
                  player => `

                    <div>

                      ⚔️
                      ${escapeHTML(
                        player.name
                      )}

                      —
                      ${formatMoney(
                        player.price
                      )}

                    </div>

                  `
                )
                .join("")

            : "<div>No players</div>"
        }

      `;


      container.appendChild(
        div
      );

    }
  );


  // -----------------------------------------
  // MY TEAM
  // -----------------------------------------

  if (
    myTeamId &&
    teams[myTeamId]
  ) {

    const myTeam =
      teams[myTeamId];


    document
      .getElementById(
        "myTeam"
      )
      .textContent =
        myTeam.name;


    document
      .getElementById(
        "myBudget"
      )
      .textContent =
        formatMoney(
          Number(
            myTeam.budget
          )
        );


    document
      .getElementById(
        "myPlayers"
      )
      .textContent =
        `${(
          myTeam.players || []
        ).length} / ${MAX_PLAYERS}`;

  }

}


// =====================================================
// HISTORY
// =====================================================

function displayHistory(
  history
) {

  const container =
    document.getElementById(
      "history"
    );


  if (!container) return;


  container.innerHTML =
    "";


  const entries =
    Object.values(
      history
    )
      .sort(
        (a, b) =>
          Number(
            b.time || 0
          ) -
          Number(
            a.time || 0
          )
      );


  entries.forEach(
    item => {

      const div =
        document.createElement(
          "div"
        );


      div.className =
        "history-item";


      if (
        Number(item.price) === 0
      ) {

        div.innerHTML = `

          🎁 <b>
            ${escapeHTML(
              item.character
            )}
          </b>

          went FREE to

          <b>
            ${escapeHTML(
              item.team
            )}
          </b>

        `;

      }

      else {

        div.innerHTML = `

          🔨 <b>
            ${escapeHTML(
              item.character
            )}
          </b>

          sold to

          <b>
            ${escapeHTML(
              item.team
            )}
          </b>

          for

          <b>
            ${formatMoney(
              item.price
            )}
          </b>

        `;

      }


      container.appendChild(
        div
      );

    }
  );

}


// =====================================================
// RESTART AUCTION
// =====================================================

window.restartAuction =
async function () {

  const confirmed =
    confirm(
      "⚠️ RESTART AUCTION?\n\n" +
      "All teams, players, budgets " +
      "and history will be reset."
    );


  if (!confirmed) return;


  try {

    // -----------------------------------------
    // GET TEAMS
    // -----------------------------------------

    const snapshot =
      await get(
        ref(db, "teams")
      );


    const teams =
      snapshot.val() || {};


    // -----------------------------------------
    // RESET TEAMS
    // -----------------------------------------

    const updates =
      {};


    Object.keys(
      teams
    ).forEach(
      teamId => {

        updates[
          "teams/" +
          teamId +
          "/budget"
        ] =
          STARTING_BUDGET;


        updates[
          "teams/" +
          teamId +
          "/players"
        ] =
          [];

      }
    );


    if (
      Object.keys(updates)
        .length > 0
    ) {

      await update(
        ref(db),
        updates
      );

    }


    // -----------------------------------------
    // NEW RANDOM ORDER
    // -----------------------------------------

    const newOrder =
      shuffleCharacters()
        .map(
          c => c.name
        );


    // -----------------------------------------
    // RESET AUCTION
    // -----------------------------------------

    await set(
      ref(db, "auction"),
      {

        characterIndex:
          0,

        currentBid:
          STARTING_BID,

        highestBidder:
          null,

        highestBidderName:
          null,

        status:
          "OPEN",

        characterOrder:
          newOrder

      }
    );


    // -----------------------------------------
    // CLEAR HISTORY
    // -----------------------------------------

    await set(
      ref(db, "history"),
      null
    );


    alert(
      "✅ AUCTION RESTARTED!\n\n" +
      "Players cleared.\n" +
      "Budgets reset to ₹20 Cr.\n" +
      "Characters shuffled."
    );


    location.reload();

  }

  catch (error) {

    console.error(
      "Restart error:",
      error
    );


    alert(
      "❌ Restart failed:\n\n" +
      error.message
    );

  }

};


// =====================================================
// MONEY
// =====================================================

function formatMoney(
  lakhs
) {

  const amount =
    Number(lakhs || 0);


  if (
    amount >= 100
  ) {

    const crore =
      amount / 100;


    return "₹" +
      (
        Number.isInteger(
          crore
        )
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

function showMessage(
  message
) {

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

function escapeHTML(
  text
) {

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
// MAKE FUNCTIONS AVAILABLE TO HTML
// =====================================================

window.joinAuction =
  window.joinAuction;

window.placeBid =
  window.placeBid;

window.sellPlayer =
  window.sellPlayer;

window.nextPlayer =
  window.nextPlayer;

window.restartAuction =
  window.restartAuction;