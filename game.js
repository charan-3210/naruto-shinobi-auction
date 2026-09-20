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

  apiKey:
    "AIzaSyB4PSLZ0ZhVGGtfZ1hcluOWsTbvJDxxxTg",

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


// ============================================================
// FIREBASE
// ============================================================

const app =
  initializeApp(firebaseConfig);

const db =
  getDatabase(app);

const auth =
  getAuth(app);


// ============================================================
// GAME SETTINGS
// ============================================================

const STARTING_BUDGET = 2000; // ₹20 Cr

const MAX_TEAMS = 4;

const MAX_CHARACTERS = 4;

const AUCTION_TIME = 10;

const START_BID = 100; // ₹1 Cr

const SMALL_INCREMENT = 50; // ₹50 L

const BIG_INCREMENT = 100; // ₹1 Cr


// ============================================================
// CHARACTER FUNCTION
// ============================================================

function character(id,name,power){

  const attack =
    Math.max(
      500,
      Math.min(
        949,
        power + ((power % 37) - 18)
      )
    );

  const defense =
    Math.max(
      500,
      Math.min(
        949,
        power + ((power % 43) - 21)
      )
    );

  const speed =
    Math.max(
      500,
      Math.min(
        949,
        power + ((power % 31) - 15)
      )
    );

  const hax =
    Math.max(
      500,
      Math.min(
        949,
        power + ((power % 47) - 23)
      )
    );

  const intelligence =
    Math.max(
      500,
      Math.min(
        949,
        power + ((power % 29) - 14)
      )
    );

  const synergy =
    Math.max(
      500,
      Math.min(
        949,
        power + ((power % 41) - 20)
      )
    );

  return {
    id,
    name,
    power,
    attack,
    defense,
    speed,
    hax,
    intelligence,
    synergy
  };
}


// ============================================================
// 100 CHARACTERS
// POWER RANGE: 550–950
// EVERY POWER VALUE IS DIFFERENT
// ============================================================

const characters = [

  character("isshiki","Isshiki Otsutsuki",950),
  character("shibai","Shibai Otsutsuki",948),
  character("juubidara","Juubidara — Ten Tails Madara",942),
  character("kaguya","Kaguya Otsutsuki",936),
  character("hagoromo","Hagoromo Otsutsuki",925),
  character("hamura","Hamura Otsutsuki",920),
  character("narutoso6p","Naruto Six Paths",918),
  character("sasuke6p","Sasuke Six Paths",914),
  character("madara","Madara Uchiha",905),
  character("momoshiki","Momoshiki Otsutsuki",902),

  character("indura","Indra Otsutsuki",895),
  character("obitojuubi","Juubito — Ten Tails Obito",897),
  character("ashura","Ashura Otsutsuki",890),
  character("hashirama","Hashirama Senju",875),
  character("narutokcm2","Naruto KCM 2",868),
  character("hashiramaedo","Edo Hashirama",865),
  character("sasukems2","Sasuke Eternal Mangekyo",862),
  character("madaraedo","Edo Madara",858),
  character("minatoedo","Edo Minato",852),
  character("kinshiki","Kinshiki Otsutsuki",850),

  character("itachireanimated","Reanimated Itachi",848),
  character("minato","Minato Namikaze",842),
  character("nagatoedo","Edo Nagato",838),
  character("nagato","Nagato",835),
  character("pain","Pain",828),
  character("tobiramaedo","Edo Tobirama",824),
  character("tobirama","Tobirama Senju",815),
  character("mightguy","Might Guy — Eighth Gate",812),
  character("toneri","Toneri Otsutsuki",810),
  character("jiraiyasage","Jiraiya Sage Mode",805),

  character("narutokcm","Naruto KCM",802),
  character("urashiki","Urashiki Otsutsuki",795),
  character("sasukems","Sasuke Mangekyo",792),
  character("itachi","Itachi Uchiha",790),
  character("kabutosage","Sage Kabuto",785),
  character("orochimarureborn","Reanimated Orochimaru",780),
  character("thirdraikage","Third Raikage",777),
  character("killerbee","Killer B",775),
  character("hiruzen","Hiruzen Sarutobi",765),
  character("orochimaru","Orochimaru",760),

  character("kakashi","Kakashi Hatake",755),
  character("obito","Obito Uchiha",750),
  character("onoki","Onoki",748),
  character("mu","Mu",744),
  character("gengetsu","Gengetsu Hozuki",740),
  character("raikage","Fourth Raikage",738),
  character("hanzo","Hanzo",735),
  character("mei","Mei Terumi",728),
  character("gaaraadult","Adult Gaara",725),
  character("gaara","Gaara",718),

  character("tsunade","Tsunade",712),
  character("sakura","Sakura Haruno",708),
  character("deidara","Deidara",705),
  character("sasori","Sasori",702),
  character("kisame","Kisame Hoshigaki",698),
  character("kakuzu","Kakuzu",692),
  character("danzo","Danzo Shimura",688),
  character("kimimaro","Kimimaro",682),
  character("zabuza2","Zabuza Reanimated",680),
  character("konan","Konan",678),

  character("asuma","Asuma Sarutobi",674),
  character("zabuza","Zabuza Momochi",670),
  character("kabuto","Kabuto Yakushi",668),
  character("darui","Darui",665),
  character("yagura","Yagura",662),
  character("yugito","Yugito Nii",658),
  character("han","Han",655),
  character("roshi","Roshi",650),
  character("utakata","Utakata",646),
  character("neji","Neji Hyuga",640),

  character("rocklee","Rock Lee",636),
  character("shikamaru","Shikamaru Nara",632),
  character("temari","Temari",628),
  character("kankuro","Kankuro",624),
  character("shino","Shino Aburame",620),
  character("haku2","Haku Reanimated",615),
  character("jugo","Jugo",612),
  character("chiyo","Chiyo",610),
  character("suigetsu","Suigetsu Hozuki",608),
  character("sakontayuya","Sakon & Ukon",606),

  character("haku","Haku",604),
  character("kidomaru","Kidomaru",602),
  character("kurenai","Kurenai Yuhi",598),
  character("shikaku","Shikaku Nara",594),
  character("inoichi","Inoichi Yamanaka",590),
  character("tayuya","Tayuya",588),
  character("ino","Ino Yamanaka",586),
  character("jirobo","Jirobo",584),
  character("choji","Choji Akimichi",582),
  character("kiba","Kiba Inuzuka",578),

  character("hinata","Hinata Hyuga",574),
  character("karin","Karin Uzumaki",570),
  character("pakura","Pakura",566),
  character("gari","Gari",562),
  character("fuu","Fu",560),
  character("mifune","Mifune",558),
  character("hidan","Hidan",556),
  character("zetsu","Black Zetsu",554),
  character("whitezetsu","White Zetsu",552),
  character("temariwar","Temari War Arc",550)

];


