var game = {
  blockSize: 30,
  ground: null,
  solids: null,
  physics: null,
  objects: [],
  levels: [
    [
      "                                  ",
      "                                  ",
      "                                  ",
      "        XXXXX                     ",
      "                                  ",
      "                    XXXX          ",
      "     O              X             ",
      "                XXXXX             ",
      " XXXXXXXXXX                       ",
      "             XXX                  "
    ]
  ]
};

function makeClasses() {
  game.solids = new Group();
  game.physics = new Group();
  game.ground = new Group();

  game.Block = function(x, y, w, h) {
    Sprite.call(this, x+w/2, y+h/2, w, h);
    this.depth = allSprites.maxDepth()+1;
    allSprites.add(this);
  };
  game.Block.prototype = Object.create(Sprite.prototype);
  game.Block.prototype.tick = function() {  };
  game.Block.prototype.interact = function() {  };
  game.Block.prototype.collideWith = function(target) {  };

  game.Ground = function(x, y, w, h) {
    game.Block.call(this, x, y, w, h);
    this.shapeColor = color(80, 180, 100);
    this.immovable = true;
    game.solids.add(this);
    game.ground.add(this);
  };
  game.Ground.prototype = Object.create(game.Block.prototype);
  game.Ground.prototype.tick = function() {
    game.Block.prototype.tick.call(this);
  };
  game.Ground.prototype.interact = function() {
    game.Block.prototype.interact.call(this);
  };
  game.Ground.prototype.collideWith = function(target) {
    game.Block.prototype.collideWith.call(this, target);
  };

  game.PhysicsObject = function(x, y, w, h) {
    game.Block.call(this, x, y, w, h);
    game.solids.add(this);
    game.physics.add(this);
    this.gravity = createVector(0, 1);
  };
  game.PhysicsObject.prototype = Object.create(game.Block.prototype);
  game.PhysicsObject.prototype.tick = function() {
    game.Block.prototype.tick.call(this);
    this.velocity.add(this.gravity);
  };
  game.PhysicsObject.prototype.interact = function() {
    game.Block.prototype.interact.call(this);
  };
  game.PhysicsObject.prototype.collideWith = function(target) {
    game.Block.prototype.collideWith.call(this, target);
    if (this.touching.bottom) {
      this.velocity.y = this.gravity.y;
    }
    if (this.touching.top) {
      this.velocity.y = 2;
    }
    if (this.touching.left && this.velocity.x < 0) {
      this.velocity.x = -this.velocity.x;
    }
    if (this.touching.right && this.velocity.x > 0) {
      this.velocity.x = -this.velocity.x;
    }
  };

  game.Player = function(x, y) {
    game.PhysicsObject.call(this, x, y, game.blockSize, game.blockSize);
    this.shapeColor = color(255, 0, 0);
    this.jump = createVector(0, -15);
  };
  game.Player.prototype = Object.create(game.PhysicsObject.prototype);
  game.Player.prototype.tick = function() {
    game.PhysicsObject.prototype.tick.call(this);
  };
  game.Player.prototype.interact = function() {
    game.PhysicsObject.prototype.interact.call(this);
    if (keyDown('RIGHT_ARROW')) {
      this.velocity.x = 5;
    } else if (keyDown('LEFT_ARROW')) {
      this.velocity.x = -5;
    } else {
      this.velocity.x = 0;
    }

    if (keyWentDown('UP_ARROW')) {
      if (this.touching.bottom) {
        this.velocity.y = this.jump.y;
      }
    }
  };
  game.Player.prototype.collideWith = function(target) {
    game.PhysicsObject.prototype.collideWith.call(this, target);
  }

  game.loadLevel = function(level) {
    game.levels[level].forEach(function(row, y) {
      var symbols = [], groupNum = -1, last;
      for (var i = 0; i < row.length; i++) {
        var symbol = row.charAt(i);
        if (last == symbol) {
          symbols[groupNum] += symbol;
        } else {
          groupNum++;
          symbols[groupNum] = symbol;
        }
        last = symbol;
      }
      var x = 0;
      symbols.forEach(function(group) {
        switch (group.substr(0, 1)) {
          case 'X':
            game.objects.push(new game.Ground(x*game.blockSize, y*game.blockSize, group.length*game.blockSize, game.blockSize));
            break;
          case 'O':
            game.objects.push(new game.Player(x*game.blockSize, y*game.blockSize));
            break;
        }
        x += group.length;
      });
    });
  };
}

function setup() {
  createCanvas(800, 500);
  makeClasses();
  game.loadLevel(0);
}

function draw() {
  background(255, 220, 180);
  game.objects.forEach(function(obj) {
    obj.touching = {left: false, right: false, top: false, bottom: false};
    obj.tick();
  });
  game.physics.overlap(game.solids, function(a, b) {
    if (
        a.velocity.y > 0 &&
          (b.overlapPoint(a.position.x, a.position.y+a.height/2)
           || b.overlapPoint(a.position.x-a.width*0.3, a.position.y+a.height/2)
           || b.overlapPoint(a.position.x+a.width*0.3, a.position.y+a.height/2)
          )
        ) {
      a.position.y = b.position.y - b.height/2 - a.height/2;
      a.touching.bottom = true;
      b.touching.top = true;
    }
    if (
        b.overlapPoint(a.position.x-a.width/2, a.position.y)
        || b.overlapPoint(a.position.x-a.width/2, a.position.y-a.height*0.3)
        || b.overlapPoint(a.position.x-a.width/2, a.position.y+a.height*0.3)
       ) {
      a.position.x = b.position.x + b.width/2 + a.width/2;
      a.touching.left = true;
      b.touching.right = true;
    }
    if (
        b.overlapPoint(a.position.x+a.width/2, a.position.y)
        || b.overlapPoint(a.position.x+a.width/2, a.position.y-a.height*0.3)
        || b.overlapPoint(a.position.x+a.width/2, a.position.y+a.height*0.3)
       ) {
      a.position.x = b.position.x - b.width/2 - a.width/2;
      a.touching.right = true;
      b.touching.left = true;
    }
    if (b.overlapPoint(a.position.x, a.position.y-a.height/2)) {
      a.position.y = b.position.y + b.height/2 + a.height/2;
      a.touching.top = true;
      b.touching.bottom = true;
    }
    a.collideWith(b);
    b.collideWith(a);
  });
  game.objects.forEach(function(obj) {
    obj.interact();
  });
  drawSprites();
}
