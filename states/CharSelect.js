BasicGame.CharSelect = function (game) {
	this.offset = 250;
	this.charCount = 0;
	this.startGame = null;
	this.gray = null;
	this.isClicked = null;
	this.multiplayer = false;
	this.loaded = false;
	this.charArr = new Array(4);
	this.textContainer = {};
};

BasicGame.CharSelect.prototype = {
	init: function(multiplayer) {
		// On init, check if player has chose multiplayer
		this.multiplayer = multiplayer;
		this.charCount = 0;

		this.background = this.add.sprite(0, 0, 'menu_background');
		this.background.height = this.game.height;
		this.background.width = this.game.width;
	},

	resetFilter: function() {
		for (var i=0; i<this.charArr.length; i++) {
			this.charArr[i].filters = [this.gray];
		}
	},

	// On over style
	onOver: function(target) {
		target.filters = null;
	},
 
	// On out style
	onOut: function (target) {
		this.resetFilter(target);
		if (this.isClicked != null) {
			this.isClicked.filters = null;
		}
	},

	// On click
	onClick: function (target) {
		BasicGame.eurecaServer.getTeamSelection(BasicGame.roomID, BasicGame.myTeam, target.key, BasicGame.myID); // sends input to all other clients
		this.resetFilter(target);
		this.isClicked = target; // chosen character information is stored into this.isClicked
		target.filters = null; // highlight chosen character
		//target.animations.play('anim_attack');
		//target.animations.currentAnim.onLoop.add(function() { 
		//	target.animations.play('anim_idle');
		//});
		var selected = 'player_' + target.key.substring(0, target.key.length - 9);
		console.log(selected);
		BasicGame.selectedChar = selected;
	},

	addCharacter: function(spriteName) {
		// This way looks nicer but is more expensive and takes longer to load
		var char = this.add.sprite(30 + this.offset * this.charCount, 0, spriteName);
		//console.log(spriteName + " " + char.height + " " + char.width);

		// To get the correct prefix for each character
		var animName = "";
		if (spriteName == 'player_destroyer') {
			animName = "Anim_Destroyer_";
			char.y += 10;
		}
		if (spriteName == 'player_trooper') {
			animName = "Anim_Trooper_";
			char.x += 120;
			char.y += 10000;
		}
		if (spriteName == 'player_walker') {
			animName = "Anim_Walker_";
			char.x += 50;
			char.y += 2000;
		}
		if (spriteName == 'player_gunner') {
			animName = "Anim_Gunner_";
			char.x += 110;
			char.y += 7500;
		}

		// Add animation and play
		char.animations.add('anim_idle', Phaser.Animation.generateFrameNames(animName + 'Idle_00', 0, 9), 16, true);
		//char.animations.add('anim_attack', Phaser.Animation.generateFrameNames(animName + 'Shoot_00', 0, 10), 16, true);
		char.animations.play('anim_idle');

		this.charArr[this.charCount] = char;

		// Set input functions
		//char.inputEnabled = true;
		//char.events.onInputUp.add(this.onClick, this);
		//char.events.onInputOver.add(this.onOver, this);
		//char.events.onInputOut.add(this.onOut, this);

		this.charCount++;
	},

	preload: function() {
		var ref = this;
		//this.loaded = true;
		this.gray = this.game.add.filter('Gray');

		console.log('called');

		BasicGame.eurecaClient.exports.loadTeamChar = function(teamArr) {
			// clear existing text
			for (var idx in ref.textContainer) {
				ref.textContainer[idx].destroy();
			}
			ref.textContainer = {};

			// Update with new text
			var textColorDefault = {font: '14pt myfont', align: 'center', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"};
			var plCounter = 0;

			for (var i=0; i<teamArr.length; i++) {
				if (teamArr[i][2] != BasicGame.myID) {
					plCounter++;
					var selChar = (teamArr[i][1] == null) ? "None" : (teamArr[i][1] == "player_destroyer") ? "Destroyer"
																	: (teamArr[i][1] == "player_trooper") ? "Ace"
																	: (teamArr[i][1] == "player_walker") ? "Walker"
																	: (teamArr[i][1] == "player_gunner") ? "Disruptor"
																	: "None";
					ref.textContainer[i + " 1"] = ref.add.text(100, ref.world.height / 2 + 20 + (plCounter * 25),  teamArr[i][0] + " has selected: " + selChar, textColorDefault);
				}
			}
		}

		// Just use factory function
		this.addCharacter('player_destroyer');
		this.addCharacter('player_trooper');
		this.addCharacter('player_walker');
		this.addCharacter('player_gunner');
		this.resetFilter();
		this.isClicked = null;

		this.destroyer = this.game.add.image(500, 0, 'destroyer_portrait');
		this.destroyer.inputEnabled = true;
		this.destroyer.events.onInputUp.add(this.onClick, this);
		this.destroyer.events.onInputOver.add(this.onOver, this);
		this.destroyer.events.onInputOut.add(this.onOut, this);

		this.walker = this.game.add.image(670, 35, 'walker_portrait');
		this.walker.inputEnabled = true;
		this.walker.events.onInputUp.add(this.onClick, this);
		this.walker.events.onInputOver.add(this.onOver, this);
		this.walker.events.onInputOut.add(this.onOut, this);

		this.gunner = this.game.add.image(450, 150, 'gunner_portrait');
		this.gunner.inputEnabled = true;
		this.gunner.events.onInputUp.add(this.onClick, this);
		this.gunner.events.onInputOver.add(this.onOver, this);
		this.gunner.events.onInputOut.add(this.onOut, this);

		this.trooper = this.game.add.image(572, 142, 'trooper_portrait');
		this.trooper.inputEnabled = true;
		this.trooper.events.onInputUp.add(this.onClick, this);
		this.trooper.events.onInputOver.add(this.onOver, this);
		this.trooper.events.onInputOut.add(this.onOut, this);

		// Add start game button
		var optionStyle = {font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"};
		if (ref.multiplayer) {
			var joinTxt = "Enter Game!";
		} else {
			var joinTxt = "Start Game";
		}
		//this.add.text(400, 300, "Arrow keys for controls, \nA,S,D,F for skills", optionStyle);
		
		this.add.text(100, 250, "Destroyer", optionStyle);
		this.add.text(100, 300, "Skill descriptions", optionStyle);
		this.add.text(1000, 50, "Team", optionStyle);
		//this.add.text(900, 600, "Ultimate skill", optionStyle);

		this.returnMenu = this.add.text(this.world.width - this.world.width/1.08, this.world.height - 110,  "Back", optionStyle);
		this.startGame = this.add.text(this.world.width - this.world.width/3.5, this.world.height - 110,  joinTxt, optionStyle);
		this.startGame.inputEnabled = true; 
		this.returnMenu.inputEnabled = true;
		this.returnMenu.events.onInputOver.add(BasicGame.onOver);
		this.returnMenu.events.onInputOut.add(BasicGame.onOut);
		this.startGame.events.onInputOver.add(BasicGame.onOver);
		this.startGame.events.onInputOut.add(BasicGame.onOut);

		// Back button clicked
		if (ref.multiplayer) {
			this.returnMenu.events.onInputUp.add(function() {
				BasicGame.eurecaServer.destroyRoomLink(ref.roomID, BasicGame.myID); // destroy connection
				BasicGame.eurecaServer.updateLobbyRoom(ref.roomID); // update the rest of the clients after connection is destroyed
				ref.game.state.start("LobbyMulti", true);
			});
		} else {
			this.returnMenu.events.onInputUp.add(function() {
				ref.game.state.start("MainMenu", true);
			});
		}

		// Start game button clicked
		this.startGame.events.onInputUp.add(function() {
			if (BasicGame.selectedChar != null && !ref.multiplayer) {
				// If not multiplayer, then start main game
				this.game.state.start("MainGame");
			} else if (BasicGame.selectedChar != null && ref.multiplayer) {
				// Go into multiplayer
				this.game.state.start("Multiplayer");
			}
		});

		// Multiplayer Add-on
		if (ref.multiplayer) {
			BasicGame.eurecaServer.getTeamSelection(BasicGame.roomID, BasicGame.myTeam, null, BasicGame.myID);
		}

	},

	create: function() {
	},

	update: function() {
	}
};