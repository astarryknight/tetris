const canvasWidth = 450;
const canvasHeight = 600;
const squareHeight = 30;

const height = canvasHeight/squareHeight;
const width = canvasWidth/squareHeight;

function draw(pieces, queue) {
    const canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);//clear canvas

        //initial board render:
        var style=0;
        for(c=0;c<(width);c++){
            for(r=0;r<(height);r++){
                if(style%2==0){
                    ctx.fillStyle = "#242424";
                } else{
                    ctx.fillStyle = "#4a4949";
                }
                ctx.fillRect((c*squareHeight), (r*squareHeight), squareHeight, squareHeight);
                style++;
            }
            style++;
        }

        //draw pieces
        for(i=0;i<pieces.length;i++){
            ctx.fillStyle=pieces[i].color;
            var p = pieces[i].piecePos;
            var x = pieces[i].pos[0];
            var y = pieces[i].pos[1];
            for(j=0;j<p.length;j++){
                ctx.fillRect((p[j][0]+x)*squareHeight,(p[j][1]+y)*squareHeight, squareHeight, squareHeight);
            }
        }
        //draw queue
        for(i=0;i<queue.length;i++){
            ctx.fillStyle=queue[i].color;
            var xShift = width+1; //how far off the main game section the blocks will appear
            var yShift = 3; //initial y offset
            var p = queue[i].piecePos;
            for(j=0;j<p.length;j++){
                ctx.fillRect((p[j][0]+xShift)*squareHeight,(p[j][1]+yShift+i*5)*squareHeight, squareHeight, squareHeight)
            }
        }
    }
}

/* look at this later https://stackoverflow.com/questions/54562790/cannot-set-property-which-only-has-getter-javascript-es6*/
class Piece {
    constructor(pos, piecePos, color, id) {
      this.pos_ = pos;
      this.piecePos_ = piecePos;
      this.color_ = color;
      this.id_ = id
    }
    get pos(){
        return this.pos_;
    }
    get piecePos(){
        return this.piecePos_;
    }
    get color(){
        return this.color_;
    }
    get id(){
        return this.id_;
    }
    set pos(pos){
        this.pos_=pos;
    }
    set piecePos(piecePos){
        this.piecePos_ = piecePos;
    }
}

var game=true;
var speed=200; //inverse scale - lower number = faster speed

//piece order: T, J, Z, S, I, L, O
var pieceList=[[[0,-1], [1,-1], [1,0], [2,-1]], [[0,0], [1,0], [1,-1], [1,-2]], [[0,-1], [1,-1], [1,0], [2,0]], [[0,0], [1,0], [1,-1], [2,-1]], [[0,0], [0,-1], [0,-2], [0,-3]], [[0,0], [1,0], [0,-1], [0,-2]], [[0,0], [1,0], [0,-1], [1,-1]]];  //0,0 at the bottom left corner of the object

//in clockwise order from base stance
var firstInv=[[[0,-1], [1,0], [1,-1], [1,-2]], [[0,-1], [0,0], [1,0], [2,0]], [[0,0], [0,-1], [1,-1], [1,-2]], [[0,-2], [0,-1], [1,-1], [1,0]], [[0,0], [1,0], [2,0], [3,0]], [[0,0], [0,-1], [1,-1], [2,-1]], [[0,0], [1,0], [0,-1], [1,-1]]];  //0,0 at the bottom left corner of the object;

var secondInv=[[[0,0], [1,0], [1,-1], [2,0]], [[0,0], [0,-1], [0,-2], [1,-2]], [[0,-1], [1,-1], [1,0], [2,0]], [[0,0], [1,0], [1,-1], [2,-1]], [[0,0], [0,-1], [0,-2], [0,-3]], [[0,-2], [1,-2], [1,-1], [1,0]], [[0,0], [1,0], [0,-1], [1,-1]]];  //0,0 at the bottom left corner of the object;

var thirdInv=[[[0,0], [0,-1], [0,-2], [1,-1]], [[0,-1], [1,-1], [2,-1], [2,0]], [[1,0], [1,-1], [2,-1], [2,-2]], [[1,-2], [1,-1], [2,-1], [2,0]], [[0,0], [1,0], [2,0], [3,0]], [[0,0], [1,0], [2,0], [2,-1]], [[0,0], [1,0], [0,-1], [1,-1]]];  //0,0 at the bottom left corner of the object;

var colors=["#b642f5", "#4542f5", "#45cc33", "#cf2e2b", "#32ede4", "#e38a1e", "#f5e342"]


var piece = new Piece([6,2], pieceList[4], colors[4], 4);
var pieces=[piece];
var rot=0;

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getRandomPiece(){
    var n=getRandomInt(6);
    if(pieces.length>1&&n==pieces[1].id){
        n++;
    }
    return new Piece([6,2], pieceList[n], colors[n], n);
}

