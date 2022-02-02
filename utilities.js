

//#region Events
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
onkeydown = function(e){
    
    if(e.key === "Shift" && shiftPressed === false){
        
        shiftPressed = true;
    }
}
onkeyup = function(e){
    
    if(e.key === "Shift"){
        
        shiftPressed = false;
    }
}
oncontextmenu = function(e){
    if(elementHover === null){return;}
    e.preventDefault();
}
onmousedown = function(e){
    getClickContext(e);    
}
onsubmit = function(e){
    
    if(e.target.id === "newEvent"){
        let params = e.target ;
        createEvent(params.eventName.value, stringToInt(params.eventTile.value), params.eventType.value, getMultipleParam( params.eventArgs.value ),stringToInt( params.isModify.value));        
        params.eventName.value = "";        
        params.eventTile.value = "";
        params.eventArgs.value = "";
        params.isModify.value = false;

    }
    e.preventDefault();
}

//#endregion

//#region MOUSE CONTROLS 
function mouseEnterCanvas(id){
    //console.log("enter: ",id);
    elementHover = id;
}

function mouseLeaveCanvas(id){
    //console.log("leave: ",id);
    elementHover = null;
}

function getClickContext(e){
    if(elementHover === "game"){
        canvasOffset = gameCanvas.getBoundingClientRect();
        let posx = (e.pageX - canvasOffset.left)/scale;
        let posy = (e.pageY - canvasOffset.top)/scale;
        let tiles = pixelToMap(posx,posy, tileW,tileH);

        if(shiftPressed === true){
            hasEvent(tiles);
            return;
        }
        if(getMouseBtn(e) === "right"){
            //TODO: make a context menu appear if there is multiple layers
            getLayersAmmount(tiles[0],tiles[1], mapW)
            return;
        }else if(getMouseBtn(e) === "mid"){
            
            changeTileSpan ( gameMapData[ toIndex(tiles[0],tiles[1],mapW) ] );
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

//#endregion

//#region FETCH DATA 
function fetchFile(filePath){
    let tempSave;
    fetch(filePath)
    .then(res => {
        return res.json();
    })
    .then(jsonData => {
        tempSave = jsonData;
    }).catch(function(error){
        window.alert("Error proyect parameters couldnt be loaded",error);
    });
}


//#endregion

//#region DOWNLOAD DATA 
function cleanDownload(downloadOrigin){
    //TODO : this cant acces href, fix
    URL.revokeObjectURL(href);
    document.getElementById(downloadOrigin).style ="display:none";
}

function downloadMap(mapData,filename,downloadOrigin){
    let map = JSON.stringify(mapData);
    const blob = new Blob([map], {type:"octet-stream"});
    let href = URL.createObjectURL(blob);
    
    let a = Object.assign(document.getElementById(downloadOrigin), {
        href, 
        style:"display:block",
        download:filename+".json"
    });
}

function exportProject(downloadOrigin){
    //zContents  , gameMapData , events
    let name = document.getElementById("filename").value;
    if(name === undefined || name === null || name === ""){
        name = "Project";
    }
    console.log(zContents);
    console.log(events);
    let proj = {};
    let settings = {
        "tileSetUrl" : tileSetURL,
        "tileW" : tileW, 
        "tileH" : tileH,
        "scale" : scale,
        "mapW" : mapW, 
        "mapH" : mapH,
        "zLevels" : zLevels      
    }
    proj.settings = settings;
    proj.map = gameMapData;
    proj.zContent = mapToJson(zContents);
    proj.events = mapToJson(events);
    console.log(JSON.stringify(proj));
    downloadMap(proj,name,downloadOrigin);
}

function mainDownload(downloadOrigin){
    let name = document.getElementById("filename").value;
    if(name === undefined || name === null || name === ""){
        name = "map";
    }
    console.log("name: ",name);
    downloadMap(gameMapData,name,downloadOrigin)
}

function downloadTypes(){
    let name = "tileType";
    
    downloadMap(tileTypes,name)
}

//#endregion

//#region CONVERT DATA 
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

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function mapToJson(map){
    let TempObject;
    TempObject = Object.fromEntries(map);
    return TempObject;
}

function jsonToMap(json,forStartFrom){
    let tempMap = new Map();
    for(i = forStartFrom; i <= Object.keys(json).length; i++){
        tempMap.set(i,json[i]);
    }
    return tempMap;
}
function stringToInt(string){
    return string * 1;
}
//#endregion

//#region HTML CHANGERS 
function enableHtmlSection(id){
    let sec = document.getElementById(id);
    if(sec.style.display === "none"){
        sec.style.display = "block"
    }else{
        sec.style.display = "none"
    }
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

function setStartIndexSelect(){
    let start;
    let input = document.getElementById("startInput");
    start = currentPickedTile;
    input.value = start;
}

function setEndIndexSelect(){
    let end;
    let input = document.getElementById("endInput");
    end = currentPickedTile;
    input.value = end;    
}

function setEventTypeOnHtml(){
    let typesElement = document.getElementById("eventType");

    for(let i = 0; i < eventTypes.length; i++)
    {        
        option = document.createElement("option");
        option.text = eventTypes[i];
        option.value = eventTypes[i];
        typesElement.add(option);
    }
}

function setCurrentEventsOnHtml(){
    let currentEvElement = document.getElementById("currentEvents");
    currentEvElement.innerHTML = "";
    let eventKeys = events.keys(); //get map iterator with key values
    let currValue ;
    for(let i = 0; i < events.size; i++)
    {
        option = document.createElement("option");
        currValue = eventKeys.next().value; // i != event map key

        option.text = i + " : " +( Object.keys( events.get( currValue ) ) );
        option.value = currValue;
        currentEvElement.add(option);
    }
}

function readExistingEvent(event){
    //get the dropdown on which the data is stored
    let dropDown = document.getElementById("currentEvents");
    let readForm = document.getElementById("readEvent");

    //get the id from the dropdown, used for getting objects on event map
    let tempEventId = dropDown.value;    
    let tempValue = events.get( stringToInt( tempEventId ));
    let tempEventName = Object.keys(tempValue);

    readForm.children.eventName.value = tempValue[tempEventName].name;
    readForm.children.eventArgs.value = tempValue[tempEventName].args;
    readForm.children.eventType.value = tempEventName;
    readForm.children.eventTile.value = tempEventId;

}
function modifyExistingEvent(event){
        //get the dropdown on which the data is stored
    let dropDown = document.getElementById("currentEvents");
    let readForm = document.getElementById("newEvent");

    //get the id from the dropdown, used for getting objects on event map
    let tempEventId = dropDown.value;    
    let tempValue = events.get( stringToInt( tempEventId ));
    let tempEventName = Object.keys(tempValue);

    readForm.children.eventName.value = tempValue[tempEventName].name;
    readForm.children.eventArgs.value = tempValue[tempEventName].args;
    readForm.children.eventType.value = tempEventName;
    readForm.children.eventTile.value = tempEventId;
    //set this to the now old event tile if you are modifing an existing event instead of just creating a new one
    readForm.children.isModify.value = tempEventId;
}
//#endregion

//#region TILES MODIFIERS

function addLayeredObj(tileNum,content,layer){
    let currentLayer;
    let cont = {};
    
    if(layer === undefined || layer  === null || layer === ""){
        currentLayer = drawingOnLayer;
    }else{
        currentLayer = layer;
    }
    //console.log("added",currentLayer,  "tile",content);
    
    if(zContents.has(currentLayer) && zContents.get(currentLayer) != undefined){
        console.log("has cont");
        cont = zContents.get(currentLayer);
    }
    
    cont[tileNum] = content
    zContents.set(currentLayer,cont);
    
}
function removeLayeredObj(tileNum,layer){
    let tempLayers;
    tempLayers = zContents.get(layer);
    delete tempLayers[tileNum]

    //zContents.set(tempLayers);
}
function addTileToMap(x,y, mapW){
    gameMapData[ toIndex(x,y, mapW) ] = currentPickedTile;
}
function addTileToMapFromPos(tilePos,tile){
    if(tile === undefined){
        tile = currentPickedTile;
    }
    gameMapData[ tilePos ] = tile;
}
function addNewTile(x,y,mapW){
        if( drawingOnLayer === 0){
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
function addTileOnRange(from,to,tile){
    if(tile === undefined){
        tile = currentPickedTile;
    }
    for(from ; from <= to ; from++){
        addTileToMapFromPos(from,tile)
    }
}
//#endregion

//#region SET PROJECT DATA
function setCanvasSize(mapW,mapH,TilesW,TilesH,scale){
    let canvasW = (mapW * TilesW) * scale;
    let canvasH = (mapH * TilesH) * scale;
    
    return [canvasW,canvasH];
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
            tileTypesTest[toIndex(x,y,ammounTileW)] =  { name:"name "+toIndex(x,y,ammounTileW) , floor:floorType.path, 
                sprite:[{x:x*tileW,y:y*tileH,w:tileW,h:tileH}] , colour:"#999999"
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

function setLayers(layers){
    let layersTotal;
    let selectElement = document.getElementById("layerSelect");
    let option;
    if(layers != undefined){
        layersTotal = layers;
    }else{
        layersTotal = zLevels;
    }
    for(let i = 1; i <= layersTotal; i++)
    {
        if(i === 1){
            option = document.createElement("option");
            option.text = "Layer " + (i - 1) + " (Default)";
            option.value = i - 1;
            selectElement.add(option);
        }
        zContents.set(i);
        option = document.createElement("option");
        option.text = "Layer " + i;
        option.value = i;
        selectElement.add(option);
    }
}

function modifyTileType(tile,value){
    let tempTile = tile;
    let tempVal = document.getElementById("zindexInput").value;
    if(tempTile === undefined || tempTile === null || tempTile === ""){
        if(tempTile != 0){
            tempTile = currentPickedTile;
        }else{
            console.log("cant modify that tile");
        }
    }

    if(tileTypes[tempTile] === undefined){
        console.log("invalid tile");
    }else{
        tileTypes[tempTile].zIndex = stringToInt( tempVal );
    }
    
}

function modifyTileTypeRange(tile){
    let tempValStart = document.getElementById("startInput").value;
    let tempValEnd = document.getElementById("endInput").value;
    let index = document.getElementById("zindexRangeInput").value;
    if(tempValStart === undefined || tempValStart === null || tempValEnd === 0 || tempValEnd === undefined || tempValEnd === null){
        console.log("invalid data",tempValStart,tempValEnd);
        return;
    }
    if(index === ""){
        console.log("Index is empty");
        return
    }
    console.log(tempValStart,tempValEnd);
    for(let i = tempValStart; i <= tempValEnd; i++){
        if(tileTypes[i] === undefined){
            console.log("invalid tile");
        }else{
            tileTypes[i].zIndex = index;
            console.log(tileTypes[i].zIndex);
        }
    }
    
}
//#endregion

//#region HAS DATA OR GET DATA
function hasEvent(tile){
    let checkTile = toIndex(tile[0],tile[1],mapW);
    console.log(checkTile);
    if(events.has(checkTile)){
        findEvent( events.get(checkTile) );
    }
}
function findEvent(event){
    console.log("event lookup");
    if( event["goToPage"] != undefined ){
        goToPage(event["goToPage"]["args"][0],event["goToPage"]["args"][1]);
    }else if( event["details"] != undefined  ){

    }else{
        console.log("event not found",event);
    }
}
function getLayersAmmount(x,y, mapW){
    let tile = toIndex(x, y, mapW );
    
    for(i = zLevels; i >= 1; i-- ){
        
        if( zContents.get(i)[tile] != undefined ){
            removeLayeredObj(tile,i);
            return;
        }else if(i === 1){
            
            removeTile(x,y,mapW);
            return;
        }
    }
}
//#endregion

//#region Events
function createEvent(eventName,eventTile,eventType,event,isModify){
    let tempEvent = {};
    let tempParams = [];    
    if( typeof(isModify) === "number"){
        events.delete(isModify)
    }
    for(let i = 0; i < event.length ; i++){
        if(event[i] == "true" || event[i] == "false"){
            tempParams[i] = ( event[i] == "true" );
        }else{
            tempParams[i] = event[i];
        }
    }
    
    tempEvent = {[eventType]: {"args":tempParams,"name":eventName}};
    console.log(tempEvent);
    addEvent(eventTile,tempEvent);
}
function addEvent(tileCoords,event){    
    events.set(tileCoords,event);
    setTimeout(setCurrentEventsOnHtml,100)
    
}

//#endregion


function getMultipleParam(parameter){
    let param = parameter;
    let len = param.length;
    let tempParams = [];
    tempParams[0] = "";
    let ammountOfParams = 0;

    for (i = 0; i < len ; i++){
        if(param[i] === ","){
            ammountOfParams ++;
            tempParams[ammountOfParams] = "";
        }else{    
            tempParams[ammountOfParams] += param[i]
        }
    }
    
    return tempParams;
}

function changeGameMap(){
    
    if(gameMap.length <= 0){
        gameMap = generateGameMap(mapW,mapH);
    }
    gameMapData = gameMap.slice(0);
}
function loadMapArea(){

}

// MADE ALTERNATIVE VERSION, THAT CREATES A WINDOW ON HTML ASKING THE USER IF THEY WANT TO GO TO ANOTHER PAGE, (WITH FLAVOR TEXT)
function goToPage(link,newTab){
    console.log(link,newTab);
    let a = document.createElement('a');
    a.href = link;
    if (!newTab){
        a.setAttribute('target');
    }else{
        a.setAttribute('target','_blank');
    }
    a.click();
}
