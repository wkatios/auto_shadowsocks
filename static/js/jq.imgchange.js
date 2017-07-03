/*	imgChange 2.0 - simple object change with jQuery1.2.6+;ps:从效率上考虑尽量用最新版本的
 *	作者：ahuing  2012-12-26
 *  说明：如果网站是utf-8时，需要转下编码
 */
$.extend($.easing, {
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeOutBounce: function(x, t, b, c, d) {
		if ((t /= d) < (1 / 2.75)) {
			return c * (7.5625 * t * t) + b;
		} else if (t < (2 / 2.75)) {
			return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
		} else if (t < (2.5 / 2.75)) {
			return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
		} else {
			return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
		}
	}
});
 /** 
 * $('#bigimg li').imgChange({
 * thumbObj: '.tlist li',//缩略图对象;
 * botPrev: '.prev',//上一个对象;
 * botNext: '.next',//下一个对象;
 * effect: 'fade',//切换效果,效果有fade,scroll(滚动),wfScroll(无缝滚动steps:2,changeTime:50)，wb(微博),accordion,stream,turnDown,zoom,flyFade,tab,flipper,slide,cutIn,alternately
 * curClass: 'act',//当前缩略图对象的样式名
 * thumbOverEvent: 1,//鼠标悬停是否切换
 * overEvent: 0,//鼠标放上是否自动切换
 * speed: 400,//切换速度
 * autoChange: 1,//是否自动切换
 * changeTime: 5000,//自动切换时间
 * delayTime: 0,//鼠标悬停的延迟时间
 * showTxt: 0,//是否显示标题,标题调用img里的alt值
 * visible:1,//显示对象的个数
 * steps:1, //每次滚动的数量，effect==wfscroll时，每次滚动的距离
 * circular: 0,//是否循环滚动
 * vertical:1,//方向
 * easing: 'swing'//动画效果,需要easing插件支持
 * wrapSize:0,无缝滚动的外层宽度
 * beforeStart:function(){$('.txt').hide},效果执行前的函数
 * afterEnd:null,效果完成后的函数
 *})
 */