// ============================================================
// CHECK CHARACTER COUNT
// ============================================================

console.log(
  "Characters loaded:",
  characters.length
);


// ============================================================
// STATE
// ============================================================

let currentUser = null;
let currentRoomCode = null;
let currentRoom = null;

let roomListener = null;
let auctionListener = null;

let timerInterval = null;
let finishingAuction = false;

let authResolve;

const authReady =
  new Promise(resolve=>{
    authResolve = resolve;
  });


// ============================================================
// HELPERS
// ============================================================

function $(id){
  return document.getElementById(id);
}


function showConnection(message){

  const element =
    $("connectionStatus");

  if(element){
    element.textContent =
      message;
  }

}


function formatMoney(lakhs){

  lakhs =
    Number(lakhs || 0);

  if(lakhs >= 100){

    const crores =
      lakhs / 100;

    return Number.isInteger(crores)
      ? `₹${crores} Cr`
      : `₹${crores.toFixed(2)} Cr`;

  }

  return `₹${lakhs} L`;
}


function escapeHtml(value){

  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}


function shuffle(array){

  const result =
    [...array];

  for(
    let i=result.length-1;
    i>0;
    i--
  ){

    const j =
      Math.floor(
        Math.random()*(i+1)
      );

    [
      result[i],
      result[j]
    ]=[
      result[j],
      result[i]
    ];
  }

  return result;
}


function randomRoomCode(){

  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let code="";

  for(
    let i=0;
    i<6;
    i++
  ){

    code +=
      chars[
        Math.floor(
          Math.random()*chars.length
        )
      ];

  }

  return code;
}


function getCharacter(id){

  return characters.find(
    c=>c.id===id
  );
}


function getNextBid(currentBid){

  currentBid =
    Number(currentBid || 0);

  if(currentBid < START_BID){
    return START_BID;
  }

  if(currentBid < 1000){
    return currentBid + SMALL_INCREMENT;
  }

  return currentBid + BIG_INCREMENT;
}


function roomRef(code=currentRoomCode){

  return ref(
    db,
    `rooms/${code}`
  );
}


function auctionRef(code=currentRoomCode){

  return ref(
    db,
    `rooms/${code}/auction`
  );
}


function teamRef(uid,code=currentRoomCode){

  return ref(
    db,
    `rooms/${code}/teams/${uid}`
  );
}


// ============================================================
// AUTH
// ============================================================

