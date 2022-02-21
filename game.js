var tileSetURL;
var tileset = null;
tileset = new Image();
//size of tiles on PX
let tileW , tileH ;
//scale of the map
var scale;
//size of map on tiles
let mapW , mapH ; //map height should not exceed screen height

let activeTileNumber = false;

let currentSecond = 0, frameCount = 0, framesLastSecond = 0, lastFrameTime = 0;

let shiftPressed = false;

let showTileNum = true;

elementHover = null;
// TODO : user should be able to add a background, so instead of white in case of no tiles you can see some sort of skybox
// TODO : user should be able to generate an automatic tileTypes with all the tiles on the uploaded tileSheet, then modify manually the data 
currentPickedTile = 0;
let gameMap = [];
let gameMapData = [];

let drawingOnLayer = 0;
let tempLevels;
let zLevels ;
let zContents = new Map();

//map key = tile on map | object key = type of event, object value = function params
let events = new Map();
let eventTypes = ["goToPage","changeMap","openWindow"]
let EventList = {};
// TODO : create "items" and "effects" content spaces, with their own zindex and particular map


floorType = {
    solid : 0,
    path : 1,
    water : 2, //slow move
    lava : 3, //damage per tick
}

tileTypes = new Object();
//tileTypesTest = new Object();

/* TODO :: 
    1-
        when there is to many contents for the picker section, it becomes really bothersome to navigate
        add some buttons to "jump" thru it, get the size of the canvas, get size of tiles, calculate how many tiles fit
        divide the total ammount for how many fit on each "scroll", thats the ammount of buttons
        maybe if still to many buttons, a re- divide will be needed
    2-
        implement the tile name changer
    3-
        implement animations on the new tile system
    4-
        add favorite layers system ?
    5-
        add a main menu from where you set the data BEFORE, the program starts running
    6-
        add button or hotkey for "multiple line" tile drawing
    7-
        make a help / tutorial section, with instructions on how to use this tool
    8-
        make user only version, with no editor, without the tile numbers and ready to run on pages with just a json, tile and 1 script
    10-
        add context menu for easily adding events on the selected tile
    11-
        add context menu to remove tiles on a particular layer
    12-
        add export option for each individual part of the project (map,settings,layers,events), user should be able to make the make the map "in parts"
    13-
        make json "fuser" to combine the different exports into the main one
    14-
        add example proyect
    15-
        add credits section, credit the tileset creator (see credits.md)
    16-
        maybe add posibility to work with multiple tilesets ?
    17-
        maybe make an "image editor", where you can draw with pixels ?? is there a cdn or iframe to implement ? secure? maybe redirect to some external easy to use page?
    18-
        maybe implement a way of "fusing" diferent sprites together on a tileset? maybe external cdn or iframe, check security, maybe redirect to external page
    19-
        map loading on the run, create an event that lets you change the currently displayed map, so you can travel trhu "zones"
*/



function setupProject(){
    gameCanvas = document.getElementById("game");
    ctx = gameCanvas.getContext("2d");
    
    fetchProject("./project.json","./tileTypes.json")
}

function fetchPartialProyect(hasTiles,hasZ){
    fetch("./proyectParams.json")
    .then(res => {
        return res.json();
    })
    .then(jsonData => {
        tileSetURL = jsonData.tileSetUrl;
        tileW = jsonData.tileW; 
        tileH = jsonData.tileH;
        scale = jsonData.scale;
        mapW = jsonData.mapW;
        mapH = jsonData.mapH;
        zLevels = jsonData.zLevels;
        gameMap = jsonData.gameMap;
    }).catch(function(error){
        window.alert("Error proyect parameters couldnt be loaded",error);
    });
    
    if(hasZ){
        fetch("./maps/zContents.json")
        .then(res => {
            return res.json();
        })
        .then(jsonData => {
            tempLevels = jsonData;        
        } ).catch(function(error){
            window.alert("Error TileTypes couldnt be loaded",error);
        });
    }

    if(hasTiles){
        fetch("./tileTypes.json")
        .then(res => {
            return res.json();
        })
        .then(jsonData => {
            tileTypes = jsonData;
            
            buildProyect(); 
        } ).catch(function(error){
            window.alert("Error TileTypes couldnt be loaded",error);
        });
    }
    for(let i = 0 ; i < EventList["goToPage"].length ; i++){
        let obj = {};
        obj = { [Object.keys(EventList)] : EventList["goToPage"][i] };
        addEvent(i, obj);
    }
}

