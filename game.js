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
  runTransaction,
  remove
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
  apiKey: "YOUR_COMPLETE_API_KEY",
  authDomain: "naruto-shinobi-auction.firebaseapp.com",
  databaseURL: "https://naruto-shinobi-auction-default-rtdb.firebaseio.com",
  projectId: "naruto-shinobi-auction",
  storageBucket: "naruto-shinobi-auction.firebasestorage.app",
  messagingSenderId: "187952563869",
  appId: "1:187952563869:web:839ac2add9ae0f5835f674",
  measurementId: "G-N3QGHDB240"
};

// =====================================================
// FIREBASE INITIALIZATION
// =====================================================

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

const auth = getAuth(app);


// =====================================================
// VARIABLES
// =====================================================

let user = null;

let roomCode = null;

let myTeamId = null;

let isHost = false;

let timerInterval = null;

let finishing = false;


// =====================================================
// GAME SETTINGS
// =====================================================

const STARTING_BUDGET = 2000;

const MAX_PLAYERS = 4;

const STARTING_BID = 100;

const SMALL_INCREMENT = 50;

const BIG_INCREMENT = 100;

const AUCTION_SECONDS = 10;


// =====================================================
// CHARACTERS
// =====================================================

const characters = [

{
name:"Kaguya Otsutsuki",
info:"Rabbit Goddess • Rinne Sharingan • Ten Tails",
power:100,attack:100,defense:100,speed:90,hax:100,intelligence:90,synergy:95
},

{
name:"Hagoromo Otsutsuki",
info:"Sage of Six Paths • Rinnegan",
power:99,attack:98,defense:99,speed:90,hax:99,intelligence:100,synergy:95
},

{
name:"Hamura Otsutsuki",
info:"Byakugan • Six Paths Power",
power:96,attack:94,defense:95,speed:90,hax:95,intelligence:95,synergy:92
},

{
name:"Isshiki Otsutsuki",
info:"Sukunahikona • Daikokuten",
power:99,attack:100,defense:96,speed:100,hax:100,intelligence:98,synergy:90
},

{
name:"Momoshiki Otsutsuki",
info:"Rinnegan • Chakra Absorption",
power:96,attack:96,defense:90,speed:95,hax:98,intelligence:90,synergy:90
},

{
name:"Kinshiki Otsutsuki",
info:"Divine Weapons • Otsutsuki Warrior",
power:90,attack:95,defense:90,speed:88,hax:82,intelligence:80,synergy:85
},

{
name:"Toneri Otsutsuki",
info:"Tenseigan • Moon",
power:91,attack:92,defense:88,speed:90,hax:95,intelligence:85,synergy:85
},

{
name:"Indra Otsutsuki",
info:"Mangekyo Sharingan • Powerful Chakra",
power:94,attack:95,defense:88,speed:92,hax:95,intelligence:96,synergy:90
},

{
name:"Ashura Otsutsuki",
info:"Six Paths Chakra • Powerful Life Force",
power:94,attack:93,defense:96,speed:85,hax:90,intelligence:88,synergy:92
},

{
name:"Madara Uchiha",
info:"Ten Tails Jinchuriki • Rinne Sharingan",
power:98,attack:98,defense:97,speed:94,hax:99,intelligence:98,synergy:95
},

{
name:"Naruto Uzumaki",
info:"Six Paths Sage Mode • Seventh Hokage",
power:97,attack:97,defense:96,speed:98,hax:95,intelligence:92,synergy:98
},

{
name:"Sasuke Uchiha",
info:"Rinnegan • Eternal Mangekyo Sharingan",
power:96,attack:95,defense:90,speed:98,hax:99,intelligence:98,synergy:95
},

{
name:"Hashirama Senju",
info:"First Hokage • Sage Mode • Wood Style",
power:94,attack:94,defense:98,speed:86,hax:94,intelligence:92,synergy:96
},

{
name:"Might Guy",
info:"Eight Gates • Taijutsu Master",
power:95,attack:100,defense:80,speed:100,hax:70,intelligence:82,synergy:85
},

{
name:"Minato Namikaze",
info:"Yellow Flash • Flying Raijin",
power:92,attack:90,defense:85,speed:100,hax:96,intelligence:99,synergy:98
},

{
name:"Obito Uchiha",
info:"Ten Tails • Kamui • Sharingan",
power:94,attack:94,defense:93,speed:94,hax:100,intelligence:94,synergy:92
},

{
name:"Itachi Uchiha",
info:"Mangekyo Sharingan • Genjutsu",
power:90,attack:88,defense:82,speed:90,hax:98,intelligence:100,synergy:94
},

{
name:"Tobirama Senju",
info:"Second Hokage • Flying Raijin",
power:88,attack:87,defense:85,speed:96,hax:92,intelligence:99,synergy:96
},

{
name:"Hiruzen Sarutobi",
info:"Third Hokage • Professor",
power:85,attack:84,defense:84,speed:82,hax:85,intelligence:98,synergy:92
},

{
name:"Jiraiya",
info:"Legendary Sannin • Sage Mode",
power:86,attack:85,defense:87,speed:82,hax:88,intelligence:92,synergy:95
},

{
name:"Orochimaru",
info:"Legendary Sannin • Forbidden Jutsu",
power:87,attack:82,defense:92,speed:80,hax:94,intelligence:98,synergy:90
},

{
name:"Pain",
info:"Six Paths • Rinnegan",
power:89,attack:91,defense:90,speed:82,hax:96,intelligence:92,synergy:95
},

{
name:"Kakashi Hatake",
info:"Copy Ninja • Sharingan",
power:84,attack:82,defense:80,speed:88,hax:90,intelligence:98,synergy:96
},

{
name:"Gaara",
info:"Fifth Kazekage • Sand Manipulation",
power:80,attack:80,defense:94,speed:72,hax:82,intelligence:88,synergy:92
},

{
name:"Killer B",
info:"Eight Tails Jinchuriki • Seven Swords",
power:86,attack:90,defense:90,speed:85,hax:84,intelligence:82,synergy:88
},

{
name:"Nagato",
info:"Rinnegan • Six Paths",
power:90,attack:92,defense:90,speed:75,hax:97,intelligence:94,synergy:93
},

{
name:"Kisame Hoshigaki",
info:"Samehada • Monster of the Mist",
power:78,attack:85,defense:90,speed:72,hax:80,intelligence:80,synergy:86
},

{
name:"Deidara",
info:"Explosive Clay • C4",
power:78,attack:90,defense:70,speed:80,hax:88,intelligence:84,synergy:82
},

{
name:"Sasori",
info:"Puppet Master • Third Kazekage",
power:76,attack:82,defense:78,speed:72,hax:88,intelligence:90,synergy:86
},

{
name:"Kakuzu",
info:"Five Hearts • Earth Grudge",
power:77,attack:84,defense:91,speed:70,hax:82,intelligence:84,synergy:82
},

{
name:"Konan",
info:"Paper Ninjutsu • Akatsuki",
power:70,attack:75,defense:72,speed:78,hax:84,intelligence:86,synergy:88
},

{
name:"Hidan",
info:"Immortality • Jashin Ritual",
power:65,attack:76,defense:88,speed:65,hax:80,intelligence:60,synergy:70
},

{
name:"Shikamaru Nara",
info:"Shadow Possession • Tactical Genius",
power:65,attack:60,defense:65,speed:65,hax:82,intelligence:100,synergy:95
},

{
name:"Rock Lee",
info:"Taijutsu Specialist • Eight Gates",
power:75,attack:88,defense:72,speed:95,hax:55,intelligence:70,synergy:82
},

{
name:"Neji Hyuga",
info:"Byakugan • Gentle Fist",
power:74,attack:78,defense:75,speed:86,hax:80,intelligence:88,synergy:88
},

{
name:"Sakura Haruno",
info:"Medical Ninja • Strength of a Hundred",
power:78,attack:90,defense:88,speed:75,hax:80,intelligence:90,synergy:92
},

{
name:"Temari",
info:"Wind Style • Giant Fan",
power:68,attack:76,defense:68,speed:72,hax:75,intelligence:82,synergy:82
},

{
name:"Kankuro",
info:"Puppet Master",
power:65,attack:72,defense:68,speed:65,hax:72,intelligence:82,synergy:78
}

];