onAuthStateChanged(
  auth,
  user=>{

    if(user){

      currentUser =
        user;

      showConnection(
        "🟢 Connected to Firebase"
      );

      authResolve(user);

      checkURLRoom();

    }else{

      showConnection(
        "⏳ Signing in..."
      );

      signInAnonymously(auth)
        .catch(error=>{

          console.error(error);

          showConnection(
            "❌ Authentication failed"
          );

          alert(
            "Firebase authentication failed:\n\n"+
            error.message
          );

        });

    }

  }
);


async function waitForAuth(){

  if(currentUser){
    return currentUser;
  }

  return await authReady;
}


// ============================================================
// SCREEN SYSTEM
// ============================================================

function hideScreens(){

  [
    "homeScreen",
    "createRoomScreen",
    "joinRoomScreen",
    "lobbyScreen",
    "gameScreen"
  ].forEach(id=>{

    const element =
      $(id);

    if(element){
      element.style.display =
        "none";
    }

  });
}


function showScreen(id){

  hideScreens();

  const element =
    $(id);

  if(element){
    element.style.display =
      "block";
  }

}


function showCreateRoom(){
  showScreen("createRoomScreen");
}


function showJoinRoom(){
  showScreen("joinRoomScreen");
}


function goHome(){

  if(timerInterval){

    clearInterval(
      timerInterval
    );

    timerInterval =
      null;

  }

  showScreen("homeScreen");
}


// ============================================================
// URL ROOM
// ============================================================

function updateRoomURL(code){

  const url =
    `${window.location.origin}${window.location.pathname}?room=${code}`;

  $("displayRoomCode").textContent =
    code;

  $("roomLink").textContent =
    url;

  window.history.replaceState(
    {},
    document.title,
    `?room=${code}`
  );
}


function checkURLRoom(){

  const params =
    new URLSearchParams(
      window.location.search
    );

  const code =
    params.get("room");

  if(!code){

    showScreen("homeScreen");

    return;
  }

  $("joinRoomCode").value =
    code.toUpperCase();

  showJoinRoom();
}


// ============================================================
// CREATE ROOM
// ============================================================

async function createRoom(){

  try{

    const user =
      await waitForAuth();

    const teamName =
      $("createTeamName")
        .value
        .trim();

    if(!teamName){

      alert(
        "Enter your team name."
      );

      return;
    }

    const button =
      $("createRoomButton");

    button.disabled =
      true;

    button.textContent =
      "CREATING...";

    let code = null;

    for(
      let attempt=0;
      attempt<10;
      attempt++
    ){

      const candidate =
        randomRoomCode();

      const existing =
        await get(
          roomRef(candidate)
        );

      if(!existing.exists()){

        code =
          candidate;

        break;

      }

    }

    if(!code){

      throw new Error(
        "Could not create room."
      );

    }

    const room = {

      hostUid:
        user.uid,

      status:
        "LOBBY",

      createdAt:
        Date.now(),

      teams:{

        [user.uid]:{

          name:
            teamName,

          budget:
            STARTING_BUDGET,

          players:[],

          joinedAt:
            Date.now()

        }

      },

      auction:null,

      characterOrder:[],

      history:[],

      finalResults:null

    };

    await set(
      roomRef(code),
      room
    );

    currentRoomCode =
      code;

    currentRoom =
      room;

    updateRoomURL(code);

    showScreen(
      "lobbyScreen"
    );

    listenToRoom();

  }catch(error){

    console.error(error);

    alert(
      "Could not create room:\n\n"+
      error.message
    );

  }finally{

    const button =
      $("createRoomButton");

    if(button){

      button.disabled =
        false;

      button.textContent =
        "CREATE ROOM";

    }

  }

}


// ============================================================
// JOIN ROOM
// ============================================================

async function joinRoom(){

  try{

    const user =
      await waitForAuth();

    const code =
      $("joinRoomCode")
        .value
        .trim()
        .toUpperCase();

    const teamName =
      $("joinTeamName")
        .value
        .trim();

    if(code.length!==6){

      alert(
        "Enter the correct 6-character room code."
      );

      return;
    }

    if(!teamName){

      alert(
        "Enter your team name."
      );

      return;
    }

    const snapshot =
      await get(
        roomRef(code)
      );

    if(!snapshot.exists()){

      alert(
        "Room not found."
      );

      return;
    }

    const room =
      snapshot.val();

    if(room.status!=="LOBBY"){

      alert(
        "The auction has already started."
      );

      return;
    }

    const teams =
      room.teams || {};

    const ids =
      Object.keys(teams);

    if(
      !teams[user.uid] &&
      ids.length>=MAX_TEAMS
    ){

      alert(
        "Room is full. Maximum 4 teams."
      );

      return;
    }

    await set(
      teamRef(
        user.uid,
        code
      ),
      {

        name:
          teamName,

        budget:
          teams[user.uid]
            ? Number(
                teams[user.uid].budget ??
                STARTING_BUDGET
              )
            : STARTING_BUDGET,

        players:
          teams[user.uid]
            ? teams[user.uid].players || []
            : [],

        joinedAt:
          teams[user.uid]
            ? teams[user.uid].joinedAt ||
              Date.now()
            : Date.now()

      }
    );

    currentRoomCode =
      code;

    updateRoomURL(code);

    showScreen(
      "lobbyScreen"
    );

    listenToRoom();

  }catch(error){

    console.error(error);

    alert(
      "Could not join room:\n\n"+
      error.message
    );

  }

}


