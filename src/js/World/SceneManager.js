import * as THREE from 'three'

export default class SceneManager {
  constructor() {
    this.steps = [this.firstStep, this.secondStep, this.thirdStep]

    new THREE['Box']()
  }

  buildScene() {}

  previous() {}

  next() {}
}
