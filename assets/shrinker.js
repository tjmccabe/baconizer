const actors = require('./smol_actors.json');
const movies = require('./smol_movies.json');
const fs = require('fs');

fs.writeFile("smol_actors.json", JSON.stringify(actors, null), 'utf8', function (err) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.");
    return console.log(err);
  }

  console.log("JSON file has been saved.");
});

fs.writeFile("smol_movies.json", JSON.stringify(movies, null), 'utf8', function (err) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.");
    return console.log(err);
  }

  console.log("JSON file has been saved.");
});