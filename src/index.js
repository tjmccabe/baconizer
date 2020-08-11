const axios = require('axios')
import * as d3 from 'd3';

import { 
  addSearchListeners, 
  addModalListeners, 
  addGameListeners,
  addHintListeners
} from './search';

document.addEventListener("DOMContentLoaded", () => {
  
  let width = window.innerWidth - 320;
  let height = window.innerHeight;

  const degree = d3.select("#degree")
  
  const svg = degree.append("svg")
    .attr("width", width)
    .attr("height", height)

  svg.append("defs")
    .append("filter")
    .attr("id", "shadow")
    .append("feDropShadow")
    .attr("dx", 0)
    .attr("dy", 0)
    .attr("stdDeviation", 2)
    .attr("flood-color", "black")
  
  let g = svg
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
  addModalListeners(g, zoom)
  addGameListeners()
  addHintListeners()

  // if query line params exist, try to make a new game out of them
})
