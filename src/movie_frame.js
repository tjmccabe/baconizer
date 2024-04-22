import * as d3 from 'd3';
const axios = require('axios')

class MovieFrame {
  constructor(center, makeMove, filterText) {
    this.makeMove = makeMove
    this.filterText = filterText

    this.center = Object.assign({}, center, {
      text: center.title,
      frameId: `c${center.id}`,
      imgLink: center.poster_path ? `https://image.tmdb.org/t/p/w185${center.poster_path}` : "https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/images/cameraiconbkg.jpg"
    });

    this.localActors = null

    axios.get(`/actorsbymovie/${center.id}`)
      .then(res => {
        this.localActors = res.data

        if (this.filterText) {
          const reg = new RegExp(this.filterText, 'i')

          for (let actorId in this.localActors) {
            if (!this.localActors[actorId].name.match(reg)) {
              delete this.localActors[actorId]
            }
          }
        }

        this.nodes = [this.center]
          .concat(Object.keys(this.localActors).map(id => {
            const text = this.localActors[id].name.length > 22 ? (
              this.localActors[id].name.slice(0, 20) + '...'
            ) : (this.localActors[id].name);
    
            return Object.assign({}, this.localActors[id], {
              text: text,
              frameId: id,
              imgLink: this.localActors[id].profile_path ? `https://image.tmdb.org/t/p/w185${this.localActors[id].profile_path}` : "https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/images/actoriconbkg.jpg"
            })
          })
          .sort((a, b) => {
            return (a.popularity > b.popularity) ? -1 : 1
          }))
    
        this.links = [];
    
        this.nodes.forEach((node, idx) => {
          if (idx === 0) return;
          this.links.push({ source: this.center.frameId, target: node.frameId })
        })
    
        this.currCenterX = this.width / 2;
        this.currCenterY = this.height / 2;
        this.nodes[0].fx = this.currCenterX;
        this.nodes[0].fy = this.currCenterY;
        
        this.render();
        return
      })
      
    this.width = window.innerWidth - 320;
    this.height = window.innerHeight;
  }
  
  render() {
    let las = this.localActors
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
      .attr("class", d => `${d.frameId[0]} nodeimage`)
      .attr("id", d => `image-${d.frameId}`)
      .attr("x", -25)
      .attr("y", -38)
      .attr("height", 75)
      .attr("width", 50)
      // .style("filter", "url(#shadow)")

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
      .on('mouseenter', function (event, d) {
        tt.transition()
          .duration(200)
          .style("opacity", .95);
        tt.html(d.name ?? d.title)
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY + 15) + "px");
      })
      .on('mousemove', function (event) {
        tt.style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY + 15) + 'px')
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
      // go to Actor Frame
      .on('click', function (event, d) {
        makeMove(las[d.id], "movieToActor")
      })

      .on('mouseenter', function () {
        d3.select(this)
          .transition()
          .attr("x", (_) => -33)
          .attr("y", (_) => -60)
          .attr("height", 100)
          .attr("width", 66);
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .attr("x", (_) => -25)
          .attr("y", (_) => -38)
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

export default MovieFrame;