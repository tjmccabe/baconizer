const actors = require('./actorz.json');
const movies = require('./moviez.json');
const fs = require('fs');

let ids = Object.keys(movies)

console.log(Object.keys(actors).length)
console.log(ids.length)

let ct = 0;

let minMovies = 20
for (let actorId in actors) {
  let numMovies = actors[actorId].movie_ids.length
  if (numMovies === 0) ct++
  if (numMovies < minMovies) minMovies = numMovies
}
console.log("num zeroes: " + ct)

// let unos = ids.filter(id => movies[id].actor_ids.length === 1)

// let movez = {}
// unos.forEach(uno => movez[uno] = movies[uno])
// console.log(movez)
let count = 0
// let doubles = 0

for (let movieId in movies) {
  let ids = new Set();
  let double = false
  let newIds = [];
  let oldIds = movies[movieId].actor_ids
  for (let i = 0; i < oldIds.length; i++) {
    let id = oldIds[i]
    if (!ids.has(id)) {
      newIds.push(id)
      ids.add(id)
    } else {
      double = true
      // doubles++
      // console.log(movieId)
    }
  }
  if (double) count++
  movies[movieId].actor_ids = newIds
}

console.log("movies changed: " + count)
// console.log("doubles: " + doubles)

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

// fs.writeFile("actorz.json", JSON.stringify(newActors, null, "\t"), 'utf8', function (err) {
//   if (err) {
//     console.log("An error occured while writing JSON Object to File.");
//     return console.log(err);
//   }

//   console.log("JSON file has been saved.");
// });