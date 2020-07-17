const actors = require('./smol_actors.json');
const movies = require('./smol_movies.json');
const fs = require('fs');

let n2ip = {}

let ids = Object.keys(actors)

ids.forEach(id => {
  n2ip[actors[id].name] = [id, actors[id].popularity]
})

fs.writeFile("new_name_to_id.json", JSON.stringify(n2ip, null), 'utf8', function (err) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.");
    return console.log(err);
  }

  console.log("JSON file has been saved.");
});