// =====================================================
// SHUFFLE
// =====================================================

function shuffle(array){

  const result=[...array];

  for(let i=result.length-1;i>0;i--){

    const j=Math.floor(Math.random()*(i+1));

    [result[i],result[j]]=[result[j],result[i]];

  }

  return result;
}


// =====================================================
// AUTH
// =====================================================

signInAnonymously(auth)
.catch(error=>{

  console.error(error);

  showMessageToAll(
    "❌ Firebase authentication error: "+
    error.code
  );

});

onAuthStateChanged(auth,currentUser=>{

  if(currentUser){
    user=currentUser;
  }

});


// =====================================================
// NAVIGATION
// =====================================================

window.showCreateRoom=function(){

  hideAll();

  document
    .getElementById("createScreen")
    .classList.remove("hidden");

};


window.showJoinRoom=function(){

  hideAll();

  document
    .getElementById("joinScreen")
    .classList.remove("hidden");

};


window.goHome=function(){

  hideAll();

  document
    .getElementById("homeScreen")
    .classList.remove("hidden");

};


function hideAll(){

  [
    "homeScreen",
    "createScreen",
    "joinScreen",
    "lobbyScreen",
    "gameScreen"
  ].forEach(id=>{

    document
      .getElementById(id)
      .classList.add("hidden");

  });

}


