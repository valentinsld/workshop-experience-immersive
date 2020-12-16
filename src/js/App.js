import { Scene, WebGLRenderer, Color, Fog } from 'three'
import { WebGLRenderTarget } from '../lib/SSAOShader'
import SSAOShader from '../lib/SSAOShader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import * as dat from 'dat.gui'
import Stats from 'stats-js'

import Sizes from '@tools/Sizes'
import Time from '@tools/Time'
import Assets from '@tools/Loader'

import Camera from './Camera'
import World from '@world/index'

export default class App {
  constructor(options) {
    // Set options
    this.canvas = options.canvas

    // Set up
    this.time = new Time()
    this.sizes = new Sizes()
    this.assets = new Assets()

    this.setConfig()
    this.setRenderer()
    this.setCamera()
    this.setWorld()
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

      this.composer.render();
      // this.renderer.render(this.scene, this.camera.camera)

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

    const effectSSAO = new ShaderPass( SSAOShader );
    // const ssaoPass = new SSAOPass( this.scene, this.camera.camera, this.sizes.viewport.width, this.sizes.viewport.height );
    // ssaoPass.kernelRadius = 10;
    // ssaoPass.minDistance = 0.005
    // ssaoPass.maxDistance = 0.05
    // this.composer.addPass( ssaoPass );
    this.composer.addPass( effectSSAO );

    this.scene.fog = new Fog(0x030B24, 1, 50)

    const renderTargetParametersRGBA = { minFilter: 1006, magFilter: 1006, format: 1021 };
    const depthTarget = new WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParametersRGBA );
    const WIDTH = window.innerWidth
    const HEIGHT = window.innerHeight
    effectSSAO.uniforms[ 'tDepth' ].value = depthTarget;
    effectSSAO.uniforms[ 'size' ].value.set( WIDTH, HEIGHT );
    effectSSAO.uniforms[ 'cameraNear' ].value = this.camera.near;
    effectSSAO.uniforms[ 'cameraFar' ].value = this.camera.far;
    effectSSAO.uniforms[ 'fogNear' ].value = this.scene.fog.near;
    effectSSAO.uniforms[ 'fogFar' ].value = this.scene.fog.far;
    effectSSAO.uniforms[ 'fogEnabled' ].value = 0;
    effectSSAO.uniforms[ 'aoClamp' ].value = 0.5;
    effectSSAO.material.defines = { "RGBA_DEPTH": true, "ONLY_AO_COLOR": "1.0, 0.7, 0.5" };

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
