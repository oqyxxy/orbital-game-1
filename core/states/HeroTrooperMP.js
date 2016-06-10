'use strict';
BasicGame.HeroTrooperMP = function (id, game, x, y) {
	Phaser.Sprite.call(this, game, x, y, 'player_trooper', 0);
	this.ID = id;
	console.log('creating trooper');

	this.cursor = {
		left: false,
		right: false,
		up: false,
		down: false,
		skillA: false,
		skillB: false,
		skillC: false,
		skillD: false,
		x: 0,
		y: 0
	}

	this.myInput = {
		left: false,
		right: false,
		up: false,
		down: false,
		skillA: false,
		skillB: false,
		skillC: false,
		skillD: false,
		x: 0,
		y: 0
	}

	this.anchor.setTo(0.5, 0.5);

	// Movement
	this.jumpCount = 0;
	this.jumpLimit = 2;
	this.jumpTimer = 0;
	this.jumpStrength = -1500;
	this.moveSpeed = 800;
	this.facingRight = 1;

	// Skills
	this.skillACooldown = 500;
	this.skillBCooldown = 500;
	this.skillCCooldown = 1000;
	this.skillDCooldown = 5000;	
	this.skillATimer = 0;
	this.skillBTimer = 0;
	this.skillCTimer = 0;
	this.skillDTimer = 0;

	// Set invidual scale and collider
	this.scaleX = 1;
	this.scaleY = 1;
	this.scale.x = this.scaleX;
	this.scale.y = this.scaleY;

	// Enable physics
	this.game.physics.arcade.enableBody(this);
	this.body.setSize(70, 130, -35, -10);
	this.body.maxVelocity.y = 3000;
	this.body.drag.x = 5000;

	// Animations
	this.animations.add('anim_idle', Phaser.Animation.generateFrameNames('Anim_Trooper_Idle_00', 0, 9), 16, true);
	this.animations.add('anim_run', Phaser.Animation.generateFrameNames('Anim_Trooper_Run_00', 0, 9), 16, true);
	this.animations.add('anim_thrust', Phaser.Animation.generateFrameNames('Anim_Trooper_Melee_00', 0, 9), 16, false);
	this.animations.add('anim_shoot', Phaser.Animation.generateFrameNames('Anim_Trooper_Shoot_00', 0, 9), 16, false);
	this.animations.add('anim_walkshoot', Phaser.Animation.generateFrameNames('Anim_Trooper_WalkShoot_00', 0, 9), 16, true);
	this.animations.add('anim_jump', Phaser.Animation.generateFrameNames('Anim_Trooper_Jump_00', 0, 9), 16, false);
	this.animations.add('anim_dead', Phaser.Animation.generateFrameNames('Anim_Trooper_Dead_00', 0, 9), 16, false);
	this.animations.add('anim_ultimate1', Phaser.Animation.generateFrameNames('Anim_Trooper_CrouchAim_00', 0, 9), 16, true);
	this.animations.add('anim_ultimate2', Phaser.Animation.generateFrameNames('Anim_Trooper_CrouchShoot_00', 0, 9), 16, false);

	// Keep track of animation
	this.jumpAnim = this.animations.getAnimation('anim_jump');
	this.thrustAnim = this.animations.getAnimation('anim_thrust');
	this.shootAnim = this.animations.getAnimation('anim_shoot');
	this.ultiAnim = this.animations.getAnimation('anim_ultimate2');

    this.isAttacking = false;

	// Add callback
	this.thrustAnim.onComplete.add(this.attackCallback, this);
	this.shootAnim.onComplete.add(this.shootCallback, this);
	this.ultiAnim.onComplete.add(this.shootCallback, this);

	// Each hero will have an effect object which basically plays whatever effect they have
	this.effect = new BasicGame.Effect(this.game, 100, 1000, 'blood_effect_sprite', false, 0);
	this.game.add.existing(this.effect);

	// Attack collider
    this.attackCollider = new BasicGame.Collider(this.game, this);
    this.game.add.existing(this.attackCollider);
    BasicGame.colliderCG.add(this.attackCollider);

    this.bulletGroup = this.game.add.group();
    for (var i = 0; i < 20; i++) {
    	var proj = new BasicGame.Projectile(this.game, 'bolt_effect_sprite', 1, this);
    	BasicGame.projectileCG.add(proj);
    }

	// Controls
	this.cursors = this.game.input.keyboard.createCursorKeys();
	this.skillA = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
	this.skillB = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
	this.skillC = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
	this.skillD = this.game.input.keyboard.addKey(Phaser.Keyboard.F);

	// Add this object into existing game
	this.game.add.existing(this);
	BasicGame.playerCG.add(this);

	this.refMP = this.game.state.states['Multiplayer'];
};