; (function($) {
	$.fn.extend({
		imgChange: function(o) {
			o = $.extend({
				thumbObj: null,
				botPrev: null,
				botNext: null,
				effect: 'fade',
				curClass: 'act',
				thumbOverEvent: 1,
				overEvent: 0,
				speed: 400,
				autoChange: 1,
				changeTime: 5000,
				delayTime: 0,
				showTxt: 0,
				visible: 1,
				steps: 1,
				circular: 1,
				start:0,
				vertical: 1,
				easing: null,
				wrapSize:0,
				beforeStart: null,
				afterEnd: null
			},
			o || {});
			var _self = this,
			_p = _self.parent(),
			_pp = _p.parent(),
			size = _self.length,
			_img = _p.find('img'),
			ver = o.vertical,
			animCss = ver?'top':'left',
			sizeCss = ver?'height':'width',
			sizeCss1 = ver?'width':'height',
			g = ver?_self.outerHeight(true):_self.outerWidth(true),
			g1 = !ver?_self.outerHeight(true):_self.outerWidth(true),
			index = 0,
			nowIndex = 0,
			v = o.visible;
			//初始化
			if(size) {
				o.showTxt&&_pp.after("<div class='txt'><a href='" + _img[0].attributes['data-url'].nodeValue + "'>" + _img[0].alt + "</a></div>");
				function _sInit() {
					_p[0].style.cssText = 'margin: 0;padding: 0;position: absolute;left:0;top:0;'+sizeCss+':999999px';
					_pp[0].style.cssText = 'overflow: hidden;position: relative;'+sizeCss1+':'+g1+'px';
					_self.css('float',ver?'none':'left');
				}
			switch (o.effect) {
				case 'wfScroll':
					if(size < v) return;
					_sInit();
					_p.prepend(_self.clone());
					var scrollSize = totalSize(_self);
					_pp.css(sizeCss, o.wrapSize||totalSize(_self.slice(0, v)));  
					break;
				case 'scroll':case 'scroll2':
					if(size < v) return;
					_self.css({
						overflow: 'hidden',
						width: _self.width(),
						height: _self.height()
					});
					_sInit();
					_pp.css(sizeCss, g * v);
					if(o.effect=='scroll2'){
						var curr=0;
						if(o.circular){
							_p.prepend(_self.slice(size - v).clone()).append(_self.slice(0, v).clone()).css(animCss, -v*g);
							size=_p[0].children.length;
							curr=v;
						}
					}
					break;
				case 'wb':
					if(size < v) return;
					_p[0].style.position = 'relative';                    
					_pp[0].style.cssText = 'overflow: hidden;position:relative;height:'+g * v+'px';
					break;
				case 'stream':
					var _copySelf = _img.clone().css(sizeCss, g * 10).css(animCss,g).css('position','absolute').prependTo(_pp); 
					_self.css(sizeCss, 0).css({
						overflow: 'hidden',
						position: 'absolute'
					}).slice(0, 1).css(sizeCss, g);
					break;
				default:
					_self.css('display','none')[0].style.display = 'block';
				}
			}
			if (o.thumbObj) {
				var thumbObj = $(o.thumbObj),delayRun;
				thumbObj.removeClass(o.curClass).on('click',function() {
					index = thumbObj.index(this);
					fadeAB();
				})[0].className+=' '+o.curClass;
				o.thumbOverEvent&&thumbObj.on({mouseover:function(){
						index = thumbObj.index(this);
						delayRun = setTimeout(fadeAB, o.delayTime)
					},mouseout:function() {
						clearTimeout(delayRun)
					}
				});
			}
			//下一个
			o.botNext&&$(o.botNext).on('click',function() {
					runNext();
				});
			//上一个
			o.botPrev&&$(o.botPrev).on('click',function() {
					if (o.effect == 'scroll2') return go(curr - o.steps);
					else {
						index = (nowIndex + size - 1) % size;
						fadeAB();
					}
				});
			//自动切换
			if (o.autoChange) {
				var startRun = setInterval(runNext, o.changeTime);
				if(o.overEvent) {
					thumbObj.add(o.botPrev+','+o.botNext).on({mouseover:function() {
						clearInterval(startRun)
					},mouseout:function() {
						startRun = setInterval(runNext, o.changeTime)
					}
					})
				} else {
					_p.add(thumbObj).add(o.botPrev+','+o.botNext).on({mouseover:function() {
						clearInterval(startRun)
					},mouseout:function() {
						startRun = setInterval(runNext, o.changeTime)
					}
					})
				}
			}
			//下一个
			function runNext() {
				if (o.effect == 'scroll2') return go(curr + o.steps);
				else if (o.effect == 'wfScroll') marquee();
				else {
					index =(nowIndex + 1) % (size||thumbObj&&thumbObj.length);
					fadeAB()
				}
			}
			function marquee(){ver?_pp.scrollTop(_pp.scrollTop() + o.steps - (_pp.scrollTop() >= scrollSize&&scrollSize)):_pp.scrollLeft(_pp.scrollLeft() + o.steps - (_pp.scrollLeft() >= scrollSize&&scrollSize))}
			//统计对象的宽度或高度
			function totalSize(arr) {
				var total = 0, arrLen=arr.length;
				for (var i = 0; i < arrLen; i++) total += ver?$(arr[i]).outerHeight(true):$(arr[i]).outerWidth(true);
				return total;
			}
			function fadeAB() {
				if (nowIndex != index) {
					//执行前的函数
					o.beforeStart&&o.beforeStart.call(this);
					//对象切换
					thumbObj&&(thumbObj.removeClass(o.curClass)[index].className+=' '+o.curClass);
					//当thumbObj索引大于size或size==0
					if (size <= index||!size) {
						nowIndex = index;
						return false;
					}
				switch (o.effect) {
					case 'flipper':
						_self.stop(1, 1).css({
							zIndex:0
						}).slice(nowIndex, nowIndex + 1).animate({
							width: 'hide',
							left: '50%'
						},
						o.speed);
						_self.slice(index, index + 1).css({
							zIndex: 2,
							left: '50%',
							display: 'none'
						}).animate({
							left: 0,
							width: 'show'
						},
						o.speed);
						break;
					case 'zoom':
						_self.stop(1, 1).slice(nowIndex, nowIndex + 1).animate({
							opacity: 'hide'
						},
						o.speed);
						_self.slice(index, index + 1).css({
							zIndex: 1,
							left: '50%',
							top: '50%',
							display: 'none'
						}).animate({
							left: 0,
							top: 0,
							height: 'show',
							width: 'show'
						},
						o.speed);
						break;
					case 'turnDown':
						_self.stop(1, 1).css({
							top: 0
						}).slice(nowIndex, nowIndex + 1).animate({
							height: 'hide',
							top: g
						},
						o.speed);
						_self.slice(index, index + 1).animate({
							height: 'show'
						},
						o.speed);
						break;
					case 'scroll':
						_p.stop(0, 0).animate(ver?{top: -index * g}:{left: -index * g},
						o.speed, o.easing); 
						 break;
					case 'cutIn':
						_self.stop(1, 1).css({
							zIndex:0
						})[index].style.zIndex=1;
						_self.slice(index, index + 1).css({
							display: 'block',
							zIndex: 2,
							top: -g
						}).animate({
							top: 0
						},
						o.speed, o.easing);
						 break;
					case 'flyFade':  
						var rad = Math.floor(4 * Math.random()),
						d = (rad%2?-1:1)*(rad < 2?_self.outerWidth():_self.outerHeight());
						_self.stop(1, 1).css({
							zIndex: 1,
							display: 'block',
							top: 0,
							left: 0,
							opacity: 1
						})[index].style.zIndex=2;
						_self.slice(nowIndex, nowIndex + 1).css({
							zIndex: 3
						}).animate(rad < 2?{opacity: 0,left:d}:{opacity: 0,top: d},
						o.speed, o.easing);  
						 break;
					case 'stream':
						_self.stop(0, 0).css(sizeCss, 0).slice(index, index + 1).animate(ver?{height: g}:{width: g},
						o.speed, o.easing);
						_copySelf.css(animCss, g).stop(0, 0).slice(index, index + 1).css(animCss, 0).animate(ver?{top: -g * 9}:{left: -g * 9},
						o.speed, o.easing);
						 break;
					case 'alternately':
						_self.stop(0, 0).css({
							display:'none'
						}).slice(nowIndex, nowIndex + 1).css({
							zIndex: 10,
							display: 'block'
						}).animate(ver ? {top: -g / 2}: {left: -g / 2},
						o.speed,
						function() {
							$(this).css({
								zIndex: 5
							}).animate(ver ? {top: 0}: {left: 0},
							o.speed)
						});
						_self.slice(index, index + 1).css({
							display: 'block'
						}).animate(ver ? {top: g / 2}: {left: g / 2},
						o.speed,
						function() {
							$(this).css({
								zIndex: 10
							}).animate(ver ? {top: 0}: {left: 0},
							o.speed)
						});   
						 break;
					case 'wb':
						_p.animate({
							top: 1.3*g
						},
						o.speed,
						function() {
							_p.prepend(this.children[size-1]);
							this.children[0].style.display = 'none';
							this.style.top = 0;
							$(this.firstChild).animate({
								opacity: 'show'
							})
						});
						 break;
					default:
						if(o.speed){
							_self.stop(1, 1).slice(nowIndex, nowIndex + 1).animate({opacity: 'hide'},o.speed);
							_self.slice(index, index + 1).animate({opacity: 'show'},o.speed);
						}else{
							if(size>nowIndex){
								_self[nowIndex].style.display='none';
								_self[index].style.display='block';
							}
						}
					}
					//切换标题
					o.showTxt&&(_pp.next().html("<a href='" + _img[index].attributes['data-url'].nodeValue + "'>" + _img[index].alt + "</a>"));
					nowIndex = index;
					//完成的函数
					o.afterEnd&&o.afterEnd.call(this);
				}
			}
			//滚动函数
			function go(a) {
				o.beforeStart&&o.beforeStart.call(this);
				if(o.circular) { 
					if (a <= -1) {
						_p.css(animCss, -((size - v * 2) * g));
						curr =  size - v * 2 - (a == -1 ? 1: o.steps)
					} else if (a >= size - v + 1) {
						_p.css(animCss, -v * g);
						curr = a == size - v + 1 ? v + 1: v + o.steps
					} else curr = a;
				} else {                    
                    if(a<0||a>size-v) return;
                    else curr = a;
                } 
				_p.stop().animate(ver?{top: -curr * g}:{left: -curr * g},
					o.speed, o.easing,
					function() {
						o.afterEnd&&o.afterEnd.call(this);
					});
				return false;
			}
		}
	})
})(jQuery);