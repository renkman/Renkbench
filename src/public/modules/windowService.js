"use strict";

// Manages workbench windows
export var createWindowService = (windowRegistry, apiClient) => {
    // The height in of the window title bar in pixels
    const TITLE_BAR_HEIGHT = 21;

    //The order of the opened windows
    let openOrder = [];

    let openWindow = async (id, workbenchElement) => {
        let window = windowRegistry.getWindow(id);
        if (window == null) {
            let windowProperties = await apiClient.getWindow(id);
            window = windowRegistry.addWindow(windowProperties, workbenchElement);
        }
        else
        {
            workbenchElement.appendChild(window.element);
            if(openOrder.some(id => id === window.id))
                return;
        }

        window.setPosition(workbenchElement);
        window.arrangeIcons();

        let menu = windowRegistry.getMenu(id);
        if (!menu)
            menu = windowRegistry.getMenu(0);
        menu.updateMenu();
        openOrder.push(window.id);

        return window.open(openOrder.length);
    };

    let closeWindow = (id, workbenchElement) => {
        let menu = windowRegistry.getMenu(id);
        if (!menu)
            menu = windowRegistry.getMenu(0);
        menu.updateMenu();

        //Delete closed window from open order.
        let index = openOrder.indexOf(id);
        openOrder.splice(index, 1);

        let window = windowRegistry.getWindow(id);
        window.close(workbenchElement);
    };

    let moveWindow = (event, selection, mouseOffset, workbenchElement) => {
        //Calculate new window position
        let newPosX = event.clientX - mouseOffset.x;
        let newPosY = event.clientY - mouseOffset.y;
        //console.debug("x: %i, y: %i",newPosX,newPosY);

        //Set drag element to foreground
        selection.style.zIndex = openOrder.length + 2;
        //console.debug(selection.style.zIndex);

        //Check if the item will only be dragged in the workbench div
        let sizeX = selection.offsetWidth;
        let sizeY = selection.offsetHeight;
        let borderLeft = workbenchElement.offsetLeft;
        let borderRight = workbenchElement.offsetLeft + workbenchElement.offsetWidth;
        let borderTop = workbenchElement.offsetTop;
        let borderBottom = workbenchElement.offsetTop + workbenchElement.offsetHeight;
        //console.debug("borderLeft: %i, borderRight: %i, borderTop: %i, borderBottom: %i",borderLeft,borderRight,borderTop,borderBottom);
        //console.debug("newPosX: %i, newPosX+sizeX: %i, newPosY: %i, newPosY+sizeY: %i",newPosX,newPosX+sizeX,newPosY,newPosY+sizeY);
        if (borderLeft >= newPosX || borderRight <= newPosX + sizeX
            || borderTop >= newPosY - TITLE_BAR_HEIGHT)// || borderBottom <= newPosY+sizeY)
            return false;

        //Move item
        selection.style.top = newPosY + "px";
        selection.style.left = newPosX + "px";
        //console.debug("x: %s, y: %s",selection.style.top,selection.style.left);
        return false;
    };

    return {
        openWindow: openWindow,
        closeWindow: closeWindow,
        moveWindow: moveWindow
    };
};