"use strict";

import { createWindowService } from "../../../public/modules/windowService.js";

describe("windowService tests", function () {
    let createApiClientMock = window => {
        let getWindow = id =>
            new Promise(resolve => resolve(window));

        return {
            getWindow: getWindow
        };
    };

    it("windowService is not null", function () {
        expect(createWindowService).not.toBe(null);
    });

    it("windowService is a function", function () {
        expect(createWindowService).toEqual(jasmine.any(Function));
    });

    it("windowService.openWindow opens the window with the passed id", async function () {
        const id = 500;

        let windowOpened = false;
        let menuUpdated = false;
        let positionSet = false;
        let iconsArranged = false;

        let windowRegistryMock = {
            getWindow: id => {
                return {
                    id: id,
                    open: (element, openWindowsCount) => windowOpened = true,
                    arrangeIcons: () => iconsArranged = true,
                    setPosition: () => positionSet = true
                };
            },
            getMenu: id => {
                return { updateMenu: () => menuUpdated = true }
            }
        };

        let apiClientMock = createApiClientMock(null);

        let workbenchElement = {};

        let service = createWindowService(windowRegistryMock, apiClientMock);
        await service.openWindow(id, workbenchElement);

        expect(windowOpened).toBe(true);
        expect(positionSet).toBe(true);
        expect(menuUpdated).toBe(true);
        expect(iconsArranged).toBe(true);
    });

    it("windowService.openWindow adds new window once", async function () {
        let windowProperties = {
            id: 1000
        };

        let createWindowRegistryMock = () => {
            let addWindowCalls = 0;
            let getWindowCalls = 0;
            let windows = [];

            let addWindow = (properties, workbenchElement) => {
                addWindowCalls++;
                let window = {
                    id: properties.id,
                    open: (element, openWindowsCount) => { },
                    arrangeIcons: () => { },
                    setPosition: () => { }
                };
                windows.push(window);
                return window;
            };

            let getWindow = id => {
                getWindowCalls++;
                let result = windows.filter(w => w.id === id);
                if (result.length === 1)
                    return result[0];
                return null;
            };

            let getMenu = id => {
                return { updateMenu: () => { } }
            };

            return {
                addWindow: addWindow,
                getWindow: getWindow,
                getMenu: getMenu,
                getAddWindowCalls: () => addWindowCalls,
                getGetWindowCalls: () => getWindowCalls
            };
        };

        let windowRegistryMock = createWindowRegistryMock();

        let apiClientMock = createApiClientMock(windowProperties);

        let workbenchElement = {};

        let service = createWindowService(windowRegistryMock, apiClientMock, workbenchElement);
        await service.openWindow(windowProperties.id, workbenchElement);
        await service.openWindow(windowProperties.id, workbenchElement);

        expect(windowRegistryMock.getAddWindowCalls()).toBe(1);
        expect(windowRegistryMock.getGetWindowCalls()).toBe(2);
    });

    it("windowService.openWindow with window without menu updates the workbench menu", async function () {
        const id = 500;

        let windowOpened = false;
        let menuUpdated = false;
        let positionSet = false;
        let iconsArranged = false;

        let windowRegistryMock = {
            getWindow: id => {
                return {
                    id: id,
                    open: (element, openWindowsCount) => windowOpened = true,
                    arrangeIcons: () => iconsArranged = true,
                    setPosition: () => positionSet = true
                };
            },
            getMenu: windowId => {
                if (windowId === id)
                    return null;

                if (windowId === 0)
                    return {
                        updateMenu: () => menuUpdated = true
                    };

                throw "Unexpected id " + windowId;
            }
        };

        let apiClientMock = createApiClientMock(null);

        let workbenchElement = {};

        let service = createWindowService(windowRegistryMock, apiClientMock);
        await service.openWindow(id, workbenchElement);

        expect(windowOpened).toBe(true);
        expect(positionSet).toBe(true);
        expect(menuUpdated).toBe(true);
        expect(iconsArranged).toBe(true);
    });

    it("windowService.closeWindow closes the window with the passed id", async function () {
        const id = 2000;

        let windowClosed = false;
        let menuUpdated = false;

        let windowRegistryMock = {
            getWindow: id => {
                return {
                    id: id,
                    close: element => windowClosed = true
                };
            },
            getMenu: id => {
                return { updateMenu: () => menuUpdated = true }
            }
        };

        let apiClientMock = createApiClientMock(null);

        let workbenchElement = {};

        let service = createWindowService(windowRegistryMock, apiClientMock);
        service.closeWindow(id, workbenchElement);

        expect(windowClosed).toBe(true);
        expect(menuUpdated).toBe(true);
    });

    it("windowService.closeWindow closes the window with the passed id", async function () {
        const id = 4000;

        let windowClosed = false;
        let menuUpdated = false;

        let windowRegistryMock = {
            getWindow: id => {
                return {
                    id: id,
                    close: element => windowClosed = true
                };
            },
            getMenu: windowId => {
                if (windowId === id)
                    return null;

                if (windowId === 0)
                    return {
                        updateMenu: () => menuUpdated = true
                    };

                throw "Unexpected id " + windowId;
            }
        };

        let apiClientMock = createApiClientMock(null);

        let workbenchElement = {};

        let service = createWindowService(windowRegistryMock, apiClientMock);
        service.closeWindow(id, workbenchElement);

        expect(windowClosed).toBe(true);
        expect(menuUpdated).toBe(true);
    });
});