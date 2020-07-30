const axios = require('axios')
import * as d3 from 'd3';

// import {search} from './search'
import addSearchListeners from './search';

document.addEventListener("DOMContentLoaded", () => {
  
  let width = window.innerWidth - 300;
  let height = window.innerHeight;
  
  d3.select("#degree").append("svg")
    .attr("width", width)
    .attr("height", height)
  
  let g = d3.select("svg")
    .append("g")
    .attr("id", "thisg")
    .attr("width", width)
    .attr("height", height)
    
  let zoom = d3.zoom()
    .scaleExtent([0.6, 4])
    .on("zoom", function () {
      g.attr("transform", d3.event.transform)
    })
    
  d3.select("svg").call(zoom)

  addSearchListeners(g, zoom)
    
  // let movieId = 550
  // // let movieId = 252406
  // axios.get(`/movies/${movieId}`)
  // .then(res => console.log(res))
  // .catch(err => console.log(err))
  
  // let actorId = 11157
  // // let actorId = 287
  // axios.get(`/actors/${actorId}`)
  //   .then(res => console.log(res))
  //   .catch(err => console.log(err))
})
