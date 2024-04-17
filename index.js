const canvasWidth = 450;
const canvasHeight = 600;
const squareHeight = 30;

const height = canvasHeight/squareHeight;
const width = canvasWidth/squareHeight;

function draw(pieces, queue) {
    const canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        const ctx = canvas.getContext("2d");

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
}

var game=true;
var speed=100; //inverse scale - lower number = faster speed
//piece order: T, J, Z, S, I, L, O
var pieceList=[[[0,-1], [1,-1], [1,0], [2,-1]], [[0,0], [1,0], [1,-1], [1,-2]], [[0,-1], [1,-1], [1,0], [2,0]], [[0,0], [1,0], [1,-1], [2,-1]], [[0,0], [0,-1], [0,-2], [0,-3]], [[0,0], [1,0], [0,-1], [0,-2]], [[0,0], [1,0], [0,-1], [1,-1]]];  //0,0 at the bottom left corner of the object

var firstInv;

var secondInv;

var thirdInv;

var colors=["#b642f5", "#4542f5", "#45cc33", "#cf2e2b", "#32ede4", "#e38a1e", "#f5e342"]

var piece = new Piece([2,2], pieceList[0], colors[0], 0);
var pieces=[piece];

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
    return l.filter((value, index) => l.indexOf(value) === index); //actually implement this properly?
}

function freeX(piece){ //checks if the piece is free to move in the x direction
    var p=piece.piecePos;
    var pos=piece.pos;
    console.log(pos)
    var l=getOccupiedSquares();
    var freeR=true;//free to move right
    var freeL=true;//free to move left
    for(i=0;i<p.length;i++){
        for(j=0;j<l.length;j++){
            if((p[i][1]+pos[1])==l[j][1] && (p[i][0]+pos[0]+1)==l[j][0]){
                freeR=false;
            }
            if((p[i][1]+pos[1])==l[j][1] && (p[i][0]+pos[0]-1)==l[j][0]){
                freeL=false;
            }
        }
    }
    return [freeR, freeL];
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
                pieces.unshift(queue.pop(0));
                queue.push(getRandomPiece());
                free=true;
            }
        } else{
            pieces.unshift(queue.pop(0));
            queue.push(getRandomPiece());
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
    if(event.key=="ArrowLeft"){ pieces[0].pos[0]>0 && freeX(pieces[0])[1] ? (pieces[0].pos = [pieces[0].pos[0]-1, pieces[0].pos[1]]) : pieces[0].pos }//turn left
    if(event.key=="ArrowRight"){ pieces[0].pos[0]<(width-2) && freeX(pieces[0])[0] ? (pieces[0].pos = [pieces[0].pos[0]+1, pieces[0].pos[1]]) : pieces[0].pos }//turn right
    if(event.key=="ArrowDown"){ direction=1; }//turn down
});


// var test = new Piece([2,2], pieceList[0], "#F06292");
// test.pos = [0,0];
// test.pos = [4,4];

window.requestAnimationFrame(loop)