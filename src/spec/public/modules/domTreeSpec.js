"use strict";

import jsdom from "jsdom";
import {createNode} from "../../../public/modules/domTree.js";

describe("createNode tests", function() {
    it("createNode is not null", function() {
        expect(createNode).not.toBe(null);
    });

    it("createNode is a function", function() {
        expect(createNode).toEqual(jasmine.any(Function));
    });

    it("createNode() returns a builder object", function() {
        const { document } = new jsdom.JSDOM(`<body></body>`).window;
        var create = createNode("div", document);
        
        expect(create).not.toBe(null);
        expect(create).toEqual(jasmine.any(Object));
    });

    it("createNode.getNode() returns a builder object", function() {
        const { document, HTMLElement } = new jsdom.JSDOM(`<body></body>`).window;
        var node = createNode("div", document).getNode();
        
        expect(node).not.toBe(null);
        expect(node).toEqual(jasmine.any(HTMLElement));
    });

    it("createNode.class() sets the class of the node", function() {
        const { document } = new jsdom.JSDOM(`<body></body>`).window;
        var node = createNode("div", document).class("Machine Head").getNode();
        
        expect(node.className).toBe("Machine Head");
    });

    it("createNode.id() sets the id of the node", function() {
        const { document } = new jsdom.JSDOM(`<body></body>`).window;
        var node = createNode("div", document).id("Carcass").getNode();
        
        expect(node.id).toBe("Carcass");
    });
    
    it("createNode.data() sets the data of the node", function() {
        const { document } = new jsdom.JSDOM(`<body></body>`).window;
        var node = createNode("div", document).data({band: "At The Gates"}).getNode();
        
        expect(node.dataset.band).toBe("At The Gates");
    });

    it("createNode.innerHtml() sets the child of the node", function() {
        const { document, HTMLElement } = new jsdom.JSDOM(`<body></body>`).window;
        var node = createNode("div", document).innerHtml("<div>Death</div>").getNode();
       
        expect(node.firstChild).toEqual(jasmine.any(HTMLElement));
        expect(node.firstChild.innerHTML).toBe("Death");
    });

    it("createNode.style() sets the style of the node", function() {
        const { document } = new jsdom.JSDOM(`<body></body>`).window;
        var node = createNode("div", document).style({backgroundColor: "#000000"}).getNode();
        
        expect(node.style.backgroundColor).toBe("rgb(0, 0, 0)");
    });

    it("createNode.tabIndex() sets the tab index of the node", function() {
        const { document } = new jsdom.JSDOM(`<body></body>`).window;
        var node = createNode("div", document).tabIndex(42).getNode();
        
        expect(node.tabIndex).toBe(42);
    });

    it("createNode.clone() clones the node", function() {
        const { document } = new jsdom.JSDOM(`<body></body>`).window;
        var create1 = createNode("div", document).innerHtml("Kreator");
        var create2 = create1.clone();
        var node1 = create1.getNode();
        var node2 = create2.getNode();
        
        expect(node1).toEqual(node2);
        expect(node2.children.length).toBe(0);
    });

    it("createNode.clone(deep) clones the node and its decendants", function() {
        const { document } = new jsdom.JSDOM(`<body></body>`).window;
        var create1 = createNode("div", document).innerHtml("Bloodbath");
        var create2 = create1.clone(true);
        var node1 = create1.getNode();
        var node2 = create2.getNode();
        
        expect(node1).toEqual(node2);
        expect(node1.children).toEqual(node2.children);
    });

    it("createNode.appendTo() sets the parent node of the node", function() {
        const { document } = new jsdom.JSDOM(`<body></body>`).window;
        var parent = createNode("div", document).getNode();
        var node = createNode("div", document).appendTo(parent).getNode();
        
        expect(node.parentNode).toBe(parent);
    });

    it("createNode.append() sets the child node of the node", function() {
        const { document } = new jsdom.JSDOM(`<body></body>`).window;
        var child = createNode("div", document).getNode();
        var node = createNode("div", document).append(child).getNode();
        
        expect(node.firstChild).toBe(child);
    });
});