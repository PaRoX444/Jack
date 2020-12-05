module.exports = class {
    constructor(id, size, playerId){
        this.id = id;
        this.size = size;
        this.x = Math.random() * 100;
        this.y = Math.random() * 100;
        this.mx = 1;
        this.my = 1;
        this.playerId = playerId;
    }
    update(){
        this.x += Math.random(-5,5);
        this.x -= Math.random(-5,5);
        this.y += Math.random(-5,5);
        this.y -= Math.random(-5,5);
    }
}