function fetchProject(filePath,tileTypesPath){
    let typesDone, settingsDone;

    fetch(filePath)
    .then(res => {
        return res.json();
    })
    .then(jsonData => {
        tileSetURL = jsonData.settings.tileSetUrl;
        tileW = jsonData.settings.tileW; 
        tileH = jsonData.settings.tileH;
        scale = jsonData.settings.scale;
        mapW = jsonData.settings.mapW;
        mapH = jsonData.settings.mapH;
        
        zLevels = jsonData.settings.zLevels;
        gameMap = jsonData.map;

        EventList = jsonData.events;
        tempLevels = jsonData.zContent;

        settingsDone = true;
        generateEventsFromVar();
        if(typesDone === true && settingsDone === true){
            buildProyect();
        }
    }).catch(function(error){
        window.alert("Error proyect parameters couldnt be loaded",error);
    });
    
    fetch(tileTypesPath)
        .then(res => {
            return res.json();
        })
        .then(jsonData => {
            tileTypes = jsonData;
            typesDone = true;

            if(typesDone === true && settingsDone === true){
                buildProyect();
            }   
        }).catch(function(error){
            window.alert("Error TileTypes couldnt be loaded",error);
        });
    
    
}
function buildProyect(){
    gameCanvas = document.getElementById("game");
    ctx = gameCanvas.getContext("2d");

    tileset.src = tileSetURL;
    if([Object.keys(tileTypes)][0].length === 0){
        createTileSetFromImg();
    }
    canvasSizes = setCanvasSize(mapW,mapH,tileW,tileH,scale);

    changeGameMap();
    
    setLayers();
    if(tempLevels != undefined){
        setNewLayers()
    }
    

    canvasW = canvasSizes[0];
    canvasH = canvasSizes[1];

    gameCanvas.width = canvasW;
    gameCanvas.height = canvasH;

    ctx.scale(scale,scale); //SET THE SCALE FOR THE PROJECT

    generateEventsFromVar();
    setEventTypeOnHtml();
    setCurrentEventsOnHtml();
    buildOverlayButtons();
    startGame();
    closeMenuStartGame();
}
function startGame(){
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
    requestAnimationFrame(drawGame);

    setPickerParams();
    //idk why this doesnt load if called instantly, and also  doesnt throw any errors
    //setTimeout(setPickerParams,500);
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
    //console.log(zLevels);
    for(let z = 0; z <= zLevels;z++){
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
                
                if(zContents.size > 0 && zContents.get(z) ){
                    //console.log(tileTypes[zContents.get(z).tileNum] === toIndex(x,y,mapW));                    
                    if(zContents.get(z).hasOwnProperty( toIndex(x,y,mapW) ) ){
                        var tile = tileTypes[zContents.get(z)[toIndex(x,y,mapW)]];
                        //console.log("has", tileTypes[ zContents.get(toIndex(x,y, mapW)) ].name);
                        //let sprite = tile.sprite; 
                        let sprite = getFrame(tile.sprite, tile.spriteDuration, currentFrameTime, tile.animated);
                        ctx.drawImage(tileset,
                            sprite.x, sprite.y, sprite.w, sprite.h,
                            (x*tileW),  (y*tileH),
                            tileW, tileH);
                    }
                }
                //check if the user wants to see the tile numbers
                if(showTileNum){
                    ctx.font = "bold 5pt sans-serif";
                    ctx.fillStyle = "#ff0000";
                    ctx.fillText(toIndex(x,y, mapW),(x*tileW) +10 , (y*tileH)+14);
                }
            }
        }
    }
        ctx.fillStyle = "#ff0000";
        ctx.fillText("FPS: " + framesLastSecond, 10, 20);
        requestAnimationFrame(drawGame);
}