import * as THREE from 'three'
import { Mesh, Object3D } from 'three'

export default class SceneManager {
  constructor({ assets, sceneState }) {

    this.container = new Object3D()
    this.assets = assets

    const scenesParamsContext = require.context('./sceneParams/', true, /\.js$/)

    this.scenesParams = scenesParamsContext.keys()
      .map(key => require(`./sceneParams/${key.substring(2)}`).default)

    App.scene.add(this.container)

    this.buildScene( this.scenesParams[sceneState.sceneIndex] )
  }

  buildScene(params) {
    for (const shape of params.meshes) {

      const object = new Object3D()
      object.name = shape.name

      if (shape.geometry) { // shape is a standard three.js shape
        const geometry = new THREE[shape.geometry.type](shape.geometry.params)
        for (const mesh of shape.instances) {
          const texture = new THREE[mesh.texture.type](mesh.texture.params)
          const threeMesh = new Mesh(geometry, texture)

          if ()
          threeMesh.position.x = mesh.position.x
          threeMesh.position.y = mesh.position.y
          threeMesh.position.z = mesh.position.z
          object.add(threeMesh)
        }
      } else if (shape.modelName) { // shape is an imported model
        for (const mesh of shape.instances) {
          const threeMesh = this.assets.models[shape.modelName].scene
          threeMesh.position.x = mesh.position.x
          threeMesh.position.y = mesh.position.y
          threeMesh.position.z = mesh.position.z
          object.add(threeMesh)
        }
      }

      this.container.add(object)
    }
  }

  previous() {}

  next() {}
}
