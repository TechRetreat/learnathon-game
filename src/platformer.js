var game = {
  blockSize: 30,
  ground: null,
  solids: null,
  physics: null,
  objects: []
};

function makeClasses() {
  game.solids = new Group();
  game.physics = new Group();
  game.ground = new Group();

  game.Block = function(x, y, w, h) {
    this.sprite = createSprite(x, y, w, h);
  };
  game.Block.prototype = {
    tick: function() { },
    interact: function() { },
    collideWith: function(target) { }
  };

  game.Ground = function(x, y, w, h) {
    game.Block.call(this, x, y, w, h);
    this.sprite.shapeColor = color(80, 180, 100);
    this.sprite.immovable = true;
    game.solids.add(this.sprite);
    game.ground.add(this.sprite);
  };
  game.Ground.prototype = {
    tick: function() {
      game.Block.prototype.tick.call(this);
    },
    interact: function() {
      game.Block.prototype.interact.call(this);
    },
    collideWith: function(target) {
      game.Block.prototype.collideWith.call(this, target);
    }
  };

  game.PhysicsObject = function(x, y, w, h) {
    game.Block.call(this, x, y, w, h);
    game.solids.add(this.sprite);
    game.physics.add(this.sprite);
    this.gravity = createVector(0, 1);
  };
  game.PhysicsObject.prototype = {
    tick: function() {
      game.Block.prototype.tick.call(this);
      this.sprite.velocity.add(this.gravity);
    },
    interact: function() {
      game.Block.prototype.interact.call(this);
    },
    collideWith: function(target) {
      game.Block.prototype.collideWith.call(this, target);
      if (this.sprite.touching.bottom) {
        this.sprite.velocity.y = this.gravity.y;
      }
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
    },
    interact: function() {
      game.PhysicsObject.prototype.interact.call(this);
      console.log(this.sprite.velocity.y);
      if (keyDown('RIGHT_ARROW')) {
        this.sprite.velocity.x = 5;
      } else if (keyDown('LEFT_ARROW')) {
        this.sprite.velocity.x = -5;
      } else {
        this.sprite.velocity.x = 0;
      }

      if (keyWentDown('UP_ARROW')) {
        this.sprite.position.y += 2;
        if (this.sprite.touching.bottom) {
          this.sprite.velocity.y = this.jump.y;
        }
        this.sprite.position.y -= 2;
      }
    },
    collideWith: function(target) {
      game.PhysicsObject.prototype.collideWith.call(this, target);
    }
  };
}

function setup() {
  createCanvas(800, 500);
  makeClasses();
  game.objects = [new game.Player(400, 300), new game.Ground(400, 400, 300, 80)];
}

var n=0;
function draw() {
  background(255, 220, 180);
  game.objects.forEach(function(obj) {
    obj.tick();
  });
  for (var i=0; i<game.objects.length; i++) {
    for (var j=i+1; j<game.objects.length; j++) {
      if (game.objects[i].sprite.collide(game.objects[j].sprite)) {
        game.objects[i].collideWith(game.objects[j]);
        game.objects[j].collideWith(game.objects[i]);
      };
    }
  }
  game.objects.forEach(function(obj) {
    obj.interact();
  });
  drawSprites();
}
