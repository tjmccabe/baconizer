import * as d3 from 'd3';
const axios = require('axios')
// import "core-js/stable";
import "regenerator-runtime/runtime";
import ActorFrame from './actor_frame';
import MovieFrame from './movie_frame';

class Game {
  constructor (startActor, endActor, g, zoom) {
    this.startActor = startActor;
    this.endActor = endActor;
    this.center = startActor;
    this.path = [startActor];
    this.hintsUsed = 0

    this.getBest(this.center.id, true)
    
    this.width = window.innerWidth - 320;
    this.height = window.innerHeight;

    this.g = g
    this.zoom = zoom

    this.beginPath()

    this.cleanUp = this.cleanUp.bind(this)
    this.beginPath = this.beginPath.bind(this)
    this.getBest = this.getBest.bind(this)
    this.getBestFromMovie = this.getBestFromMovie.bind(this)
    this.makeMove = this.makeMove.bind(this)
    this.frame = new ActorFrame(this.center, this.makeMove);
    this.filterText = "";
  }

  makeMove(center, type) {
    if (type === "movieToActor" && this.checkWin(center.id)) {
      this.appendStep(center, type)
      document.getElementById("last-step").classList.add("inactive")
      this.cleanUp()
      this.showWinScreen()
      return
    }
    // if too many steps, offer to restart or go back
    this.center = center
    d3.select("#thisg").selectAll("*").remove()
    if (type === "actorToMovie") {
      this.frame = new MovieFrame(this.center, this.makeMove);
      this.getBestFromMovie(center.id)
    } else {
      this.frame = new ActorFrame(this.center, this.makeMove);
      this.getBest(center.id)
    }

    if (this.path.length > 1 && center.id === this.path[this.path.length - 2].id) {
      this.goBack()
    } else {
      this.appendStep(center, type)
    }
    let pathEle = document.getElementById("path-container")
    pathEle.scrollTop = pathEle.scrollHeight

    document.getElementById('filter-notifier').classList.add("inactive")
    document.getElementById('filter-input').value = ""
    this.filterText = ""
    document.getElementById('hint-display').classList.add("inactive")
    document.getElementById('hint-suggestion').classList.remove("inactive")
    this.recenter()
  }

  changeFrame() {
    d3.select("#thisg").selectAll("*").remove()
    if (this.center.title) {
      this.frame = new MovieFrame(this.center, this.makeMove);
      this.getBestFromMovie(this.center.id)
    } else {
      this.frame = new ActorFrame(this.center, this.makeMove);
      this.getBest(this.center.id)
    }
    let pathEle = document.getElementById("path-container")
    pathEle.scrollTop = pathEle.scrollHeight

    document.getElementById('filter-notifier').classList.add("inactive")
    document.getElementById('filter-input').value = ""
    this.filterText = ""
    document.getElementById('hint-display').classList.add("inactive")
    document.getElementById('hint-suggestion').classList.remove("inactive")
    this.recenter()
  }

  goBack() {
    this.path.pop()
    let steps = document.getElementById("steps")
    steps.lastChild.remove()
    steps.lastChild.remove()
  }

  filter() {
    d3.select("#thisg").selectAll("*").remove()
    this.center.title ? (
      this.frame = new MovieFrame(this.center, this.makeMove, this.filterText)
    ) : this.frame = new ActorFrame(this.center, this.makeMove, this.filterText);
  }

  unfilter() {
    d3.select("#thisg").selectAll("*").remove()
    this.center.title ? (
      this.frame = new MovieFrame(this.center, this.makeMove)
    ) : this.frame = new ActorFrame(this.center, this.makeMove);
  }

  getBest(id, firstTime) {
    return axios.get(`/bestpath/${id}/${this.endActor.id}`)
      .then(res => { 
        if (firstTime) {
          this.bestScore = res.data[0]
        }
        this.hint = res.data[1][1]
        return this.hint
      })
  }

  getBestFromMovie(id) {
    return axios.get(`/moviepath/${id}/${this.endActor.id}`)
      .then(res => {
        this.hint = res.data[1][1]
        return this.hint
      })
  }