// Kind of like inherts Sprite
BasicGame.HeroTrooperMP.prototype = Object.create(Phaser.Sprite.prototype);
BasicGame.HeroTrooperMP.prototype.constructor = BasicGame.Player;

BasicGame.HeroTrooperMP.prototype.update = function() {
	this.handleControls();
	//this.game.debug.body(this);
};


BasicGame.HeroTrooperMP.prototype.handleControls = function() {
	// Sending input to server
	this.myInput.left = this.cursors.left.isDown;
	this.myInput.right = this.cursors.right.isDown;
	this.myInput.up = this.cursors.up.isDown;
	this.myInput.down = this.cursors.down.isDown;
	this.myInput.skillA = this.skillA.isDown;
	this.myInput.skillB = this.skillB.isDown;
	this.myInput.skillC = this.skillC.isDown;
	this.myInput.skillD = this.skillD.isDown;

	var myInputChanged = (
		this.cursor.left != this.myInput.left ||
		this.cursor.right != this.myInput.right ||
		this.cursor.up != this.myInput.up ||
		this.cursor.down != this.myInput.down ||
		this.cursor.skillA != this.myInput.skillA ||
		this.cursor.skillB != this.myInput.skillB ||
		this.cursor.skillC != this.myInput.skillC ||
		this.cursor.skillD != this.myInput.skillD
	);

	if (myInputChanged) {
		if (this.ID == this.refMP.myID) {
			this.myInput.x = this.x;
			this.myInput.y = this.y;

			this.refMP.eurecaServer.handleKeys(this.myInput);
		}
	}

	// Local client
	if (this.cursor.left && !this.isAttacking) {		
		this.facingRight = -1;
    	this.scale.x = -this.scaleX;
    	this.body.offset.x = 35;
		this.body.velocity.x = -this.moveSpeed;

		if (this.body.onFloor()) {
			this.animations.play('anim_run');	
		}
	} else if (this.cursor.right && !this.isAttacking) {
		this.facingRight = 1;
    	this.scale.x = this.scaleX;
    	this.body.offset.x = -35;
		this.body.velocity.x = this.moveSpeed;
		
		if (this.body.onFloor()) {
			this.animations.play('anim_run');	
		}
	}
	// If jump is pressed, body is on floor, and jump timer is over&& this.body.onFloor()
 	if (this.cursor.up  && this.game.time.now > this.jumpTimer && this.jumpCount < this.jumpLimit && !this.isAttacking)
    {
    	if (this.jumpCount > 0) {
    		//this.animations.stop(null, true);
    		this.jumpAnim.frame = 0;
    	}
    	//console.log("jump");
        this.body.velocity.y = this.jumpStrength;
        this.jumpTimer = this.game.time.now + 350;
		this.animations.play('anim_jump');
		this.jumpCount++;
    }
    // Idle | if not moving and on the floor
    else if (this.body.velocity.x == 0 && this.body.onFloor()  && !this.isAttacking) {
    	this.animations.play('anim_idle');
    	this.jumpCount = 0;
    } 
    else if (this.body.onFloor()) {
    	this.jumpCount = 0;
    }

    // Handle skills
    this.handleSkillA();
    this.handleSkillB();
    this.handleSkillC();
    this.handleSkillD();
};

BasicGame.HeroTrooperMP.prototype.handleSkillA = function() {
	if (this.cursor.skillA && this.game.time.now > this.skillATimer) {
		var skillTween = this.game.add.tween(this.body.velocity);
		skillTween.to({x: 1500 * this.facingRight}, 250, Phaser.Easing.Cubic.Out);
		skillTween.start();

    	// Play the animation
    	this.animations.play('anim_thrust');
    	this.animations.currentAnim.frame = 0;
		this.isAttacking = true;
		this.skillATimer = this.game.time.now + this.skillACooldown; 
		this.attackCollider.activate();   
	}
};

