BasicGame.MainGame = function (game) {
	this.gravity = 5000;
};

BasicGame.MainGame.prototype = {
	preload: function() {
		//console.log(BasicGame.score);		
		// Start physics
		this.physics.startSystem(Phaser.Physics.ARCADE);
		this.physics.arcade.gravity.y = this.gravity;

		// Set background color
		this.stage.backgroundColor = '#787878';

		// Add tilemap
		map = this.add.tilemap('map');					// 'map' must be same as the one in Boot.js
		map.addTilesetImage('sheet', 'tiles');			// 'sheet' must be the same also
		map.addTilesetImage('building_sheet', 'background_tiles');
		map.addTilesetImage('tiles_spritesheet', 'tiles_spritesheet');

		var background = map.createLayer('Background');	// 'Background' must be the same in the json file
		background.resizeWorld();
		background.wrap = true;

		layer = map.createLayer('Level 1');				// 'Level 1' must be the same in the json file
		layer.resizeWorld();
		layer.wrap = true;

		map.setCollisionBetween(0, 60, true, layer);	// Set collision layers between json tile representation
		map.setCollisionBetween(63, 99, true, layer);	

		this.physics.arcade.TILE_BIAS = 60;
	},

	create: function() {
		// Assign global groups
		BasicGame.playerCG = this.add.group();
		BasicGame.projectileCG = this.add.group();
		BasicGame.colliderCG = this.add.group();

		if (BasicGame.selectedChar == "player_destroyer") {
			this.player = new BasicGame.HeroDestroyer(this.game, 100, 1000, 0, false, 'player');	
		}
		if (BasicGame.selectedChar == "player_trooper") {
			this.player = new BasicGame.HeroTrooper(this.game, 100, 1000, 0, false, 'player');	
		}
		if (BasicGame.selectedChar == "player_walker") {
			this.player = new BasicGame.HeroWalker(this.game, 100, 1000, 0, false, 'player');	
		}
		if (BasicGame.selectedChar == "player_gunner") {
			this.player = new BasicGame.HeroGunner(this.game, 100, 1000, 0, false, 'player');	
		}
		// Instantiate new player
		//this.player = new BasicGame.HeroWalker(this.game, 100, 1000, 0, false, 'player');
		BasicGame.playerCG.add(this.player);

		// Follow player
		this.camera.follow(this.player);

	},

	update: function() {
		// Enable collision between player and layer
		this.physics.arcade.collide(BasicGame.playerCG, layer);
		this.physics.arcade.collide(BasicGame.projectileCG, layer, this.projectileCallback);
		this.physics.arcade.overlap(BasicGame.colliderCG, BasicGame.playerCG, this.colliderCallback);
	},

	render: function() {
		//game.debug.bodyInfo(this.player, 32, 32);
		//game.debug.body(this.player);
	},

	// Callback function for projectile collision
	projectileCallback: function(obj1, obj2) {
		//console.log('collide');
		obj1.onCollide();
	},

	// Callback function for collider collision
	colliderCallback: function(obj1, obj2) {
		obj1.onCollide(obj2);
	},

	updateHUD: function() {
	}
};