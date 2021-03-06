import { Scene, WebGLRenderer, Color, AudioListener, Audio, AudioLoader } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';

import * as dat from 'dat.gui'
import Stats from 'stats-js'

import Sizes from '@tools/Sizes'
import Time from '@tools/Time'
import Assets from '@tools/Loader'

import Camera from './Camera'
import World from '@world/index'

import Cursor from './Cursor'

export default class App {
  constructor(options) {
    // Set options
    this.canvas = options.canvas

    // Set up
    this.time = new Time()
    this.sizes = new Sizes()
    this.assets = new Assets()

    this.setCursor()
    this.setConfig()
    this.setRenderer()
    this.setCamera()
    this.setWorld()
    this.setSound()
  }
  setCursor() {
    this.cursor = new Cursor({ id: "#cursorS", speed: 0.15 });
  }
  setRenderer() {
    // Set scene
    this.scene = new Scene()
    // this.scene.background = new Color( 0x050C2F )
    // Set renderer
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
    })
    // Set background color
    this.renderer.setClearColor(0x030B24, 1) // 0x050C2F
    // Set renderer pixel ratio & sizes
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(this.sizes.viewport.width, this.sizes.viewport.height)
    // Resize renderer on resize event
    this.sizes.on('resize', () => {
      this.renderer.setSize(
        this.sizes.viewport.width,
        this.sizes.viewport.height
      )
    })
    // Set RequestAnimationFrame with 60ips
    this.time.on('tick', () => {
      if (this.stats) this.stats.begin();

      // this.composer.render();
      this.renderer.render(this.scene, this.camera.camera)

      this.cursor.animate()

      if (this.stats) this.stats.end();
    })
  }
  setCamera() {
    // Create camera instance
    this.camera = new Camera({
      sizes: this.sizes,
      renderer: this.renderer,
      debug: this.debug,
      time: this.time,
    })
    // Add camera to scene
    this.scene.add(this.camera.container)

    //  Set effect camera
    /////////////////////////
    this.composer = new EffectComposer( this.renderer );

    const ssaoPass = new SSAOPass( this.scene, this.camera.camera, this.sizes.viewport.width, this.sizes.viewport.height );
    ssaoPass.kernelRadius = 14;
    ssaoPass.minDistance = 0.0025
    ssaoPass.maxDistance = 0.1
    this.composer.addPass( ssaoPass );
  }
  setSound() {
    this.listener = new AudioListener();
    this.camera.container.add( this.listener );

    // create a global audio source
    this.globalSound = new Audio( this.listener );

    // load a sound and set it as the Audio object's buffer
    const audioLoader = new AudioLoader();
    const THAT = this
    audioLoader.load( './sounds/AmbientMusic.mp3', function( buffer ) {
      THAT.globalSound.setBuffer( buffer );
      THAT.globalSound.setLoop( true );
      THAT.globalSound.setVolume( 0.4 );
      THAT.globalSound.play();
    });
  }
  setWorld() {
    // Create world instance
    this.world = new World({
      time: this.time,
      debug: this.debug,
      assets: this.assets,
    })
    // Add world to scene
    this.scene.add(this.world.container)
  }
  setConfig() {
    if (window.location.hash === '#debug') {
      this.debug = new dat.GUI({ width: 420 })
   
      //   Stats
      /////////////////////////////
      this.stats = new Stats();
      this.stats.showPanel( 0 );
      document.body.appendChild( this.stats.dom );
    }
  }
}
