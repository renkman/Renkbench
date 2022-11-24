"use strict";


export var iconFactory = (createNode, textConverter) => {
    // The image path structure
    const IMAGES = "images/";
    const ICONS = IMAGES + "icons/";

    var createNode = createNode;
    var textConverter = textConverter;

    //Creates an icon
    var createIcon = (id, properties, parentWindow, iconStartPos, iconWidth, workBenchElement) => {
        //Create new icon element
        var icon = {
            //The images of this icon
            image: ICONS + properties.image.file,
            imageSelected: ICONS + properties.imageSelected.file,
            initX: 0,
            disk: false,
            title: properties.title,

            //The DOM-element of this icon
            element: {}
        };

        init(id, icon, properties, parentWindow, iconStartPos, iconWidth, workBenchElement);

        return icon;
    };

    var init = (id, icon, properties, parentWindow, iconStartPos, iconWidth, workBenchElement) => {
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
        // var window = registry[pid]["window"];
        parentWindow.addIcon(icon);

        var x = icon.element.offsetWidth;
        var y = icon.element.offsetHeight;
        icon.element.style.width = x + "px";
        icon.element.style.height = y + "px";

        // Coordinates of the next icon are top and right, if it is
        // a direct child of the workbench
        //icon.element.style.top = registry[pid]["window"].iconStartPos.y;
        icon.element.style.top = parentWindow.iconStartPos.y;

        if (parentWindow.id == 0) {
            // Set workbench icon with highest width
            if (x > iconWidth)
                iconWidth = x;

            icon.disk = true;
            icon.element.style.right = iconStartPos.x;
            icon.initX = parseInt(iconStartPos.x);

            // Setup coordinates for next icon
            var nextPosY = parseInt(iconStartPos.y) + y + 20;
            var borderBottom = workBenchElement.offsetTop + workBenchElement.offsetHeight;

            // Just put the next icon under the current one.
            if (nextPosY + y + 10 < borderBottom) {
                iconStartPos.y = nextPosY + "px";
                return;
            }

            // Set the next icon left to the current icon column.
            iconStartPos.x = (parseInt(iconStartPos.x) + x + 10) + "px";
            iconStartPos.y = "40px";
        }
    };

    return {
        createIcon: createIcon
    };
};