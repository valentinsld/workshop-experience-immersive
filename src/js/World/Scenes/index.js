// This class will manage the scenes and the transitions between

export default class SceneManager {
    constructor(params) {
        const scenesContext = require.context('./', true, /.js$/)
        this.scenes = scenesContext.keys()
            .filter(key => key !== './index.js')
            .map(key => require(`${key}`).default)

        this.params = params

        this.state = {
            currentSceneIndex: 0,
            currentScene: new this.scenes[0](this.params),
            isTransitioning: true,
        }
    }

    previous() {
        this.state.currentScene.destruct()
        this.state.currentScene = new this.scenes[ --this.state.currentSceneIndex ](this.params)
    }

    next() {
        this.state.currentScene.destruct()
        this.state.currentScene = new this.scenes[ ++this.state.currentSceneIndex ](this.params)
    }
}