BasicGame.HeroTrooperMP.prototype.handleSkillB = function() {
	if (this.cursor.left && this.cursor.skillB) {
		this.facingRight = -1;
    	this.scale.x = -this.scaleX;
    	this.body.offset.x = 35;
		this.body.velocity.x = -this.moveSpeed;

		if (this.body.onFloor()) {
			this.animations.play('anim_walkshoot');
		}
		
	} else if (this.cursor.right && this.cursor.skillB) {
		this.facingRight = 1;
    	this.scale.x = this.scaleX;
    	this.body.offset.x = -35;
		this.body.velocity.x = this.moveSpeed;
		
		if (this.body.onFloor()) {
			this.animations.play('anim_walkshoot');	
		}
	} else {
		
	}
	if (this.cursor.skillB && this.game.time.now > this.skillBTimer) {
		this.animations.play('anim_shoot');
		this.skillBTimer = this.game.time.now + this.skillBCooldown;
		BasicGame.projectileCG.getFirstExists(false).play('anim_1', this, 1000, 0, 0, 100, 0);
	}

	//console.log(BasicGame.projectileCG.getFirstExists(false));
	//BasicGame.projectileCG.getFirstExists(false).play('anim_1', this, 1000, 0, 0, 100, 0);
};

BasicGame.HeroTrooperMP.prototype.handleSkillC = function() {
	if (this.cursor.skillC && this.game.time.now > this.skillCTimer) {
    	// Play the animation
    	this.animations.play('anim_shoot');
    	this.animations.currentAnim.frame = 0;
		this.isAttacking = true;
		this.skillCTimer = this.game.time.now + this.skillCCooldown; 
		
		// Projectile variables
		var shootAmt = 3;
		var velX = 750;
		var velY = 500;
		var angle = 30;
		var offsetX = 150;
		var offsetY = 50;

    	var ref = this;
    	var tween = this.game.add.tween(this).to({0: 0}, 100, Phaser.Easing.Linear.None, true, 200, shootAmt);
    	tween.onStart.add(function() {
    		tween.delay(0);
    	});
    	tween.onRepeat.add(function() {
    		BasicGame.projectileCG.getFirstExists(false).play('anim_4', ref, velX, -velY, -angle, offsetX, -offsetY);
    		BasicGame.projectileCG.getFirstExists(false).play('anim_4', ref, velX, velY, angle, offsetX, offsetY);
    	});
	}
};

BasicGame.HeroTrooperMP.prototype.handleSkillD = function() {
	if (this.cursor.skillD && this.game.time.now > this.skillDTimer) {
    	// Play the animation
		this.isAttacking = true;
		this.skillDTimer = this.game.time.now + this.skillDCooldown; 

    	// Projectile variables
		var repeat = 0;
		var velX = 1500;
		var velY = 0;
		var angle = 0;
		var offsetX = 50;
		var offsetY = 0;

    	var ref = this;
    	var tween = this.game.add.tween(this).to({0: 0}, 1000, Phaser.Easing.Linear.None, true, 200, repeat);
    	tween.onStart.add(function() {
    		ref.animations.play('anim_ultimate1');
    		ref.animations.currentAnim.frame = 0;
    		tween.delay(1000);
    	});
    	tween.onComplete.add(function() {
    		ref.animations.play('anim_ultimate2');
    		ref.animations.currentAnim.frame = 0;
    		BasicGame.projectileCG.getFirstExists(false).play('anim_1', ref, velX, -velY, angle, offsetX, offsetY);
    	});
	}
};

BasicGame.HeroTrooperMP.prototype.kill = function() {
	this.destroy();
};

BasicGame.HeroTrooperMP.prototype.attackCallback = function() {
	this.isAttacking = false;
	this.attackCollider.deactivate();
};

BasicGame.HeroTrooperMP.prototype.shootCallback = function() {
	this.isAttacking = false;
};

BasicGame.HeroTrooperMP.prototype.getHit = function() {
	this.effect.play('anim_4', this);
};