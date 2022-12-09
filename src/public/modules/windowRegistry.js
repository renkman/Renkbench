"use strict";

// let loadWindow = (url, id) => {
//     let id = id || 0;
//     httpClient.getJson(url + "/" + id)
//         .then(addWindow)
//         .catch(console.error);
// };


// Manages workbench windows
export var windowRegistry = (windowFactory, menuFactory, iconFactory) => {
    let registry = [];
    let openWindowsCount = 0;

    let addIcon = (iconContract, pid, initX) => {
        let icon = getIcon(iconContract.id);
        if(icon)
            return;
        let isDisk = pid === 0;
        icon = createIcon(iconContract, initX, isDisk);
        registerIcon(iconContract.id, icon, pid);
    };

    let getIcon = id => {
        let entry = get(id);
        if(entry && entry.icon)
            return entry.icon;
        return null;
    };

    let addWindow = windowContract => {
        let window = getWindow(windowContract.id);
        if(window)
            return;

        window = createWindow(windowContract);
        //console.debug(window);
        let menu = createMenu(id. windowContract.menu);

        registerWindow(id, window, menu);

        for (let child of windowContract.children) {
            let icon = createIcon(child.icons, initX);
            registerIcon(child.id, icon, windowContract.pid);
            window.addIcon(icon);
        }

        // Arrange child icons and set size
        // console.debug("PID: %i",pid);
        let parent = get(window.pid);
        parent.window.arrangeIcons();
        if (windowContract.pid > 0)
            parent.window.setPosition();
    };

    let getWindow = id => {
        let entry = get(id);
        if(entry && entry.window)
            return entry.window;
        return null;
    };

    let getMenu = id => {
        let entry = get(id);
        if(entry && entry.menu)
            return entry.menu;
        return null;
    };

    let createWindow = (windowContract) => {
        let window = windowFactory.createWindow(windowContract.id, windowContract.properties);

        //Fill the window with content
        if (typeof windowContract.content == "object") {
            if (windowContract.content.type == "file")
                window.setDownload(windowContract.content);
            else
                window.setContent(windowContract.content);
        }
        else
            window.setIconArea();
        return window;
    };

    let createIcon = (iconContract, initX, isDisk) => {
        let icon = iconFactory.createIcon(iconContract.id, iconContract, isDisk, initX);
        return icon;
    };

    // Create the window related context menu	
    let createMenu = (id, menuContract) => {
        let menu = menuFactory.createMenu(menuContract, id, openWindowsCount);
        return menu;
    };

    let registerIcon = (id, icon, pid) => {
        if (typeof pid !== "number")
            pid = 0;

        registry.push({
            id: id,
            icon: icon,
            window: null,
            pid: pid,
            menu: null,
            isSelected: false,
            isTrashcan: false,
            isOpened: false
        });
    };

    let registerWindow = (id, window, menu) => {
        // console.debug(windowProperties);
        if (typeof pid !== "number")
            pid = 0;

        let entry = get(id);
        if(!entry)
            throw "Missing registry entry with id " + id;

        entry.window = window;
        entry.menu = menu;
    };

    let get = id => {
        let result = registry.filter(w => w.id == id);
        if(result.length === 1)
            return result[0];
        return null;
    };

    return {
        addIcon: addIcon,
        getIcon: getIcon,
        addWindow: addWindow,
        getWindow: getWindow,
        getMenu: getMenu
    };
};