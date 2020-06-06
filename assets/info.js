const actors = require('./actorz.json');
const movies = require('./moviez.json');
const fs = require('fs');

let ids = Object.keys(movies)

console.log(Object.keys(actors).length)
console.log(ids.length)

let unos = ids.filter(id => movies[id].actor_ids.length === 0)

let movez = {}
unos.forEach(uno => movez[uno] = movies[uno])
console.log(movez)

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