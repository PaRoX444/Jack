let cvs,
ctx,
width,
height,
cellsById = {},
cells = [],
isPlaying = true;

class Cell {
    constructor(id, x, y, s) {
        this.id = id;
        this.x = x;
        this.y =y;
        this.playerId = ''
        this.size = s;
        this.color = '';
    }
}

function init() {
    width = window.innerWidth;
    height = window.innerHeight;
    cvs = document.getElementById('canvas');
    cvs.width = width;
    cvs.height = height;
    ctx = cvs.getContext('2d');

    let loop = () => {
        draw();
        requestAnimationFrame(loop);
    }
    loop();
    WS_CONNECT();
}

function draw(){
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0, width, height);

    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        ctx.beginPath();
        ctx.fillStyle = cell.color;
        ctx.arc(cell.x, cell.y, cell.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }
}

init();

function WS_CONNECT(){
 window.ws = new WebSocket(location.origin.replace(/http/, 'ws'));

ws.binaryType = 'arraybuffer';

ws.onopen = () => {
    console.log('CONNECTED');
    let msg = prepare(1)
    msg.setUint8(0, 1);
    wsSend(msg);
}

ws.onmessage = data => {
    let msg = new DataView(data.data);

    let opcode = msg.getUint8(0);

    switch(opcode){
        case 0: 
        var count = msg.getUint8(1);
        var offset = 2
        for (let i = 0; i < count; i++) {
            var id = msg.getUint16(offset);
            cellsById[id] = {color : randomColor()};
            offset += 2;
        }
        break;

        case 69 :
            var id = msg.getUint16(1);
            delete cellsById[id];
            for (let i = 0; i < cells.length; i++) {
                const cell = cells[i];
                if(cell.playerId == id){
                    cells.splice(i, 1);
                }
            }
            break;
            
            case 100:
                var id = msg.getUint16(1);
                cellsById[id] = {color : randomColor()};
                break;

                case 45:
                    cells = [];
                    var count = msg.getUint8(1);
                    var offset = 2;
                    for (let i = 0; i < count; i++) {
                        var id = msg.getUint16(offset);
                        offset += 2;
                        var playerId = msg.getUint16(offset);
                        offset += 2;
                        var x = msg.getInt16(offset);
                        offset += 2;
                        var y = msg.getInt16(offset);
                        offset += 2;
                        var size = msg.getUint16(offset);
                        offset += 2;
                        let cell = new Cell(id, x, y, size);
                        cell.playerId = playerId;
                        if(cellsById[playerId]){
                            cell.color = cellsById[playerId].color
                        }else{
                            cellsById[playerId] = {color : randomColor()}
                            cell.color = cellsById[playerId].color
                        }
                        cells.push(cell);
                      //      console.log(playerId)
                    }
    }
}
function wsSend(data){
    ws.send(data);
}
}

function prepare(length){
    let ab = new ArrayBuffer(length);
    let dv = new DataView(ab);
    return(dv);
}

function randomColor(){
    let colors = ['orange', 'blue', 'red', 'green', 'yellow', 'brown', 'pink'];
    return colors[Math.random() * colors.length | 0];
}




window.onkeypress = e => {
    if(isPlaying){
        if(e.key == ' '){
            let arr = new Uint8Array([32]);
            ws.send(arr);
        }
    }
}