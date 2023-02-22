import './style.css'
import * as three from 'three';
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {TWEEN} from "three/addons/libs/tween.module.min.js";
import {Text} from "troika-three-text";
import * as math from "mathjs";
import {parseTex} from "tex-math-parser";
import { MeshLine, MeshLineMaterial } from 'three.meshline';

let width = window.innerWidth - document.getElementById("sidebar").clientWidth;
let height = window.innerHeight;
let currentDimension = "2D"

let grid2D, gridX, gridY, gridZ;

let objectsPoints = []
let objects = []
let text = []

let scaleZoom = 1
let colors = ["#000000", "#bb2222", "#2222bb", "#22bb22", "#22bbbb", "#bb22bb"]

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

document.clearPure = function () {
    if (renderer === null || renderer === undefined) return;

    objectsPoints = []
    objects = []
    text = []
    currentDimension = "2D"
    renderer.domElement.remove()
}

document.startPure = function() {
    document.clearMechanics();
    document.clearStats()

    setup()
    setupControls()
    setup2DGraph()
    renderText2D()
    convertObjectsTo2D()
}

function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    TWEEN.update()
}

function setup2DGraph() {
    controls.enablePan = true;
    controls.enableRotate = false;

    controls.mouseButtons = {
        LEFT: three.MOUSE.PAN,
        MIDDLE: three.MOUSE.DOLLY,
        RIGHT: three.MOUSE.ROTATE
    }

    controls.maxDistance = 50;
    controls.minDistance = 10;
    controls.zoomSpeed = 0.5;
    draw2DGraphLines()
}

function setup3DGraph() {
    controls.enablePan = false;
    controls.enableRotate = true;

    controls.mouseButtons = {
        LEFT: three.MOUSE.ROTATE,
        MIDDLE: three.MOUSE.DOLLY,
        RIGHT: three.MOUSE.PAN
    }

    controls.maxDistance = 40;
    controls.minDistance = 30;
    draw3DGraphLines()
}

function setupControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();

    camera.position.set( 0, 0, 20 );
    camera.lookAt( 0, 0, 0 );
}

function draw2DGraphLines() {
    scene.remove(gridX)
    scene.remove(gridY)
    scene.remove(gridZ)
    clearText()

    const divisions = 200;
    const size = 200

    grid2D = new three.GridHelper(size, divisions, 0x000000, 0xAAAAAA);

    grid2D.rotateX(1.57)
    grid2D.color = 0x000000
    scene.add(grid2D)
}

function draw3DGraphLines() {
    scene.remove(grid2D)
    clearText()

    const divisions = 16;

    gridX = new three.GridHelper(16, divisions, 0x000000, 0xCCAAAA);
    gridY = new three.GridHelper(16, divisions, 0x000000, 0xAACCAA);
    gridZ = new three.GridHelper(16, divisions, 0x000000, 0xAAAACC);

    gridX.rotateY(1.57)
    gridY.rotateZ(1.57)
    gridZ.rotateX(1.57)

    scene.add(gridX)
    scene.add(gridY)
    scene.add(gridZ)
}

function clearText() {
    for (let i = 0; i < text.length; i++) {
        for (let j = 0; j < text[i].length; j++) {
            scene.remove(text[i][j])
        }
    }
    text = []
}

function convertObjectsTo2D() {
    var length = objects.length;
    for (let i=0; i<length; i++) {
        scene.remove(objects[i])
        objects.splice(i, 1)

        createObject(get2DPoints(objectsPoints[i]))
    }
}

function convertObjectsTo3D() {
    var length = objects.length;
    for (let i=0; i<length; i++) {
        scene.remove(objects[i])
        objects.splice(i, 1)

        createObject(get3DPoints(objectsPoints[i]))
    }
}

function moveTo2D() {
    const coordinates = new three.Vector3(0, 0, 20);
    convertObjectsTo2D()
    interpolateMovement(coordinates)
    setup2DGraph()
    renderText2D()
    document.redrawAllObjects()
}

function moveTo3D() {
    const coordinates = new three.Vector3(20, 20, 20);
    convertObjectsTo3D()
    interpolateMovement(coordinates)
    setup3DGraph()
    renderText3D()
    document.redrawAllObjects()
}

document.toggleDimension = function () {
    let selector = document.getElementById("dimension-selector")
    if (currentDimension === "2D") {
        currentDimension = "3D"
        selector.textContent = "2D"
        moveTo3D()
    } else {
        currentDimension = "2D"
        selector.textContent = "3D"
        moveTo2D()
    }
}

