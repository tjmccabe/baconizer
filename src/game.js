import * as d3 from 'd3';
import Board from './board';


class Game {
  constructor (startActor, endActor) {
    this.startActor = startActor;
    this.endActor = endActor;
    this.center = startActor;
    // this.board = new Board(center);

    // debugger

    // this.canvas = d3.select("#degree")
    this.canvas = document.getElementById('degree')
    this.canvas.width = window.innerWidth - 20;
    this.canvas.height = window.innerHeight - 200;
    this.context = this.canvas.getContext("2d")

    this.vis = d3.select("#degree")
      .append("svg")
      .attr("width", this.canvas.width)
      .attr("height", this.canvas.height)

    this.sim = d3.forceSimulation()
      .force("link", d3.forceLink(center.movie_credits.cast).id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(this.canvas.width / 2, this.canvas.width / 2));

    this.watchWindow()
  }

  render() {
    // const d3canvas = d3.select("#degree")
    // this.vis
    //   .data([this.center])

    

    // d3.data(this.center, (error, graph) => {
    //   if (error) throw error;

    //   this.sim
    //     .nodes(graph.nodes)
    //     .on("tick", ticked)

    //   root = graph;
    //   root.fixed = true;
    //   root.x = this.canvas.width/2;
    //   root.y = this.canvas.height/2;

    //   // Build the path
    //   var defs = this.canvas.insert("svg:defs")
    //     .data(["end"]);

    //   defs.enter().append("svg:path")
    //     .attr("d", "M0,-5L10,0L0,5");

    //   // update();
    // });
  }

  gameOver() {
    // remove event listeners
  }

  watchWindow () {
    // maybe throttle or debounce this
    this.windowWatcher = window.addEventListener("resize", () => {
      this.canvas.width = window.innerWidth - 20;
      this.canvas.height = window.innerHeight - 200;
      this.sim
        .force("center", d3.forceCenter(this.canvas.width / 2, this.canvas.width / 2));
      this.render()
    }, false);
    this.render();
  }
}

export default Game;