// ============================================================
// COPY ROOM LINK
// ============================================================

async function copyRoomLink(){

  if(!currentRoomCode){
    return;
  }

  const url =
    `${window.location.origin}${window.location.pathname}?room=${currentRoomCode}`;

  try{

    await navigator.clipboard.writeText(url);

    alert(
      "Room link copied!"
    );

  }catch{

    prompt(
      "Copy room link:",
      url
    );

  }

}


// ============================================================
// LISTEN TO ROOM
// ============================================================

function listenToRoom(){

  if(!currentRoomCode){
    return;
  }

  if(roomListener){
    roomListener();
  }

  if(auctionListener){
    auctionListener();
  }

  roomListener =
    onValue(
      roomRef(),
      snapshot=>{

        if(!snapshot.exists()){

          alert(
            "Room no longer exists."
          );

          currentRoomCode =
            null;

          goHome();

          return;
        }

        currentRoom =
          snapshot.val();

        renderRoom(
          currentRoom
        );

      }
    );

  auctionListener =
    onValue(
      auctionRef(),
      snapshot=>{

        if(snapshot.exists()){

          displayAuction(
            snapshot.val()
          );

        }

      }
    );
}


// ============================================================
// RENDER ROOM
// ============================================================

function renderRoom(room){

  if(room.status==="LOBBY"){

    renderLobby(room);

    return;
  }

  if(room.status==="PLAYING"){

    showScreen("gameScreen");

    renderTeams(room);

    renderHistory(room);

    $("finalResultsCard").style.display =
      "none";

    return;
  }

  if(room.status==="FINISHED"){

    showScreen("gameScreen");

    renderTeams(room);

    renderHistory(room);

    renderFinalResults(room);

    const bid =
      $("bidButton");

    bid.disabled =
      true;

    bid.textContent =
      "🏁 AUCTION FINISHED";

    if(timerInterval){

      clearInterval(
        timerInterval
      );

      timerInterval =
        null;

    }

  }

}


// ============================================================
// LOBBY
// ============================================================

function renderLobby(room){

  showScreen("lobbyScreen");

  $("displayRoomCode").textContent =
    currentRoomCode;

  $("roomLink").textContent =
    `${window.location.origin}${window.location.pathname}?room=${currentRoomCode}`;

  const container =
    $("lobbyPlayers");

  container.innerHTML = "";

  Object.entries(
    room.teams || {}
  ).forEach(
    ([uid,team],index)=>{

      const div =
        document.createElement(
          "div"
        );

      div.className =
        "player-card";

      div.innerHTML = `

        <strong>
          ${index+1}.
          ${escapeHtml(team.name)}
        </strong>

        <span>
          ${
            uid===room.hostUid
              ? "👑 HOST"
              : ""
          }
        </span>

      `;

      container.appendChild(div);

    }
  );

  const start =
    $("startAuctionButton");

  if(
    currentUser &&
    currentUser.uid===
    room.hostUid
  ){

    start.style.display =
      "block";

  }else{

    start.style.display =
      "none";

  }

}


// ============================================================
// START AUCTION
// ============================================================

async function startAuction(){

  const user =
    await waitForAuth();

  const snapshot =
    await get(
      roomRef()
    );

  if(!snapshot.exists()){
    return;
  }

  const room =
    snapshot.val();

  if(room.hostUid!==user.uid){

    alert(
      "Only the host can start the auction."
    );

    return;
  }

  const order =
    shuffle(
      characters.map(
        c=>c.id
      )
    );

  const first =
    getCharacter(
      order[0]
    );

  await update(
    roomRef(),
    {

      status:
        "PLAYING",

      characterOrder:
        order,

      history:[],

      finalResults:null,

      auction:{

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
          Date.now()+
          AUCTION_TIME*1000

      }

    }
  );

}


// ============================================================
// DISPLAY AUCTION
// ============================================================

