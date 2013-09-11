"use strict";
var bomb = {};

var DEBUG = {
  spriteRect: false,
  grid: false
};

(function ( exports ){
  function getExt(p){
    if(~p.indexOf('.')){
      return p.split('.').pop();
    } else {
      return null;
    }
  }
  var spriteFactory = {
    bind: function( ctx, res ){
      this.ctx = ctx;
      this.res = res;
    },
    build: function(imgName, frames, w, h, fps) {
      fps = fps || 8;
      var state, elapse, frozen = false, self = this
        , sw = w, sh = h, effect;

      function drawPiece(state) {
        var p = getPiece(state);
        self.ctx.drawImage(self.res[imgName], p[0], p[1], w, h, -sw/2, -sh/2, sw, sh);
      }

      function getPiece(state){
        var piece, frameCount, frame, p;
        piece = frames[state];
        frameCount = ~~(elapse*fps);
        if( piece == undefined ) return;
        frame = frameCount % piece.length;
        p = piece[frame];
        return p;
      }

      function getImageData(ctx, img, x, y, w, h){
        var canvasOff = document.createElement('canvas');
        var ctxOff = canvasOff.getContext('2d');
        ctxOff.drawImage(img, x, y, w, h, 0, 0, w, h);
        return ctxOff.getImageData(0, 0, w, h);
      }

      return {
        getImageData: function(){
          var p = getPiece(state);
          return getImageData(self.ctx, self.res[imgName], p[0], p[1], w, h);
        },
        to: function(s) {
          frozen = false;
          if( s == state ){
            return;
          }
          state = s;
          elapse = 0;
          return this;
        },
        clone: function(){
          var c = spriteFactory.build( imgName, frames, w, h, fps );
          c.effect( effect );
          c.size( sw, sh ).to( state );
          return c;
        },
        freeze: function( n ){
          frozen = true;
          if( n != undefined ){
            elapse = n * fps;
          }
        },
        effect: function( ef ){
          effect = ef;
        },
        size: function( w, h ){
          if( !arguments.length ){
            return [sw,sh];
          }
          sw = w;
          sh = h;
          return this;
        },
        play: function( dt, prop ){
          if( !frozen ){
            elapse += dt;
          }
          var ctx = self.ctx;
          
          ctx.save();
          ctx.translate( prop.pos[0] + sw/2, prop.pos[1] + sh/2 );
          prop.drawPiece = drawPiece;
          prop.ctx = ctx;
          prop.elapse = elapse;


          var r = effect && effect( dt, prop );
          if(r !== false){
             drawPiece( state );
          }
         



          if( DEBUG.spriteRect ){
            ctx.beginPath();
            ctx.strokeStyle = 'skyblue';
            ctx.strokeRect(-sw/2,-sh/2,sw,sh);
            ctx.stroke();
          }
          
          ctx.restore();
        }
      }
    }
  }

  var sheetMaker = (function(){
    var flag = true;
    var bar = function( sx, sy, offset, amount ){
      var r = [];
      var n = 0;
      while( n < amount ){
        r.push( flag? [sx+offset*n,sy]: [sx,sy+offset*n] );
        n++;
      }
      return r;
    }
    return {
      row: function( sx, sy, w, amount ){
        flag = true;
        return bar.apply( null, arguments );
      },
      col: function( sx, sy, h, amount ){
        flag = false;
        return bar.apply( null, arguments );
      }
    }
  })();

  var inputBoard = (function(){
    var board = {};
    var todo, done;
    return {
      press: function( act ){
        if( act == undefined ) return;
        if( board[act] != true ){
          board[act] = true;
          todo( act );
        }
      },
      pop: function( act ){
        if( act == undefined ) return;
        if( board[act] == true ){
          done( act );
          board[act] = false;
          for( var key in board ){
            if( board[key] ){
              todo( key );
            }
          }
        }
      },
      todo: function( fn ){
        todo = fn;
      },
      done: function( fn ){
        done = fn;
      }
    }
  })();


  var resource = (function(){
    return {
      load: function(syncList, resList, cb) {
        var resIns, insList = {}, src, self = this
        , l = cl();

        // current length
        function cl(){
          return Object.keys(resList).length;
        }

        function toCreate(ext, src){
          if(ext == 'js'){

          }
        }

        function toLoad(name, src) {
          return function(){
            delete resList[name];
            self.onprogress && self.onprogress(l-cl(), l, src);
            if(cl() == 0){
              cb(insList);
            }
          }
        }

        for(var name in resList){
          src = resList[name];
          resIns = new Image;
          insList[name] = resIns;
          resIns.onload = toLoad(name, src);
          resIns.src = src;
        }
      }
    }
  })();

  var unitFactory = {
      bind: function( spriteMap, actionMap, store ){
        this.spriteMap = spriteMap;
        this.actionMap = actionMap;
        this.store = store;
      },
      build: function( type, pos, p ){
        var sprite, action = [], ins
          , store = this.store
          , elapse = 0
          , prop = { pos: pos };
        if( p ){
          for( var key in p ){
            prop[key] = p[key];
          }
        }
        

        ins = {
          update: function(dt){
            if( !this.live ){
              store.splice(store.indexOf(this), 1);
              return;
            }
            elapse += dt;

            sprite && sprite.play(dt, prop);
            var i,t;
            for(i=0;i<action.length;i++){
              t = action[i];

              if( elapse > t.ep ){
                t.cb();
                action.splice(i, 1);
                i--;
              }
            }
          },
          destroy: function(){
            this.live = false;
          },
          pos: function(){
            return prop.pos;
          },
          when: function( ep, cb ){
            action.push({ ep: ep, cb: cb});
          },
          after: function( ep, cb ){
            action.push({ ep: elapse + ep, cb: cb});
          },
          type: type,
          live: true
        }
        sprite = this.spriteMap[type] && this.spriteMap[type].clone();
        this.actionMap[type] && this.actionMap[type]( ins, prop );

        store.push( ins );
        return ins;
      }
    }

  function Grid( size, counts, offset ){
    this.size = size;
    this.counts = counts;
    this.oft = offset || [0,0];
    this.contour = [counts[0]*size[0],counts[1]*size[1]];
  }
  Grid.prototype = {
    format: function( pos ){
      return [this.oft[0]+pos[0]-pos[0]%this.size[0], this.oft[1]+pos[1]-pos[1]%this.size[1]];
    },
    cool: function( pos ){
      return [~~((pos[0]-this.oft[0])/this.size[0]),
              ~~((pos[1]-this.oft[1])/this.size[1])];
    },
    pos: function( cool ){
      return [this.oft[0]+cool[0]*this.size[0],
              this.oft[1]+cool[1]*this.size[1]];
    },
    draw: function( ctx ){
      ctx.save();
      ctx.strokeStyle = 'grey';
      ctx.beginPath();
      var i;
      ctx.translate(this.oft[0], this.oft[1]);
      for( i = 0; i<=this.counts[0]; i++ ){
        ctx.moveTo(this.size[0]*i, 0);
        ctx.lineTo(this.size[0]*i, this.contour[1]); 
      }
      for( i = 0; i<=this.counts[1]; i++ ){
        ctx.moveTo(0, this.size[1]*i);
        ctx.lineTo(this.contour[0], this.size[1]*i);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  function Tile( imgName, sw, sh, blueprint, count ){
    this.imgName = imgName;
    this.pw = this.dw = this.sw = sw;
    this.ph = this.dh = this.sh = sh;
    this.blueprint = blueprint;
  }
  Tile.prototype = {
    bind: function( ctx, res ){
      this.ctx = ctx;
      this.img = res[this.imgName];
      this.iw = this.img.width;
    },
    size: function( dw, dh ){
      this.dw = dw;
      this.dh = dh;
    },
    spacing: function( pw, ph ){
      this.pw = pw;
      this.ph = ph;
    },
    update: function( dt ){
      var i, j, leni, lenj, t;
      for( i=0, leni=this.blueprint.length; i<leni; i++ ){
        t = this.blueprint[i];
        for( j=0, lenj=t.length; j<lenj; j++ ){
          this.drawTile( [j*this.pw, i*this.ph], t[j] );
        }
      }
    },
    drawTile: function( pos, n ){
      var y = this.sh*~~(n*this.sw/this.iw),
        x = this.sw*n%this.iw;
      this.ctx.drawImage( this.img, x, y, this.sw, this.sh, pos[0], pos[1], this.dw, this.dh );
    }
  }

  function Camera( pos, size ){
    this.pos = pos;
    this.size = size;
  }
  Camera.prototype = {
    start: function(){
      var pos, tp;
      this.ctx.save();
      if( this.target ){
        tp = this.target.pos();
        pos = [Math.round(tp[0]-this.size[0]/2), Math.round(tp[1]-this.size[1]/2)];
      } else {
        pos = this.pos;
      }
      this.ctx.translate( -pos[0], -pos[1] );
    },
    over: function(){
      this.ctx.restore();
    },
    bind: function( ctx ){
      this.ctx = ctx;
    },
    capture: function( target ){
      this.target = target;
    }
  }

  exports.spriteFactory = spriteFactory;
  exports.sheetMaker = sheetMaker;
  exports.inputBoard = inputBoard;
  exports.resource = resource;
  exports.Grid = Grid;
  exports.Tile = Tile;
  exports.unitFactory = unitFactory;
  exports.Camera = Camera;
})( bomb );
