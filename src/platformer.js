var game = {
  blockSize: 30,
  objects: []
};

function makeClasses() {
  game.Block = function(x, y, w, h) {
    this.sprite = createSprite(x, y, w, h);
  };
  game.Block.prototype = {
    tick: function() {},
    collideWith: function(target) {}
  };

  game.Ground = function(x, y, w, h) {
    game.Block.call(this, x, y, w, h);
    this.sprite.shapeColor = color(80, 180, 100);
    //this.sprite.immovable = true;
  };
  game.Ground.prototype = {
    tick: function() {
      game.Block.prototype.tick.call(this);
    },
    collideWith: function(target) {
      console.log(target);
      game.Block.prototype.collideWith.call(this, target);
      target.sprite.velocity.y = 0;
    }
  };

  game.PhysicsObject = function(x, y, w, h) {
    game.Block.call(this, x, y, w, h);
    this.gravity = createVector(0, 0.2);
  };
  game.PhysicsObject.prototype = {
    tick: function() {
      game.Block.prototype.tick.call(this);
      this.sprite.velocity.add(this.gravity);
    },
    collideWith: function(target) {
      game.Block.prototype.collideWith.call(this, target);
    }
  };

  game.Player = function(x, y) {
    game.PhysicsObject.call(this, x, y, game.blockSize, game.blockSize);
    this.sprite.shapeColor = color(255, 0, 0);
    this.jump = createVector(0, -15);
  };
  game.Player.prototype = {
    tick: function() {
      game.PhysicsObject.prototype.tick.call(this);
      if (keyDown('RIGHT_ARROW')) {
        this.sprite.velocity.x = 5;
      } else if (keyDown('LEFT_ARROW')) {
        this.sprite.velocity.x = -5;
      } else {
        this.sprite.velocity.x = 0;
      }

      if (keyWentDown('UP_ARROW') && this.sprite.velocity.y == 0) {
        this.sprite.velocity.y = this.jump.y;
      }
    },
    collideWith: function(target) {
      game.PhysicsObject.prototype.collideWith.call(this, target);
    }
  };
}

function setup() {
  makeClasses();
  createCanvas(800, 600);
  objects = [new game.Player(400, 300), new game.Ground(200, 400, 300, 30)];
}

function draw() {
  background(255, 220, 180);
  objects.forEach(function(obj) {
    obj.tick();
  });
  for (var i=0; i<objects.length; i++) {
    for (var j=i+1; j<objects.length; j++) {
      if (objects[i].sprite.overlap(objects[j].sprite)) {
        console.log("touching");
        objects[i].collideWith(objects[j]);
        objects[j].collideWith(objects[i]);
      };
    }
  }
  drawSprites();
}
