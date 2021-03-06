"use strict";

app.run(function(require, exports, module){
	var component = require('component')
	, parts = require('parts')
	, loader = require('loader');

	
	var spriteFactory = component.spriteFactory
		, unitFactory = component.unitFactory
		, Camera = component.Camera
		, Tile = component.Tile
		, inputBoard = component.inputBoard;

	var spriteMap = parts.spriteMap
		, gridStore = parts.gridStore;


	function flat(array, pkey, tkey){
    var r = {};
    array.forEach(function(item){
      r[item[pkey]] = item[tkey];
    });
    return r;
  }

	loader.onload(function(res){
		res = flat(res, 'name', 'ins');
		listenInput();
		game(document.querySelector('canvas'), res);
	});

	var platform = {
		build: function( name, pos ){
			unitFactory.build( name, gridStore.format( pos ) );
		}
	}


	function game( canvas, res ){
		var w = canvas.width = 500;
		var h = canvas.height = 500;
		var ctx = canvas.getContext('2d');

		spriteFactory.bind(ctx, res);
		
		var user = (function(){
			var pos = [200, 200]
				, speed = [80,80];
			return {
					update: function( dt ){
						if(this.live){
							var input = this.input;
							pos[0] += input.direct[0]*dt*speed[0];	
							pos[1] += input.direct[1]*dt*speed[1];
							
							if( !input.direct[0] && !input.direct[1] ){
								this.sprite.freeze(0);
							}
						}
						

						this.sprite.play( dt, { pos: pos } );
					},
					pos: function(){
						var spriteSize = this.sprite.size();
						return [pos[0]+spriteSize[0]/2, pos[1]+spriteSize[1]-15];
					},
					type: 'player',
					live: true,
					hit: function(){
						this.live = false;

						this.sprite.state('death');
					},
					sprite: spriteMap.user,
					input: { direct: [0,0] }
				};
		})();

		inputBoard.todo(function( key ){
			var input = user.input;
			switch( key ){
				case 'right': case 'left': case 'up': case 'down':
					user.sprite.to( key );
				break;
			}
			
			switch( key ){
				case 'right':
					input.direct[0] = 1;
				break;
				case 'left': 
					input.direct[0] = -1;
				break;
				case 'up':
					input.direct[1] = -1;
				break;
				case 'down':
					input.direct[1] = 1;
				break;
				case 'space':
					var cool = gridStore.cool(user.pos());
					var f = gridStore.depository().some(function(u){
						var ucool = gridStore.cool(u.pos());
						if( u.type == 'bomb' && cool[0] == ucool[0] && cool[1] == ucool[1] ){
							return true;
						}
						return false;
					});
					!f && platform.build('bomb', user.pos());
				break;
			}
		});
		inputBoard.done(function( key ){
			var input = user.input;
			switch( key ){
				case 'right':
					if( input.direct[0] == 1 ) input.direct[0] = 0;
				break;
				case 'left':
					if( input.direct[0] == -1 ) input.direct[0] = 0;
				break;
				case 'up':
					if( input.direct[1] == -1 ) input.direct[1] = 0;
				break;
				case 'down':
					if( input.direct[1] == 1 ) input.direct[1] = 0;
				break;
			}
		});

		var tile = new Tile('tile', 32, 40, [
										[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,1,0,0,0,0,0,0,0,0,0]
										,[0,0,0,5,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0,0,0]
										,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,1,0,0,0,0,0,0,0,0,0]
										,[0,0,0,5,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0,0,0]
										,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,1,0,0,0,0,0,0,0,0,0]
										,[0,0,0,5,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0,0,0]
										,[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,1,0,0,0,0,0,0,0,0,0]
										,[0,0,0,5,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0,0,0]
									]);
		tile.spacing(32, 32);
		tile.bind(ctx, res);

		var camera = new Camera([0,0], [w,h]);
		camera.bind(ctx);
		camera.capture(user);

		gridStore.depository().push(user);

		var last = 0;
		function loop(d){
			var now = d
			, dt = (now - last)/1000;

			ctx.clearRect(0, 0, w, h);

			camera.start();
			if( DEBUG.grid ){
				gridStore.draw(ctx);
			}
			
			tile.update(dt);

			gridStore.depository().slice().reverse().forEach(function( u ){
				u.update(dt);
			});


			camera.over();

			last = now;

			requestAnimFrame(loop);
		};
		requestAnimFrame(loop);
	}


	function listenInput(){
		document.body.addEventListener('keydown', function(e){
			inputBoard.press( map(e.which) );
		});
		document.body.addEventListener('keyup', function(e){
			inputBoard.pop( map(e.which) );
		});
		function map( keyCode ){
			var key = '';
			switch( keyCode ){
				case 32: key = 'space'; break;
				case 65: key = 'a'; break;
				case 83: key = 'b'; break;
				case 38: key = 'up'; break;
				case 39: key = 'right'; break;
				case 40: key = 'down'; break;
				case 37: key = 'left'; break;
			}
			return key;
		}
	}
});
