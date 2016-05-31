// Global Variables
var
  game = new Phaser.Game(1024, 768, Phaser.AUTO, 'game'),
  gameOptions = {
    playSound: true,
    playMusic: true
  },
  musicPlayer;


var BasicGame = {
  score: 0,
  projectileCG: null,
  playerCG: null,
  selectedChar: null
};     // So called "parent" of all the states

BasicGame.Main = function() {

};

BasicGame.Main.prototype = {
  preload: function () {
    this.load.image('splashLogo', 'images/splash_logo.png');
    this.load.script('boot_scr',  'states/Boot.js');
  },

  create: function () {
    // Add only boot at this state, and start
    game.state.add('Boot', BasicGame.Boot);
    game.state.start('Boot');
  }

};

game.state.add('Main', BasicGame.Main);
game.state.start('Main');