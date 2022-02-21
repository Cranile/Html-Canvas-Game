

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
    //console.log(e);
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

    }else if(e.target.id === "fullProjectForm"){
        let input = e.target.elements;
        let files = [];
        if(input.fullProject != undefined || input.tileFullProject != undefined || input.tileTypes != undefined){
            files[0] = input.fullProject.files;
            files[1] = input.tileFullProject.files;
            files[2] = input.tileTypes.files;

            console.log(files);
            setupProjectFull(files)
        }
    }else if(e.target.id === "newProject"){
        let input = e.target.elements;
        console.log("form data: ",input);
        createNewProject(input.tileW.value,input.tileH.value,input.mapW.value,input.mapH.value,input.zIndex.value,input.scale.value,input.tileUrl.files);
    }
    e.preventDefault();
}
onload = function(e){
    const fileSelector = document.getElementById("fullProject");
    fileSelector.addEventListener("change", (e) => {
        let file = e.target.files;
        
        //setupProjectFull(file);
    });
}


//#endregion

//#region MOUSE CONTROLS 
function mouseEnterCanvas(id){
    //console.log("enter: ",id);
    elementHover = id;
}

function mouseLeaveCanvas(id,event){
    
    if(event != undefined || event != null){        
        if( event.relatedTarget != null && event.relatedTarget.className === "canvasOverlayBtn"){
            return;
        }
    }
    
    //console.log("leave: ",id);
    elementHover = null;
}

