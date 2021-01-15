import React, {Component} from 'react';
import Axios from "axios";
import * as THREE from 'three'
import {GUI} from "dat.gui";
import {Water} from "three/examples/jsm/objects/Water";
import {Sky} from "three/examples/jsm/objects/Sky"
import {Vector3} from "three";


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
                renderer.setPixelRatio( window.devicePixelRatio );
                let camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 2000);
                let scene = new THREE.Scene();
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
                    camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 20000);
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

                let water,sun;

                //RENDERING METHOD
                const animate = function () {

                    requestAnimationFrame(animate);
                    camDistance -= scrolled;
                    //camDistance = Math.max(20, camDistance)
                    //camDistance = Math.min(100, camDistance)
                    camera.position.z = center.z - (camDistance * Math.cos(Math.PI / 4)) * Math.cos(rotateX)
                    camera.position.x = center.x - (camDistance * Math.cos(Math.PI / 4)) * Math.sin(rotateX)
                    camera.position.y = camDistance * Math.sin(Math.PI / 4) + 80
                    camera.lookAt(center)
                    scrolled = 0
                    water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
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
                    geometry.setAttribute('normal', new THREE.BufferAttribute(normalsArray, 3))
                    geometry.setAttribute('position', new THREE.BufferAttribute(pointsArray, 3));
                    geometry.computeBoundingSphere()
                    let material = new THREE.MeshStandardMaterial({color: trianglesColor});
                    let mesh = new THREE.Mesh(geometry, material)
                    scene.add(mesh)



                }
                //DATA COMPUTATION

                //ENVIRONMENT
                sun = new THREE.Vector3();

                // Water

                const waterGeometry = new THREE.PlaneBufferGeometry( 10000, 10000 );

                water = new Water(
                    waterGeometry,
                    {
                        textureWidth: 512,
                        textureHeight: 512,
                        waterNormals: new THREE.TextureLoader().load( 'mapData/waternormals.jpg', function ( texture ) {

                            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

                        } ),
                        alpha: 5.0,
                        sunDirection: new THREE.Vector3(0 ,-1,0),
                        sunColor: 0xffffff,
                        waterColor: 0x001e0f,
                        distortionScale: 3.7
                    }
                );

                water.rotation.x = -Math.PI / 2;
                water.position.y = 80;

                scene.add( water );

                // Skybox

                const sky = new Sky();
                sky.scale.setScalar( 450000 );
                scene.add( sky );

                const skyUniforms = sky.material.uniforms;

                skyUniforms[ 'turbidity' ].value = 5;
                skyUniforms[ 'rayleigh' ].value = 2;
                skyUniforms[ 'mieCoefficient' ].value = 0.005;
                skyUniforms[ 'mieDirectionalG' ].value = 0.8;

                const parameters = {
                    inclination: 0.49,
                    azimuth: 0.205
                };

                const pmremGenerator = new THREE.PMREMGenerator( renderer );

                function updateSun() {

                    const theta = Math.PI * ( parameters.inclination - 0.5 );
                    const phi = 2 * Math.PI * ( parameters.azimuth - 0.5 );

                    sun.x = Math.cos( phi );
                    sun.y = Math.sin( phi ) * Math.sin( theta );
                    sun.z = Math.sin( phi ) * Math.cos( theta );

                    sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
                    water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

                    console.log(water.material.uniforms['sunDirection'].value)
                    scene.environment = pmremGenerator.fromScene( sky ).texture;

                }

                updateSun();

                const waterUniforms = water.material.uniforms;
                const gui = new GUI()
                const cubeFolder = gui.addFolder("Light")
                cubeFolder.add( waterUniforms.distortionScale, 'value', 0, 8, 0.1 ).name( 'distortionScale' );
                cubeFolder.add( waterUniforms.size, 'value', 0.1, 10, 0.1 ).name( 'size' );
                cubeFolder.add( waterUniforms.alpha, 'value', 0.9, 1, .001 ).name( 'alpha' );
                const folderSky = gui.addFolder( 'Sky' );
                folderSky.add( parameters, 'inclination', 0, 0.5, 0.0001 ).onChange( updateSun );
                folderSky.add( parameters, 'azimuth', 0, 1, 0.0001 ).onChange( updateSun );
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