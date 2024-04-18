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

        //calculate shadow
        var x=pieces[0].pos[0];
        var y=pieces[0].pos[1];
        shadow = new Piece([x,y], pieces[0].piecePos, "#B4B3B3", pieces[0].id);
        free=freeY(shadow)
        while(free&&shadow.pos[1]<(height-1)){
            shadow.pos = [shadow.pos[0], shadow.pos[1]+1];
            free=freeY(shadow);
        }
        //draw shadow
        ctx.fillStyle=shadow.color;
        var p = shadow.piecePos;
        var x = shadow.pos[0];
        var y = shadow.pos[1];
        for(j=0;j<p.length;j++){
            ctx.fillRect((p[j][0]+x)*squareHeight,(p[j][1]+y)*squareHeight, squareHeight, squareHeight);
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

        //draw held piece
        var xOff=width+6;
        var yOff=5;
        if(!isEmpty(heldPiece)){ //does it exist? - makes sure it doesn't try to draw nothing
            ctx.fillStyle=heldPiece.color;
            var p = heldPiece.piecePos;
            var x = heldPiece.pos[0];
            var y = heldPiece.pos[1];
            for(j=0;j<p.length;j++){
                ctx.fillRect((p[j][0]+xOff)*squareHeight,(p[j][1]+yOff)*squareHeight, squareHeight, squareHeight);
            }
        }
        //text
        ctx.fillStyle="#000000";
        ctx.font = "20px arial";
        ctx.fillText("Held Piece:", (width+6)*squareHeight, 50);
    }
}

