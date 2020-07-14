import * as d3 from 'd3';
import ActorFrame from './actor_frame';


class Game {
  constructor (startActor, endActor) {
    this.startActor = startActor;
    this.endActor = endActor;
    this.center = startActor;
    this.path = [startActor];
    
    
    console.log(this.startActor.name)
    console.log(this.endActor.name)
    
    this.width = window.innerWidth;
    this.height = window.innerHeight - 70;
    
    this.canvas = document.getElementById('degree')
    this.svg = d3.select("section").append("svg")
      .attr("width", this.width)
      .attr("height", this.height)

    // this.svg.on("mousedown", () => this.svg.style("cursor", "grabbing"))
    // this.svg.on("mouseup", () => d3.select(this).style("cursor", "move"))

    this.frame = new ActorFrame(this.center);
  }

  gameOver() {
    // remove event listeners
  }
}

export default Game;