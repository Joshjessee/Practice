let container = document.querySelector(".container");
let gridButton = document.getElementById("submit-grid");
let clearGridButton = document.getElementById("clear-grid");
let gridWidth = document.getElementById("width-range");
let gridHeight = document.getElementById("height-range");
let colorButton = document.getElementById("color-input");
let eraseBtn = document.getElementById("erase-btn");
let paintBtn = document.getElementById("paint-btn");
let widthValue = document.getElementById("width-value");
let heightValue = document.getElementById("height-value");

let events = {
    mouse: {
        down: "mousedown", 
        move: "mousemove",
        up: "mouseup"
    },
    touch: {
        down: "touchstart",
        move: "touchmove", 
        up: "touchend"
    }

};

let deviceType = "";

let draw = false;
let erase = false;

const isTouchDevice = () =>{
    try{
        document.createEvent("TouchEvent");
        deviceType = "touch";
        return true;
    }  catch(e){
        deviceType = "mouse";
        return false;
    }
};

isTouchDevice();

gridButton.addEventListener("click", ()=>{
    container.innerHTML = "";
    const w = parseInt(gridWidth.value, 10);
    const h = parseInt(gridHeight.value, 10);
    if(w === 0 || h === 0){
        alert('Please choose a grid width and height greater than 0');
        return;
    }

    for(let i =0; i < h; i++){
        let row = document.createElement("div");
        row.classList.add("gridRow");

        for(let j =0; j < parseInt(gridWidth.value, 10); j++){
            let col = document.createElement("div");
            col.classList.add("gridCol");
            col.setAttribute("id", `gridCol${i}-${j}`);

            col.addEventListener(events[deviceType].down, (e)=>{
                draw = true;
                if(erase){
                    col.style.backgroundColor = "transparent";
                }else{
                    col.style.backgroundColor = colorButton.value;
                }
            });

            col.addEventListener(events[deviceType].move, (e)=>{
                let x = !isTouchDevice() ? e.clientX : e.touches[0].clientX;
                let y = !isTouchDevice() ? e.clientY : e.touches[0].clientY;
                let element = document.elementFromPoint(x, y);
                if(element) checker(element.id);
            });

            col.addEventListener(events[deviceType].up, ()=>{
                draw = false;
            });

            row.appendChild(col);
        }

        container.appendChild(row);
    }
});

function checker(elementId){
    let gridColumns = document.querySelectorAll(".gridCol");
    gridColumns.forEach((element)=>{
        if(elementId == element.id){
            if(draw && !erase){
                element.style.backgroundColor = colorButton.value;
            }else if(draw && erase){
                element.style.backgroundColor = "transparent";
                
            }
        }
    });
}

clearGridButton.addEventListener("click", ()=>{
    container.innerHTML = "";
});

eraseBtn.addEventListener("click", ()=>{
    erase = true;
});

paintBtn.addEventListener("click", ()=>{
    erase = false;
});

gridWidth.addEventListener("input", ()=>{
    widthValue.innerHTML = gridWidth.value < 10 ? `0${gridWidth.value}` : gridWidth.value;
});

gridHeight.addEventListener("input", ()=>{
    heightValue.innerHTML = gridHeight.value < 10 ? `0${gridHeight.value}` : gridHeight.value;
});

window.addEventListener('load', () =>{
    // Set default starting values so the slider doesn't appear centered
    if(!gridWidth.value) gridWidth.value = 0;
    if(!gridHeight.value) gridHeight.value = 0;
    widthValue.innerHTML = gridWidth.value === '0' ? '00' : gridWidth.value;
    heightValue.innerHTML = gridHeight.value === '0' ? '00' : gridHeight.value;
});