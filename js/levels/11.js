var floorSprite = new Mario.Sprite('sprites/tiles.png', [0,0],[16,16],0);
var cloudSprite = new Mario.Sprite('sprites/tiles.png', [0,320],[48,32],0);
var hillSprites = [
  new Mario.Sprite('sprites/tiles.png', [128,128],[16,16],0),
  new Mario.Sprite('sprites/tiles.png', [144,128],[16,16],0),
  new Mario.Sprite('sprites/tiles.png', [160,128],[16,16],0),
  new Mario.Sprite('sprites/tiles.png', [128,144],[16,16],0),
  new Mario.Sprite('sprites/tiles.png', [144,144],[16,16],0),
  new Mario.Sprite('sprites/tiles.png', [160,144],[16,16],0)]
var statics = [];
var scenery = [];

for (var i = 0; i < 15; i++) {
  statics[i] = [];
  scenery[i] = [];
}

putFloor(0, 69);
putCloud(7, 3);
putBigHill(0,12);

function putFloor(start, end) {
  for (var i = start; i < end; i++) {
    statics[13][i] = new Mario.Floor([16*i,208], floorSprite);
    statics[14][i] = new Mario.Floor([16*i,224], floorSprite);
  }
}

function putCloud(x, y) {
  scenery[y][x] = new Mario.Prop([x*16, y*16], cloudSprite);
}

function putBigHill(x, y) {
  var px = x*16, py = y*16;
  scenery[y][x] = new Mario.Prop([px, py], hillSprites[0]);
  scenery[y][x+1] = new Mario.Prop([px+16, py], hillSprites[3]);
  scenery[y-1][x+1] = new Mario.Prop([px+16, py-16], hillSprites[0]);
  scenery[y][x+2] = new Mario.Prop([px+32, py], hillSprites[4]);
  scenery[y-1][x+2] = new Mario.Prop([px+32, py-16], hillSprites[3]);
  scenery[y-2][x+2] = new Mario.Prop([px+32, py-32], hillSprites[1]);
  scenery[y][x+3] = new Mario.Prop([px+48, py], hillSprites[5]);
  scenery[y-1][x+3] = new Mario.Prop([px+48, py-16], hillSprites[2]);
  scenery[y][x+4] = new Mario.Prop([px+64, py], hillSprites[2]);

}
