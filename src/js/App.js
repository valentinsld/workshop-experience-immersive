import { Scene, WebGLRenderer, Color, ShaderLib, UniformsUtils, ShaderMaterial, WebGLRenderTarget, NoBlending, NearestFilter, RGBAFormat } from 'three'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import { SSAOShader } from 'three/examples/jsm/shaders/SSAOShader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { MaskPass } from 'three/examples/jsm/postprocessing/MaskPass.js';
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

      // this.composer.render();
      this.renderer.render(this.scene, this.camera.camera)

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

    // const ssaoPass = new SSAOPass( this.scene, this.camera.camera, this.sizes.viewport.width, this.sizes.viewport.height );
    // ssaoPass.kernelRadius = 14;
    // ssaoPass.minDistance = 0.0025
    // ssaoPass.maxDistance = 0.1
    // this.composer.addPass( ssaoPass );

    // depth
				
    // var depthShader = ShaderLib[ "depthRGBA" ];
    // var depthUniforms = UniformsUtils.clone( depthShader.uniforms );

    // depthMaterial = new ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms } );
    // depthMaterial.blending = NoBlending;

    // postprocessing
    
    // this.composer.addPass( new RenderPass( this.scene, this.camera ) );

    // const depthTarget = new WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: NearestFilter, magFilter: NearestFilter, format: RGBAFormat } );
    
    // var effect = new ShaderPass( SSAOShader );
    // effect.uniforms[ 'tDepth' ].value = depthTarget;
    // effect.uniforms[ 'size' ].value.set( window.innerWidth, window.innerHeight );
    // effect.uniforms[ 'cameraNear' ].value = camera.near;
    // effect.uniforms[ 'cameraFar' ].value = camera.far;
    // effect.renderToScreen = true;
    // composer.addPass( effect );

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
