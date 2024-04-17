const canvasWidth = 450;
const canvasHeight = 600;
const squareHeight = 30;

const height = canvasHeight/squareHeight;
const width = canvasWidth/squareHeight;

function draw(pieces) {
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
    }
}

/* look at this later https://stackoverflow.com/questions/54562790/cannot-set-property-which-only-has-getter-javascript-es6*/
class Piece {
    constructor(pos, piecePos, color) {
      this.pos_ = pos;
      this.piecePos_ = piecePos;
      this.color_ = color;
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
    set pos(pos){
        this.pos_=pos;
    }
}

var game=true;
var speed=100; //inverse scale - lower number = faster speed
var pieceList=[[[0,0], [1,0], [0,-1], [1,-1]]];  //0,0 at the bottom left corner of the object
var piece = new Piece([2,2], pieceList[0], "#F06292");
var pieces=[piece];
var free=true; //the piece is free from other pieces (not contacting)


window.addEventListener("load", draw(pieces));
var start=Date.now();

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

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

//main game loop
function loop(){
    var now = Date.now();
    if((now-start)>=speed){
        if(pieces[0].pos[1]<height-1){ //if it is above the floor
            var p=pieces[0].piecePos;
            var pos=pieces[0].pos;
            var l=getOccupiedSquares();
            for(i=0;i<p.length;i++){
                if([p[i][0]+pos[0], p[i][1]+pos[1]])
                for(j=0;j<l.length;j++){
                    if((p[i][0]+pos[0])==l[j][0] && (p[i][1]+pos[1]+1)==l[j][1]){
                        free=false;
                    }
                }
            }
            if(free){ //if it is above all other pieces
                pieces[0].pos = [pieces[0].pos[0], pieces[0].pos[1]+1];
            } else{
                pieces.unshift(new Piece([6,2], pieceList[0], "#F06292"));
                free=true;
            }
        } else{
            pieces.unshift(new Piece([6,2], pieceList[0], "#F06292"));
        }

        //console.log(getOccupiedSquares());
        draw(pieces);
        start=Date.now();
    }
    window.requestAnimationFrame(loop);
}

//handling keypresses
addEventListener("keydown", (event) => {
    if (event.isComposing) {
        return;
    }
    if(event.key=="ArrowLeft"){ pieces[0].pos[0]>0 ? (pieces[0].pos = [pieces[0].pos[0]-1, pieces[0].pos[1]]) : pieces[0].pos }//turn left
    if(event.key=="ArrowRight"){ pieces[0].pos[0]<(width-2) ? (pieces[0].pos = [pieces[0].pos[0]+1, pieces[0].pos[1]]) : pieces[0].pos }//turn right
    if(event.key=="ArrowDown"){ direction=1; }//turn down
});


// var test = new Piece([2,2], pieceList[0], "#F06292");
// test.pos = [0,0];
// test.pos = [4,4];

window.requestAnimationFrame(loop)