function displayAuction(auction){

  if(!auction){
    return;
  }

  const c =
    getCharacter(
      auction.characterId
    );

  if(!c){
    return;
  }

  $("characterName").textContent =
    c.name;

  $("characterPower").textContent =
    `⚡ Power ${c.power}/1000`;

  $("currentBid").textContent =
    formatMoney(
      auction.currentBid
    );

  $("highestBidder").textContent =
    auction.highestBidderName
      ? `Highest Bidder: ${auction.highestBidderName}`
      : "No bids yet";

  const next =
    auction.highestBidder
      ? getNextBid(
          auction.currentBid
        )
      : START_BID;

  $("nextBid").textContent =
    `Next bid: ${formatMoney(next)}`;

  updateBidButton(
    auction
  );

  startTimer(
    auction
  );

}


// ============================================================
// BID BUTTON
// ============================================================

function updateBidButton(auction){

  const button =
    $("bidButton");

  if(!currentUser ||
     !currentRoom ||
     auction.status!=="ACTIVE"){

    button.disabled=true;

    return;
  }

  const team =
    currentRoom.teams &&
    currentRoom.teams[
      currentUser.uid
    ];

  if(!team){

    button.disabled=true;

    button.textContent =
      "NOT IN ROOM";

    return;
  }

  const players =
    team.players || [];

  if(players.length>=MAX_CHARACTERS){

    button.disabled=true;

    button.textContent =
      "TEAM FULL";

    return;
  }

  const nextBid =
    auction.highestBidder
      ? getNextBid(
          auction.currentBid
        )
      : START_BID;

  if(
    Number(team.budget||0)<
    nextBid
  ){

    button.disabled=true;

    button.textContent =
      "OUT OF MONEY";

    return;
  }

  button.disabled=false;

  button.textContent =
    `BID ${formatMoney(nextBid)}`;

}


// ============================================================
// PLACE BID
// ============================================================

async function placeBid(){

  const user =
    await waitForAuth();

  const snapshot =
    await get(
      roomRef()
    );

  if(!snapshot.exists()){
    return;
  }

  const room =
    snapshot.val();

  const auction =
    room.auction;

  if(
    !auction ||
    auction.status!=="ACTIVE"
  ){
    return;
  }

  const team =
    room.teams &&
    room.teams[user.uid];

  if(!team){

    alert(
      "You are not in this room."
    );

    return;
  }

  if(
    (team.players||[]).length>=
    MAX_CHARACTERS
  ){
    return;
  }

  const nextBid =
    auction.highestBidder
      ? getNextBid(
          auction.currentBid
        )
      : START_BID;

  if(
    Number(team.budget||0)<
    nextBid
  ){

    alert(
      "You don't have enough money."
    );

    return;
  }

  await runTransaction(
    auctionRef(),
    current=>{

      if(!current){
        return;
      }

      if(current.status!=="ACTIVE"){
        return;
      }

      if(
        Date.now()>=
        Number(current.endTime)
      ){
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

        currentBid:
          bid,

        highestBidder:
          user.uid,

        highestBidderName:
          team.name,

        endTime:
          Date.now()+
          AUCTION_TIME*1000

      };

    }
  );

}


// ============================================================
// TIMER
// ============================================================

function startTimer(auction){

  if(timerInterval){

    clearInterval(
      timerInterval
    );

  }

  const timer =
    $("auctionTimer");

  function tick(){

    const remaining =
      Math.max(
        0,
        Math.ceil(
          (
            Number(auction.endTime)-
            Date.now()
          )/1000
        )
      );

    timer.textContent =
      `${remaining}s`;

    if(remaining<=0){

      clearInterval(
        timerInterval
      );

      timerInterval =
        null;

      finishAuction();

    }

  }

  tick();

  timerInterval =
    setInterval(
      tick,
      250
    );

}


// ============================================================
// TEAM CAN CONTINUE
// ============================================================

function teamCanContinue(team){

  const players =
    team.players || [];

  const budget =
    Number(
      team.budget || 0
    );

  if(
    players.length>=
    MAX_CHARACTERS
  ){
    return false;
  }

  if(
    budget<
    START_BID
  ){
    return false;
  }

  return true;
}


function canAuctionContinue(room){

  const teams =
    Object.values(
      room.teams || {}
    );

  if(!teams.length){
    return false;
  }

  return teams.some(
    team=>
      teamCanContinue(team)
  );
}


// ============================================================
// FINISH AUCTION
// ============================================================