/*https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object*/
function isEmpty(obj) {
    for (const prop in obj) {
      if (Object.hasOwn(obj, prop)) {
        return false;
      }
    }
  
    return true;
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
var speed=400; //inverse scale - lower number = faster speed

//piece order: T, J, Z, S, I, L, O
var pieceList=[[[0,-1], [1,-1], [1,0], [2,-1]], [[0,0], [1,0], [1,-1], [1,-2]], [[0,-1], [1,-1], [1,0], [2,0]], [[0,0], [1,0], [1,-1], [2,-1]], [[0,0], [0,-1], [0,-2], [0,-3]], [[0,0], [1,0], [0,-1], [0,-2]], [[0,0], [1,0], [0,-1], [1,-1]]];  //0,0 at the bottom left corner of the object

//in clockwise order from base stance
var firstInv=[[[0,-1], [1,0], [1,-1], [1,-2]], [[0,-1], [0,0], [1,0], [2,0]], [[0,0], [0,-1], [1,-1], [1,-2]], [[0,-2], [0,-1], [1,-1], [1,0]], [[0,0], [1,0], [2,0], [3,0]], [[0,0], [0,-1], [1,-1], [2,-1]], [[0,0], [1,0], [0,-1], [1,-1]]];  //0,0 at the bottom left corner of the object;

var secondInv=[[[0,0], [1,0], [1,-1], [2,0]], [[0,0], [0,-1], [0,-2], [1,-2]], [[0,-1], [1,-1], [1,0], [2,0]], [[0,0], [1,0], [1,-1], [2,-1]], [[0,0], [0,-1], [0,-2], [0,-3]], [[0,-2], [1,-2], [1,-1], [1,0]], [[0,0], [1,0], [0,-1], [1,-1]]];  //0,0 at the bottom left corner of the object;

var thirdInv=[[[0,0], [0,-1], [0,-2], [1,-1]], [[0,-1], [1,-1], [2,-1], [2,0]], [[1,0], [1,-1], [2,-1], [2,-2]], [[1,-2], [1,-1], [2,-1], [2,0]], [[0,0], [1,0], [2,0], [3,0]], [[0,0], [1,0], [2,0], [2,-1]], [[0,0], [1,0], [0,-1], [1,-1]]];  //0,0 at the bottom left corner of the object;

var colors=["#b642f5", "#4542f5", "#45cc33", "#cf2e2b", "#32ede4", "#e38a1e", "#f5e342"]


var pieces=[];
var rot=0;
var heldPiece;
var calc=false;

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

pieces.push(getRandomPiece());
// var i = new Piece([6,2], pieceList[4], colors[4], 4);
var queue=[getRandomPiece(), getRandomPiece(), getRandomPiece(), getRandomPiece()];
var free=true; //the piece is free from other pieces (not contacting)
var hold=true; //can you hold a new piece


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

function freeY(piece){
    free=true;
    var p=piece.piecePos;
    var pos=piece.pos;
    var l=getOccupiedSquares();
    for(i=0;i<p.length;i++){
        for(j=0;j<l.length;j++){
            if((p[i][0]+pos[0])==l[j][0] && (p[i][1]+pos[1]+1)==l[j][1]){
                free=false;
            }
        }
    }
    return free;
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
    return rows;
}

function clearRows(r){
    for(i=0;i<r.length;i++){ //iterating through each full row
        for(j=1;j<pieces.length;j++){ //iterating through each piece in the pieces array
            var p=pieces[j].piecePos; //array for piece definition positions
            var pos=pieces[j].pos; //array for position of each piece
            var test=[];
            var moveDown=[];
            //console.log(p.length);
            for(k=0;k<p.length;k++){ //iterating through each square in a piece
                if(!((p[k][1]+pos[1])==r[i])){ //if the square is NOT in the same horizontal row as the full row
                    if(p[k][1]+pos[1]<r[i]){
                        test.push([p[k][0], p[k][1]+1]);
                    } else{
                        test.push(p[k]);
                    }
                } 
            }
            pieces[j].piecePos=test;//trying this out maybe?
            // console.log(pieces[j].piecePos);

            //LOOK AT PEIOCE ROTATUOIBNS DUIFHSD IFUHS DIFUSHD IFUHS DIUFHSD UIFHDFS ROTATION
        }
    }
    //debugger;
}

//main game loop
function loop(){
    var now = Date.now();
    if((now-start)>=speed){
        calc=true;
        if(pieces[0].pos[1]<height-1){ //if it is above the floor
            free=freeY(pieces[0]);
            if(free){ //if it is above all other pieces
                pieces[0].pos = [pieces[0].pos[0], pieces[0].pos[1]+1];
            } else{ //fix this PLEAZESRSEROSEIJFOSEIJFOISEJFOSIEJFOISEJFIO
                pieces.unshift(queue.splice(0, 1)[0]);
                queue.push(getRandomPiece());
                rot=0;
                free=true;
                speed=400;
                hold=true;
            }
        } else{
            pieces.unshift(queue.splice(0, 1)[0]);
            queue.push(getRandomPiece());
            rot=0;
            speed=400;
            hold=true;
        }

        var r=getFullRows();
        if(r.length>0){ //if number of full rows is > 1 (at least one row is full)
            clearRows(r);
        }

        //console.log(getOccupiedSquares());
        start=Date.now();
    }
    draw(pieces, queue);
    window.requestAnimationFrame(loop);
    calc=false;
}

//handling keypresses
addEventListener("keydown", (event) => {
    if (event.isComposing || calc) {
        return;
    }
    if(event.key=="ArrowLeft"){ 
        if(freeX(pieces[0])[1]){
            (pieces[0].pos = [pieces[0].pos[0]-1, pieces[0].pos[1]])
        } else{
            pieces[0].pos;
        }
     }//turn left
    if(event.key=="ArrowRight"){ 
        if(freeX(pieces[0])[0]){
            (pieces[0].pos = [pieces[0].pos[0]+1, pieces[0].pos[1]])
        } else{
            pieces[0].pos;
        }
     }//turn right
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
        speed=1;
    }//rotate piece clockwise
    if(event.key==" "){
        free=freeY(pieces[0])
        while(free&&pieces[0].pos[1]<(height-1)){
            pieces[0].pos = [pieces[0].pos[0], pieces[0].pos[1]+1];
            free=freeY(pieces[0]);
        }
        speed=1;
    }//quick drop
    if(event.key=="c"){
        if(hold){
            var p = pieces[0];
            //pieces[0]=heldPiece;
            if(isEmpty(heldPiece)){
                pieces.splice(0,1);
                pieces.unshift(queue.splice(0, 1)[0]);
                queue.push(getRandomPiece());
            } else{
                pieces[0]=heldPiece;
            }
            heldPiece=p;
            hold=false;
        }
    }//hold piece
});

addEventListener("keyup", (event) => {
    if (event.isComposing || calc) {
        return;
    }
    if(event.key=="ArrowDown"){ 
        speed=400;
    }
});


// var test = new Piece([2,2], pieceList[0], "#F06292");
// test.pos = [0,0];
// test.pos = [4,4];

window.requestAnimationFrame(loop)