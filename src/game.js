import * as d3 from 'd3';
const axios = require('axios')
import ActorFrame from './actor_frame';
import MovieFrame from './movie_frame'


class Game {
  constructor (startActor, endActor) {
    this.startActor = startActor;
    this.endActor = endActor;
    this.center = startActor;
    this.path = [startActor];
    [this.bestScore, this.bestPath] = this.getBest()
    this.score = 0;
    
    this.width = window.innerWidth;
    this.height = window.innerHeight - 70;
    
    this.svg = d3.select("#degree").append("svg")
      .attr("width", this.width)
      .attr("height", this.height)

    let g

    this.g = g = d3.select("svg")
      .append("g")
      .attr("id", "thisg")
      .attr("width", this.width)
      .attr("height", this.height)

    this.zoom = d3.zoom()
      .scaleExtent([0.6, 4])
      .on("zoom", function () {
        g.attr("transform", d3.event.transform)
      })

    d3.select("svg").call(this.zoom)

    this.frame = new ActorFrame(this.center, this.zoom);
  }

  getBest() {
    axios.get(`/bestscore/${this.startActor.id}/${this.endActor.id}`)
      .then(res => { 
        return res.data
      })
    
  }

  gameOver() {
    // remove event listeners
  }
}

export default Game;