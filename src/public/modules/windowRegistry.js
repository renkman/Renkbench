"use strict";

// Manages workbench windows
export var createWindowRegistry = (windowFactory, menuFactory, iconFactory) => {
    let registry = [];
    let openWindowsCount = 0;

    let getIcon = id => {
        let entry = get(id);
        if (entry && entry.icon)
            return entry.icon;
        return null;
    };

    let addWorkbench = (windowContract, element, menuContract) => {
        let workbench = getWindow(windowContract.id);
        if (workbench)
            return;

        workbench = windowFactory.createWorkbench(windowContract.id, element);
        let menu = menuFactory.createMenu(menuContract, windowContract.id, openWindowsCount);

        registerWorkbench(windowContract.id, workbench, menu);

        registry.push({
            icon: null,
            pid: windowContract.pid,
            window: workbench,
            menu: menu
        });

        registerChildIcons(windowContract.childIcons, workbench);
        workbench.arrangeIcons();

        return workbench;
    };

    let addWindow = (windowContract, workbenchElement) => {
        let window = getWindow(windowContract.id);
        if (window)
            return;

        window = createWindow(windowContract, workbenchElement);
        //console.debug(window);
        let menu = createMenu(windowContract.id, windowContract.menu);

        registerWindow(windowContract.id, window, menu);

        registerChildIcons(windowContract.childIcons, window);

        // Arrange child icons and set size
        // console.debug("PID: %i",pid);
        let parent = getWindow(windowContract.pid);
        if (!parent)
            return;

        parent.arrangeIcons();      
        if (windowContract.pid > 0)
            parent.setPosition(workbenchElement);

        return window;
    };

    let getWindow = id => {
        let entry = get(id);
        if (entry && entry.window)
            return entry.window;
        return null;
    };

    let getParentWindow = id => {
        let entry = getParent(id);
        if (entry && entry.window)
            return entry.window;
        return null;
    };

    let getMenu = id => {
        let entry = get(id);
        if (entry && entry.menu)
            return entry.menu;
        return null;
    };

    let getChildIcons = parentId => {
        let children = getChildren(parentId);
        return children.map(c => c.icon);
    }

    let select = id => {
        let entry = get(id);
        if(entry)
            entry.isSelected = true;
    }


    let deselect = id => {
        let entry = get(id);
        if(entry)
            entry.isSelected = false;
    }

    let createWindow = (windowContract, workbenchElement) => {
        let window = windowFactory.createWindow(windowContract.id, windowContract.window, workbenchElement);

        //Fill the window with content
        if (typeof windowContract.content == "object") {
            if (windowContract.content.type == "file")
                window.setDownload(windowContract.content);
            else
                window.setContent(windowContract.content, workbenchElement);
        }
        else
            window.setIconArea();
        return window;
    };

    let createIcon = (iconContract, window) => {
        let initX = parseInt(window.getIconStartPos().x);
        let icon = iconFactory.createIcon(iconContract, window, initX);
        return icon;
    };

    // Create the window related context menu	
    let createMenu = (id, menuContract) => {
        if (!menuContract)
            return null;
        let menu = menuFactory.createMenu(menuContract, id, openWindowsCount);
        return menu;
    };

    let registerChildIcons = (childIcons, parent) => {
        if(!childIcons)
            return;
        
        for (let child of childIcons) {
            let icon = createIcon(child, parent);
            registerIcon(child.id, icon, parent.id);
        }
    };

    let registerWorkbench = (id, workbench, menu) => {
        registry.push({
            id: id,
            icon: null,
            pid: -1,
            window: workbench,
            menu: menu
        });
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
            isTrashcan: false
        });
    };

    let registerWindow = (id, window, menu) => {
        let entry = get(id);
        if (!entry)
            throw "Missing registry entry with id " + id;

        entry.window = window;
        entry.menu = menu;
    };

    let get = id => {
        let result = registry.filter(e => e.id == id);
        if (result.length === 1)
            return result[0];
        return null;
    };

    let getParent = id => {
        let entry = registry.filter(e => e.id == id);
        let result = registry.filter(e => e.id == entry.pid);
        if (result.length === 1)
            return result[0];
        return null;
    }

    const getChildren = parentId => registry.filter(e => e.pid == parentId);

    return {
        addWorkbench: addWorkbench,
        getIcon: getIcon,
        addWindow: addWindow,
        getWindow: getWindow,
        getParentWindow: getParentWindow,
        getMenu: getMenu,
        getChildIcons: getChildIcons,
        select: select,
        deselect: deselect
    };
};