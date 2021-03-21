import React, {Component} from 'react';
import * as THREE from 'three'
import {Color, MeshStandardMaterial} from 'three'
import {GUI} from "dat.gui";
import {Water} from "three/examples/jsm/objects/Water";
import {Sky} from "three/examples/jsm/objects/Sky"
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils';
import Axios from "axios";
import Stats from "stats.js"


/**
 * @author quentin COSNIER
 * @author Antoine LE BORGNE
 *
 * render map on the screen
 */
class MapView extends Component {

    _isMounted = false


    constructor(props: P, context: any) {
        super(props, context);

        this.state = {
            renderer: new THREE.WebGLRenderer(),
            camera: new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 2000),
            scene: new THREE.Scene(),
            center: new THREE.Vector3(0, 80, 0),
            sun: new THREE.Vector3(),
            water: new Water(),
            stats: new Stats(),
            currentCastle: 0,
            castles: new Array(),
            inputVars: {
                mousePressed: false,
                rotateX: 0,
                rotateY: 0,
                scrolled: 100,
                camDistance: 0
            }
        };
    }

    componentDidMount() {
        this._isMounted = true

        document.title = "Game Of Math"


        this.state.renderer.setSize(window.innerWidth, window.innerHeight);
        this.state.renderer.setPixelRatio(window.devicePixelRatio);


        this.renderMap(null)
    }


    animate = () => {

        requestAnimationFrame(this.animate);
        this.state.stats.begin();
        this.state.inputVars.camDistance -= this.state.inputVars.scrolled;
        this.state.inputVars.camDistance = Math.min(Math.max(30, this.state.inputVars.camDistance), 100)
        this.state.camera.position.z = this.state.center.z - (this.state.inputVars.camDistance * Math.cos(Math.PI / 4)) * Math.cos(this.state.inputVars.rotateX)
        this.state.camera.position.x = this.state.center.x - (this.state.inputVars.camDistance * Math.cos(Math.PI / 4)) * Math.sin(this.state.inputVars.rotateX)
        this.state.camera.position.y = this.state.inputVars.camDistance * Math.sin(Math.PI / 4) + 80
        this.state.camera.lookAt(this.state.center)
        this.state.inputVars.scrolled = 0
        this.state.water.material.uniforms['time'].value += 1.0 / 60.0;
        this.state.renderer.render(this.state.scene, this.state.camera);
        this.state.stats.end();
    }

    mouseMoveEvent = (event) => {
        if (this.state.inputVars.mousePressed) {
            this.state.inputVars.rotateX += event.movementX / 100;
            this.state.inputVars.rotateY += event.movementY / 100;
        }
    }

    mouseDownEvent = (event) => {
        this.state.inputVars.mousePressed = true;
        //if (event.shiftKey) this.rayCasting((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1) #ENABLE SHIFT CLICK MOVE THE CAMERA CENTER
    }


    mouseUpEvent = (event) => {
        this.state.inputVars.mousePressed = false;
    }

    mouseWheelEvent = (event) => {
        this.state.inputVars.scrolled -= event.deltaY
    }

    windowResizeEvent = (event) => {
        this.state.renderer.setSize(window.innerWidth, window.innerHeight);
        this.state.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 20000);
    }

    keyDownEvent = (event) =>{
        if(event.key=="ArrowLeft"){
            if(this.state.currentCastle>0){
                this.state.currentCastle--;
            }else{
                this.state.currentCastle = this.state.castles.length-1;
            }
            this.state.center = this.state.castles[this.state.currentCastle];
        }else if(event.key=="ArrowRight"){
            if(this.state.currentCastle<this.state.castles.length-1){
                this.state.currentCastle++;
            }else{
                this.state.currentCastle = 0;
            }
            this.state.center = this.state.castles[this.state.currentCastle];
        }
    }

    setupController() {
        let domElement = this.state.renderer.domElement;
        domElement.addEventListener("mousedown", this.mouseDownEvent, false)
        domElement.addEventListener("mouseup", this.mouseUpEvent, false)
        domElement.addEventListener("mousemove", this.mouseMoveEvent, false)
        domElement.addEventListener("wheel", this.mouseWheelEvent, false)
        window.addEventListener("keydown",this.keyDownEvent);
        window.addEventListener("resize", this.windowResizeEvent)
    }


    rayCasting = (mouseX, mouseY) => {
        let rayCaster = new THREE.Raycaster();
        rayCaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), this.state.camera);

        let intersects = rayCaster.intersectObjects(this.state.scene.children);

        if (intersects[0]) {
            this.state.center = intersects[0].point;
        }
    }


    loadMap = (data) => {
        let map = data.data
        let colors = map.colors;
        for (let color of colors) {
            let meshColor = color[0];
            let meshArrays = color[1];
            let geometry = new THREE.BufferGeometry()
            geometry.setAttribute('position', new THREE.BufferAttribute(Float32Array.from(meshArrays[0]), 3))
            geometry.setAttribute('normal', new THREE.BufferAttribute(Float32Array.from(meshArrays[1]), 3));
            geometry.computeBoundingSphere()
            let material = new THREE.MeshStandardMaterial({color: new THREE.Color(meshColor)});
            let mesh = new THREE.Mesh(geometry, material);
            this.state.scene.add(mesh);
        }
        let gltfLoader = new GLTFLoader();
        gltfLoader.load("mapData/castle.glb", model => {
            let castlesPosition = map.castlePosition;
            for (let position of castlesPosition) {
                let positionModel = model.scene.clone(true);
                let vectorPos = new THREE.Vector3(position[0], position[1], position[2]);
                this.state.castles.push(vectorPos);
                this.state.center = vectorPos;
                this.state.currentCastle++;
                positionModel.position.set(position[0], position[1], position[2])

                positionModel.scale.set(0.5, 0.5, 0.5)

                let PointLight = new THREE.PointLight(new Color(255, 255, 0), 0.005, 20)
                PointLight.position.set(position[0], position[1] + 10, position[2])
                this.state.scene.add(PointLight)
                this.state.scene.add(positionModel)
            }
        }, undefined, function (error) {

            console.error(error);
        })

        this.setupTrees("/mapData/forestTree.glb",map.forestTrees,0.5);
        this.setupTrees("/mapData/savannaTree.glb",map.savannaTrees,0.5);
        this.setupTrees("/mapData/bush.glb",map.plainTrees,0.25);
    }

    setupTrees = (link,map,scale) =>{
        let gltfLoader = new GLTFLoader();
        gltfLoader.load(link, gltf => {
            let geometries = new Map();
            let GLTFscene = gltf.scene;

            for (let i = 0; i < GLTFscene.children.length; i++) {
                geometries.set(GLTFscene.children[i].material.color, new Array())
            }

            for (let i = 0; i < map.length; i++) {
                let randRot = Math.random() * Math.PI * 2;
                for (let j = 0; j < GLTFscene.children.length; j++) {
                    let childObject = GLTFscene.children[j];

                    let childGeometry = new THREE.InstancedBufferGeometry();
                    THREE.BufferGeometry.prototype.copy.call(childGeometry, childObject.geometry);

                    let childMat = childObject.material;

                    childGeometry.scale(scale, scale, scale)
                    childGeometry.translate(map[i].x, map[i].y, map[i].z)
                    childGeometry.translate(childObject.position.x, childObject.position.y, childObject.position.z)
                    geometries.get(childMat.color).push(childGeometry)
                }
            }

            for (let key of geometries.keys()) {
                let geometryArray = geometries.get(key);
                let geometry = BufferGeometryUtils.mergeBufferGeometries(geometryArray, false)
                let mesh = new THREE.Mesh(geometry, new MeshStandardMaterial({color: key}))
                this.state.scene.add(mesh)
            }

        }, undefined, error => {
            console.error(error)
        });
    }

    setupWater = () => {
        let waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000);

        this.state.water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load('mapData/waternormals.jpg', function (texture) {

                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

                }),
                alpha: 5.0,
                sunDirection: new THREE.Vector3(0, -1, 0),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 3.7
            }
        );

        this.state.water.rotation.x = -Math.PI / 2;
        this.state.water.position.y = 80;

        this.state.scene.add(this.state.water);
    }
    setupSky = () => {
        this.state.sky = new Sky();
        this.state.sky.scale.setScalar(450000);
        this.state.scene.add(this.state.sky);

        const skyUniforms = this.state.sky.material.uniforms;

        skyUniforms['turbidity'].value = 5;
        skyUniforms['rayleigh'].value = 0.3;
        skyUniforms['mieCoefficient'].value = 0.005;
        skyUniforms['mieDirectionalG'].value = 0.8;

        this.state.sunParameters = {
            inclination: 0,
            azimuth: 0.205
        };

        this.state.pmremGenerator = new THREE.PMREMGenerator(this.state.renderer);

        this.updateSun();
    }

    updateSun = () => {
        const theta = Math.PI * (this.state.sunParameters.inclination - 0.5);
        const phi = 2 * Math.PI * (this.state.sunParameters.azimuth - 0.5);

        this.state.sun.x = Math.cos(phi);
        this.state.sun.y = Math.sin(phi) * Math.sin(theta);
        this.state.sun.z = Math.sin(phi) * Math.cos(theta);

        this.state.sky.material.uniforms['sunPosition'].value.copy(this.state.sun);
        this.state.water.material.uniforms['sunDirection'].value.copy(this.state.sun).normalize();

        this.state.scene.environment = this.state.pmremGenerator.fromScene(this.state.sky).texture;

    }

    setupGui = () => {
        const waterUniforms = this.state.water.material.uniforms;
        let skyUniforms = this.state.sky.material.uniforms;

        waterUniforms.size.value = 100;
        const gui = new GUI()
        const folderSky = gui.addFolder('Sky');
        folderSky.add(this.state.sunParameters, 'inclination', 0, 0.5, 0.0001).onChange(this.updateSun);
        folderSky.add(this.state.sunParameters, 'azimuth', 0, 1, 0.0001).onChange(this.updateSun);

        folderSky.add(skyUniforms.turbidity, 'value', 0, 5, 0.01).onChange(this.updateSun).name('turbidity')
        folderSky.add(skyUniforms.rayleigh, 'value', 0, 5, 0.01).onChange(this.updateSun).name('rayleigh')
        folderSky.add(skyUniforms.mieCoefficient, 'value', 0, 5, 0.01).onChange(this.updateSun).name('mieCoefficient')
        folderSky.add(skyUniforms.mieDirectionalG, 'value', 0, 5, 0.01).onChange(this.updateSun).name('mieDirectionalG')
    }


    reloadScene = () => {
        Axios.get("api/graphics/map").then(response => {
            this.state.scene.clear();

            this.loadMap(response);


            this.setupWater();
            this.setupSky();
            this.setupGui();

            this.mount.appendChild(this.state.renderer.domElement);
            this.mount.appendChild(this.state.stats.dom)
            this.state.stats.showPanel(0);

            this.animate();
        })
    }

    /**
     * render a class's map
     *
     * @param displayClass the target class
     */
    renderMap = (displayClass) => {

        if (this.mount) {
            this.setupController();

            this.reloadScene();

        }
    }


    componentWillUnmount() {
        this._isMounted = false
    }

    render() {

        return <div ref={ref => (this.mount = ref)}/>

    }

}

export default MapView