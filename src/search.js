import * as d3 from 'd3';
const axios = require('axios')
const nameToId = require('../assets/new_name_to_id.json');
const populars = require('../assets/populars.json');
import Game from './game';

const allActorNames = Object.keys(nameToId)
const noAccents = allActorNames.map(name => name.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
const popularNames = Object.keys(populars);
let currentGame = null;

const addSearchListeners = () => {
  const input1 = document.getElementById('start-actor')
  const input2 = document.getElementById('end-actor')
  const dd1 = document.getElementById('dd1')
  const dd2 = document.getElementById('dd2')
  const randomButton = document.getElementById('randomize')

  const suggest = (query) => {
    if (query.length < 3 || nameToId.hasOwnProperty(query)) return null;

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

  const enterVal = (val, dd, inp, e) => {
    e.stopPropagation()
    inp.value = val;
    buildResults(null, dd)
  }

  const buildResults = (sorted, dd, inp) => {
    dd.innerHTML = '';

    if (sorted === null) {
      return;
    } else if (sorted.length === 0) {
      const nothin = document.createElement('li');
      nothin.className = "list-item inactive"
      nothin.innerHTML = "No matches"
      dd.appendChild(nothin)
    } else {
      sorted.forEach(actor => {
        const li = document.createElement('li');
        li.className = "list-item"
        li.innerHTML = actor
        li.addEventListener('click', (e) => enterVal(actor, dd, inp, e))
        dd.appendChild(li)
      });
    }
  }

  input1.addEventListener('input', () => {
    buildResults(suggest(input1.value), dd1, input1)
  });

  input2.addEventListener('input', () => {
    buildResults(suggest(input2.value), dd2, input2)
  });

  document.getElementById('form').addEventListener("submit", (e) => {
    e.preventDefault();
    
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
      window.alert("Please make sure both of your actors are on the list")
      return
    }

    if (id1 && id1 === id2) {
      window.alert("We can't make it THAT easy")
      return
    }

    d3.select("svg").remove();

    axios.get(`/newgame/${id1}/${id2}`)
      .then(res => { currentGame = new Game(res.data[0], res.data[1]) })

    input1.blur()
    input2.blur()
  });

  window.addEventListener('click', () => {
    buildResults(null, dd1)
    buildResults(null, dd2)
  })

  randomButton.addEventListener('click', () => {
    let idx1 = Math.floor(Math.random() * popularNames.length);
    let idx2 = Math.floor(Math.random() * popularNames.length);

    while (idx1 === idx2) {
      idx2 = Math.floor(Math.random() * popularNames.length);
    }

    input1.value = popularNames[idx1]
    input2.value = popularNames[idx2]
    document.getElementById('go-time').focus()
  })
};

export default addSearchListeners;