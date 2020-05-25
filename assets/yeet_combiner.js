const combo = require('./combo.json');
const min5 = require('./min_5_movies.json');
const missing = require('./missing.json');
const fs = require('fs');

const missingNames = Object.keys(missing)
const min5Names = Object.keys(min5)
console.log("All: ", min5Names.length)
console.log("Missing: ", missingNames.length)

const selected = missingNames.filter(actor => missing[actor].movie_ids.length > 4)
console.log("Min = 5: ", selected.length)

// const selected10 = allNames.filter(actor => combo[actor].movie_ids.length > 9)
// console.log("Min = 10: ", selected10.length)

let newObj = {};

min5Names.forEach(name => newObj[name] = min5[name]);

selected.forEach(name => {
  newObj[name] = missing[name]
});
console.log("newObj keys: ", Object.keys(newObj).length)


fs.writeFile(`min_five_movies.json`, JSON.stringify(newObj, null, "\t"), 'utf8', function (err) {
  if (err) {
    console.log("An error occured while writing JSON Object to File.");
    return console.log(err);
  }
  console.log("JSON file has been saved.");
});