# Baconizer

Can you beat 6 degrees of separation? The goal of this game is to find the shortest path between any 2 actors by jumping between movies and actors.

### [Live Link](https://baconizer.herokuapp.com/)

<img src="https://baconizer-assets.s3-us-west-1.amazonaws.com/baconstill.png" alt="Baconizer basics">

Baconizer is based on the <a href="https://en.wikipedia.org/wiki/Six_Degrees_of_Kevin_Bacon" target="_blank">6 Degrees of Kevin Bacon</a> parlor game.

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

This game would be much less fun without hints. But in order to get hints in the first place, we need to know all possible shortest paths to get from our start actor to our end actor, which seems like a massive undertaking.

Baconizer is able to gather these paths every time a player makes a move, recalculating the best paths based on the player's new position.

Here's how:

**Bi-directional Breadth First Search**

We need to work our way into the data starting from our center node and branching out one step at a time. We can improve upon the basic strategy by starting the same search from our endpoint as well and working both sides of the problem. The images below both represent the same graph. Notice how if we start from both sides, we waste a lot fewer resources checking dead ends before getting to the answer.

<img src="https://baconizer-assets.s3-us-west-1.amazonaws.com/bdbfs.png" alt="Bi-directional BFS">

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

Using our data structure and this type of algorithm, we can return all possible hints in just milliseconds over 99% of the time. (Side note: It's so fast that if we let it run wild without an end goal, Heroku's working memory typically runs out before the algorithm has run for 5 seconds 😬 )

### D3.js Force-Directed Graph

General info about this title thing

<img src="https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/images/fdg.gif" width="700" alt="force directed graph">


```javascript
const codeSnippet = (snippet1, snippet2) => {};
```

### Actor Search and Validation

Basic info about the mystery thing

when they're validated, a picture comes up if their picture is in TMDb's database, and the border turns green for good measure

Controlled-width pic:

<img src="https://baconizer-assets.s3-us-west-1.amazonaws.com/baconstill.png" width="350">

<img src="https://baconizer-assets.s3-us-west-1.amazonaws.com/baconize.gif" width="350">

### Node filtering

<img src="https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/images/filter.jpg" alt="ffilter demo">

## Future Updates

Baconizer's roadmap includes the following:
* Revamping the database to exclude certain "cheat" entries ()
* Alternate carousel or list view of all your options with variable ordering
