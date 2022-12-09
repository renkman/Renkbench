"use strict";

import { windowRegistry } from "../../../public/modules/windowRegistry.js";

describe("windowRegistry tests", function () {
    it("windowRegistry is not null", function () {
        expect(windowRegistry).not.toBe(null);
    });

    it("windowRegistry is a function", function () {
        expect(windowRegistry).toEqual(jasmine.any(Function));
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
            createIcon(id, iconContract, isDisk, initX) {
                return {
                    id : id,
                    fileNames : [ iconContract.image.file, iconContract.imageSelected.file ],
                    isDisk : isDisk,
                    initX: initX
                }
            }
        };


        let registry = windowRegistry(windowFactory, menuFactory, iconFactory);
        registry.addIcon(iconContract, 0, 12);
        var icon = registry.getIcon(id);

        expect(icon).not.toBe(null);
        expect(icon.id).toBe(id);
        expect(icon.isDisk).toBe(true);
        expect(icon.initX).toBe(12);
        expect(icon.fileNames).toEqual(["workbench.png", "workbench_selected.png"]);
    });
});