// =====================================================
// CREATE ROOM
// =====================================================

window.createRoom=async function(){

  const name=
    document
      .getElementById("createTeamName")
      .value.trim();

  const message=
    document.getElementById("createMessage");

  if(!name){

    message.textContent="❌ Enter your team name.";

    return;

  }

  if(!user){

    message.textContent="⏳ Connecting to Firebase...";

    return;

  }

  try{

    const code=await generateRoomCode();

    roomCode=code;

    myTeamId=user.uid;

    isHost=true;

    const roomRef=
      ref(db,"rooms/"+roomCode);

    await set(roomRef,{

      hostId:user.uid,

      status:"LOBBY",

      createdAt:Date.now(),

      auction:null

    });

    await set(
      ref(db,`rooms/${roomCode}/teams/${myTeamId}`),
      {
        name:name,
        budget:STARTING_BUDGET,
        players:[],
        joinedAt:Date.now(),
        uid:myTeamId
      }
    );

    openLobby();

    listenToRoom();

  }
  catch(error){

    console.error(error);

    message.textContent=
      "❌ "+error.message;

  }

};


// =====================================================
// GENERATE ROOM CODE
// =====================================================

async function generateRoomCode(){

  const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  for(let attempt=0;attempt<20;attempt++){

    let code="";

    for(let i=0;i<6;i++){

      code+=chars[
        Math.floor(
          Math.random()*chars.length
        )
      ];

    }

    const snap=
      await get(
        ref(db,"rooms/"+code)
      );

    if(!snap.exists())
      return code;

  }

  throw new Error("Could not create room code.");

}


// =====================================================
// JOIN ROOM
// =====================================================

