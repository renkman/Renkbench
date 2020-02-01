/*
*	Just an Amiga Workbench look and feel clone, written in Javascript.
*	Copyright 2008, 2019 by Jan Renken, Hamburg
*	
*	This software is licensed under the GNU General Public License Version 3.0.
*
*	So feel free to use, modify and distribute it.
*
*	Amiga for life...
*/

"use strict";

import {createNode} from "./modules/domTree.js";
import {textConverter} from "./modules/text.js";

//The workbench main object
(() => {
	//The DOM-element of the workbench (<div>)
	var element = {};
	
	//The windows/icons registry
	var registry = [];
	
	//The element currently selected by the user
	var selectedElement = {};
	var oldSelectedElement = {};
	var focus = {};
	
	//The mouse offset
	var offset = {x:0,y:0};
	
	//The creation coordinates of the next icon.
	var iconStartPos = {x:"20px",y:"40px"};
	
	//The highest icon width for rearrangement
	var iconWidth = 0;
	
	// The minimum window size
	var windowMinSize = {x:84,y:78};
	
	//The order of the opened windows
	var openOrder = [];
	
	//The workbench cache for request data
	var cache = {};
	
	//Datetime of last mouse down event 
	var mouseDownTime = new Date();

	//Last element clicked for coubleclick detection
	var lastClickedElement = {};
	
	// The currently selected context menu
	var menuOpenend = null;	
	var dropdownFocus = null;
	
	// The height in of the window title bar in pixels
	const TITLE_BAR_HEIGHT = 21;
	
	// The image path structure
	const IMAGES = "images/";
	
	const WINDOW = IMAGES+"window/";
	
	const ICONS = IMAGES+"icons/";
	
	// The AJAX url paths
	const DATA_PATH = "/data";
	const VERSION_PATH = '/version';
	
	// The workbench main title text
	const MAIN_TITLE = "Renkbench release.";
	
	//The initialization method.
	var init = () =>
	{		
		//Set cursor to wait mode
		changeCursor(true);
		
		// Set version and build numbers
		var versionRequest = createHTTPRequest(VERSION_PATH, createVersionInfo);
		versionRequest.send(null);

		var title = textConverter().convertText(MAIN_TITLE, textConverter().fontColor["blueOnWhite"]);
		var mainTitle = document.getElementById("mainTitle");
		createNode("div").style({
				marginTop:"2px",
			}).innerHtml(title)
			.appendTo(mainTitle);
		
		element=document.getElementById("workbench");
		element.dataset["id"]=0;
		registry.push({
			icon:null,
			pid:-1,
			window: {
				element: element,
				iconStartPos: iconStartPos,
				arrangeIcons: arrangeIcons,
				addIcon : addIcon
			}
		});
		
		element.style.zIndex=1;

		// Disable browser context menu
		element.oncontextmenu = () => false;
				
		if(document.addEventListener)
		{
			element.addEventListener("mousedown", eventHandler(element).mouseDown, true);
			element.addEventListener("touchstart", eventHandler(element).mouseDown, true);
			element.addEventListener("mousemove", eventHandler(element).mouseMove, true);
			element.addEventListener("touchmove", eventHandler(element).mouseMove, true);
			element.addEventListener("mouseup", eventHandler(element).mouseUp, true);
			element.addEventListener("touchend", eventHandler(element).mouseUp, true);
			element.addEventListener("keydown", eventHandler(element).keyDown, true)
		}
		else
		{
			//IE stuff
			element.attachEvent("onmousedown",select(element));
			element.attachEvent("onmousemove",drag);
			element.attachEvent("onmouseup",deselect(element));
		}
		
		//Get data via AJAX request
		var request=createHTTPRequest(DATA_PATH, getWindowsTree);
		request.send(null);
//console.debug(registry);
	};
	
	//Recursive addition to the window registry of a windows object
	var addWindows = (windows,pid) =>
	{
//console.debug(windows);
		for(var i=0;i<windows.length;i++)
		{
			var window=windows[i];
			if(window.content)
				registerWindow(window.window, window.icons, pid, window.menu, window.content);
			if(window.children)
			{
				var newPid=registerWindow(window.window,window.icons,pid);
				addWindows(window.children,newPid);
			}
		}
		//Arrange child icons and set size
//console.debug("PID: %i",pid);
		registry[pid].window.arrangeIcons();
		if(pid>0)
			registry[pid].window.setPosition();
	};
	
	//Adds a window and its icon to the registry
	var registerWindow = (windowProperties, imageProperties, pid, menuProperties, content) =>
	{
//console.debug(windowProperties);
		if(typeof pid !== "number")
			pid=0;

		//Create items
		var window = createWindow(windowProperties);
		window.init();
		
		//Fill the window with content
		if(typeof content=="object")
		{
			if(content.type=="file")
				window.setDownload(content);
			else
				window.setContent(content);
		}
		else
			window.setIconArea();
		
		//Set window id and add items to registry
		var id = registry.length;
		window.setId(id);
		
		// Create the window related context menu	
		var menu = createMenu(menuProperties, id);

		var icon = createIcon(imageProperties);
		icon.init(id, pid);
		icon.element.id += id;
		
		registry.push({
				id: id,
				icon : icon,
				window : window,
				pid : pid,
				menu : menu,
				isSelected : false,
				isTrashcan : false,
				isOpened : false
		});
//console.dir(this.registry);
//console.debug("Id: %i",window.id);
		//this.arrangeIcons();
		return window.id;
	};
	
	var addIcon = (icon) =>{
		element.appendChild(icon.element);
	};

	//Arranges the workbench icons
	var arrangeIcons = () =>
	{
		for(var i=0;i<registry.length;i++)
		{
			if(registry[i].pid!=0)
				continue;
			
			var temp=registry[i]["icon"];
			var right=Math.floor((iconWidth-parseInt(temp.element.style.width))/2);
//console.debug("temp.id: %s, %i+%i=%i",temp.id,temp.initX,right,temp.initX+right);
			temp.element.style.right=(temp.initX+right)+"px";
		}
	};
	
	//Creation functions
	//Creates an icon
	var createIcon = properties =>
	{
		//Create new icon element
		return {
			//The images of this icon
			image : ICONS+properties.image.file,
			imageSelected : ICONS+properties.imageSelected.file,
			initX : 0,
			disk : false,
			title  : properties.title,
			
			//The DOM-element of this icon
			element : {},
			init : function(id, pid)
			{	
				// Image
				var image = createNode("div").class("iconElements").style({
					backgroundImage:"url("+this.image+")",
					width:properties.image.width+"px",
					height:properties.image.height+"px"
				}).
				data({mode:"move"}).
				getNode();
				
				// Icon title 
				var text = textConverter().convertText(this.title, textConverter().fontColor["whiteOnBlue"]);
				var textImage = createNode("div").style({
					marginTop:"2px",
				}).innerHtml(text)
				.getNode();
				
				//Create div element and set background source files
				this.element = createNode("div")
				.class("icon")
				.id("icon_")
				.append(image)
				.append(textImage)
				.data({
					id: id,
					status: "closed"
				})
				.getNode();
					//.style({width:(image.offsetWidth > text.offsetWidth)?image.style.width : text.style.width}).getNode();			
				
				//Setup window containing icon
				var window=registry[pid]["window"];
				window.addIcon(this);
				
				// Coordinates of the next icon are top and right, if it is
				// a direct child of the workbench
				var x=this.element.offsetWidth;
				var y=this.element.offsetHeight;
				this.element.style.width=x+"px";
				this.element.style.height=y+"px";
				
				this.element.style.top=registry[pid]["window"].iconStartPos.y;

				if(pid==0)
				{
					// Set workbench icon with highest width
					if(x>iconWidth)
						iconWidth=x;
					
					this.disk=true;
					this.element.style.right=iconStartPos.x;
					this.initX=parseInt(iconStartPos.x);
					
					// Setup coordinates for next icon
					var nextPosY=parseInt(iconStartPos.y)+y+20;
					var borderBottom=element.offsetTop+element.offsetHeight;
					
					// Just put the next icon under the current one.
					if (nextPosY+y+10<borderBottom)
					{
						iconStartPos.y=nextPosY+"px";
						return;
					}
					
					// Set the next icon left to the current icon column.
					iconStartPos.x=(parseInt(iconStartPos.x)+x+10)+"px";
					iconStartPos.y="40px";
				}
			}
		};
	};
	
	//Creates a window and its content
	var createWindow = properties =>
	{
		return {
			id : 0,
			name : properties.title,
			
			//The DOM-element of this window
			element : {},
			
			// The viewport of this window
			viewport : {},
			
			title : {},
			
			titleInactive : {},
			
			// The creation coordinates of the next icon.
			iconStartPos : {x:"10px",y:"25px"},
			
			// The icons contained by the window
			icons : [],
			
			// A content window does not show any icons.
			hasContent : false,

			// Contains the window's form elements
			formElements : [],
			
			// The minimum width of this window
			minWidth : 400,
			
			// The minimum height of this window
			minHeight : 200,
			
			//The distance between the icons in this window
			iconDistance : 15,
			
			//The maximum count of icons in one row.
			maxIconsInRow : 4,
			
			//The maximum child icon size
			maxIconSize : {x:0, y:0},
			
			//The vertical and horizontal scrollbars
			scrollbar : {
				vertical: {},
				horizontal: {}
			},
			
			// The resize button node of this window
			buttonResize : {},

			// The currently active form of this window
			activeForm : {},

			// Insert mode for form keyboard input
			insertMode : true,
			
			init : function()
			{
				// Create div element and set background source file
				this.element = createNode("div").class("window").
				id("window_").
				style({visibility:"hidden"}).
				// Set custom css properties if there are any.								
				style(properties.css).
				tabIndex(0).
				appendTo(element.parentNode).getNode();
				
				// Create title bar
				/*
				* DOM-Structure:
				*	<div class="titleBar">
				*		<div class="fillerWhiteLeft" />
				*		<div class="fillerBlueLeft" />
				*		<div class="buttonClose" />
				*		<div class="fillerBlueLeft" />
				*		<div class="title" />
				*		<div class="fillerWhiteRight" />
				*		<div class="fillerBlueRight" />
				*		<div class="buttonUp" />
				*		<div class="fillerBlueRight" />
				*		<div class="buttonDown" />
				*		<div class="fillerBlueRight" />
				*		<div class="fillerWhiteRight" />
				*	</div>
				*/
				var title = textConverter().convertText(this.name, textConverter().fontColor["blueOnWhite"]);
				var titleInactive = textConverter().convertText(this.name, textConverter().fontColor["blueOnWhiteInactive"]);
				
				var titleBar = createNode("div").class("titleBar").appendTo(this.element).getNode();
				createNode("div").class("fillerWhiteLeft").appendTo(titleBar);
				createNode("div").class("fillerBlueLeft").appendTo(titleBar);
				createNode("div").class("buttonClose").appendTo(titleBar);
				createNode("div").class("fillerBlueLeft").appendTo(titleBar);
				this.title = createNode("div").class("title").appendTo(titleBar).innerHtml(title).getNode();
				this.titleInactive = createNode("div").class("titleInactive").appendTo(titleBar).innerHtml(titleInactive).getNode();
				createNode("div").class("fillerWhiteRight_1").appendTo(titleBar);
				createNode("div").class("fillerBlueRight").appendTo(titleBar);
				createNode("div").class("buttonUp").appendTo(titleBar);
				createNode("div").class("fillerBlueRight").appendTo(titleBar);
				createNode("div").class("buttonDown").appendTo(titleBar);
				createNode("div").class("fillerBlueRight").appendTo(titleBar);
				createNode("div").class("fillerWhiteRight").appendTo(titleBar);
				
				// Foreach titlebar child node: this.minWidth+=parseInt(element.style.width?element.style.width:0);
				// this.element.style.width=this.minWidth+"px";
							
				// Create vertical scrollbar
				var scrollbarVertical=createNode("div").class("scrollbarVertical").appendTo(this.element).getNode();
				createNode("div").class("scrollButtonUp").appendTo(scrollbarVertical).getNode();
				var scrollSpaceVertical=createNode("div").class("scrollSpaceVertical").appendTo(scrollbarVertical).getNode();
				createNode("div").class("scrollButtonVertical").appendTo(scrollSpaceVertical).getNode();
				createNode("div").class("scrollButtonDown").appendTo(scrollbarVertical).getNode();
				
				this.scrollbar.vertical=scrollbarVertical;

				//Create horizontal scrollbar
				var scrollbarHorizontal=createNode("div").class("scrollbarHorizontal").appendTo(this.element).getNode();
				createNode("div").class("scrollButtonLeft").appendTo(scrollbarHorizontal).getNode();
				var scrollSpaceHorizontal=createNode("div").class("scrollSpaceHorizontal").appendTo(scrollbarHorizontal).getNode();
				createNode("div").class("scrollButtonHorizontal").appendTo(scrollSpaceHorizontal).getNode();
				createNode("div").class("scrollButtonRight").appendTo(scrollbarHorizontal).getNode();
				
				this.scrollbar.horizontal=scrollbarHorizontal;
				
				// Add resize button the window
				this.buttonResize=createNode("div").class("buttonResize").appendTo(this.element).getNode();
								
				// Add viewport
				this.viewport = createNode("div").class("viewport").appendTo(this.element).getNode();
//console.debug("Id: %i, minWidth: %i",this.id,this.minWidth);
			},
			
			// Sets the registry id of the current window
			setId : function(id) {
				this.id=id;				
				this.element.id+=id;
				this.element.dataset["id"]=id;
			},			
			
			//Sets the start position of the window
			setPosition : function()
			{
				//(icon.offsetLeft+(icon.offsetWidth-parseInt(image.style.width))/2)
				var posX=(element.offsetWidth-this.element.offsetWidth)/2;
				var posY=(element.offsetHeight-this.element.offsetHeight)/2;
				this.element.style.left=posX+"px";
				this.element.style.top=posY+"px";
			},
			
			//Adds an icon to the window
			addIcon : function(icon)
			{
				// A content window does not show any icons.
				if(this.hasContent)
					return false;
				
				// Add icon to the dropzone
				this.viewport.childNodes[0].appendChild(icon.element);

				//Get maximum icon size
				var sizeX=parseInt(icon.element.offsetWidth);
				var sizeY=parseInt(icon.element.offsetHeight);

				if(this.maxIconSize.x<sizeX)
					this.maxIconSize.x=sizeX;
				if(this.maxIconSize.y<sizeY)
					this.maxIconSize.y=sizeY;
				
				//Add icon
				this.icons.push(icon);

			},
			
			//Arranges the child icons of the window and resizes it.
			arrangeIcons : function()
			{
				//Set window size
				var height=Math.ceil(this.icons.length/4);
				
				this.element.style.width=(this.maxIconsInRow*(this.maxIconSize.x+this.iconDistance))+"px";
				this.element.style.height=(height*(this.maxIconSize.y+this.iconDistance)+60)+"px";
				this.viewport.childNodes[0].style.width=(this.maxIconsInRow*(this.maxIconSize.x+this.iconDistance))+"px";
				this.viewport.childNodes[0].style.height=(height*(this.maxIconSize.y+this.iconDistance))+"px";
				
				var posX;
				var posY;
				var startX=posX=10;
				var startY=posY=25;
				
				//Rearrange icons
				for(var i=0;i<this.icons.length;i++)
				{
					this.icons[i].element.style.left=posX+"px";
					this.icons[i].element.style.top=posY+"px";
//console.debug("Id: %i, left: %i, top: %i",this.icons[i].id,posX,posY);
					if(this.maxIconsInRow%i==1)
					{
						posX=startX;
						posY+=this.maxIconSize.y+this.iconDistance;
					}
					else
						posX+=this.maxIconSize.x+this.iconDistance;
//console.debug("x: %i, y: %i",icons[i].style.left,icons[i].style.top);
				}
				this.resizeScrollbars();
			},
			
			setIconArea : function()
			{
				createNode("div").class("dropzone").appendTo(this.viewport);
			},

			// Sets the content elements of a window
			setContent : function(content)
			{
//console.dir(content);
				if(typeof content != "object")
					return false;
				
				this.hasContent=true;
				
				// Set the content element
				var contentElement=createNode("div").class("content").appendTo(this.viewport).style(content.css).getNode();

				// Set form if there is any
				if(content.form)
				{
					// Append form
					contentElement.innerHTML = content.form;
					contentElement.childNodes.forEach(node => {
						this.formElements.push(node);
						if(node.className === "textbox")
							createNode("div").class("cursor").appendTo(node);
					});
					

					//Reset window size
					this.element.style.width=Math.max(contentElement.offsetWidth,this.minWidth)+"px";
					this.element.style.height=Math.max(contentElement.offsetHeight,this.minHeight)+"px";
					//this.element.style.width=maxWidth+"px";
					//Reset scrollbar size
					this.resizeScrollbars();
					this.setPosition();
					return;
				}
				
				if(typeof content.title != "string"
				|| typeof content.articles != "object")
					return false;

				// Set the content title
				createNode("div").class("text").innerHtml(textConverter().convertText(content.title, textConverter().fontColor["whiteOnBlue"])).appendTo(contentElement);
				createNode("div").class("stop").appendTo(contentElement);
														
				// Add raw text for search engines and readers
				var rawText = createNode("h1").innerHtml(content.title).getNode();
				createNode("div").class("raw-content").append(rawText).appendTo(contentElement);

				for(var i=0;i<content.articles.length;i++)
				{
					var article=content.articles[i];
					var lastText={};
					for(var contentType in article)
					{
						var temp={};
						//Create elements
						switch(contentType)
						{
							case "title":
							case "text":
								temp=createNode("div").class("text").getNode();
								lastText=temp;
								break;
							case "images":
								var images=article.images;
								for(var j=0;j<images.length;j++)
								{
									var img=document.createElement("img");
									img.src=CONTENT+images[j];
									img.alt=CONTENT+images[j];
									if(lastText.insertBefore)
									{
										//Insert image before the first element, 
										//but behind the last image.
										for(var k=0;k<lastText.childNodes.length;k++)
										{
											var curNode=lastText.childNodes[k];
											if(curNode.nodeName.toLowerCase()!="img")
											{
												lastText.insertBefore(img,curNode);
												break;
											}
											
										}
									}
									else
										contentElement.appendChild(img);
								}
						}
						if(contentType=="images")
							continue;
						
						var text=textConverter().convertText(article[contentType], textConverter().fontColor["whiteOnBlue"]);
						
						// Add raw text for search engines and readers
						var rawText = createNode(contentType === "title" ? "h2" : "p").innerHtml(article[contentType]).getNode();
						createNode("div").class("raw-content").append(rawText).appendTo(contentElement);
//console.debug(text);

						temp.innerHTML=text;
//console.debug("Text written");
						contentElement.appendChild(temp);
						createNode("div").class("stop").appendTo(contentElement);
					}
					
//console.debug(contentElement.offsetWidth);
//console.debug(contentElement.offsetHeight);
					
					//Reset window size
					this.element.style.width=Math.max(contentElement.offsetWidth,this.minWidth)+"px";
					this.element.style.height=Math.max(contentElement.offsetHeight,this.minHeight)+"px";
					//this.element.style.width=maxWidth+"px";
					//Reset scrollbar size
					this.resizeScrollbars();
					this.setPosition();
				}
			},
			
			//Set download file data
			setDownload : function(properties)
			{
				this.type="file";
				this.fileId=properties.fileId;
			},
			
			//Resize scrollbars
			resizeScrollbars : function()
			{
				var scrollbarVertical=this.scrollbar.vertical;
				var scrollbarHorizontal=this.scrollbar.horizontal;
				var scrollSpaceVertical=scrollbarVertical.childNodes[1];
				var scrollSpaceHorizontal=scrollbarHorizontal.childNodes[1];

				//Determine the window height and width	
				var height = this.viewport.offsetHeight;
				var width= this.viewport.offsetWidth;
												
				//Set vertical scrollbar...
				scrollbarVertical.style.height=height+"px"
				//...and scroll space height
				var scrollSpaceHeight=height-32;
				scrollSpaceVertical.style.height=scrollSpaceHeight+"px";
				
				//Set horizontal scrollbar width
				scrollbarHorizontal.style.width=width+"px";
			
				//Set scroll buttons height and width
				var scrollButtonVertical=scrollSpaceVertical.childNodes[0];
				var scrollButtonHorizontal=scrollSpaceHorizontal.childNodes[0];

				var content = this.viewport.childNodes[0];
				
				var factorHeight = Math.min(1, height/content.offsetHeight);
				var factorWidth = Math.min(1, width/content.offsetWidth);

				var scrollHeight = scrollSpaceHeight * factorHeight;
				var scrollWidth = scrollSpaceHorizontal.offsetWidth * factorWidth - 4;
				
				scrollButtonVertical.style.height=scrollHeight+"px";
				scrollButtonHorizontal.style.width=scrollWidth+"px";
				
				// Set scroll button positions
				var left = -content.offsetLeft * factorWidth;
				var top = -content.offsetTop * factorHeight;
				
				var borderX = scrollSpaceVertical.offsetWidth-scrollButtonVertical.offsetWidth-2;
				var borderY = scrollSpaceHorizontal.offsetHeight-scrollButtonHorizontal.offsetHeight-2;
				
				scrollButtonHorizontal.style.left = Math.max(2,Math.min(left, borderX)) + "px";
				scrollButtonVertical.style.top = Math.max(2,Math.min(top, borderY)) + "px";
			},
			
			resize : function(width, height) {
				this.element.style.width=width;
				this.element.style.height=height;
				changeImage(this.buttonResize,"window",WINDOW+"button_resize.png");
				
				var content = this.viewport.children[0];
				if(this.viewport.offsetWidth > content.offsetWidth)
					content.style.left=0;
				if(this.viewport.offsetHeight > content.offsetHeight)
					content.style.top=0;
				
				this.resizeScrollbars();
			},
			
			move : function(left, top) {
				this.element.style.left=left;
				this.element.style.top=top;
			},
			
			moveContentByButton : function(direction) {
				var content = this.viewport.children[0];
				var step = direction === "scrollButtonLeft" || direction ===  "scrollButtonUp" ?  10 : -10;
				var axisX = direction === "scrollButtonLeft" || direction ===  "scrollButtonRight";

				var offsetLeft = this.viewport.offsetWidth-content.offsetWidth;
				var offsetTop = this.viewport.offsetHeight-content.offsetHeight;

				var scrollButtonX = this.scrollbar.horizontal.children[1].children[0];
				var scrollButtonY = this.scrollbar.vertical.children[1].children[0];
				
				var factorX = scrollButtonX.offsetWidth / this.viewport.offsetWidth ;
				var factorY =  scrollButtonY.offsetHeight / this.viewport.offsetHeight;
				
				if(axisX && offsetLeft < 0)
				{
					content.style.left = Math.max(Math.min(0,content.offsetLeft + step), offsetLeft) + "px";
					this.moveScrollButton({movementX:-step * factorX}, scrollButtonX);
				}
				else if(!axisX && offsetTop < 0)
				{
					content.style.top = Math.max(Math.min(0,content.offsetTop + step), offsetTop) + "px";
					this.moveScrollButton({movementY:-step * factorY}, scrollButtonY);
				}
			},
			
			moveScrollButton : function(event, selection) {
				var axisX = selection.className.includes("scrollButtonHorizontal");
				
				var borderX = selection.parentNode.offsetWidth-selection.offsetWidth-2;
				var borderY = selection.parentNode.offsetHeight-selection.offsetHeight-2;
				
				if(axisX)
					selection.style.left=Math.max(2,Math.min(selection.offsetLeft+event.movementX, borderX))+"px";
				else
					selection.style.top=Math.max(2,Math.min(selection.offsetTop+event.movementY, borderY))+"px";
			},
			
			moveContentByScrollbar : function() {
				var scrollButtonX = this.scrollbar.horizontal.children[1].children[0];
				var scrollButtonY = this.scrollbar.vertical.children[1].children[0];
				
				var factorX = this.viewport.offsetWidth / scrollButtonX.offsetWidth;
				var factorY = this.viewport.offsetHeight / scrollButtonY.offsetHeight;
				
				var left = scrollButtonX.offsetLeft * factorX;
				var top = scrollButtonY.offsetTop * factorY;
//console.debug("factorY: %f * scrollButtonY.offsetTop: %f = top: %f", factorY, scrollButtonY.offsetTop, top);
				
				var content = this.viewport.children[0];
				content.style.left = -left + "px";
				content.style.top = -top + "px";
			},
			
			deselect : function() {
				var titlebar = this.element.firstChild;
				changeImage(titlebar,"window",WINDOW+"titlebar_background_deselected.png");
				this.titleInactive.style.display = "block";
				this.title.style.display = "none";

				if(this.formElements.length > 0 && focus === this)
					focus = null;
			},
			
			select : function() {
				var titlebar = this.element.firstChild;
				changeImage(titlebar,"window",WINDOW+"titlebar_background.png");
				this.titleInactive.style.display = "none";
				this.title.style.display = "block";

				if(this.formElements.length === 0)
					return;

				focus = this;
				this.activeForm = this.formElements[0];
			},
				
			open : function() {
				registry[this.id].isOpened = true;
				
				//Download file
				if(this.type=="file")
				{
					var temp=open(DATA_PATH+"/file/get/"+this.fileId,"Download");
					return true;
				}
				
				if(this.element.style.zIndex>0)
					return;
				
				element.appendChild(this.element);
				openOrder.push(this.id);
				this.element.style.zIndex=openOrder.length+1;
				this.element.style.visibility="visible";

				var menu = registry[this.id].menu ? registry[this.id].menu : registry[0].menu;
				menu.updateMenu();
			},

			close : function() {
				element.parentNode.appendChild(this.element);
				this.element.style.zIndex=-1;
				this.element.style.visibility="hidden";
				
				var newOrder=[];
				var curOrder=openOrder;

				//var id = this.element.dataset.id;
				registry[this.id].isOpened = false;

				//Delete closed window from open order.
				for(var i=0;i<curOrder.length;i++)
				{
					if(curOrder[i]!=this.id)
						newOrder.push(curOrder[i]);
				}
				openOrder=newOrder;
				
				var menu = registry[this.id].menu ? registry[this.id].menu : registry[0].menu;
				menu.updateMenu();
			},
			
			enterText : function(event) {
				event.preventDefault();		

				if(event.key === "Insert")
					this.insertMode = !this.insertMode;

				if(cursorIgnoredKeys.includes(event.key))
					return false;

				var cursor = this.activeForm.firstChild;

				if(event.key === "Backspace")
				{
					this.moveCursor(cursorDirection.left, 1);				
					this.removeChar();
					this.moveCursor(0,0);
					return false;
				}

				if(event.key.includes("Arrow"))
				{
					var direction = event.key.replace("Arrow", "");
					this.moveCursor(cursorDirection[direction.toLowerCase()], 1);
					return false;
				}

				if(event.key === "Enter")
				{
					this.moveCursor(cursorDirection.down, 1);
					this.activeForm.firstChild.style.left = 0;
					return false;
				}

				if(event.key === "Tab")
				{
					this.moveCursor(cursorDirection.right, event.shiftKey ? -4 : 4);
					return false;
				}
				
				if(event.key === "Home")
				{
					this.activeForm.firstChild.style.left = 0;
					this.moveCursor(0,0);
					return false;
				}
				
				if(event.key === "End")
				{
					var offsetRight = this.activeForm.offsetWidth % cursor.offsetWidth;
					cursor.style.left = (this.activeForm.offsetWidth - offsetRight - cursor.offsetWidth) + "px";
					this.moveCursor(0,0);
					return false;
				}

				if(event.key === "PageUp")
				{
					var steps = Math.floor(Math.min(cursor.offsetTop, this.viewport.offsetHeight) / cursor.offsetHeight);
					this.moveCursor(cursorDirection.up, steps);
					return false;
				}
				
				if(event.key === "PageDown")
				{
					var steps = Math.floor(Math.min(this.activeForm.offsetHeight - cursor.offsetTop, this.viewport.offsetHeight) / cursor.offsetHeight);
					this.moveCursor(cursorDirection.down, steps);
					return false;
				}
				
				if(event.key === "Delete")
				{
					var nextChars = Array.from(this.activeForm.childNodes)
						.filter(node => node.className === "char" 
							&& node.offsetTop === cursor.offsetTop
							&& node.offsetLeft >= cursor.offsetLeft)
						.sort((a, b) => a.offsetLeft - b.offsetLeft);
					
					if(nextChars.length === 0)
						return false;

					if(nextChars[0].offsetLeft === cursor.offsetLeft)
						this.activeForm.removeChild(nextChars[0]);
					
					nextChars.forEach(node => {
						node.style.left = (node.offsetLeft - node.offsetWidth) + "px";
					});
					this.moveCursor(0, 0);

					return false;
				}

				if(!this.insertMode)
					this.removeChar();

				var character = textConverter().parseChar(event.key, textConverter().fontColor.whiteOnBlue, "text");
				this.activeForm.innerHTML = this.activeForm.innerHTML + character;
				var lastChar = this.activeForm.childNodes[this.activeForm.childNodes.length-1];
				lastChar.style.position = "absolute";
				cursor = this.activeForm.firstChild;
				lastChar.style.left = cursor.offsetLeft + "px";
				lastChar.style.top = cursor.offsetTop + "px";

				// Move trailing characters
				if(this.insertMode)
				{
					Array.from(this.activeForm.childNodes).filter(node => 
						node.className === "char"
						&& node.offsetTop === cursor.offsetTop
						&& node.offsetLeft > cursor.offsetLeft
					).forEach(node => 
						node.style.left = (node.offsetLeft + node.offsetWidth) + "px"
					);
				}

  				this.moveCursor(cursorDirection.right, 1);
				return false;
			},
		
			moveCursor : function (direction, steps) {
				var cursor = this.activeForm.firstChild;
				if(direction === cursorDirection.left && cursor.offsetLeft > 0)
					cursor.style.left = (cursor.offsetLeft - cursor.offsetWidth * steps) + "px";
				if(direction === cursorDirection.right && cursor.offsetLeft + cursor.offsetWidth < cursor.parentNode.offsetWidth)
					cursor.style.left = (cursor.offsetLeft + cursor.offsetWidth * steps) + "px";
				if(direction === cursorDirection.up && cursor.offsetTop > 0)
					cursor.style.top = (cursor.offsetTop - cursor.offsetHeight * steps) + "px";
				if(direction === cursorDirection.down && cursor.offsetTop + cursor.offsetHeight > 0)
					cursor.style.top = (cursor.offsetTop + cursor.offsetHeight * steps) + "px";
				
				var character = Array.from(this.activeForm.childNodes).filter(node => 
					node.className === "char" && 
					node.offsetLeft === cursor.offsetLeft && 
					node.offsetTop === cursor.offsetTop);

				if(cursor.childNodes.length > 0)
					cursor.removeChild(cursor.firstChild);
				if(character.length > 0)
					cursor.innerHTML = textConverter().parseChar(character[0].dataset.char, textConverter().fontColor.blackOnOrange, "text");
			},

			removeChar : function() {
				var cursor = this.activeForm.firstChild;
				var character = Array.from(this.activeForm.childNodes).filter(node => 
					node.className === "char" && 
					node.offsetLeft === cursor.offsetLeft && 
					node.offsetTop === cursor.offsetTop);
				
				if(character.length > 0)
					this.activeForm.removeChild(character[0]);
			}
		};
	};
	
	var createMenu = (items, id) =>
	{
		if(!items)
			return null;

		var create = (items, id) => {
			var menu = createNode("div").id("menu-" + id).getNode();
			for(var itemIndex in items)
			{
				var item = items[itemIndex];
				var dropdown = createNode("div").class("dropdown").appendTo(menu).getNode();
				var title = textConverter().convertText(item.name, textConverter().fontColor.blueOnWhite);
				createNode("button").class("dropdown-title").appendTo(dropdown).innerHtml(title).getNode();
				
				var content = createNode("div").class("dropdown-content").appendTo(dropdown).getNode();
				for(var entryId in item.entries)
				{
					var entry = item.entries[entryId];
					var enabled = entry.conditions === "true";			
					var text = textConverter().convertText(entry.name, enabled ? textConverter().fontColor.blueOnWhite : textConverter().fontColor.blueOnWhiteInactive);
					createNode("div").class(enabled ? "dropdown-entry" : "dropdown-entry-disabled")
						.appendTo(content)
						.innerHtml(text)
						.data({
							command: entry.command,
							conditions : entry.conditions,
							isEnabled : enabled
						})
						.getNode();
				}
			}
			return menu;
		};
		
		var enableMenu = (node, enable) => {
			for(var i=0; i < node.children.length; i++)
			{
				var child = node.children[i];
				enableMenu(child, enable);				
	
				if(!child.className.includes("dropdown-entry"))
					continue;

				if(child.dataset.conditions === "true")
					continue;

				var isEnabled = enabled && enable && checkConditions(child.dataset.conditions);
				child.className = isEnabled ? "dropdown-entry": "dropdown-entry-disabled";
				setMenuEntryColor(child, isEnabled ? textConverter().fontColor.blueOnWhite : textConverter().fontColor.blueOnWhiteInactive);
				child.dataset.isEnabled = isEnabled;
			}
		};

		var checkConditions = conditionString => {
			if(!oldSelectedElement || !oldSelectedElement.dataset || !oldSelectedElement.dataset.id)
				return false;

			var selectedId = oldSelectedElement.dataset.id;
			var record = registry[selectedId];
			var conditions = JSON.parse(conditionString);
			return conditions.every(condition => {
				if(condition.operand === "greaterThan")
					return record[condition.property] > condition.value;
				return record[condition.property] === condition.value;
			});
		};
		
		var update = () => {		
			menu.childNodes.forEach(node => {
				node.childNodes[1].style.zIndex = openOrder.length + 2;
			});

			if(enabled)
				enableMenu(menu, true);
		};
		
		var enabled = false;
		var menu = create(items, window);
		update();
		
		return  {			
			id : id,
			
			// The DOM-element of this menu
			element : menu,

			enableMenu : () => {
				enabled = true;
				enableMenu(menu, true)
			},

			disableMenu : () => {
				enabled = false;
				enableMenu(menu, false)
			},

			updateMenu : () => update()
		};
	};
	
	// Event listener functions
	var select = element => {
		return event => {
			//Store old selection
			var selection=getSelection(event);
			var oldSelection=oldSelectedElement;

			//Count for doubleclick detection
			var lastClicked = mouseDownTime;
			mouseDownTime=new Date();
			var span=mouseDownTime.getTime() - lastClicked.getTime();

			// Determine the last two mousedown events as doubleclick, whether the
			// timespan between them was smaller equal 500 ms
//console.debug("Letzter Klick: %i, Jetzt: %i, Abstand: %i", lastClicked.getTime(), mouseDownTime.getTime(), span);
//console.debug("Current selection: %s", selection.parentNode.id);
//console.debug("Last selection: %s", lastClickedElement.id);
			if(selection.parentNode === lastClickedElement && span<=500 && !selection.className.includes("Button"))
			{
				deselect(element)(event);
				var selection = getSelection(event);
				var image = getIconElement(selection);
				if(image == null)
					return false;
				var window = registry[image.dataset.id].window;
				return window.open();
			}
			lastClickedElement=selection.parentNode;
			
			//Get current offset position
			//For icons, ...
			if(selection.className=="iconElements")
			{
				var parent=selection.parentNode;
				var posX=parent.offsetLeft+(parent.offsetWidth-parseInt(selection.style.width))/2;
				var posY=selection.parentNode.offsetTop;
				
				//Add window position for window contained icons
				var win=getWindowElement(parent);
				
				if(win.id!="workbench")
				{
					posX+=win.offsetLeft;
					posY+=win.offsetTop + 21;
				}
				
				offset.x=event.clientX-posX;
				offset.y=event.clientY-posY;
			}
			//...windows...
			if(selection.className=="titleBar" || 
				isChildOfClass(selection, "title") || 
				isChildOfClass(selection, "titleInactive"))
			{
				var window=getWindowElement(selection);
				offset.x=event.clientX-window.offsetLeft;
				offset.y=event.clientY-window.offsetTop;
				
				//Set window content unselectable
				deactivateSelection(window);
			}
			
			//If the old element was an icon, also change its background image
			if(/^icon_[0-9]+$/.test(oldSelection.id))
			{
				var icon=changeImage(oldSelection,"icon","image");
				icon.element.style.zIndex=1;
			}
		//console.debug("Class: %s",selection.className);
			var frameMode="move";
			var className = (isChildOfClass(selection, "title") || isChildOfClass(selection, "titleInactive")) 
				? "title" 
				: selection.className;
			
			//Select and deselect the windows (if any is selected)
			selectWindow(selection);			

			switch(className)
			{
				//If the element is an icon, change its background image
				case "iconElements":
					var icon=changeImage(selection,"icon","imageSelected");
					//Set icon element as selection
					oldSelectedElement=selection.parentNode;
					selection=copyImage(selection);
					element.appendChild(selection);
					selection.zIndex=-1;
					registry[oldSelectedElement.dataset.id].isSelected = true;
					break;
				//If the element is a window button, change button image
				case "buttonClose":
					changeImage(selection,"window",WINDOW+"button_close_selected.png");
					break;
				case "buttonUp":
					changeImage(selection,"window",WINDOW+"button_up_selected.png");
					break;
				case "buttonDown":
					changeImage(selection,"window",WINDOW+"button_down_selected.png");
					break
				case "buttonResize":
					changeImage(selection,"window",WINDOW+"button_resize_selected.png");
					frameMode="resize";
				case "title":
				case "titleBar":
					var window=getWindowElement(selection);
					oldSelectedElement=window;
					selection=createWindowFrame(window, frameMode);
					break;
				case "buttonOk":
					changeImage(selection,"window",WINDOW+"button_ok_selected.png");
					break;
				case "buttonCancel":
					changeImage(selection,"window",WINDOW+"button_cancel_selected.png");
					break;
				case "scrollButtonLeft":
					changeImage(selection,"window",WINDOW+"button_arrow_left_selected.png");
					break;
				case "scrollButtonUp":
					changeImage(selection,"window",WINDOW+"button_arrow_up_selected.png");
					break;
				case "scrollButtonRight":
					changeImage(selection,"window",WINDOW+"button_arrow_right_selected.png");
					break;
				case "scrollButtonDown":
					changeImage(selection,"window",WINDOW+"button_arrow_down_selected.png");
					break;
				case "scrollButtonVertical":
					selection.className="scrollButtonVerticalSelected";
					break;	
				case "scrollButtonHorizontal":
					selection.className="scrollButtonHorizontalSelected";
					break;						
			}
			selectedElement=selection;
//console.dir(selectedElement);
		};
	};
	
	// Mouseup callback method
	var deselect = workbenchElement => {
		return event =>	{
			var curSelection=getSelection(event);
//console.debug(curSelection);			
			//Check if there is any item to deselect
			var selection=selectedElement;
			if(!selection.id && !selection.className)
				return false;
//console.debug(selection);
				
			//If the stored element is a window button, change button image
			switch(selection.className)
			{
				case "buttonClose":
					changeImage(selection,"window",WINDOW+"button_close.png");
					break;
				case "buttonUp":
					changeImage(selection,"window",WINDOW+"button_up.png");
					break;
				case "buttonDown":
					changeImage(selection,"window",WINDOW+"button_down.png");
					break;
				case "buttonOk":
					changeImage(selection,"window",WINDOW+"button_ok.png");
					break;
				case "buttonCancel":
					changeImage(selection,"window",WINDOW+"button_cancel.png");
					break;
				case "scrollButtonLeft":
					changeImage(selection,"window",WINDOW+"button_arrow_left.png");
					break;
				case "scrollButtonUp":
					changeImage(selection,"window",WINDOW+"button_arrow_up.png");
					break;
				case "scrollButtonRight":
					changeImage(selection,"window",WINDOW+"button_arrow_right.png");
					break;
				case "scrollButtonDown":
					changeImage(selection,"window",WINDOW+"button_arrow_down.png");
					break;
				case "scrollButtonVerticalSelected":
				case "scrollButtonHorizontalSelected":
					selection.className=selection.className.replace("Selected","");
					var windowElement = getWindowElement(curSelection);
					var id = windowElement.dataset["id"];
					var window=registry[id]["window"];
					window.moveContentByScrollbar();
					break;	
				//Move the icon to the current dummy position and delete the dummy
				case "image":
					var icon=oldSelectedElement;
					
					//Set new parent element
					var parentElement=getDropzone();
				
					var id=/^icon_([0-9]+)$/.exec(icon.id)[1];
					if(!registry[id]["icon"].disk
					|| (registry[id]["icon"].disk
					&& parentElement.id==="workbench"))
					{
						// Get position
						var posX=parseInt(selection.style.left)-(parseInt(icon.style.width)-parseInt(selection.style.width))/2;
						var posY=parseInt(selection.style.top);
						// Remove window x and y position for icon positioning
						if(parentElement.className=="dropzone")
						{
							posX-=parentElement.parentNode.parentNode.offsetLeft;
							posY-=parentElement.parentNode.parentNode.offsetTop;
						}
						icon.style.left=posX+"px";
						icon.style.top=posY+"px";
						
						// Select new parent node
						parentElement.appendChild(icon);
					}
//console.debug("parentElement: %s, %s",parentElement.id,parentElement.className);
					
					//Remove dummy
					workbenchElement.removeChild(selection);
					selection=icon;
					break;
				case "frame":
					var windowElement=oldSelectedElement;
					var id=/^window_([0-9]+)$/.exec(windowElement.id)[1];
					var window=registry[id]["window"];
					if(selection.dataset.mode==="resize")
						window.resize(selection.style.width, selection.style.height, curSelection);
					else
						window.move(selection.style.left, selection.style.top);
					
					// var window=oldSelectedElement;
					// window.style.left=selection.style.left;
					// window.style.top=selection.style.top;
//console.debug(selection);
//console.debug(workbenchElement);
					workbenchElement.removeChild(selection);
					//Set window content selectable again
					deactivateSelection(windowElement,true);
					selection=windowElement;
					break;
			}

			//Switch simple button functionality
			switch(curSelection.className)
			{				
				//If the currently selected element is a close button, close the
				//belonging window.
				case "buttonClose":
					//var id=/^window_([0-9]+)$/.exec(selection.parentNode.parentNode.id)[1];
					var id = getWindowElement(selection).dataset.id;
					var window=registry[id]["window"];
					window.close();
					break;
				case "scrollButtonLeft":
				case "scrollButtonUp":
				case "scrollButtonRight":
				case "scrollButtonDown":
					var windowElement = getWindowElement(curSelection);
					var id = windowElement.dataset["id"];
					var window=registry[id]["window"];
					window.moveContentByButton(curSelection.className);
					break;
				case "buttonOk":
					var form=getFormElement(curSelection);

					//Get content element for request data fill.
					var window=getWindowElement(form);
					for(var i=0;i<window.childNodes.length;i++)
					{
						var element=window.childNodes[i];
						if(element.className=="content")
						{
							cache=element;
							break;
						}
					}
					//Fire request
					changeCursor(true);
					sendPOSTRequest(form,getRequestData);
				//Hide the form
				case "buttonCancel":
					var form=getFormElement(curSelection);
					form.style.zIndex=-2;
					break;
			}
			
			//Up and down button behavior
			if((curSelection.parentNode
			&& curSelection.parentNode.id!="mainBar")
			&& (curSelection.className=="buttonUp"
			|| curSelection.className=="buttonDown"))
			{
				var id = getWindowElement(selection).dataset["id"];
				var order=openOrder;
				var window=registry[id]["window"].element;
//console.debug(curSelection.className);
				var change=false;
//console.dir(order);
				if(curSelection.className=="buttonUp")
				{
					for(var i=0;i<order.length-1;i++)
					{
						if(order[i]==id)
							change=true;
						if(!change)
							continue;
						
//console.debug("order[%i]: %i, order[%i]: %i",i,order[i],i+1,order[i+1]);
						order[i]=order[i+1];
						var temp=registry[order[i]]["window"].element;
						temp.style.zIndex=i+2;
					}
					window.style.zIndex=order.length+1;
					order[order.length-1]=id;
				}
				else
				{
					for(var i=order.length-1;i>0;i--)
					{
						if(order[i]==id)
							change=true;
						if(!change)
							continue;

//console.debug("order[%i]: %i, order[%i]: %i",i,order[i],i-1,order[i-1]);
						order[i]=order[i-1];
						var temp=registry[order[i]]["window"].element;
						temp.style.zIndex=i+2;
					}
					window.style.zIndex=1;
					order[0]=id;
				}
//console.dir(order);
			}

			if(oldSelectedElement != selection && oldSelectedElement.dataset && oldSelectedElement.dataset.id)
				registry[oldSelectedElement.dataset.id].isEnabled = false;

			oldSelectedElement=selection;
			selectedElement={};
		};
	};
	
	//Moves the icon and window elements
	var drag = event =>
	{
		var selection = selectedElement;	

		//Look if there is an item to drag
		if(selection.className!=="image"
		&& selection.className!=="frame"
		&& selection.className!=="scrollButtonHorizontalSelected"
		&& selection.className!=="scrollButtonVerticalSelected")
			return false;
//console.debug("Class: %s, id: %s, left: %s, top: %s",selection.className,selection.id,selection.style.left,selection.style.top);
//console.dir(selection);
//console.dir(event.target);		
		if(!event)
			event=window.event;
		
		if(selection.dataset.mode==="resize")
			return resize(event, selection); // resize(event, selection);
		else if(selection.dataset.mode==="move")
			return move(event, selection);

		// Scroll button moving
		var windowElement = getWindowElement(selection);
		var id = windowElement.dataset["id"];
		var window=registry[id]["window"];
		
		window.moveScrollButton(event, selection);	
	};
	
	var move = (event, selection) => {		
		//Calculate new window position
		var newPosX=event.clientX-offset.x;
		var newPosY=event.clientY-offset.y;
//console.debug("x: %i, y: %i",newPosX,newPosY);
			
		//Set drag element to foreground
		selection.style.zIndex=openOrder.length+2;		
//console.debug(selection.style.zIndex);
		
		//Check if the item will only be dragged in the workbench div
		var sizeX=selection.offsetWidth;
		var sizeY=selection.offsetHeight;
		var borderLeft=element.offsetLeft;
		var borderRight=element.offsetLeft+element.offsetWidth;
		var borderTop=element.offsetTop;
		var borderBottom=element.offsetTop+element.offsetHeight;
//console.debug("borderLeft: %i, borderRight: %i, borderTop: %i, borderBottom: %i",borderLeft,borderRight,borderTop,borderBottom);
//console.debug("newPosX: %i, newPosX+sizeX: %i, newPosY: %i, newPosY+sizeY: %i",newPosX,newPosX+sizeX,newPosY,newPosY+sizeY);
		if(borderLeft >= newPosX || borderRight <= newPosX+sizeX
		|| borderTop >= newPosY-TITLE_BAR_HEIGHT)// || borderBottom <= newPosY+sizeY)
			return false;
		
		//Move item
		selection.style.top=newPosY+"px";
		selection.style.left=newPosX+"px";
//console.debug("x: %s, y: %s",selection.style.top,selection.style.left);
		return false;
	};
	
	var eventHandler = element => {
		var element = element;
		return {
			mouseDown : event => {
				resetTitleBar();
				if(event.button === 0)
					return select(element)(event);
				if(event.button === 2)
					return showMenu();
				return false;
			},
			mouseUp : event => {
				if(event.button === 0)
					return deselect(element)(event);
				if(event.button === 2)
				{
					executeMenuCommand(event);
					hideMenu();
					return 
				}
				return false;
			},
			mouseMove : event => {
				if(selectedElement.nodeType)
					return drag(event);
				return hoverContextMenu(event.target);
			},
			keyDown : event => {
				event.preventDefault();
				if(focus && focus.enterText)
					return focus.enterText(event);
				return false;
			}
		}
	};
	
	// Shows the context menu
	var showMenu = () => {
		var mainBarDefault = document.getElementById("main-bar-default");
		var menu = document.getElementById("main-menu");
		var id = oldSelectedElement.dataset !== undefined && oldSelectedElement.dataset["id"] !== undefined  ? oldSelectedElement.dataset["id"] : 0;
		
		// Get main menu as default menu
		var currentMenu = registry[id].menu ? registry[id].menu : registry[0].menu;
		if(oldSelectedElement.className === "icon")
			currentMenu.enableMenu();
		else
			currentMenu.disableMenu();
		
		menu.appendChild(currentMenu.element);
		menu.style.display = "block";
		mainBarDefault.style.display = "none";
		return false;
	};
	
	// Hides the context menu
	var hideMenu = () => {
		var mainBarDefault = document.getElementById("main-bar-default");
		var menu = document.getElementById("main-menu");
		menu.style.display = "none";
		mainBarDefault.style.display = "block";

		// Reset hover effects
		hoverContextMenu(element);

		return false;
	};

	var executeMenuCommand = event => {
		var menuEntry = getParentWithClass(event.target, "dropdown-entry");
		if(!menuEntry)
			return;		

		var command = menuEntry.dataset.command;
		if(menuEntry.dataset.conditions === "true" && core[command])
		{
			core[command]();
			return;
		}

		if(!oldSelectedElement || !oldSelectedElement.dataset || !oldSelectedElement.dataset.id)
			return;

		var id = oldSelectedElement.dataset.id;
		var window = registry[id].window;
		if(window[command])
			window[command]();
	};	

	var hoverContextMenu = node => {
		if(menuOpenend && !node.className.includes("dropdown") && !menuOpenend.contains(node) && !isChildOfClass(node, "dropdown"))
		{	
			hoverMenuEntry(menuOpenend);
			menuOpenend = null;
		}
	
		if(dropdownFocus && node !== dropdownFocus && !dropdownFocus.contains(node))
		{
			hoverMenuEntry(dropdownFocus);
			dropdownFocus = null;
		}

		if(menuOpenend === null && (node.className === "dropdown-title" || node.className === "dropdown" || node.className === "dropdown-content"))
		{
			if(node.className === "dropdown")
				node = node.firstChild;

			if(node.className === "dropdown-content")
				node = node.parentNode.firstChild;
			
			hoverMenuEntry(node);
			menuOpenend = node;
			return false;
		}
		
		if(dropdownFocus === null && (node.className === "dropdown-entry" || isChildOfClass(node, "dropdown-entry")))
		{
			var menuEntry = node.className === "dropdown-entry" ? node : node.parentNode.parentNode;
			
			var isEnabled = menuEntry.dataset.isEnabled === "true";
			if(!isEnabled)
				return false;

			hoverMenuEntry(menuEntry);
			dropdownFocus = menuEntry;
			return false;
		}
		return false;
	};

	var hoverMenuEntry = menuEntry => switchMenuEntryColor(menuEntry, textConverter().fontColor.orangeOnBlack, textConverter().fontColor.blueOnWhite);

	var switchMenuEntryColor = (menuEntry, fromColor, toColor) => {
		for(var i = 0; i < menuEntry.children.length; i++)
		{
			var word = menuEntry.children[i];
			for(var j = 0; j < word.children.length; j++)
			{
				var position = word.children[j].style.backgroundPosition;
				var coordinates = position.split(" ");
				var currentColor = -parseInt(coordinates[1]);
				var color = currentColor == fromColor ? toColor : fromColor;
				word.children[j].style.backgroundPosition = coordinates[0] + " -" + color + "px";
			}
		}
	};

	var setMenuEntryColor = (menuEntry, color) => {
		menuEntry.childNodes.forEach(word => {
			word.childNodes.forEach(character => {
				var position = character.style.backgroundPosition;
				var coordinates = position.split(" ");
				character.style.backgroundPosition = coordinates[0] + " -" + color + "px";
			});
		});
	};
	
	var resize = (event, selection) => {
		//Calculate new window size
		var newPosX=event.clientX;
		var newPosY=event.clientY;
		
		var borderRight=element.offsetLeft+element.offsetWidth;
		var borderBottom=element.offsetTop+element.offsetHeight;

		if(newPosX>=borderRight || newPosY>=borderBottom
		|| newPosX<=selection.offsetLeft || newPosY<=selection.offsetTop)		
			return false;
			
		//Set drag element to foreground
		selection.style.zIndex=openOrder.length+2;
		
		// Resize frame
		selection.style.width=Math.max(windowMinSize.x,newPosX-selection.offsetLeft)+"px";
		selection.style.height=Math.max(windowMinSize.y,newPosY-selection.offsetTop)+"px";

		return false;
	};

	//Changes the selection status of the titlebar
	var selectWindow = element =>
	{
		for(var i=1;i<registry.length;i++)
			registry[i].window.deselect();			
		
		//If the worbench is clicked, only deleselect the windows
		//and then return
		if(element.id==="workbench")
			return;
		
		//Get the window titlebar
		element=getWindowElement(element);
		var id = element.dataset["id"];
		if(id < 1)
			return;

		var window = registry[id].window;
		window.select();
		//if(element.id!=="workbench")
		//	changeImage(element.firstChild,"window",WINDOW+"titlebar_background.png");
	};
	
	//Get the window element of the current element.
	var getWindowElement = element =>
	{
		if(element.className==="window" || element.id==="workbench")
			return element;
		return getWindowElement(element.parentNode);
	};
	
	//Get the icon element of the current element.
	var getIconElement = element =>
	{
		if(!element.parentNode)
			return null;
		if(element.className === "icon")
			return element;
		return getIconElement(element.parentNode);
	};
	
	//Get the form element of the current form.
	var getFormElement = element =>
	{
		if(element.nodeName.toLowerCase()=="form")
			return element;
		return getFormElement(element.parentNode);
	};
	
	// Determines whether an element is a child node 
	// of a node with the passed class name
	var isChildOfClass = (element, className) => {
		if(element.className === className)
			return true;
		if(!element.parentNode)
			return false;
		return isChildOfClass(element.parentNode, className);
	};

	// Gets the anchestor element
	var getParentWithClass = (node, className) => {
		if(!node.className)
			return null;
		if(node.className.toLowerCase() === className.toLowerCase())
			return node;
		return getParentWithClass(node.parentNode, className);
	};
	
	// Gets the anchestor element
	var hasChildWithClass = (node, className) => {
		if(node.className.toLowerCase() === className.toLowerCase())
			return node;
		
		for(let child of node.childNodes)
		{
			hasChildWithClass(child, className);
		}
	};

	//Changes/switches the background image of an icon or a window/workbench
	//button.
	var changeImage = (element, type, image) =>
	{
//console.debug(type);
//console.debug(image);
//console.dir(element);
		var id=0;
		var item={}
		var file="";
		
		switch(type)
		{
			case "window":
				id = getWindowElement(element).dataset["id"];
				if(id < 0)
					item=Workbench;
				else
					item=registry[id][type];
				file=image;
				break;
			case "icon":
				id=getIconElement(element).id;
				element=(element.className=="icon")?element.firstChild:element;
				id=/^icon_([0-9]+)$/.exec(id)[1];
				item=registry[id][type];
				file=item[image];
				break;
		}
		//Get image from icon object members or via direct file path
		element.style.backgroundImage="url("+file+")";
		return item;
	};
	
	//Copies the given image element.
	var copyImage = element =>
	{
		var icon=element.parentNode;
		var image=element.cloneNode(true);
		var posX=(icon.offsetLeft+(icon.offsetWidth-parseInt(image.style.width))/2);
		var posY=icon.offsetTop;

		//Add window position for window contained icons
		var win=getWindowElement(icon);
		if(win.id!="workbench")
		{
			posX+=win.offsetLeft;
			posY+=win.offsetTop;
		}

		image.style.left=posX+"px";
		image.style.top=posY+"px";
		//image.style.zIndex=openOrder.length+2;
		image.style.zIndex=-1;
		image.style.position="absolute";
		image.className="image";
		return image;
	};
	
	//Creates red frame for window dragging.
	var createWindowFrame = (window, frameMode) =>
	{		
		var frame=createNode("div").class("frame").
		style({
			width:(window.offsetWidth-4)+"px",
			height:(window.offsetHeight-4)+"px",
			top:(window.offsetTop)+"px",
			left:window.offsetLeft+"px",
			borderColor:"#ff8800",
			borderWidth:"2px",
			borderStyle:"solid",
			zIndex:-1,
			position:"absolute"
		}).
		data({mode:frameMode}).
		appendTo(element).getNode();
		return frame;
	};
	
	// Get Dropzone
	var getDropzone = () =>
	{
		// Get dragged icon position
		var icon=selectedElement;
		var posX=icon.offsetLeft+icon.offsetWidth/2;
		var posY=icon.offsetTop+icon.offsetHeight/2;

		// Get possible dropzone elements:
		// The workbench and displayed windows (means zIndex >= 0)
		var elements = Array.from(document.getElementsByTagName("div"))
			.filter(node => (node.className === "window" && parseInt(node.style.zIndex) >= 0) || node.id === "workbench")
			.sort((a, b) =>parseInt(b.style.zIndex) - parseInt(a.style.zIndex))
			.filter(node => node.offsetLeft < posX && node.offsetTop < posY 
				&& node.offsetLeft + node.offsetWidth > posX && node.offsetTop + node.offsetHeight > posY);

		var node = elements[0];
		if(node.id === "workbench")
			return node;

		var window = registry[node.dataset.id].window;
		return window.viewport.childNodes[0];
	};
	
	//Get selected element browser specific event object
	var getSelection = event =>
	{
		if(!event)
		{
			event=window.event;
			return event.srcElement;
		}
		//Mozilla Firefox
		else if(event.target)
			return event.target;
		//MS IE 7
		else
			return event.srcElement;
	};
	
	//Creates a new HTTPRequest instance.
	var createHTTPRequest = (url,callbackFunc,method) =>
	{
		if(!method)
			method="GET";
		var request;
		if (window.XMLHttpRequest)
			request=new XMLHttpRequest();
		else
			request=new ActiveXObject("Microsoft.XMLHTTP");
//console.debug("Method: %s, url: %s",method, url);
		request.open(method, url, true);
		request.onreadystatechange = callbackFunc;
		if(method=="POST")
			request.setRequestHeader("Content-Type", 
				"application/x-www-form-urlencoded; charset=UTF-8");
		return request;
	};
	
	//Callback function for AJAX response
	var getWindowsTree = (event) =>
	{
		if(event.target.readyState != 4)
			return;

		//Register the windows, icons and the content
		var data = JSON.parse(event.target.response)
		addWindows(data.windows, 0);

		// Create the main context menu	
		var menu = createMenu(data.menu, 0);
		registry[0].menu = menu;

		//Change cursor to normal mode
		changeCursor();
	};
	
	//Sends an AJAX POST request.
	var sendPOSTRequest = (form,callbackFunc) =>
	{
		var request=createHTTPRequest(form.action,callbackFunc,"POST",form);
		var data=[];
		for(var i=0;i<form.elements.length;i++)
		{
			var node=form.elements[i]
			if((name=node.name)
			&& (value=validate(node.value)))
				data.push(name + "=" + encodeURIComponent(value));
		}
		request.send(data.join("&"));
	};
	
	//Returns the requested json object.
	var getRequestData = () =>
	{
		if(this.readyState!=4)
			return;
		if(cache.innerHTML)
			cache.innerHTML=eval(this.responseText).join("");
		changeCursor();
	};
	
	//Validates a value before it will be transmitted.
	var validate = value =>
	{
		if(value.match(/<.*>/))
			return false;
		return value;
	};

	//Changes between mouse cursors (Normal and wait)
	var changeCursor = wait =>
	{
		var bodyElement=document.getElementsByTagName("body")[0];
		bodyElement.style.cursor=wait?
		"url(images/window/cursor_wait.png), url(images/window/cursor_wait.cur), default":
		"url(images/window/cursor.png), url(images/window/cursor.cur), default";
	};
	
	//Sets the text of an element temporary non-selectable
	var deactivateSelection = (element, select) =>
	{
		var cssProperty=select?"text":"none";
		
		//Set properties for Firefox...
		element.style.MozUserSelect=cssProperty;
		//... and KHTML-browsers.
		element.style.KhtmlUserSelect=cssProperty;
	};

	var createVersionInfo = (event) => {
		if(event.target.readyState != 4)
			return;
		
		var versionInfo = JSON.parse(event.target.response)

		var text = "Renkbench version " + versionInfo.version + " Build " + versionInfo.build + " Release " + versionInfo.release;
		var info = document.getElementById("info-bar");
		var textNode = textConverter().convertText(text, textConverter().fontColor.blueOnWhite);
		createNode("div").style({
			marginTop:"2px",
		}).innerHtml(textNode)
		.appendTo(info);
	};
		
	var core = {
		version : () => {
			var infoNode = document.getElementById("info-bar");
			infoNode.style.display = "block";
			var titleNode = document.getElementById("mainTitle");
			titleNode.style.display = "none";
		}
	};

	var resetTitleBar = () => {
		var infoNode = document.getElementById("info-bar");
		infoNode.style.display = "none";
		var titleNode = document.getElementById("mainTitle");
		titleNode.style.display = "block";
	};

	var cursorDirection = {
		up: 0,
		right: 1,
		down: 2,
		left: 3	
	};

	var cursorIgnoredKeys = [
		"Alt", "Control", "Shift", "AltGraph", "OS", "Escape",
		"ContextMenu", "Insert", "CapsLock", "F1", 
		"F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", 
		"F11", "F12"
	];

	// Initialize workbench
	init();	
})();
