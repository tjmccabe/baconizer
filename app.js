const express = require('express')
const app = express()
const path = require('path')
// const fetch = require('node-fetch')
const PORT = process.env.PORT || 8000; // process.env accesses heroku's environment variables
const keys = PORT === 8000 ? require('./config/keys') : null

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

// const actorToactors = (q, seenMovies, thisPaths, thatPaths, firstPass) => {
//   shuffle(q)
//   let newQ = [];
//   for (let i = 0; i < q.length; i++) {
//     let origActorId = q[i]
//     let mIds = actors[origActorId].movie_ids
//     shuffle(mIds)
//     for (let j = 0; j < mIds.length; j++) {
//       let movieId = mIds[j]
//       if (seenMovies.has(movieId)) continue
//       seenMovies.add(movieId)
//       if (!movies[movieId]) continue
//       let actorIds = movies[movieId].actor_ids
//       shuffle(actorIds)
//       for (let k = 0; k < actorIds.length; k++) {
//         let newActorId = actorIds[k]
//         if (thisPaths.hasOwnProperty(newActorId)) continue
//         let concatted = firstPass ? [movieId, newActorId] : [origActorId, movieId]
//         let path = thisPaths[origActorId].concat(concatted)
//         if (thatPaths.hasOwnProperty(newActorId)) {
//           // SOLVE CONDITION
//           let revved = firstPass ? thatPaths[newActorId].reverse() : path.reverse()
//           let ans = firstPass ? path.concat(revved) : thatPaths[newActorId].concat(revved)
//           let full = ans.map((id, idx) => idx % 2 === 0 ? actors[id] : movies[id])
//           return [true, full]
//         }
//         thisPaths[newActorId] = path
//         newQ.push(newActorId)
//       }
//     }
//   }
//   return [false, newQ]
// }

const actorToactors = (q, seenMovies, thisPaths, thatPaths, firstPass, mta) => {
  shuffle(q)
  let newQ = [];
  let results = [];
  let resultIds = new Set()
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
        if (thisPaths.hasOwnProperty(newActorId)) {
          continue
        }
        let concatted = firstPass ? [movieId, newActorId] : [origActorId, movieId]
        let path = thisPaths[origActorId].concat(concatted)
        if (thatPaths.hasOwnProperty(newActorId)) {
          // ADD THE MOVIE TO RESULTS
          let revved = firstPass ? thatPaths[newActorId].reverse() : path.reverse()
          let ans = firstPass ? path.concat(revved) : thatPaths[newActorId].concat(revved)
          let [resId, res] = mta ? [ans[0], actors[ans[0]]] : [ans[1], movies[ans[1]]]
          if (!resultIds.has(resId)) results.push(res)
          resultIds.add(resId)
        }
        thisPaths[newActorId] = path
        newQ.push(newActorId)
      }
    }
  }
  return results.length ? [true, results] : [false, newQ]
}

const A2M = (q, seenMovies, thisAPaths, thisMPaths, thatMPaths, firstPass, mCenter) => {
  shuffle(q)
  let newQ = new Set();
  let results = [];
  let resultIds = new Set()
  for (let i = 0; i < q.length; i++) {
    let origActorId = q[i]
    let mIds = actors[origActorId].movie_ids
    shuffle(mIds)
    for (let j = 0; j < mIds.length; j++) {
      let movieId = mIds[j]
      if (!movies[movieId] || seenMovies.has(movieId)) continue
      let newPaths = []
      thisAPaths[origActorId].forEach(origPath => {
        newPaths.push(origPath.concat([movieId]))
      })
      thisMPaths[movieId] = thisMPaths[movieId] ? 
        thisMPaths[movieId].concat(newPaths) : newPaths 

      if (thatMPaths.hasOwnProperty(movieId)) {
        let ansPaths = firstPass ? thisMPaths[movieId] : thatMPaths[movieId]
        ansPaths.forEach(path => {
          if (!resultIds.has(path[1])) {
            let target = mCenter ? actors[path[1]] : movies[path[1]]
            results.push(target)
            resultIds.add(path[1])
          }
        })
      }
      newQ.add(movieId)
    }
  }
  return results.length ? [true, results] : [false, Array.from(newQ.keys())]
}

const M2A = (q, seenActors, thisMPaths, thisAPaths, thatAPaths, firstPass, mCenter) => {
  shuffle(q)
  let newQ = new Set();
  let results = [];
  let resultIds = new Set()
  for (let i = 0; i < q.length; i++) {
    let origMovieId = q[i]
    let aIds = movies[origMovieId].actor_ids
    shuffle(aIds)
    for (let j = 0; j < aIds.length; j++) {
      let actorId = aIds[j]
      if (!actors[actorId] || seenActors.has(actorId)) continue
      let newPaths = []
      thisMPaths[origMovieId].forEach(origPath => {
        newPaths.push(origPath.concat([actorId]))
      })
      thisAPaths[actorId] = thisAPaths[actorId] ? 
        thisAPaths[actorId].concat(newPaths) : newPaths 

      if (thatAPaths.hasOwnProperty(actorId)) {
        let ansPaths = firstPass ? thisAPaths[actorId] : thatAPaths[actorId]
        ansPaths.forEach(path => {
          if (!resultIds.has(path[1])) {
            let target = mCenter ? actors[path[1]] : movies[path[1]]
            results.push(target)
            resultIds.add(path[1])
          }
        })
      }
      newQ.add(actorId)
    }
  }
  return results.length ? [true, results] : [false, Array.from(newQ.keys())]
}

