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
    this.score = 0;

    this.getBest(this.center.id)
    
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

    // this.checkWin = this.checkWin.bind(this)
    this.makeMove = this.makeMove.bind(this)
    this.frame = new ActorFrame(this.center, this.makeMove, this.zoom, this.endActor.id);
  }

  makeMove(center, type) {
    if (type === "movieToActor" && this.checkWin(center.id)) {
      window.alert("YOU WIN!")
      // Do some fun win stuff
      // Pop up a modal telling them their progress
      // Tell them the fastest they COULD have solved it
      // Tell them if they used hints or not
      // Offer to try again or put in 2 different actors
      
      // return
    }
    this.center = center
    d3.select("#thisg").selectAll("*").remove()
    if (type === "actorToMovie") {
      this.frame = new MovieFrame(center, this.makeMove);
      this.getBestFromMovie(center.id)
    } else {
      this.frame = new ActorFrame(center, this.makeMove);
      this.getBest(center.id)
    }
    this.zoom.transform(d3.select("svg"), d3.zoomIdentity.scale(1))
  }

  getBest(id) {
    axios.get(`/bestpath/${id}/${this.endActor.id}`)
      .then(res => { 
        console.log(res.data)
        // this.bestPath = res.data[1]
        // this.bestScore = res.data[0]
        return res.data
      })
  }

  getBestFromMovie(id) {
    axios.get(`/moviepath/${id}/${this.endActor.id}`)
      .then(res => {
        console.log(res.data)
        // this.bestPath = res.data[1]
        // this.bestScore = res.data[0]
        return res.data
      })
  }

  checkWin(id) {
    return id === this.endActor.id 
    // remove event listeners?
  }
}

export default Game;