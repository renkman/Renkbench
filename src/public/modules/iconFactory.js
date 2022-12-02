"use strict";

export var iconFactory = (createNode, textConverter, iconPath) => {
    //Creates an icon
    let createIcon = (id, properties, isDisk, initX) => {
        //Create new icon element
        let icon = {
            //The images of this icon
            image: iconPath + "/" + properties.image.file,
            imageSelected: iconPath + "/" + properties.imageSelected.file,
            initX: initX,
            disk: isDisk,
            title: properties.title,

            //The DOM-element of this icon
            element: {},

            setIconSize: function () {
                let x = this.element.offsetWidth;
                let y = this.element.offsetHeight;
                this.element.style.width = x + "px";
                this.element.style.height = y + "px";
            },

            setPositionLeft: function (x) {
                this.element.style.left = x;
            },

            setPositionRight: function (x) {
                this.element.style.right = x;
            },

            setPositionTop: function (y) {
                this.element.style.top = y;
            }
        };

        init(id, icon, properties);

        return icon;
    };

    let init = (id, icon, properties) => {
        // Image
        let image = createNode("div").class("iconElements").style({
            backgroundImage: "url(" + icon.image + ")",
            width: properties.image.width + "px",
            height: properties.image.height + "px"
        }).
            data({ mode: "move" }).
            getNode();

        // Icon title 
        let text = textConverter().convertText(icon.title, textConverter().fontColor["whiteOnBlue"]);
        let textImage = createNode("div").style({
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