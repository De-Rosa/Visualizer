import './style.css'
import * as three from 'three';

let width = window.innerWidth - document.getElementById("sidebar").clientWidth;
let height = window.innerHeight;

let scene;
let renderer;
let camera;
let controls;

function setup() {
    scene = new three.Scene();
    scene.background = new three.Color( 0xFAFAFA );

    renderer = new three.WebGLRenderer({ alpha: false});
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    camera = new three.PerspectiveCamera( 45, width / height, 1, 500 );
}

document.clearStats = function () {
    if (renderer === null || renderer === undefined) return;
    renderer.domElement.remove()
}

document.startStats = async function() {
    document.clearPure()
    document.clearMechanics()
    setup()
}