function interpolateMovement(targetPosition) {
    var position = new three.Vector3().copy( camera.position );
    var duration = 1000
    controls.target = new three.Vector3(0, 0, 0)
    controls.enabled = false;

    var tween = new TWEEN.Tween( position )
        .to( targetPosition, duration )
        .easing( TWEEN.Easing.Cubic.Out )
        .onUpdate( function () {
            camera.position.copy( position );
            camera.lookAt( controls.target );
        } )
        .onComplete( function () {
            camera.position.copy( targetPosition );
            camera.lookAt( controls.target );
            controls.enabled = true;
        } )
        .start();
}

function createObject(points) {
    let color;
    color = colors[objects.length % colors.length]

    const material = new MeshLineMaterial({color: color, lineWidth: 0.05})
    const geometry = new three.BufferGeometry().setFromPoints(points);
    const line = new MeshLine()
    line.setGeometry(geometry)

    const mesh = new three.Mesh(line, material)

    scene.add( mesh );

    objects.push(mesh);
}

function get2DPoints(points) {
    let newPoints = []
    for (let i=0; i<points.length; i++) {
        let newPoint = new three.Vector3(points[i].x / scaleZoom, points[i].y / scaleZoom, 0)
        newPoints.push(newPoint)
    }
    return newPoints
}

function get3DPoints(points) {
    let newPoints = []
    for (let i=0; i<points.length; i++) {
        let newPoint = new three.Vector3(points[i].x / scaleZoom, points[i].y / scaleZoom, points[i].z / scaleZoom)
        newPoints.push(newPoint)
    }
    return newPoints
}

function renderText2D() {
    const divisions = 200;
    text = []
    const directions = [new three.Vector3(1, 0, 0), new three.Vector3(0, 1, 0)]
    for (let x=0; x < 2; x++) {
        let axisText = []
        for (let i=-(divisions/2); i <= (divisions/2); i++) {
            if (i === 0) continue;
            let text = new Text()
            scene.add(text)
            text.text = math.ceil(i * scaleZoom);
            text.fontSize = 0.2
            text.color = "#000000"
            text.position.x = (i * directions[x].x)
            text.position.y = (i * directions[x].y)
            text.sync()
            axisText.push(text)
        }
        text.push(axisText)
    }
}

function renderText3D() {
    const divisions = 16;
    text = []
    const directions = [new three.Vector3(1, 0, 0), new three.Vector3(0, 1, 0), new three.Vector3(0, 0, 1)]
    for (let x=0; x < 3; x++) {
        let axisText = []
        for (let i=-(divisions/2); i <= (divisions/2); i++) {
            if (i === 0) continue;
            let text = new Text()
            scene.add(text)
            text.text = math.ceil(i * scaleZoom);
            text.fontSize = 0.2
            text.color = "#000000"
            text.position.x = (i * directions[x].x)
            text.position.y = (i * directions[x].y)
            text.position.z = (i * directions[x].z)
            if (x === 2) {
                text.orientation = "-z+y"
            }
            text.sync()
            axisText.push(text)
        }
        text.push(axisText)
    }
}

window.addEventListener("resize", onResize);

