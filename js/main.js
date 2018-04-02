var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'gameDiv', { preload: preload, create: create, update: update, render: render });

function preload() 
{
    game.time.advancedTiming = true;
    game.load.image('wall', 'sprites/wall.png');
    game.load.image('floor', 'sprites/floor.png');
}


function create() 
{
    cursors = game.input.keyboard.createCursorKeys();
    space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);  

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
}

function update() 
{
    // If the space bar is being pressed, generate a new dungeon
    if ( space.isDown ) 
    {
        dungeonCreator.destroyMap();
        dungeonCreator.createMap();
    }

    // Scroll the camera up and down
    if (cursors.up.isDown)
    {
        game.camera.y -= 4;
    }
    else if (cursors.down.isDown)
    {
        game.camera.y += 4;
    }

    // Scroll the camera left and right
    if (cursors.left.isDown)
    {
        game.camera.x -= 4;
    }
    else if (cursors.right.isDown)
    {
        game.camera.x += 4;
    }

}

function render() 
{
	game.debug.text('FPS: ' + game.time.fps, 2, 14, "#00ff00");
}