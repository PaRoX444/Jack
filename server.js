const express = require('express');
const app = express();
const WS = require('ws');
const Player = require('./player');
const Cell = require('./cell');
const {Rectangle, Point, Circle, QuadTree} = require('./quadtree');
var server = app.listen(process.env.PORT || 4200, () => {
    var host = server.address().address;
    var port = server.address().port;
})

let qt;

app.use(express.static('www'));

const wss = new WS.Server({server});

let cellsById = [];

let cells = [];

let food = [];



let players = new Map();

let worldX = 10000;
let worldY = 10000;

wss.on('connection', ws => {
    console.log(`[SERVER] : New Connection`);
    ws.binaryType = 'arraybuffer';
    let player = new Player(createId(), ws);
    players.set(player.id, player);
    console.log(player.id)

    let msg =prepare(cellsById.length * 4 + 2);
    msg.setUint8(0, 0);
    msg.setUint8(1, cellsById.length);
    let offset = 2;
    for (let i = 0; i < cellsById.length; i++) {
        const cells = cellsById[i];
        msg.setUint16(offset, cells);
    }

    player.ws.send(msg);

    player.ws.onclose = () => {
        console.log(`[${player.id}] : DISCONNECTED`);
        let msg = prepare(1 + 2);
        msg.setUint8(0, 69);
        let offset = 1;
        msg.setUint16(offset, player.id);
        players.forEach(e => {
            e.ws.send(msg);
        })
        for (let i = 0; i < cells.length; i++) {
            const element = cells[i];
            if(element.playerId == player.id){
                cells.splice(i, 1);
            }
        }
        for (let i = 0; i < cellsById.length; i++) {
            const element = cellsById[i];
            if(element == player.id){
                cellsById.splice(i, 1);
            }
        }
        players.delete(player.id);
    }

    ws.onmessage = data => {
        let msg = new DataView(data.data);

        let opcode = msg.getUint8(0);

        switch(opcode){

            case 1: 
            play(player);
            break;

            case 32:
                var id = player.id;
                let arr = [];
                for (let i = 0; i < cells.length; i++) {
                    const cell = cells[i];
                    if(cell.playerId == id){
                        arr.push(new Cell(createId(), cell.size/2, id));
                        cell.size /= 2;
                    }
                }
                cells = cells.concat(arr)
        }
    }
})

function createId(){
 let id = Math.round(Math.random()*65000);
 return id;
}

function play(player){
    cellsById.push(player.id);
    let cell = new Cell(createId(), 10, player.id);
    cells.push(cell);
    let msg = prepare(3);
    msg.setUint8(0, 100);
    let offset = 1;
    msg.setUint16(offset, player.id);
    players.forEach(e => {
        e.ws.send(msg);
    })
  //  console.log(player.id);
}



function prepare(length){
    let ab = new ArrayBuffer(length);
    let dv = new DataView(ab);
    return(dv);
}


function update(){
    let boundary = new Rectangle(0, 0, worldX, worldY);
     qt = new QuadTree(boundary, 10);
    for (let i = 0; i < cells.length; i++) {
        let cell = cells[i];
        cell.update();
    }
}
for (let i = 0; i < 100; i++){
    let f = new Cell(createId(), 10, 1);
    let point = new Point(f.x, f.y, f);
	food.push(f);
}
setInterval(update, 1000/60);

function broadcast(){
    //SENDING NODES
    let msg = prepare(2 + cells.length * 10);
    var offset = 2;
    msg.setUint8(0, 45);
    msg.setUint8(1, cells.length);
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        msg.setUint16(offset, cell.id);
        offset += 2;
        msg.setUint16(offset, cell.playerId);
   //     console.log(cells.playerId)
        offset += 2;
        msg.setInt16(offset, cell.x);
        offset += 2;
        msg.setInt16(offset, cell.y);
        offset += 2;
        msg.setUint16(offset, cell.size);
        offset += 2;
    }
    

players.forEach(e => {
    e.ws.send(msg);
})
}

setInterval(broadcast, 100);