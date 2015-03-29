(function() {
	if (typeof Mario === 'undefined')
		window.Mario = {};

	var Player = Mario.Player = function(pos) {
		//I know, I know, there are a lot of variables tracking Mario's state.
		//Maybe these can be consolidated some way? We'll see once they're all in.
		this.power = 0;
		this.coins = 0;
		this.powering = this.damaging = [];
		this.bounce = false;
		this.jumping = 0;
		this.canJump = true;
		this.invincibility = 0;
		this.crouching = false;
		this.fireballs = 0;
		this.runheld = false;

		Mario.Entity.call(this, {
			pos: pos,
			sprite: new Mario.Sprite('sprites/player.png',[80,32],[16,16],0),
			hitbox: [0,0,16,16]
		});
	};

	Mario.Util.inherits(Player, Mario.Entity);

	Player.prototype.run = function() {
		this.maxSpeed = 2.5;
		if (this.power == 2 && !this.runheld) {
			this.shoot();
		}
		this.runheld = true;
	}

	Player.prototype.shoot = function() {
		if (this.fireballs >= 2) return; //Projectile limit!
		this.fireballs += 1;
		var fb = new Mario.Fireball([this.pos[0]+8,this.pos[1]]); //I hate you, Javascript.
		fb.spawn(this.left);
		this.shooting = 2;
	}

	Player.prototype.noRun = function() {
		this.maxSpeed = 1.5;
		this.moveAcc = 0.07;
		this.runheld = false;
	}

	Player.prototype.moveRight = function() {
		//we're on the ground
		if (this.vel[1] === 0 && this.standing) {
			if (this.crouching) {
				this.noWalk();
				return;
			}
			this.acc[0] = this.moveAcc;
			this.left = false;
		} else {
			this.acc[0] = this.moveAcc;
		}
	};

	Player.prototype.moveLeft = function() {
		if (this.vel[1] === 0 && this.standing) {
			if (this.crouching) {
				this.noWalk();
				return;
			}
			this.acc[0] = -this.moveAcc;
			this.left = true;
		} else {
			this.acc[0] = -this.moveAcc;
		}
	};

	Player.prototype.noWalk = function() {
		this.maxSpeed = 0;
		if (this.vel[0] === 0) return;

		if (Math.abs(this.vel[0]) <= 0.1) {
			this.vel[0] = 0;
			this.acc[0] = 0;
		}

	};

	Player.prototype.crouch = function() {
		if (this.power === 0) {
			this.crouching = false;
			return;
		}

		if (this.standing) this.crouching = true;
	}

	Player.prototype.noCrouch = function() {
		this.crouching = false;
	}

	Player.prototype.jump = function() {
		if (this.vel[1] > 0) {
			return;
		}
		if (this.jumping) {
			this.jumping -= 1;
		} else if (this.standing && this.canJump) {
			this.jumping = 20;
			this.canJump = false;
			this.standing = false;
			this.vel[1] = -6;
		}
	};

	Player.prototype.noJump = function() {
		this.canJump = true;
		if (this.jumping) {
			if (this.jumping <= 16) {
				this.vel[1] = 0;
				this.jumping = 0;
			} else this.jumping -= 1;
		}
	};

  Player.prototype.setAnimation = function() {
		if (this.starTime) {
			var index;
			if (this.starTime > 60)
				index = Math.floor(this.starTime / 2) % 3;
			else index = Math.floor(this.starTime / 8) % 3;

			this.sprite.pos[1] = level.invincibility[index];
			if (this.power == 0) {
				this.sprite.pos[1] += 32;
			}
			this.starTime -= 1;
			if (this.starTime == 0) {
				switch(this.power) {
					case 0: this.sprite.pos[1] = 32; break;
					case 1: this.sprite.pos[1] = 0; break;
					case 2: this.sprite.pos[1] = 96; break;
				}
			}
		}
		//okay cool, now set the sprite
		if (this.crouching) {
			this.sprite.pos[0] = 176;
			this.sprite.speed = 0;
			return;
		}
    if (this.jumping) {
			this.sprite.pos[0] = 160;
			this.sprite.speed = 0;
		} else if (this.standing) {
			if (Math.abs(this.vel[0]) > 0) {
				if (this.vel[0] * this.acc[0] >= 0) {
					this.sprite.pos[0] = 96;
					this.sprite.frames = [0,1,2];
					if (this.vel[0] < 0.2) {
						this.sprite.speed = 5;
					} else {
						this.sprite.speed = Math.abs(this.vel[0]) * 8;
					}
				} else if ((this.vel[0] > 0 && this.left) || (this.vel[0] < 0 && !this.left)){
					this.sprite.pos[0] = 144;
					this.sprite.speed = 0;
				}
			} else {
				this.sprite.pos[0] = 80;
				this.sprite.speed = 0;
			}
			if (this.shooting) {
				this.sprite.pos[0] += 160;
				this.shooting -= 1;
			}
		}

		//which way are we facing?
		if (this.left) {
			this.sprite.img = 'sprites/playerl.png';
		} else {
			this.sprite.img = 'sprites/player.png';
		}
  };

	Player.prototype.update = function(dt, vX) {
		if (this.powering.length !== 0) {
			var next = this.powering.shift();
			if (next == 5) return;
			this.sprite.pos = this.powerSprites[next];
			this.sprite.size = this.powerSizes[next];
			this.pos[1] += this.shift[next];
			if (this.powering.length === 0) {
				delete level.items[this.touchedItem];
			}
			return;
		}

		if (this.invincibility) {
			this.invincibility -= Math.round(dt * 60);
		}

		if (this.bounce) {
			this.bounce = false;
			this.standing = false;
			this.vel[1] = -3;
		}

		if (this.pos[0] <= vX) {
			this.pos[0] = vX;
			this.vel[0] = Math.max(this.vel[0], 0);
		}

		if (Math.abs(this.vel[0]) > this.maxSpeed) {
			this.vel[0] -= 0.05 *  this.vel[0] / Math.abs(this.vel[0]);
			this.acc[0] = 0;
		}

		this.acc[1] = 0.25

		if (this.piping) {
			this.acc = [0,0];
			var pos = [Math.round(this.pos[0]), Math.round(this.pos[1])]
			if (pos[0] === this.targetPos[0] && pos[1] === this.targetPos[1]) {
				this.piping = false;
				this.pipeLoc.call();
			}
		}

		//approximate acceleration
		this.vel[0] += this.acc[0];
		this.vel[1] += this.acc[1];
		this.pos[0] += this.vel[0];
		this.pos[1] += this.vel[1];

		if (this.pos[1] > 240) {
			this.die();
		}

    this.setAnimation();
		this.sprite.update(dt);
	};

	Player.prototype.checkCollisions = function() {
		if (this.piping) return;
		//x-axis first!
		var h = this.power > 0 ? 2 : 1;
		var w = 1;
		if (this.pos[1] % 16 !== 0) {
			h += 1;
		}
		if (this.pos[0] % 16 !== 0) {
			w += 1;
		}
		var baseX = Math.floor(this.pos[0] / 16);
		var baseY = Math.floor(this.pos[1] / 16);

		for (var i = 0; i < h; i++) {
			if (baseY + i < 0 || baseY + i >= 15) continue;
			for (var j = 0; j < w; j++) {
				if (baseY < 0) { i++;}
				if (level.statics[baseY + i][baseX + j]) {
					level.statics[baseY + i][baseX + j].isCollideWith(this);
				}
				if (level.blocks[baseY + i][baseX + j]) {
					level.blocks[baseY + i][baseX + j].isCollideWith(this);
				}
			}
		}
	};

	Player.prototype.powerUp = function(idx) {
	  this.powering = [0,5,2,5,1,5,2,5,1,5,2,5,3,5,1,5,2,5,3,5,1,5,4];
		this.touchedItem = idx;

		if (this.power === 0) {
			this.sprite.pos[0] = 80;
			var newy = this.sprite.pos[1] - 32;
			this.powerSprites = [[80, newy+32], [80, newy+32], [320, newy], [80, newy], [128, newy]];
			this.powerSizes = [[16,16],[16,16],[16,32],[16,32],[16,32]];
			this.shift = [0,16,-16,0,-16];
			this.power = 1;
			this.hitbox = [0,0,16,32];
		} else if (this.power == 1) {
			var curx = this.sprite.pos[0];
			this.powerSprites = [[curx, 96], [curx, level.invincibility[0]],
				[curx, level.invincibility[1]], [curx, level.invincibility[2]],
				[curx, 96]];
			this.powerSizes[[16,32],[16,32],[16,32],[16,32],[16,32]];
			this.shift = [0,0,0,0,0];
			this.power = 2;
		} else {
			//no animation, but we play the sound and you get 5000 points.
		}
	};

	Player.prototype.damage = function() {
		if (this.power === 0) { //if you're already small, you dead!
			this.die();
		} else { //otherwise, you get turned into small mario
			this.powering = [0,5,1,5,2,5,1,5,2,5,1,5,2,5,1,5,2,5,1,5,2,5,3];
			this.shift = [0,16,-16,16];
			this.sprite.pos = [160, 0];
			this.powerSprites = [[160,0], [240, 32], [240, 0], [160, 32]];
			this.powerSizes = [[16, 32], [16,16], [16,32], [16,16]];
			this.invincibility = 120;
			this.power = 0;
			this.hitbox = [0,0,16,16];
		}
	};

	//TODO: death animation, etc.
	Player.prototype.die = function () {
		level.loader.call();
		vX = 0;
	};

	Player.prototype.star = function(idx) {
		delete level.items[idx];
		this.starTime = 660;
	}

	Player.prototype.pipe = function(direction, destination) {
		var shift = 64;
		this.piping = true;
		this.pipeLoc = destination;
		switch(direction) {
			case "LEFT":
				this.vel = [-1,0];
				this.targetPos = [Math.round(this.pos[0]-shift), Math.round(this.pos[1])]
				break;
			case "RIGHT":
				this.vel = [1,0];
				this.targetPos = [Math.round(this.pos[0]+shift), Math.round(this.pos[1])]
				break;
			case "DOWN":
				this.vel = [0,1];
				this.targetPos = [Math.round(this.pos[0]), Math.round(this.pos[1]+shift)]
				break;
			case "UP":
				this.vel = [0,-1];
				this.targetPos = [Math.round(this.pos[0]), Math.round(this.pos[1]-shift)]
				break;
		}

	}
})();
