import React, { Component } from 'react';
import Axios from "axios";
import * as THREE from 'three'

/**
 * @author quentin COSNIER
 * @author Antoine LE BORGNE
 *
 * render map on the screen
 */
class MapView extends Component{

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
    renderMap = (displayClass) =>{

        if(this.mount) {

            Axios.get("/api/graphics/map").then(r => {

                const renderer = new THREE.WebGLRenderer();
                renderer.setSize(window.innerWidth, window.innerHeight);
                let camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
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
                    for (let i = 0; i < trianglesData.length; i++) {
                        for (let j = 0; j < trianglesData[i].length; j++) {
                            pointsArray[i * 9 + j * 3] = trianglesData[i][j].x - map.sizeX / 2
                            pointsArray[i * 9 + j * 3 + 1] = trianglesData[i][j].z
                            pointsArray[i * 9 + j * 3 + 2] = trianglesData[i][j].y - map.sizeY / 2
                        }
                    }
                    geometry.setAttribute('position', new THREE.BufferAttribute(pointsArray, 3));
                    let material = new THREE.MeshBasicMaterial({color: trianglesColor, side: THREE.DoubleSide});
                    let mesh = new THREE.Mesh(geometry, material)
                    scene.add(mesh)
                }
                //DATA COMPUTATION

                //ENVIRONMENT
                const geometry = new THREE.PlaneGeometry(1000, 1000);
                const material = new THREE.MeshBasicMaterial({color: 0x006994, side: THREE.DoubleSide});
                geometry.rotateX(Math.PI / 2)
                const plane = new THREE.Mesh(geometry, material);
                plane.position.y = 79
                scene.add(plane);
                scene.fog = new THREE.FogExp2("#87ceeb", 0.005)
                scene.background = new THREE.Color(0x87ceeb)
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

        return <div ref={ref => (this.mount = ref)} />

    }

}

export default MapView