import * as d3 from 'd3';
import Frame from './frame';


class Game {
  constructor (startActor, endActor) {
    this.startActor = startActor;
    this.endActor = endActor;
    this.center = startActor;
    this.frame = new Frame(this.center);

    console.log(this.startActor.name)
    console.log(this.endActor.name)

    this.canvas = document.getElementById('degree')

    this.watchWindow()
  }

  gameOver() {
    // remove event listeners
  }

  watchWindow () {
    // maybe throttle or debounce this
    this.windowWatcher = window.addEventListener("resize", () => {
      this.canvas.width = window.innerWidth - 20;
      this.canvas.height = window.innerHeight - 200;
    }, false);
  }
}

export default Game;