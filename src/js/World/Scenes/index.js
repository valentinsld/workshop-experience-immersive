// This class will manage the scenes and the transitions between

export default class SceneManager {
    constructor(params) {
        const scenesContext = require.context('./', true, /.js$/)
        this.scenes = scenesContext.keys()
            .filter(key => key !== './index.js')
            .map(key => require(`${key}`).default)

        this.params = params

        if (params.options.debug) {
            window.addEventListener('keydown', e => {
                if (e.key === '-') this.previous()
                if (e.key === '+') this.next()
            })
        }

        this.state = {
            currentSceneIndex: 0,
            currentScene: new this.scenes[1](this.params),
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