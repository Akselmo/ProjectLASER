game = new Phaser.Game(1280, 768, Phaser.AUTO, 'gameDiv', { preload: preload, create: create, update: update, render: render });
mouseTouchDown = false;
enemyID = 0;
var wall;
var floor;

function preload()
{
  game.time.advancedTiming = true;
  //Floor tile needs to be twice as big as wall! This can be done by tiling (2x2) the floor texture!
  //Wall 128x128, floor 256x256
  //Walls
  game.load.image('wall1', 'sprites/wall1.png');
  game.load.image('wall2', 'sprites/wall2.png');
  game.load.image('wall3', 'sprites/wall3.png');
  game.load.image('wall4', 'sprites/wall4.png');
  game.load.image('wall5', 'sprites/wall5.png');
  game.load.image('planetwall1', 'sprites/planetwall1.png');
  game.load.image('planetwall2', 'sprites/planetwall2.png');
  //Floors
  game.load.image('floor1', 'sprites/floor1.png');
  game.load.image('floor2', 'sprites/floor2.png');
  game.load.image('floor3', 'sprites/floor3.png');
  game.load.image('floor4', 'sprites/floor4.png');
  game.load.image('floor5', 'sprites/floor5.png');
  game.load.image('floor6', 'sprites/floor6.png');
  game.load.image('planetfloor1', 'sprites/planetfloor1.png');
  game.load.image('planetfloor2', 'sprites/planetfloor2.png');
  game.load.image('planetfloor3', 'sprites/planetfloor3.png');
  game.load.image('planetfloor4', 'sprites/planetfloor4.png');
  //Player
  game.load.image('player', 'sprites/player.png');
  game.load.image('projectile', 'sprites/projectile.png');
  //Enemy/enemies
  game.load.image('enemy', 'sprites/enemytest.png');
  //Pickups+misc
  game.load.image('spawnPoint', 'sprites/spawnPoint.png');
  game.load.image('healthPickup', 'sprites/healthpickup.png');
}


function create()
{
  cursors = game.input.keyboard.createCursorKeys();
  space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  W_key = game.input.keyboard.addKey(Phaser.Keyboard.W)
  A_key = game.input.keyboard.addKey(Phaser.Keyboard.A)
  S_key = game.input.keyboard.addKey(Phaser.Keyboard.S)
  D_key = game.input.keyboard.addKey(Phaser.Keyboard.D)


  One = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
  Two = game.input.keyboard.addKey(Phaser.Keyboard.TWO);
  Three = game.input.keyboard.addKey(Phaser.Keyboard.THREE);

  // Physics
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.gravity.y = 0;


  game.stage.backgroundColor = '#000';


  // Create player
  player = game.add.sprite(100, 100, 'player');
  game.physics.arcade.enable(player);
  player.body.collideWorldBounds = true;
  player.anchor.set(0.5);
  player.body.allowRotation = false;
  player.health = 100;


  // Create a group for enemies
  enemies = game.add.group();
  enemies.physicsBodyType = Phaser.Physics.ARCADE;
  enemies.enableBody = true;


  // Create group for pickups
  pickups = game.add.group();
  pickups.physicsBodyType = Phaser.Physics.ARCADE;
  pickups.enableBody = true;

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



  enemyProjectiles = [];


  //Map
  //The image for the floor tiles (ex. 'floor')
  //The image for the wall tiles (ex. 'wall')
  //Minimum room size (in tiles) (ex.  2)
  //Maximum room size (in tiles) (ex. 5)
  //Maximum number of rooms possible (ex. 10)
  //Player sprite so the map generator can place the player in a random place


  spawnPointsAmount = 4;
  spawnPoints = game.add.group();

  for (i = 0; i < spawnPointsAmount; i++) {
    spawnPoint = spawnPoints.create(0, 0, 'spawnPoint');
  }
  //spawnPoint1 = spawnPoints.create(0, 0, 'spawnPoint');
  //spawnPoint2 = spawnPoints.create(0, 0, 'spawnPoint');
  //spawnPoint3 = spawnPoints.create(0, 0, 'spawnPoint');

  //Randomizes the levels sprites, this must be done before creating level!
  randomizeLevelSprites();

  //Level generation
  this.map = new Map(floor, wall, 2, 5, 10, player, spawnPoints, 3);
  this.game.physics.game.world.setBounds(0,0,3000,3000);

  //Bring other sprites to top
  game.world.bringToTop(spawnPoints);
  game.world.bringToTop(player);
  game.world.bringToTop(enemies);
  game.world.bringToTop(pickups);
  game.world.bringToTop(projectiles);
  game.world.bringToTop(enemyProjectiles);



  mapwalls = this.map.walls;


  // Spawn testing
  //Needs to be automated!
  spawnEnemy(spawnPoints.getAt(0).x, spawnPoints.getAt(0).y);
  spawnEnemy(spawnPoints.getAt(1).x, spawnPoints.getAt(1).y);
  spawnEnemy(spawnPoints.getAt(2).x, spawnPoints.getAt(2).y);
  spawnPickup(spawnPoints.getAt(3).x, spawnPoints.getAt(3).y);

}

