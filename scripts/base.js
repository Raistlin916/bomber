"use strict";
var bomb = {};

(function(){

  function getExt(p){
    if(p == null){
      return null;
    }
    if(~p.indexOf('.')){
      return p.split('.').pop();
    } else {
      return null;
    }
  }

  var resource = {
      totalLength: null,
      currentLoaded: null,
      load: function(syncList, resList, cb) {
        var res, insList = {}, src, self = this;
        this.totalLength = syncList.length + Object.keys(resList).length;
        this.currentLoaded = 0;

        function createRes(src) {
        	var ins, srcKey = 'src', ext = getExt(src);
          if(ext == 'js'){
          	ins = document.createElement('script');
            ins.addEventListener('load', function(){
              document.body.removeChild(ins);
              ins.onload = null;
            });
            document.body.appendChild(ins);
          } else if (!~['png, jpg'].indexOf(ext)){
          	ins = new Image;
          } else if (ext == 'css'){
          	ins = document.createElement('link');
          	ins.rel = 'stylesheet';
          	srcKey = 'href';
          }

          return {
            ins: ins,
            loaded: function(onloaded){
              ins.addEventListener('load', function(){
                onloaded();
              });
              ins[srcKey] = src;
            }
          }
        }

        function pLoad(name, src){
          var res = createRes(src)
          , d = sp.defer();
          res.loaded(function(){
            d.resolve({name: name, ins: res.ins, src: src});
          });
          return d.promise;
        }

        var ps = [];
        for(var name in resList){
          (function(name, resList){
            ps.push(function(){
              return pLoad(name, resList[name])
            });
          })(name, resList);
        }

        var sl = syncList.map(function(src){
          return pLoad(src, src);
        });
       
        var pp = sp.waterfall(sl)
            .then(function(){
              console.log('done');
            }, function(){
              console.log('fail');
            });



        return sp.all(ps);
      }
    };



  window.resource = resource.load(
    [
      "scripts/efficacy.js"
      , "scripts/component.js"
      , "scripts/util.js"
      , "scripts/init.js"
      , "scripts/game.js"
    ]
    , {
        bomb: 'images/bomb_64x64_2.png'
        , normal: 'images/character_gold_dee.png'
        , nyan: 'images/nyan.png'
        , explosion: 'images/explosion.png'
        , tile: 'images/tileset_12_31.png'
    })
})();