  beginPath() {
    // put in start actor at start of path
    let firstPic = document.getElementById("first-actor-pic")
    let firstName = document.getElementById("first-actor-name")
    let lastPic = document.getElementById("last-actor-pic")
    let lastName = document.getElementById("last-actor-name")
    let stepChildren = document.querySelectorAll("#steps > li")
    let arrows = document.querySelectorAll("#steps > img")
    
    for (let i = 0; i < stepChildren.length; i++) {
      let child = stepChildren[i]
      if (!child.id || child.id !== "first-step") child.remove()
    }
    for (let i = 0; i < arrows.length; i++) {
      arrows[i].remove()
    }

    let defaultUrl = "https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/profile.png"

    firstPic.src = this.startActor.profile_path ? (
      `https://image.tmdb.org/t/p/w185${this.startActor.profile_path}`
    ) : defaultUrl;
    firstPic.alt = this.startActor.name
    firstName.innerText = this.startActor.name

    lastPic.src = this.endActor.profile_path ? (
      `https://image.tmdb.org/t/p/w185${this.endActor.profile_path}`
    ) : defaultUrl;
    lastPic.alt = this.endActor.name
    lastName.innerText = this.endActor.name
    document.getElementById("last-step").classList.remove("inactive")
  }

  getDegreeText(num) {
    if (num % 100 === 11 || num % 100 === 12 || num % 100 === 13) return num + "th"
    if (num % 10 === 1) return num + "st"
    if (num % 10 === 2) return num + "nd"
    if (num % 10 === 3) return num + "rd"
    return num + "th"
  }
  
  appendStep(center, type) {
    let firstStep = this.path.length < 2 ? true : false
    this.path.push(center)
    let [stepClass, picClass, nameClass, nameText, sourcePath, arrowClass] = type === "movieToActor" ? (
      ["actor-step", "actor-pic", "actor-name", center.name, center.profile_path, "left-arrow"]
    ) : ["movie-step", "movie-pic", "movie-name", center.title, center.poster_path, "right-arrow"]
    // append the arrow first

    let steps = document.getElementById("steps")

    let arrow = document.createElement("img")
    arrow.classList.add("arrow")
    arrow.classList.add(arrowClass)
    let arrowClassText = firstStep ? "wasin" : center.name ? "withleft" : "whowasin"
    arrow.src = `https://baconizer-assets.s3-us-west-1.amazonaws.com/${arrowClassText}.png`
    arrow.alt = arrowClassText
    steps.append(arrow)

    let step = document.createElement('li')
    step.classList.add(stepClass)
    
    if (type === "movieToActor") {
      let num = (this.path.length - 1) / 2
      let degreeText = this.getDegreeText(num)
      let degreeNum = document.createElement('div')
      degreeNum.classList.add("degree-text")
      degreeNum.innerText = `${degreeText} Degree`
      step.appendChild(degreeNum)
    }

    let nameOrTitle = document.createElement('div')
    nameOrTitle.classList.add(nameClass)
    nameOrTitle.innerText = nameText
    step.appendChild(nameOrTitle)

    let image = document.createElement('img')
    image.classList.add(picClass)
    image.src = sourcePath ? `https://image.tmdb.org/t/p/w185${sourcePath}` : type === "movieToActor" ? (
      "https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/profile.png"
    ) : "https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/camera.png"
    image.alt = nameText
    step.appendChild(image)

    steps.appendChild(step)
  }

  recenter() {
    this.zoom.transform(d3.select("svg"), d3.zoomIdentity.scale(1))
  }

  checkWin(id) {
    return id === this.endActor.id
  }

  currentDegrees() {
    return (this.path.length - 1) / 2
  }

