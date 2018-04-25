//Code that boots the game go here
//example: Start the game, preload objects, but NO gameplay code!

var bootGame = function(game) {};

bootGame.prototype.create = function() 
{
    console.log("Booting game");

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.state.start("loadGame");
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    game.stage.backgroundColor = "#007f5f";


    //fps
    game.time.advancedTiming = true;



}

bootGame.prototype.preload = function() {}