function onResize() {
    width = window.innerWidth - document.getElementById("sidebar").clientWidth;
    height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

document.removeAllObjects = function () {
    for (let i = objects.length-1; i >= 0; i--) {
        scene.remove(objects[i])
        objects.pop()
        objectsPoints.pop()
    }
}

document.redrawAllObjects = function () {
    document.removeAllObjects()
    let mathInputs = document.getElementById("sidebar").getElementsByClassName("math-input")
    for (let i = 0; i < mathInputs.length; i++) {
        let additionalBox = document.getAdditionalBox(mathInputs[i])
        additionalBox.textContent = undefined
        let value = document.getMathElement(mathInputs[i]).latex()
        if (value === "") {
            collapseBox(additionalBox)
        } else {
            parseMaths(value, additionalBox)
        }
    }
}

function parseMaths(input, additionalBox) {
    let parsedEquation;
    // do check if input only involves x and an = somewhere, then make x equal to that value and draw line
    try {
        let expression = input.replace(/[^\x00-\x7F]/g, "");
        parsedEquation = parseTex(expression)
    } catch (e) {
        return
    }

    try {
        let evaluatedExpr = parsedEquation.evaluate()
        if (evaluatedExpr.type === "Complex") {
            expandBox(additionalBox)
            return drawComplex(evaluatedExpr, additionalBox)
        }
        else if (evaluatedExpr.type === "DenseMatrix") {
            expandBox(additionalBox)
            return drawMatrix(evaluatedExpr, additionalBox)
        } else {
            expandBox(additionalBox)
            additionalBox.textContent = "= " + evaluatedExpr.toFixed(5);
        }

    } catch (e) {}

    if (currentDimension === "3D") {
        drawPlane(parsedEquation, additionalBox)
    } else {
        drawLine(parsedEquation, additionalBox)
    }
}

function drawLine(parsedEquation, additionalBox) {
    let divisions;
    if (currentDimension === "2D") {
        divisions = 200;
    } else {
        divisions = 16;
    }

    const increment = 0.01;
    let points = []

    for (let x = -(divisions /2); x <= (divisions / 2); x+=increment) {

        let y;
        try {
            y = parsedEquation.evaluate({x: (x)})
        } catch (e) {
            return
        }
        points.push(new three.Vector3(x, (y / scaleZoom), 0))
    }

    if (points.length > 0) {
        if (additionalBox.textContent === "") {
            collapseBox(additionalBox)
        }
        createObject(points)
        objectsPoints.push(points)
    }
}

function drawPlane(parsedEquation, additionalBox) {
    let divisions = 16;
    const increment = 0.1;

    let points = []

    for (let x = -(divisions /2); x <= (divisions / 2); x+=increment) {
        for (let y = -(divisions /2); y <= (divisions / 2); y+=increment) {
            let z;
            try {
                z = parsedEquation.evaluate({x: (x), y: (y)})
            } catch (e) {
                return
            }
            if ((-divisions) < z < (divisions)) {
                points.push(new three.Vector3(x, y, z))
            }
        }
    }

    if (points.length > 0) {
        if (additionalBox.textContent === "") {
            collapseBox(additionalBox)
        }
        createObject(points)
        objectsPoints.push(points)
    }
}

function drawComplex(evaluatedExpr, additionalBox) {
    let real = math.re(evaluatedExpr)
    let imaginary = math.im(evaluatedExpr)
    let argument = math.arg(evaluatedExpr)
    let magnitude = math.abs(evaluatedExpr)

    additionalBox.textContent = "r = " + magnitude.toFixed(3) + ", θ = " + argument.toFixed(3) + " (" + radians_to_degrees(argument).toFixed(3) + " degrees)"

    let points = [new three.Vector3(0,0,0), new three.Vector3(real, imaginary, 0)]
    createObject(points)
    objectsPoints.push(points)
}

function drawMatrix(evaluatedExpr, additionalBox) {
    try {
        let determinant = math.det(evaluatedExpr)
        additionalBox.textContent = "determinant = " + determinant
    } catch (e) {
        additionalBox.textContent = "no determinant"
    }
    let matrix = math.matrix(evaluatedExpr)
    let size = matrix.size()

    if (size[0] < 2 || size[0] > 3) return;
    if (size[1] < 2) return;

    let points = []
    for (let i = 0; i < size[1]; i++) {
        let vector = new three.Vector3(matrix.get([0, i]), matrix.get([1, i]), 0)
        points.push(vector)
    }
    if (points.length > 2) {
        points.push(new three.Vector3(matrix.get([0,0]), matrix.get([1, 0]), 0))
    }

    if (size[0] === 2) {
        createObject(points)
        objectsPoints.push(points)
    } else {
        let points3D = []
        for (let i = 0; i < size[1]; i++) {
            let vector = new three.Vector3(matrix.get([0, i]), matrix.get([1, i]), matrix.get([2, i]))
            points3D.push(vector)
        }
        points3D.push(new three.Vector3(matrix.get([0,0]), matrix.get([1, 0]), matrix.get([2, 0])))


        if (currentDimension === "2D") {
            createObject(points)
        } else {
            createObject(points3D)
        }
        objectsPoints.push(points3D)

    }
}

function radians_to_degrees(radians)
{
    var pi = Math.PI;
    return radians * (180/pi);
}

function collapseBox(additionalBox) {
    if (additionalBox.className === "additional-box closed") return;
    additionalBox.className = "additional-box closed"
    additionalBox.animate([
        {height: "3vh"},
        {height: "0vh"},
    ], {
        duration: 200,
        iterations: 1,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards"
    })
}


function expandBox(additionalBox) {
    if (additionalBox.className === "additional-box open") return;
    additionalBox.className = "additional-box open"
    additionalBox.animate([
        {height: "0vh"},
        {height: "3vh"},
    ], {
        duration: 200,
        iterations: 1,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards"
    })
}


function init() {
    setup()
    setupControls()
    setup2DGraph()
    renderText2D()
    convertObjectsTo2D()
    animate()
}

init()