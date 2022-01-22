//context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);

//ProjectUtumno_full.png is w: 64 sprites and h: 95 | last row ends on px:735
//from x: 0 && y: 64  TO  x:1791 && y:319 THERE IS BLOCKS  !!
//from x: 1952 && y: 1856  TO  x:191 && y:2632 THERE IS Characters  !!
//from x: 576 && y: 2528  TO  x:191 && y:2632 THERE IS min humanoid chars  !!

tileSetURL = "./ProjectUtumno_full.png";
var tileset = null;
tileset = new Image();
tileset.src = tileSetURL;
//size of tiles on PX
let tileW = 32, tileH = 32;
//scale of the map
scale = 2;
//size of map on tiles
let mapW = 15, mapH = 14;

let currentSecond = 0, frameCount = 0, framesLastSecond = 0, lastFrameTime = 0;

elementHover = null;
// TODO : user should be able to import a json with map, scale, width, layer ammount & contents, and tileTypes
// TODO : user should be able to generate an automatic tileTypes with all the tiles on the uploaded tileSheet, then modify manually the data 
// TODO : update dowwnload function to export : Map widht & height, tileSheet, scale, tiles size, floorTypes, zlevels, zcontents
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
let zContents = new Map();
floorType = {
    solid : 0,
    path : 1,
    water : 2, //slow move
    lava : 3, //damage per tick
}

tileTypes = new Object();
tileTypesTest = new Object();


window.onload = function(){
    gameCanvas = document.getElementById("game");
    ctx = gameCanvas.getContext("2d");
    
    canvasH = gameCanvas.height;
    canvasW = gameCanvas.width;

    ctx.scale(scale,scale); //SET THE SCALE FOR THE PROJECT
    fetch("./tileTypes.json")
    .then(res => {
        return res.json();
    })
    .then(jsonData => {tileTypes = jsonData;startGame()} )    
}
function startGame(){
    console.log(tileTypes[0]);
    requestAnimationFrame(drawGame);
    for(x in tileTypes){
        tileTypes[x]['animated'] = tileTypes[x].sprite.length > 1 ? true : false;
        if(tileTypes[x].animated){
            let t = 0;
            for(s in tileTypes[x].sprite){
                tileTypes[x].sprite[s]['start'] = t;

                t += tileTypes[x].sprite[s].d;
                tileTypes[x].sprite[s]["end"] = t;                
            }
            tileTypes[x]["spriteDuration"] = t;
        }
    };
    changeTileSpan(0);
    picker();
    ctx.font = "bold 10pt sans-serif";
}
function getFrame(sprite, duration, time, animated){
    if(!animated){
        return sprite[0];
    }
    time = time % duration;

    for(x in sprite){
        if(sprite[x].end >= time){
            return sprite[x];
        }
    }
}
function drawGame(){
    if(ctx==null) {return;}

    ctx.clearRect(0,0, canvasW, canvasH);
    let currentFrameTime = Date.now();
    let timeElapsed = lastFrameTime - lastFrameTime;

    let sec = Math.floor(Date.now()/1000);
    if(sec!=currentSecond){
        currentSecond = sec;
        framesLastSecond = frameCount;
        frameCount = 1;
    }else{
        frameCount++;
    }
    ctx.imageSmoothingEnabled = false; //this being true(default) makes images blurry

    for(let z = 0; z < 4;z++){
        for(let y = 0; y < mapH;y++){
            for(let x = 0; x < mapW;x++){
                if(z === 0){
                    switch(gameMapData[toIndex(x,y, mapW)]){
                        case 0:
                            var tile = tileTypes[gameMapData[toIndex(x,y, mapW)]];
                            break;
                        case 1:
                            var tile = tileTypes[gameMapData[toIndex(x,y, mapW)]];
                            break;
                        default:
                            var tile = tileTypes[gameMapData[toIndex(x,y, mapW)]];
                            
                    }
                    let sprite = getFrame(tile.sprite, tile.spriteDuration, currentFrameTime, tile.animated);
                    ctx.drawImage(tileset,
                        sprite.x, sprite.y, sprite.w, sprite.h,
                        (x*tileW),  (y*tileH),
                        tileW, tileH);
                }
                if(z === 1 && zContents.size > 0){
                    if(zContents.has( toIndex(x,y, mapW) )){
                        var tile = tileTypes[zContents.get(toIndex(x,y, mapW))];
                        //console.log("has", tileTypes[ zContents.get(toIndex(x,y, mapW)) ].name);
                        let sprite = getFrame(tile.sprite, tile.spriteDuration, currentFrameTime, tile.animated);
                        ctx.drawImage(tileset,
                            sprite.x, sprite.y, sprite.w, sprite.h,
                            (x*tileW),  (y*tileH),
                            tileW, tileH);
                    }
                }
                //ctx.font = "bold 5pt sans-serif";
                //ctx.fillStyle = "#ff0000";
                //ctx.fillText(toIndex(x,y, mapW),(x*tileW) +10 , (y*tileH)+14);
            }
        }
    }
        ctx.fillStyle = "#ff0000";
        ctx.fillText("FPS: " + framesLastSecond, 10, 20);
        requestAnimationFrame(drawGame);
}

function createTileSetFromImg(){
    console.log(tileset.width , " , ", tileset.height);
    console.log(tileset.width / tileW);
    console.log(tileset.height / tileH);
    let ammounTileW = tileset.width / tileW;
    let ammounTileH = tileset.height / tileH;
    let totalTiles = ammounTileH * ammounTileW;
    for(let y = 0; y < ammounTileH ; y++){
        for(let x = 0; x < ammounTileW ; x++){
            tileTypesTest[toIndex(x,y,ammounTileW)] =  { colour:"#999999", name:toIndex(x,y,ammounTileW) , floor:floorType.path, 
                sprite:[{x:x*tileW,y:y*tileH,zIndex:0,w:tileW,h:tileH}] 
            }
        }
    }
}