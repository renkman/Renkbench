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
        let parentPositionSet = false;
        let iconsArranged = false;

        let windowRegistryMock = {
            getWindow: id => {
                return {
                    id: id,
                    open: (element, openWindowsCount) => windowOpened = true,
                    arrangeIcons: () => iconsArranged = true
                };
            },
            getParentWindow: id => {
                return {
                    id: 1000,
                    setPosition: () => parentPositionSet = true
                };
            },
            getMenu: id => {
                return { updateMenu: () => menuUpdated = true }
            }
        };

        let apiClientMock = createApiClientMock(null);

        let workbenchElement = {};

        let service = createWindowService(windowRegistryMock, apiClientMock, workbenchElement);
        await service.openWindow(id);

        expect(windowOpened).toBe(true);
        expect(parentPositionSet).toBe(true);
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

            let addWindow = (properties, initX) => {
                addWindowCalls++;
                let window = {
                    id: properties.id,
                    open: (element, openWindowsCount) => { },
                    arrangeIcons: () => { }
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

            let getParentWindow = id => {
                return {
                    id: 0
                };
            };

            let getMenu = id => {
                return { updateMenu: () => { } }
            };

            return {
                addWindow: addWindow,
                getWindow: getWindow,
                getParentWindow: getParentWindow,
                getMenu: getMenu,
                getAddWindowCalls: () => addWindowCalls,
                getGetWindowCalls: () => getWindowCalls
            };
        };

        let windowRegistryMock = createWindowRegistryMock();

        let apiClientMock = createApiClientMock(windowProperties);

        let workbenchElement = {};

        let service = createWindowService(windowRegistryMock, apiClientMock, workbenchElement);
        await service.openWindow(windowProperties.id);
        await service.openWindow(windowProperties.id);

        expect(windowRegistryMock.getAddWindowCalls()).toBe(1);
        expect(windowRegistryMock.getGetWindowCalls()).toBe(2);
    });

    it("windowService.openWindow with window without menu updates the workbench menu", async function () {
        const id = 500;

        let windowOpened = false;
        let menuUpdated = false;
        let parentPositionSet = false;
        let iconsArranged = false;

        let windowRegistryMock = {
            getWindow: id => {
                return {
                    id: id,
                    open: (element, openWindowsCount) => windowOpened = true,
                    arrangeIcons: () => iconsArranged = true
                };
            },
            getParentWindow: id => {
                return {
                    id: 1000,
                    setPosition: () => parentPositionSet = true
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

        let service = createWindowService(windowRegistryMock, apiClientMock, workbenchElement);
        await service.openWindow(id);

        expect(windowOpened).toBe(true);
        expect(parentPositionSet).toBe(true);
        expect(menuUpdated).toBe(true);
        expect(iconsArranged).toBe(true);
    });

    it("windowService.openWindow with window with workbench parent does not call parent.parentPositionSet", async function () {
        const id = 500;

        let windowOpened = false;
        let menuUpdated = false;
        let parentPositionSet = false;
        let iconsArranged = false;

        let windowRegistryMock = {
            getWindow: id => {
                return {
                    id: id,
                    open: (element, openWindowsCount) => windowOpened = true,
                    arrangeIcons: () => iconsArranged = true
                };
            },
            getParentWindow: id => {
                return {
                    id: 0,
                    setPosition: () => parentPositionSet = true
                };
            },
            getMenu: windowId => {
                return {
                    updateMenu: () => menuUpdated = true
                };
            }
        };

        let apiClientMock = createApiClientMock(null);

        let workbenchElement = {};

        let service = createWindowService(windowRegistryMock, apiClientMock, workbenchElement);
        await service.openWindow(id);

        expect(windowOpened).toBe(true);
        expect(parentPositionSet).toBe(false);
        expect(menuUpdated).toBe(true);
        expect(iconsArranged).toBe(true);
    });
});