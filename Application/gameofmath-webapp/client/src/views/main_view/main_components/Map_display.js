import React, {Component} from 'react';
import Axios from "axios";
import * as THREE from 'three'
import {GUI} from "dat.gui";
import {Water} from "three/examples/jsm/objects/Water";
import {Sky} from "three/examples/jsm/objects/Sky"


/**
 * @author quentin COSNIER
 * @author Antoine LE BORGNE
 *
 * render map on the screen
 */
class MapView extends Component {

    _isMounted = false



    componentDidMount() {
        this._isMounted = true

        document.title = "Game Of Math"

        this.setupValues();

        this.state.renderer.setSize(window.innerWidth, window.innerHeight);
        this.state.renderer.setPixelRatio(window.devicePixelRatio);

        this.renderMap(null)
    }

    setupValues = () =>{
        this.state ={
            renderer : new THREE.WebGLRenderer(),
            camera : new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 2000),
            scene : new THREE.Scene(),
            center : new THREE.Vector3(0, 0, 0),
            sun : new THREE.Vector3(),
            water : new Water(),
            inputVars : {
                mousePressed: false,
                rotateX: 0,
                rotateY: 0,
                scrolled: 100,
                camDistance: 0
            }
        }
    }


    animate = () => {
        requestAnimationFrame(this.animate);
        this.state.inputVars.camDistance -= this.state.inputVars.scrolled;
        this.state.inputVars.camDistance = Math.min(Math.max(20,this.state.inputVars.camDistance),100)
        this.state.camera.position.z = this.state.center.z - (this.state.inputVars.camDistance * Math.cos(Math.PI / 4)) * Math.cos(this.state.inputVars.rotateX)
        this.state.camera.position.x = this.state.center.x - (this.state.inputVars.camDistance * Math.cos(Math.PI / 4)) * Math.sin(this.state.inputVars.rotateX)
        this.state.camera.position.y = this.state.inputVars.camDistance * Math.sin(Math.PI / 4) + 80
        this.state.camera.lookAt(this.state.center)
        this.state.inputVars.scrolled = 0
        this.state.water.material.uniforms['time'].value += 1.0 / 60.0;
        this.state.renderer.render(this.state.scene, this.state.camera);
    }

    mouseMoveEvent = (event) =>{
        console.log("mousemovez")
        if (this.state.inputVars.mousePressed) {
            this.state.inputVars.rotateX += event.movementX / 100;
            this.state.inputVars.rotateY += event.movementY / 100;
        }
    }
    mouseDownEvent = (event) =>{
        console.log("mousedown")
        this.state.inputVars.mousePressed = true;
        if (event.shiftKey) this.rayCasting((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1)
    }

    mouseUpEvent = (event) =>{
        console.log("mouseup")
        this.state.inputVars.mousePressed = false;
    }

    mouseWheelEvent = (event) =>{
        console.log("wheel")
        this.state.inputVars.scrolled -= event.deltaY
    }

    windowResizeEvent = (event) =>{
        console.log("resize")
        this.state.renderer.setSize(window.innerWidth, window.innerHeight);
        this.state.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 20000);
    }

    setupController (){
        this.state.renderer.domElement.addEventListener("mousedown", this.mouseDownEvent, false)
        this.state.renderer.domElement.addEventListener("mouseup", this.mouseUpEvent, false)
        this.state.renderer.domElement.addEventListener("mousemove", this.mouseMoveEvent, false)
        this.state.renderer.domElement.addEventListener("wheel", this.mouseWheelEvent, false)
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
        let triangles = map.vertices
        for (let color of triangles) {
            let trianglesData = color[1]
            let trianglesColor = color[0]
            let geometry = new THREE.BufferGeometry()
            let pointsArray = new Float32Array(trianglesData.length * 3 * 3)
            let normalsArray = new Float32Array(trianglesData.length * 3 * 3)
            let uvArray = new Float32Array(trianglesData.length * 3 * 2)
            for (let i = 0; i < trianglesData.length; i++) {
                let points = [];
                for (let j = 0; j < trianglesData[i].length; j++) {
                    points[j] = new THREE.Vector3(trianglesData[i][j].x - map.sizeX / 2, trianglesData[i][j].z, Math.round(trianglesData[i][j].y * 100) / 100 - map.sizeY / 2)
                    pointsArray[i * 9 + j * 3] = points[j].x
                    pointsArray[i * 9 + j * 3 + 1] = points[j].y
                    pointsArray[i * 9 + j * 3 + 2] = points[j].z
                }
                let ab = new THREE.Vector3()
                let cb = new THREE.Vector3()
                ab.subVectors(points[0], points[1])
                cb.subVectors(points[2], points[1])
                cb.cross(ab)
                cb.normalize()
                for (let j = 0; j < 3; j++) {
                    normalsArray[i * 9 + j * 3] = cb.x
                    normalsArray[i * 9 + j * 3 + 1] = cb.y
                    normalsArray[i * 9 + j * 3 + 2] = cb.z
                }
                uvArray[i * 9] = 0
                uvArray[i * 9 + 1] = 0

                uvArray[i * 9 + 2] = 0.5
                uvArray[i * 9 + 3] = 0

                uvArray[i * 9 + 4] = 0.5
                uvArray[i * 9 + 5] = 0.5

            }

            geometry.setAttribute('normal', new THREE.BufferAttribute(normalsArray, 3))
            geometry.setAttribute('position', new THREE.BufferAttribute(pointsArray, 3));
            geometry.setAttribute(' uv', new THREE.BufferAttribute(uvArray, 2))
            geometry.computeBoundingSphere()
            let material = new THREE.MeshStandardMaterial({color: trianglesColor});


            let mesh = new THREE.Mesh(geometry, material)
            this.state.scene.add(mesh)
        }
    }

    setupWater = () =>{
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
            inclination: 0.49,
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


    setupGui =() =>{
        const waterUniforms = this.state.water.material.uniforms;
        let skyUniforms = this.state.sky.material.uniforms;
        const gui = new GUI()
        const cubeFolder = gui.addFolder("Water")
        cubeFolder.add(waterUniforms.distortionScale, 'value', 0, 8, 0.1).name('distortionScale');
        cubeFolder.add(waterUniforms.size, 'value', 0.1, 100, 0.1).name('size');
        cubeFolder.add(waterUniforms.alpha, 'value', 0.9, 1, .001).name('alpha');
        cubeFolder.add(this.state.water.position, 'y', 0, 100, .1);
        const folderSky = gui.addFolder('Sky');
        folderSky.add(this.state.sunParameters, 'inclination', 0, 0.5, 0.0001).onChange(this.updateSun);
        folderSky.add(this.state.sunParameters, 'azimuth', 0, 1, 0.0001).onChange(this.updateSun);

        folderSky.add(skyUniforms.turbidity, 'value', 0, 5, 0.01).onChange(this.updateSun).name('turbidity')
        folderSky.add(skyUniforms.rayleigh, 'value', 0, 5, 0.01).onChange(this.updateSun).name('rayleigh')
        folderSky.add(skyUniforms.mieCoefficient, 'value', 0, 5, 0.01).onChange(this.updateSun).name('mieCoefficient')
        folderSky.add(skyUniforms.mieDirectionalG, 'value', 0, 5, 0.01).onChange(this.updateSun).name('mieDirectionalG')



        cubeFolder.open()
    }


    reloadScene = () =>{
        Axios.get("/api/graphics/map").then(r => {
            this.state.scene.clear();

            this.loadMap(r);

            this.setupWater();
            this.setupSky();
            this.setupGui();

            this.mount.appendChild(this.state.renderer.domElement);

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