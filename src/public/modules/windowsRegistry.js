"use strict";

// Manages workbench windows
export var windowsRegistry = ((httpClient, windowFactory, menuFactory, iconFactory) => {
    var registry = [];
    var httpClient = httpClient;
    var windowFactory = windowFactory;
    var menuFactory = menuFactory;
    var iconFactory = iconFactory;

    var loadWindow = (url, id) => {
        var id = id || 0;
        httpClient.getJson(url + "/" + id)
            .then(addWindow)
            .catch(console.error);
    };

    var addWindow = window => {
        if(registry.filter(w => w.id == window.id).length > 0)
            return;

        //console.debug(window);
        if (window.content) {
            registerWindow(window.window, window.icons, pid, window.menu, window.content);
        }
        else if (window.children && window.children.length) {
            var newPid = registerWindow(window.window, window.icons, pid);
            addWindow(window.children, newPid);
        }

        //Arrange child icons and set size
        // console.debug("PID: %i",pid);
        registry[pid].window.arrangeIcons();
        if (pid > 0)
            registry[pid].window.setPosition();
    };

    //Adds a window and its icon to the registry
    var registerWindow = (windowProperties, imageProperties, pid, menuProperties, content) => {
        // console.debug(windowProperties);
        if (typeof pid !== "number")
            pid = 0;

        //Create items
        var window = windowFactory.createWindow(windowProperties);
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
        var id = registry.length;
        window.setId(id);

        // Create the window related context menu	
        var menu = menuFactory.createMenu(menuProperties, id);

        var icon = iconFactory.createIcon(imageProperties);
        icon.init(id, pid);
        icon.element.id += id;

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
})();