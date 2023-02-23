import './style.css'
import * as three from 'three';
import {MeshLine, MeshLineMaterial} from "three.meshline";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";

let width = window.innerWidth - document.getElementById("sidebar").clientWidth;
let height = window.innerHeight;

let scene;
let renderer;
let camera;
let controls;

let objects = []

function setup() {
    scene = new three.Scene();
    scene.background = new three.Color( 0xFAFAFA );

    renderer = new three.WebGLRenderer({ alpha: false});
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    camera = new three.PerspectiveCamera( 45, width / height, 1, 500 );

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();

    camera.position.set( 0, 0, 20 );
    camera.lookAt( 0, 0, 0 );

    controls.enableRotate = false;

    controls.mouseButtons = {
        LEFT: three.MOUSE.PAN,
        MIDDLE: three.MOUSE.DOLLY,
        RIGHT: three.MOUSE.ROTATE
    }

    controls.maxDistance = 50;
    controls.minDistance = 10;
    controls.zoomSpeed = 0.5;
}

document.clearMechanics = function () {
    if (renderer === null || renderer === undefined) return;
    renderer.domElement.remove()
}

document.startMechanics = function() {
    document.clearPure()
    document.clearStats()
    setup()
}

function createSlope() {
    let slopePoints = [new three.Vector3(1,1,0), new three.Vector3(2,1,0), new three.Vector3(2,0,0),  new three.Vector3(1,0,0), new three.Vector3(1,1,0)]
    createObject(slopePoints)
    let grid2D = new three.GridHelper(50, 50, 0x000000, 0xAAAAAA);

    grid2D.rotateX(1.57)
    grid2D.color = 0x000000
    scene.add(grid2D)
}

function createObject(points) {
    const material = new MeshLineMaterial({color: "#000000", lineWidth: 0.05})
    const geometry = new three.BufferGeometry().setFromPoints(points);
    const line = new MeshLine()
    line.setGeometry(geometry)

    const mesh = new three.Mesh(line, material)

    scene.add( mesh );

    objects.push(mesh);
}

function hideOptions() {
    let items = document.getElementById("sidebar").getElementsByClassName("toolbox-item")
    for (let i = 0; i < items.length; i++) {
        items[i].style.color = "#ffffff"
        items[i].animate([
            {width: "0%"},
        ], {
            duration: 500,
            iterations: 1,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "forwards"
        })
        setTimeout(function () {
            items[i].style.display = "none"
        }, 500)
    }
    setTimeout(function () {
        createBackButton()
    }, 400)
}

function showOptions() {
    let items = document.getElementById("sidebar").getElementsByClassName("toolbox-item")
    for (let i = 0; i < items.length; i++) {
        items[i].style.color = "#8f8f8f"
        items[i].style.display = "block"
        items[i].animate([
            {width: "100%"},
        ], {
            duration: 500,
            iterations: 1,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "forwards"
        })
    }
    deleteBackButton()

}

function createBackButton() {
    let field = document.createElement("div")
    field.id = "back"
    field.style.opacity = "0%"
    field.textContent = "◄"
    document.getElementById("sidebar").appendChild(field)
    field.addEventListener("click", showOptions)

    field.animate([
        {opacity: "100%"},
    ], {
        duration: 200,
        iterations: 1,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards"
    })
}

function deleteBackButton() {
    document.getElementById("back").animate([
        {opacity: "0%"},
    ], {
        duration: 200,
        iterations: 1,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards"
    })

    setTimeout(function () {
        document.getElementById("back").remove()
    }, 100)
}

document.startSlopeObject = function () {
    hideOptions()
    createSlope()
}

window.addEventListener("resize", onResize);
function onResize() {
    width = window.innerWidth - document.getElementById("sidebar").clientWidth;
    height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}
