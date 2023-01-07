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

    it("windowFactory.createWindow creates a window", function () {
        const id = 4000;

        let properties = {
            title: "Workbench"
        };

        let workbench = createNodeWrapper("div").appendTo(
            createNodeWrapper("div").getNode()
        ).getNode();

        let factory = createWindowFactory(createNodeWrapper, textConverter);
        let window = factory.createWindow(id, properties, workbench);

        expect(window).not.toBe(null);
        expect(window.id).toBe(id);
        expect(window.name).toBe(properties.title);
    });
});