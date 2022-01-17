//context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);

//ProjectUtumno_full.png is w: 64 sprites and h: 95 | last row ends on px:735
//from x: 0 && y: 64  TO  x:1791 && y:319 THERE IS BLOCKS  !!
//from x: 1952 && y: 1856  TO  x:191 && y:2632 THERE IS Characters  !!
//from x: 576 && y: 2528  TO  x:191 && y:2632 THERE IS min humanoid chars  !!

let tileSetURL = "./ProjectUtumno_full.png";
var tileset = null;
tileset = new Image();
tileset.src = tileSetURL;
//size of tiles on PX
let tileW = 32, tileH = 32;
//size of map on tiles
let mapW = 15, mapH = 14;

let currentSecond = 0, frameCount = 0, framesLastSecond = 0;

let blockPickerMap;
currentPickedTile = 0;
let gameMap = [
    2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
    0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 
    0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 
    0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 
    0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 
    0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 1, 0, 0, 
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
    0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 
];
let gameMapData = gameMap.slice(0);
let zLevels = 4;
tileSetPos = {
    0 : {pos:{x:32,y:0,w:32,h:32}},
    //brickStone1
    1 : {pos:{x:288,y:128,w:32,h:32}},
    2 : {pos:{x:1952,y:1856,w:32,h:32}},
}
floorType = {
    solid : 0,
    path : 1,
    water : 2,
}
tileTypes = {
    0 : {colour:"#685b48",  floor:floorType.solid, sprite:[{x:320,y:128,w:32,h:32}] },
    1 : {colour:"#5aa457",  floor:floorType.path, sprite:[{x:864,y:96,w:32,h:32}] },
    2 : {colour:"#678fd9",  floor:floorType.water, sprite:[{x:32,y:736,w:32,h:32}] },
};

function toIndex(x, y)
{
	return((y * mapW) + x);
}

window.onload = function(){    
    let gameCanvas = document.getElementById("game");
    ctx = gameCanvas.getContext("2d");
    canvasOffset = gameCanvas.getBoundingClientRect();
    canvasH = gameCanvas.height;
    canvasW = gameCanvas.width;
    ctx.scale(2,2); //SET THE SCALE FOR THE PROJECT
    
    requestAnimationFrame(drawGame);
    changeTileSpan(0);
    ctx.font = "bold 10pt sans-serif";
}
function drawGame(){
    if(ctx==null) {return;}
    let sec = Math.floor(Date.now()/1000);
    if(sec!=currentSecond){
        currentSecond = sec;
        framesLastSecond = frameCount;
        frameCount = 1;
    }else{
        frameCount++;
    }
    ctx.imageSmoothingEnabled = false; //this being true(default) makes images blurry

    
    for(let y = 0; y < mapH;y++){
        for(let x = 0; x < mapW;x++){
            switch(gameMapData[((y*mapW)+x)]){
                case 0:
                    var tile = tileTypes[gameMapData[toIndex(x,y)]];
                    break;
                case 1:
                    var tile = tileTypes[gameMapData[toIndex(x,y)]];
                    break;
                default:
                    var tile = tileTypes[gameMapData[toIndex(x,y)]];
            }
            ctx.drawImage(tileset,
				tile.sprite[0].x, tile.sprite[0].y, tile.sprite[0].w, tile.sprite[0].h,
				(x*tileW),  (y*tileH),
				tileW, tileH);

            ctx.fillStyle = "#ff0000";
            ctx.font = "bold 5pt sans-serif";
            ctx.fillStyle = "#ff0000";
            ctx.fillText(toIndex(x,y),(x*tileW) +10 , (y*tileH)+14);


        }
    }
    ctx.fillStyle = "#ff0000";
	ctx.fillText("FPS: " + framesLastSecond, 10, 20);
    requestAnimationFrame(drawGame);
	
}

onmousedown = function(e){
        let posx = (e.pageX - canvasOffset.left)/2;
        let posy = (e.pageY - canvasOffset.top)/2;            
        for(let y = 0; y < mapH;y++){
            for(let x = 0; x < mapW;x++){
                if(posx >= x*tileW && posx <= x*tileW + tileW){
                    if(posy >= y*tileH && posy <= y*tileH + tileH){
                        gameMapData[toIndex(x,y)] = currentPickedTile;
                        
                        break;
                    }
                }
                
            }
        }
    
}
function downloadMap(){
    let map = JSON.stringify(gameMapData);
    const blob = new Blob([map], {type:"octet-stream"});
    let href = URL.createObjectURL(blob);
    
    let a = Object.assign(document.getElementById("download"), {
        href, 
        style:"display:block",
        download:"map.json"
    });
    

    
}
function cleanDownload(){
    document.getElementById("download").style ="display:none";
    URL.revokeObjectURL(href);
}


function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function changeTileSpan (tile){
    let tilespan = document.getElementById("tile");
    currentPickedTile = tile;
    tilespan.innerText = getKeyByValue(floorType,currentPickedTile) + " : " + currentPickedTile;
}
