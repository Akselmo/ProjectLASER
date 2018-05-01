game = new Phaser.Game(900, 900, Phaser.AUTO, 'gameDiv', { preload: preload, create: create, update: update, render: render });

var enemyID = 0;
var bmd;
var fogCircle;
var fringe;
var playerHasRifle = false;
var playerRifleAmmo = 0;
var music;
var robotOrBug;
var musicPlaying = false;
var playerScore = 0;

//enemyID and mouseTouchDown are global so they refresh between state reloads
game.global =
{
  mouseTouchDown: false,
  playerHealth: 100,
  enemyID: 0,
  bmd: null,
  fogCircle: null,
  fringe: null,
  playerX: 0,
  playerY: 0,
  playerDied: false,
  station: 0,
  playerHasRifle: false,
  playerRifleAmmo: 0,
  music: null,
  robotOrBug: null,
  musicPlaying: false,
  playerScore: 0
}


function preload()
{
  enemyID = game.global.enemyID;


  game.time.advancedTiming = true;
  //Floor tile needs to be twice as big as wall! This can be done by tiling (2x2) the floor texture!
  //Wall 128x128, floor 256x256

  //Walls
  game.load.image('wall1', 'sprites/wall1.png');
  game.load.image('wall2', 'sprites/wall2.png');
  game.load.image('wall3', 'sprites/wall3.png');
  game.load.image('wall4', 'sprites/wall4.png');
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

  //Player + projectile
  game.load.spritesheet("player", "sprites/spaceman.png", 128, 128);
  game.load.spritesheet("playerDeath", "sprites/spacemankuolema.png", 128, 128);
  game.load.spritesheet("projectile", "sprites/GunBullet2s16x16.png", 16, 16);
  game.load.spritesheet("projectile2", "sprites/GunBullet1s16x16.png", 16, 16);

  //Enemies
  game.load.spritesheet("bugMonster", "sprites/ötökkä.png", 128, 128);
  game.load.spritesheet("robotMonster", "sprites/robotti.png", 128, 128);
  game.load.spritesheet("bugMonsterBullet", "sprites/BugEnemyFire32x32.png", 32, 32);
  game.load.spritesheet("robotMonsterBullet", "sprites/enemtBulletR32x64.png", 32, 32);

  //Pickups+misc
  game.load.image('spawnPoint', 'sprites/spawnPoint.png');
  game.load.image('healthPickup', 'sprites/healthpickup.png');
  game.load.image('ammoPickup', 'sprites/ammopickup.png');
  game.load.spritesheet('portal', 'sprites/portal80x128.png', 80, 128, 10);

  //Sounds
  game.load.audio('music', 'sounds/music.mp3');
  game.load.audio('pistol', 'sounds/player_shoot_pistol.wav');
  game.load.audio('rifle', 'sounds/player_shoot_rifle.wav');
  game.load.audio('bug_sound', 'sounds/bug_sound.mp3');
  game.load.audio('bug_death', 'sounds/bug_death.mp3');
  game.load.audio('robot_sound', 'sounds/robot_shoot.mp3');
  game.load.audio('robot_death', 'sounds/robot_death.mp3');
  game.load.audio('player_hit', 'sounds/player_hit.wav');
  game.load.audio('game_over', 'sounds/game_over.wav');
  game.load.audio('portal', 'sounds/portal.mp3');

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
  // Create player
  player = game.add.sprite(100, 100, 'player');
  game.physics.arcade.enable(player);
  player.body.collideWorldBounds = true;
  player.anchor.set(0.5);
  player.body.allowRotation = false;
  player.body.setSize(45,115,45,4);
  //Health is now global and shared between states
  player.health = game.global.playerHealth;
  //PistolAnims
  playerAnimDown = player.animations.add('playerAnimDown', [16, 17, 18, 19]);
  playerAnimUp = player.animations.add('playerAnimUp', [20, 21, 22, 23]);
  playerAnimLeft = player.animations.add('playerAnimLeft', [8, 9, 10, 11]);
  playerAnimRight = player.animations.add('playerAnimRight', [28, 29, 30, 31]);
  //RifleAnims
  playerAnimDownRifle = player.animations.add('playerAnimDownRifle', [0, 1, 2, 3]);
  playerAnimUpRifle = player.animations.add('playerAnimUpRifle', [4, 5, 6, 7]);
  playerAnimLeftRifle = player.animations.add('playerAnimLeftRifle', [24, 25, 26, 27]);
  playerAnimRightRifle = player.animations.add('playerAnimRightRifle', [12, 13, 14, 15]);
  player.moving = false;
  player.anim = "left";



  // Create a group for enemies
  enemies = game.add.group();
  enemies.physicsBodyType = Phaser.Physics.ARCADE;
  enemies.enableBody = true;



  // Create group for pickups
  healthPickups = game.add.group();
  healthPickups.physicsBodyType = Phaser.Physics.ARCADE;
  healthPickups.enableBody = true;
  ammoPickups = game.add.group();
  ammoPickups.physicsBodyType = Phaser.Physics.ARCADE;
  ammoPickups.enableBody = true;

  // Create group for portal
  portals = game.add.group();
  portals.physicsBodyType = Phaser.Physics.ARCADE;
  portals.enableBody = true;

  // Create projectiles
  projectiles = game.add.group();
  projectiles.enableBody = true;
  projectiles.physicsBodyType = Phaser.Physics.ARCADE;
  // Create several projectiles for use
  projectiles.createMultiple(50, 'projectile');
  projectiles.setAll('frame', 1);
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
  spawnPoints = game.add.group();

  //Randomizes levels objects, must be done before creating level!
  randomizeLevelObjects();

  //Randomizes the levels sprites, this must be done before creating level!
  randomizeLevelSprites();

  //Level generation
  map = new Map(floor, wall, 2, 5, 10, player, spawnPoints);
  game.physics.game.world.setBounds(0, 0, 3000, 3000);
  mapwalls = map.walls;

  //Bring other sprites to top
  bringToTop();

  // Spawns
  addLevelSpawns();

  //FogOfWar
  bmd = game.make.bitmapData(900, 900);
  fogCircle = new Phaser.Circle(450, 500, 800);
  fringe = 65;
  var fogSprite = bmd.addToWorld();
  fogSprite.fixedToCamera = true;
  updateFog();

  music = game.add.audio('music');
  if (musicPlaying === false)
  {
    music.play();
    musicPlaying = true;
  }
  music.loop = true;
  music.volume = 0.8;
}

