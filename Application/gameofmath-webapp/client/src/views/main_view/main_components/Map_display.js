import React, {Component} from 'react';
import Axios from "axios";
import * as THREE from 'three'
import {GUI} from "dat.gui";
import {Water} from "three/examples/jsm/objects/Water2";


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

        this.renderMap(null)
    }


    /**
     * render a class's map
     *
     * @param displayClass the target class
     */
    renderMap = (displayClass) => {

        if (this.mount) {

            Axios.get("/api/graphics/map").then(r => {

                const renderer = new THREE.WebGLRenderer();
                renderer.setSize(window.innerWidth, window.innerHeight);
                let camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
                renderer.outputEncoding = THREE.sRGBEncoding;
                renderer.shadowMap.enabled = true;
                let scene = new THREE.Scene();
                scene.background = new THREE.Color("#000000")
                let mousePressed = false;
                let rotateX = 0, rotateY = 0;
                let scrolled = 100;
                let camDistance = 0;
                var center = new THREE.Vector3(0, 0, 0)
                //VARS

                //INPUTS
                renderer.domElement.addEventListener("mousedown", function (event) {
                    mousePressed = true;
                    if (event.shiftKey) rayCasting((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1)
                }, false)
                renderer.domElement.addEventListener("mouseup", function (event) {
                    mousePressed = false;
                }, false)
                renderer.domElement.addEventListener("mousemove", function (event) {
                    if (mousePressed) {
                        rotateX += event.movementX / 100;
                        rotateY += event.movementY / 100;
                    }
                }, false)
                document.addEventListener("wheel", function (event) {
                    scrolled -= event.deltaY
                }, false)
                window.addEventListener("resize", function (event) {
                    renderer.setSize(window.innerWidth, window.innerHeight);
                    camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
                })
                //INPUTS

                //METHODS

                function rayCasting(mouseX, mouseY) {
                    console.log("RayCasting" + mouseX + ":" + mouseY)
                    let rayCaster = new THREE.Raycaster();
                    rayCaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

                    let intersects = rayCaster.intersectObjects(scene.children);
                    console.log(intersects)
                    if (intersects[0]) {
                        center = intersects[0].point
                    }
                }


                //RENDERING METHOD
                const animate = function () {
                    requestAnimationFrame(animate);
                    camDistance -= scrolled;
                    camDistance = Math.max(20, camDistance)
                    camDistance = Math.min(100, camDistance)
                    camera.position.z = center.z - (camDistance * Math.cos(Math.PI / 4)) * Math.cos(rotateX)
                    camera.position.x = center.x - (camDistance * Math.cos(Math.PI / 4)) * Math.sin(rotateX)
                    camera.position.y = camDistance * Math.sin(Math.PI / 4) + 80
                    camera.lookAt(center)
                    scrolled = 0
                    renderer.render(scene, camera);


                }
                //RENDERING METHOD

                //DATA COMPUTATION
                scene.clear();
                let map = r.data
                let triangles = map.vertices
                for (let color of triangles) {
                    let trianglesData = color[1]
                    let trianglesColor = color[0]
                    let geometry = new THREE.BufferGeometry()
                    let pointsArray = new Float32Array(trianglesData.length * 3 * 3)
                    let normalsArray = new Float32Array(trianglesData.length * 3 * 3)
                    for (let i = 0; i < trianglesData.length; i++) {
                        let points = [];
                        for (let j = 0; j < trianglesData[i].length; j++) {
                            points[j] = new THREE.Vector3(trianglesData[i][j].x - map.sizeX / 2, trianglesData[i][j].z, Math.round(trianglesData[i][j].y*100)/100 - map.sizeY / 2)
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

                    }
                    console.table(pointsArray)
                    geometry.setAttribute('normal', new THREE.BufferAttribute(normalsArray, 3))
                    geometry.setAttribute('position', new THREE.BufferAttribute(pointsArray, 3));
                    geometry.computeBoundingSphere()
                    let material = new THREE.MeshLambertMaterial({color: trianglesColor});
                    let mesh = new THREE.Mesh(geometry, material)
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    scene.add(mesh)



                }
                //DATA COMPUTATION

                //ENVIRONMENT
                const geometry = new THREE.PlaneGeometry(1000, 1000);
                let water = new Water(geometry,{color: 0x2389da,
                    scale: 1000,
                    flowDirection: new THREE.Vector2( 1, 1 ),
                    textureWidth: 1024,
                    textureHeight: 1024
                } )
                water.rotation.x = 3*Math.PI/2
                water.position.y=80
                scene.add(water);
                scene.fog = new THREE.FogExp2("#8BA6BB", 0.001)
                scene.background = new THREE.Color(0x87ceeb)

                let planeGeo = new THREE.PlaneBufferGeometry(1000, 1000);
                let mat = new THREE.MeshBasicMaterial({color : 0xc2b280,side: THREE.DoubleSide })
                let planeMesh = new THREE.Mesh(planeGeo,mat)
                planeMesh.rotation.x = Math.PI/2
                planeMesh.position.y  = 0
                scene.add(planeMesh)


                const dirLight = new THREE.DirectionalLight(0xffffff, 1);
                dirLight.color.setHSL(0.1, 1, 0.95);
                dirLight.position.multiplyScalar(30);
                scene.add(dirLight);

                dirLight.castShadow = true;

                dirLight.shadow.mapSize.width = 2048;
                dirLight.shadow.mapSize.height = 2048;

                const d = 50;

                dirLight.shadow.camera.left = -d;
                dirLight.shadow.camera.right = d;
                dirLight.shadow.camera.top = d;
                dirLight.shadow.camera.bottom = -d;

                dirLight.shadow.camera.far = 1000;
                dirLight.shadow.bias = -0.0001;

                const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 10);
                scene.add(dirLightHelper);

                const light = new THREE.PointLight(0xffffff,1)
                scene.add(light)

                const loader = new THREE.CubeTextureLoader();
                loader.setPath( 'mapData/texture/' );

                const textureCube = loader.load( [
                    'right.png', 'left.png',
                    'top.png', 'bottom.png',
                    'center.png', 'back.png'
                ] ,function(text){
                    scene.background = text
                });

                const gui = new GUI()
                const cubeFolder = gui.addFolder("Light")
                cubeFolder.add(water.position,"x",0,100,1)
                cubeFolder.add(water.position,"y",0,100,1)
                cubeFolder.add(water.position,"z",0,100,1)
                cubeFolder.add(water.rotation,"x",-Math.PI*2,Math.PI*2,0.01)
                cubeFolder.add(water.rotation,"y",-Math.PI*2,Math.PI*2,0.01)
                cubeFolder.add(water.rotation,"z",-Math.PI*2,Math.PI*2,0.01)
                cubeFolder.add(dirLight.position, "y", 0, 500, 1)
                cubeFolder.add(dirLight, "intensity", 0, 100, 0.01)
                cubeFolder.open()
                //ENVIRONMENT

                this.mount.appendChild(renderer.domElement);

                //RENDERING
                animate();
            })


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