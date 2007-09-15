/**
 * @author Mateusz
 */
var Crop = {
	
	initialize: function() {
		this.cropBox = $('cropBox');
		new Positioning.addBehaviour(this.cropBox);
		this.imageContainer = $('imageContainer');
		this.leftGreyBox = $('leftGreyBox');
		this.rightGreyBox = $('rightGreyBox');
		this.upperGreyBox = $('upperGreyBox');
		this.lowerGreyBox = $('lowerGreyBox');		
		this.centerCropBox = Crop.centerCropBox.bind(this);
		this.placeGreyBox = Crop.placeGreyBox.bind(this);
		this.setListeners = Crop.setListeners.bind(this);
		this.onCropStop = Crop.onCropStop.bind(this);
		this.onCropStart = Crop.onCropStart.bind(this);
		this.onCropOk = Crop.onCropOk.bind(this);
		this.onCropCancel = Crop.onCropCancel.bind(this);
		this.doCrop = Crop.doCrop.bind(this);
		this.setVisible = Crop.setVisible.bind(this);
		this.enable = Crop.enable.bind(this);
		this.disable = Crop.disable.bind(this);
		Event.observe('image','load',this.centerCropBox);
		options = {
			resizeStop: Crop.resizeStop.bind(this),
			onDrag: Crop.onDrag.bind(this),
			onResize: Crop.onResize.bind(this),
			getMousePos: Crop.getMousePos.bind(this)
		};	
		this.resizeCropBox = new Resizeable.initialize(this.cropBox,options);
		Event.observe(this.cropBox,'dblclick',this.onCropStop.bind(this));
		this.setListeners();
		this.setVisible(false);
		this.isEnabled = true;
	},
	
	resizeStop: function(event) {
		EventStack.clearStack();
		this.resizeCropBox.originalHeight = this.cropBox.getHeight();
		this.resizeCropBox.originalWidth = this.cropBox.getWidth();
	},
	
	onDrag: function(event) {
		if(this.cropBox.getLeft() <= 0 ) this.cropBox.style.left = '0px';
		if(this.cropBox.getTop() <= 0 ) this.cropBox.style.top = '0px';
		if(this.cropBox.getLeft() + this.cropBox.getWidth() > this.cropBox.getParentWidth()) this.cropBox.style.left = this.cropBox.getParentWidth()- this.cropBox.getWidth() + 'px';
		if(this.cropBox.getTop() + this.cropBox.getHeight() > this.cropBox.getParentHeight()) this.cropBox.style.top = this.cropBox.getParentHeight() - this.cropBox.getHeight() + 'px';
		this.placeGreyBox(this.cropBox.getWidth(),this.cropBox.getHeight());
	},
	
	centerCropBox: function() {
		this.cropBox.style.width = this.cropBox.getParentWidth()/2 + 'px';
		this.cropBox.style.height = this.cropBox.getParentHeight()/2 + 'px';
		this.cropBox.style.left = (this.cropBox.getParentWidth() - this.cropBox.getWidth())/2 + "px";
		this.cropBox.style.top = (this.cropBox.getParentHeight() - this.cropBox.getHeight())/2 + "px";
		this.placeGreyBox(this.cropBox.getWidth(),this.cropBox.getHeight());
		this.leftBoxConstraint = this.cropBox.getParentLeft();
		this.topBoxConstraint = this.cropBox.getParentTop();
		this.rightBoxConstraint = this.cropBox.getParentLeft() + this.cropBox.getParentWidth();
		this.bottomBoxConstraint = this.cropBox.getParentTop() + this.cropBox.getParentHeight()-1;//hack without 1 doesn't work;
	},
	
	placeGreyBox: function(width,height) {
		this.lowerGreyBox.style.left = this.cropBox.getLeft()  + 'px';				
		this.lowerGreyBox.style.width = width + 'px';
		this.lowerGreyBox.style.height = this.cropBox.getParentHeight() - this.cropBox.getTop() - height + "px";
		this.lowerGreyBox.style.top = this.cropBox.getTop() + height + "px";
		this.leftGreyBox.style.width = this.cropBox.getLeft() + "px";		
		this.leftGreyBox.style.height = $('imageContainer').getHeight() + 'px';
		this.rightGreyBox.style.width = this.cropBox.getParentWidth() - this.cropBox.getLeft() - width + "px";
		this.rightGreyBox.style.height = $('imageContainer').getHeight() + 'px';
		this.rightGreyBox.style.left = this.cropBox.getLeft()  + width  + "px";
		this.upperGreyBox.style.width = width + 'px';
		this.upperGreyBox.style.left = this.cropBox.getLeft()  + 'px';				
		this.upperGreyBox.style.height = this.cropBox.getTop()  + 'px';
	},
	
	onResize: function(width,height) {
		this.placeGreyBox(width,height);
	},
	getMousePos: function(event) {
		x = Event.pointerX(event);
		y = Event.pointerY(event);
		if(x <= this.leftBoxConstraint) x = this.leftBoxConstraint;
		if(y <= this.topBoxConstraint) y = this.topBoxConstraint;
		if(x >= this.rightBoxConstraint) x = this.rightBoxConstraint;
		if(y >= this.bottomBoxConstraint) y = this.bottomBoxConstraint;
		return {x: x,y: y};		
	},
	
	onCropStop: function(event) {
		Element.hide($('cropOk'),$('cropCancel'));
		this.doCrop();
	},
	
	doCrop: function() {
		if(this.isEnabled) {
			newWidth = this.cropBox.getWidth() 
			newHeight = this.cropBox.getHeight() ;
			startTop = this.cropBox.getTop() ;
			startLeft = this.cropBox.getLeft() ;
			if(newWidth > 35 && newHeight > 35) {
				imageTransformation.crop(startTop,startLeft,newWidth,newHeight,Crop.cropCallback.bind(this));
				imageHistory.enable();
			} else {
				alert('Crop area too small');
			}
			this.disable();
		}
	},
	
	cropCallback: function() {
	   effects.enableRotate();
	   this.enable();
	   
	},
	
	setListeners: function() {
		Event.observe('cropStart','click',this.onCropStart);
		Event.observe('cropOk','click',this.onCropOk);
		Event.observe('cropCancel','click',this.onCropCancel);		
	},
	
	onCropStart: function()	 {
		if(this.isEnabled) {
			this.setVisible(true);	
			Element.show($('cropOk'),$('cropCancel'));
			imageHistory.disable();
			effects.disableRotate();
		}
	},
	
	onCropOk: function() {
		if(this.isEnabled) {
		    Element.hide($('cropOk'),$('cropCancel'));
		    this.doCrop();
		    effects.disableRotate();
		}	
	},
	
	onCropCancel: function() {
		if(this.isEnabled) {
		    Element.hide($('cropOk'),$('cropCancel'));
		    this.setVisible(false);
		    imageHistory.enable();
		    effects.enableRotate();
		}
	},
	
	setVisible: function(setVisible) {
		if(setVisible) {
			Element.show(this.cropBox,this.leftGreyBox,this.rightGreyBox,this.upperGreyBox,this.lowerGreyBox);			
			this.centerCropBox();
			this.placeGreyBox(this.cropBox.getWidth(),this.cropBox.getHeight());
		} else {
			Element.hide(this.cropBox,this.leftGreyBox,this.rightGreyBox,this.upperGreyBox,this.lowerGreyBox,$('cropOk'),$('cropCancel'));							
		}
		resize.imageContainerResize.setVisible(!setVisible);
		this.resizeCropBox.setVisible(setVisible);
	},
	
	enable: function() {
	   this.isEnabled = true;
	},
	
	disable: function() {
	   this.isEnabled = false;
	}
	
}