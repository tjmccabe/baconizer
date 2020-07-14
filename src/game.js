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
      .call(d3.zoom().on("zoom", function () {
        d3.select("#thisg").attr("transform", d3.event.transform)
      }))

    this.frame = new ActorFrame(this.center);
  }

  gameOver() {
    // remove event listeners
  }
}

export default Game;