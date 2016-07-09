BasicGame.MainMenu = function (game) {
	// Game title, just edit from here
	this.gameTitle = "Zero+";
};

BasicGame.MainMenu.prototype = {
	preload: function() {
		if (BasicGame.musicPlayer == null) {
			BasicGame.musicPlayer = this.add.audio('titleMusic');	// Add music, titleMusic is defined in Boot.js
			BasicGame.musicPlayer.volume = 0.0;						// Volume
			BasicGame.musicPlayer.loop = true;						// Loop
			BasicGame.musicPlayer.play();							// Play the music
		}

		this.world.setBounds(0, 0, BasicGame.gameWidth, BasicGame.gameHeight);

		// Add background in
		this.background = this.add.sprite(0, 0, 'menu_background');
		this.background.height = this.game.height;
		this.background.width = this.game.width;

		// Add title, takes in font size, x, y, string, text styles
		this.title = this.add.text(50, this.world.height/6, this.gameTitle, {font: "60pt myfont", fill: 'white', align: 'right'});
		this.title.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
		this.title.anchor.set(0, 0.5);

		this.add.text(50, 200, "There will be bugs because every commit is updated here \nI should probably get around to separating branches but I'm lazy" + 
								"\nStart Game won't work for now \nAll other robots but the blue one are still being restructed",  
					 { font: '20pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"});


		// Set default option count for factory function
		this.optionCount = 1;
	},

	create: function () {
		var ref = this;
		this.addMenuOption('Start Game', function (target) {
			// Move to character select screen, last parameter is to determine if it's multiplayer or not
			this.game.state.start('CharSelect', true, false, false);
		});
		this.addMenuOption('Multiplayer', function (target) {
			if (nicknameInput.value == '') {
				// ask for nickname input
				ref.add.text(ref.world.width/4 - 35, ref.world.height/2 + 50, "Enter a name to go multiplayer!", 
					{font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "red"});
			} else {
				this.game.state.start('LobbyMulti', true, false, nicknameInput.value);
			}
		});
		this.addMenuOption('Options', function (target) {
			this.game.state.start('Options', true);
		});
		this.addMenuOption('Credits', function (target) {
			this.game.state.start('Credits', true);
		});
		/*
		this.addMenuOption('Lobby Test', function (target) {
			if (nicknameInput.value == '') {
				// ask for nickname input
				ref.add.text(ref.world.width/4 - 35, ref.world.height/2 + 50, "Enter a name to go multiplayer!", 
					{font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "red"});
			} else {
				this.game.state.start('LobbyMulti', true, false, nicknameInput.value);
			}
		});
		*/

		// for full API, go to : https://github.com/orange-games/phaser-input
		var nicknameInput = game.add.inputField(this.world.width/3, this.world.height/2, {
			font: '24px Arial',
			fill: '#212121',
			fontWeight: 'bold',
			width: 427,
			height: 30,
			padding: 8,
			borderWidth: 1,
			borderColor: '#000',
			borderRadius: 6,
			max: 18,
			placeHolder: 'Enter your nickname',
		});

		nicknameInput.value = (nicknameInput.value == '') ? 'moon moon wow!' : nicknameInput.value; // DELETE WHEN NOT IN DEVELOPMENT!
	},

	update: function () {
	},

	startGame: function (pointer) {
		//	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
		this.music.stop();

		//	And start the actual game
		this.state.start('Game');

	},

	// Factory function that lets you add options easily
	addMenuOption: function(text, callback) {
		// Set default text
		var optionStyle = { font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"};
		var txt = this.add.text(this.world.width - this.world.width/4, this.world.height/1.5 + this.optionCount * 40, text, optionStyle);

		// Default style
		txt.stroke = "rgba(0,0,0,0)";
		txt.strokeThickness = 4;
		txt.inputEnabled = true;
		txt.events.onInputUp.add(callback);
		txt.events.onInputOver.add(BasicGame.onOver);
		txt.events.onInputOut.add(BasicGame.onOut);
		this.optionCount ++;
	}
};