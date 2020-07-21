const express = require('express')
const app = express()
const path = require('path')
// const fetch = require('node-fetch')
const keys = require('./config/keys')
const PORT = process.env.PORT || 8000; // process.env accesses heroku's environment variables

const actors = require('./assets/smol_actors.json');
const movies = require('./assets/smol_movies.json');
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

app.get('/bestscore/:act1/:act2', (req, res) => {
  let [startId, endId] = [parseInt(req.params.act1), parseInt(req.params.act2)]

  let q1 = [startId]
  let q2 = [endId]
  // paths ALWAYS start and end with an actor
  let paths1 = {[startId]: [startId]};
  let paths2 = {[endId]: []};
  let bestScore = 1;
  let seenMovies1 = new Set()
  let seenMovies2 = new Set()

  while (bestScore < 8) {
    let newQ1 = [];
    for (let i = 0; i < q1.length; i++) {
      let origActorId = q1[i]
      let mIds = actors[origActorId].movie_ids
      for (let j = 0; j < mIds.length; j++) {
        let movieId = mIds[j]
        if (seenMovies1.has(movieId)) continue
        seenMovies1.add(movieId)
        if (!movies[movieId]) continue
        let actorIds = movies[movieId].actor_ids
        for (let k = 0; k < actorIds.length; k++) {
          let newActorId = actorIds[k]
          if (paths1.hasOwnProperty(newActorId)) continue
          let path = paths1[origActorId].concat([movieId, newActorId])
          if (paths2.hasOwnProperty(newActorId)) {
            // SOLVE CONDITION
            let revved = paths2[newActorId].reverse()
            let ans = path.concat(revved)
            let full = ans.map((id, idx) => idx % 2 === 0 ? actors[id] : movies[id])
            res.send([bestScore, full, "one"])
            return
          }
          paths1[newActorId] = path
          newQ1.push(newActorId)
        }
      }
    }
    q1 = newQ1
    bestScore++

    let newQ2 = [];
    for (let i = 0; i < q2.length; i++) {
      let origActorId = q2[i]
      let mIds = actors[origActorId].movie_ids
      for (let j = 0; j < mIds.length; j++) {
        let movieId = mIds[j]
        if (seenMovies2.has(movieId)) continue
        seenMovies2.add(movieId)
        if (!movies[movieId]) continue
        let actorIds = movies[movieId].actor_ids
        for (let k = 0; k < actorIds.length; k++) {
          let newActorId = actorIds[k]
          if (paths2.hasOwnProperty(newActorId)) continue
          let path = paths2[origActorId].concat([origActorId, movieId])
          if (paths1.hasOwnProperty(newActorId)) {
            // SOLVE CONDITION
            let revved = path.reverse()
            let ans = paths1[newActorId].concat(revved)
            let full = ans.map((id, idx) => idx % 2 === 0 ? actors[id] : movies[id])
            res.send([bestScore, full, "two"])
            return
          }
          paths2[newActorId] = path
          newQ2.push(newActorId)
        }
      }
    }
    q2 = newQ2
    bestScore++
  }

  res.send([0, [], "none"])
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