"use strict";
var bomb = {};

(function(exports){

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
              d.notify({src: name});
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

})(bomb);