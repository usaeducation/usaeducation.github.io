/**
 * lightgallery.js v1.0
 * Author: Dmitri Ischenko - ischenkodv@gmail.com
 * Freely distributable under MIT-style license.
 */
var lightgallery = (function(){
var G = {
	isOpen		: false,	// if gallery open?
	images		: [],		// list of images
	container	: null,		// container which holds image
	picture		: null,		// image
	current		: null,		// index of the current image showing
	loaderImage	: null,		// image loader
	minPadding	: 15,		// minimal distance between container and window
	options		:{
		animate			: true,
		framesNumber	: 20,
		speed			: 30,
		resizeSync		: false,	// resize container both vertically and horizontally at the same time
		enableZoom		: true,
		fadeImage		: true,
		alias			: 'lightgallery'
	},
	/**
	 * Language variables
	 */
	langVars	:{
		next	: 'Next',
		prev	: 'Previous',
		zoomIn	: 'Zoom In',
		zoomOut	: 'Zoom Out',
		fullSize: 'Full Size',
		fitScreen: 'Fit screen',
		close	: 'Close',
		image	: 'Image',
		of		: 'of'
	},

	/**
	 * Set language variables
	 * @param {Object} oVars - language variables
	 */
	setLangVars : function(vars){
		extend(this.langVars, vars);
	},


	/**
	 * Initialize gallery
	 * @param {object} options - gallery options
	 */
	init : function(options){
		var opt = this.options;
		extend(opt, options);

		// get images
		var	imgs = document.getElementsByTagName('a'),
			rel,	// variable to hold "rel" attribute
			r;		// variable to hold RegEx matches
		for(var i=0,len=imgs.length; i<len;i++){
			if(rel = imgs[i].rel){
				if(r = rel.match(new RegExp('^'+opt.alias+'\\[([a-zA-Z]+)\\]|'+opt.alias+'$'))) {
					addEvent(imgs[i],'click', this.showImage);
					if(r[1]){
						imgs[i].__gallery__ = r[1];
						if(!this.images[r[1]])
							this.images[r[1]] = [];

						imgs[i].__index__ = this.images[r[1]].push(imgs[i]) - 1;
					}
				}
			}
		}

		// create overlay and container and add it to body
		var b=document.getElementsByTagName('body')[0];
		b.appendChild( this.overlay = ce('div',{id:'LG_overlay'}) );
		b.appendChild( this.container = this.createContainer() );

		if (b.attachEvent)
			addEvent(b,'keypress',keyPressHandler);	// for IE
		else
			addEvent(window,'keypress',keyPressHandler);

		// create new Image element to load images
		this.loaderImage = ce('img',{src:''});
		this.loaderImage.onload=function(){
			G.hideLoadingIcon();
			G.loaderImage.__is_loaded__=true;
			G.picture.setAttribute("src", G.loaderImage.src);
			G.setContPos();
			G.preload(G.current);
		}

		// define the difference between container and image size
		this.dy = this.container.offsetHeight;
		this.dx = 0;
	},

	/**
	 * Open (show) gallery
	 */
	open : function(){
		// set overlay size and show it using fade in effect
		var	ar = getPageSize();

		css(G.overlay, {width:(G.overlayWidth = ar[0]) + "px", height: (G.overlayHeight = ar[1]) + "px", display:'block'});
		fadeIn(G.overlay, 0, 85, 9);


		// display container
		G.picture.style.display='block';
		G.setContPos();
		css(G.container, {visibility:'visible', display:'block'});
		G.isOpen = true;
	},

	/**
	 * Close gallery
	 */
	close : function(){
		G.overlay.style.display = 'none';
		css(G.container, {visibility:'hidden',display:'none'});
		G.isOpen = false;
		
		var	i = G.loaderImage;
		i.src=G.picture.src='';
		i.__is_loaded__=false;
	},

	/**
	 * Create container
	 */
	createContainer : function(){
		var lng = G.langVars;
		if (G.options.enableZoom) {
			var zoomIn = ce('div', {
				'class': 'LG_zoomIn',
				title: lng.zoomIn,
				events: {
					click: G.zoomIn
				}
			});
			var zoomOut = ce('div', {'class':'LG_zoomOut',title:lng.zoomOut,
				events:{click:G.zoomOut}
			})
		}
		return ce('div', {id:'LG_container'},
					ce('div',0,
							zoomIn, zoomOut,
							this.fullSizeBtn = ce('div', {'class': 'LG_zoomNormal',title: lng.fullSize,
									events: {click: G.zoomNormal}
								}),
							this.imgIndex = ce('div', {'class':'LG_imgIndex'}),
							ce('div',{'class':'LG_closeBtn',title:lng.close,
									events:{'click':G.close}
								}),ce('br',{clear:'all'})
						),
						this.picture = ce('img', {id:'LG_pic',width:300,height:300}),
						this.titleBar = ce('div', {'class':'LG_titleBar'}),
						this.prevBtn = ce('div', {'class':'LG_prevLink',title:lng.prev,
											events:{
												click:G.prev,
												mouseover:showBtn,
												mouseout:hideBtn
											}
										}),
						this.nextBtn = ce('div',{'class':'LG_nextLink',title:lng.next,
											events:{
												click:G.next,
												mouseover:showBtn,
												mouseout:hideBtn
											}
										})
		)
	},

	zoomIn : function(){
		G.Zoom(1.1)
	},

	zoomOut : function(){
		G.Zoom(.9)
	},

	zoomNormal : function(){
		if(this.$disabled)
			return;

		var	p=G.picture,
			i=G.loaderImage;

		G.Zoom(
			p.width == i.width && p.height == i.height ? 0 : 1
		);
	},

	Zoom : function(coef){
		G.hideContent();
		G.setContPos(coef)
	},

	/**
	 * Set the size and position of the container
	 * @param {Number} vScale - scale of the image: 1 - full size, >1 - zoom in, <1 - zoom out
	 */
	setContPos : function(vScale){
		// define references and variables
		var	i = G.loaderImage,
			p = G.picture,
			iWidth = i.width,
			iHeight = i.height,
			pWidth,pHeight,w,h,
			dx = G.dx,
			dy = G.dy,
			padding = G.minPadding,
			fullSizeBtn = G.fullSizeBtn;
			opt = G.options,
			lng = G.langVars,
			framesNumber = opt.framesNumber,
			ar = getPageSize(),
			wScr = ar[2],	// width of the viewport
			hScr = ar[3],	// height of the viewport
			dim_scr = wScr/hScr,		// screen proportion
			dim_pic = iWidth/iHeight;	// picture proportion

		// define width and height of the container
		if(i.__is_loaded__ && !vScale){
			// set size of the container according to the size of the viewport
			if(wScr > (iWidth+dx+padding) && hScr > (iHeight+dy+padding)){
				// image fit the screen size
				var disableFullSize = true;
				pWidth = iWidth;
				pHeight = iHeight;
			} else {
				// image needs to be resized
				if(dim_scr > dim_pic)
					pWidth = Math.floor((pHeight = hScr - dy - padding)*dim_pic);
				else
					pHeight = Math.floor((pWidth = wScr - dx - padding) * dim_pic);
			}
			w = (p.width = pWidth) + dx;
			h = (p.height = pHeight) + dy;
		}else if(vScale==1){
			// full size
			var isFullSize = true;
			w = (p.width = i.width) + dx;
			h = (p.height = i.height) + dy;
		}else if(vScale < 1 || vScale > 1){
			// zoom image according to vScale
			w = (p.width = Math.floor(p.width * vScale)) + dx;
			h = (p.height = Math.floor(p.height * vScale)) + dy;
		}else{
			w = h =300;	// default size
			var disableAnimate = true;
		}

		// enable/disable the full size button
		if (disableFullSize) {
			fullSizeBtn.className = 'LG_zoom_disabled';
			fullSizeBtn.$disabled = true;
		} else {
			fullSizeBtn.className = isFullSize ? 'LG_fitScreen' : 'LG_zoomNormal';
			fullSizeBtn.setAttribute('title', isFullSize ? lng.fitScreen : lng.fullSize);
			fullSizeBtn.$disabled = false;
		}

		// here we set the minimal width of the container to 300px
		w = Math.max(w,300);

		// if image more that current document we need to resize overlay
		css(G.overlay, {width:( w > G.overlayWidth? w + 10 : G.overlayWidth) + 'px', height: ( h > G.overlayHeight? h + 10 : G.overlayHeight) + 'px'});

		// correct coords according to scroll bars position
		var	scr = getScrollXY(),
			y = (hScr>h ? Math.floor(Math.abs((hScr - h)/2)) : 0) + scr[1],
			x = (wScr>w ? Math.floor(Math.abs((wScr - w)/2)) : 0) + scr[0],
			// set the width of the prev/next buttons as 1/3 of the picture width
			nw = (w/3) + 'px',
			nh = (h - dy - 10) + 'px';
		
		css(G.nextBtn, {width:nw, height:nh});
		css(G.prevBtn, {width:nw, height:nh});


		if(opt.animate && !disableAnimate){
			var anime = new Movie(G.container, framesNumber, opt.speed);
			if (opt.resizeSync) {
				anime.addThread('width', null, w, 0, framesNumber);
				anime.addThread('left', null, x, 0, framesNumber);
				anime.addThread('height', null, h, 0, framesNumber);
				anime.addThread('top', null, y, 0, framesNumber);
			} else {
				var middle = Math.ceil(framesNumber / 2);
				anime.addThread('width', null, w, 0, middle);
				anime.addThread('left', null, x, 0, middle);
				anime.addThread('height', null, h, middle, framesNumber);
				anime.addThread('top', null, y, middle, framesNumber);
			}
			anime.addAction(function(){
				G.showContent()
			},opt.framesNumber-1);
			anime.run();
		}else{
			css(G.container, {top: y+"px", left: x+"px", width: w+"px", height: h+"px"});
			G.showContent();
		}
	},

	/**
	 * Preload adjacent images
	 * @param {Object} index - index of the image in the gallery
	 */
	preload : function(index){
		if(window.opera) return;

		var gallery = G.images[G.gallery];
		if(!gallery)
			return;
		(new Image).src = (gallery[index+1] !== undefined) ? gallery[index+1].href : '';
		(new Image).src = (gallery[index-1] !== undefined) ? gallery[index-1].href : '';
	},

	/**
	 * Shows image when user click it
	 * @param {Object} e - event object
	 */
	showImage : function(e){
		var i = this.__index__, e = e || window.event;
		stopDefault(e);

		if (this.__gallery__ && i > -1) {
			G.gallery = this.__gallery__;
			G.show(i);
		} else {
			G.showSingle(this);
		}
	},

	/**
	 * Show single image
	 * @param {Element} elem - reference to element
	 */
	showSingle : function(elem){
		if(!G.isOpen)
			G.open();

		G.hideContent();
		G.showLoadingIcon();
		G.loaderImage.__is_loaded__=false;

		G.loaderImage.src=elem.href;
		G.titleBar.innerHTML = elem.title;
		G.imgIndex.innerHTML = '';
		G.prevBtn.style.visibility = 'hidden';
		G.nextBtn.style.visibility = 'hidden';
	},

	/**
	 * Show image from the gallery
	 * @param {Number} index - index of the image
	 */
	show : function(index){
		if(!index && G.gallery === null)
			return;

		if(!G.isOpen)
			G.open();

		var gallery = G.images[G.gallery],
			i = G.loaderImage,
			prev = G.prevBtn,
			next = G.nextBtn,
			ns = next.style,
			ps = prev.style;

		if(index < 0 || index > gallery.length-1)
			return;

		G.hideContent();
		G.showLoadingIcon();

		i.__is_loaded__=false;
		i.src=gallery[index].href;
		G.titleBar.innerHTML = gallery[index].title;
		G.imgIndex.innerHTML = lng.image+' '+(index+1)+' '+lng.of+' '+gallery.length;

		if(index === 0){
			setOpacity(prev, 0);
			prev.$active = false;
			next.$active = true;
			ps.visibility = 'hidden';
			ns.visibility = 'visible';
		}else if(index === gallery.length-1){
			setOpacity(next, 0);
			prev.$active = true;
			next.$active = false;
			ps.visibility = 'visible';
			ns.visibility = 'hidden';
		}else if(index > 0 || index < gallery.length-1){
			prev.$active = next.$active = true;
			ps.visibility = ns.visibility = 'visible';
		}
		G.current = index;
		window.focus();
	},

	showLoadingIcon:function(){
		G.container.className='LG_loading';
	},
	hideLoadingIcon:function(){
		G.container.className = '';
	},

	/**
	 * Hide container content
	 */
	hideContent:function(){
		for (var i=G.container.childNodes.length; --i>-1;)
			G.container.childNodes[i].style.display = 'none';

		setOpacity(G.picture, 0);
	},

	/**
	 * Show container content
	 */
	showContent:function(){
		var	nodes = G.container.childNodes,
			opt = G.options,
			showLoop = function(){
					for (var i=nodes.length; --i>-1;)
						nodes[i].style.display = 'block';
				};
		if(opt.fadeImage){
			var anime = new Movie(G.picture, 8, opt.speed);
			anime.addThread('opacity', 0, 100);
			anime.addAction(showLoop, 0);
			anime.run();
		}else{
			showLoop();
			setOpacity(G.picture, 100);
		}
	},

	// show next image
	next : function(){
		if(G.current < G.images[G.gallery].length-1)
			G.show(++G.current);
	},

	// show previous image
	prev : function(){
		if(G.current > 0)
			G.show(--G.current)
	}
}

function keyPressHandler(e){
	if(!G.isOpen)
		return;
	var	e=e||window.event,
		code=e.keyCode?e.keyCode:(e.which?e.which:e.charCode);
	switch(code){
		case 110:G.next();break;		// n key
		case 98: G.prev();break;		// b key
		case 102: G.zoomNormal();break;	// f key
		case 43: G.zoomIn();break;		// +
		case 45: G.zoomOut();break;		// -
		case 27: G.close();				// Esc key
	}

	stopDefault(e);
}

function showBtn(){
	if (this.$active)
		fadeIn(this,0,100)
}

function hideBtn(){
	if (this.$active)
		fadeOut(this,100,0)
}

function fadeIn(elem, levelStart, levelEnd, frames, speed){
	levelEnd = levelEnd || 100;
	if (G.options.animate) {
		var anime = new Movie(elem, frames || 5, speed || 40);
		anime.addThread('opacity', levelStart || 0, levelEnd);
		anime.run();
	}else{
		setOpacity(elem, levelEnd);
	}
}

function fadeOut(elem, levelStart, levelEnd, frames, speed){
	levelEnd = levelEnd || 0;
	if (G.options.animate) {
		var anime = new Movie(elem, frames || 5, speed || 40);
		anime.addThread('opacity', levelStart || 100, levelEnd);
		anime.run();
	} else {
		setOpacity(elem, levelEnd);
	}
}

function stopDefault(e){
	if(e.preventDefault)
		e.preventDefault();
	else
		e.returnValue=false;
}

/**
 * Add event listener
 */
function addEvent(obj,type,fn){
	if (window.addEventListener)
		obj.addEventListener( type, fn, false );
	else {
		obj["e"+type+fn] = fn;
		obj[type+fn] = function() {obj["e"+type+fn]( window.event )}
		obj.attachEvent( "on"+type, obj[type+fn] )
	}
}

function extend (target, source) {
	for (var i in source)
		target[i] = source[i];
}

function css(elem, styles){
	extend(elem.style, styles);
}

/**
 * Get the page and viewport size
 * @return {Array}
 */
function getPageSize(){
	var xScroll, yScroll, windowWidth, windowHeight, b = document.body, de = document.documentElement;
	if (window.innerHeight && window.scrollMaxY) {
		xScroll = b.scrollWidth;
		yScroll = window.innerHeight + window.scrollMaxY;
	} else if (b.scrollHeight > b.offsetHeight){ // all but Explorer Mac
		xScroll = b.scrollWidth;
		yScroll = b.scrollHeight;
	} else if (de && de.scrollHeight > de.offsetHeight){ // Explorer 6 strict mode
		xScroll = de.scrollWidth;
		yScroll = de.scrollHeight;
	} else { // Explorer Mac...would also work in Mozilla and Safari
		xScroll = b.offsetWidth;
		yScroll = b.offsetHeight;
	}

	if (self.innerHeight) { // all except Explorer
		windowWidth = self.innerWidth;
		windowHeight = self.innerHeight;
	} else if (de && de.clientHeight) { // Explorer 6 Strict Mode
		windowWidth = de.clientWidth;
		windowHeight = de.clientHeight;
	} else if (b) { // other Explorers
		windowWidth = b.clientWidth;
		windowHeight = b.clientHeight;
	}

	// for small pages with total height less then height of the viewport
	var pageHeight = yScroll < windowHeight? windowHeight : yScroll;

	// for small pages with total width less then width of the viewport
	var pageWidth = xScroll < windowWidth? windowWidth : xScroll;

	return [pageWidth,pageHeight,windowWidth,windowHeight]
}

/**
 * Get coords of scroll bars
 * @return {Array} - [coord horizontal, coord vertical]
 */
function getScrollXY() {
	var scrOfX = 0, scrOfY = 0, b = document.body, de = document.documentElement;
	if( typeof( window.pageYOffset ) == 'number' ) {
		//Netscape compliant
		scrOfY = window.pageYOffset;
		scrOfX = window.pageXOffset;
	} else if( b && ( b.scrollLeft || b.scrollTop ) ) {
		//DOM compliant
		scrOfY = b.scrollTop;
		scrOfX = b.scrollLeft;
	} else if( de && ( de.scrollLeft || de.scrollTop ) ) {
		//IE6 Strict
		scrOfY = de.scrollTop;
		scrOfX = de.scrollLeft;
	}
	return [ scrOfX, scrOfY ];
}

/**
 * Get elements style
 * @param {Object} elem - element
 * @param {Object} name - name of the style to get
 */
function getStyle(elem, name) {
	var d = document.defaultView;
	if (elem.style[name])
		return elem.style[name];

	else if (elem.currentStyle)
		return elem.currentStyle[name];

	else if (d && d.getComputedStyle) {
		name = name.replace(/([A-Z])/g,"-$1");
		name = name.toLowerCase();

		var s = d.getComputedStyle(elem,"");
		return s && s.getPropertyValue(name);
	}
	return null;
}

/**
 * Cross-browser function to set element opacity
 * @param {Element} elem - element
 * @param {Number} level - level of opacity, percent
 */
function setOpacity() {
	setOpacity = arguments[0].filters ?
		function(elem,level){elem.style.filter = "alpha(opacity="+level+")"} :
		function(elem,level){elem.style.opacity = level / 100}
	setOpacity(arguments[0],arguments[1]);
}

/**
 * Create HTML element
 * @param {String} tag - tag name
 * @param {Object} attr - attributes to set, ex: {'name':'someClass',value:'the value'}
 */
function ce(tag, attr){

	var elem = document.createElement(tag);

	if (attr){
		for (var name in attr){
			if(name == 'events'){
				for(var j in attr[name])
					addEvent(elem, j, attr[name][j]);
			}else{
				var value = attr[name];
				if ( typeof value != "undefined" ) {
					if(name == 'class' || name == 'for'){
						name = { "for": "htmlFor", "class": "className" }[name] || name;
						elem[name] = value;
					} else
						elem.setAttribute(name, value);
				}
			}
		}
	}

	for(var i=2, len=arguments.length; i<len; i++){
		if (typeof arguments[i] == 'string')
			elem.innerHTML += arguments[i];
		else
			elem.appendChild(arguments[i]);
	}

	return elem;
}

/**
 * Class which makes and run animations
 * @param {Element} elem - target element
 * @param {Number} num_frames - number of frames
 * @param {Number} speed - time between each frame, msec
 */
function Movie(elem, num_frames, speed){
	if (!elem)
		return null;

	this.elem = elem;
	this.numFrames = num_frames || 0;
	this.frames = [];		// frames array
	this.speed = speed || 10;
}

/**
 * Add thread - the chain of actions to do on the element
 * @param {String} style - style name
 * @param {Number} startValue - value at the beginning of animation
 * @param {Number} endValue - end value
 * @param {Number} startFrame - frame, from which the animation of thread begin
 * @param {Number} endFrame - frame, which ends the animation
 */
Movie.prototype = {
addThread : function(style, startValue, endValue, startFrame, endFrame){
	if (!style || endValue === 'undefined' || endValue === null) return;

	if(style !== 'opacity')
		startValue = parseFloat(getStyle(this.elem, style));

	startFrame = startFrame || 0;
	endFrame = endFrame || this.numFrames;

	var	elem = this.elem,						// reference to current element
		F = this.frames,						// reference to frames collection
		count = (endFrame - startFrame) || 1,	// number of frames, should be at least 1
		isMore = startValue > endValue,
		step = Math.ceil((isMore ? startValue - endValue : endValue - startValue) / count);

	for (startFrame; startFrame<endFrame; startFrame++){
		startValue = isMore ?
			(startValue - endValue) <= step? endValue : Math.ceil(startValue - step) :
			(endValue - startValue) <= step? endValue : Math.ceil(startValue + step);
		if (!F[startFrame])
			F[startFrame] = new MovieFrame;
		F[startFrame].addStyle([elem,style,startValue]);
	}

},

/**
 * Creation of the anonimous function that changes the style
 * @param {Element} elem - target element
 * @param {String} name - style name
 * @param {Number} value - style value
 */
/*createAction : function(elem, name, value){
	return name == 'opacity'?
		function(){setOpacity(elem, value)} :
		function(){elem.style[name] = value+'px'}
},*/

/**
 * Add action to the frame specified
 * @param {Function} func - reference to the function or anonimous function
 * @param {Number} frameNumber - number of frame to put the action in
 */
addAction : function(func, frameNumber){
	this.frames[frameNumber].addAction(func);
},

/**
 * The step - run the next frame
 */
step : function(){
	var frame = this.frames.shift();

	if (frame)
		frame.exec();
	else
		clearInterval(this.interval);
},

/**
 * Show the animation
 */
run : function(){
	clearInterval(this.interval);
	this.step();

	var t = this;
	if (this.numFrames>1)
		this.interval = setInterval(function(){t.step()}, this.speed)
}
}



/**
 * Class "movie frame" contains list of actions to run
 */
function MovieFrame(){
	this.actions = [];
	this.styles = [];
}

MovieFrame.prototype = {
	/**
	 * Add action to the frame
	 * @param {Function} f - anonimous function or reference to the function
	 */
	addAction : function(f){
		this.actions.push(f)
	},

	/**
	 * This function adds one particular style to change
	 * @param {Array} aStyle - object which has this form {array,style,value}
	 */
	addStyle : function(aStyle){
		this.styles.push(aStyle);
	},

	/**
	 * Executes all actions of the frame
	 */
	exec : function(){
		var s = this.styles, act, i;
		for (i=s.length; --i>-1;){
			if(s[i][1]=='opacity')
				setOpacity(s[i][0],s[i][2]);
			else
				s[i][0].style[s[i][1]]=s[i][2]+'px';
		}

		if(act = this.actions.shift()) act();
	}
}

return G;
})();