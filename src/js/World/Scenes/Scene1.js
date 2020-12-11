import { Object3D } from 'three'

export default class Scene1 {
    constructor({ assets }) {
        this.assets = assets

        this.container = new Object3D()
        this.setupScene()
        App.scene.add(this.container)
    }

    setupScene() {
        this.suzanne = this.assets.models.suzanne.scene
        this.container.add(this.suzanne)
    }

    destruct() {
        // TODO: dispose geometries and textures of the scene
        App.scene.clear()
    }
}