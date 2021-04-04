import React, {Component} from 'react';
import * as THREE from 'three'
import {GUI} from "dat.gui";
import {Water} from "three/examples/jsm/objects/Water";
import {Sky} from "three/examples/jsm/objects/Sky"
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {BufferGeometryUtils} from 'three/examples/jsm/utils/BufferGeometryUtils';
import '../styles/map_style.css'
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


    constructor() {
        super();

        this.state = {
            global: false,
            renderer: new THREE.WebGLRenderer(),
            camera: new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 2000),
            HResScene: new THREE.Scene(),
            LResScene: new THREE.Scene(),
            center: new THREE.Vector3(0, 80, 0),
            sun: new THREE.Vector3(),
            water: new Water(),
            stats: new Stats(),
            able: true,
            avgFPS: 0,
            nbFrames: 0,
            mapDetails: {
                sizeX: 500,
                sizeY: 500
            },
            currentCastle: 0,
            castles: [],
            inputVars: {
                mousePressed: false,
                oldTouchX: 0,
                oldTouchY: 0,
                rotateX: 0,
                rotateY: 0,
                camDistance: 100,
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

        let time = Date.now();

        requestAnimationFrame(this.animate);
        //this.state.stats.begin();
        if (!this.props.zoomed) {
            let posX = Math.min(Math.max(-this.state.inputVars.rotateX * 50, -this.state.mapDetails.sizeX), this.state.mapDetails.sizeX);
            let posY = Math.min(Math.max(-this.state.inputVars.rotateY * 50, -this.state.mapDetails.sizeY), this.state.mapDetails.sizeY);
            this.state.camera.position.set(posX, 500, posY)
            this.state.camera.lookAt(new THREE.Vector3(posX, 80, posY))
        } else {
            this.state.camera.position.set(this.state.center.x -
                (this.state.inputVars.camDistance * Math.cos(Math.PI / 4)) * Math.sin(this.state.inputVars.rotateX),
                (this.state.inputVars.camDistance * Math.sin(Math.PI / 4) + 80),
                (this.state.center.z - (this.state.inputVars.camDistance * Math.cos(Math.PI / 4)) *
                    Math.cos(this.state.inputVars.rotateX)))
            this.state.camera.lookAt(this.state.castles[this.state.currentCastle])

        }
        this.state.water.material.uniforms['time'].value += 1.0 / 60.0;


        if (this.state.able) {
            this.state.renderer.render(this.state.HResScene, this.state.camera);

            let length = Date.now() - time;
            if(this.state.nbFrames>10){
                if(this.state.avgFPS>35){
                    this.setState({able: false})
                }
            }else{
                if(this.state.avgFPS==0){
                    this.setState({avgFPS:length})
                }else{
                    this.setState({avgFPS:(this.state.avgFPS+length)/2})
                }
            }
        } else {
            this.state.renderer.render(this.state.LResScene, this.state.camera);
        }
        this.setState({nbFrames: this.state.nbFrames+1})
        //this.state.stats.end();
    }

    mouseMoveEvent = (event) => {
        if (this.state.inputVars.mousePressed) {
            let inputVars = this.state.inputVars;
            inputVars.rotateX = this.state.inputVars.rotateX + event.movementX / 100;
            inputVars.rotateY = this.state.inputVars.rotateY + event.movementY / 100;
            this.setState({
                inputVars: inputVars
            })
        }
    }

    mouseDownEvent = (event) => {
        let inputVars = this.state.inputVars;
        inputVars.mousePressed = true
        this.setState({inputVars: inputVars})

    }


    mouseUpEvent = (event) => {
        let inputVars = this.state.inputVars;
        inputVars.mousePressed = false
        this.setState({inputVars: inputVars})
        if (!this.props.zoomed) {
            this.rayCasting((event.clientX / window.innerWidth) * 2 - 1
                , -(event.clientY / window.innerHeight) * 2 + 1)
        }
    }

    mouseWheelEvent = (event) => {
        if (this.props.zoomed) {
            let inputVars = this.state.inputVars;
            inputVars.camDistance = Math.min(Math.max(30, this.state.inputVars.camDistance + event.deltaY), 100)
            this.setState({
                inputVars: inputVars
            })
        }
    }

    onTouchMove = (event) => {
        let inputVars = this.state.inputVars;
        inputVars.rotateX = this.state.inputVars.rotateX - (this.state.inputVars.oldTouchX - event.touches[0].clientX) / 100;
        inputVars.rotateY = this.state.inputVars.rotateY - (this.state.inputVars.oldTouchY - event.touches[0].clientY) / 100;
        inputVars.oldTouchX = event.touches[0].clientX;
        inputVars.oldTouchY = event.touches[0].clientY;
        this.setState({
            inputVars: inputVars
        })
    }

    onTouchStart = (event) => {
        let inputVars = this.state.inputVars;
        inputVars.oldTouchX = event.touches[0].clientX;
        inputVars.oldTouchY = event.touches[0].clientY;
        this.setState({
            inputVars: inputVars
        })
    }


    windowResizeEvent = (event) => {
        this.state.renderer.setSize(window.innerWidth, window.innerHeight);
        this.setState({
            camera: new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight
                , 1, 20000)
        })
    }

    setupController() {
        let domElement = this.state.renderer.domElement;
        domElement.addEventListener("mousedown", this.mouseDownEvent, false)
        domElement.addEventListener("mouseup", this.mouseUpEvent, false)
        domElement.addEventListener("mousemove", this.mouseMoveEvent, false)
        domElement.addEventListener("wheel", this.mouseWheelEvent, false)
        window.addEventListener("resize", this.windowResizeEvent)
    }


    rayCasting = (mouseX, mouseY) => {
        let rayCaster = new THREE.Raycaster();
        rayCaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), this.state.camera);

        let intersects;
        if (this.state.able) {
            intersects = rayCaster.intersectObjects(this.state.HResScene.children);
        } else {
            intersects = rayCaster.intersectObjects(this.state.LResScene.children);
        }

        const regex = new RegExp('^Castle:.$');
        intersects.forEach(object => {
            if (regex.test(object.object.name)) {
                let castleId = object.object.name.split(":")[1];
                this.props.details(castleId)
                this.setState({currentCastle: castleId, center: this.state.castles[castleId]})
            }
        })

    }


    loadMap = (data, hightRes) => {
        let map = data.data
        let colors = map.colors;
        for (let color of colors) {
            let meshColor = color[0];
            let meshArrays = color[1];
            let geometry = new THREE.BufferGeometry()
            geometry.setAttribute('position', new THREE.BufferAttribute(Float32Array.from(meshArrays[0]), 3))
            geometry.setAttribute('normal', new THREE.BufferAttribute(Float32Array.from(meshArrays[1]), 3));
            geometry.computeBoundingSphere()
            let material;
            if (hightRes) {
                material = new THREE.MeshStandardMaterial({color: new THREE.Color(meshColor)});
            } else {
                material = new THREE.MeshBasicMaterial({color: new THREE.Color(meshColor)});
            }
            this.state.HResScene.add(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: new THREE.Color(meshColor)})))
            this.state.LResScene.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: new THREE.Color(meshColor)})))
        }
        let gltfLoader = new GLTFLoader();
        gltfLoader.load("mapData/castle.glb", model => {
            console.log(model.scene)
            let castlesPosition = map.castlePosition;
            for (let position of castlesPosition) {
                let positionModel = model.scene.clone(true);
                let vectorPos = new THREE.Vector3(position[0], position[1], position[2]);
                this.state.castles.push(vectorPos);
                positionModel.children[0].material.roughness = 0.6
                positionModel.children[0].material.metalness = 1
                positionModel.position.set(position[0], position[1], position[2])
                positionModel.scale.set(0.8, 0.8, 0.8)
                positionModel.name = "Castle"

                let PointLight = new THREE.PointLight(new THREE.Color(255, 255, 0), 0.005, 20)
                PointLight.position.set(position[0], position[1] + 10, position[2])


                const geometry = new THREE.BoxGeometry();
                let material;
                if (hightRes) {
                    material = new THREE.MeshStandardMaterial({color: 0x00ff00});
                } else {
                    material = new THREE.MeshBasicMaterial({color: 0x00ff00});
                }
                const cube = new THREE.Mesh(geometry, material);
                cube.name = "HelperCube"
                cube.position.set(position[0], position[1], position[2])
                cube.scale.set(10, 10, 10);
                cube.name = "Castle:" + this.state.currentCastle;
                this.setState({currentCastle: this.state.currentCastle + 1})
                cube.visible = false;

                this.state.HResScene.add(cube.clone())
                this.state.LResScene.add(cube.clone())
                let date = new Date(Date.now()).getHours();
                if(date<8 ||date>20){
                    this.state.HResScene.add(PointLight)
                }
                this.state.HResScene.add(positionModel.clone());
                this.state.LResScene.add(positionModel.clone());
            }
        }, undefined, function (error) {

            console.error(error);
        })

        this.setupTrees("/mapData/forestTree.glb", map.forestTrees, 0.7, map.castlePosition);
        this.setupTrees("/mapData/savannaTree.glb", map.savannaTrees, 0.3, map.castlePosition);
        this.setupTrees("/mapData/bush.glb", map.plainTrees, 0.25, map.castlePosition);


    }

    setupTrees = (link, map, scale, castles, highRes) => {
        let gltfLoader = new GLTFLoader();
        gltfLoader.load(link, gltf => {
            let geometries = new Map();
            let GLTFscene = gltf.scene;

            for (let i = 0; i < GLTFscene.children.length; i++) {
                geometries.set(GLTFscene.children[i].material.color, [])
            }

            for (let i = 0; i < map.length; i++) {
                if(map[i].y<=this.state.water.position.y+1)continue;
                let valid = true;
                castles.forEach(castle => {
                    if ((castle[0] - map[i].x <= 10 && castle[0] - map[i].x >= -10) && (castle[2] - map[i].z <= 10 && castle[2] - map[i].z >= -10)) {
                        valid = false;
                    }
                })
                if (valid) {
                    let randRot = Math.random() * Math.PI * 2;
                    for (let j = 0; j < GLTFscene.children.length; j++) {
                        let childObject = GLTFscene.children[j];

                        let childGeometry = new THREE.InstancedBufferGeometry();
                        THREE.BufferGeometry.prototype.copy.call(childGeometry, childObject.geometry);

                        let childMat = childObject.material;

                        childGeometry.scale(childObject.scale.x, childObject.scale.y, childObject.scale.z)
                        childGeometry.rotateX(childObject.rotation.x);
                        childGeometry.rotateY(childObject.rotation.y);
                        childGeometry.rotateZ(childObject.rotation.z);
                        childGeometry.translate(childObject.position.x, childObject.position.y, childObject.position.z)
                        childGeometry.scale(scale, scale, scale)

                        childGeometry.rotateY(randRot)
                        childGeometry.translate(map[i].x, map[i].y, map[i].z)
                        geometries.get(childMat.color).push(childGeometry)
                    }
                }
            }

            for (let key of geometries.keys()) {
                let geometryArray = geometries.get(key);
                let geometry = BufferGeometryUtils.mergeBufferGeometries(geometryArray, false)
                let material;
                this.state.LResScene.add( new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: key})));
                this.state.HResScene.add( new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({color: key})));
            }

        }, undefined, error => {
            console.error(error)
        });
    }

    setupWater = () => {
        let waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000);

        this.setState({
            water: new Water(
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
                    distortionScale: 3.7,
                }
            )
        })

        let water = new Water(
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
                distortionScale: 3.7,
            }
        )

        water.rotation.set(-Math.PI / 2, this.state.water.rotation.y, this.state.water.rotation.z)
        water.position.set(this.state.water.position.x, 80, this.state.water.position.z)

        this.state.water.rotation.set(-Math.PI / 2, this.state.water.rotation.y, this.state.water.rotation.z)
        this.state.water.position.set(this.state.water.position.x, 80, this.state.water.position.z)

        this.state.HResScene.add(this.state.water);
        this.state.LResScene.add(water);
    }
    setupSky = () => {
        this.setState({sky: new Sky()});
        this.state.sky.scale.setScalar(450000);
        this.state.HResScene.add(this.state.sky.clone());
        this.state.LResScene.add(this.state.sky.clone());

        const skyUniforms = this.state.sky.material.uniforms;

        skyUniforms['turbidity'].value = 0.5;
        skyUniforms['rayleigh'].value = 0.3;
        skyUniforms['mieCoefficient'].value = 0.005;
        skyUniforms['mieDirectionalG'].value = 0.8;

        let date = new Date(Date.now()).getHours();
        date = date-8<=0?24-date:date-8
        if(date==0)date=24;

        this.setState({
            sunParameters: {
                inclination: 0,
                azimuth: date/24
            },
            pmremGenerator: new THREE.PMREMGenerator(this.state.renderer)
        })

        this.updateSun();
    }

    updateSun = () => {

        const theta = Math.PI * (this.state.sunParameters.inclination - 0.5);
        const phi = 2 * Math.PI * (this.state.sunParameters.azimuth - 0.5);

        this.state.sun.set(Math.cos(phi), Math.sin(phi) * Math.sin(theta), Math.sin(phi) * Math.cos(theta))

        this.state.sky.material.uniforms['sunPosition'].value.copy(this.state.sun);
        this.state.water.material.uniforms['sunDirection'].value.copy(this.state.sun).normalize();
        this.state.HResScene.environment = this.state.pmremGenerator.fromScene(this.state.sky).texture;
        this.state.LResScene.environment = this.state.pmremGenerator.fromScene(this.state.sky).texture;
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
            this.state.HResScene.clear();
            this.state.LResScene.clear();
            this.loadMap(response, this.state.able);


            this.setupWater();
            this.setupSky();
            //this.setupGui();

            this.mount.appendChild(this.state.renderer.domElement);
            //this.mount.appendChild(this.state.stats.dom)
            //this.state.stats.showPanel(0);


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
        return <div className={"mapView"} onTouchMove={this.onTouchMove} onTouchStart={this.onTouchStart}
                    ref={ref => (this.mount = ref)}/>

    }

}

export default MapView