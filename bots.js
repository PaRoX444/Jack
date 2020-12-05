const WS = require('ws');

let bots = [];

class Bot {
    constructor(id){
        this.id = id;
        this.ws = null;
    }
    connect(){
        this.ws = new WS('ws://localhost:4200');
        this.ws.onopen = this.open.bind(this);
        this.ws.onclose = this.close.bind(this);
    }
    open(){
        console.log(`[${this.id}] : CONNECTED`);
        let ab = new ArrayBuffer(1);
        let dv = new DataView(ab);
        dv.setUint8(0,1);
        this.ws.send(dv);
    }
    close(){
        console.log(`[${this.id}] : DISCONNECTED`)
    }
}

for (let i = 0; i < 10; i++) {
    let bot = new Bot(i);
    bots.push(bot);
    bot.connect();
}