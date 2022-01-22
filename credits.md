https://www.youtube.com/watch?v=jabYMh9sI8Q

https://www.youtube.com/c/ScriptersWar/videos

https://www.youtube.com/watch?v=PziMfEwXY6o&list=PL9ZqDLjDY8PnEdPILwGwhi63r7eWot2TP&index=9

https://www.youtube.com/channel/UCHpHBzk4fz3oeQ31hmCreGg

https://www.w3schools.com/tags/ref_canvas.asp

/_
tileTypes = {
//empty / doesnt exist || d: stands for duration
"null" : {colour:"#999999", name:"none" , floor:floorType.path, sprite:[{x:0,y:0,w:32,h:32}] },
//brick wall
0 : {colour:"#685b48",name:"Stone brick wall" , floor:floorType.solid, sprite:[{x:320,y:128,w:32,h:32}] },
//grass path
1 : {colour:"#5aa457",name:"Grass path" , floor:floorType.path, sprite:[{x:864,y:96,w:32,h:32}] },
//water shallow
2 : {colour:"#678fd9",name:"Shallow water" , floor:floorType.water,
sprite:[{x:32,y:736,w:32,h:32,d:400},{x:64,y:736,w:32,h:32,d:450},
{x:96,y:736,w:32,h:32,d:350},{x:128,y:736,w:32,h:32,d:520},
{x:160,y:736,w:32,h:32,d:470},
]},
//water deep (cannot walk)
3 : {colour:"#678fd9",name:"Deep water" , floor:floorType.solid, sprite:[{x:1280,y:704,w:32,h:32}] },
//dirt
4 : {colour:"#678fd9",name:"Dirt path" , floor:floorType.path, sprite:[{x:608,y:96,w:32,h:32}] },
//lava
5 : {colour:"#678fd9",name:"Lava" , floor:floorType.lava,
sprite:[{x:1920,y:160,w:32,h:32,d:400}, {x:1952,y:160,w:32,h:32,d:300},
{x:1984,y:160,w:32,h:32,d:300}, {x:2016,y:160,w:32,h:32,d:400},
{x:1984,y:160,w:32,h:32,d:300},{x:1952,y:160,w:32,h:32,d:300},
]},
//stone and sand path
6 : {colour:"#678fd9",name:"Stone & sand path" , floor:floorType.path, sprite:[{x:1952,y:96,w:32,h:32}] },
//fire beacon doesnt work properly since the screen "doesnt get cleaned"
7 : {colour:"#678fd9",name:"Fire beacon",zIndex:1 , floor:floorType.solid,
sprite:[{x:1504,y:0,w:32,h:32,d:200},{x:1536,y:0,w:32,h:32,d:200},
{x:1568,y:0,w:32,h:32,d:200},{x:1600,y:0,w:32,h:32,d:200},
{x:1632,y:0,w:32,h:32,d:200},{x:1664,y:0,w:32,h:32,d:200},
{x:1696,y:0,w:32,h:32,d:200},{x:1728,y:0,w:32,h:32,d:200},
]},
};
_/