async function finishAuction(){

  if(
    finishingAuction ||
    !currentRoomCode
  ){
    return;
  }

  finishingAuction=true;

  try{

    const result =
      await runTransaction(
        auctionRef(),
        current=>{

          if(!current){
            return;
          }

          if(
            current.status!=="ACTIVE"
          ){
            return;
          }

          if(
            Date.now()<
            Number(current.endTime)
          ){
            return;
          }

          return {

            ...current,

            status:
              "FINALIZING"

          };

        }
      );

    if(!result.committed){
      return;
    }

    const auction =
      result.snapshot.val();

    const c =
      getCharacter(
        auction.characterId
      );

    if(!auction.highestBidder){

      await addHistory({

        type:"SKIP",

        character:
          c.name,

        price:0,

        teamName:
          "No Bid",

        timestamp:
          Date.now()

      });

    }else{

      const winner =
        auction.highestBidder;

      const price =
        Number(
          auction.currentBid
        );

      const winnerResult =
        await runTransaction(
          teamRef(winner),
          team=>{

            if(!team){
              return;
            }

            const players =
              team.players || [];

            const budget =
              Number(
                team.budget||0
              );

            if(
              players.length>=
              MAX_CHARACTERS
            ){
              return;
            }

            if(
              budget<
              price
            ){
              return;
            }

            return {

              ...team,

              budget:
                budget-price,

              players:[

                ...players,

                {

                  id:
                    c.id,

                  name:
                    c.name,

                  price:
                    price,

                  power:
                    c.power,

                  attack:
                    c.attack,

                  defense:
                    c.defense,

                  speed:
                    c.speed,

                  hax:
                    c.hax,

                  intelligence:
                    c.intelligence,

                  synergy:
                    c.synergy,

                  purchasedAt:
                    Date.now()

                }

              ]

            };

          }
        );

      if(winnerResult.committed){

        await addHistory({

          type:"SOLD",

          character:
            c.name,

          price:
            price,

          teamName:
            auction.highestBidderName,

          teamUid:
            winner,

          timestamp:
            Date.now()

        });

      }

    }

    await nextCharacter(
      auction
    );

  }catch(error){

    console.error(
      "FINISH AUCTION:",
      error
    );

  }finally{

    finishingAuction=false;

  }

}


// ============================================================
// HISTORY
// ============================================================

async function addHistory(item){

  await runTransaction(
    ref(
      db,
      `rooms/${currentRoomCode}/history`
    ),
    history=>{

      const list =
        Array.isArray(history)
          ? history
          : [];

      return[
        ...list,
        item
      ];

    }
  );

}


// ============================================================
// GAME END
// ============================================================

async function checkGameEnd(){

  const snapshot =
    await get(
      roomRef()
    );

  if(!snapshot.exists()){
    return true;
  }

  const room =
    snapshot.val();

  if(!canAuctionContinue(room)){

    const finalResults =
      calculateFinalResults(
        room
      );

    await update(
      roomRef(),
      {

        status:
          "FINISHED",

        finalResults,

        auction:{

          ...(room.auction||{}),

          status:
            "FINISHED"

        }

      }
    );

    return true;
  }

  return false;
}


// ============================================================
// NEXT CHARACTER
// ============================================================

async function nextCharacter(previous){

  if(
    await checkGameEnd()
  ){
    return;
  }

  const snapshot =
    await get(
      roomRef()
    );

  if(!snapshot.exists()){
    return;
  }

  const room =
    snapshot.val();

  if(
    !canAuctionContinue(room)
  ){

    const finalResults =
      calculateFinalResults(room);

    await update(
      roomRef(),
      {

        status:
          "FINISHED",

        finalResults

      }
    );

    return;
  }

  const order =
    room.characterOrder || [];

  const currentIndex =
    Number(
      previous.characterIndex||0
    );

  const nextIndex =
    currentIndex+1;

  if(
    nextIndex>=
    order.length
  ){

    const finalResults =
      calculateFinalResults(room);

    await update(
      roomRef(),
      {

        status:
          "FINISHED",

        finalResults,

        auction:{

          ...(room.auction||{}),

          status:
            "FINISHED"

        }

      }
    );

    return;
  }

  const next =
    getCharacter(
      order[nextIndex]
    );

  if(!next){
    return;
  }

  await update(
    roomRef(),
    {

      auction:{

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
          Date.now()+
          AUCTION_TIME*1000

      }

    }
  );

}


// ============================================================
// TEAM DISPLAY
// ============================================================

