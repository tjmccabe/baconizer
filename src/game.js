class Game {
  constructor (startActor, endActor) {
    this.startActor = startActor
    this.endActor = endActor
    console.log("YAY")
    console.log(this.startActor.birthday)
    console.log(this.endActor.profile_path)
  }
}

export default Game;