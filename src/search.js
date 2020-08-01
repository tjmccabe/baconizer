import * as d3 from 'd3';
import "regenerator-runtime/runtime";
const axios = require('axios')
const nameToId = require('../assets/new_name_to_id.json');
const populars = require('../assets/populars.json');
import Game from './game';

const allActorNames = Object.keys(nameToId)
const noAccents = allActorNames.map(name => name.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
const popularNames = Object.keys(populars);
let currentGame = null;

export const addSearchListeners = (g, zoom) => {
  const startModal = document.getElementById('start-modal')
  const input1 = document.getElementById('start-actor')
  const input2 = document.getElementById('end-actor')
  const dd1 = document.getElementById('dd1')
  const dd2 = document.getElementById('dd2')
  const img1 = document.getElementById('input-1-pic')
  const img2 = document.getElementById('input-2-pic')
  const randomButton1 = document.getElementById('randomize1')
  const randomButton2 = document.getElementById('randomize2')
  const baconButton1 = document.getElementById('bacon-1')
  const baconButton2 = document.getElementById('bacon-2')
  const errorMessage = document.getElementById('start-modal-error')

  const suggest = (query) => {
    if (query.length < 2 || nameToId.hasOwnProperty(query)) return null;

    const reg = new RegExp(query, 'i')

    const results = [];
    for (let i = 0; i < allActorNames.length; i++) {
      // if (noAccents[i].match(reg)) results.push(nameToId[allActorNames[i]])
      if (noAccents[i].match(reg)) results.push(allActorNames[i])
    }

    if (results.length === 0) return [];
    
    const sorted = results.sort((a,b) => {
      // if (actors[a].popularity > actors[b].popularity) return -1;
      if (nameToId[a][1] > nameToId[b][1]) return -1;
      return 1;
    })

    // return sorted.slice(0,10).map(id => actors[id].name)
    return sorted.slice(0,10)
  }

  const checkAccuracy = (query, image) => {
    let id = null;

    if (nameToId.hasOwnProperty(query)) {
      id = (nameToId[query][0])
    } else {
      const reg = new RegExp("^" + query + "$", 'i')
      for (let i = 0; i < allActorNames.length; i++) {
        if (noAccents[i].match(reg)) {
          id = (nameToId[allActorNames[i]][0])
          break
        }
      }
    }

    if (id) {
      image.parentElement.classList.add("correct")
      axios.get(`/actors/${id}`)
        .then(res => { 
          let link = res.data.profile_path
          image.src = link ? `https://image.tmdb.org/t/p/w185${link}` : "https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/profile.png"
        })
    } else {
      image.parentElement.classList.remove("correct")
      image.src = "https://baconizer-assets.s3-us-west-1.amazonaws.com/unnamed+(1).png"
    }

  }

  const enterVal = (val, dd, inp, img, e) => {
    e.stopPropagation()
    inp.value = val;
    buildResults(null, dd)
    checkAccuracy(inp.value, img)
  }

  const buildResults = (sorted, dd, inp, img) => {
    dd.innerHTML = '';

    if (sorted === null) {
      return;
    } else if (sorted.length === 0) {
      const nothin = document.createElement('li');
      nothin.className = "list-item no-matches"
      nothin.innerHTML = "No matches"
      dd.appendChild(nothin)
    } else {
      sorted.forEach(actor => {
        const li = document.createElement('li');
        li.className = "list-item"
        li.innerHTML = actor
        li.addEventListener('click', (e) => enterVal(actor, dd, inp, img, e))
        dd.appendChild(li)
      });
    }
  }

  input1.addEventListener('input', () => {
    buildResults(suggest(input1.value), dd1, input1, img1)
    checkAccuracy(input1.value, img1)
  });

  input2.addEventListener('input', () => {
    buildResults(suggest(input2.value), dd2, input2, img2)
    checkAccuracy(input2.value, img2)
  });

  const windowListen = () => {
    if (!startModal.classList.contains("inactive")) {
      buildResults(null, dd1)
      buildResults(null, dd2)
    }
  }

  window.addEventListener('click', windowListen)
  // need to copy this to newgame function ^^^

  document.getElementById('form').addEventListener("submit", (e) => {
    e.preventDefault();
    errorMessage.classList.add("inactive")
    
    let startActor = e.target[0].value;
    let endActor = e.target[1].value;

    let id1, id2;

    if (!nameToId.hasOwnProperty(startActor) || !nameToId.hasOwnProperty(endActor)) {
      const reg1 = new RegExp("^" + startActor + "$", 'i')
      const reg2 = new RegExp("^" + endActor + "$", 'i')
  
      for (let i = 0; i < allActorNames.length; i++) {
        if (noAccents[i].match(reg1)) startActor = (allActorNames[i])
        if (noAccents[i].match(reg2)) endActor = (allActorNames[i])
      }
    }


    if (nameToId.hasOwnProperty(startActor) && nameToId.hasOwnProperty(endActor)) {
      id1 = nameToId[startActor][0];
      id2 = nameToId[endActor][0];
    } else {
      errorMessage.innerText = "Please make sure both of your actors are on the list"
      errorMessage.classList.remove("inactive")
      return
    }
    
    if (id1 && id1 === id2) {
      errorMessage.innerText = "We can't make it THAT easy"
      errorMessage.classList.remove("inactive")
      return
    }

    axios.get(`/newgame/${id1}/${id2}`)
      .then(res => {
        if (currentGame) {
          // console.log(currentGame)
          currentGame.cleanUp();
        }
        currentGame = new Game(res.data[0], res.data[1], g, zoom)
        window.currentActors = [res.data[0], res.data[1]]
      })

    input1.value = ""
    input2.value = ""

    img1.src = "https://baconizer-assets.s3-us-west-1.amazonaws.com/unnamed+(1).png"
    img2.src = "https://baconizer-assets.s3-us-west-1.amazonaws.com/unnamed+(1).png"

    input1.blur()
    input2.blur()

    startModal.classList.add("inactive")
  });


  randomButton1.addEventListener('click', () => {
    let idx = Math.floor(Math.random() * popularNames.length);
    input1.value = popularNames[idx]
    checkAccuracy(input1.value, img1)
    document.getElementById('go-time').focus()
  })

  randomButton2.addEventListener('click', () => {
    let idx = Math.floor(Math.random() * popularNames.length);
    input2.value = popularNames[idx]
    checkAccuracy(input2.value, img2)
    document.getElementById('go-time').focus()
  })

  baconButton1.addEventListener('click', () => {
    input1.value = "Kevin Bacon"
    checkAccuracy(input1.value, img1)
    document.getElementById('go-time').focus()
  })

  baconButton2.addEventListener('click', () => {
    input2.value = "Kevin Bacon"
    checkAccuracy(input2.value, img2)
    document.getElementById('go-time').focus()
  })
};

export const addModalListeners = (g, zoom) => {
  const startModal = document.getElementById('start-modal')
  const abandonModal = document.getElementById("abandon-modal")
  const abandonChild = document.getElementById("abandon-child")
  const restartButton = document.getElementById("restart-game-button")
  const newGameButton = document.getElementById("new-game-button")
  const cancelButton = document.getElementById("cancel-new-game")

  const restart = () => {
    let [actor1, actor2] = window.currentActors
    if (currentGame) {
      console.log(currentGame)
      console.log("found current game")
      currentGame.cleanUp();
      console.log(currentGame)
    }
    currentGame = new Game(actor1, actor2, g, zoom)
    console.log(currentGame)
    abandonModal.classList.add("inactive")
  }
  
  const newGame = () => {
    abandonModal.classList.add("inactive")
    startModal.classList.remove("inactive")
  }
  
  const closeAbandonModal = () => {
    abandonModal.classList.add("inactive")
  }

  const stopProp = (e) => {
    e.stopPropagation()
  }

  abandonChild.addEventListener("click", (e) => stopProp(e))
  abandonModal.addEventListener("click", () => closeAbandonModal())
  cancelButton.addEventListener("click", () => closeAbandonModal())
  newGameButton.addEventListener("click", () => newGame())
  restartButton.addEventListener("click", () => restart())
}

const recenter = () => {
  if (!currentGame) return;
  currentGame.zoom.transform(d3.select("svg"), d3.zoomIdentity.scale(1))
}

const activateFilter = (e) => {
  e.preventDefault();
  if (!currentGame) return;

  const filterInput = document.getElementById('filter-input')
  const notifier = document.getElementById('filter-notifier')

  if (currentGame.filterText === filterInput.value) return;
  currentGame.filterText = filterInput.value

  if (currentGame.filterText !== "") {
    currentGame.filter()
    notifier.classList.remove("inactive")
  } else {
    currentGame.unfilter()
    notifier.classList.add("inactive")
  }
}

const resetFilter = (e) => {
  e.preventDefault();
  if (!currentGame) return;

  const filterInput = document.getElementById('filter-input')
  const notifier = document.getElementById('filter-notifier')

  if (currentGame.filterText === "") return;
  currentGame.filterText = ""
  currentGame.unfilter()
  filterInput.value = ""
  notifier.classList.add("inactive")
}

const applyHint = () => {
  if (!currentGame) return;

  const hintName = document.getElementById("hint-name")
  const hintPic = document.getElementById("hint-pic")
  if (currentGame.hint.title) {
    hintName.innerText = currentGame.hint.title
    hintPic.src = currentGame.hint.poster_path ? (
      `https://image.tmdb.org/t/p/w185${currentGame.hint.poster_path}`
    ) : (
        "https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/camera.png"
      )
  } else {
    hintName.innerText = currentGame.hint.name
    hintPic.src = currentGame.hint.profile_path ? (
      `https://image.tmdb.org/t/p/w185${currentGame.hint.profile_path}`
    ) : (
        "https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/profile.png"
      )
  }
}

const rotateHint = async () => {
  if (!currentGame || currentGame.rotating) return;
  currentGame.rotating = true

  let origId = currentGame.hint.id
  let center = currentGame.center
  const func = currentGame.hint.title ? currentGame.getBest : currentGame.getBestFromMovie

  async function loop() {
    for (let i = 0; i < 20; i++) {
      let hinty = await func(center.id)
      if (hinty.id !== origId) return true
    }
    return false
  }

  const ans = await loop()
  currentGame.rotating = false
  return ans ? true : false
}

const activateHint = (e) => {
  e.preventDefault()
  if (!currentGame) return;

  applyHint()
  document.getElementById('hint-error').classList.add("inactive")
  document.getElementById('hint-display').classList.remove("inactive")
  document.getElementById('hint-suggestion').classList.add("inactive")
  document.getElementById('hint-counter').innerText = ++currentGame.hintsUsed
}

const tryForNewHint = async (e) => {
  e.preventDefault()
  if (!currentGame) return;

  const rotated = await rotateHint()
  if (rotated) {
    applyHint()
  } else {
    document.getElementById('hint-error').classList.remove("inactive")
  }
}

const askForNewGame = () => {
  document.getElementById("abandon-modal").classList.remove("inactive")
}

export const addGameListeners = () => {
  const filterForm = document.getElementById('filter-form')
  const resetFilterButton = document.getElementById('reset-filter')
  const recenterButton = document.getElementById('recenter')
  const newGameButton = document.getElementById('new-game')

  filterForm.addEventListener("submit", (e) => activateFilter(e))
  resetFilterButton.addEventListener("click", (e) => resetFilter(e))
  recenterButton.addEventListener("click", () => recenter())
  newGameButton.addEventListener("click", () => askForNewGame())
}

export const addHintListeners = () => {
  const getHint = document.getElementById('request-hint')
  const rotateHint = document.getElementById('rotate-hint')

  rotateHint.addEventListener("click", (e) => tryForNewHint(e))
  getHint.addEventListener("click", (e) => activateHint(e))
}