// const movieToActors = (movieId, endActorId, thisPaths) => {
//   let newQ = [];
//   let actorIds = movies[movieId].actor_ids
//   shuffle(actorIds)
//   for (let k = 0; k < actorIds.length; k++) {
//     let newActorId = actorIds[k]
//     if (newActorId === endActorId) {
//       return [true, [movies[movieId], actors[newActorId]]]
//     }
//     thisPaths[newActorId] = [newActorId]
//     newQ.push(newActorId)
//   }
//   return [false, newQ]
// }

app.get('/bestpath/:act1/:act2', (req, res) => {
  let [startId, endId] = [parseInt(req.params.act1), parseInt(req.params.act2)]

  let q1 = [startId]
  let q2 = [endId]

  let actorPaths1 = {[startId]: [[startId]]};
  let actorPaths2 = {[endId]: [[endId]]};
  let moviePaths1 = {}
  let moviePaths2 = {}
  let seenActors1 = new Set([startId])
  let seenActors2 = new Set([endId])
  let seenMovies1 = new Set()
  let seenMovies2 = new Set()
  let bestScore = 1;


  while (bestScore < 9.5) {
    let firstA2M = A2M(q1, seenMovies1, actorPaths1, moviePaths1, moviePaths2, true)
    if (firstA2M[0]) {
      res.send([bestScore, firstA2M[1]]);
      return
    } else {
      q1 = firstA2M[1]
      q1.forEach(movieId => seenMovies1.add(movieId))
    }

    let secondA2M = A2M(q2, seenMovies2, actorPaths2, moviePaths2, moviePaths1, false)
    if (secondA2M[0]) {
      res.send([bestScore, secondA2M[1]]);
      return
    } else {
      q2 = secondA2M[1]
      q2.forEach(movieId => seenMovies2.add(movieId))
    }

    bestScore++

    let firstM2A = M2A(q1, seenActors1, moviePaths1, actorPaths1, actorPaths2, true)
    if (firstM2A[0]) {
      res.send([bestScore, firstM2A[1]]);
      return
    } else {
      q1 = firstM2A[1]
      q1.forEach(actorId => seenActors1.add(actorId))
    }

    let secondM2A = M2A(q2, seenActors2, moviePaths2, actorPaths2, actorPaths1, false)
    if (secondM2A[0]) {
      res.send([bestScore, secondM2A[1]]);
      return
    } else {
      q2 = secondM2A[1]
      q2.forEach(actorId => seenActors2.add(actorId))
    }

    bestScore++
  }

  res.send([0, []])
});

app.get('/moviepath/:mov1/:act2', (req, res) => {
  let [startId, endId] = [parseInt(req.params.mov1), parseInt(req.params.act2)]

  let q2 = [endId]

  let actorPaths1 = {};
  let actorPaths2 = { [endId]: [[endId]] };
  let moviePaths1 = { [startId]: [[startId]] }
  let moviePaths2 = {}
  let seenActors1 = new Set()
  let seenActors2 = new Set([endId])
  let seenMovies1 = new Set([startId])
  let seenMovies2 = new Set()
  let bestScore = 1;

  let newQ = [];
  let actorIds = movies[startId].actor_ids
  shuffle(actorIds)
  for (let k = 0; k < actorIds.length; k++) {
    let newActorId = actorIds[k]
    if (newActorId === endId) {
      res.send([bestScore, [actors[newActorId]]])
      return 
    }
    actorPaths1[newActorId] = [[startId, newActorId]]
    seenActors1.add(newActorId)
    newQ.push(newActorId)
  }
  let q1 = newQ

  while (bestScore < 8.5) {

    let firstA2M = A2M(q1, seenMovies1, actorPaths1, moviePaths1, moviePaths2, true, true)
    if (firstA2M[0]) {
      res.send([bestScore, firstA2M[1]]);
      return
    } else {
      q1 = firstA2M[1]
      q1.forEach(movieId => seenMovies1.add(movieId))
    }

    let secondA2M = A2M(q2, seenMovies2, actorPaths2, moviePaths2, moviePaths1, false, true)
    if (secondA2M[0]) {
      res.send([bestScore, secondA2M[1]]);
      return
    } else {
      q2 = secondA2M[1]
      q2.forEach(movieId => seenMovies2.add(movieId))
    }

    bestScore++

    let firstM2A = M2A(q1, seenActors1, moviePaths1, actorPaths1, actorPaths2, true, true)
    if (firstM2A[0]) {
      res.send([bestScore, firstM2A[1]]);
      return
    } else {
      q1 = firstM2A[1]
      q1.forEach(actorId => seenActors1.add(actorId))
    }

    let secondM2A = M2A(q2, seenActors2, moviePaths2, actorPaths2, actorPaths1, false, true)
    if (secondM2A[0]) {
      res.send([bestScore, secondM2A[1]]);
      return
    } else {
      q2 = secondM2A[1]
      q2.forEach(actorId => seenActors2.add(actorId))
    }

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