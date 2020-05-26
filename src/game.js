import * as d3 from 'd3';
import ActorFrame from './actor_frame';


class Game {
  constructor (startActor, endActor) {
    this.startActor = startActor;
    this.endActor = endActor;
    this.center = startActor;
    this.path = [startActor];
    
    this.frame = new ActorFrame(this.center);

    console.log(this.startActor.name)
    console.log(this.endActor.name)

    this.canvas = document.getElementById('degree')

  }

  gameOver() {
    // remove event listeners
  }
}

export default Game;