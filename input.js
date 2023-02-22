var mathFields = []
document.activeMode = "pure"

function createField() {
    let field = document.createElement("div")
    field.className = "math-input"
    document.getElementById("sidebar").appendChild(field)

    // replace exit with a dropdown box with options (create matrix, create vector)
    let exit = document.createElement("div")
    exit.className = "exit-input"
    exit.textContent = "x"
    exit.style.opacity = "0%"
    field.appendChild(exit)
    exit.addEventListener("click", onExitClick)

    let input = document.createElement("span")
    input.className = "text-input"
    field.appendChild(input)
    input.addEventListener("keyup", document.redrawAllObjects)

    let additional = document.createElement("div")
    additional.className = "additional-box closed"
    additional.style.height = "0px"
    additional.value = ""
    document.getElementById("sidebar").appendChild(additional)

    let mathField = MQ.MathField(input)

    mathFields.push(mathField)
    animateExit(exit)
}

document.createMatrixField = function () {
    let field = document.createElement("div")
    field.className = "math-input matrix"
    document.getElementById("sidebar").appendChild(field)

    // replace exit with a dropdown box with options (create matrix, create vector)
    let exit = document.createElement("div")
    exit.className = "exit-input"
    exit.textContent = "x"
    exit.style.opacity = "0%"
    field.appendChild(exit)
    exit.addEventListener("click", onExitClick)

    let input = document.createElement("span")
    input.className = "text-input"
    field.appendChild(input)
    input.addEventListener("keyup", matrixListener)

    let mathField = MQ.MathField(input, {
        spaceBehavesLikeTab: true,
    })
    mathFields.push(mathField)
    mathField.latex("\\begin{bmatrix}&&\\\\&&\\\\&&\\end{bmatrix}");
    animateExit(exit)
}

function matrixListener () {

}

function createButton() {
    let button = document.createElement("div")
    button.id = "add-input"
    button.textContent = "+"
    document.getElementById("sidebar").appendChild(button)
    button.addEventListener("click", onButtonClick)
}

function animate () {
    document.getElementById("add-input").animate([
            {height: "3vh", backgroundColor: "#d7d7d7", color: "#8f8f8f"},
            {height: "8vh", backgroundColor: "#ffffff", color: "#ffffff"},
        ], {
            duration: 200,
            iterations: 1,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "forwards"
        })

    setTimeout(function () {
        replaceButton()
    }, 200)
}

function animateExit (exit) {
    exit.animate([
        {opacity: "0%"},
        {opacity: "50%"},
    ], {
        duration: 500,
        iterations: 1,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards"
    })

}

function animateButton() {
    document.getElementById("add-input").animate([
        {opacity: "0%"},
        {opacity: "100%"},
    ], {
        duration: 500,
        iterations: 1,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards"
    })
}

function replaceButton() {
    document.getElementById("add-input").remove()
    createField()
    createButton()
    animateButton()
}

document.getMathElement = function (inputDOM) {
    let inputMaths = document.getElementById("sidebar").getElementsByClassName("math-input")
    let array =  [].slice.call(inputMaths);
    let index = array.indexOf(inputDOM)
    return mathFields[index]
}

document.getAdditionalBox = function (input) {
    let inputMaths = document.getElementById("sidebar").getElementsByClassName("math-input")
    let array =  [].slice.call(inputMaths);
    let index = array.indexOf(input)

    return document.getElementById("sidebar").getElementsByClassName("additional-box")[index]

}
function animateDeletion(clicked) {
    let parentElement = clicked.parentElement
    let additionalBox = document.getAdditionalBox(parentElement)

    clicked.remove()
    parentElement.getElementsByClassName("text-input")[0].remove()

    parentElement.animate([
        {height: "8vh"},
        {height: "0vh"},
    ], {
        duration: 200,
        iterations: 1,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards"
    })

    if (additionalBox.className === "additional-box open") {
        additionalBox.textContent = ""
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


    setTimeout(function () {
        parentElement.remove()
        additionalBox.remove()
        document.redrawAllObjects()

    }, 200)
}

function onExitClick(event) {
    let clicked = event.target
    let parent = clicked.parentElement
    let inputMaths = document.getElementById("sidebar").getElementsByClassName("math-input")
    let array =  [].slice.call(inputMaths);
    let index = array.indexOf(parent)
    mathFields.splice(index, 1)

    animateDeletion(clicked)
}

function onButtonClick() {
    document.getElementById("add-input").textContent = ""
    animate()
}

function clickLeftButton(e) {
    let src;

    let icon;
    if (e.target === document.getElementById("left-selector")) {
        icon = e.target.getElementsByClassName("icon")[0]
    } else {
        icon = e.target
    }

    animateSwitch(icon, src)
}

function clickRightButton(e) {
    let src;

    let icon;
    if (e.target === document.getElementById("right-selector")) {
        icon = e.target.getElementsByClassName("icon")[0]
    } else {
        icon = e.target
    }

    animateSwitch(icon, src)
}

function animateSwitch(icon, src) {

    let previousMode = document.activeMode
    src = "public/" + previousMode + ".png"
    document.activeMode = icon.parentElement.active
    icon.parentElement.active = previousMode


    icon.animate([
        {rotate: "0deg", opacity: "100%"},
        {rotate: "90deg", opacity: "0%"}
    ], {
        duration: 100,
        iterations: 1,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards"
    })

    setTimeout(function () {
        icon.src = src
        icon.animate([
            {rotate: "90deg", opacity: "0%"},
            {rotate: "0deg", opacity: "100%"}
        ], {
            duration: 100,
            iterations: 1,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "forwards"
        })
    }, 100)

    if (document.activeMode === "pure") {
        clearSidebar()
        document.startPure()
        createPureSidebar()
    } else if (document.activeMode === "mechanics") {
        clearSidebar()
        document.startMechanics()
        createMechanicsSideBar()
    } else {
        clearSidebar()
        document.startStats()
    }
}

function createPureSidebar() {
    let field = document.createElement("div")
    field.id = "add-input"
    field.textContent = "+"
    field.addEventListener("click", onButtonClick)
    document.getElementById("sidebar").appendChild(field)

    let dimensionSel = document.createElement("button")
    dimensionSel.id = "dimension-selector"
    dimensionSel.textContent = "3D"
    dimensionSel.addEventListener("click", document.toggleDimension)
    document.body.appendChild(dimensionSel)
}

function createMechanicsSideBar() {
    let toolboxItems = ["Slope Object", "Train Object", "Pulley Object", "Ladder Object"]
    for (let i = 0; i < toolboxItems.length; i++) {
        let toolBoxItem = document.createElement("div")
        toolBoxItem.className = "toolbox-item"
        toolBoxItem.textContent = toolboxItems[i]
        document.getElementById("sidebar").appendChild(toolBoxItem)

        let dropDown = document.createElement("div")
        dropDown.className = "toolbox-drop-down"
        dropDown.style.height = "0px"
        document.getElementById("sidebar").appendChild(dropDown)
    }
}

function clearSidebar() {
    document.getElementById("sidebar").replaceChildren()
    console.log(document.getElementById("dimension-selector"))
    if (document.getElementById("dimension-selector") !== null) {
        document.getElementById("dimension-selector").remove()
    }
}

document.getElementById("left-selector").active = "mechanics"
document.getElementById("left-selector").addEventListener("click", clickLeftButton)
document.getElementById("right-selector").active = "statistics"
document.getElementById("right-selector").addEventListener("click", clickRightButton)
createPureSidebar()
