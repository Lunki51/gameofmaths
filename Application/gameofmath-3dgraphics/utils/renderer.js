/**
 * The script to send to the user of the application for rendering the asked data
 */

//VARS
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.id = "render"
let element = document.getElementById(renderer.domElement.id)
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let scene = new THREE.Scene();
scene.background = new THREE.Color("#000000")
//VARS

//INPUTS
let mousePressed = false;
let rotateX = 0, rotateY = 0;
let scrolled = 100;
let camDistance = 0;
renderer.domElement.addEventListener("mousedown", function (event) {
    mousePressed = true;
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

//REQUEST

let request = new XMLHttpRequest();
request.onreadystatechange = function () {
    if (request.readyState == 4) {
        //RENDERING METHOD
        const animate = function () {
            requestAnimationFrame(animate);
            for (let object of scene.children) {
                object.rotation.y += rotateX
            }
            rotateX = 0;
            rotateY = 0;
            renderer.render(scene, camera);
        }
        //RENDERING METHOD

        //DATA COMPUTATION
        scene.clear();
        let map = JSON.parse(request.response);
        console.log(map)
        let triangles = map.vertices
        for (let color of triangles) {
            let trianglesData = color[1]
            let trianglesColor = color[0]
            let geometry = new THREE.BufferGeometry()
            let pointsArray = new Float32Array(trianglesData.length * 3)
            for (let i = 0; i < trianglesData.length; i++) {
                pointsArray[i * 3] = trianglesData[i].x - map.sizeX/2
                pointsArray[i * 3 + 1] = trianglesData[i].z
                pointsArray[i * 3 + 2] = trianglesData[i].y - map.sizeY/2
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
        plane.position.y = 11
        scene.add(plane);
        scene.fog = new THREE.FogExp2("#87ceeb", 0.002)
        //ENVIRONMENT

        //CAMERA
        camera.position.y = 100
        camera.position.z = 25
        camera.rotation.x = -Math.PI / 3
        //CAMERA

        //PAGE
        if (element) document.body.removeChild(element)
        document.body.appendChild(renderer.domElement);
        //PAGE

        //RENDERING
        animate();
    }
}

//REQUEST
request.open('GET',"__insert__")
request.send()