function renderTeams(room){

  const container =
    $("teamStats");

  container.innerHTML="";

  Object.entries(
    room.teams||{}
  ).forEach(
    ([uid,team])=>{

      const players =
        team.players||[];

      const out =
        !teamCanContinue(team);

      const div =
        document.createElement(
          "div"
        );

      div.className =
        "team-card"+
        (
          currentUser &&
          uid===currentUser.uid
            ? " my-team"
            : ""
        )+
        (
          out
            ? " out"
            : ""
        );

      div.innerHTML = `

        <h3>

          ${escapeHtml(team.name)}

          ${
            currentUser &&
            uid===currentUser.uid
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

        <div>
          Status:
          <strong>
            ${
              out
                ? "OUT"
                : "ACTIVE"
            }
          </strong>
        </div>

        <div class="team-players">

          ${
            players.length

              ? players.map(
                  p=>`

                    <div>
                      ${escapeHtml(p.name)}
                      —
                      ${formatMoney(p.price)}
                      —
                      Power ${p.power}
                    </div>

                  `
                ).join("")

              : "<div>No characters</div>"
          }

        </div>

      `;

      container.appendChild(
        div
      );

    }
  );

}


// ============================================================
// HISTORY DISPLAY
// ============================================================

function renderHistory(room){

  const container =
    $("auctionHistory");

  const history =
    room.history||[];

  if(!history.length){

    container.innerHTML =
      "<div>No auction history yet.</div>";

    return;
  }

  container.innerHTML =
    [...history]
      .reverse()
      .map(item=>{

        if(
          item.type==="SKIP"
        ){

          return `

            <div class="history-item">

              ⏭️
              ${escapeHtml(
                item.character
              )}

              — No bids

            </div>

          `;

        }

        return `

          <div class="history-item">

            🔥
            ${escapeHtml(
              item.character
            )}

            —

            ${escapeHtml(
              item.teamName
            )}

            —

            <strong>
              ${formatMoney(
                item.price
              )}
            </strong>

          </div>

        `;

      })
      .join("");

}


// ============================================================
// FINAL SCORE
// ============================================================

function calculateFinalTeamScore(team){

  const players =
    team.players||[];

  let score=0;

  players.forEach(p=>{

    score +=
      Number(p.power||0)*0.30;

    score +=
      Number(p.attack||0)*0.12;

    score +=
      Number(p.defense||0)*0.12;

    score +=
      Number(p.speed||0)*0.12;

    score +=
      Number(p.hax||0)*0.14;

    score +=
      Number(p.intelligence||0)*0.10;

    score +=
      Number(p.synergy||0)*0.10;

  });

  if(
    players.length===4
  ){

    score+=10;

  }

  return Math.round(score);
}


// ============================================================
// FINAL RESULTS
// ============================================================

function calculateFinalResults(room){

  const teams=[];

  Object.entries(
    room.teams||{}
  ).forEach(
    ([uid,team])=>{

      const players =
        team.players||[];

      teams.push({

        uid,

        name:
          team.name,

        players,

        characters:
          players.length,

        budget:
          Number(
            team.budget||0
          ),

        score:
          calculateFinalTeamScore(
            team
          ),

        totalPower:
          players.reduce(
            (sum,p)=>
              sum+
              Number(p.power||0),
            0
          ),

        totalAttack:
          players.reduce(
            (sum,p)=>
              sum+
              Number(p.attack||0),
            0
          ),

        totalDefense:
          players.reduce(
            (sum,p)=>
              sum+
              Number(p.defense||0),
            0
          ),

        totalSpeed:
          players.reduce(
            (sum,p)=>
              sum+
              Number(p.speed||0),
            0
          ),

        totalHax:
          players.reduce(
            (sum,p)=>
              sum+
              Number(p.hax||0),
            0
          ),

        totalIntelligence:
          players.reduce(
            (sum,p)=>
              sum+
              Number(p.intelligence||0),
            0
          ),

        totalSynergy:
          players.reduce(
            (sum,p)=>
              sum+
              Number(p.synergy||0),
            0
          )

      });

    }
  );

  teams.sort(
    (a,b)=>{

      if(
        b.score!==a.score
      ){
        return b.score-a.score;
      }

      if(
        b.totalPower!==
        a.totalPower
      ){
        return b.totalPower-a.totalPower;
      }

      if(
        b.characters!==
        a.characters
      ){
        return b.characters-a.characters;
      }

      return b.budget-a.budget;

    }
  );

  teams.forEach(
    (team,index)=>{
      team.rank =
        index+1;
    }
  );

  return teams;
}


// ============================================================
// RANK SUFFIX
// ============================================================

function rankSuffix(rank){

  if(
    rank>=11 &&
    rank<=13
  ){
    return "th";
  }

  if(rank%10===1){
    return "st";
  }

  if(rank%10===2){
    return "nd";
  }

  if(rank%10===3){
    return "rd";
  }

  return "th";
}


// ============================================================
// FINAL RESULTS DISPLAY
// ============================================================