var i = new Piece([6,2], pieceList[4], colors[4], 4);
var queue=[getRandomPiece(), getRandomPiece(), getRandomPiece(), getRandomPiece()];
var free=true; //the piece is free from other pieces (not contacting)


window.addEventListener("load", draw(pieces, queue));
var start=Date.now();

function getOccupiedSquares(){
    var l=[];
    var piece;
    var p;
    var pos;
    for(i=1;i<pieces.length;i++){
        piece = pieces[i];
        p = piece.piecePos;
        pos = piece.pos;
        for(j=0;j<p.length;j++){
            l.push([p[j][0]+pos[0], p[j][1]+pos[1]]);
        }
    }
    /*https://builtin.com/software-engineering-perspectives/remove-duplicates-from-array-javascript*/
    return l.filter((value, index) => l.indexOf(value) === index); //actually implement this properly? - not needed since pieces cant really clip into others (or else thats a bigger problem)
}

function freeX(piece){ //checks if the piece is free to move in the x direction
    var p=piece.piecePos;
    var pos=piece.pos;
    var l=getOccupiedSquares();
    var freeR=true;//free to move right
    var freeL=true;//free to move left
    for(i=0;i<p.length;i++){
        for(j=0;j<l.length;j++){
            if(((p[i][1]+pos[1])==l[j][1] && (p[i][0]+pos[0]+1)==l[j][0]) || (p[i][0]+pos[0]+1)>(width-1)){
                freeR=false;
            }
            if((p[i][1]+pos[1])==l[j][1] && (p[i][0]+pos[0]-1)==l[j][0] || (p[i][0]+pos[0]-1)<0){
                freeL=false;
            }
        }
    }
    return [freeR, freeL];
}

function getFullRows(){
    var l=getOccupiedSquares();
    var totals=[];
    var rows=[];
    for(i=0;i<height;i++){totals.push(0);}
    for(j=0;j<l.length;j++){
        totals[l[j][1]]++
    }
    for(k=0;k<totals.length;k++){
        if(totals[k]==width){
            rows.push(k);
        }
    }
    console.log(totals, rows);
    return rows;
}

//main game loop
function loop(){
    var now = Date.now();
    if((now-start)>=speed){
        if(pieces[0].pos[1]<height-1){ //if it is above the floor
            var p=pieces[0].piecePos;
            var pos=pieces[0].pos;
            var l=getOccupiedSquares();
            for(i=0;i<p.length;i++){
                for(j=0;j<l.length;j++){
                    if((p[i][0]+pos[0])==l[j][0] && (p[i][1]+pos[1]+1)==l[j][1]){
                        free=false;
                    }
                }
            }
            if(free){ //if it is above all other pieces
                pieces[0].pos = [pieces[0].pos[0], pieces[0].pos[1]+1];
            } else{
                pieces.unshift(queue.splice(0, 1)[0]);
                queue.push(getRandomPiece());
                rot=0;
                free=true;
            }
        } else{
            pieces.unshift(queue.splice(0, 1)[0]);
            queue.push(getRandomPiece());
            rot=0;
        }

        var r=getFullRows();
        if(r.length>0){
            for(i=0;i<r.length;i++){
                for(j=0;j<pieces.length;j++){
                    var p=pieces[j].piecePos;
                    var pos=pieces[j].pos;
                    for(k=0;k<p.length;p++){
                        if((p[k][1]+pos[1])==r[i]){
                            pieces[j].piecePos = pieces[j].piecePos.splice(k,1);
                        }
                    }
                }
            }
        }

        //console.log(getOccupiedSquares());
        draw(pieces, queue);
        start=Date.now();
    }
    window.requestAnimationFrame(loop);
}

//handling keypresses
addEventListener("keydown", (event) => {
    if (event.isComposing) {
        return;
    }
    if(event.key=="ArrowLeft"){ freeX(pieces[0])[1] ? (pieces[0].pos = [pieces[0].pos[0]-1, pieces[0].pos[1]]) : pieces[0].pos }//turn left
    if(event.key=="ArrowRight"){ freeX(pieces[0])[0] ? (pieces[0].pos = [pieces[0].pos[0]+1, pieces[0].pos[1]]) : pieces[0].pos }//turn right
    if(event.key=="ArrowUp"){ 
        rot++;
        if(rot%4==0){
            pieces[0].piecePos = pieceList[pieces[0].id];        
        } else if(rot%4==1){
            pieces[0].piecePos = firstInv[pieces[0].id];
        } else if (rot%4==2){
            pieces[0].piecePos = secondInv[pieces[0].id];
        } else if (rot%4==3){
            pieces[0].piecePos = thirdInv[pieces[0].id];
        }
    }//rotate piece clockwise
    if(event.key=="ArrowDown"){ 
        getFullRows();
    }//rotate piece clockwise
});


// var test = new Piece([2,2], pieceList[0], "#F06292");
// test.pos = [0,0];
// test.pos = [4,4];

window.requestAnimationFrame(loop)