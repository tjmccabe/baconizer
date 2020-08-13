# Baconizer

Can you beat 6 degrees of separation? The goal of this game is to find the shortest path between any 2 actors by jumping between movies and actors.

### [Live Link](https://baconizer.herokuapp.com/)

![Baconizer basics](https://baconizer-assets.s3-us-west-1.amazonaws.com/baconstill.png)

Baconizer is based on the [6 Degrees of Kevin Bacon](https://en.wikipedia.org/wiki/Six_Degrees_of_Kevin_Bacon) parlor game.

## Technologies

* Backend: Node.JS, Express
* Frontend: D3.js, JavaScript, HTML & CSS
* Hosting: Heroku

## Features
### Massive Database

Baconizer has a local database of over 100,000 actors and over 200,000 movies, comprising about 100MB of raw data. This database was obtained by making millions of API calls to <a href="https://www.themoviedb.org/" target="_blank">TMDb</a> (not to be confused with IMDb) and then pruning and cleaning the responses after writing them all to local files. Every time the backend server starts up, it reads through this local database and holds references to every actor and movie as nodes in a large graph. This allows for highly responsive performance when dealing with the large-scale operations described below.

Manufacturing a proprietary database was necessary based on the scope of the guided gameplay operations described below. 

### Guided Gameplay through Hints

General info about the title thing

Here are 2 cool things:

***

**1. First cool thing**

This is pretty cool

```javascript
const codeSnippet = (snippet1, snippet2) => {};
```

***

**2. Second cool thing**

This is also pretty cool

```javascript
const codeSnippet = (snippet1, snippet2) => {};
```

***

### Dynamic Mid-Game Options

General info about this title thing

### Mystery thing

Basic info about the mystery thing

Controlled-width pic:

<img src="https://baconizer-assets.s3-us-west-1.amazonaws.com/baconstill.png" width="350">

<img src="https://baconizer-assets.s3-us-west-1.amazonaws.com/baconize.gif" width="350">

## Future Updates

Baconizer's roadmap includes the following:
* Revamping the database to exclude certain "cheat" entries ()
* Alternate carousel or list view of all your options with variable ordering
