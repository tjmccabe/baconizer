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

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i)
    let temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  }
}

const actorToactors = (q, seenMovies, thisPaths, thatPaths, firstPass) => {
  shuffle(q)
  let newQ = [];
  for (let i = 0; i < q.length; i++) {
    let origActorId = q[i]
    let mIds = actors[origActorId].movie_ids
    shuffle(mIds)
    for (let j = 0; j < mIds.length; j++) {
      let movieId = mIds[j]
      if (seenMovies.has(movieId)) continue
      seenMovies.add(movieId)
      if (!movies[movieId]) continue
      let actorIds = movies[movieId].actor_ids
      shuffle(actorIds)
      for (let k = 0; k < actorIds.length; k++) {
        let newActorId = actorIds[k]
        if (thisPaths.hasOwnProperty(newActorId)) continue
        let concatted = firstPass ? [movieId, newActorId] : [origActorId, movieId]
        let path = thisPaths[origActorId].concat(concatted)
        if (thatPaths.hasOwnProperty(newActorId)) {
          // SOLVE CONDITION
          let revved = firstPass ? thatPaths[newActorId].reverse() : path.reverse()
          let ans = firstPass ? path.concat(revved) : thatPaths[newActorId].concat(revved)
          let full = ans.map((id, idx) => idx % 2 === 0 ? actors[id] : movies[id])
          return [true, full]
        }
        thisPaths[newActorId] = path
        newQ.push(newActorId)
      }
    }
  }
  return [false, newQ]
}

const movieToActors = (movieId, endActorId, thisPaths) => {
  let newQ = [];
  let actorIds = movies[movieId].actor_ids
  shuffle(actorIds)
  for (let k = 0; k < actorIds.length; k++) {
    let newActorId = actorIds[k]
    if (newActorId === endActorId) {
      return [true, [movies[movieId], actors[newActorId]]]
    }
    thisPaths[newActorId] = [newActorId]
    newQ.push(newActorId)
  }
  return [false, newQ]
}

app.get('/bestpath/:act1/:act2', (req, res) => {
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

    let firstPass = actorToactors(q1, seenMovies1, paths1, paths2, true)
    if (firstPass[0]) {
      res.send([bestScore, firstPass[1]]);
      return
    } else q1 = firstPass[1]

    bestScore++

    let secondPass = actorToactors(q2, seenMovies2, paths2, paths1, false)
    if (secondPass[0]) {
      res.send([bestScore, secondPass[1]]);
      return
    } else q2 = secondPass[1]

    console.log("yeet")

    bestScore++
  }

  res.send([0, []])
});

app.get('/moviepath/:mov1/:act2', (req, res) => {
  let [startId, endId] = [parseInt(req.params.mov1), parseInt(req.params.act2)]

  let q1 = []
  let q2 = [endId]
  // paths will eventually start with a movie and end with an actor
  let paths1 = {};
  let paths2 = {[endId]: []};
  let bestScore = 1;
  let seenMovies1 = new Set([startId])
  let seenMovies2 = new Set()

  let moviePass = movieToActors(startId, endId, paths1)
  if (moviePass[0]) {
    res.send([bestScore, moviePass[1]]);
    return
  } else q1 = moviePass[1]

  bestScore++

  while (bestScore < 9) {

    let firstPass = actorToactors(q1, seenMovies1, paths1, paths2, true)
    if (firstPass[0]) {
      res.send([bestScore, [movies[startId]].concat(firstPass[1])]);
      return
    } else q1 = firstPass[1]

    bestScore++

    let secondPass = actorToactors(q2, seenMovies2, paths2, paths1, false)
    if (secondPass[0]) {
      res.send([bestScore, [movies[startId]].concat(secondPass[1])]);
      return
    } else q2 = secondPass[1]

    bestScore++
  }

  res.send([0, []])
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