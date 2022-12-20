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
import {httpClient} from "./modules/httpClient.js";

import { createApiClient } from "./modules/apiClient.js";
import { createWindowRegistry } from "./modules/windowRegistry.js";
import { createWindowFactory } from "./modules/windowFactory.js";
import { createMenuFactory } from "./modules/menuFactory.js";
import { createIconFactory } from "./modules/iconFactory.js";
import { createWindowService } from "./modules/windowService.js";

//The workbench main object
(() => {
	//The DOM-element of the workbench (<div>)
	var element = {};

	// The image path structure
	const IMAGES = "images/";	
	const WINDOW = IMAGES+"window/";	
	const ICONS = IMAGES+"icons/";

	let apiClient = createApiClient(httpClient);
	
	let windowFactory = createWindowFactory(createNode, textConverter, element);
	let menuFactory = createMenuFactory(createNode, textConverter);
	let iconFactory = createIconFactory(createNode, textConverter, ICONS);

	//The windows/icons registry	
	var registry = createWindowRegistry(windowFactory, menuFactory, iconFactory);
	var windowService = createWindowService(registry, apiClient, element);
	
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
	
	// The workbench main title text
	const MAIN_TITLE = "Renkbench release.";
	
	//The initialization method.
	var init = async () =>
	{		
		//Set cursor to wait mode
		switchCursor(true);
		
		// Set version and build numbers
		apiClient.getVersion()
			.then(createVersionInfo)
			.catch(console.error);

		var title = textConverter().convertText(MAIN_TITLE, textConverter().fontColor["blueOnWhite"]);
		var mainTitle = document.getElementById("mainTitle");
		createNode("div").style({
				marginTop:"2px",
			}).innerHtml(title)
			.appendTo(mainTitle);	
	
		element = document.getElementById("workbench");

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

		// Get and register workbench and menu
		var results = await Promise.all(
			apiClient.getWorkbench(),
			apiClient.getMenu()
		);
		createWindowRegistry.addWorkbench(results[0], element, results[1], iconStartPos, 0);
		switchCursor();

		// .then(results => {
		// 	createWindowRegistry.addWorkbench(results[0], element, results[1], iconStartPos, 0);
		// 	switchCursor();
		// });
//console.debug(registry.getWindow(0));
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

				let id = image.dataset.id;
				return windowService.openWindow(id);
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
					windowService.closeWindow(id);
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
						let element=window.childNodes[i];
						if(element.className=="content")
						{
							cache=element;
							break;
						}
					}
					//Fire request
					switchCursor(true);
					httpClient.post(form)
						.then(getRequestData)
						.catch(console.error);
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
			return windowService.moveWindow(event, selection);

		// Scroll button moving
		var windowElement = getWindowElement(selection);
		var id = windowElement.dataset["id"];
		var window=registry[id]["window"];
		
		window.moveScrollButton(event, selection);	
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
		
	//Returns the requested json object.
	var getRequestData = responseText =>
	{
		if(cache.innerHTML)
			cache.innerHTML=eval(responseText).join("");
		switchCursor();
	};

	//Changes between mouse cursors (Normal and wait)
	var switchCursor = wait =>
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

	var createVersionInfo = (versionInfo) => {
		//var versionInfo = JSON.parse(response);

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
