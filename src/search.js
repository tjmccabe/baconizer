const everybody = require('../assets/everybody.json');
const populars = require('../assets/most_popular.json');
const axios = require('axios');
import Game from './game';

const searchables = Object.keys(everybody);
const randomables = Object.keys(populars);


const addSearchListeners = () => {
  const input1 = document.getElementById('start-actor')
  const input2 = document.getElementById('end-actor')
  const dd1 = document.getElementById('dd1')
  const dd2 = document.getElementById('dd2')
  const randomButton = document.getElementById('randomize')

  const suggest = (query) => {
    if (query.length < 3 || everybody.hasOwnProperty(query)) return null;

    const reg = new RegExp(query, 'i')

    const results = [];
    for (let i = 0; i < searchables.length; i++) {
      if (searchables[i].match(reg)) results.push(searchables[i])
    }

    if (results.length === 0) return [];
    
    const sorted = results.sort((a,b) => {
      if (everybody[a].popularity > everybody[b].popularity) return -1;
      return 1;
    })

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
    if (everybody.hasOwnProperty(startActor) && everybody.hasOwnProperty(endActor)) {
      id1 = everybody[startActor].id;
      id2 = everybody[endActor].id;
    } else {
      window.alert("Please make sure both of your actors are on the list")
      return
    }

    if (id1 && id1=== id2) {
      window.alert("We can't make it THAT easy")
      return
    }

    let res1
    axios.get(`/actors/${id1}`)
      .then(res => {res1 = res; return axios.get(`/actors/${id2}`)})
      .then(res2 => new Game(res1.data, res2.data))
      .catch(err => console.log(err))

    input1.blur()
    input2.blur()
  });

  window.addEventListener('click', () => {
    buildResults(null, dd1)
    buildResults(null, dd2)
  })

  randomButton.addEventListener('click', () => {
    let idx1 = Math.floor(Math.random() * randomables.length);
    let idx2 = Math.floor(Math.random() * randomables.length);

    while (idx1 === idx2) {
      idx2 = Math.floor(Math.random() * randomables.length);
    }

    input1.value = randomables[idx1]
    input2.value = randomables[idx2]
  })
};

export default addSearchListeners;