-clipping out of x bounds on first piece?? - fixed (since there were no occupied squares, the bounding script wouldnt iterate through anything)
-collisions with rotations not working properly (mostly on I piece) - kinda fixed? basically make sure there's at least on piece on y=0 level or else it breaks - modulate the pos variable instead of piecePos
-I pieces just don't like to work... row counter just breaks for some reason, especially if its in the first 3 pieces? besides that it seems ok - fixed

TODO
-dynamic speed
-scoring/pps
-gameover?