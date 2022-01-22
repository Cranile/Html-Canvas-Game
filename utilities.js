onwheel = function(e){
    if (elementHover != "blockPick"){
        //console.log("not in picker go back");
        return;
    }
    let direction = null;
        if(e.deltaY < 0){
            direction = "Up";
            if(initTile > 0){
                initTile = initTile - 1;
                initTileTotalW = initTileTotalW - pickerMapW;
                endTile = endTile - pickerMapW;
                drawPicker()
            }
        }else{
            direction = "Down";
            if(endTile < ammountOfTiles){
                initTile = initTile + 1;
                initTileTotalW = initTileTotalW +pickerMapW;
                endTile = endTile +pickerMapW;
                drawPicker()
            }
        }
        //console.log("mouse wheel: ",direction);
        //console.log("pos:  ",initTile,endTile);
}

oncontextmenu = function(e){
    if(elementHover === null){return;}
    e.preventDefault();
}

function setCanvasSize(mapW,mapH,TilesW,TilesH,scale){
    let canvasW = (mapW * TilesW) * scale;
    let canvasH = (mapH * TilesH) * scale;
    
    return [canvasW,canvasH];
}

function mouseEnterCanvas(id){
    //console.log("enter: ",id);
    elementHover = id;
}
function mouseLeaveCanvas(id){
    //console.log("leave: ",id);
    elementHover = null;
}

function addLayeredObj(tileNum,content){
    zContents.set(tileNum,content);
}
function removeLayeredObj(tileNum){
    zContents.delete(tileNum);
}

function indexToPx(index, mapW){
    let x = index % mapW;
    let y = Math.floor(index / mapW);
    return[x,y];
}
function pixelToMap(x ,y, tileW,tileH){        
        return [Math.floor(x / tileW) , Math.floor(y / tileH)]
}
function pixelToScrollMap(x ,y, tileW,tileH){        
        return [Math.floor(x / tileW) , Math.floor((y + initTile * tileH) / tileH)]
}
function toIndex(x, y, mapW)
{
	return((y * mapW) + x);
}

function downloadMap(mapData){
    let map = JSON.stringify(mapData);
    const blob = new Blob([map], {type:"octet-stream"});
    let href = URL.createObjectURL(blob);
    
    let a = Object.assign(document.getElementById("download"), {
        href, 
        style:"display:block",
        download:"map.json"
    });
    

    
}
function cleanDownload(){
    //TODO : this cant acces href, fix
    URL.revokeObjectURL(href);
    document.getElementById("download").style ="display:none";
}


function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function changeTileSpan (tile){    
    let tilespan = document.getElementById("tile");
    //change for whatever the "null" block is
    if(tile === "null" ){
        return;
    }
    currentPickedTile = tile;
    if(tileTypes[tile] === undefined || tileTypes[tile] === null){
        return;
    }
    tilespan.innerText = tileTypes[tile].name + " : " + currentPickedTile;
}

onmousedown = function(e){
    getClickContext(e);
}

function addTileToMap(x,y, mapW){
    gameMapData[ toIndex(x,y, mapW) ] = currentPickedTile;
}

function addNewTile(x,y,mapW){
        if( tileTypes[currentPickedTile].zIndex === undefined || tileTypes[currentPickedTile].zIndex === 0){
            addTileToMap(x,y, mapW)
        }else{
            //saves the code of the tile and position.
            addLayeredObj(toIndex(x,y, mapW) , currentPickedTile);
            
        }
}
function removeTile(x,y,mapW){
    console.log( toIndex(x,y, mapW) );
    gameMapData[ toIndex(x,y, mapW) ] = 0;
}

function getClickContext(e){
    
    if(elementHover === "game"){
        canvasOffset = gameCanvas.getBoundingClientRect();
        let posx = (e.pageX - canvasOffset.left)/scale;
        let posy = (e.pageY - canvasOffset.top)/scale;
        let tiles = pixelToMap(posx,posy, tileW,tileH);

        if(getMouseBtn(e) === "right"){
            //TODO: make a context menu appear if there is multiple layers
            getLayersAmmount(tiles[0],tiles[1], mapW)
            return;
        }

        addNewTile(tiles[0],tiles[1], mapW);
    }else if(elementHover === "blockPick"){        
        canvasOffset = pickerCanvas.getBoundingClientRect();
        let posx = (e.pageX - canvasOffset.left)/scale;
        let posy = (e.pageY - canvasOffset.top)/scale;
        let tiles = pixelToScrollMap(posx,posy, tileW,tileH);
        //TODO : fix this crap, this code shouldn't check the size of the current tiles +2 (null && 0), it should check if the actual tile exist
        //console.log(Object.keys(tileTypes).length, " , ",toIndex(tiles[0],tiles[1], pickerMapW) +2 );
        if(ammountOfTiles < (toIndex(tiles[0],tiles[1], pickerMapW))  ){
            //console.log("no such tile");
            return;
        }
        changeTileSpan(toIndex(tiles[0],tiles[1], pickerMapW));
        
    }else{
        //console.log("no hover, exit");
        return;
    }
}

function getMouseBtn(e){
    //Left
    //console.log("pressed: ",e.button);
    if(e.button === 0){
        //console.log("left");
        return "left";
    }else if(e.button === 2){
        //console.log("right");
        
        return "right";
    }else{
        //console.log("middle");
        return "mid";
    }
}

function getLayersAmmount(x,y, mapW){
    let tile = toIndex(x, y, mapW );
    
    if( zContents.has(tile) ){
        removeLayeredObj(tile);
    }else{
        removeTile(x,y,mapW);
    }
}

function mainDownload(){
    downloadMap(gameMapData)
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
            tileTypesTest[toIndex(x,y,ammounTileW)] =  { zIndex:0 ,name:"name "+toIndex(x,y,ammounTileW) , floor:floorType.path, 
                sprite:[{x:x*tileW,y:y*tileH,zIndex:0,w:tileW,h:tileH}] , colour:"#999999"
            }
        }
    }
}

function generateGameMap(mapW,mapH){
    let newMap = [];
    for (i = 0; i < mapW*mapH; i++){
        newMap[i] = 0;
    }
    return newMap;
}