window.joinRoom=async function(){

  const code=
    document
      .getElementById("joinRoomCode")
      .value
      .trim()
      .toUpperCase();

  const name=
    document
      .getElementById("joinTeamName")
      .value
      .trim();

  const message=
    document.getElementById("joinMessage");

  if(code.length!==6){

    message.textContent="❌ Enter the 6-character room code.";

    return;

  }

  if(!name){

    message.textContent="❌ Enter your team name.";

    return;

  }

  if(!user){

    message.textContent="⏳ Connecting to Firebase...";

    return;

  }

  try{

    const roomSnap=
      await get(
        ref(db,"rooms/"+code)
      );

    if(!roomSnap.exists()){

      message.textContent="❌ Room not found.";

      return;

    }

    const room=roomSnap.val();

    if(room.status!=="LOBBY"){

      message.textContent=
        "❌ This auction has already started.";

      return;

    }

    const teamsSnap=
      await get(
        ref(db,`rooms/${code}/teams`)
      );

    const teams=teamsSnap.val()||{};

    if(Object.keys(teams).length>=4){

      message.textContent=
        "❌ Room is full. Maximum 4 players.";

      return;

    }

    roomCode=code;

    myTeamId=user.uid;

    isHost=false;

    await set(
      ref(db,`rooms/${roomCode}/teams/${myTeamId}`),
      {
        name:name,
        budget:STARTING_BUDGET,
        players:[],
        joinedAt:Date.now(),
        uid:myTeamId
      }
    );

    openLobby();

    listenToRoom();

  }
  catch(error){

    console.error(error);

    message.textContent=
      "❌ "+error.message;

  }

};


// =====================================================
// LOBBY
// =====================================================

function openLobby(){

  hideAll();

  document
    .getElementById("lobbyScreen")
    .classList.remove("hidden");

  document
    .getElementById("roomCodeDisplay")
    .textContent=roomCode;

  document
    .getElementById("roomLink")
    .value=
      location.origin+
      location.pathname+
      "?room="+
      roomCode;

  document
    .getElementById("startButton")
    .style.display=
      isHost ? "block" : "none";

}


function listenToRoom(){

  onValue(
    ref(db,`rooms/${roomCode}`),
    snapshot=>{

      const room=snapshot.val();

      if(!room) return;

      if(room.status==="LOBBY"){

        showLobbyPlayers(
          room.teams||{}
        );

        return;

      }

      if(
        room.status==="PLAYING"||
        room.status==="FINISHED"
      ){

        hideAll();

        document
          .getElementById("gameScreen")
          .classList.remove("hidden");

        showLobbyPlayers(
          room.teams||{}
        );

        displayAuction(
          room.auction
        );

      }

    }
  );


  onValue(
    ref(db,`rooms/${roomCode}/teams`),
    snapshot=>{

      displayTeams(
        snapshot.val()||{}
      );

      showLobbyPlayers(
        snapshot.val()||{}
      );

    }
  );


  onValue(
    ref(db,`rooms/${roomCode}/history`),
    snapshot=>{

      displayHistory(
        snapshot.val()||{}
      );

    }
  );


  onValue(
    ref(db,`rooms/${roomCode}/auction`),
    snapshot=>{

      const auction=snapshot.val();

      if(!auction) return;

      displayAuction(auction);

      startCountdown(auction);

    }
  );

}


// =====================================================
// SHOW LOBBY PLAYERS
// =====================================================

function showLobbyPlayers(teams){

  const container=
    document.getElementById("lobbyPlayers");

  if(!container) return;

  const list=
    Object.values(teams);

  if(!list.length){

    container.textContent=
      "Waiting for players...";

    return;

  }

  container.innerHTML="";

  list
    .sort(
      (a,b)=>
        Number(a.joinedAt||0)-
        Number(b.joinedAt||0)
    )
    .forEach((team,index)=>{

      const div=
        document.createElement("div");

      div.className="player-row";

      div.innerHTML=
        `<span>👤 ${escapeHTML(team.name)}</span>
         <span>#${index+1}</span>`;

      container.appendChild(div);

    });

}


// =====================================================
// START AUCTION
// =====================================================

window.startAuction=async function(){

  if(!isHost){

    return;

  }

  try{

    const teamsSnap=
      await get(
        ref(db,`rooms/${roomCode}/teams`)
      );

    const teams=teamsSnap.val()||{};

    if(Object.keys(teams).length<1){

      return;

    }

    const order=
      shuffle(characters)
      .map(c=>c.name);

    const auction={

      characterIndex:0,

      characterOrder:order,

      currentBid:STARTING_BID,

      highestBidder:null,

      highestBidderName:null,

      status:"OPEN",

      endTime:
        Date.now()+
        AUCTION_SECONDS*1000

    };

    await update(
      ref(db,`rooms/${roomCode}`),
      {
        status:"PLAYING",
        auction:auction
      }
    );

  }
  catch(error){

    console.error(error);

    document
      .getElementById("lobbyMessage")
      .textContent=
        "❌ "+error.message;

  }

};


