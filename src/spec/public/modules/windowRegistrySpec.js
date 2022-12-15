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

        let iconContract = {
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

        let windowFactory = {};
        let menuFactory = {};
        let iconFactory = {
            createIcon: (id, iconContract, isDisk, initX) => {
                return {
                    id: id,
                    fileNames: [iconContract.image.file, iconContract.imageSelected.file],
                    isDisk: isDisk,
                    initX: initX
                };
            }
        };

        let registry = createWindowRegistry(windowFactory, menuFactory, iconFactory);
        registry.addIcon(iconContract, 0, 12);
        let icon = registry.getIcon(id);

        expect(icon).not.toBe(null);
        expect(icon.id).toBe(id);
        expect(icon.isDisk).toBe(true);
        expect(icon.initX).toBe(12);
        expect(icon.fileNames).toEqual(["workbench.png", "workbench_selected.png"]);
    });

    it("windowRegistry.addIcon adds same icon only once", function () {
        const id = 1000;

        let iconContract = {
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

        let windowFactory = {};
        let menuFactory = {};

        let callCount = 0;
        let iconFactory = {
            createIcon: (id, iconContract, isDisk, initX) => {
                callCount++;
                return {
                    id: id,
                    fileNames: [iconContract.image.file, iconContract.imageSelected.file],
                    isDisk: isDisk,
                    initX: initX
                };
            }
        };

        let registry = createWindowRegistry(windowFactory, menuFactory, iconFactory);
        registry.addIcon(iconContract, 0, 12);
        let icon = registry.getIcon(id);
        registry.addIcon(iconContract, 0, 12);
        icon = registry.getIcon(id);

        expect(icon).not.toBe(null);
        expect(icon.id).toBe(id);
        expect(callCount).toBe(1);
        expect(icon.isDisk).toBe(true);
        expect(icon.initX).toBe(12);
        expect(icon.fileNames).toEqual(["workbench.png", "workbench_selected.png"]);
    });

    it("windowRegistry.addWindow adds and gets a window without child icons", function () {
        let windowContract = {
            "id": 2,
            "pid": 0,
            "window": {
                "title": "Amiga"
            },
            "childIcons": []
        };

        let windowFactory = {
            createWindow: (id, properties) => {
                return {
                    id: id,
                    title: properties.title,
                    setIconArea: () => { },
                    addIcon: icon => { }
                };
            }
        };

        let called = false;
        let menuFactory = {
            createMenu: (items, id, openWindowsCount) => {
                called = true;
                return {};
            }
        };

        let iconFactory = {
            createIcon: (id, iconContract, isDisk, initX) => {
                return {};
            }
        };

        let registry = createWindowRegistry(windowFactory, menuFactory, iconFactory);
        registry.addIcon({ id: windowContract.id }, 0, 12);

        registry.addWindow(windowContract, 12);
        let window = registry.getWindow(windowContract.id);
        let menu = registry.getMenu(windowContract.id);

        expect(window).not.toBe(null);
        expect(window.id).toBe(windowContract.id);
        expect(called).toBe(false);
        expect(menu).toBe(null);
    });

    it("windowRegistry.addWindow adds a window and gets a menu", function () {
        let windowContract = {
            "id": 2,
            "pid": 0,
            "window": {
                "title": "Homecomputers"
            },
            "menu": ["Amiga 500", "CPC 464"],
            "childIcons": []
        };

        let called = false;
        let windowFactory = {
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

        let menuFactory = {
            createMenu: (items, id, openWindowsCount) => {
                return {
                    items: items,
                    id: id,
                    openWindowsCount: openWindowsCount
                }
            }
        };

        let iconFactory = {
            createIcon: (id, iconContract, isDisk, initX) => {
                return {};
            }
        };

        let registry = createWindowRegistry(windowFactory, menuFactory, iconFactory);
        registry.addIcon({ id: windowContract.id }, 0, 12);

        registry.addWindow(windowContract, 12);
        let menu = registry.getMenu(windowContract.id);

        expect(menu).not.toBe(null);
        expect(menu.items).toBe(windowContract.menu);
        expect(called).toBe(true);
    });

    it("windowRegistry.addWindow adds and gets a window with content", function () {
        let windowContract = {
            "id": 4000,
            "pid": 0,
            "window": {
                "title": "Amiga"
            },
            "content": {},
            "childIcons": []
        };

        let called = false;
        let windowFactory = {
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

        let menuFactory = {};
        let iconFactory = {
            createIcon: (id, iconContract, isDisk, initX) => {
                return {};
            }
        };

        let registry = createWindowRegistry(windowFactory, menuFactory, iconFactory);
        registry.addIcon({ id: windowContract.id }, 0, 12);

        registry.addWindow(windowContract, 12);
        let window = registry.getWindow(windowContract.id);

        expect(window).not.toBe(null);
        expect(window.id).toBe(windowContract.id);
        expect(called).toBe(true);
    });

    it("windowRegistry.addWindow adds and gets a window with file content", function () {
        let windowContract = {
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

        let called = false;
        let windowFactory = {
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

        let menuFactory = {};
        let iconFactory = {
            createIcon: (id, iconContract, isDisk, initX) => {
                return {};
            }
        };

        let registry = createWindowRegistry(windowFactory, menuFactory, iconFactory);
        registry.addIcon({ id: windowContract.id }, 0, 12);

        registry.addWindow(windowContract, 12);
        let window = registry.getWindow(windowContract.id);

        expect(window).not.toBe(null);
        expect(window.id).toBe(windowContract.id);
        expect(called).toBe(true);
    });
});