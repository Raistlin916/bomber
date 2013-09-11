(function( exports ){
	
	var foil = (function(){
		function u( i ){
			return i>0?i:0;
		}
		return {
			phase: function( a ){
				return [ u(-a[1]), u(a[0]), u(a[1]), u(-a[0]) ];
			},
			reverse: function( f ){
				return [f[2],f[3],f[0],f[1]];
			}
		}
	})();

	var requestAnimFrame  =  (function() {
		return 	window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( callback ) {
			window.setTimeout(callback, 1000/60);
		};
	})();

	

	exports.foil = foil;
	window.requestAnimFrame = requestAnimFrame;
})( bomb );