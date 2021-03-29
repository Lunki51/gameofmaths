import React, { Component } from 'react';
import * as THREE from 'three'
import { FBXLoader } from '../../../../node_modules/three/examples/jsm/loaders/FBXLoader.js';
import { TGALoader } from '../../../../node_modules/three/examples/jsm/loaders/TGALoader';
import { OrbitControls } from '../../../../node_modules/three/examples/jsm/controls/OrbitControls.js';
import '../styles/global_style.css'
import auth, {getType, getUsername, isAuth} from "../../../model/authentification";
import '../styles/global_variables.css';

export class ProfilDetails extends Component{

    _isMounted=false


    constructor(props: P, context: any) {
        super(props, context);
        this.state = {
            player: {username: ""},
            scene: new THREE.Scene(),
            renderer: new THREE.WebGLRenderer(),
            mixer: null,
            camera: new THREE.PerspectiveCamera( 45, 500/500, 1, 2000 ),
            clock: new THREE.Clock(),
            controls: null
        }
        getUsername().then(response =>{
            this.setState({player : response.data})
        })
    }

    animate = () => {

        requestAnimationFrame( this.animate );

        const delta = this.state.clock.getDelta();

        if ( this.state.mixer ) this.state.mixer.update( delta );
        this.state.controls.update();

        this.state.renderer.render( this.state.scene, this.state.camera );

    }

    render3D = () =>{
        //NO
        /*
        if(this.mount){

            const manager = new THREE.LoadingManager();
            manager.addHandler( /\.tga$/i, new TGALoader() );
            let loader = new FBXLoader(manager);
            this.state.camera.position.set(0,0,0)
            this.state.scene.add(new THREE.Mesh(new THREE.BoxGeometry(1,1),new THREE.MeshBasicMaterial({color:0x252525})))
            this.state.camera.position.set( 100, 200, 300 );


            loader.load('userData/sylvanas.fbx',object =>{

                this.setState({mixer : new THREE.AnimationMixer( object )})

                const action = this.state.mixer.clipAction( object.animations[ 0 ] );
                action.play();

                console.log(object)

                object.traverse( function ( child ) {

                    if ( child.isMesh ) {
                        if(child.material){
                            child.material.transparent = false
                            child.material.opacity = 1.0
                        }
                        child.castShadow = true;
                        child.receiveShadow = true;

                    }

                } );
                this.state.scene.add( object );
            })
            const dirLight = new THREE.DirectionalLight( 0xffffff );
            dirLight.position.set( 0, 200, 100 );
            dirLight.castShadow = true;
            dirLight.shadow.camera.top = 180;
            dirLight.shadow.camera.bottom = - 100;
            dirLight.shadow.camera.left = - 120;
            dirLight.shadow.camera.right = 120;
            this.state.scene.add( dirLight );

            this.state.controls = new OrbitControls( this.state.camera, this.state.renderer.domElement );
            this.state.controls.target.set( 0, 0, 0 );
            this.state.controls.update();


            this.mount.appendChild(this.state.renderer.domElement);
            this.animate();
        }
         */
    }

    componentDidMount() {
        this._isMounted=true
        /*
        this.state.renderer.setSize(500,500);
        this.state.renderer.setPixelRatio(window.devicePixelRatio);
        this.render3D(null)
         */
    }

    componentWillUnmount() {
        this._isMounted=false
    }



    render() {

        //TODO Implement player description
        return <div className="container-chapter-selection">

            <h1 className="profil-details-headline">Joueur {this.state.player.username}</h1>

        </div>

    }




}