"use strict";

import { createWindowRegistry } from "../../../public/modules/windowRegistry.js";

describe("windowRegistry tests", function () {
    it("windowRegistry is not null", function () {
        expect(createWindowRegistry).not.toBe(null);
    });

    it("windowRegistry is a function", function () {
        expect(createWindowRegistry).toEqual(jasmine.any(Function));
    });

    it("windowRegistry.addIcon adds and gets an icon", function () {
        const id = 1000;

        const iconContract = {
            id: id,
            title: "Renkbench",
            image: {
                file: "workbench.png",
                width: 35,
                height: 30
            },
            imageSelected: {
                file: "workbench_selected.png",
                width: 35,
                height: 30
            }
        };

        const parent = {
            id: 0
        };

        const windowFactory = {};
        const menuFactory = {};
        const iconFactory = {
            createIcon: (iconContract, window, initX) => {
                return {
                    id: id,
                    fileNames: [iconContract.image.file, iconContract.imageSelected.file],
                    isDisk: window.id === 0,
                    initX: initX
                };
            }
        };

        const registry = createWindowRegistry(windowFactory, menuFactory, iconFactory);
        registry.addIcon(iconContract, parent, 12);
        let icon = registry.getIcon(id);

        expect(icon).not.toBe(null);
        expect(icon.id).toBe(id);
        expect(icon.isDisk).toBe(true);
        expect(icon.initX).toBe(12);
        expect(icon.fileNames).toEqual(["workbench.png", "workbench_selected.png"]);
    });

    it("windowRegistry.addIcon adds same icon only once", function () {
        const id = 1000;

        const iconContract = {
            id: id,
            title: "Renkbench",
            image: {
                file: "workbench.png",
                width: 35,
                height: 30
            },
            imageSelected: {
                file: "workbench_selected.png",
                width: 35,
                height: 30
            }
        };

        const parent = {
            id: 0
        };

        const windowFactory = {};
        const menuFactory = {};

        let callCount = 0;
        const iconFactory = {
            createIcon: (iconContract, window, initX) => {
                callCount++;
                return {
                    id: id,
                    fileNames: [iconContract.image.file, iconContract.imageSelected.file],
                    isDisk: window.id === 0,
                    initX: initX
                };
            }
        };

        const registry = createWindowRegistry(windowFactory, menuFactory, iconFactory);
        registry.addIcon(iconContract, parent, 12);
        let icon = registry.getIcon(id);
        registry.addIcon(iconContract, parent, 12);
        icon = registry.getIcon(id);

        expect(icon).not.toBe(null);
        expect(icon.id).toBe(id);
        expect(callCount).toBe(1);
        expect(icon.isDisk).toBe(true);
        expect(icon.initX).toBe(12);
        expect(icon.fileNames).toEqual(["workbench.png", "workbench_selected.png"]);
    });

    it("windowRegistry.addWindow adds and gets a window without child icons", function () {
        const windowContract = {
            "id": 2,
            "pid": 0,
            "window": {
                "title": "Amiga"
            },
            "childIcons": []
        };

        const windowFactory = {
            createWindow: (id, properties) => {
                return {
                    id: id,
                    title: properties.title,
                    setIconArea: () => { },
                    addIcon: icon => { }
                };
            }
        };

        const parent = {
            id: 0
        };

        let called = false;
        const menuFactory = {
            createMenu: (items, id, openWindowsCount) => {
                called = true;
                return {};
            }
        };

        const iconFactory = {
            createIcon: (iconContract, window, initX) => {
                return {};
            }
        };

        const registry = createWindowRegistry(windowFactory, menuFactory, iconFactory);
        registry.addIcon({ id: windowContract.id }, parent, 12);

        registry.addWindow(windowContract);
        let window = registry.getWindow(windowContract.id);
        let menu = registry.getMenu(windowContract.id);

        expect(window).not.toBe(null);
        expect(window.id).toBe(windowContract.id);
        expect(called).toBe(false);
        expect(menu).toBe(null);
    });

    it("windowRegistry.addWindow adds a window and gets a menu", function () {
        const windowContract = {
            "id": 2,
            "pid": 0,
            "window": {
                "title": "Homecomputers"
            },
            "menu": ["Amiga 500", "CPC 464"],
            "childIcons": []
        };

        const parent = {
            id: 0
        };

        let called = false;
        const windowFactory = {
            createWindow: (id, properties) => {
                return {
                    id: id,
                    title: properties.title,
                    setIconArea: () => {
                        called = true;
                    },
                    addIcon: icon => { }
                };
            }
        };

        const menuFactory = {
            createMenu: (items, id, openWindowsCount) => {
                return {
                    items: items,
                    id: id,
                    openWindowsCount: openWindowsCount
                }
            }
        };

        const iconFactory = {
            createIcon: (iconContract, window, initX) => {
                return {};
            }
        };

        const registry = createWindowRegistry(windowFactory, menuFactory, iconFactory);
        registry.addIcon({ id: windowContract.id }, parent, 12);

        registry.addWindow(windowContract);
        let menu = registry.getMenu(windowContract.id);

        expect(menu).not.toBe(null);
        expect(menu.items).toBe(windowContract.menu);
        expect(called).toBe(true);
    });

    it("windowRegistry.addWindow adds and gets a window with content", function () {
        const windowContract = {
            "id": 4000,
            "pid": 0,
            "window": {
                "title": "Amiga"
            },
            "content": {},
            "childIcons": []
        };

        const parent = {
            id: 0
        };

        let called = false;
        const windowFactory = {
            createWindow: (id, properties) => {
                return {
                    id: id,
                    title: properties.title,
                    setContent: () => {
                        called = true;
                    },
                    addIcon: icon => { }
                };
            }
        };

        const menuFactory = {};
        const iconFactory = {
            createIcon: (iconContract, window, initX) => {
                return {};
            }
        };

        const registry = createWindowRegistry(windowFactory, menuFactory, iconFactory);
        registry.addIcon({ id: windowContract.id }, parent, 12);

        registry.addWindow(windowContract);
        let window = registry.getWindow(windowContract.id);

        expect(window).not.toBe(null);
        expect(window.id).toBe(windowContract.id);
        expect(called).toBe(true);
    });

    it("windowRegistry.addWindow adds and gets a window with file content", function () {
        const windowContract = {
            "id": 4000,
            "pid": 0,
            "window": {
                "title": "Amiga"
            },
            "content": {
                "type": "file"
            },
            "childIcons": []
        };

        const parent = {
            id: 0
        };

        let called = false;
        const windowFactory = {
            createWindow: (id, properties) => {
                return {
                    id: id,
                    title: properties.title,
                    setDownload: () => {
                        called = true;
                    },
                    addIcon: icon => { }
                };
            }
        };

        const menuFactory = {};
        const iconFactory = {
            createIcon: (iconContract, window, initX) => {
                return {};
            }
        };

        const registry = createWindowRegistry(windowFactory, menuFactory, iconFactory);
        registry.addIcon({ id: windowContract.id }, parent, 12);

        registry.addWindow(windowContract);
        let window = registry.getWindow(windowContract.id);

        expect(window).not.toBe(null);
        expect(window.id).toBe(windowContract.id);
        expect(called).toBe(true);
    });

    it("windowRegistry.addWindow adds and gets a window with child icons", function () {
        const childIconId = 64;
        const windowContract = {
            "id": 2,
            "pid": 0,
            "window": {
                "title": "Amiga"
            },
            "childIcons": [
                {
                    id: childIconId,
                    title: "Workbench",
                    image: {
                        file: "workbench.png",
                        height: 42,
                        width: 42
                    },
                    imageSelected: {
                        file: "workbench_selected.png",
                        height: 42,
                        width: 42
                    }
                }
            ]
        };

        const windowFactory = {
            createWindow: (id, properties) => {
                return {
                    id: id,
                    title: properties.title,
                    setIconArea: () => { },
                    addIcon: icon => { }
                };
            }
        };

        const parent = {
            id: 0
        };

        const menuFactory = {
            createMenu: (items, id, openWindowsCount) => { }
        };

        const iconFactory = {
            createIcon: (iconContract, window, initX) => {
                if (iconContract.id === childIconId)
                    return {
                        id: iconContract.id,
                        fileNames: [iconContract.image.file, iconContract.imageSelected.file],
                        isDisk: window.id === 0,
                        initX: initX
                    };
                createIcon: (iconContract, window, initX) => {
                    return {};
                }
            }
        };

        const registry = createWindowRegistry(windowFactory, menuFactory, iconFactory);
        registry.addIcon({ id: windowContract.id }, parent, 0);

        registry.addWindow(windowContract);
        let window = registry.getWindow(windowContract.id);
        let childIcon = registry.getIcon(childIconId);

        expect(window).not.toBe(null);
        expect(window.id).toBe(windowContract.id);
        expect(childIcon.id).toBe(childIconId);
        expect(childIcon.isDisk).toBe(false);
        expect(childIcon.initX).toBe(0);
        expect(childIcon.fileNames).toEqual(["workbench.png", "workbench_selected.png"]);
    });

    it("windowRegistry.addWorkbench adds and gets the workbench with child icons and menu", function () {
        const childIconId = 2;

        const workbenchContract = {
            "id": 0,
            "pid": -1,
            "window": {
                "title": "Renkbench"
            },
            "childIcons": [
                {
                    id: childIconId,
                    title: "Workbench",
                    image: {
                        file: "workbench.png",
                        height: 42,
                        width: 42
                    },
                    imageSelected: {
                        file: "workbench_selected.png",
                        height: 42,
                        width: 42
                    }
                }
            ]
        };

        const element = {};

        const menuContract = {menu:["Workbench"]};

        const windowFactory = {
            createWorkbench: (id, element) => {
                return {
                    id: id,
                    element: element
                };
            }
        };

        const menuFactory = {
            createMenu: (items, id, openWindowsCount) => {
                return {
                    items: items,
                    id: id,
                    openWindowsCount: openWindowsCount
                }
            }
        };

        const iconFactory = {
            createIcon: (iconContract, window, initX) => {
                return {
                    id: iconContract.id,
                    fileNames: [iconContract.image.file, iconContract.imageSelected.file],
                    isDisk: window.id === 0,
                    initX: initX
                };
            }
        };

        const registry = createWindowRegistry(windowFactory, menuFactory, iconFactory);

        registry.addWorkbench(workbenchContract, element, menuContract);

        let workbench = registry.getWindow(workbenchContract.id);
        let childIcon = registry.getIcon(childIconId);
        let menu = registry.getMenu(workbenchContract.id);

        expect(workbench).not.toBe(null);
        expect(workbench.id).toBe(workbenchContract.id);
        expect(workbench.element).toBe(element);
        expect(childIcon.id).toBe(childIconId);
        expect(childIcon.isDisk).toBe(true);
        expect(childIcon.initX).toBe(0);
        expect(childIcon.fileNames).toEqual(["workbench.png", "workbench_selected.png"]);
        expect(menu).not.toBe(null);
        expect(menu.items).toBe(menuContract);
        expect(menu.openWindowsCount).toBe(0);
    });

    it("windowRegistry.addWorkbench adds the workbench and getChildIcons gets the icons", function () {
        const workbenchContract = {
            "id": 0,
            "pid": -1,
            "window": {
                "title": "Renkbench"
            },
            "childIcons": [
                {
                    id: 1,
                    title: "Workbench",
                    image: {
                        file: "workbench.png",
                        height: 42,
                        width: 42
                    },
                    imageSelected: {
                        file: "workbench_selected.png",
                        height: 42,
                        width: 42
                    }
                },
                {
                    id: 2,
                    title: "Death Metal",
                    image: {
                        file: "deathmetal.png",
                        height: 42,
                        width: 42
                    },
                    imageSelected: {
                        file: "deathmetal_selected.png",
                        height: 42,
                        width: 42
                    }
                }
            ]
        };

        const element = {};

        const windowFactory = {
            createWorkbench: (id, element) => {
                return {
                    id: id,
                    element: element
                };
            }
        };

        const menuFactory = {
            createMenu: (items, id, openWindowsCount) => { }
        };

        const iconFactory = {
            createIcon: (iconContract, window, initX) => {
                return {
                    id: iconContract.id,
                    fileNames: [iconContract.image.file, iconContract.imageSelected.file],
                    isDisk: window.id === 0,
                    initX: initX
                };
            }
        };

        const registry = createWindowRegistry(windowFactory, menuFactory, iconFactory);

        registry.addWorkbench(workbenchContract, element, {});

        let childIcons = registry.getChildIcons(workbenchContract.id);

        expect(childIcons).not.toBe(null);
        expect(childIcons.length).toBe(2);
        expect(childIcons.map(i => i.id)).toEqual([1, 2]);
    });
});