function update()
{
  //Check collisions
  game.physics.arcade.collide(player, this.map.walls);
  game.physics.arcade.collide(enemies, this.map.walls);

  game.physics.arcade.overlap(enemies, projectiles, hitEnemy, null, this);

  game.physics.arcade.overlap(player, enemyProjectiles, hitPlayer, null, this);

  game.physics.arcade.overlap(player, pickups, pickupEffect);

  game.physics.arcade.overlap(player, enemies, contactDamage, null, this);
  game.physics.arcade.overlap(projectiles, this.map.walls, resetProjectile);
  game.physics.arcade.overlap(enemyProjectiles, this.map.walls, resetProjectile);


  // Player controls + camera follows the player
  player.body.velocity.y = 0;
  player.body.velocity.x = 0;

  if(W_key.isDown) {
    player.body.velocity.y -= 350;
  }
  else if(S_key.isDown) {
    player.body.velocity.y += 350;
  }
  if(A_key.isDown) {
    player.body.velocity.x -= 350;
  }
  else if(D_key.isDown) {
    player.body.velocity.x += 350;
  }
  game.camera.follow(player);


  // Testing enemy fire
  if (One.isDown) {
    fireEnemyProjectile(enemies.getAt(0).x, enemies.getAt(0).y, 0);
  }
  if (Two.isDown) {
    fireEnemyProjectile(enemies.getAt(1).x, enemies.getAt(1).y, 1);
  }

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




  // Enemies aim and shoot at the player
  enemies.forEachExists(function(enemy) {
      enemy.rotation = game.physics.arcade.angleToXY(enemy, player.x, player.y);

      if (Phaser.Math.distance(player.x, player.y, enemy.x, enemy.y) < 400) {
        fireEnemyProjectile(enemy.x, enemy.y, enemy.id);
        followPlayer(enemy, true);
      }
      else{
        followPlayer(enemy, false);
      }
    });


}

function render()
{
	game.debug.text('FPS: ' + game.time.fps, 2, 14, "#00ff00");
  game.debug.text('Player health: ' + player.health, 2, 28, "#00ff00");
}


function resetProjectile(projectile) {
  projectile.kill();
}

function fireProjectile() {
  projectile = projectiles.getFirstExists(false);
  if (projectile) {
    projectile.reset(player.x, player.y); // Projectile origin point
    game.physics.arcade.moveToPointer(projectile, 600); // Projectile speed
  }
}


function fireEnemyProjectile(x, y, enemyID) {

  //projectile = enemyProjectiles.getAt(enemyID).getFirstExists(false);
  projectile = enemyProjectiles[enemyID].getFirstExists(false);
  if (projectile) {
    projectile.reset(x, y); // Projectile origin point
    game.physics.arcade.moveToObject(projectile, player, 600);
  }

}


function followPlayer(enemyID, enabled)
{
  if (enabled == true)
  {
    game.physics.arcade.moveToObject(enemyID,player,100);
    
  }
  else
  {
    game.physics.arcade.moveToObject(enemyID,player,0);
  }

}


function hitEnemy(enemy, projectile) {
  enemy.damage(1);
  projectile.kill();
}

function hitPlayer(player, projectile) {
  player.damage(1);
  projectile.kill();
}
function contactDamage() {
  player.damage(1);
}


function pickupEffect(player, pickup)
{

  //Can add more randomized pickup effects here

  if (player.health != player.maxHealth)
  {
    player.heal(20);
  }
  pickup.kill();
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






function spawnEnemy(x, y) {
  enemy = enemies.create(x, y, 'enemy');
  enemy.anchor.set(0.5);
  enemy.id = enemyID;
  enemyID++;
  enemies.set(enemy, 'health', 5);
  enemies.set(enemy, 'checkWorldBounds', true);



  // Create projectile array for the enemy
  enemyProj = game.add.group();
  enemyProj.enableBody = true;
  enemyProj.physicsBodyType = Phaser.Physics.ARCADE;
  // Create several projectiles for use
  enemyProj.createMultiple(2, 'projectile');
  // Execute the reset function for each projectile that goes out of the world bounds
  enemyProj.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', resetProjectile);
  enemyProj.callAll('anchor.setTo','anchor', 0.5, 1.0);
  enemyProj.setAll('checkWorldBounds', true);
  //enemyProjectiles.add(enemyProj);
  enemyProjectiles.push(enemyProj);
}


function spawnPickup(x, y)
{
  pickup = pickups.create(x, y, 'healthPickup');

}


// WIP: make X and Y random, max values defined by map size
function spawnEnemyPrototype(x, y) {
  enemy = enemies.create(x, y, 'enemy');
  enemies.set(enemy, 'health', 5);
  enemies.set(enemy, 'checkWorldBounds', true);
  if (game.physics.arcade.overlap(enemy, mapwalls)) {
    enemy.kill();
    // WIP: make the modifiers random / semi-random
    spawnEnemy(x + 100, y + 100);
  }
}

function randomizeLevelSprites()
{
  var station = Math.floor((Math.random() * 2));

  if (station == 1)
  {
    wall = "wall"+Math.floor((Math.random() * 5)+1);
    floor = "floor"+Math.floor((Math.random() * 6)+1);
  }
  else
  {
    wall = "planetwall"+Math.floor((Math.random() * 2)+1);
    floor = "planetfloor"+Math.floor((Math.random() * 4)+1);
  }
}