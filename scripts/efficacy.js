app.add('efficacy', function(require, exports, module){
	var particleEffects = (function(){
			function initOffScreen(imageData, dw ,dh){
				var canvasOff = document.createElement('canvas');
				canvasOff.width = dw;
				canvasOff.height = dh;
				var ctxOff = canvasOff.getContext('2d');

				ctxOff.putImageData(imageData, 0, 0);
				return canvasOff.getContext('2d');
			}

			var transList = {
				a: function(t, x, y, sw, sh){
					return {
						tx: 0,
						ty: ~~(t*10*Math.sin(x/sw*Math.PI*8))
					}
				},
				b: function(t, x, y, sw, sh){
					return {
						tx: ~~(t*10*Math.sin(y/sh*Math.PI*8)),
						ty: 0
					}
				},
				c: function(t, x, y, sw, sh){
					return {
						tx: ~~(4*Math.sin(t*y*Math.PI/10)),
						ty: 0
					}
				}
			}

			function createEffect(name, ctxOff, orgData, opt){
					var dataOff, w, h, sw, sh, dataOrg, dataCopy, elapse
					, elapse, last, hasEnd, trans, reverse, ruler;
					
					reverse = 1;

					sw = orgData.width;
					sh = orgData.height;
					w = ctxOff.canvas.width;
					h = ctxOff.canvas.height;
					dataOrg = copyImageData(ctxOff, ctxOff.getImageData(0, 0, w, h));
					ruler = elapse = 0;
					last = opt.last || 5;
					trans = transList[name];


					return {
						reverse: function(){
							reverse = -reverse;
							elapse = 0;
							hasEnd = false;
						},
						restart: function(){
							hasEnd = false;
							elapse = 0;
							ruler = 0;
						},
						play: function(ctx, dt, dx, dy){
							var y, x, cur, map, tx, ty, opc = null, t, r;

							ruler += reverse*dt;
							elapse += dt;
							
							t = ruler;
						
							if(elapse > last){
								if(!hasEnd){
									hasEnd = true;
									opt.cb && opt.cb();
									this.onend && this.onend();
								}
								
								t = last;
							}

							dataCopy = ctxOff.createImageData(w, h);
							

							if(opt.fade){
								opc = ~~((opt.fade-t)/opt.fade * 255);
							}
							
							for(y=0; y<h; y++){
								for(x=0; x<w; x++){
									r = trans(t, x, y, sw, sh);
									tx = r.tx;
									ty = r.ty;
									cur = (x + y * w)*4;
									map = (x+tx + (y+ty) * w)*4;
									dataCopy.data[map] = dataOrg.data[cur];
									dataCopy.data[map+1] = dataOrg.data[cur+1];
									dataCopy.data[map+2] = dataOrg.data[cur+2];

									if(dataOrg.data[cur+3]){
										dataCopy.data[map+3] = opc == undefined? dataOrg.data[cur+3] : opc;
									} else {
										dataCopy.data[map+3] = 0;
									}
								}
							}

							ctxOff.putImageData(dataCopy, 0, 0);
							ctx.drawImage(ctxOff.canvas, dx, dy);
							ctxOff.clearRect(0, 0, w, h);
						}
					}
				}

			return {
				create: function(name, imageData, dw, dh, opt){
					var ctxOff = initOffScreen(imageData, dw, dh);
					opt = opt || {};
					return createEffect(name, ctxOff, imageData, opt);
				}
			}
		})();

		function copyImageData(ctx, src, bCopy){
			var dst = ctx.createImageData(src.width, src.height);
			if(bCopy !== false){
				dst.data.set(src.data);
			}
			return dst;
		}
		
	exports.particleEffects = particleEffects;
});

