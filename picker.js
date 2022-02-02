var tileset = null;
tileset = new Image();


//size of map on tiles also take on count the scale of the map
pickerMapW = 8, pickerMapH = 8,pickerMapTotal=0;

initTile = 0, endRow = 0;
endTile = 0, initTileTotalW = 0;

ammountOfTiles = 0;

blockPickerMap = [];

function setPickerParams(){
    
    tileset.src = tileSetURL;
    pickerCanvas = document.getElementById("blockPick");
    pctx = pickerCanvas.getContext("2d");
    let canvasSize = setCanvasSize(pickerMapW,pickerMapH,tileW,tileH,scale);

    pickerCanvas.width = canvasSize[0];
    pickerCanvas.height = canvasSize[1];
    picker();
}
function picker(){
    ammountOfTiles = Object.keys(tileTypes).length - 1;
    pickerMapTotal = Math.ceil(ammountOfTiles / pickerMapW);
    endTile = (pickerMapW * pickerMapH) ;
    createTiles();
    //blockPick
    
    pctx.scale(scale,scale);
    pctx.imageSmoothingEnabled = false;
    
    var tile;
    drawPicker();
}

function drawPicker(){
    pctx.clearRect(0,0, (pickerMapW * tileW) * scale, (pickerMapW * tileH) * scale);
    
    for(let y = 0; y < pickerMapH;y++){
        for(let x = 0; x < pickerMapW;x++){            
            
            tile = tileTypes[(blockPickerMap[toIndex(x,y,pickerMapW)]) + initTileTotalW];
            
            if(tile === undefined || tile === null){
                //if there is no block just leave a blank space
                tile = tileTypes[0];
                console.log("null: ",tile);
            }
            
            pctx.drawImage(tileset,
                tile.sprite[0].x, tile.sprite[0].y, tile.sprite[0].w, tile.sprite[0].h,
                (x*tileW),  (y*tileH),
                tileW, tileH);
            
        }
    }
}

function moveTiles(){
    
}

function createTiles(){
    for(i = 0; i < ammountOfTiles; i++){
        blockPickerMap[i] = i;
    }
}