function renderFinalResults(room){

  const card =
    $("finalResultsCard");

  const container =
    $("finalResults");

  if(room.status!=="FINISHED"){

    card.style.display =
      "none";

    return;
  }

  card.style.display =
    "block";

  const results =
    room.finalResults ||
    calculateFinalResults(room);

  container.innerHTML="";

  results.forEach(team=>{

    let medal="🏅";

    if(team.rank===1){
      medal="🥇";
    }

    if(team.rank===2){
      medal="🥈";
    }

    if(team.rank===3){
      medal="🥉";
    }

    const div =
      document.createElement(
        "div"
      );

    div.className =
      "final-team-result";

    const players =
      team.players.length

        ? team.players.map(
            p=>`

              <div class="final-player">

                <span style="color:#fff;">
                  ${escapeHtml(
                    p.name
                  )}
                </span>

                <span>
                  ${formatMoney(
                    p.price
                  )}
                </span>

              </div>

            `
          ).join("")

        : "<div>No characters</div>";

    div.innerHTML = `

      <div class="final-rank">

        <span class="medal">
          ${medal}
        </span>

        <strong>
          ${team.rank}${rankSuffix(
            team.rank
          )}
        </strong>

        <span class="final-team-name">
          ${escapeHtml(
            team.name
          )}
        </span>

      </div>


      <div class="final-score">

        Final Score:

        <strong>
          ${team.score}
        </strong>

      </div>


      <div class="final-stats">

        <div>
          Characters
          <strong>
            ${team.characters}/4
          </strong>
        </div>

        <div>
          Total Power
          <strong>
            ${team.totalPower}
          </strong>
        </div>

        <div>
          Attack
          <strong>
            ${team.totalAttack}
          </strong>
        </div>

        <div>
          Defense
          <strong>
            ${team.totalDefense}
          </strong>
        </div>

        <div>
          Speed
          <strong>
            ${team.totalSpeed}
          </strong>
        </div>

        <div>
          Hax
          <strong>
            ${team.totalHax}
          </strong>
        </div>

        <div>
          Intelligence
          <strong>
            ${team.totalIntelligence}
          </strong>
        </div>

        <div>
          Synergy
          <strong>
            ${team.totalSynergy}
          </strong>
        </div>

        <div>
          Remaining Budget
          <strong>
            ${formatMoney(
              team.budget
            )}
          </strong>
        </div>

      </div>


      <div class="final-characters">

        <h4>
          Shinobi Acquired
        </h4>

        ${players}

      </div>

    `;

    container.appendChild(
      div
    );

  });

}


// ============================================================
// START NEW GAME
// ============================================================

async function restartGame(){

  const user =
    await waitForAuth();

  const snapshot =
    await get(
      roomRef()
    );

  if(!snapshot.exists()){
    return;
  }

  const room =
    snapshot.val();

  if(
    room.hostUid!==
    user.uid
  ){

    alert(
      "Only the host can start a new game."
    );

    return;
  }

  const teams={};

  Object.entries(
    room.teams||{}
  ).forEach(
    ([uid,team])=>{

      teams[uid]={

        ...team,

        budget:
          STARTING_BUDGET,

        players:[]

      };

    }
  );

  const order =
    shuffle(
      characters.map(
        c=>c.id
      )
    );

  const first =
    getCharacter(
      order[0]
    );

  await update(
    roomRef(),
    {

      status:
        "PLAYING",

      teams,

      characterOrder:
        order,

      history:[],

      finalResults:null,

      auction:{

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
          Date.now()+
          AUCTION_TIME*1000

      }

    }
  );

}


// ============================================================
// LEAVE ROOM
// ============================================================

async function leaveRoom(){

  if(
    !currentUser ||
    !currentRoomCode
  ){

    goHome();

    return;
  }

  if(
    !confirm(
      "Leave this room?"
    )
  ){
    return;
  }

  try{

    const snapshot =
      await get(
        roomRef()
      );

    if(snapshot.exists()){

      const room =
        snapshot.val();

      if(
        room.hostUid===
        currentUser.uid
      ){

        const ids =
          Object.keys(
            room.teams||{}
          ).filter(
            id=>
              id!==currentUser.uid
          );

        if(ids.length){

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

  }catch(error){

    console.error(error);

  }

  if(timerInterval){

    clearInterval(
      timerInterval
    );

    timerInterval=null;

  }

  currentRoomCode=null;
  currentRoom=null;

  window.history.replaceState(
    {},
    document.title,
    window.location.pathname
  );

  goHome();
}


// ============================================================
// EXPOSE FUNCTIONS
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
// INITIALIZE
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  ()=>{
    checkURLRoom();
  }
);
