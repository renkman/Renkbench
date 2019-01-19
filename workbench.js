/*
*	Just an Amiga Workbench look and feel clone, written in Javascript.
*	Copyright 2008 by Jan Renken, Hamburg
*	
*	This software is licensed under the GNU General Public License Version 2.0.
*
*	So feel free to use, modify and distribute it.
*
*	Amiga for life...
*/

//The workbench main object
var Workbench = {
	//The DOM-element of the workbench (<div>)
	element : {},
	
	//The windows/icons registry
	registry : [],
	
	//The element currently selected by the user
	selectedElement : {},
	oldSelectedElement : {},
	
	//The mouse offset
	offset : {x:0,y:0},
	
	//The creation coordinates of the next icon.
	iconStartPos : {x:"20px",y:"40px"},
	
	//The highest icon width for rearrangement
	iconWidth : 0,
	
	//The order of the opened windows
	openOrder : [],
	
	//The workbench cache for request data
	cache : {},
	
	//Datetime of last mouse down event 
	mouseDownTime : new Date(),
	
	//The image path structure
	IMAGES : "images/",
	
	//The AJAX URL
	URL : "workbench.php",
	
	//The initialization method.
	init : function()
	{
		//Set cursor to wait mode
		Workbench.changeCursor(true);
		
		this.element=document.getElementById("workbench");
		this.registry.push({icon:null,pid:-1,window:this});
		this.element.style.zIndex=1;
		
		this.ICONS = this.IMAGES+"icons/";
		this.WINDOW = this.IMAGES+"window/";
		this.CONTENT = this.IMAGES+"content/";
		
		if(document.addEventListener)
		{
			this.element.addEventListener("mousedown",Workbench.select,true);
			this.element.addEventListener("mousemove",Workbench.drag,true);
			this.element.addEventListener("mouseup",Workbench.deselect,true);
		}
		else
		{
			//IE stuff
			this.element.attachEvent("onmousedown",Workbench.select);
			this.element.attachEvent("onmousemove",Workbench.drag);
			this.element.attachEvent("onmouseup",Workbench.deselect);
		}
		
		//Get data via AJAX request
		var request=this.createHTTPRequest(Workbench.URL,Workbench.getWindowsTree);
		request.send(null);
	},
	
	//Recursive addition to the window registry of a windows object
	addWindows : function(windows,pid)
	{
		for(var i=0;i<windows.length;i++)
		{
			var window=windows[i];
			if(window.content)
				this.registerWindow(window.window,window.icons,pid,window.content);
			if(window.children)
			{
				newPid=this.registerWindow(window.window,window.icons,pid);
				this.addWindows(window.children,newPid);
			}
		}
		//Arrange child icons and set size
//console.debug("PID: %i",pid);
		Workbench.registry[pid].window.arrangeIcons();
		if(pid>0)
			Workbench.registry[pid].window.setPosition();
	},
	
	//Adds a window and its icon to the registry
	registerWindow : function(windowProperties, imageProperties, pid, content)
	{
		/*
		if(typeof name!="string" || name=="" 
		|| typeof image!="string" || image=="")
			return false;
		*/
//console.debug(windowProperties);
		if(typeof pid!="number")
			pid=0;
		/*
		if(typeof imageSelected!="string" || imageSelected=="" )
			imageSelected=image;
		*/
				
		//Create items
		var icon=this.createIcon(imageProperties);
		var window=this.createWindow(windowProperties);
		icon.init(pid);
		window.init();
		
		//Fill the window with content
		if(typeof content=="object")
		{
			if(content.type=="file")
				window.setDownload(content);
			else
				window.setContent(content);
		}
		//Set window id and add items to registry
		window.id=this.registry.length;
		icon.element.id+=window.id;
		window.element.id+=window.id;
		this.registry.push({
				icon : icon,
				window : window,
				pid : pid});
//console.dir(this.registry);
//console.debug("Id: %i",window.id);
		//this.arrangeIcons();
		return window.id;
	},
	
	//Arranges the workbench icons
	arrangeIcons : function()
	{
		for(var i=0;i<this.registry.length;i++)
		{
			if(this.registry[i].pid!=0)
				continue;
			
			var temp=this.registry[i]["icon"];
			var right=Math.floor((this.iconWidth-parseInt(temp.element.style.width))/2);
//console.debug("temp.id: %s, %i+%i=%i",temp.id,temp.initX,right,temp.initX+right);
			temp.element.style.right=(temp.initX+right)+"px";
		}
	},
	
	//Creation functions
	//Creates an icon
	createIcon : function(properties)
	{
		//Create new icon element
		return {
			//The images of this icon
			image : Workbench.ICONS+properties.image.file,
			imageSelected : Workbench.ICONS+properties.imageSelected.file,
			imageText : Workbench.ICONS+properties.imageText.file,
			initX : 0,
			disk : false,
			
			//The DOM-element of this icon
			element : {},
			init : function(pid)
			{
				//Create div element and set background source files
				this.element = document.createElement("div");
				var image=document.createElement("div");
				var text=document.createElement("div");
				
				image.className="iconElements";
				image.style.backgroundImage="url("+this.image+")";
				text.style.backgroundImage="url("+this.imageText+")";
				text.style.marginTop="2px";
				this.element.className = "icon";
				this.element.id="icon_";
				
				image.style.width=properties.image.width+"px";
				image.style.height=properties.image.height+"px";
				text.style.width=properties.imageText.width+"px";
				text.style.height=properties.imageText.height+"px";
				
				//Setup element
				this.element.appendChild(image);
				this.element.appendChild(text);
				Workbench.registry[pid]["window"].element.appendChild(this.element);
				
				this.element.style.top=Workbench.registry[pid]["window"].iconStartPos.y;
				
				//Coordinates of the next icon are top and right, if it is
				//a direct child of the workbench
				this.element.style.width=(image.offsetWidth>text.offsetWidth)
					?image.style.width:text.style.width;
				var x=this.element.offsetWidth;
				var y=this.element.offsetHeight;
				this.element.style.width=x+"px";
				this.element.style.height=y+"px";
				
				if(pid==0)
				{
					//Set workbench icon with highest width
					if(x>Workbench.iconWidth)
						Workbench.iconWidth=x;
					
					this.disk=true;
					this.element.style.right=Workbench.iconStartPos.x;
					this.initX=parseInt(Workbench.iconStartPos.x);
					
					//Setup coordinates for next icon
					var nextPosY=parseInt(Workbench.iconStartPos.y)+y+20;
					var borderBottom=Workbench.element.offsetTop+Workbench.element.offsetHeight;
					//Just put the next icon under the current one.
					if (nextPosY+y+10<borderBottom)
					{
						Workbench.iconStartPos.y=nextPosY+"px";
						return;
					}
					
					//Set the next icon left to the current icon column.
					Workbench.iconStartPos.x=(parseInt(Workbench.iconStartPos.x)+x+10)+"px";
					Workbench.iconStartPos.y="40px";
					return;
				}
				//Setup window containing icon
				var registry=Workbench.registry;
				var window=registry[pid]["window"];
				window.addIcon(this);
			}
		};
	},
	
	//Creates a window and its content
	createWindow : function(properties)
	{
		return {
			id : 0,
			name : Workbench.ICONS+properties.file,
			
			//The DOM-element of this window
			element : {},
			
			//The creation coordinates of the next icon.
			iconStartPos : {x:"10px",y:"25px"},
			
			//The icons contained by the window
			icons : [],
			
			//A content window does not show any icons.
			hasContent : false,
			
			//The minimum width of this window
			minWidth : 100,
			
			//The distance between the icons in this window
			iconDistance : 15,
			
			//The maximum count of icons in one row.
			maxIconsInRow : 4,
			
			//The maximum child icon size
			maxIconSize : {x:0, y:0},
			
			init : function()
			{
				//Create div element and set background source file
				this.element=document.createElement("div");
				this.element.className="window";
				//this.element.style.height="100px";
				//this.element.style.zIndex=-1;
				this.element.id="window_";
				this.element.style.visibility="hidden";
				
				//Create title bar.
				var titleBar=document.createElement("span");
				var buttonClose=document.createElement("div");
				var title=document.createElement("div");
				var buttonUp=document.createElement("div");
				var buttonDown=document.createElement("div");
				
				titleBar.className="titleBar";
				
				buttonClose.className="buttonClose";
				
				title.className="title";
				title.style.backgroundImage="url("+this.name+")";
				title.style.width=properties.width+"px";
				title.style.height=properties.height+"px";
				
				buttonUp.className="buttonUp";
				buttonDown.className="buttonDown";
				
				//Create title bar
				/*
				* DOM-Structure:
				*	<span class="titleBar">
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
				*	</span>
				*/
				for(var i=0;i<12;i++)
				{
					var element=document.createElement("div");
					switch (i)
					{
						case 2:
							element=buttonClose;
							break;
						case 4:
							element=title;
							break;
						case 7:
							element=buttonUp;
							break;
						case 9:
							element=buttonDown;
							break;
						case 0:
							element.className="fillerWhiteLeft";
							break;
						case 1:
						case 3:
							element.className="fillerBlueLeft";
							break;
						case 5:
							element.className="fillerWhiteRight_1";
							break;
						case 6:
						case 8:
						case 10:
							element.className="fillerBlueRight";
							break;
						case 11:
							element.className="fillerWhiteRight"
					}
					this.minWidth+=parseInt(element.style.width?element.style.width:0);
					titleBar.appendChild(element);
				}
				this.element.appendChild(titleBar);
				this.element.style.width=this.minWidth+"px";
//console.dir(properties);
				//Set css properties if there are any.
				if(properties.css)
				{
					for(var key in properties.css)
					{
						this.element.style[key]=properties.css[key];
					}
				}
				
				//Setup element
				//Workbench.element.appendChild(this.element);
				Workbench.element.parentNode.appendChild(this.element);
//console.debug("Id: %i, minWidth: %i",this.id,this.minWidth);
			},
			
			//Sets the start position of the window
			setPosition : function()
			{
				//(icon.offsetLeft+(icon.offsetWidth-parseInt(image.style.width))/2)
				var posX=(Workbench.element.offsetWidth-this.element.offsetWidth)/2;
				var posY=(Workbench.element.offsetHeight-this.element.offsetHeight)/2;
				this.element.style.left=posX+"px";
				this.element.style.top=posY+"px";
			},
			
			//Adds an icon to the window
			addIcon : function(icon)
			{
				//A content window does not show any icons.
				if(this.hasContent)
					return false;
				
				//Get maximum icon size
				var sizeX=parseInt(icon.element.style.width);
				var sizeY=parseInt(icon.element.style.height);
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
				this.element.style.height=(height*(this.maxIconSize.y+this.iconDistance)+20)+"px";
				
				var startX=posX=10;
				var startY=posY=25;
				
				//Rearrange icons
				for(var i=0;i<this.icons.length;i++)
				{
					this.icons[i].element.style.left=posX+"px";
					this.icons[i].element.style.top=posY+"px";
//console.debug("Id: %i, left: %i, top: %i",icons[i].id,posX,posY);
					if(this.maxIconsInRow%i==1)
					{
						posX=startX;
						posY+=this.maxIconSize.y+this.iconDistance;
					}
					else
						posX+=this.maxIconSize.x+this.iconDistance;
//console.debug("x: %i, y: %i",icons[i].style.left,icons[i].style.top);
				}
			},
			
			//Sets the content elements of a window
			setContent : function(content)
			{
//console.dir(content);
				if(typeof content != "object"
				|| typeof content.title != "string"
				|| typeof content.articles != "object")
					return false;
				
				this.hasContent=true;
				var heightCounter=0;
				
				//Set the content element
				var contentElement=document.createElement("div");
				contentElement.className="content";
				this.element.appendChild(contentElement);
				//Set css properties if there are any.
				if(content.css)
				{
					for(var key in content.css)
					{
						contentElement.style[key]=content.css[key];
					}
				}
				
				//Set the content title
				var title=document.createElement("h1");
				title.appendChild(document.createTextNode(content.title));
				contentElement.appendChild(title);
				heightCounter+=title.offsetHeight;
				
				//Set form if there is any
				if(content.form)
				{
					var tempNode=document.createElement("div");
					tempNode.innerHTML=content.form;
					var formNode=tempNode.firstChild;
					//Append form
					this.element.appendChild(formNode);
				}
				
				for(var i=0;i<content.articles.length;i++)
				{
					var article=content.articles[i];
					var lastText={};
					for(contentType in article)
					{
						var temp={};
						//Create elements
						switch(contentType)
						{
							case "title":
								temp=document.createElement("h2");
								break;
							case "text":
								temp=document.createElement("div");
								temp.className="text";
								lastText=temp;
								break;
							case "images":
								var images=article.images;
								for(var j=0;j<images.length;j++)
								{
									var img=document.createElement("img");
									img.src=Workbench.CONTENT+images[j];
									img.alt=Workbench.CONTENT+images[j];
									if(lastText.insertBefore)
									{
										//Insert image before the first elemet, 
										//but behind the last image.
										for(var k=0;k<lastText.childNodes.length;k++)
										{
											var curNode=lastText.childNodes[k];
											if(curNode.nodeName.toLowerCase()!="img")
											{
												lastText.insertBefore(img,curNode);
												/*
												var br=document.createElement("br");
												br.style.float="right";
												lastText.insertBefore(br,img);
												*/
												break;
											}
											
										}
									}
									else
										contentElement.appendChild(img);
									//heightCounter+=img.offsetHeight;
								}
						}
						if(contentType=="images")
							continue;
						
						//temp.appendChild(document.createTextNode(article[contentType]));
						temp.innerHTML=article[contentType];
						contentElement.appendChild(temp);
						heightCounter+=temp.offsetHeight;
					}
					//Reset window size
					this.element.style.width=Math.ceil(Workbench.element.offsetWidth/1.5)+"px";
					this.setPosition();
					//this.element.style.height=(heightCounter)+"px";
				}
			},
			//Set download file data
			setDownload : function(properties)
			{
				this.type="file";
				this.fileId=properties.fileId;
			}
		};
	},
	
	//Event listener functions
	select : function(event)
	{
		//Count for doubleclick detection
		var lastClicked = Workbench.mouseDownTime;
		Workbench.mouseDownTime=new Date();
		var span=Workbench.mouseDownTime.getTime() - lastClicked.getTime();

		//Assess the last two mousedown events as doubleclick, whether the
		//timespan between them was smaller equal 500 ms
//console.debug("Letzter Klick: %i, Jetzt: %i, Abstand: %i", lastClicked.getTime(), Workbench.mouseDownTime.getTime(), span);
		if(span<=500)
		{
			Workbench.deselect(event);
			return Workbench.openWindow(event);
		}
		
		//Store old selection
		var selection=Workbench.getSelection(event);
		var oldSelection=Workbench.oldSelectedElement;
		
		//Get current offset position
		//For icons, ...
		if(selection.className=="iconElements")
		{
			var parent=selection.parentNode;
			var posX=parent.offsetLeft+(parent.offsetWidth-parseInt(selection.style.width))/2;
			var posY=selection.parentNode.offsetTop;
			
			//Add window position for window contained icons
			var win=Workbench.getWindowElement(parent);
			if(win.id!="workbench")
			{
				posX+=win.offsetLeft;
				posY+=win.offsetTop;
			}
			
			Workbench.offset.x=event.clientX-posX;
			Workbench.offset.y=event.clientY-posY;
		}
		//...windows...
		if(selection.className=="titleBar" || selection.className=="title")
		{
			var window=Workbench.getWindowElement(selection);
			Workbench.offset.x=event.clientX-window.offsetLeft;
			Workbench.offset.y=event.clientY-window.offsetTop;
			
			//Set window content unselectable
			Workbench.deactivateSelection(window);
//console.dir(Workbench.offset);
		}
		
		//If the old element was an icon, also change its background image
		if(/^icon_[0-9]+$/.test(oldSelection.id))
		{
			var icon=Workbench.changeImage(oldSelection,"icon","image");
			icon.element.style.zIndex=1;
		}
		
		//Select and deselect the windows (if any is selected)
		Workbench.selectWindow(selection);
		
//console.debug("Class: %s",selection.className);
		switch(selection.className)
		{
			//If the element is an icon, change its background image
			case "iconElements":
				var icon=Workbench.changeImage(selection,"icon","imageSelected");
				//Set icon element as selection
				Workbench.oldSelectedElement=selection.parentNode;
				selection=Workbench.copyImage(selection);
				Workbench.element.appendChild(selection);
				selection.zIndex=-1;
				break;
			//If the element is a window button, change button image
			case "buttonClose":
				Workbench.changeImage(selection,"window",Workbench.WINDOW+"button_close_selected.png");
				break;
			case "buttonUp":
				Workbench.changeImage(selection,"window",Workbench.WINDOW+"button_up_selected.png");
				break;
			case "buttonDown":
				Workbench.changeImage(selection,"window",Workbench.WINDOW+"button_down_selected.png");
				break
			case "title":
			case "titleBar":
				var window=Workbench.getWindowElement(selection);
				Workbench.oldSelectedElement=window;
				selection=Workbench.createWindowFrame(window);
				break;
			case "buttonOk":
				Workbench.changeImage(selection,"window",Workbench.WINDOW+"button_ok_selected.png");
				break;
			case "buttonCancel":
				Workbench.changeImage(selection,"window",Workbench.WINDOW+"button_cancel_selected.png");
				break;
		}
		Workbench.selectedElement=selection;
//console.dir(Workbench.selectedElement);
	},
	
	//Mouseup callback method
	deselect : function(event)
	{
		var curSelection=Workbench.getSelection(event);
		
		//Check if there is any item to deselect
		var selection=Workbench.selectedElement;
		if(!selection.id && !selection.className)
			return false;
			
		//If the stored element is a window button, change button image
		switch(selection.className)
		{
			case "buttonClose":
				Workbench.changeImage(selection,"window",Workbench.WINDOW+"button_close.png");
				break;
			case "buttonUp":
				Workbench.changeImage(selection,"window",Workbench.WINDOW+"button_up.png");
				break;
			case "buttonDown":
				Workbench.changeImage(selection,"window",Workbench.WINDOW+"button_down.png");
				break;
			case "buttonOk":
				Workbench.changeImage(selection,"window",Workbench.WINDOW+"button_ok.png");
				break;
			case "buttonCancel":
				Workbench.changeImage(selection,"window",Workbench.WINDOW+"button_cancel.png");
				break;
			//Move the icon to the current dummy position and delete the dummy
			case "image":
				var icon=Workbench.oldSelectedElement;
				
				//Set new parent element
				var parentElement=Workbench.getDropzone();
				var id=/^icon_([0-9]+)$/.exec(icon.id)[1];
				if(!Workbench.registry[id]["icon"].disk
				|| (Workbench.registry[id]["icon"].disk
				&& parentElement.id=="workbench"))
				{
					//Get position
					var posX=parseInt(selection.style.left)-(parseInt(icon.style.width)-parseInt(selection.style.width))/2;
					var posY=parseInt(selection.style.top);
					//Remove window x and y position for icon positioning
					if(parentElement.className=="window")
					{
						//Subtract 2px for window border
						posX-=parentElement.offsetLeft-2;
						posY-=parentElement.offsetTop;
					}
					icon.style.left=posX+"px";
					icon.style.top=posY+"px";
					
					//select new parent node
					parentElement.appendChild(icon);
				}
//console.debug("parentElement: %s, %s",parentElement.id,parentElement.className);
				
				//Remove dummy
				Workbench.element.removeChild(selection);
				selection=icon;
				break;
			case "frame":
				var window=Workbench.oldSelectedElement;
				window.style.left=selection.style.left;
				window.style.top=selection.style.top;
				Workbench.element.removeChild(selection);
				//Set window content selectable again
				Workbench.deactivateSelection(window,true);
				selection=window;
				break;
		}
		
		//Switch simple button functionality
		switch(curSelection.className)
		{
			//If the currently selected element is a close button, close the
			//belonging window.
			case "buttonClose":
				var id=/^window_([0-9]+)$/.exec(selection.parentNode.parentNode.id)[1];
				var window=Workbench.registry[id]["window"];
				Workbench.closeWindow(window.element);
				break;
			case "buttonOk":
				var form=Workbench.getFormElement(curSelection);

				//Get content element for request data fill.
				var window=Workbench.getWindowElement(form);
				for(var i=0;i<window.childNodes.length;i++)
				{
					var element=window.childNodes[i];
					if(element.className=="content")
					{
						Workbench.cache=element;
						break;
					}
				}
				//Fire request
				Workbench.changeCursor(true);
				Workbench.sendPOSTRequest(form,Workbench.getRequestData);
			//Hide the form
			case "buttonCancel":
				var form=Workbench.getFormElement(curSelection);
				form.style.zIndex=-2;
				break;
		}
		
		//Up and down button behavior
		if((curSelection.parentNode
		&& curSelection.parentNode.id!="mainBar")
		&& (curSelection.className=="buttonUp"
		|| curSelection.className=="buttonDown"))
		{
			var id=/^window_([0-9]+)$/.exec(selection.parentNode.parentNode.id)[1];
			var order=Workbench.openOrder;
			var window=Workbench.registry[id]["window"].element;
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
					var temp=Workbench.registry[order[i]]["window"].element;
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
					var temp=Workbench.registry[order[i]]["window"].element;
					temp.style.zIndex=i+2;
				}
				window.style.zIndex=1;
				order[0]=id;
			}
//console.dir(order);
		}

		Workbench.oldSelectedElement=selection;
		Workbench.selectedElement={};
	},
	
	//Moves the icon and window elements
	drag : function(event)
	{
		var element=Workbench.selectedElement;
		
		//Look if there is an item to drag
		if(element.className!="image"
		&& element.className!="frame")
			return false;
//console.debug("Class: %i, id: %i, left: %i, top: %i",element.className,element.id,element.style.left,element.style.top);
//console.dir(Workbench.selectedElement);
		
		if(!event)
			event=window.event;
		
		//Calculate new icon position
		var newPosX=event.clientX-Workbench.offset.x;
		var newPosY=event.clientY-Workbench.offset.y;
//console.debug("x: %i, y: %i",newPosX,newPosY);
		
		//Set drag element to foreground
		element.style.zIndex=Workbench.openOrder.length+2;
		
		//Check if the item will only be dragged in the workbench div
		var sizeX=element.offsetWidth;
		var sizeY=element.offsetHeight;
		var borderLeft=Workbench.element.offsetLeft;
		var borderRight=Workbench.element.offsetLeft+Workbench.element.offsetWidth;
		var borderTop=Workbench.element.offsetTop;
		var borderBottom=Workbench.element.offsetTop+Workbench.element.offsetHeight;
//console.debug("borderLeft: %i, borderRight: %i, borderTop: %i, borderBottom: %i",borderLeft,borderRight,borderTop,borderBottom);
//console.debug("newPosX: %i, newPosX+sizeX: %i, newPosY: %i, newPosY+sizeY: %i",newPosX,newPosX+sizeX,newPosY,newPosY+sizeY);
		if(borderLeft >= newPosX || borderRight <= newPosX+sizeX
		|| borderTop >= newPosY-21)// || borderBottom <= newPosY+sizeY)
			return false;

		//Move item
		element.style.top=newPosY+"px";
		element.style.left=newPosX+"px";
		return false;
//console.debug("x: %i, y: %i",newPosX,newPosY);
	},
	
	openWindow : function(event)
	{
		var selection=Workbench.getSelection(event);
		
//console.debug(selection.id);
		if(selection.className=="image")
			selection=Workbench.oldSelectedElement.firstChild;
		if(selection.className!="iconElements")
			return false;
		var id=/^icon_([0-9]+)$/.exec(selection.parentNode.id)[1];
		var window=Workbench.registry[id]["window"];
		
		//Download file
		if(window.type=="file")
		{
			var temp=open(Workbench.URL+"/file/get/"+window.fileId,"Download");
			return true;
		}
		
		if(window.element.style.zIndex<1)
		{
			Workbench.element.appendChild(window.element);
			Workbench.openOrder.push(id);
			window.element.style.zIndex=Workbench.openOrder.length+1;
			window.element.style.visibility="visible";
		}
//console.dir(Workbench.openOrder);
	},
	
	closeWindow : function(window)
	{
		Workbench.element.parentNode.appendChild(window);
		window.style.zIndex=-1;
		window.style.visibility="hidden";
		
		var newOrder=[];
		var curOrder=Workbench.openOrder;
		var id=/^window_([0-9]+)$/.exec(window.id)[1];

		//Delete closed window from open order.
		for(var i=0;i<curOrder.length;i++)
		{
			if(curOrder[i]!=id)
				newOrder.push(curOrder[i]);
		}
		Workbench.openOrder=newOrder;
	},
	
	//Changes the selection status of the titlebar
	selectWindow : function(element)
	{
		for(var i=1;i<Workbench.registry.length;i++)
		{
			titlebar=Workbench.registry[i].window.element.firstChild;
			Workbench.changeImage(titlebar,"window",Workbench.WINDOW+"titlebar_background_deselected.png");
		}
		
		//If the worbench is clicked, only deleselect the windows
		//and then return
		if(element.id=="workbench")
			return;
		
		//Get the window titlebar
		element=Workbench.getWindowElement(element);
		if(element.id!="workbench")
			Workbench.changeImage(element.firstChild,"window",Workbench.WINDOW+"titlebar_background.png");
	},
	
	//Get the window element of the current element.
	getWindowElement : function(element)
	{
		if(element.className=="window" || element.id=="workbench")
			return element;
		return Workbench.getWindowElement(element.parentNode);
	},
	
	//Get the icon element of the current element.
	getIconElement : function(element)
	{
		if(element.className=="icon")
			return element;
		return Workbench.getIconElement(element.parentNode);
	},
	
	//Get the form element of the current form.
	getFormElement : function(element)
	{
		if(element.nodeName.toLowerCase()=="form")
			return element;
		return Workbench.getFormElement(element.parentNode);
	},
	
	//Changes/switches the background image of an icon or a window/workbench
	//button.
	changeImage : function(element, type, image)
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
				id=Workbench.getWindowElement(element).id;
				if(id=="workbench")
					item=Workbench;
				else
				{
					id=/^window_([0-9]+)$/.exec(id)[1];
					item=Workbench.registry[id][type];
				}
				file=image;
				break;
			case "icon":
				id=Workbench.getIconElement(element).id;
				element=(element.className=="icon")?element.firstChild:element;
				id=/^icon_([0-9]+)$/.exec(id)[1];
				item=Workbench.registry[id][type];
				file=item[image];
				break;
		}
		//Get image from icon object members or via direct file path
		element.style.backgroundImage="url("+file+")";
		return item;
	},
	
	//Copies the given image element.
	copyImage : function(element)
	{
		var icon=element.parentNode;
		var image=element.cloneNode(true);
		var posX=(icon.offsetLeft+(icon.offsetWidth-parseInt(image.style.width))/2);
		var posY=icon.offsetTop;

		//Add window position for window contained icons
		var win=Workbench.getWindowElement(icon);
		if(win.id!="workbench")
		{
			posX+=win.offsetLeft;
			posY+=win.offsetTop;
		}
		
		image.style.left=posX+"px";
		image.style.top=posY+"px";
		//image.style.zIndex=Workbench.openOrder.length+2;
		image.style.zIndex=-1;
		image.style.position="absolute";
		image.className="image";
		return image;
	},
	
	//Creates red frame for window draging.
	createWindowFrame : function(element)
	{
		var frame=document.createElement("div");
		frame.style.width=element.style.width;
		frame.style.height=element.offsetHeight+"px";
		frame.style.top=element.offsetTop+"px";
		frame.style.left=element.offsetLeft+"px";
		frame.style.borderColor="#ff8800";
		frame.style.borderWidth="2px";
		frame.style.borderStyle="solid";
		frame.style.zIndex=-1;
		frame.style.position="absolute";
		frame.className="frame";
		Workbench.element.appendChild(frame);
		return frame;
	},
	
	//Get Dropzone
	getDropzone : function()
	{
		//Get possible dropzone elements
		var elements=document.getElementsByTagName("div");
		
		//Get icon dummy position
		var icon=Workbench.selectedElement;
		var posX=icon.offsetLeft+icon.offsetWidth/2;
		var posY=icon.offsetTop+icon.offsetHeight/2;
		
		var posZ=0;
		//The return value
		var element={};
		for(var i=0;i<elements.length;i++)
		{
			//Only consider windows and the workbench
			if(elements[i].className!="window" && elements[i].id!="workbench")
				continue;
			
			if(elements[i].style.zIndex<0 && elements[i].id!="workbench")
				continue;
			
//console.debug("Id: %s, name: %s, posZ: %s",elements[i].id,elements[i].className,elements[i].style.zIndex);			
			//Get drop element position
			var elementPosX=elements[i].offsetLeft;
			var elementWidth=elements[i].offsetWidth;
			var elementPosY=elements[i].offsetTop;
			var elementHeight=elements[i].offsetHeight;

			//Choose element if the icon is in the current frame
			if(elementPosX<posX
			&& elementPosX+elementWidth>posX
			&& elementPosY<posY
			&& elementPosY+elementHeight>posY)
			{
				//Only consider windows with higher z-index
				if(elements[i].style.zIndex>posZ
				|| elements[i].id=="workbench")
				{
					posZ=(elements[i].id!="workbench")
						?elements[i].style.zIndex:posZ;
					element=Workbench.getWindowElement(elements[i]);
				}
			}
		}
		return element;
	},
	
	//Get selected element browser specific event object
	getSelection : function(event)
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
		return selection;
	},
	
	//Creates a new HTTPRequest instance.
	createHTTPRequest : function(url,callbackFunc,method)
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
	},
	
	//Callback function for AJAX response
	getWindowsTree : function()
	{
		if(this.readyState != 4)
			return;
//console.debug(Workbench.request.responseText);
		var windows=eval(this.responseText);
//console.dir(windows);
		//Register the windows, icons and the content
		Workbench.addWindows(windows,0);
		//Change cursor to normal mode
		Workbench.changeCursor();
//console.dir(Workbench.registry);
	},
	
	//Sends an AJAX POST request.
	sendPOSTRequest : function(form,callbackFunc)
	{
		var request=this.createHTTPRequest(form.action,callbackFunc,"POST",form);
		var data=[];
		for(var i=0;i<form.elements.length;i++)
		{
			var node=form.elements[i]
			if((name=node.name)
			&& (value=Workbench.validate(node.value)))
				data.push(name + "=" + encodeURIComponent(value));
		}
		request.send(data.join("&"));
	},
	
	//Returns the requested json object.
	getRequestData : function()
	{
		if(this.readyState!=4)
			return;
		if(Workbench.cache.innerHTML)
			Workbench.cache.innerHTML=eval(this.responseText).join("");
		Workbench.changeCursor();
	},
	
	//Validates a value before it will be transmitted.
	validate : function(value)
	{
		if(value.match(/<.*>/))
			return false;
		return value;
	},
	
	//Returns the style property value of the element.
	getStyle : function(element,styleProperty)
	{
		if (window.getComputedStyle)
		{
			return document.defaultView.getComputedStyle(element,null).getPropertyValue(styleProperty);
//console.debug("Element: %s, style: %s, value: %s",element.className,styleProperty,value);
		}
		if (element.currentStyle)
		{
			if(styleProperty.match(/[a-z]+-[a-z]+/))
			{
				//Rename the property the IE conform way
				var bigLetter=styleProperty.replace(/[a-z]+-([a-z])[a-z]+/,"$1").toUpperCase();
				styleProperty=styleProperty.replace(/([a-z]+)-[a-z]([a-z]+)/,"$1"+bigLetter+"$2");
			}
			return element.currentStyle[styleProperty];
		}
		return "";
	},
	
	//Changes between mouse cursors (Normal and wait)
	changeCursor : function(wait)
	{
		var bodyElement=document.getElementsByTagName("body")[0];
		bodyElement.style.cursor=wait?
		"url(images/window/cursor_wait.png), url(images/window/cursor_wait.cur), default":
		"url(images/window/cursor.png), url(images/window/cursor.cur), default";
	},
	
	//Sets the text of an element temporary non-selectable
	deactivateSelection : function(element, select)
	{
		var cssProperty=select?"text":"none";
		
		//Set properties for Firefox...
		element.style.MozUserSelect=cssProperty;
		//...and KHTML-browsers.
		element.style.KhtmlUserSelect=cssProperty;
	},
	
	
	//Charset mapping for topaz font
	getCharIndex : function(character)
	{
		var charsetMapping = [
			" ", "0", "1", "2", "3", "4", "5", "6",	"7", "8", "9",
			"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k",
			"l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v",
			"w", "x", "y", "z", "ä", "ö", "ü", "ß", "á", "à", "â",
			"é", "è", "ê", "ó", "ò", "ô", "æ", "A", "B", "C", "D",
			"E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O",
			"P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
			"Ä", "Ö", "Ü", "Á", "À", "Â", "É", "È", "Ê", "Ó", "Ò",
			"Ô", "Æ", "^", "°", "!", "\"", "§", "$", "%", "&", "/",
			"(", ")", "=", "?", "'", "`", "+", "*", "~", "#", "'",
			"-", "_", ".", ":", ",", ";", "µ", "<", ">", "|", "[",
			"]", "@", "²", "³", "\\", "{", "}"
		];
		
		for(var index in charsetMapping)
		{
			if(character==charsetMapping[index])
			   return index*8;
		}
		return 0;
	},
	
	//Test method for string -> charset image conversion
	writeText : function()
	{
		var text="Lachsfilet.de release.";
		for(var i=0; i<text.length; i++)
		{
			var character=text.slice(i,i+1);
			var xCoord=Workbench.getCharIndex(character);
//console.debug("Char: %s, Mapping: %i", character, xCoord);
			if(typeof xCoord!="number")
				continue;
			var element = document.createElement("div");
			element.className="char";
			element.style.backgroundPosition="-"+xCoord+"px 0px";
			element.style.top="40px";
			element.style.left=i*8+"px";
			Workbench.element.appendChild(element);
		}
	}
};