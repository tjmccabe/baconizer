const pops = require('./populars.json')
const n2i = require('./new_name_to_id.json')
const { scaleIdentity } = require('d3')
// const fs = require('fs');

let setty = new Set()

let names = Object.keys(pops)

names.forEach(name => {
  if (setty.has(name)) console.log("double: " + name)
  if (!n2i[name]) console.log("error: " + name)
  setty.add(name)
})


// fs.writeFile("populars.json", JSON.stringify(newHash, null, '\t'), 'utf8', function (err) {
//   if (err) {
//     console.log("An error occured while writing JSON Object to File.");
//     return console.log(err);
//   }

//   console.log("JSON file has been saved.");
// });