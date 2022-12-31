/*
*	Just an Amiga Workbench look and feel clone, written in Javascript.
*	Copyright 2022 by Jan Renken, Hamburg
*	
*	This software is licensed under the GNU General Public License Version 3.0.
*
*	So feel free to use, modify and distribute it.
*
*	Amiga for life...
*/

"use strict";

export var createIconFactory = (createNode, textConverter, iconPath) => {
    //Creates an icon
    const createIcon = (properties, window, initX) => {
        //Create new icon element
        let icon = {
            id: properties.id,
            //The images of icon icon
            image: iconPath + "/" + properties.image.file,
            imageSelected: iconPath + "/" + properties.imageSelected.file,
            initX: initX,
            disk: window.id === 0,
            title: properties.title,

            //The DOM-element of icon icon
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
            },

            getHeight: function() {
                return this.element.offsetHeight;
            },

            getWidth: function() {
                return this.element.offsetWidth;
            }
        };

        init(icon, properties, window);

        return icon;
    };

    const init = (icon, properties, window) => {
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
            .id("icon_" + properties.id)
            .append(image)
            .append(textImage)
            .data({
                id: properties.id,
                status: "closed"
            })
            .getNode();

        window.addIcon(icon);
    };

    return {
        createIcon: createIcon
    };
};