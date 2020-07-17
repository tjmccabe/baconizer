const actors = require('./smol_actors.json');
const movies = require('./smol_movies.json');
const fs = require('fs');

// let ids = Object.keys(movies)

console.log(Object.keys(actors).length)
console.log(Object.keys(movies).length)

// let ct = 0;

let fewActors = []
for (let movieId in movies) {
  let ids = new Set();
  let newIds = [];
  let oldIds = movies[movieId].actor_ids
  for (let i = 0; i < oldIds.length; i++) {
    let id = oldIds[i]
    if (!ids.has(id)) {
      newIds.push(id)
      ids.add(id)
    }
  }
  movies[movieId].actor_ids = newIds
  
  let numActors = movies[movieId].actor_ids.length
  if (numActors < 2) {
    fewActors.push(movieId)
  }
}

let noMovies = []
for (let actorId in actors) {
  let ids = new Set();
  let newIds = [];
  let oldIds = actors[actorId].movie_ids
  for (let i = 0; i < oldIds.length; i++) {
    let id = oldIds[i]
    if (!ids.has(id)) {
      newIds.push(id)
      ids.add(id)
    }
  }
  actors[actorId].movie_ids = newIds

  fewActors.forEach(movieId => {
    if (actors[actorId].movie_ids.indexOf(movieId) > -1) {
      actors[actorId].movie_ids = actors[actorId].movie_ids.filter(id => id !== movieId)
    }
  })

  let numMovies = actors[actorId].movie_ids.length
  if (numMovies === 0) {
    noMovies.push(actorId)
  }
}

// let fas = new Set()
// let nms = new Set()

fewActors.forEach(id => {
  delete movies[id]
  // fas.add(id)
})

noMovies.forEach(id => {
  delete actors[id]
  // nms.add(id)
})

// let straggleMs = 0
// let straggleAs = 0
// let npm = 0
// let npa = 0

// Object.keys(actors).forEach(aId => {
//   let arr = actors[aId].movie_ids
//   if (actors[aId].movie_ids.length < 1) straggleAs++
//   arr.forEach(ele => { if (fas.has(ele)) npm++ })
// })

// Object.keys(movies).forEach(mId => {
//   let arr = movies[mId].actor_ids
//   if (arr.length < 2) straggleMs++
//   arr.forEach(ele => {if (nms.has(ele)) npa++})
// })

console.log(Object.keys(actors).length)
console.log(Object.keys(movies).length)
// console.log("straggle actors: " + straggleAs)
// console.log("straggle movies: " + straggleMs)
// console.log("no partner actors: " + npa)
// console.log("no partner movies: " + npm)

// let unos = ids.filter(id => movies[id].actor_ids.length === 1)

// let movez = {}
// unos.forEach(uno => movez[uno] = movies[uno])
// console.log(movez)

// let newMovies = {};
// let newActors = {};
// let nameToId = {};

// Object.values(actors).forEach(actor => {
//   let newMovieIds = [];
//   actor.movie_ids.forEach(mid => {
//     if (movies.hasOwnProperty(mid)) {
//       newMovieIds.push(mid)
//     }
//   })

//   newActors[actor.id] = Object.assign(actor, {movie_ids: newMovieIds})
// })

// console.log(Object.keys(newActors).length)

fs.writeFile("new_actors.json", JSON.stringify(actors, null, "\t"), 'utf8', function (err) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.");
    return console.log(err);
  }

  console.log("JSON file has been saved.");
});

fs.writeFile("new_movies.json", JSON.stringify(movies, null, "\t"), 'utf8', function (err) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.");
    return console.log(err);
  }

  console.log("JSON file has been saved.");
});