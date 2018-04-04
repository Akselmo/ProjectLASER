var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'gameDiv', { preload: preload, create: create, update: update, render: render });
var mouseTouchDown = false;

function preload()
{
    game.time.advancedTiming = true;
    game.load.image('wall', 'sprites/wall.png');
    game.load.image('floor', 'sprites/floor.png');
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

    // Initialise the Dungeon Creation Plugin
    dungeonCreator = game.plugins.add(Phaser.Plugin.DungeonCreator);

    // At minimum define the sprite keys you would like to use for the walls and floor of the dungeon
    //Tilesize needs to be changed in the dungeon-generator.min.js file, otherwise it'll crash
    var dungeonParams =
    {
        'wall' : 'wall',
        'floor' : 'floor',
        'map_size_x' : '2200',
        'map_size_y' : '2200'
    };

    // Set some parameters for your required Dungeon
    dungeonCreator.setupDungeon( dungeonParams );

    // Actually the Dungeon
    dungeonCreator.createMap();




    // Create player

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


}



function update()
{
    // If the space bar is being pressed, generate a new dungeon
    if ( space.isDown )
    {
        dungeonCreator.destroyMap();
        dungeonCreator.createMap();
    }





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
