"use strict";


(function(out){

  var module = (function(){
    var namespace = {};

    function require(name){
      var m = namespace[name];
      return typeof m == 'object'? Object.create(m): m;
    }

    function isBlankObj(obj){
      return Obejct.keys(obj).length == 0;
    }

    function extend(target) {
      var source, key;
      source = Array.prototype.slice.call(arguments, 1);
      source.forEach(function(item){
        for( key in item ){
          target[key] = item[key];
        }
      });
      return target;
    }

    function createModule(){
      return {
        add: function(name, fn){
          var plat = {}, plate = {exports: plat};
          namespace[name] = {};
          fn(require, plat, plate);
          if(plate.exports == plat){
            extend(namespace[name], plat);
          } else {
            namespace[name] = plate.exports;
          }
        }, 
        run: function(fn){
          fn(require);
        }
      }
    }


    return {
      create: function(name){
        var m = createModule();
        namespace[name] = m;
        return m;
      }
    };
  })();

  out.module = module;

})(this['module'] ? module.exports: this);


var app = module.create('bomb');

var DEBUG = {
  spriteRect: false,
  grid: false
};

app.add('base', function(require, exports, module){
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
        var res, src, self = this;
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
                self.currentLoaded ++;
                onloaded();
              });
              ins[srcKey] = src;
            },
            fail: function(f){
              ins.addEventListener('error', function(){
                f && f();
              });
            }
          }
        }

        function pLoad(name, src, n){
          return function(){
            var res = createRes(src)
            , d = sp.defer();
            res.loaded(function(){
              d.notify({name: src});
              d.resolve({name: name, ins: res.ins, src: src});
            });
            res.fail(function(){
              d.reject(name+' loaded fail');
            });
            return d.promise;
          }
        }

        var ps = [];
        for(var name in resList){
          (function(name, resList){
            ps.push(pLoad(name, resList[name]));
          })(name, resList);
        }

        var sl = syncList.map(function(src, n){
          return pLoad(src, src);
        });

        return sp.waterfall(sl)
              .then(function(){
                return sp.all(ps);
              })
              .then(function(res){
                console.log('done');
                return res;
              }, function(){
                console.log('fail');
              });
      }
    };

  exports.resource = resource;
});