import * as d3 from 'd3';
const axios = require('axios')
// import "core-js/stable";
import "regenerator-runtime/runtime";
import ActorFrame from './actor_frame';
import MovieFrame from './movie_frame';

const ordinals = [
  "", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th",
  "10th", "11th", "12th", "13th", "14th", "15th", "16th", "17th", "18th", "19th",
  "20th", "21st", "22nd", "23rd", "24th", "25th", "26th", "27th", "28th", "29th"
]


class Game {
  constructor (startActor, endActor, g, zoom) {
    this.startActor = startActor;
    this.endActor = endActor;
    this.center = startActor;
    this.path = [startActor];

    this.getBest(this.center.id, true)
    
    this.width = window.innerWidth - 320;
    this.height = window.innerHeight;

    this.g = g
    this.zoom = zoom

    this.beginPath()

    // add canvas event listeners

    // this.checkWin = this.checkWin.bind(this)
    this.getBest = this.getBest.bind(this)
    this.getBestFromMovie = this.getBestFromMovie.bind(this)
    this.makeMove = this.makeMove.bind(this)
    this.frame = new ActorFrame(this.center, this.makeMove, this.zoom, this.endActor.id);
  }

  makeMove(center, type) {
    if (type === "movieToActor" && this.checkWin(center.id)) {
      this.appendStep(center, type)
      document.getElementById("last-step").classList.add("inactive")
      this.showWinScreen()
      // remove event listeners?

      return
    }
    // if too many steps, offer to restart or go back
    this.center = center
    d3.select("#thisg").selectAll("*").remove()
    if (type === "actorToMovie") {
      this.frame = new MovieFrame(center, this.makeMove);
      this.getBestFromMovie(center.id)
    } else {
      this.frame = new ActorFrame(center, this.makeMove);
      this.getBest(center.id)
    }

    if (this.path.length > 1 && center.id === this.path[this.path.length - 2].id) {
      this.goBack()
    } else {
      this.appendStep(center, type)
    }
    // scroll to bottom of path
    
    this.zoom.transform(d3.select("svg"), d3.zoomIdentity.scale(1))
  }

  goBack() {
    this.path.pop()
    document.getElementById("steps").lastChild.remove()
    document.getElementById("steps").lastChild.remove()
  }

  getBest(id, firstTime) {
    return axios.get(`/bestpath/${id}/${this.endActor.id}`)
      .then(res => { 
        if (firstTime) {
          this.bestScore = res.data[0]
        }
        this.hint = res.data[1][1]
        console.log(this.hint)
        return this.hint
      })
  }

  getBestFromMovie(id) {
    return axios.get(`/moviepath/${id}/${this.endActor.id}`)
      .then(res => {
        this.hint = res.data[1][1]
        console.log(this.hint)
        return this.hint
      })
  }

  async rotateHint() {
    if (this.rotating) return;
    this.rotating = true

    let origId = this.hint.id
    let center = this.center
    const func = this.hint.title ? this.getBest : this.getBestFromMovie

    async function loop() {
      for (let i = 0; i < 15; i++) {
        let hinty = await func(center.id)
        if (hinty.id !== origId) return true
      }
      return false
    }

    const ans = await loop()
    this.rotating = false
    return ans ? true : false
  }

  beginPath() {
    // put in start actor at start of path
    let firstPic = document.getElementById("first-actor-pic")
    let firstName = document.getElementById("first-actor-name")
    let lastPic = document.getElementById("last-actor-pic")
    let lastName = document.getElementById("last-actor-name")

    firstPic.src = `https://image.tmdb.org/t/p/w185${this.startActor.profile_path}`
    firstPic.alt = this.startActor.name
    firstName.innerText = this.startActor.name

    lastPic.src = `https://image.tmdb.org/t/p/w185${this.endActor.profile_path}`
    lastPic.alt = this.endActor.name
    lastName.innerText = this.endActor.name
    document.getElementById("last-step").classList.remove("inactive")
  }
  
  appendStep(center, type) {
    this.path.push(center)
    let [stepClass, picClass, nameClass, nameText, sourcePath, arrowClass] = type === "movieToActor" ? (
      ["actor-step", "actor-pic", "actor-name", center.name, center.profile_path, "left-arrow"]
    ) : ["movie-step", "movie-pic", "movie-name", center.title, center.poster_path, "right-arrow"]
    // append the arrow first

    let steps = document.getElementById("steps")

    let arrow = document.createElement("img")
    arrow.classList.add("arrow")
    arrow.classList.add(arrowClass)
    arrow.src = type === "movieToActor" ? (
      "https://baconizer-assets.s3-us-west-1.amazonaws.com/arrowleft.png"
    ) : "https://baconizer-assets.s3-us-west-1.amazonaws.com/arrowright.png"
    arrow.alt = arrowClass.split("-").join(" ")
    steps.append(arrow)

    let step = document.createElement('li')
    step.classList.add(stepClass)
    
    if (type === "movieToActor") {
      let degreeText = ordinals[(this.path.length - 1)/2]
      let degreeNum = document.createElement('div')
      degreeNum.classList.add("degree-text")
      degreeNum.innerText = `${degreeText} degree:`
      step.appendChild(degreeNum)
    }

    let image = document.createElement('img')
    image.classList.add(picClass)
    image.src = sourcePath ? `https://image.tmdb.org/t/p/w185${sourcePath}` : type === "movieToActor" ? (
      "https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/profile.png"
    ) : "https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/camera.png"
    image.alt = nameText
    step.appendChild(image)

    let nameOrTitle = document.createElement('div')
    nameOrTitle.classList.add(nameClass)
    nameOrTitle.innerText = nameText
    step.appendChild(nameOrTitle)

    steps.appendChild(step)
  }

  checkWin(id) {
    return id === this.endActor.id
  }

  currentDegrees() {
    return (this.path.length - 1) / 2
  }

  showWinScreen() {
    window.alert("YOU WIN!")
    // Do some fun win stuff
    // Pop up a modal telling them their progress
    // Tell them the fastest they COULD have solved it
    // Tell them if they used hints or not
    // Offer to try again or put in 2 different actors

    // return
  }
}

export default Game;