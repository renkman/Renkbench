"use strict";

export var iconManager = (offsetTop, offsetHeight) => {
    //The creation coordinates of the next icon.
	var iconStartPos = {x:"20px",y:"40px"};
    var iconWidth = 0;

    var offsetTop = offsetTop;
    var offsetHeight = offsetHeight;

    // Arranges the workbench icons
    var arrangeIcons = () => {
        // Set workbench icon with highest width
        // if (x > iconWidth)
        //     iconWidth = x;
    
        // Setup coordinates for next icon
        var nextPosY = parseInt(iconStartPos.y) + y + 20;
        var borderBottom = offsetTop + offsetHeight;

        // Just put the next icon under the current one.
        if (nextPosY + y + 10 < borderBottom) {
            iconStartPos.y = nextPosY + "px";
            return;
        }

        // Set the next icon left to the current icon column.
        iconStartPos.x = (parseInt(iconStartPos.x) + x + 10) + "px";
        iconStartPos.y = "40px";
    };

    return {
        arrangeIcons: arrangeIcons
    };
};