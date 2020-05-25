import * as d3 from 'd3';
const actors = require('../assets/actor_test.json');
const movies = require('../assets/movie_test.json');

class Frame {
  constructor(center, type) {
    this.center = center;
    this.type = type;
    this.spokes = this.type === "actor" ? (
      this.center.movie_ids.map(id => movies[id]).sort((a, b) => {
        return (a.popularity > b.popularity) ? -1 : 1
      })
    ) : (
      this.center.actor_ids.map(id => actors[id]).sort((a, b) => {
        return (a.popularity > b.popularity) ? -1 : 1
      })
    )
    console.log(this.spokes)
  }

  render() {

  }
}

export default Frame;