function update()
{
  fogCircle.x = player.x;
  fogCircle.y = player.y;

  //Check collisions
  game.physics.arcade.collide(player, map.walls);
  game.physics.arcade.collide(enemies, map.walls);
  game.physics.arcade.collide(enemies, enemies);

  game.physics.arcade.overlap(enemies, projectiles, hitEnemy, null, this);

  game.physics.arcade.overlap(player, enemyProjectiles, hitPlayer, null, this);

  game.physics.arcade.overlap(player, healthPickups, pickupHealthEffect);
  game.physics.arcade.overlap(player, ammoPickups, pickupAmmoEffect);

  game.physics.arcade.overlap(player, portals, portalEffect);

  game.physics.arcade.overlap(player, enemies, contactDamage, null, this);
  game.physics.arcade.overlap(projectiles, map.walls, resetProjectile);
  game.physics.arcade.overlap(enemyProjectiles, map.walls, resetProjectile);


  // Player controls + camera follows the player
  playerX = player.x;
  playerY = player.y;
  player.body.velocity.y = 0;
  player.body.velocity.x = 0;

  posSum = parseFloat(game.input.mousePointer.y) + parseFloat(game.input.mousePointer.x);
  negSum = parseFloat(game.input.mousePointer.y) - parseFloat(game.input.mousePointer.x);
  if (W_key.isDown) {
    player.body.velocity.y -= 350;
    player.moving = true;
  }
  if (S_key.isDown) {
    player.body.velocity.y += 350;
    player.moving = true;
  }
  if (A_key.isDown) {
    player.body.velocity.x -= 350;
    player.moving = true;
  }
  if (D_key.isDown) {
    player.body.velocity.x += 350;
    player.moving = true;
  }
  if (W_key.isDown == false && D_key.isDown == false && S_key.isDown == false && A_key.isDown == false) {
    player.moving = false;
  }
  game.camera.follow(player);


  // Player walking animations
  coordSum = parseFloat(game.input.mousePointer.y) + parseFloat(game.input.mousePointer.x);
  coordSub = parseFloat(game.input.mousePointer.y) - parseFloat(game.input.mousePointer.x);
  if (player.moving == true) {
    if (coordSum <= 825 && coordSub >= -100) {
      if (playerHasRifle === true)
      {
        player.animations.play("playerAnimLeftRifle", 5, true);
        player.anim = "leftRifle";
      }
      else
      {
        player.animations.play("playerAnimLeft", 5, true);
        player.anim = "left";
      }

    }
    else if (coordSum >= 880 && coordSub >= -150) {
      if (playerHasRifle === true)
      {
        player.animations.play("playerAnimDownRifle", 5, true);
        player.anim = "downRifle";
      }
      else
      {
        player.animations.play("playerAnimDown", 5, true);
        player.anim = "down";
      }

    }
    else if (coordSum >= 880 && (coordSub >= -130 || coordSub <= -130)) {
      if (playerHasRifle === true)
      {
        player.animations.play("playerAnimRightRifle", 5, true);
        player.anim = "rightRifle";
      }
      else
      {
        player.animations.play("playerAnimRight", 5, true);
        player.anim = "right";
      }

    }
    else if (coordSum <= 935 && coordSub <= -150) {
      if (playerHasRifle === true)
      {
        player.animations.play("playerAnimUpRifle", 5, true);
        player.anim = "upRifle";
      }
      else
      {
        player.animations.play("playerAnimUp", 5, true);
        player.anim = "up";
      }

    }
  }
  else {
    if (coordSum <= 850 && coordSub >= -130) {
      //player.animations.play("playerAnimLeft", 5, true);

      if (playerHasRifle === true)
      {
        player.anim = "leftRifle";
        player.frame = 26;
      }
      else
      {
        player.anim = "left";
        player.frame = 9;
      }

    }
    else if (coordSum >= 800 && coordSub >= -150) {
      //player.animations.play("playerAnimDown", 5, true);

      if (playerHasRifle === true)
      {
        player.anim = "downRifle";
        player.frame = 0;
      }
      else
      {
        player.anim = "down";
        player.frame = 16;
      }
    }
    else if (coordSum >= 880 && (coordSub >= -130 || coordSub <= -130)) {
      //player.animations.play("playerAnimRight", 5, true);
      if (playerHasRifle === true)
      {
        player.anim = "rightRifle";
        player.frame = 13;
      }
      else
      {
        player.anim = "right";
        player.frame = 29;
      }
    }
    else if (coordSum <= 935 && coordSub <= -130) {
      //player.animations.play("playerAnimUp", 5, true);
      if (playerHasRifle === true)
      {
        player.anim = "upRifle";
        player.frame = 4;
      }
      else
      {
        player.anim = "up";
        player.frame = 20;
      }
    }
  }


  // Player death animation
  if (player.exists == false && game.global.playerDied != true) {
    music.stop();
    var gameoverSound = game.add.audio('game_over');
    gameoverSound.volume = 0.8;
    gameoverSound.play();
    playerDeath = game.add.sprite(playerX - 60, playerY - 60,'playerDeath');
    game.world.bringToTop(enemies);
    playerDeathAnim = playerDeath.animations.add('playerDeathAnim', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
    game.global.playerDied = true;
    playerDeath.animations.play('playerDeathAnim', 5, false);
    // Game over text
    var gameOverText1 = game.add.text(game.camera.x + 325, game.camera.y + 400, 'YOU DIED', { font: '64px Impact', fill: '#ff0000', align: 'center'});
    var gameOverText2 = game.add.text(game.camera.x + 255, game.camera.y + 500, 'Refresh the page to try again', { font: '32px Impact', fill: '#ff0000' });
    gameOverText1.stroke = '#000000';
    gameOverText1.strokeThickness = 6;
    gameOverText2.stroke = '#000000';
    gameOverText2.strokeThickness = 6;
    game.world.bringToTop(gameOverText1);
    game.world.bringToTop(gameOverText2);
  }

  // Testing level creation
  if (One.isDown) {
    playerHealth = 100;
    music.stop();
    musicPlaying = false;
    startNewLevel();
  }



  if (game.input.activePointer.isDown) {
    if (!game.global.mouseTouchDown) {
      touchDown();
    }
  } else {
    if (game.global.mouseTouchDown) {
      touchUp();
    }
  }




  // Enemies aim and shoot at the player
  enemies.forEachExists(function(enemy) {

    enemyCoordDiv = (Math.floor(enemy.x) / Math.floor(player.x)) / (Math.floor(player.y) / Math.floor(enemy.y)) * 100;
    enemyCoordMult = (Math.floor(enemy.x) / Math.floor(player.x)) * (Math.floor(player.y) / Math.floor(enemy.y)) * 100;
    if (Phaser.Math.distance(player.x, player.y, enemy.x, enemy.y) < 400 && player.exists == true && enemy.isDead == false) {
      //fireEnemyProjectile(enemy.x, enemy.y, enemy.id);



      if (enemyCoordDiv < 100 && enemyCoordMult < 100) {
        enemy.animations.play("attackAnimRight", 5, true);
      }
      else if (enemyCoordDiv > 100 && enemyCoordMult < 100) {
        enemy.animations.play("attackAnimUp", 5, true);
      }
      else if (enemyCoordDiv > 100 && enemyCoordMult > 100) {
        enemy.animations.play("attackAnimLeft", 5, true);
        //enemy.animations.play("enemyDeathAnim", 5, false);
      }
      else if (enemyCoordDiv < 100 && enemyCoordMult > 100) {
        enemy.animations.play("attackAnimDown", 5, true);
      }
      fireEnemyProjectile(enemy.x, enemy.y, enemy.id);
      followPlayer(enemy, true);
    }
    else if (enemy.isDead == false) {
      if (enemyCoordDiv < 100 && enemyCoordMult < 100) {
        enemy.animations.play("idleAnimRight", 5, true);
      }
      else if (enemyCoordDiv > 100 && enemyCoordMult < 100) {
        enemy.animations.play("idleAnimUp", 5, true);
      }
      else if (enemyCoordDiv > 100 && enemyCoordMult > 100) {
        enemy.animations.play("idleAnimLeft", 5, true);
      }
      else if (enemyCoordDiv < 100 && enemyCoordMult > 100) {
        enemy.animations.play("idleAnimDown", 5, true);
      }
      followPlayer(enemy, false);
    }

    // Enemy death animation
    if (enemy.health == 1 && enemy.isDead == false) {
      if (robotOrBug === 1)
      {
        var enemySound = game.add.audio('bug_death');
        enemySound.volume = 0.7;
        playerScore += 30;
        enemySound.play();
      }
      else
      {
        var enemySound = game.add.audio('robot_death');
        enemySound.volume = 0.7;
        playerScore += 20;
        enemySound.play();
      }
      enemy.alive = false;
      enemy.isDead = true;
      enemy.body.velocity.setTo(0,0);
      enemy.animations.stop();
      enemy.animations.play("enemyDeathAnim", 5, false);
      enemy.events.onAnimationComplete.addOnce(function() {
        enemy.exists = false;
        enemy.visible = false;
        enemy.inputEnabled = false;
        if (enemy.input) {
          enemy.input.useHandCursor = false;
        }

        enemy.events.destroy();
      }, enemy);

      if (enemy.events) {
          enemy.events.onKilled$dispatch(this);
      }
      return enemy;
    }


  });


  function fireEnemyProjectile(x, y, enemyID) {
    //projectile = enemyProjectiles.getAt(enemyID).getFirstExists(false);
    projectile = enemyProjectiles[enemyID].getFirstExists(false);
    if (projectile && enemies.getAt(enemyID).readyToFire == true) {
      if (robotOrBug === 1)
      {
        var enemySound = game.add.audio('bug_sound');
        enemySound.volume = 0.4;
        enemySound.play();
      }
      else
      {
        var enemySound = game.add.audio('robot_sound');
        enemySound.volume = 0.4;
        enemySound.play();
      }
      projectile.reset(x, y); // Projectile origin point
      game.physics.arcade.moveToObject(projectile, player, 600); // Projectile speed
      projectile.rotation = game.physics.arcade.angleToXY(projectile, player.x, player.y);
      enemies.getAt(enemyID).readyToFire = false;
    }
  }




  //Checking how many enemies total, show portal if 0
  if (enemies.total > 0)
  {
    portals.visible = false;
  }
  else
  {
    portals.visible = true;
  }

  //Update player health
  game.global.playerHealth = player.health;


  //Checking if player has rifle ammo
  if (playerRifleAmmo > 0)
  {
    playerHasRifle = true;
  }
  else if (playerRifleAmmo<= 0)
  {
    playerHasRifle = false;
  }

}

function render()
{
	game.debug.text('FPS: ' + game.time.fps, 2, 14, "#00ff00");
  game.debug.text('Player health: ' + player.health, 2, 28, "#00ff00");
  //game.debug.text('Enemies left: ' + enemies.total, 2, 42, "#00ff00");
  game.debug.text('Rifle ammo left: ' + playerRifleAmmo, 2, 42, "#00ff00");
  game.debug.text('Player score: ' + playerScore, 2, 56, "#00ff00");
}

function bringToTop()
{
  game.world.bringToTop(spawnPoints);
  game.world.bringToTop(healthPickups);
  game.world.bringToTop(ammoPickups);
  game.world.bringToTop(projectiles);
  game.world.bringToTop(portals);
  game.world.bringToTop(player);
  game.world.bringToTop(enemyProjectiles);
  game.world.bringToTop(enemies);
}


function resetProjectile(projectile) {
  projectile.kill();
}

// Fire player projectile
function fireProjectile() {
  projectile = projectiles.getFirstExists(false);
  if (playerHasRifle == true && projectile && player.exists == true) {
    projectile.loadTexture('projectile2', 0);
    var rifleSound = game.add.audio('rifle');
    rifleSound.volume = 0.5;
    rifleSound.play();
    if (player.anim == "leftRifle") {
      projectile.reset(player.x - 56, player.y - 23);
    }
    else if (player.anim == "rightRifle") {
      projectile.reset(player.x + 60, player.y - 4);
    }
    else if (player.anim == "downRifle") {
      game.world.bringToTop(projectiles);
      projectile.reset(player.x - 5, player.y);
    }
    else {
      game.world.bringToTop(player);
      projectile.reset(player.x, player.y - 25);
    }
    //projectile.reset(player.x - 48, player.y - 23); // Projectile origin point
    game.physics.arcade.moveToPointer(projectile, 600); // Projectile speed
    projectile.rotation = game.physics.arcade.angleToPointer(projectile);
    playerRifleAmmo -= 1;
  }
  else if (projectile && player.exists == true) {
    projectile.loadTexture('projectile',1);
    var pistolSound = game.add.audio('pistol');
    pistolSound.volume = 0.5;
    pistolSound.play();
    if (player.anim == "left") {
      projectile.reset(player.x - 56, player.y - 23);
    }
    else if (player.anim == "right") {
      projectile.reset(player.x + 60, player.y - 4);
    }
    else if (player.anim == "down") {
      game.world.bringToTop(projectiles);
      projectile.reset(player.x - 5, player.y);
    }
    else {
      game.world.bringToTop(player);
      projectile.reset(player.x, player.y - 25);
    }
    //projectile.reset(player.x - 48, player.y - 23); // Projectile origin point
    game.physics.arcade.moveToPointer(projectile, 600); // Projectile speed
    projectile.rotation = game.physics.arcade.angleToPointer(projectile);
  }
}




function followPlayer(enemyID, enabled)
{
  if (enabled == true && player.exists == true && Phaser.Math.distance(player.x, player.y, enemyID.x, enemyID.y) > 100)
  {
    game.physics.arcade.moveToObject(enemyID, player, 100);
  }
  //Fake pushing and avoiding player so the enemy doesn't get stuck to player
  else if (enabled == true && player.exists == true && Phaser.Math.distance(player.x, player.y, enemyID.x, enemyID.y) < 50)
  {
    game.physics.arcade.moveToObject(enemyID, player, -150);
  }
  else
  {
    game.physics.arcade.moveToObject(enemyID, player, 0);
  }

}


function hitEnemy(enemy, projectile) {
  if (playerHasRifle === true)
  {
    enemy.damage(3);
    console.log('rifle damage');
  }
  else
  {
    enemy.damage(1);
    console.log('pistol damage');
  }
  projectile.kill();
}

function hitPlayer(player, projectile) {
  player.damage(4);
  var playerHitSound = game.add.audio('player_hit');
  playerHitSound.volume = 0.5;
  playerHitSound.play();
  projectile.kill();
}
function contactDamage() {
  var playerHitSound = game.add.audio('player_hit');
  playerHitSound.volume = 0.2;
  playerHitSound.play();
  player.damage(1);
}


function pickupHealthEffect(player, healthPickup)
{

  if (player.health != player.maxHealth)
  {
    player.heal(20);
    playerScore += 10;
  }
  healthPickup.kill();
}

function pickupAmmoEffect(player, ammoPickup)
{

  playerRifleAmmo += 30;
  playerScore += 5;
  ammoPickup.kill();
}


function touchDown() {
	// Set touchDown to true, so we only trigger this once
	game.global.mouseTouchDown = true;
	fireProjectile();
}

function touchUp() {
	// Set touchDown to false, so we can trigger touchDown on the next click
	game.global.mouseTouchDown = false;
}


function spawnEnemy(x, y) {
  //enemy = enemies.create(x, y, 'enemy');
  //enemy = enemies.create(x, y, 'enemy');

    // Bug monster animations
  if (game.global.station == 0) {

    enemyColor = Math.floor((Math.random() * 3) + 1);

    enemy = game.add.sprite(x, y,'bugMonster');
    robotOrBug = 1;

    if (enemyColor == 1) {
      die = enemy.animations.add('enemyDeathAnim', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

      idleAnimDown = enemy.animations.add('idleAnimDown', [45, 46, 47]);
      idleAnimRight = enemy.animations.add('idleAnimRight', [75, 76, 77]);
      idleAnimUp = enemy.animations.add('idleAnimUp', [105, 106, 107]);
      idleAnimLeft = enemy.animations.add('idleAnimLeft', [63, 64, 65]);

      attackAnimDown = enemy.animations.add('attackAnimDown', [60, 61, 62]);
      attackAnimRight = enemy.animations.add('attackAnimRight', [90, 91, 92]);
      attackAnimUp = enemy.animations.add('attackAnimUp', [48, 49, 50]);
      attackAnimLeft = enemy.animations.add('attackAnimLeft', [78, 79, 80]);
    }
    else if (enemyColor == 2) {
      die = enemy.animations.add('enemyDeathAnim', [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]);

      idleAnimDown = enemy.animations.add('idleAnimDown', [93, 94, 95]);
      idleAnimRight = enemy.animations.add('idleAnimRight', [51, 52, 53]);
      idleAnimUp = enemy.animations.add('idleAnimUp', [81, 82, 83]);
      idleAnimLeft = enemy.animations.add('idleAnimLeft', [111, 112, 113]);

      attackAnimDown = enemy.animations.add('attackAnimDown', [108, 109, 110]);
      attackAnimRight = enemy.animations.add('attackAnimRight', [66, 67, 68]);
      attackAnimUp = enemy.animations.add('attackAnimUp', [96, 97, 98]);
      attackAnimLeft = enemy.animations.add('attackAnimLeft', [54, 55, 56]);
    }
    else {
      die = enemy.animations.add('enemyDeathAnim', [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42]);

      idleAnimDown = enemy.animations.add('idleAnimDown', [57, 58, 59]);
      idleAnimRight = enemy.animations.add('idleAnimRight', [72, 73, 74]);
      idleAnimUp = enemy.animations.add('idleAnimUp', [87, 88, 89]);
      idleAnimLeft = enemy.animations.add('idleAnimLeft', [114, 115, 116]);

      attackAnimDown = enemy.animations.add('attackAnimDown', [69, 70, 71]);
      attackAnimRight = enemy.animations.add('attackAnimRight', [84, 85, 86]);
      attackAnimUp = enemy.animations.add('attackAnimUp', [99, 100, 101]);
      attackAnimLeft = enemy.animations.add('attackAnimLeft', [102, 103, 104]);
    }
  }
  // Robot monster animations
  else {
    //enemyColor = Math.floor((Math.random() * 3) + 1);
    enemy = game.add.sprite(x, y,'robotMonster');
    robotOrBug = 0;

    die = enemy.animations.add('enemyDeathAnim', [378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 393, 394, 395, 396, 397]);

    idleAnimDown = enemy.animations.add('idleAnimDown', [186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205]);
    idleAnimRight = enemy.animations.add('idleAnimRight', [218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237]);
    idleAnimUp = enemy.animations.add('idleAnimUp', [282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300]);
    idleAnimLeft = enemy.animations.add('idleAnimLeft', [250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268]);

    attackAnimDown = enemy.animations.add('attackAnimDown', [207, 208, 209, 210]);
    attackAnimRight = enemy.animations.add('attackAnimRight', [239, 240, 241, 242]);
    attackAnimUp = enemy.animations.add('attackAnimUp', [302, 303, 304, 305]);
    attackAnimLeft = enemy.animations.add('attackAnimLeft', [270, 271, 272, 273]);
  }
  enemies.add(enemy);
  enemy.anchor.set(0.5);
  enemy.id = enemyID;
  enemy.isDead = false;
  enemyID++;
  enemies.set(enemy, 'health', 6);
  enemies.set(enemy, 'checkWorldBounds', true);
  enemy.body.setSize(45,115,45,4);

  // The enemy shooting delay
  enemy.readyToFire = true;
  game.time.events.loop(Phaser.Timer.SECOND / 2, prepareToShoot, this, enemy.id);

  // Create projectile array for the enemy
  enemyProj = game.add.group();
  enemyProj.enableBody = true;
  enemyProj.physicsBodyType = Phaser.Physics.ARCADE;
  // Create several projectiles for use
  if (game.global.station == 0) {
    enemyProj.createMultiple(2, 'bugMonsterBullet');
    enemyProj.setAll('frame', 5);
  }
  else {
    enemyProj.createMultiple(2, 'robotMonsterBullet');
    enemyProj.setAll('frame', 0);
  }
  // Execute the reset function for each projectile that goes out of the world bounds
  enemyProj.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', resetProjectile);
  enemyProj.callAll('anchor.setTo','anchor', 0.5, 1.0);
  enemyProj.callAll('anchor.setTo','anchor', 0.5, 0.5);
  enemyProj.setAll('checkWorldBounds', true);
  //enemyProjectiles.add(enemyProj);
  enemyProjectiles.push(enemyProj);
}

function prepareToShoot(id) {
  enemies.getAt(id).readyToFire = true;
}



function spawnPickup(x, y)
{
  var whichPickup = Math.floor((Math.random() * 2));

  if (whichPickup == 1)
  {
    healthPickup = healthPickups.create(x, y, 'healthPickup');
    console.log("Spawned health");
  }
  else
  {
    ammoPickup = ammoPickups.create(x, y, 'ammoPickup');
    console.log("Spawned ammo");
  }


}

function spawnPortal(x, y)
{
  portal = portals.create(x, y, 'portal');
  portal.animations.add('portalanim');
  portal.animations.play('portalanim', 50, true);
}

function portalEffect()
{
  if (enemies.total === 0)
  {
    var portalSound = game.add.audio('portal');
    portalSound.volume = 0.6;
    portalSound.play();
    startNewLevel();
  }

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
  game.global.station = Math.floor((Math.random() * 2));

  if (game.global.station == 1)
  {
    wall = "wall"+Math.floor((Math.random() * 4)+1);
    floor = "floor"+Math.floor((Math.random() * 6)+1);
  }
  else
  {
    wall = "planetwall"+Math.floor((Math.random() * 2)+1);
    floor = "planetfloor"+Math.floor((Math.random() * 4)+1);
  }
}

function randomizeLevelObjects()
{

  spawnPointsAmount = Math.floor((Math.random() * 7)+3);

  console.log('spawnpointsamount: ' + spawnPointsAmount);

  for (i = 0; i < spawnPointsAmount; i++)
  {
    spawnPoint = spawnPoints.create(0, 0, null);
  }
}

function addLevelSpawns()
{
  spawnPortal(spawnPoints.getAt(0).x, spawnPoints.getAt(0).y);
  for (i = 1; i < spawnPointsAmount; i++)
  {
    var whichObject = Math.floor((Math.random() * 5))
    if (whichObject <= 2)
    {
      spawnEnemy(spawnPoints.getAt(i).x, spawnPoints.getAt(i).y);
    }
    else
    {
      spawnPickup(spawnPoints.getAt(i).x, spawnPoints.getAt(i).y);
    }
  }
}

function createNewLevel()
{
  if (musicPlaying === false)
  {
    music.play();
    musicPlaying = true;
  }

  //Randomizes levels objects, must be done before creating level!
  randomizeLevelObjects();

  //Randomizes the levels sprites, this must be done before creating level!
  randomizeLevelSprites();

  //Level generation
  map = new Map(floor, wall, 2, 5, 10, player, spawnPoints);
  game.physics.game.world.setBounds(0, 0, 3000, 3000);
  mapwalls = map.walls;

  //Bring other sprites to top
  bringToTop();


  // Spawns
  addLevelSpawns();
}

//Basically it restarts the game, but gives an illusion that there's a new level
function startNewLevel()
{
  console.log(game.state.current);
  game.state.start(game.state.current);
}

function updateFog()
{
  var gradient = bmd.context.createRadialGradient(
    fogCircle.x - game.camera.x,
    fogCircle.y - game.camera.y,
    fogCircle.radius,
    fogCircle.x - game.camera.x,
    fogCircle.y - game.camera.y,
    fogCircle.radius - fringe
  );

  gradient.addColorStop(0, 'rgba(0,0,0,0.95');
  gradient.addColorStop(0.4, 'rgba(0,0,0,0.5');
  gradient.addColorStop(1, 'rgba(0,0,0,0');

  bmd.clear();
  bmd.context.fillStyle = gradient;
  bmd.context.fillRect(0, 0, 900, 900);
}
