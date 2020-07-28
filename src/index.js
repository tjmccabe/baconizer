const axios = require('axios')

// import {search} from './search'
import addSearchListeners from './search';

document.addEventListener("DOMContentLoaded", () => {
  // const modal = document.getElementById("modal")
  // modal.classList.add("loaded");

  // const canvas = document.getElementById("degree");

  // canvas.width = window.innerWidth - 300;
  // canvas.height = window.innerHeight;

  addSearchListeners()
  
  let movieId = 550
  // let movieId = 252406
  axios.get(`/movies/${movieId}`)
  .then(res => console.log(res))
  .catch(err => console.log(err))
  
  let actorId = 11157
  // let actorId = 287
  axios.get(`/actors/${actorId}`)
    .then(res => console.log(res))
    .catch(err => console.log(err))
})