function getClickContext(e){
    //console.log(elementHover);
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
        console.log(res);
        return res.json();
    })
    .then(jsonData => {
        //fetch should return data, and this beahaviour must happen on another function
        console.log(jsonData);
        gameMap = jsonData.map;

        if(jsonData.zContent){
            tempLevels = jsonData.zContent;
        }
    }).catch(function(error){
        console.log(error);
        window.alert("Error proyect parameters couldnt be loaded",error);
    });
    
}
function fetchNewMap(filePath){
    fetch(filePath)
    .then(res => {        
        return res.json();
    })
    .then(jsonData => {
        //fetch should return data, and this beahaviour must happen on another function
        console.log(jsonData);        
        changeGameMap(jsonData.map);

        if(jsonData.zContent){
            console.log("has layers");
            setNewLayers(jsonData.zContent);
        }else{
            zContents = new Map();
        }

        if(jsonData.events){
            EventList = jsonData.events;
            generateEventsFromVar();
        }else{
            EventList = new Map();
            events.clear();
        }
        buildOverlayButtons();
        setCurrentEventsOnHtml();

    }).catch(function(error){
        console.log(error);
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

function downloadTypes(downloadOrigin){
    let name = "tileTypes";
    
    downloadMap(tileTypes,name,downloadOrigin)
}

//#endregion

//#region CONVERT DATA 
function indexToPx(index, mapw){
    if(mapw === undefined || mapw === null){
        mapw = mapW
    }
    let x = index % mapw;
    let y = Math.floor(index / mapw);
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
/*
    What is this? there is no easy way to make collisions or hovers on canvas, since its contents are not 
    elements on themselves. you can make a manual collision detection, onmousemove check if mouse is inside
    tile, but probalby is going to be quite demanding, and with a big ammount of events or clickable effects
    is going to tank the browser, probably you can make a custom onmousemove, doing some infinite interval
    so its less efficient but more performative, also you could try to divide de screen in 4 sections and
    define on wich section of the screen each event should be, so instead of checking all of the posible
    combinations you only see the ones on that cuadrant
    But im too lazy to test all of that,
    so im putting some <button> elements and making them invisible so i can have a pointer change effect
    i know, really stupid and confusing, but the feeling of the page is everything in this scenario
*/
function buildOverlayButtons(){
    let overlay = document.getElementById("canvasOverlay");
    let tempButton, currValue, currentPos,style;
    let eventKeys = events.keys();
    let eventParams ;

    if(overlay.hasChildNodes() === true){        
        overlay.innerHTML = "";
    }

    for(let i = 0; i < events.size ; i++){
        currValue = eventKeys.next().value;
        currentPos = indexToPx(currValue,mapW);
        eventParams = events.get(currValue);
        style = "left:"+(currentPos[0]*tileW) * scale +"px";
        style += ";top:"+(currentPos[1]*tileH) * scale+"px";
        
        // check if the event has a custom pointer or none at all
        //if( eventParams[ Object.keys( eventParams ) ].args.pointer != undefined ){
        //    console.log("test");
        //}
        tempButton = document.createElement('button');        
        tempButton.className = "canvasOverlayBtn";
        tempButton.id = "overlayBtn"+currValue;
        tempButton.style = style;

        tempButton.setAttribute('onclick', 'getClickContext(event);');
        


        overlay.appendChild (tempButton);
    }
}
function displayEventOverlay(color){
    let elements = document.getElementsByClassName("canvasOverlayBtn");
    let customColor = "#14dce647";
    if(color != undefined){
        customColor = color;
    }
    for(let i = 0 ; i < elements.length ; i++){
        
        elements[i].style.backgroundColor = customColor;
    }
    
}
function hideEventOverlay(){
    let elements = document.getElementsByClassName("canvasOverlayBtn");
        for(let i = 0 ; i < elements.length ; i++){
        
        elements[i].style.backgroundColor = "transparent";
    }
}
function closeMenuStartGame(){
    document.getElementById("configContainer").style.display = "none";
    document.getElementById("mainContainer").style.display = "block";
}
function helpSectionSwap(newBlockId,section){
    if(newBlockId === undefined ){
        console.log("new block id is undefined");
        
        return;
    }
    
    let oldVisible = document.getElementById(section).getElementsByClassName("block");
    let newVisible = document.getElementById(newBlockId);

    
    oldVisible[0].classList.add("none");
    oldVisible[0].classList.remove("block");
    
    
    newVisible.classList.remove("none");
    newVisible.classList.add("block");
}
function newProjectSwap(newBlockId,section){
    if(newBlockId === undefined){
        console.log("new block id is undefined");
        return;
    }
    let tempSection = document.getElementById(section);
    let tempNewBlock = document.getElementById(newBlockId);
    
    tempNewBlock.classList.remove("block");
    tempNewBlock.classList.add("none");

    tempSection.classList.remove("none");
    tempSection.classList.add("block");
    
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
function setupProjectFull(file){
    console.log(file)
    let projDone,tileDone;
    let fileRead = new FileReader();
    let tileTypeRead = new FileReader();
    let gotData;
    let tileTypeData;

    async function imgres(){
        let a = await readFileImg(file[1][0])
        if(projDone === true && tileSetURL != undefined && tileDone === true ){
            
            buildProyect();
        }
    }
    imgres();

    fileRead.readAsText(file[0][0]);
    fileRead.onload = function() {
        gotData = fileRead.result;
        gotData = JSON.parse(gotData);
        
        tileW = gotData.settings.tileW; 
        tileH = gotData.settings.tileH;
        scale = gotData.settings.scale;
        mapW = gotData.settings.mapW;
        mapH = gotData.settings.mapH;
        
        zLevels = gotData.settings.zLevels;
        gameMap = gotData.map;

        EventList = gotData.events;

        tempLevels = gotData.zContent;
        projDone = true;
        if(projDone === true && tileSetURL != undefined && tileDone === true ){
            
            buildProyect();
        }
    }
    fileRead.onerror = function() {
        alert(fileRead.error);
        return;
    };

    tileTypeRead.readAsText(file[2][0]);
    tileTypeRead.onload = function() {
        tileTypeData = tileTypeRead.result;
        tileTypeData = JSON.parse(tileTypeData);

        tileTypes = tileTypeData;
        tileDone = true;
        if(projDone === true && tileSetURL != undefined && tileDone === true ){
            
            buildProyect();
        }
    }
    tileTypeRead.onerror = function() {
        alert(tileTypeRead.error);
        return;
    };
    
    
}
function readFileImg(file){
    console.log("readimg: ",file);
    let imageRead = new FileReader();
    return new Promise(resolve => {
    imageRead.readAsDataURL(file);
    imageRead.onload = function (){
        tileSetURL = imageRead.result;
        
        resolve (true);
    };
    imageRead.onerror = function() {
        alert(imageRead.error);

        resolve (false);
    };
    });
}

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
            tileTypes[toIndex(x,y,ammounTileW)] =  { name:"name "+toIndex(x,y,ammounTileW) , floor:floorType.path, 
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

function createEmptyProject(mapw,maph,tilesh,tilesw){
    mapW = mapw;
    mapH = maph;
    tilesH = tilesh;
    tilesW = tilesw;

    gameCanvas = document.getElementById("game");
    ctx = gameCanvas.getContext("2d");
}

function createNewProject(tilew,tileh,mapw,maph,zindex,scaleLocal,img){
    console.log("recieved data: ",tilew,tileh,mapw,maph,zindex,scale);
    if(scaleLocal === undefined){
        scale = 1;
        console.log("scale not set");
    }else{
        scale = scaleLocal;
    }
    tileW = tilew;
    tileH = tileh;
    mapW = mapw;
    mapH = maph;
    zLevels = zindex;

    gameMap = generateGameMap(mapW,mapH);
    
    async function imgres(){
        let a = await readFileImg(img[0])
        if(a === true){
            buildProyect();
        }else{
            console.log("error img couldnt be loaded");
        }
    }
    imgres();
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
function createEvent(eventName,eventTile,eventType,event,isModify,pointer){
    let tempEvent = {};
    let tempParams = [];    
    if( typeof(isModify) === "number"){
        //is modify is usually false, when changed turns into a number, that being, the tile where this event previously was
        //then removes it so there is no duplicated events on different tiles
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
    buildOverlayButtons();
}
function addEvent(tileCoords,event){    
    events.set(tileCoords,event);
    setTimeout(setCurrentEventsOnHtml,100)
    
}
function generateEventsFromVar(){
    if([Object.keys(EventList)][0].length === 0){
        return;
    }
    for(let i = 0 ; i < EventList["goToPage"].length ; i++){
        let obj = {};
        obj = { [Object.keys(EventList)] : EventList["goToPage"][i] };
        addEvent(EventList["goToPage"][i].pos, obj);
    }
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

function changeGameMap(newMap){
    let temp;
    if(newMap != undefined){
        temp = newMap
    }else{
        temp = gameMap;
    }
    console.log(temp);
    gameMapData = temp.slice(0);
}
function setNewLayers(newLevels){
    let temp;
    if(newLevels != undefined){
        temp = newLevels;
    }else{
        temp = tempLevels;
    }
    zContents = jsonToMap(temp,1);
}

function changeMap(newMapPath,transition){
    //this is async, make the set functions wait for fetch
    if(transition != undefined){
        console.log("transition ",transition," was called. . .");
    }
    fetchNewMap(newMapPath);
}
function toggleTileNum(){
    showTileNum = !showTileNum;
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

function isColliding(myElement,otherElement){
    let originX = myElement.x;
    let originY = myElement.y;
}
