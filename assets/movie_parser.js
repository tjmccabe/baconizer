const ndjson = require('ndjson');
const fs = require('fs');

let newObj = {}
let count = 0;
let dupeCount = 0;

const stream = fs.createReadStream('./movie_ids_05_19_2020.json')
  .pipe(ndjson.parse())
  .on('data', (obj) => {
    // if (obj.original_title in newObj) {
    //   dupeCount++;
    //   if (newObj[obj.original_title].popularity < obj.popularity) newObj[obj.original_title] = obj;
    // } else {
      newObj[obj.id] = obj;
    // }
    count++;
  })

stream.on('finish', () => {
  console.log("Total: " + count)
  console.log("Dupes: " + dupeCount)
  fs.writeFile("all_movies.json", JSON.stringify(newObj, null, "\t"), 'utf8', function (err) {
    if (err) {
      console.log("An error occured while writing JSON Object to File.");
      return console.log(err);
    }
    console.log("JSON file has been saved.");
  });
})