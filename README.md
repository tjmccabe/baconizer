# Baconizer

Can you beat 6 degrees of separation? The goal of this game is to find the shortest path between any 2 actors by jumping between movies and actors.

### [Live Link](https://baconizer.herokuapp.com/)

<img src="https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/images/feature.jpg" alt="Baconizer basics">

Baconizer is based on the <a href="https://en.wikipedia.org/wiki/Six_Degrees_of_Kevin_Bacon" target="_blank">6 Degrees of Kevin Bacon</a> parlor game.

<img src="https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/images/feature_path.png" alt="Baconizer win">

## Technologies

* Backend: Node.JS, Express
* Frontend: D3.js, JavaScript, HTML & CSS
* Hosting: Heroku

## Features
### Massive Database

Baconizer has a local database of over <b>100,000 actors</b> and over <b>200,000 movies</b>, comprising about 100MB of raw data. This database was obtained by making millions of API calls to <a href="https://www.themoviedb.org/" target="_blank">TMDb</a> (not to be confused with IMDb) and then pruning and cleaning the responses after writing them all to local files. For example, movies with a single actor were removed as they would not provide a link between actors.

Every time the backend server starts up, it reads through this local database and holds references to every actor and movie as nodes in a large graph. This allows for highly responsive performance when traversing this data.

Manufacturing a proprietary database and ensuring that kind of speed and performance was necessary based on the scope of the operations we're using in the guided gameplay functionality described below.

### Guided Gameplay through Hints

Hints are key to the Baconizer gameplay experience: they provide . But in order to get hints in the first place, we need to know all possible shortest paths to get from our start actor to our end actor, which seems like a massive undertaking.

Baconizer is able to gather these paths every time a player makes a move, recalculating the best paths based on the player's new position.

Here's how:

**Bi-directional Breadth First Search**

We need to work our way into the data starting from our center node and branching out one step at a time. We can improve upon the basic strategy by starting the same search from our endpoint as well and working both sides of the problem. The images below both represent the same graph. Notice how if we start from both sides, we waste a lot fewer resources checking dead ends before getting to the answer.

<p align="center">
  <img src="https://baconizer-assets.s3-us-west-1.amazonaws.com/bdbfs.png" alt="Bi-directional BFS">
</p>

Here's simplified part of the BFS function we call when we have a current search rung of actors and we're trying to get to a new level of movies:

```javascript
const actors2Movies = (queue, BFS1SeenMovies, BFS2SeenMovies, firstSteps) => {
  // If our search ends at this level, winnerIds will hold the answers
  let winnerIds = new Set();
  
  // Let's loop through our starting queue to get to all the movies they've collectively starred in
  for (let i = 0; i < queue.length; i++) {
    let origActorId = queue[i]
    
    // "actors" is the local object holding over 100,000 entries
    // Let's loop through all the movies one actor starred in
    let mIds = actors[origActorId].movie_ids
    for (let j = 0; j < mIds.length; j++) {
      let movieId = mIds[j]
      
      // If we've already processed this movie in this BFS, we don't need to do it again
      if (BFS1SeenMovies.has(movieId)) continue
      
      // firstSteps.actors holds keys of actor ids and values of Sets
      // These sets contain ids of every movie you can click on from our center to get to that actor the fastest
      if (!firstSteps.movies[movieId]) firstSteps.movies[movieId] = new Set()
      firstSteps.actors[origActorId].forEach(origFirstStep => {
        firstSteps.movies[movieId].add(origFirstStep)
      })
      
      // Now we can check to see if our sister BFS has already encountered this movie
      // If so, we've found a path!
      if (BFS2SeenMovies.has(movieId)) winnerIds.add(movieId)
    }
  }
  // truncated...
}
```

Using our data structure and this type of algorithm, we can return all possible hints in just milliseconds over 99% of the time. (Side note: It's so fast that if we let it run wild without an end goal, the low-end tier of Heroku's working memory typically runs out before the algorithm has run for 5 seconds 😬 )

### D3.js Force-Directed Graph

To display all your next choices at any point, I used D3.js to make a force-directed graph with the center representing your current position and all surrounding nodes representing the next options.

<p align="center">
  <img src="https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/images/fdg.gif" width="700" alt="force directed graph">
</p>

D3 uses svg or canvas elements instead of normal javascript DOM manipulation to render a lot at once with comparatively better performance. It allows us to set different types of forces on our force-directed graphs to choose the best way to display our data:

```javascript
const sim = d3.forceSimulation()
    .force("y", d3.forceY(this.height / 2).strength(.2))
    .force("charge", d3.forceManyBody().strength(-3000))
    .force("link", d3.forceLink().id(d => d.frameId))
    .force("collide", d3.forceCollide().radius(55))
```

You can also set d3-specific event handlers on your svg elements. These ones grow & shrink images on hover:

```javascript
d3.select(".images")
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
```

### Actor Search and Validation

Baconizer uses "input" event handlers on \<input\> elements and regex matching to search for and validate actor names in the database. As you type, it checks whether your entry matches any part of any actor's name and then returns the top 10 matching actors, sorted by TMDB's "popularity" metric.

<p align="center">
  <img src="https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/images/actor_search.png" width="600" alt="actor search">
</p>

Sorting by popularity comes in handy when you're searching through 100,000 names.

Here's the bulk of the regex matching function: 

```javascript
const suggest = (query) => {
    // Don't bother searching for exact matches or for anything matching only one character
    if (query.length < 2 || nameToId.hasOwnProperty(query)) return null;

    // The 'i' tag makes the search case-insensitive
    const reg = new RegExp(query, 'i')

    const results = [];
    for (let i = 0; i < noAccents.length; i++) {
        // noAccents is a collection of all names with any diacritical markings removed for easier comparison
        // For example, 'Malin Akerman' would now successfully match the actress 'Malin Åkerman'
        if (noAccents[i].match(reg)) results.push(allActorNames[i])
    }

    if (results.length === 0) return [];
    
    const sorted = results.sort((a,b) => {
        // Sort all matching results by our stored popularity metric
        if (nameToId[a].popularity > nameToId[b].popularity) return -1;
        return 1;
    })

    // Finally, return the 10 most popular actors matching the original query
    return sorted.slice(0,10)
}
```

As soon as the site recognizes an actor's full name in the input, that individual's photo appears in the box below the input and the border turns green to confirm that this actor is ready to go.

### Node filtering

If you're ever overwhelmed by the amount of choices on the screen, you can use the filter feature to limit the nodes that show up on any page.

<img src="https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/images/filter.jpg" alt="filter demo">

Just like the actor validation function, filtering uses regex to match the names or titles of the nodes on the screen

## Future Updates

Baconizer's roadmap includes the following:
* Revamping the database to exclude certain "cheaty" entries 
  * "And the Oscar Goes To..." is a good example of a "cheaty" movie: It's basically a giant compilation of famous actors and how they won some Academy Award. It makes for a very effective link, but it doesn't stand on its own as a legitimate movie.
* Alternate carousel or list view of all the center options with variable ordering
