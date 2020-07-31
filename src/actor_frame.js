import * as d3 from 'd3';
const axios = require('axios')

class ActorFrame {
  constructor(center, makeMove, filterText) {
    this.makeMove = makeMove
    this.filterText = filterText

    this.center = Object.assign({}, center, {
      text: center.name,
      frameId: `c${center.id}`,
      imgLink: center.profile_path ? `https://image.tmdb.org/t/p/w185${center.profile_path}` : "https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/profile.png"
    });

    this.localMovies = null;

    axios.get(`/moviesbyactor/${center.id}`)
      .then(res => {
        this.localMovies = res.data

        if (this.filterText) {
          const reg = new RegExp(this.filterText, 'i')

          for (let movieId in this.localMovies) {
            if (!this.localMovies[movieId].title.match(reg)) {
              delete this.localMovies[movieId]
            }
          }
          console.log(this.localMovies)
        }

        this.nodes = [this.center]
          .concat(Object.keys(this.localMovies).map(id => {
            const text = this.localMovies[id].title.length > 22 ? (
              this.localMovies[id].title.slice(0, 20) + '...'
            ) : (this.localMovies[id].title);
    
            return Object.assign({}, this.localMovies[id], {
              text: text,
              frameId: id,
              imgLink: this.localMovies[id].poster_path ? `https://image.tmdb.org/t/p/w185${this.localMovies[id].poster_path}` : "https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/camera.png"
            })
          })
          .sort((a, b) => {
            return (a.popularity > b.popularity) ? -1 : 1
          }))
    
        this.links = [];
        
        this.nodes.forEach((node, idx) => {
          if (idx === 0) return;
          this.links.push({source: this.center.frameId, target: node.frameId})
        })

        this.currCenterX = this.width / 2;
        this.currCenterY = this.height / 2;
        this.nodes[0].fx = this.currCenterX;
        this.nodes[0].fy = this.currCenterY;
        
        this.render();
      })
      
    this.width = window.innerWidth - 320;
    this.height = window.innerHeight;
  }
  
  render() {
    let lms = this.localMovies;
    const bound = d3.select("#thisg")
    const makeMove = this.makeMove

    this.sim = d3.forceSimulation()
      // .force("x", d3.forceX(this.width / 2).strength(.05))
      .force("y", d3.forceY(this.height / 2).strength(.2))
      .force("charge", d3.forceManyBody().strength(-3000))
      .force("link", d3.forceLink().id(d => d.frameId))
      // .force("center", d3.forceCenter(this.width / 2, this.height / 2))
      .force("collide", d3.forceCollide().radius(55))

    var link = bound.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(this.links)
      .enter()
      .append("line")

    var node = bound
      .selectAll("g.node")
      .data(this.nodes)
      .enter()
      .append("g")
      .attr("class", "node")

    var tt = d3.select("#tooltip")

    var images = node
      .append("image")
      .attr("xlink:href", d => d.imgLink)
      .attr("class", d => d.frameId[0] + " nodeimage")
      .attr("x", -25)
      .attr("y", -38)
      .attr("width", 50)
      .attr("height", 75)

    var text = node
      .append("text")
      .attr("class", "nodetext")
      .attr("text-anchor", "middle")
      .attr("y", 50)
      .attr("font-size", 12)
      .text(d => d.text)

    var cImage = images.filter((img, idx) => idx === 0)
      .attr("x", -30)
      .attr("y", -45)
      .attr("width", 60)
      .attr("height", 90)

    var cText = text.filter((txt, idx) => idx === 0)
      .attr("y", 58)
      .attr("font-size", 13)

    this.sim
      .nodes(this.nodes)
      .on("tick", ticked);

    this.sim.force("link")
      .links(this.links);

    node
      .on('mouseenter', function (d) {
        tt.transition()
          .duration(200)
          .style("opacity", .95);
        tt.html(d.name ? d.name : d.title)
          .style("left", (d3.event.pageX + 15) + "px")
          .style("top", (d3.event.pageY + 15) + "px");
      })
      .on('mousemove', function () {
        tt.style('left', (d3.event.pageX + 15) + 'px')
          .style('top', (d3.event.pageY + 15) + 'px')
      })
      .on("mouseleave", function () {
        tt.transition()
          .duration(300)
          .style("opacity", 0);
      })
      .on("mousedown", function () {
        tt.style("opacity", 0);
      });

    var setNodeEvents = images.filter((img, idx) => idx !== 0)
      // go to Movie Frame
      .on('click', function (d) {
        makeMove(lms[d.id], "actorToMovie")
      })

      .on('mouseenter', function () {
        d3.select(this)
          .transition()
          .attr("x", function (d) { return -33; })
          .attr("y", function (d) { return -60; })
          .attr("height", 100)
          .attr("width", 66);
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .attr("x", function (d) { return -25; })
          .attr("y", function (d) { return -38; })
          .attr("height", 75)
          .attr("width", 50);
      });

    function ticked() {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node.attr("transform", d => "translate(" + d.x + "," + d.y + ")");
    }
  }
}

export default ActorFrame;