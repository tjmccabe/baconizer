const axios = require('axios')

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");
  root.innerHTML = "whatup"

  let movieId = 550
  axios.get(`/movies/${movieId}`)
    .then(res => console.log(res))
    .catch(err => console.log(err))

  let actorId = 287
  axios.get(`/actors/${actorId}`)
    .then(res => console.log(res))
    .catch(err => console.log(err))

})
