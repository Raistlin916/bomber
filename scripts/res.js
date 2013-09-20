var DEBUG = {
  spriteRect: false,
  grid: false
};
(function(exports){
  var resource = exports.resource;
  var app = resource.load(
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
    }).progress(function(sig){
      var c = resource.currentLoaded
      , t = resource.totalLength
      , p = document.createElement('div');

      p.innerHTML = ~~(c/t*100)+'% loaded ' + sig.src;
      eMessages.appendChild(p);
    });

    var eMessages = document.getElementById('messages');

    app.start = app.then;

    exports.app = app;

  
})(bomb);