// =====================================================
// CURRENT CHARACTER
// =====================================================

function getCurrentCharacter(auction){

  if(!auction) return null;

  const order=
    auction.characterOrder||[];

  const index=
    Number(
      auction.characterIndex||0
    );

  const name=order[index];

  return characters.find(
    c=>c.name===name
  )||null;

}


// =====================================================
// DISPLAY AUCTION
// =====================================================

function displayAuction(auction){

  if(!auction) return;

  const character=
    getCurrentCharacter(auction);

  const name=
    document.getElementById("characterName");

  const info=
    document.getElementById("characterInfo");

  const bid=
    document.getElementById("currentBid");

  const bidder=
    document.getElementById("highestBidder");

  const button=
    document.getElementById("bidButton");

  if(
    auction.status==="FINISHED"||
    !character
  ){

    name.textContent="🏆 AUCTION FINISHED";

    info.textContent=
      "All characters have been auctioned.";

    bid.textContent="₹0";

    bidder.textContent="Game complete";

    button.disabled=true;

    stopTimer();

    return;

  }

  name.textContent=character.name;

  info.textContent=character.info;

  bid.textContent=
    formatMoney(
      Number(auction.currentBid||0)
    );

  bidder.textContent=
    auction.highestBidderName
      ? "Highest bidder: "+
        auction.highestBidderName
      : "No bids yet";

  button.disabled=
    auction.status!=="OPEN";

}


// =====================================================
// COUNTDOWN
// =====================================================

function startCountdown(auction){

  stopTimer();

  const timer=
    document.getElementById("auctionTimer");

  if(!timer) return;

  if(
    auction.status!=="OPEN"
  ){

    timer.textContent="⏱️ —";

    return;

  }

  function tick(){

    const remaining=
      Math.max(
        0,
        Number(auction.endTime||0)-
        Date.now()
      );

    const seconds=
      Math.ceil(
        remaining/1000
      );

    timer.textContent=
      "⏱️ "+seconds+"s";

    if(remaining<=0){

      stopTimer();

      finishAuction();

    }

  }

  tick();

  timerInterval=
    setInterval(tick,250);

}


function stopTimer(){

  if(timerInterval){

    clearInterval(timerInterval);

    timerInterval=null;

  }

}


// =====================================================
// BID
// =====================================================

window.placeBid=async function(){

  if(!roomCode||!myTeamId){

    showGameMessage(
      "❌ You are not in a room."
    );

    return;

  }

  try{

    const auctionSnap=
      await get(
        ref(db,`rooms/${roomCode}/auction`)
      );

    const auction=auctionSnap.val();

    if(
      !auction||
      auction.status!=="OPEN"
    ){

      showGameMessage(
        "❌ Bidding is closed."
      );

      return;

    }

    if(
      Date.now()>=
      Number(auction.endTime||0)
    ){

      await finishAuction();

      return;

    }

    const teamSnap=
      await get(
        ref(
          db,
          `rooms/${roomCode}/teams/${myTeamId}`
        )
      );

    const team=teamSnap.val();

    if(!team) return;

    const players=
      team.players||[];

    if(players.length>=MAX_PLAYERS){

      showGameMessage(
        "❌ You already have 4 players."
      );

      return;

    }

    const budget=
      Number(team.budget||0);

    const currentBid=
      Number(auction.currentBid||0);

    const increment=
      currentBid<1000
        ? SMALL_INCREMENT
        : BIG_INCREMENT;

    const newBid=
      currentBid+increment;

    if(newBid>budget){

      showGameMessage(
        "❌ Not enough budget."
      );

      return;

    }

    const auctionRef=
      ref(db,`rooms/${roomCode}/auction`);

    const result=
      await runTransaction(
        auctionRef,
        current=>{

          if(!current) return;

          if(current.status!=="OPEN")
            return;

          if(
            Date.now()>=
            Number(current.endTime||0)
          )
            return;

          if(
            Number(current.currentBid||0)!==
            currentBid
          )
            return;

          return{

            ...current,

            currentBid:newBid,

            highestBidder:myTeamId,

            highestBidderName:team.name,

            endTime:
              Date.now()+
              AUCTION_SECONDS*1000

          };

        }
      );

    if(!result.committed){

      showGameMessage(
        "⚠️ Another player bid first."
      );

      return;

    }

    showGameMessage(
      "🔥 Bid placed: "+
      formatMoney(newBid)+
      " • Timer reset"
    );

  }
  catch(error){

    console.error(error);

    showGameMessage(
      "❌ "+error.message
    );

  }

};


