"use strict";

// Creates workbench windows
export var createWindowFactory = (createNode, textConverter, workbenchElement) => {
    let createWorkbench = (id, element, iconStartPos) => {
        element.dataset["id"]=id;
		element.style.zIndex=1;

        let workbench = {
            element: element,
            iconStartPos: iconStartPos,
            arrangeIcons: () => {
                // TODO: registry is unknown here - move it to registry or an own service               
                for(var i=0;i<registry.length;i++)
                {
                    if(registry[i].pid!=0)
                        continue;
                    
                    var temp=registry[i]["icon"];
                    var right=Math.floor((iconWidth-parseInt(temp.element.style.width))/2);
        //console.debug("temp.id: %s, %i+%i=%i",temp.id,temp.initX,right,temp.initX+right);
                    temp.element.style.right=(temp.initX+right)+"px";
                }
            },
            addIcon : icon =>{
                element.appendChild(icon.element);
            }
        };
        return workbench;
    };

    //Creates a window and its content
    let createWindow = (id, properties) => {

        let window = {
            id: id,

            name: properties.title,

            //The DOM-element of this window
            element: {},

            // The viewport of this window
            viewport: {},

            title: {},

            titleInactive: {},

            // The creation coordinates of the next icon.
            iconStartPos: { x: "10px", y: "25px" },

            // The icons contained by the window
            icons: [],

            // States whether a window is opened
            isOpened: false,

            // A content window does not show any icons.
            hasContent: false,

            // Contains the window's form elements
            formElements: [],

            // The minimum width of this window
            minWidth: 400,

            // The minimum height of this window
            minHeight: 200,

            //The distance between the icons in this window
            iconDistance: 15,

            //The maximum count of icons in one row.
            maxIconsInRow: 4,

            //The maximum child icon size
            maxIconSize: { x: 0, y: 0 },

            //The vertical and horizontal scrollbars
            scrollbar: {
                vertical: {},
                horizontal: {}
            },

            // The resize button node of this window
            buttonResize: {},

            // The currently active form of this window
            activeForm: {},

            // Insert mode for form keyboard input
            insertMode: true,

            //Sets the start position of the window
            setPosition: function () {
                //(icon.offsetLeft+(icon.offsetWidth-parseInt(image.style.width))/2)
                var posX = (element.offsetWidth - this.element.offsetWidth) / 2;
                var posY = (element.offsetHeight - this.element.offsetHeight) / 2;
                this.element.style.left = posX + "px";
                this.element.style.top = posY + "px";
            },

            //Adds an icon to the window
            addIcon: function (icon) {
                // A content window does not show any icons.
                if (this.hasContent)
                    return false;

                // Add icon to the dropzone
                this.viewport.childNodes[0].appendChild(icon.element);

                //Get maximum icon size
                var sizeX = parseInt(icon.element.offsetWidth);
                var sizeY = parseInt(icon.element.offsetHeight);

                if (this.maxIconSize.x < sizeX)
                    this.maxIconSize.x = sizeX;
                if (this.maxIconSize.y < sizeY)
                    this.maxIconSize.y = sizeY;

                //Add icon
                this.icons.push(icon);

            },

            //Arranges the child icons of the window and resizes it.
            arrangeIcons: function () {
                //Set window size
                var height = Math.ceil(this.icons.length / 4);

                this.element.style.width = (this.maxIconsInRow * (this.maxIconSize.x + this.iconDistance)) + "px";
                this.element.style.height = (height * (this.maxIconSize.y + this.iconDistance) + 60) + "px";
                this.viewport.childNodes[0].style.width = (this.maxIconsInRow * (this.maxIconSize.x + this.iconDistance)) + "px";
                this.viewport.childNodes[0].style.height = (height * (this.maxIconSize.y + this.iconDistance)) + "px";

                var posX;
                var posY;
                var startX = posX = 10;
                var startY = posY = 25;

                //Rearrange icons
                for (var i = 0; i < this.icons.length; i++) {
                    this.icons[i].element.style.left = posX + "px";
                    this.icons[i].element.style.top = posY + "px";
                    //console.debug("Id: %i, left: %i, top: %i",this.icons[i].id,posX,posY);
                    if (this.maxIconsInRow % i == 1) {
                        posX = startX;
                        posY += this.maxIconSize.y + this.iconDistance;
                    }
                    else
                        posX += this.maxIconSize.x + this.iconDistance;
                    //console.debug("x: %i, y: %i",icons[i].style.left,icons[i].style.top);
                }
                this.resizeScrollbars();
            },

            setIconArea: function () {
                createNode("div").class("dropzone").appendTo(this.viewport);
            },

            // Sets the content elements of a window
            setContent: function (content) {
                //console.dir(content);
                if (typeof content != "object")
                    return false;

                this.hasContent = true;

                // Set the content element
                var contentElement = createNode("div").class("content").appendTo(this.viewport).style(content.css).getNode();

                // Set form if there is any
                if (content.form) {
                    // Append form
                    contentElement.innerHTML = content.form;
                    contentElement.childNodes.forEach(node => {
                        this.formElements.push(node);
                        if (node.className === "textbox")
                            createNode("div").class("cursor").appendTo(node);
                    });


                    //Reset window size
                    this.element.style.width = Math.max(contentElement.offsetWidth, this.minWidth) + "px";
                    this.element.style.height = Math.max(contentElement.offsetHeight, this.minHeight) + "px";
                    //this.element.style.width=maxWidth+"px";
                    //Reset scrollbar size
                    this.resizeScrollbars();
                    this.setPosition();
                    return;
                }

                if (typeof content.title != "string"
                    || typeof content.articles != "object")
                    return false;

                // Set the content title
                createNode("div").class("text").innerHtml(textConverter().convertText(content.title, textConverter().fontColor["whiteOnBlue"])).appendTo(contentElement);
                createNode("div").class("stop").appendTo(contentElement);

                // Add raw text for search engines and readers
                var rawText = createNode("h1").innerHtml(content.title).getNode();
                createNode("div").class("raw-content").append(rawText).appendTo(contentElement);

                for (var i = 0; i < content.articles.length; i++) {
                    var article = content.articles[i];
                    var lastText = {};
                    for (var contentType in article) {
                        var temp = {};
                        //Create elements
                        switch (contentType) {
                            case "title":
                            case "text":
                                temp = createNode("div").class("text").getNode();
                                lastText = temp;
                                break;
                            case "images":
                                var images = article.images;
                                for (var j = 0; j < images.length; j++) {
                                    var img = document.createElement("img");
                                    img.src = CONTENT + images[j];
                                    img.alt = CONTENT + images[j];
                                    if (lastText.insertBefore) {
                                        //Insert image before the first element, 
                                        //but behind the last image.
                                        for (var k = 0; k < lastText.childNodes.length; k++) {
                                            var curNode = lastText.childNodes[k];
                                            if (curNode.nodeName.toLowerCase() != "img") {
                                                lastText.insertBefore(img, curNode);
                                                break;
                                            }

                                        }
                                    }
                                    else
                                        contentElement.appendChild(img);
                                }
                        }
                        if (contentType == "images")
                            continue;

                        var text = textConverter().convertText(article[contentType], textConverter().fontColor["whiteOnBlue"]);

                        // Add raw text for search engines and readers
                        var rawText = createNode(contentType === "title" ? "h2" : "p").innerHtml(article[contentType]).getNode();
                        createNode("div").class("raw-content").append(rawText).appendTo(contentElement);
                        //console.debug(text);

                        temp.innerHTML = text;
                        //console.debug("Text written");
                        contentElement.appendChild(temp);
                        createNode("div").class("stop").appendTo(contentElement);
                    }

                    //console.debug(contentElement.offsetWidth);
                    //console.debug(contentElement.offsetHeight);

                    //Reset window size
                    this.element.style.width = Math.max(contentElement.offsetWidth, this.minWidth) + "px";
                    this.element.style.height = Math.max(contentElement.offsetHeight, this.minHeight) + "px";
                    //this.element.style.width=maxWidth+"px";
                    //Reset scrollbar size
                    this.resizeScrollbars();
                    this.setPosition();
                }
            },

            //Set download file data
            setDownload: function (properties) {
                this.type = "file";
                this.fileId = properties.fileId;
            },

            //Resize scrollbars
            resizeScrollbars: function () {
                var scrollbarVertical = this.scrollbar.vertical;
                var scrollbarHorizontal = this.scrollbar.horizontal;
                var scrollSpaceVertical = scrollbarVertical.childNodes[1];
                var scrollSpaceHorizontal = scrollbarHorizontal.childNodes[1];

                //Determine the window height and width	
                var height = this.viewport.offsetHeight;
                var width = this.viewport.offsetWidth;

                //Set vertical scrollbar...
                scrollbarVertical.style.height = height + "px"
                //...and scroll space height
                var scrollSpaceHeight = height - 32;
                scrollSpaceVertical.style.height = scrollSpaceHeight + "px";

                //Set horizontal scrollbar width
                scrollbarHorizontal.style.width = width + "px";

                //Set scroll buttons height and width
                var scrollButtonVertical = scrollSpaceVertical.childNodes[0];
                var scrollButtonHorizontal = scrollSpaceHorizontal.childNodes[0];

                var content = this.viewport.childNodes[0];

                var factorHeight = Math.min(1, height / content.offsetHeight);
                var factorWidth = Math.min(1, width / content.offsetWidth);

                var scrollHeight = scrollSpaceHeight * factorHeight;
                var scrollWidth = scrollSpaceHorizontal.offsetWidth * factorWidth - 4;

                scrollButtonVertical.style.height = scrollHeight + "px";
                scrollButtonHorizontal.style.width = scrollWidth + "px";

                // Set scroll button positions
                var left = -content.offsetLeft * factorWidth;
                var top = -content.offsetTop * factorHeight;

                var borderX = scrollSpaceVertical.offsetWidth - scrollButtonVertical.offsetWidth - 2;
                var borderY = scrollSpaceHorizontal.offsetHeight - scrollButtonHorizontal.offsetHeight - 2;

                scrollButtonHorizontal.style.left = Math.max(2, Math.min(left, borderX)) + "px";
                scrollButtonVertical.style.top = Math.max(2, Math.min(top, borderY)) + "px";
            },

            resize: function (width, height) {
                this.element.style.width = width;
                this.element.style.height = height;
                changeImage(this.buttonResize, "window", WINDOW + "button_resize.png");

                var content = this.viewport.children[0];
                if (this.viewport.offsetWidth > content.offsetWidth)
                    content.style.left = 0;
                if (this.viewport.offsetHeight > content.offsetHeight)
                    content.style.top = 0;

                this.resizeScrollbars();
            },

            move: function (left, top) {
                this.element.style.left = left;
                this.element.style.top = top;
            },

            moveContentByButton: function (direction) {
                var content = this.viewport.children[0];
                var step = direction === "scrollButtonLeft" || direction === "scrollButtonUp" ? 10 : -10;
                var axisX = direction === "scrollButtonLeft" || direction === "scrollButtonRight";

                var offsetLeft = this.viewport.offsetWidth - content.offsetWidth;
                var offsetTop = this.viewport.offsetHeight - content.offsetHeight;

                var scrollButtonX = this.scrollbar.horizontal.children[1].children[0];
                var scrollButtonY = this.scrollbar.vertical.children[1].children[0];

                var factorX = scrollButtonX.offsetWidth / this.viewport.offsetWidth;
                var factorY = scrollButtonY.offsetHeight / this.viewport.offsetHeight;

                if (axisX && offsetLeft < 0) {
                    content.style.left = Math.max(Math.min(0, content.offsetLeft + step), offsetLeft) + "px";
                    this.moveScrollButton({ movementX: -step * factorX }, scrollButtonX);
                }
                else if (!axisX && offsetTop < 0) {
                    content.style.top = Math.max(Math.min(0, content.offsetTop + step), offsetTop) + "px";
                    this.moveScrollButton({ movementY: -step * factorY }, scrollButtonY);
                }
            },

            moveScrollButton: function (event, selection) {
                var axisX = selection.className.includes("scrollButtonHorizontal");

                var borderX = selection.parentNode.offsetWidth - selection.offsetWidth - 2;
                var borderY = selection.parentNode.offsetHeight - selection.offsetHeight - 2;

                if (axisX)
                    selection.style.left = Math.max(2, Math.min(selection.offsetLeft + event.movementX, borderX)) + "px";
                else
                    selection.style.top = Math.max(2, Math.min(selection.offsetTop + event.movementY, borderY)) + "px";
            },

            moveContentByScrollbar: function () {
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

            deselect: function () {
                var titlebar = this.element.firstChild;
                changeImage(titlebar, "window", WINDOW + "titlebar_background_deselected.png");
                this.titleInactive.style.display = "block";
                this.title.style.display = "none";

                if (this.formElements.length > 0 && focus === this)
                    focus = null;
            },

            select: function () {
                var titlebar = this.element.firstChild;
                changeImage(titlebar, "window", WINDOW + "titlebar_background.png");
                this.titleInactive.style.display = "none";
                this.title.style.display = "block";

                if (this.formElements.length === 0)
                    return;

                focus = this;
                this.activeForm = this.formElements[0];
            },

            open: function (workbenchElement, openWindowsCount) {
                this.isOpened = true;

                //Download file
                // if (this.type == "file") {
                //     var temp = open(DATA_PATH + "/file/get/" + this.fileId, "Download");
                //     return true;
                // }

                if (this.element.style.zIndex > 0)
                    return;

                workbenchElement.appendChild(this.element);
                this.element.style.zIndex = openWindowsCount + 1;
                this.element.style.visibility = "visible";
            },

            close: function (element) {
                this.isOpened = false;

                element.parentNode.appendChild(this.element);
                this.element.style.zIndex = -1;
                this.element.style.visibility = "hidden";
            },

            enterText: function (event) {
                event.preventDefault();

                if (event.key === "Insert")
                    this.insertMode = !this.insertMode;

                if (cursorIgnoredKeys.includes(event.key))
                    return false;

                var cursor = this.activeForm.firstChild;

                if (event.key === "Backspace") {
                    this.moveCursor(cursorDirection.left, 1);
                    this.removeChar();
                    this.moveCursor(0, 0);
                    return false;
                }

                if (event.key.includes("Arrow")) {
                    var direction = event.key.replace("Arrow", "");
                    this.moveCursor(cursorDirection[direction.toLowerCase()], 1);
                    return false;
                }

                if (event.key === "Enter") {
                    this.moveCursor(cursorDirection.down, 1);
                    this.activeForm.firstChild.style.left = 0;
                    return false;
                }

                if (event.key === "Tab") {
                    this.moveCursor(cursorDirection.right, event.shiftKey ? -4 : 4);
                    return false;
                }

                if (event.key === "Home") {
                    this.activeForm.firstChild.style.left = 0;
                    this.moveCursor(0, 0);
                    return false;
                }

                if (event.key === "End") {
                    var offsetRight = this.activeForm.offsetWidth % cursor.offsetWidth;
                    cursor.style.left = (this.activeForm.offsetWidth - offsetRight - cursor.offsetWidth) + "px";
                    this.moveCursor(0, 0);
                    return false;
                }

                if (event.key === "PageUp") {
                    var steps = Math.floor(Math.min(cursor.offsetTop, this.viewport.offsetHeight) / cursor.offsetHeight);
                    this.moveCursor(cursorDirection.up, steps);
                    return false;
                }

                if (event.key === "PageDown") {
                    var steps = Math.floor(Math.min(this.activeForm.offsetHeight - cursor.offsetTop, this.viewport.offsetHeight) / cursor.offsetHeight);
                    this.moveCursor(cursorDirection.down, steps);
                    return false;
                }

                if (event.key === "Delete") {
                    var nextChars = Array.from(this.activeForm.childNodes)
                        .filter(node => node.className === "char"
                            && node.offsetTop === cursor.offsetTop
                            && node.offsetLeft >= cursor.offsetLeft)
                        .sort((a, b) => a.offsetLeft - b.offsetLeft);

                    if (nextChars.length === 0)
                        return false;

                    if (nextChars[0].offsetLeft === cursor.offsetLeft)
                        this.activeForm.removeChild(nextChars[0]);

                    nextChars.forEach(node => {
                        node.style.left = (node.offsetLeft - node.offsetWidth) + "px";
                    });
                    this.moveCursor(0, 0);

                    return false;
                }

                if (!this.insertMode)
                    this.removeChar();

                var character = textConverter().parseChar(event.key, textConverter().fontColor.whiteOnBlue, "text");
                this.activeForm.innerHTML = this.activeForm.innerHTML + character;
                var lastChar = this.activeForm.childNodes[this.activeForm.childNodes.length - 1];
                lastChar.style.position = "absolute";
                cursor = this.activeForm.firstChild;
                lastChar.style.left = cursor.offsetLeft + "px";
                lastChar.style.top = cursor.offsetTop + "px";

                // Move trailing characters
                if (this.insertMode) {
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

            moveCursor: function (direction, steps) {
                var cursor = this.activeForm.firstChild;
                if (direction === cursorDirection.left && cursor.offsetLeft > 0)
                    cursor.style.left = (cursor.offsetLeft - cursor.offsetWidth * steps) + "px";
                if (direction === cursorDirection.right && cursor.offsetLeft + cursor.offsetWidth < cursor.parentNode.offsetWidth)
                    cursor.style.left = (cursor.offsetLeft + cursor.offsetWidth * steps) + "px";
                if (direction === cursorDirection.up && cursor.offsetTop > 0)
                    cursor.style.top = (cursor.offsetTop - cursor.offsetHeight * steps) + "px";
                if (direction === cursorDirection.down && cursor.offsetTop + cursor.offsetHeight > 0)
                    cursor.style.top = (cursor.offsetTop + cursor.offsetHeight * steps) + "px";

                var character = Array.from(this.activeForm.childNodes).filter(node =>
                    node.className === "char" &&
                    node.offsetLeft === cursor.offsetLeft &&
                    node.offsetTop === cursor.offsetTop);

                if (cursor.childNodes.length > 0)
                    cursor.removeChild(cursor.firstChild);
                if (character.length > 0)
                    cursor.innerHTML = textConverter().parseChar(character[0].dataset.char, textConverter().fontColor.blackOnOrange, "text");
            },

            removeChar: function () {
                var cursor = this.activeForm.firstChild;
                var character = Array.from(this.activeForm.childNodes).filter(node =>
                    node.className === "char" &&
                    node.offsetLeft === cursor.offsetLeft &&
                    node.offsetTop === cursor.offsetTop);

                if (character.length > 0)
                    this.activeForm.removeChild(character[0]);
            }
        };
        init(window, properties);

        return window;
    };

    let init = function(window, properties) {
        // Create div element and set background source file
        window.element = createNode("div").class("window").
            id("window_" + window.id).
            style({ visibility: "hidden" }).
            // Set custom css properties if there are any.								
            style(properties.css).
            tabIndex(0).
            appendTo(workbenchElement.parentNode).
            data({id:window.id}).getNode();

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
        var title = textConverter().convertText(window.name, textConverter().fontColor["blueOnWhite"]);
        var titleInactive = textConverter().convertText(window.name, textConverter().fontColor["blueOnWhiteInactive"]);

        var titleBar = createNode("div").class("titleBar").appendTo(window.element).getNode();
        createNode("div").class("fillerWhiteLeft").appendTo(titleBar);
        createNode("div").class("fillerBlueLeft").appendTo(titleBar);
        createNode("div").class("buttonClose").appendTo(titleBar);
        createNode("div").class("fillerBlueLeft").appendTo(titleBar);
        window.title = createNode("div").class("title").appendTo(titleBar).innerHtml(title).getNode();
        window.titleInactive = createNode("div").class("titleInactive").appendTo(titleBar).innerHtml(titleInactive).getNode();
        createNode("div").class("fillerWhiteRight_1").appendTo(titleBar);
        createNode("div").class("fillerBlueRight").appendTo(titleBar);
        createNode("div").class("buttonUp").appendTo(titleBar);
        createNode("div").class("fillerBlueRight").appendTo(titleBar);
        createNode("div").class("buttonDown").appendTo(titleBar);
        createNode("div").class("fillerBlueRight").appendTo(titleBar);
        createNode("div").class("fillerWhiteRight").appendTo(titleBar);

        // Foreach titlebar child node: window.minWidth+=parseInt(element.style.width?element.style.width:0);
        // window.element.style.width=window.minWidth+"px";

        // Create vertical scrollbar
        var scrollbarVertical = createNode("div").class("scrollbarVertical").appendTo(window.element).getNode();
        createNode("div").class("scrollButtonUp").appendTo(scrollbarVertical).getNode();
        var scrollSpaceVertical = createNode("div").class("scrollSpaceVertical").appendTo(scrollbarVertical).getNode();
        createNode("div").class("scrollButtonVertical").appendTo(scrollSpaceVertical).getNode();
        createNode("div").class("scrollButtonDown").appendTo(scrollbarVertical).getNode();

        window.scrollbar.vertical = scrollbarVertical;

        //Create horizontal scrollbar
        var scrollbarHorizontal = createNode("div").class("scrollbarHorizontal").appendTo(window.element).getNode();
        createNode("div").class("scrollButtonLeft").appendTo(scrollbarHorizontal).getNode();
        var scrollSpaceHorizontal = createNode("div").class("scrollSpaceHorizontal").appendTo(scrollbarHorizontal).getNode();
        createNode("div").class("scrollButtonHorizontal").appendTo(scrollSpaceHorizontal).getNode();
        createNode("div").class("scrollButtonRight").appendTo(scrollbarHorizontal).getNode();

        window.scrollbar.horizontal = scrollbarHorizontal;

        // Add resize button the window
        window.buttonResize = createNode("div").class("buttonResize").appendTo(window.element).getNode();

        // Add viewport
        window.viewport = createNode("div").class("viewport").appendTo(window.element).getNode();
        //console.debug("Id: %i, minWidth: %i",this.id,this.minWidth);      
    };

    return {
        createWorkbench: createWorkbench,
        createWindow: createWindow
    };
};