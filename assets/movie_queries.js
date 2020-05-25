const min5 = require('./min_five_movies.json');
const movieInfo = require('./all_movies.json');
const filtered = require('./filtered_movies_new2.json');
const fs = require('fs');
const fetch = require('node-fetch')

movieSet = new Set();
Object.values(min5).forEach(val => {
  val.movie_ids.forEach(id => movieSet.add(id))
});

const vals = Object.values(movieInfo);
const tot = Object.values(filtered);
const setKeys = Array.from(movieSet);


console.log("Working on " + movieSet.size + " movies")
console.log("Total movies: " + vals.length)
console.log("So far: " + tot.length)

let count = 0;
let errs = 0;
let newMovies = filtered;
let errored = []

let missingIds = []

for (let i = 0; i < setKeys.length; i++) {
  if (!filtered.hasOwnProperty(setKeys[i])) {
    missingIds.push(setKeys[i])
  }
}
console.log(missingIds.length)

const filter = (res, movieId) => {
  if (res.credits && res.credits.cast) {
    let actor_ids = res.credits.cast.map(cred => cred.id)
    newMovies[res.id] = Object.assign({}, movieInfo[res.id], { poster_path: res.poster_path, overview: res.overview, release_date: res.release_date, actor_ids: actor_ids })
  } else {
    console.log(res)
    console.log(movieId)
  }
  count++;

  if (count % 100 === 0) console.log("Received " + count)

  if (count === 531 || count % 100 === 0) {
    console.log("Count: " + count)
    console.log("Errors: " + errs)
    console.log(errored)
    fs.writeFile(`filtered_movies_new3.json`, JSON.stringify(newMovies, null, "\t"), 'utf8', function (err) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }

      console.log("JSON file has been saved.");
    });
    console.log("So far: " + Object.keys(newMovies).length)
  }

}

let reqCount = 0;

const int = setInterval(() => {
  let movieId = missingIds[reqCount];
  reqCount++;
  if (!missingIds[reqCount]) clearInterval(int)

  fetch(`https://api.themoviedb.org/3/movie/${movieId}?append_to_response=credits`, {
    headers: {
      // 'Authorization': 'Bearer ' + keys.TMDBReadAccessToken,
      // 'Authorization': 'Bearer ' + disposable_secret,
      'Content-Type': `application/json;charset=utf-8`,
    }
  })
    .then((response) => {
      return response.text();
    }).then((body) => {
      let results = JSON.parse(body)
      filter(results, movieId)
    }).catch(err => {
      errored.push(movieId)
      errs++
      console.log(err)
    })
}, 250);