// =====================================================
// FINISH AUCTION
// =====================================================

async function finishAuction(){

  if(finishing) return;

  finishing=true;

  try{

    const auctionRef=
      ref(db,`rooms/${roomCode}/auction`);

    const snap=
      await get(auctionRef);

    const auction=snap.val();

    if(
      !auction||
      auction.status!=="OPEN"
    )
      return;

    if(
      Date.now()<
      Number(auction.endTime||0)
    )
      return;

    // ================================================
    // SOMEONE BID
    // ================================================

    if(auction.highestBidder){

      const winnerRef=
        ref(
          db,
          `rooms/${roomCode}/teams/${auction.highestBidder}`
        );

      const winnerSnap=
        await get(winnerRef);

      const winner=winnerSnap.val();

      if(!winner) return;

      const players=
        winner.players||[];

      const price=
        Number(auction.currentBid||0);

      const budget=
        Number(winner.budget||0);

      if(
        players.length>=MAX_PLAYERS||
        price>budget
      ){

        await update(
          auctionRef,
          {
            status:"SKIPPED"
          }
        );

      }
      else{

        const character=
          getCurrentCharacter(auction);

        players.push({

          name:character.name,

          price:price

        });

        await update(
          winnerRef,
          {

            budget:
              budget-price,

            players:players

          }
        );

        await set(
          ref(
            db,
            `rooms/${roomCode}/history/${Date.now()}`
          ),
          {

            character:character.name,

            team:winner.name,

            price:price,

            time:Date.now(),

            free:false

          }
        );

        await update(
          auctionRef,
          {
            status:"SOLD"
          }
        );

      }

    }

    // ================================================
    // NO BID
    // ================================================

    else{

      await update(
        auctionRef,
        {
          status:"SKIPPED"
        }
      );

    }

    // ================================================
    // MOVE TO NEXT
    // ================================================

    setTimeout(
      nextCharacter,
      500
    );

  }
  catch(error){

    console.error(
      "Finish error:",
      error
    );

  }
  finally{

    finishing=false;

  }

}


// =====================================================
// NEXT CHARACTER
// =====================================================

async function nextCharacter(){

  try{

    const auctionRef=
      ref(db,`rooms/${roomCode}/auction`);

    const snap=
      await get(auctionRef);

    const auction=snap.val();

    if(!auction) return;

    if(
      auction.status!=="SOLD"&&
      auction.status!=="SKIPPED"
    )
      return;

    const nextIndex=
      Number(auction.characterIndex||0)+1;

    const order=
      auction.characterOrder||[];

    // ================================================
    // FINISHED
    // ================================================

    if(nextIndex>=order.length){

      await update(
        ref(db,`rooms/${roomCode}`),
        {
          status:"FINISHED"
        }
      );

      await update(
        auctionRef,
        {
          characterIndex:nextIndex,
          currentBid:0,
          highestBidder:null,
          highestBidderName:null,
          status:"FINISHED",
          endTime:0
        }
      );

      showGameMessage(
        "🏆 AUCTION FINISHED!"
      );

      return;

    }

    // ================================================
    // NEW CHARACTER
    // ================================================

    await update(
      auctionRef,
      {

        characterIndex:nextIndex,

        currentBid:STARTING_BID,

        highestBidder:null,

        highestBidderName:null,

        status:"OPEN",

        endTime:
          Date.now()+
          AUCTION_SECONDS*1000

      }
    );

  }
  catch(error){

    console.error(error);

  }

}


