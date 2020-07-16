const express = require('express')
const app = express()
const path = require('path')
// const fetch = require('node-fetch')
const keys = require('./config/keys')
const PORT = process.env.PORT || 8000; // process.env accesses heroku's environment variables

const actors = require('./assets/new_actors.json');
const movies = require('./assets/new_movies.json');
console.log(Object.keys(actors).length + " actors")
console.log(Object.keys(movies).length + " movies")

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/actors/:actorId', (req, res) => {
  let id = req.params.actorId
  let actor = actors[id]
  res.send(actor)
});

app.get('/actorsbymovie/:movieId', (req, res) => {
  let movId = req.params.movieId
  let movie = movies[movId]
  let ids = movie.actor_ids
  let actorsByMovie = {}
  ids.forEach(id => actorsByMovie[id] = actors[id])
  res.send(actorsByMovie)
});

app.get('/newgame/:act1/:act2', (req, res) => {
  let id1 = req.params.act1
  let id2 = req.params.act2
  let actor1 = actors[id1]
  let actor2 = actors[id2]
  res.send([actor1, actor2])
});

app.get('/movies/:movieId', (req, res) => {
  let id = req.params.movieId
  let movie = movies[id]
  res.send(movie)
});

app.get('/moviesbyactor/:actorId', (req, res) => {
  let actId = req.params.actorId
  let actor = actors[actId]
  let ids = actor.movie_ids
  let moviesByActor = {}
  ids.forEach(id => moviesByActor[id] = movies[id])
  res.send(moviesByActor)
});

// EXAMPLE OF FULL API REQ:

// app.get('/actors/:actorId', (request, response) => {
//   fetch(`https://api.themoviedb.org/3/person/${request.params.actorId}?append_to_response=movie_credits`, {
//     headers: {
//     'Authorization': 'Bearer ' + keys.TMDBReadAccessToken,
//     'Content-Type': `application/json;charset=utf-8`,
//   }})
//     .then((response) => {
//       return response.text();
//     }).then((body) => {
//       let results = JSON.parse(body)
//       response.send(results)
//     }).catch(err => {
//       console.log(err)
//     })
// });


app.listen(PORT, () => {
  console.log(__dirname);
  console.log(`listening on ${PORT}`)
})