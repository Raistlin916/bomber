(function( exports ){
	var spriteFactory = exports.spriteFactory
	, sheetMaker = exports.sheetMaker
	, unitFactory = exports.unitFactory
	, Grid = exports.Grid
	, foil = exports.foil;

	var userSprite = spriteFactory.build('normal', {
		right: sheetMaker.row(0,42,42,4),
		left:  sheetMaker.row(0,126,42,4),
		up: sheetMaker.row(0,0,42,4),
		down: sheetMaker.row(0,84,42,4)
	}, 42, 42 );
	userSprite.effect(function(dt, prop) {
		var ctx = prop.ctx;
		ctx.translate(0, -5);
	});
	userSprite.state = function(type) {
		if(type == 'death'){
			var imgData = this.getImageData()
			,	effect = particleEffects.create('b', imgData, 42, 42, {fade: 2});
			userSprite.effect(function(dt, prop){
				var ctx = prop.ctx;
				effect.play(ctx, dt, -21, -26);
				return false;
			});
		}
	}
	userSprite.to('right');


	var bombSprite = spriteFactory.build('bomb', {
		breath: sheetMaker.col(0,0,64,9)
	}, 64, 64, 1);
	bombSprite.effect(function(dt, prop){
		var s = Math.abs(.3*Math.sin(prop.elapse*3)) + .7
		, ctx = prop.ctx;
		ctx.translate(-3, -3);
		ctx.scale(s, s);
	});
	bombSprite.size(40, 40).to('breath');
	
	function ease(t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	}

	var explosionSprite = spriteFactory.build('explosion', {
		stamen: [[0,0]],
		petal: [[32,0]],
		extremity: [[64,0]]
	}, 32, 32);
	explosionSprite.effect(function(dt, prop){
		var n = 4, sp = prop.spread, t, drawPiece = prop.drawPiece
		, ctx = prop.ctx;

		var s = ease(prop.elapse,1,-.6,.4);
		while (n--) {
			if (sp[n] == -1) {
				continue;
			}
			ctx.save();
			ctx.rotate(Math.PI/2*(n-1));
			ctx.translate(-32*(1-s), 0);
			ctx.scale(1, s);
			t = sp[n];
			while (t--) {
				ctx.translate(32, 0);
				drawPiece('petal');
			}
			if (prop.power == sp[n]) {
				ctx.translate(32, 0);
				drawPiece('extremity');
			}
			ctx.restore();
		}
		ctx.scale(s, s);
	});
	explosionSprite.size(32, 32).to('stamen');


	var spriteMap = {
		bomb: bombSprite,
		user: userSprite,
		explosion: explosionSprite
	}
	var actionMap = {
		bomb: function (ins, prop) {
			var delay = .03, power = 3;

			prop.power = power;
			ins.explode = function (spread) {
				if( !ins.live ){
					return;
				}
				var us, l, u, p, a, t, pf, rpf
				, sp = spread || [power,power,power,power];
				
				
				us = gridStore.sniffing(gridStore.cool(ins.pos()), [power+1,power+1]);
				l = us.length;
				while( l-- ){
					u = us[l];
					if( u!= ins && u.type == 'bomb' && u.live && !u.ignited ){
						a = gridStore.offset(ins.pos(), u.pos());
						pf = foil.phase(a);
						// 引爆被触发的炸弹
						!function(u, pf){
							u.after(Math.max.apply(null, pf)*delay, function(){
								// 引爆，传入被阻挡的情况
								u.explode(pf.map(function(i){
									return i==0? power: -1;
								}));
							});
							u.ignited = true;
						}(u, pf);

						// 计算火花形状
						rpf = foil.reverse(pf);
						sp = sp.map(function(u, i){
							return rpf[i]<u && rpf[i] ? rpf[i] : u;
						});
					}
					if(u.type == 'player' && u.live){
						u.hit();
					}

				}

				ins.destroy();
				p = gridStore.format(ins.pos());
				prop.spread = sp;
				unitFactory.build('explosion', p, prop );
			}
			ins.when( 2, function(){
				ins.explode();
			});
		},
		explosion: function( ins, prop ){
			ins.when( .4, function(){
				ins.destroy();
			});
		}
	}

	function GridStore(){
		Grid.apply(this, arguments);
		this.store = [];
	}
	GridStore.prototype = Object.create(Grid.prototype);
	GridStore.prototype.depository = function(){
		return this.store;
	}
  GridStore.prototype.offset = function (spos, dpos) {
    return [parseInt((spos[0]-dpos[0])/this.size[0]),
          parseInt((spos[1]-dpos[1])/this.size[1])];
  }
	GridStore.prototype.sniffing = function (tCool, tRange) {
		var cool, self = this;
		return this.store.filter(function(u){
			cool = self.cool(u.pos());
			return tCool[0] - tRange[0] <= cool[0] &&
				tCool[0] + tRange[0] >= cool[0] &&
				tCool[1] == cool[1] ||
				tCool[1] -	tRange[1] <= cool[1] &&
				tCool[1] + tRange[1] >= cool[1] &&
				tCool[0] == cool[0]
		});
	}

	var gridStore = new GridStore([32,32],[15,15]);

	unitFactory.bind( spriteMap, actionMap, gridStore.depository() );

	exports.GridStore = GridStore;
	exports.gridStore = gridStore;
	exports.spriteMap = spriteMap;
})( bomb );