// =====================================================
// NEW GAME
// =====================================================

window.restartGame=async function(){

  if(!isHost){

    alert(
      "Only the room creator can start a new game."
    );

    return;

  }

  const ok=
    confirm(
      "START NEW GAME?\n\n"+
      "All players will stay in the room,\n"+
      "but budgets, characters and history\n"+
      "will be completely reset."
    );

  if(!ok) return;

  try{

    const teamsSnap=
      await get(
        ref(db,`rooms/${roomCode}/teams`)
      );

    const teams=teamsSnap.val()||{};

    const updates={};

    Object.keys(teams).forEach(id=>{

      updates[
        `rooms/${roomCode}/teams/${id}/budget`
      ]=STARTING_BUDGET;

      updates[
        `rooms/${roomCode}/teams/${id}/players`
      ]=[];

    });

    updates[
      `rooms/${roomCode}/history`
    ]=null;

    updates[
      `rooms/${roomCode}/status`
    ]="PLAYING";

    const order=
      shuffle(characters)
      .map(c=>c.name);

    updates[
      `rooms/${roomCode}/auction`
    ]={

      characterIndex:0,

      characterOrder:order,

      currentBid:STARTING_BID,

      highestBidder:null,

      highestBidderName:null,

      status:"OPEN",

      endTime:
        Date.now()+
        AUCTION_SECONDS*1000

    };

    await update(
      ref(db),
      updates
    );

    showGameMessage(
      "🔄 NEW GAME STARTED!"
    );

  }
  catch(error){

    console.error(error);

    alert(
      "❌ Restart failed:\n"+
      error.message
    );

  }

};


// =====================================================
// TEAM RANKING
// =====================================================

function calculateCharacterScore(player){

  const character=
    characters.find(
      c=>c.name===player.name
    );

  if(!character) return 0;

  return(
    character.power*.25+
    character.attack*.15+
    character.defense*.15+
    character.speed*.10+
    character.hax*.15+
    character.intelligence*.10+
    character.synergy*.10
  );

}


function calculateTeamScore(team){

  const players=
    team.players||[];

  if(!players.length)
    return 0;

  const scores=
    players.map(
      calculateCharacterScore
    );

  const total=
    scores.reduce(
      (a,b)=>a+b,
      0
    );

  const average=
    total/scores.length;

  const strongest=
    Math.max(...scores);

  return Number(
    (
      strongest*.25+
      total*.35+
      average*.20+
      Math.min(total,400)*.20
    ).toFixed(2)
  );

}


// =====================================================
// DISPLAY TEAMS
// =====================================================

