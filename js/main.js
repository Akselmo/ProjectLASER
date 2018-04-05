var game = new Phaser.Game(1280, 768, Phaser.AUTO, 'gameDiv', { preload: preload, create: create, update: update, render: render });
var mouseTouchDown = false;
var player;

function preload()
{
  game.time.advancedTiming = true;
  //Floor tile needs to be twice as big as wall! This can be done by tiling (2x2) the floor texture!
  //Wall 128x128, floor 256x256
  game.load.image('wall', 'sprites/Swall1.png');
  game.load.image('floor', 'sprites/Sfloor4.png');
  game.load.image('player', 'sprites/player.png');
  game.load.image('projectile', 'sprites/projectile.png');
}


function create()
{
  cursors = game.input.keyboard.createCursorKeys();
  space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  W_key = game.input.keyboard.addKey(Phaser.Keyboard.W)
  A_key = game.input.keyboard.addKey(Phaser.Keyboard.A)
  S_key = game.input.keyboard.addKey(Phaser.Keyboard.S)
  D_key = game.input.keyboard.addKey(Phaser.Keyboard.D)

  // Physics
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.gravity.y = 0;


  game.stage.backgroundColor = '#000';

  
  //playergroup = game.add.group();
  player = game.add.sprite(100, 100, 'player');
  game.physics.arcade.enable(player);
  player.body.collideWorldBounds = true;
  player.anchor.set(0.5);
  player.body.allowRotation = false;
  

  // Create projectiles
  projectiles = game.add.group();
  projectiles.enableBody = true;
  projectiles.physicsBodyType = Phaser.Physics.ARCADE;
  // Create several projectiles for use
  projectiles.createMultiple(50, 'projectile');
  // Execute the reset function for each projectile that goes out of the world bounds
  projectiles.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', resetProjectile);
  projectiles.callAll('anchor.setTo','anchor', 0.5, 1.0);
  projectiles.setAll('checkWorldBounds', true);


  //Map
  //The image for the floor tiles (ex. 'floor')
  //The image for the wall tiles (ex. 'wall')
  //Minimum room size (in tiles) (ex.  2)
  //Maximum room size (in tiles) (ex. 5)
  //Maximum number of rooms possible (ex. 10)
  //Player sprite so the map generator can place the player in a random place
  this.map = new Map('floor','wall',2,5,10, player);
  this.game.physics.game.world.setBounds(0,0,3000,3000);


  //Bring other sprites to top
  game.world.bringToTop(player);
  game.world.bringToTop(projectiles);


}


function update()
{
  //Check collisions
  game.physics.arcade.collide(player, this.map.walls);
  game.physics.arcade.overlap(projectiles, this.map.walls, resetProjectile);


  // Camera controls + camera follows the player
  player.body.velocity.y = 0;
  player.body.velocity.x = 0;

  if(W_key.isDown) {
    player.body.velocity.y -= 150;
  }
  else if(S_key.isDown) {
    player.body.velocity.y += 150;
  }
  if(A_key.isDown) {
    player.body.velocity.x -= 150;
  }
  else if(D_key.isDown) {
    player.body.velocity.x += 150;
  }
  game.camera.follow(player);


  // Player rotation + shooting
  player.rotation = game.physics.arcade.angleToPointer(player);

  if (game.input.activePointer.isDown) {
    if (!mouseTouchDown) {
      touchDown();
    }
  } else {
    if (mouseTouchDown) {
      touchUp();
    }
  }

}

function render()
{
	game.debug.text('FPS: ' + game.time.fps, 2, 14, "#00ff00");
}


function resetProjectile(projectile) {
  projectile.kill();
}

function fireProjectile() {
  var projectile = projectiles.getFirstExists(false);
  if (projectile) {
    projectile.reset(player.x, player.y); // Projectile origin point
    game.physics.arcade.moveToPointer(projectile, 600); // Projectile speed
  }
}

function touchDown() {
	// Set touchDown to true, so we only trigger this once
	mouseTouchDown = true;
	fireProjectile();
}

function touchUp() {
	// Set touchDown to false, so we can trigger touchDown on the next click
	mouseTouchDown = false;
}
