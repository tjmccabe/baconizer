const actors = require('./actors_by_id.json');
// const movies = require('./movies_by_id.json');
const fs = require('fs');

console.log(Object.keys(actors).length)
// console.log(Object.keys(movies).length)

// let newMovies = {};
let newActors = {};

Object.values(actors).forEach(actor => {
  let byear = actor.birthday ? parseInt(actor.birthday.split('-')[0]) : null;
  let newActor = { id: actor.id,
                  name: actor.original_title,
                  popularity: actor.popularity,
                  profile_path: actor.profile_path,
                  byear,
                  movie_ids: actor.movie_ids
                }
  newActors[actor.id] = Object.assign({}, newActor)
})

fs.writeFile("actor_test.json", JSON.stringify(newActors, null, "\t"), 'utf8', function (err) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.");
    return console.log(err);
  }

  console.log("JSON file has been saved.");
});