function displayTeams(teams){

  const container=
    document.getElementById("teams");

  if(!container) return;

  const ranked=
    Object.entries(teams)
      .map(([id,team])=>({

        id:id,

        name:team.name||"Unknown",

        budget:Number(team.budget||0),

        players:team.players||[],

        score:
          calculateTeamScore(team)

      }))
      .sort(
        (a,b)=>
          b.score-a.score
      );

  container.innerHTML="";

  if(!ranked.length){

    container.textContent=
      "No teams.";

    return;

  }

  ranked.forEach((team,index)=>{

    let medal="🏅";

    if(index===0) medal="🥇";

    if(index===1) medal="🥈";

    if(index===2) medal="🥉";

    const div=
      document.createElement("div");

    div.className="team";

    div.innerHTML=`

      <div class="team-name">
        ${medal}
        #${index+1}
        ${escapeHTML(team.name)}
      </div>

      <div>
        ⭐ Power:
        <b>${team.score}</b>
      </div>

      <div>
        💰 Budget:
        <b>${formatMoney(team.budget)}</b>
      </div>

      <div>
        👥 Players:
        ${team.players.length}/${MAX_PLAYERS}
      </div>

      <hr>

      ${
        team.players.length
        ?
        team.players.map(player=>`

          <div style="margin:5px 0">
            ⚔️ ${escapeHTML(player.name)}
            — ${formatMoney(player.price)}
          </div>

        `).join("")
        :
        "<div>No players</div>"
      }

    `;

    container.appendChild(div);

  });

  if(
    myTeamId&&
    teams[myTeamId]
  ){

    const mine=teams[myTeamId];

    document.getElementById("myTeam")
      .textContent=mine.name;

    document.getElementById("myBudget")
      .textContent=
        formatMoney(mine.budget);

    document.getElementById("myPlayers")
      .textContent=
        `${(mine.players||[]).length}/${MAX_PLAYERS}`;

  }

}


// =====================================================
// HISTORY
// =====================================================

function displayHistory(history){

  const container=
    document.getElementById("history");

  if(!container) return;

  container.innerHTML="";

  const items=
    Object.values(history)
      .sort(
        (a,b)=>
          Number(b.time||0)-
          Number(a.time||0)
      );

  if(!items.length){

    container.textContent=
      "No history yet.";

    return;

  }

  items.forEach(item=>{

    const div=
      document.createElement("div");

    div.className="history-item";

    div.innerHTML=`

      🔨
      <b>${escapeHTML(item.character)}</b>
      →
      <b>${escapeHTML(item.team)}</b>
      →
      ${formatMoney(item.price)}

    `;

    container.appendChild(div);

  });

}


// =====================================================
// COPY ROOM LINK
// =====================================================

window.copyRoomLink=async function(){

  const input=
    document.getElementById("roomLink");

  try{

    await navigator.clipboard.writeText(
      input.value
    );

    alert("✅ Room link copied!");

  }
  catch{

    input.select();

    document.execCommand("copy");

    alert("✅ Room link copied!");

  }

};


// =====================================================
// LEAVE ROOM
// =====================================================

window.leaveRoom=async function(){

  if(roomCode&&myTeamId){

    try{

      await remove(
        ref(
          db,
          `rooms/${roomCode}/teams/${myTeamId}`
        )
      );

    }
    catch(error){

      console.error(error);

    }

  }

  roomCode=null;

  myTeamId=null;

  isHost=false;

  location.reload();

};


// =====================================================
// URL ROOM CODE
// =====================================================

const urlParams=
  new URLSearchParams(
    location.search
  );

const automaticRoom=
  urlParams.get("room");

if(automaticRoom){

  setTimeout(()=>{

    hideAll();

    document
      .getElementById("joinScreen")
      .classList.remove("hidden");

    document
      .getElementById("joinRoomCode")
      .value=
        automaticRoom.toUpperCase();

  },500);

}


// =====================================================
// HELPERS
// =====================================================

function formatMoney(lakhs){

  const amount=
    Number(lakhs||0);

  if(amount>=100){

    const crore=
      amount/100;

    return(
      "₹"+
      (
        Number.isInteger(crore)
        ? crore
        : crore.toFixed(2)
      )+
      " Cr"
    );

  }

  return "₹"+amount+" L";

}


function showGameMessage(message){

  const element=
    document.getElementById("gameMessage");

  if(element)
    element.textContent=message;

}


function showMessageToAll(message){

  const ids=[
    "homeMessage",
    "createMessage",
    "joinMessage",
    "lobbyMessage",
    "gameMessage"
  ];

  for(const id of ids){

    const el=
      document.getElementById(id);

    if(el)
      el.textContent=message;

  }

}


function escapeHTML(text){

  return String(text)

    .replaceAll("&","&amp;")

    .replaceAll("<","&lt;")

    .replaceAll(">","&gt;")

    .replaceAll('"',"&quot;")

    .replaceAll("'","&#039;");

  }
