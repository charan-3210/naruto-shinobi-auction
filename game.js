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
  apiKey: "AIzaSyB4PSLZ0VhVGGtfZ1hcluOWsTbvJDxxxTg",
  authDomain: "naruto-shinobi-auction.firebaseapp.com",
  databaseURL: "https://naruto-shinobi-auction-default-rtdb.firebaseio.com",
  projectId: "naruto-shinobi-auction",
  storageBucket: "naruto-shinobi-auction.firebasestorage.app",
  messagingSenderId: "187952563869",
  appId: "1:187952563869:web:839ac2add9ae0f5835f674",
  measurementId: "G-N3QGHDB240"
};


// =====================================================
// FIREBASE
// =====================================================

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

let user = null;
let myTeamId = null;
let listenersStarted = false;
let timerInterval = null;
let finishingAuction = false;
let movingNext = false;


// =====================================================
// AUCTION SETTINGS
// =====================================================

const STARTING_BUDGET = 2000; // ₹20 Cr
const MAX_PLAYERS = 4;

const STARTING_BID = 100;      // ₹1 Cr
const SMALL_INCREMENT = 50;    // ₹50 L
const BIG_INCREMENT = 100;     // ₹1 Cr

const AUCTION_SECONDS = 10;


// =====================================================
// CHARACTERS
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
    info: "Divine Weapons • Otsutsuki Warrior",
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
// SHUFFLE
// =====================================================

function shuffleCharacters() {

  const list = [...characters];

  for (let i = list.length - 1; i > 0; i--) {

    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [
      list[i],
      list[j]
    ] = [
      list[j],
      list[i]
    ];

  }

  return list;
}


// =====================================================
// AUTH
// =====================================================

signInAnonymously(auth)
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
// JOIN
// =====================================================

window.joinAuction = async function () {

  const input =
    document.getElementById(
      "teamName"
    );

  const message =
    document.getElementById(
      "joinMessage"
    );

  if (!input || !message)
    return;

  const name =
    input.value.trim();

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

  try {

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

    } else {

      await update(
        teamRef,
        {
          name: name
        }
      );

    }

    document
      .getElementById(
        "joinScreen"
      )
      .style.display =
        "none";

    document
      .getElementById(
        "gameScreen"
      )
      .style.display =
        "block";

    document
      .getElementById(
        "myTeam"
      )
      .textContent =
        name;

    startRealtimeListeners();

  }

  catch (error) {

    console.error(
      "Join error:",
      error
    );

    message.textContent =
      "❌ Could not join: " +
      error.message;

  }

};


// =====================================================
// REALTIME LISTENERS
// =====================================================

