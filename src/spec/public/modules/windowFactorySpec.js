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
            icons: {},
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

        expect(setIconSize).toBe(true);
        expect(workbench.element.icon).toBe(icon.element);
        expect(iconStartPos.y).toBe("92px");
        expect(iconStartPos.x).toBe("20px");
        expect(iconWidth).toBe(64);
    });

    it("workbench.addIcon adds second icon into new column", function () {
        const id = 0;
        const element = {
            dataset: {},
            style: {
                zIndex: 0
            },
            icons: [],
            offsetHeight: 100,
            offsetTop: 0,
            appendChild: icon => element.icons.push(icon)
        };

        const icons = [{
            posY: 0,
            element: {},
            setIconSize: () => {},
            setPositionTop: function(y) { this.posY = y },
            getWidth: () => 64,
            getHeight: () => 32,
        },
        {
            posY: 0,
            element: {},
            setIconSize: () => {},
            setPositionTop: function(y) { this.posY = y },
            getWidth: () => 80,
            getHeight: () => 32,
        }];

        let factory = createWindowFactory(createNodeWrapper, textConverter);
        let workbench = factory.createWorkbench(id, element);

        workbench.addIcon(icons[0]);
        workbench.addIcon(icons[1]);

        let iconStartPos = workbench.getIconStartPos();
        let iconWidth = workbench.getIconWidth();

        expect(workbench.element.icons).toEqual(icons.map(i => i.element));
        expect(iconStartPos.y).toBe("40px");
        expect(iconStartPos.x).toBe("184px");
        expect(iconWidth).toBe(80);
    });

    it("workbench.arrangeIcons arranges the icons on the y-axis", function () {
        const id = 0;
        const element = {
            dataset: {},
            style: {
                zIndex: 0
            },
            icons: [],
            offsetHeight: 200,
            offsetTop: 0,
            appendChild: icon => element.icons.push(icon)
        };

        const icons = [{
            posY: 0,
            element: {},
            right: "",
            initX: 20,
            setIconSize: () => {},
            setPositionRight: function(x) { this.right = x },
            setPositionTop: function(y) { this.posY = y },
            getWidth: () => 64,
            getHeight: () => 32,
        },
        {
            posY: 0,
            element: {},
            right: "",
            initX: 20,
            setIconSize: () => {},
            setPositionRight: function(x) { this.right = x },
            setPositionTop: function(y) { this.posY = y },
            getWidth: () => 80,
            getHeight: () => 32,
        }];

        let factory = createWindowFactory(createNodeWrapper, textConverter);
        let workbench = factory.createWorkbench(id, element);

        workbench.addIcon(icons[0]);
        workbench.addIcon(icons[1]);
        workbench.arrangeIcons();

        let iconStartPos = workbench.getIconStartPos();
        let iconWidth = workbench.getIconWidth();

        expect(workbench.element.icons).toEqual(icons.map(i => i.element));
        expect(iconStartPos.y).toBe("144px");
        expect(iconStartPos.x).toBe("20px");
        expect(iconWidth).toBe(80);
        expect(icons[0].right).toBe("28px");
        expect(icons[1].right).toBe("20px");
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