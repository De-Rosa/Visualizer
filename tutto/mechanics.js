import './style.css'
import * as three from 'three';
import {MeshLine, MeshLineMaterial} from "three.meshline";

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
}

document.clearMechanics = function () {
    if (renderer === null || renderer === undefined) return;
    renderer.domElement.remove()
}

document.startMechanics = async function() {
    document.clearPure()
    document.clearStats()
    setup()
}

function createSlope() {

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