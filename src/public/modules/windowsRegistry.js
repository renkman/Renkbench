"use strict";

// Manages workbench windows
export var windowsRegistry = (httpClient, windowFactory, menuFactory, iconFactory) => {
    let registry = [];

    let loadWindow = (url, id) => {
        let id = id || 0;
        httpClient.getJson(url + "/" + id)
            .then(addWindow)
            .catch(console.error);
    };

    let addWindow = window => {
        if(registry.filter(w => w.id == window.id).length > 0)
            return;

        //console.debug(window);
        if (window.content) {
            registerWindow(window.window, window.icons, pid, window.menu, window.content);
        }
        else if (window.children && window.children.length) {
            let newPid = registerWindow(window.window, window.icons, pid);
            addWindow(window.children, newPid);
        }

        //Arrange child icons and set size
        // console.debug("PID: %i",pid);
        registry[pid].window.arrangeIcons();
        if (pid > 0)
            registry[pid].window.setPosition();
    };

    //Adds a window and its icon to the registry
    let registerWindow = (windowProperties, imageProperties, pid, menuProperties, openWindowsCount, content, isDisk, initX) => {
        // console.debug(windowProperties);
        if (typeof pid !== "number")
            pid = 0;

        //Create items
        let window = windowFactory.createWindow(windowProperties);
        window.init();

        //Fill the window with content
        if (typeof content == "object") {
            if (content.type == "file")
                window.setDownload(content);
            else
                window.setContent(content);
        }
        else
            window.setIconArea();

        //Set window id and add items to registry
        let id = registry.length;
        window.setId(id);

        // Create the window related context menu	
        let menu = menuFactory.createMenu(menuProperties, id, openWindowsCount);

        let icon = iconFactory.createIcon(id, imageProperties, isDisk, initX);

        registry.push({
            id: id,
            icon: icon,
            window: window,
            pid: pid,
            menu: menu,
            isSelected: false,
            isTrashcan: false,
            isOpened: false
        });
        //console.dir(this.registry);
        //console.debug("Id: %i",window.id);
        //this.arrangeIcons();
        return window.id;
    };

    return {
        loadWindow: loadWindow
    };
};