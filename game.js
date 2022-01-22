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
let mapW = 10, mapH = 10; //map height should not exceed screen height

let currentSecond = 0, frameCount = 0, framesLastSecond = 0, lastFrameTime = 0;

elementHover = null;
// TODO : user should be able to add a background, so instead of white in case of no tiles you can see some sort of skybox
// TODO : user should be able to import a json with map, scale, width, layer ammount & contents, and tileTypes
// TODO : user should be able to generate an automatic tileTypes with all the tiles on the uploaded tileSheet, then modify manually the data 
// TODO : update dowwnload function to export : Map widht & height, tileSheet, scale, tiles size, floorTypes, zlevels, zcontents
currentPickedTile = 0;
let gameMap = [];
let gameMapData = [];
// TODO : fix z content, add extra filter to be able to store more than 1 object on the same map position KEY
let zLevels = 4;
let zContents = new Map();
// TODO : create "items" and "effects" content spaces, with their own zindex and particular map
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
    canvasSizes = setCanvasSize(mapW,mapH,tileW,tileH,scale);

    if(gameMap.length <= 0){
        gameMap = generateGameMap(mapW,mapH);
        gameMapData = gameMap.slice(0);
    }
    canvasW = canvasSizes[0];
    canvasH = canvasSizes[1];

    gameCanvas.width = canvasW;
    gameCanvas.height = canvasH;

    ctx.scale(scale,scale); //SET THE SCALE FOR THE PROJECT
    fetch("./tileTypes.json")
    .then(res => {
        return res.json();
    })
    .then(jsonData => {tileTypes = jsonData;startGame()} )    
}

function startGame(){
    
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
    setPickerParams();
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
/*
    IMAGE DOESN'T LOAD    
    My image is not loading, what should i do !?
    1-
        a) Open your tilesheet on gimp or some image manipulation program
        b) Activate the grid helper
        c) set the individual cells of the grid to the width and height of your tiles
        d) Select 1 pixel of the top left of the tile and check the coordinates ( X , Y)
        e) Check that the json has the same coords, and tile size.
    2- 
        Check what color is your sprite / tile, it should be different to the background, white sprite with white bg will be invisible
        how to solve? either change the tiles behind or change the color of the menu the sprite is on
*/
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
                    var tile = tileTypes[gameMapData[toIndex(x,y, mapW)]];
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
                        let sprite = tile.sprite; 
                        //getFrame(tile.sprite, tile.spriteDuration, currentFrameTime, tile.animated);
                        ctx.drawImage(tileset,
                            sprite.x, sprite.y, sprite.w, sprite.h,
                            (x*tileW),  (y*tileH),
                            tileW, tileH);
                    }
                }
                ctx.font = "bold 5pt sans-serif";
                ctx.fillStyle = "#ff0000";
                ctx.fillText(toIndex(x,y, mapW),(x*tileW) +10 , (y*tileH)+14);
            }
        }
    }
        ctx.fillStyle = "#ff0000";
        ctx.fillText("FPS: " + framesLastSecond, 10, 20);
        requestAnimationFrame(drawGame);
}


/*
    !!! Around 1799 there is multiple drawings colored white and end up being ivisible !!!!

    // TODO : setting this manually is annoying and stupid, 
    // add some function that let you set an index number and map it to its ID
    // Probably an upgrade to the UI on the developer side will be needed
    // add thumbnail of currently selected (animated if needed), name selector section, is an animation? , what are its frames, index and default color if sprite is missing
    // 
    Secciones suelos ( index 0):
    130 - 458 
    468 - 528 
    537 - 631
    854 - 856
    867 - 1084
    1099 - 1226 
    1229 - 1356
    1363 - 1366
    1405 - 1408
    1417 - 1424
    1441 - 1483
    1571 - 1574

    secciones decoraciones ( index 1):
    1 - 129
    459 - 467
    529 - 536
    632 - 769
    770 - 779 icons ? 2
    780 - 853
    857 - 866
    1085 - 1098
    1227 - 1228
    1357 - 1362
    1367 - 1404
    1409 - 1416
    1425 - 1440
    1484 
    1485 - 1492 Projectiles ? 2
    1493 - 1546 Smoke effects ? 3
    1547 - 1570 projectiles ?

*/

