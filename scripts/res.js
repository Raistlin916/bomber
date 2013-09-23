app.add('loader', function(require, exports, module){
  var resource =  require('base').resource;

  var loader = resource.load(
    [
      "scripts/util.js"
      , "scripts/efficacy.js"
      , "scripts/component.js"
      , "scripts/parts.js"
      , "scripts/game.js"
    ]
    , {
        bomb: 'images/bomb_64x64_2.png'
        , normal: 'images/character_gold_dee.png'
        , nyan: 'images/nyan.png'
        , explosion: 'images/explosion.png'
        , tile: 'images/tileset_12_31.png'
    }).progress(function(sig){
      var c = resource.currentLoaded
      , t = resource.totalLength
      , p = document.createElement('div');

      p.innerHTML = ~~(c/t*100)+'% loaded ' + sig.src;
      eMessages.appendChild(p);
    });

    var eMessages = document.getElementById('messages');

    loader.onload = loader.then;

    module.exports = loader;
});
