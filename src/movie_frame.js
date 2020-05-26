import * as d3 from 'd3';
const actors = require('../assets/actor_test.json');
const movies = require('../assets/movie_test.json');

class MovieFrame {
  constructor(center, type) {
    this.center = center;
    this.type = type;
    this.nodes = 
      [this.center].concat(this.center.actor_ids.map(id => actors[id]).sort((a, b) => {
        return (a.popularity > b.popularity) ? -1 : 1
      }))

    // this.nodes.map(node => )

    this.data = { nodes: [], links: [] };

    console.log(this.center)
    console.log(this.nodes)

    this.nodes.forEach(node => {
      this.data.links.push({ source: this.center.id, target: node.id })
    })

    this.width = window.innerWidth - 20;
    this.height = window.innerHeight - 200;

    d3.select("section").append("svg")
    this.svg = d3.select("svg")

    console.log(this.data)

    this.render(true);

    this.watchWindow();
  }

  render(sizing = false) {
    if (sizing) {
      this.svg
        .attr("width", this.width)
        .attr("height", this.height)

      this.sim = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) { return d.id; }))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(this.width / 2, this.height / 2))
      //gravity(0.2)
      // .linkDistance(this.height / 6)
      // .charge(function () {
      //   return -30;
      // });
    }

    var link = this.svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(this.data.links)
      .enter()
      .append("line")

    var node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(this.data.nodes)
      .enter()
      .append("circle")
      .attr("r", 25)
    // .call(d3.drag()
    //   .on("start", dragstarted)
    //   .on("drag", dragged)
    //   .on("end", dragended));

    node.append("title")
      .text(function (d) { return d.id; });

    simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

    simulation.force("link")
      .links(graph.links);

    function ticked() {
      link
        .attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });

      node
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; });
    }
  }

  watchWindow() {
    // maybe throttle or debounce this
    this.windowWatcher = window.addEventListener("resize", () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight - 200;
      this.render(true);
    }, false);
  }
}

export default MovieFrame;