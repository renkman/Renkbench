"use strict";

export var iconFactory = (createNode, textConverter, iconPath) => {
    var createNode = createNode;
    var textConverter = textConverter;
    var iconPath = iconPath;

    //Creates an icon
    var createIcon = (id, properties, isDisk, initX) => {
        //Create new icon element
        var icon = {
            //The images of this icon
            image: iconPath + "/" + properties.image.file,
            imageSelected: iconPath + "/" + properties.imageSelected.file,
            initX: initX,
            disk: isDisk,
            title: properties.title,

            //The DOM-element of this icon
            element: {},

            setIconSize: function() {
                var x = this.element.offsetWidth;
                var y = this.element.offsetHeight;
                this.element.style.width = x + "px";
                this.element.style.height = y + "px";
            },

            setPositionLeft: function(x) {
                this.element.style.left = x;
            },

            setPositionRight: function(x) {
                this.element.style.right = x;
            },

            setPositionTop: function(y) {
                this.element.style.top = y;
            }
        };

        init(id, icon, properties);

        return icon;
    };

    var init = (id, icon, properties) => {
        // Image
        var image = createNode("div").class("iconElements").style({
            backgroundImage: "url(" + icon.image + ")",
            width: properties.image.width + "px",
            height: properties.image.height + "px"
        }).
            data({ mode: "move" }).
            getNode();

        // Icon title 
        var text = textConverter().convertText(icon.title, textConverter().fontColor["whiteOnBlue"]);
        var textImage = createNode("div").style({
            marginTop: "2px",
        }).innerHtml(text)
            .getNode();

        //Create div element and set background source files
        icon.element = createNode("div")
            .class("icon")
            .id("icon_" + id)
            .append(image)
            .append(textImage)
            .data({
                id: id,
                status: "closed"
            })
            .getNode();
    };

    return {
        createIcon: createIcon
    };
};