function startRealtimeListeners() {

  if (listenersStarted)
    return;

  listenersStarted = true;


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

      displayAuction(
        auction
      );

      startCountdown(
        auction
      );

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
// CREATE FIRST AUCTION
// =====================================================

async function createAuction() {

  const auctionRef =
    ref(db, "auction");

  const snapshot =
    await get(
      auctionRef
    );

  if (snapshot.exists())
    return;

  const order =
    shuffleCharacters()
      .map(
        character =>
          character.name
      );

  await set(
    auctionRef,
    {

      characterIndex: 0,

      characterOrder:
        order,

      currentBid:
        STARTING_BID,

      highestBidder:
        null,

      highestBidderName:
        null,

      status:
        "OPEN",

      endTime:
        Date.now() +
        AUCTION_SECONDS * 1000

    }
  );

}


// =====================================================
// CURRENT CHARACTER
// =====================================================

function getCurrentCharacter(
  auction
) {

  if (
    auction &&
    Array.isArray(
      auction.characterOrder
    )
  ) {

    const index =
      Number(
        auction.characterIndex || 0
      );

    const name =
      auction.characterOrder[index];

    return characters.find(
      character =>
        character.name === name
    );

  }

  return null;
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

  const nameElement =
    document.getElementById(
      "characterName"
    );

  const infoElement =
    document.getElementById(
      "characterInfo"
    );

  const bidElement =
    document.getElementById(
      "currentBid"
    );

  const bidderElement =
    document.getElementById(
      "highestBidder"
    );

  const bidButton =
    document.querySelector(
      ".bid-button"
    );


  if (!character) {

    if (nameElement)
      nameElement.textContent =
        "🏆 Auction Finished";

    if (infoElement)
      infoElement.textContent =
        "All characters have been auctioned.";

    if (bidElement)
      bidElement.textContent =
        "₹0";

    if (bidButton)
      bidButton.disabled =
        true;

    stopCountdown();

    return;
  }


  if (nameElement)
    nameElement.textContent =
      character.name;


  if (infoElement)
    infoElement.textContent =
      character.info;


  if (bidElement)
    bidElement.textContent =
      formatMoney(
        Number(
          auction.currentBid || 0
        )
      );


  if (bidderElement) {

    bidderElement.textContent =
      auction.highestBidderName
        ? "Highest bidder: " +
          auction.highestBidderName
        : "No bids yet";

  }


  if (bidButton) {

    bidButton.disabled =
      auction.status !== "OPEN";

  }


  if (
    auction.status ===
    "SOLD"
  ) {

    showMessage(
      "🏆 " +
      auction.highestBidderName +
      " won " +
      character.name
    );

  }


  if (
    auction.status ===
    "SKIPPED"
  ) {

    showMessage(
      "⏭️ No bids — " +
      character.name +
      " skipped"
    );

  }


  if (
    auction.status ===
    "FINISHED"
  ) {

    showMessage(
      "🏆 Auction Finished!"
    );

  }

}


// =====================================================
// COUNTDOWN
// =====================================================

function startCountdown(
  auction
) {

  stopCountdown();

  const timer =
    document.getElementById(
      "auctionTimer"
    );

  if (!timer)
    return;


  if (
    auction.status !==
    "OPEN"
  ) {

    timer.textContent =
      "⏱️ —";

    return;
  }


  function tick() {

    const remaining =
      Math.max(
        0,
        Number(
          auction.endTime || 0
        ) -
        Date.now()
      );


    const seconds =
      Math.ceil(
        remaining / 1000
      );


    timer.textContent =
      "⏱️ " +
      seconds +
      "s";


    if (
      remaining <= 0
    ) {

      stopCountdown();

      automaticallyFinishAuction();

    }

  }


  tick();


  timerInterval =
    setInterval(
      tick,
      200
    );

}


// =====================================================
// STOP TIMER
// =====================================================

function stopCountdown() {

  if (timerInterval) {

    clearInterval(
      timerInterval
    );

    timerInterval =
      null;

  }

}


// =====================================================
// AUTOMATIC FINISH
// =====================================================

async function automaticallyFinishAuction() {

  if (finishingAuction)
    return;

  finishingAuction =
    true;

  try {

    const auctionRef =
      ref(
        db,
        "auction"
      );


    /*
     * IMPORTANT:
     * Transaction changes OPEN → FINALIZING.
     *
     * Only ONE phone can successfully
     * claim the auction.
     */

    const result =
      await runTransaction(
        auctionRef,
        current => {

          if (!current)
            return;

          if (
            current.status !==
            "OPEN"
          )
            return;

          if (
            Date.now() <
            Number(
              current.endTime || 0
            )
          )
            return;

          return {
            ...current,
            status:
              "FINALIZING"
          };

        }
      );


    if (!result.committed)
      return;


    const auction =
      result.snapshot.val();


    if (
      auction.highestBidder
    ) {

      await finalizeSale(
        auction
      );

    } else {

      await finishWithoutBid(
        auction
      );

    }

  }

  catch (error) {

    console.error(
      "Automatic finish error:",
      error
    );

  }

  finally {

    finishingAuction =
      false;

  }

}


// =====================================================
// AUTOMATIC SALE
// =====================================================

async function finalizeSale(
  auction
) {

  const winnerId =
    auction.highestBidder;

  const character =
    getCurrentCharacter(
      auction
    );


  if (!winnerId || !character)
    return;


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


  if (!winner)
    return;


  const players =
    Array.isArray(
      winner.players
    )
      ? winner.players
      : [];


  const budget =
    Number(
      winner.budget || 0
    );


  const price =
    Number(
      auction.currentBid || 0
    );


  if (
    players.length >=
    MAX_PLAYERS
  ) {

    await update(
      ref(db, "auction"),
      {
        status:
          "SKIPPED"
      }
    );

    setTimeout(
      nextCharacter,
      1000
    );

    return;
  }


  if (
    price >
    budget
  ) {

    await update(
      ref(db, "auction"),
      {
        status:
          "SKIPPED"
      }
    );

    setTimeout(
      nextCharacter,
      1000
    );

    return;
  }


  players.push({

    name:
      character.name,

    price:
      price

  });


  await update(
    winnerRef,
    {

      budget:
        budget - price,

      players:
        players

    }
  );


  await update(
    ref(db, "auction"),
    {

      status:
        "SOLD"

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
        false

    }
  );


  showMessage(
    "🏆 " +
    character.name +
    " → " +
    winner.name +
    " for " +
    formatMoney(price)
  );


  /*
   * Automatically go to next character.
   */

  setTimeout(
    nextCharacter,
    1200
  );

}


// =====================================================
// NO BID
// =====================================================

async function finishWithoutBid(
  auction
) {

  const character =
    getCurrentCharacter(
      auction
    );


  if (!character)
    return;


  /*
   * IMPORTANT:
   * No free player.
   *
   * If nobody bids for 10 seconds,
   * the character is simply skipped.
   */

  await update(
    ref(db, "auction"),
    {

      status:
        "SKIPPED",

      currentBid:
        STARTING_BID,

      highestBidder:
        null,

      highestBidderName:
        null

    }
  );


  showMessage(
    "⏭️ No bids — " +
    character.name +
    " skipped"
  );


  setTimeout(
    nextCharacter,
    1000
  );

}


// =====================================================
// NEXT CHARACTER
// =====================================================

async function nextCharacter() {

  if (movingNext)
    return;

  movingNext =
    true;


  try {

    const auctionRef =
      ref(
        db,
        "auction"
      );


    const result =
      await runTransaction(
        auctionRef,
        current => {

          if (!current)
            return;

          if (
            current.status !==
              "SOLD" &&
            current.status !==
              "SKIPPED"
          )
            return;


          const nextIndex =
            Number(
              current.characterIndex || 0
            ) + 1;


          const order =
            current.characterOrder ||
            [];


          if (
            nextIndex >=
            order.length
          ) {

            return {

              ...current,

              characterIndex:
                nextIndex,

              currentBid:
                0,

              highestBidder:
                null,

              highestBidderName:
                null,

              status:
                "FINISHED",

              endTime:
                0

            };

          }


          return {

            ...current,

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

            endTime:
              Date.now() +
              AUCTION_SECONDS * 1000

          };

        }
      );


    if (
      result.committed
    ) {

      const newAuction =
        result.snapshot.val();


      if (
        newAuction.status ===
        "FINISHED"
      ) {

        showMessage(
          "🏆 AUCTION FINISHED!"
        );

      }

    }

  }

  catch (error) {

    console.error(
      "Next character error:",
      error
    );

  }

  finally {

    movingNext =
      false;

  }

}


// =====================================================
// BID
// =====================================================

window.placeBid =
async function () {

  if (!myTeamId) {

    showMessage(
      "❌ Join the game first."
    );

    return;

  }


  const auctionSnapshot =
    await get(
      ref(
        db,
        "auction"
      )
    );


  const auction =
    auctionSnapshot.val();


  if (
    !auction ||
    auction.status !==
    "OPEN"
  ) {

    showMessage(
      "❌ Auction is not open."
    );

    return;

  }


  if (
    Date.now() >=
    Number(
      auction.endTime || 0
    )
  ) {

    await automaticallyFinishAuction();

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


  if (!team)
    return;


  const players =
    Array.isArray(
      team.players
    )
      ? team.players
      : [];


  if (
    players.length >=
    MAX_PLAYERS
  ) {

    showMessage(
      "❌ You already have 4 characters."
    );

    return;

  }


  const budget =
    Number(
      team.budget || 0
    );


  if (
    budget <= 0
  ) {

    showMessage(
      "❌ Your budget is ₹0. You cannot bid."
    );

    return;

  }


  const currentBid =
    Number(
      auction.currentBid || 0
    );


  /*
   * ₹1 Cr → ₹1.5 Cr → ₹2 Cr...
   * Up to ₹10 Cr in 50L increments.
   *
   * After ₹10 Cr:
   * increase by ₹1 Cr.
   */

  const increment =
    currentBid < 1000
      ? SMALL_INCREMENT
      : BIG_INCREMENT;


  const newBid =
    currentBid +
    increment;


  if (
    newBid >
    budget
  ) {

    showMessage(
      "❌ Not enough budget for this bid."
    );

    return;

  }


  const auctionRef =
    ref(
      db,
      "auction"
    );


  /*
   * Transaction prevents two phones
   * from making the same bid at once.
   */

  const result =
    await runTransaction(
      auctionRef,
      current => {

        if (!current)
          return;

        if (
          current.status !==
          "OPEN"
        )
          return;

        if (
          Date.now() >=
          Number(
            current.endTime || 0
          )
        )
          return;

        if (
          Number(
            current.currentBid || 0
          ) !==
          currentBid
        )
          return;

        return {

          ...current,

          currentBid:
            newBid,

          highestBidder:
            myTeamId,

          highestBidderName:
            team.name,

          /*
           * Every successful bid
           * resets the 10 second timer.
           */

          endTime:
            Date.now() +
            AUCTION_SECONDS * 1000

        };

      }
    );


  if (
    !result.committed
  ) {

    showMessage(
      "⚠️ Another player bid first."
    );

    return;

  }


  showMessage(
    "🔥 " +
    formatMoney(newBid) +
    " • Timer reset to 10s"
  );

};


// =====================================================
// START NEW GAME
// =====================================================

window.restartAuction =
async function () {

  const confirmed =
    confirm(
      "⚠️ START NEW GAME?\n\n" +
      "All players and auction history " +
      "will be erased.\n\n" +
      "Every team gets ₹20 Cr again."
    );


  if (!confirmed)
    return;


  try {

    /*
     * Get current teams.
     */

    const teamsSnapshot =
      await get(
        ref(db, "teams")
      );


    const teams =
      teamsSnapshot.val() ||
      {};


    const updates =
      {};


    /*
     * Reset every team.
     */

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


    /*
     * Clear old history.
     */

    updates["history"] =
      null;


    /*
     * New random character order.
     */

    const newOrder =
      shuffleCharacters()
        .map(
          character =>
            character.name
        );


    /*
     * New auction.
     */

    updates["auction"] = {

      characterIndex:
        0,

      characterOrder:
        newOrder,

      currentBid:
        STARTING_BID,

      highestBidder:
        null,

      highestBidderName:
        null,

      status:
        "OPEN",

      endTime:
        Date.now() +
        AUCTION_SECONDS * 1000

    };


    await update(
      ref(db),
      updates
    );


    stopCountdown();


    showMessage(
      "🔄 NEW GAME STARTED!"
    );

  }

  catch (error) {

    console.error(
      "Restart error:",
      error
    );


    alert(
      "❌ Restart failed:\n" +
      error.message
    );

  }

};


// =====================================================
// CHARACTER SCORE
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


  if (!character)
    return 0;


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
    Array.isArray(
      team.players
    )
      ? team.players
      : [];


  if (
    players.length === 0
  )
    return 0;


  const scores =
    players.map(
      calculateCharacterScore
    );


  const total =
    scores.reduce(
      (a, b) =>
        a + b,
      0
    );


  const average =
    total /
    scores.length;


  const strongest =
    Math.max(
      ...scores
    );


  const final =
    strongest * 0.25 +
    total * 0.35 +
    average * 0.20 +
    Math.min(
      total,
      400
    ) * 0.20;


  return Number(
    final.toFixed(2)
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


  if (!container)
    return;


  container.innerHTML =
    "";


  const ranked =
    Object.entries(
      teams
    )
      .map(
        ([id, team]) => ({

          id:
            id,

          name:
            team.name ||
            "Unnamed Team",

          budget:
            Number(
              team.budget || 0
            ),

          players:
            Array.isArray(
              team.players
            )
              ? team.players
              : [],

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


  ranked.forEach(
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
      )
        medal =
          "🥇";

      else if (
        index === 1
      )
        medal =
          "🥈";

      else if (
        index === 2
      )
        medal =
          "🥉";


      div.innerHTML = `

        <div class="team-name">
          ${medal}
          #${index + 1}
          ${escapeHTML(team.name)}
        </div>

        <div>
          ⭐ Power:
          <b>
            ${team.score}
          </b>
        </div>

        <div>
          💰 Budget:
          <b>
            ${formatMoney(team.budget)}
          </b>
        </div>

        <div>
          👥 Players:
          ${team.players.length}/${MAX_PLAYERS}
        </div>

        <hr>

        ${
          team.players.length

            ? team.players
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


  /*
   * Update MY TEAM display.
   */

  if (
    myTeamId &&
    teams[myTeamId]
  ) {

    const mine =
      teams[myTeamId];


    const myTeam =
      document.getElementById(
        "myTeam"
      );

    const myBudget =
      document.getElementById(
        "myBudget"
      );

    const myPlayers =
      document.getElementById(
        "myPlayers"
      );


    if (myTeam)
      myTeam.textContent =
        mine.name;


    if (myBudget)
      myBudget.textContent =
        formatMoney(
          mine.budget
        );


    if (myPlayers)
      myPlayers.textContent =
        `${(
          mine.players || []
        ).length}/${MAX_PLAYERS}`;

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


  if (!container)
    return;


  container.innerHTML =
    "";


  const items =
    Object.values(
      history
    )
      .sort(
        (a, b) =>
          Number(b.time || 0) -
          Number(a.time || 0)
      );


  if (
    items.length === 0
  ) {

    container.innerHTML =
      "No history yet.";

    return;

  }


  items.forEach(
    item => {

      const div =
        document.createElement(
          "div"
        );


      div.className =
        "history-item";


      div.innerHTML = `

        🔨
        <b>
          ${escapeHTML(
            item.character
          )}
        </b>

        →

        <b>
          ${escapeHTML(
            item.team
          )}
        </b>

        →

        ${formatMoney(
          item.price
        )}

      `;


      container.appendChild(
        div
      );

    }
  );

}


// =====================================================
// MONEY
// =====================================================

function formatMoney(
  lakhs
) {

  const amount =
    Number(
      lakhs || 0
    );


  if (
    amount >= 100
  ) {

    const crore =
      amount / 100;


    return (
      "₹" +
      (
        Number.isInteger(
          crore
        )
          ? crore
          : crore.toFixed(2)
      ) +
      " Cr"
    );

  }


  return (
    "₹" +
    amount +
    " L"
  );

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
// ESCAPE HTML
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