  makeFinalPath() {
    const pathEle = document.getElementById("final-path")
    pathEle.innerHTML = ''
    const path = this.path

    // put in first actor and wasin arrow
    let firstActor = document.createElement("li")
    firstActor.classList.add("f-actor-step")
    let degText = document.createElement("div")
    degText.classList.add("f-degree-text")
    degText.innerText = "Start Actor"
    let actPic = document.createElement("img")
    actPic.classList.add("f-actor-pic")
    actPic.src = path[0].profile_path ? (
      `https://image.tmdb.org/t/p/w185${path[0].profile_path}`
    ) : (
      "https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/profile.png"
    )
    actPic.alt = path[0].name
    let actName = document.createElement("div")
    actName.classList.add("f-actor-name")
    actName.innerText = path[0].name
    firstActor.appendChild(degText)
    firstActor.appendChild(actPic)
    firstActor.appendChild(actName)

    let startArr = document.createElement("li")
    startArr.classList.add("f-arrow")
    startArr.classList.add("up-arrow")
    let startArrPic = document.createElement("img")
    startArrPic.src = `https://baconizer-assets.s3-us-west-1.amazonaws.com/wasin.png`
    startArrPic.alt = "was in"
    startArr.appendChild(startArrPic)

    pathEle.appendChild(firstActor)
    pathEle.appendChild(startArr)

    // map the rest of the path with their own arrows
    for (let i = 1; i < path.length; i++) {
      let ele = path[i]
      let [stepClass, picClass, nameClass, nameText, sourcePath, arrowSource, tilt] = ele.name ? (
        ["f-actor-step", "f-actor-pic", "f-actor-name", ele.name, ele.profile_path, "whowasin", "up-arrow"]
      ) : ["f-movie-step", "f-movie-pic", "f-movie-name", ele.title, ele.poster_path, "withright", "down-arrow"]

      let step = document.createElement("li")
      step.classList.add(stepClass)
      if (ele.name) {
        let degText = document.createElement("div")
        degText.classList.add("f-degree-text")
        degText.innerText = `${this.getDegreeText(i/2)} Degree`
        step.appendChild(degText)
      }
      let pic = document.createElement("img")
      pic.classList.add(picClass)
      pic.src = sourcePath ? (
        `https://image.tmdb.org/t/p/w185${sourcePath}`
      ) : ele.name ? (
        "https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/profile.png"
      ) : "https://raw.githubusercontent.com/tjmccabe/Baconizer/master/assets/camera.png"
      pic.alt = nameText;

      let name = document.createElement("div")
      name.classList.add(nameClass)
      name.innerText = nameText
      
      step.appendChild(pic)
      step.appendChild(name)

      let arr = document.createElement("li")
      arr.classList.add("f-arrow")
      arr.classList.add(tilt)
      let arrPic = document.createElement("img")
      arrPic.src = `https://baconizer-assets.s3-us-west-1.amazonaws.com/${arrowSource}.png`
      arrPic.alt = arrowSource
      arr.appendChild(arrPic)

      pathEle.appendChild(step)
      if (i < path.length - 1) pathEle.appendChild(arr)
    }
  }

  insertVictoryText() {
    let finalScore = (this.path.length - 1) / 2
    document.getElementById("sr1").innerText = this.startActor.name
    document.getElementById("sr2").innerText = this.endActor.name
    document.getElementById("sr3").innerText = finalScore
    document.getElementById("sr4").innerText = this.hintsUsed 

    document.getElementById("plur1").innerText = finalScore === 1 ? "" : "s"
    document.getElementById("plur2").innerText = 
      this.hintsUsed === 0 ? "s!" : this.hintsUsed === 0 ? "" : "s"

    document.getElementById("hint-recap-end").innerText = 
      this.hintsUsed === 0 ? "" : "along the way"

    let gitGud = document.getElementById("git-gud")
    let gotGud = document.getElementById("got-gud")
    if (this.bestScore === (this.path.length - 1) / 2) {
      gitGud.classList.add("inactive")
      gotGud.classList.remove("inactive")
    } else {
      gotGud.classList.add("inactive")
      document.getElementById("sr5").innerText = this.bestScore
      document.getElementById("plur3").innerText = this.bestScore === 1 ? "" : "s"
      gitGud.classList.remove("inactive")
    }
  }

  showWinScreen() {
    let victoryModal = document.getElementById("victory-modal")

    this.makeFinalPath()
    this.insertVictoryText()
    victoryModal.classList.remove("inactive")
  }
  
  cleanUp() {
    d3.select("#thisg").selectAll("*").remove()
    this.recenter()
    document.getElementById('filter-notifier').classList.add("inactive")
    document.getElementById('hint-display').classList.add("inactive")
    document.getElementById('hint-suggestion').classList.remove("inactive")
    document.getElementById('filter-input').value = ""
    document.getElementById('hint-counter').innerText = "0"
  }
}

export default Game;