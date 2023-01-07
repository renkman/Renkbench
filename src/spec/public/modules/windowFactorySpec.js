"use strict";

import jsdom from "jsdom";
import { createWindowFactory } from "../../../public/modules/windowFactory.js";
import { textConverter } from "../../../public/modules/text.js";
import { createNode } from "../../../public/modules/domTree.js";

describe("windowFactory tests", function () {
    let createNodeWrapper = (name) => {
        const { document } = new jsdom.JSDOM(`<body></body>`).window;
        return createNode(name, document);
    };

    it("windowFactory is not null", function () {
        expect(createWindowFactory).not.toBe(null);
    });

    it("windowFactory is a function", function () {
        expect(createWindowFactory).toEqual(jasmine.any(Function));
    });

    it("windowFactory.createWorkbench creates the workbench", function () {
        const id = 0;
        const element = {
            dataset: {},
            style: {
                zIndex: 0
            }
        };

        let factory = createWindowFactory(createNodeWrapper, textConverter);
        let workbench = factory.createWorkbench(id, element);

        expect(workbench).not.toBe(null);
        expect(workbench.element).toBe(element);
        expect(workbench.element.style.zIndex).toBe(1);
        expect(workbench.element.dataset.id).toBe(id);
    });

    it("workbench.addIcon adds an icon", function () {
        const id = 0;
        const element = {
            dataset: {},
            style: {
                zIndex: 0
            },
            icon: {},
            offsetHeight: 200,
            offsetTop: 0,
            appendChild: icon => element.icon = icon
        };

        let setIconSize = false;
        const icon = {
            posY: 0,
            element: {},
            setIconSize: () => setIconSize = true,
            setPositionTop: (y) => icon.posY = y,
            getWidth: () => 64,
            getHeight: () => 32,
        };

        let factory = createWindowFactory(createNodeWrapper, textConverter);
        let workbench = factory.createWorkbench(id, element);

        workbench.addIcon(icon);
        let iconStartPos = workbench.getIconStartPos();
        let iconWidth = workbench.getIconWidth();

        expect(workbench.element.icon).toBe(icon.element);
        expect(iconStartPos.y).toBe("92px");
        expect(iconStartPos.x).toBe("20px");
        expect(iconWidth).toBe(64);
    });

    it("windowFactory.createWindow creates a window", function () {
        const id = 4000;

        const properties = {
            title: "Workbench"
        };

        const workbench = createNodeWrapper("div").appendTo(
            createNodeWrapper("div").getNode()
        ).getNode();

        let factory = createWindowFactory(createNodeWrapper, textConverter);
        let window = factory.createWindow(id, properties, workbench);

        expect(window).not.toBe(null);
        expect(window.id).toBe(id);
        expect(window.name).toBe(properties.title);
    });
});