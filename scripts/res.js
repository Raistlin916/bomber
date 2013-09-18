var DEBUG = {
  spriteRect: false,
  grid: false
};
(function(exports){
  exports.resource = exports.resource.load(
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
    });
})(bomb);