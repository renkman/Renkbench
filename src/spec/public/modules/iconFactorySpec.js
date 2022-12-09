"use strict";

import { iconFactory } from "../../../public/modules/iconFactory.js";
import { textConverter } from "../../../public/modules/text.js";

describe("iconFactory tests", function () {
    let domTreeMock = (name, doc) => {
        let instance = (name => {
            let node = {
                name: name,
                id: "Id",
                class: "Class",
                style: {
                    height: "0px",
                    width: "0px",
                    top: "0px",
                    right: "0px"

                },
                childNodes: [],
                innerHTML: "",
                dataset: {},
                offsetWidth: 42,
                offsetHeight: 42,
            };

            return {
                id: id => {
                    node.id = id;
                    return instance;
                },

                class: className => {
                    node.class = className;
                    return instance;
                },

                style: style => {
                    node.style = style;
                    return instance;
                },

                append: child => {
                    node.childNodes.push(child);
                    return instance;
                },

                innerHtml: content => {
                    node.innerHTML = content;
                    return instance;
                },

                data: dataset => {
                    for (let record in dataset)
                        node.dataset[record] = dataset[record];
                    return instance;
                },

                getNode: () => {
                    return node;
                }
            };
        })(name, doc);
        return instance;
    };


    it("iconFactory is not null", function () {
        expect(iconFactory).not.toBe(null);
    });

    it("iconFactory is a function", function () {
        expect(iconFactory).toEqual(jasmine.any(Function));
    });

    it("iconFactory.createIcon creates a workbench icon", function () {
        let properties = {
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
        };

        let factory = iconFactory(domTreeMock, textConverter, "images/icons");
        let icon = factory.createIcon(500, properties, true, 20);

        expect(icon).not.toBe(null);
        expect(icon.title).toBe(properties.title);
        expect(icon.disk).toBe(true);
        expect(icon.image).toBe("images/icons/workbench.png");
        expect(icon.imageSelected).toBe("images/icons/workbench_selected.png");
        expect(icon.initX).toBe(20);
        expect(icon.element.id).toBe("icon_500");
        expect(icon.element.name).toBe("div");
    });

    it("iconFactory.createIcon creates a window icon", function () {
        let properties = {
            title: "Shell",
            image: {
                file: "shell.png",
                height: 42,
                width: 42
            },
            imageSelected: {
                file: "shell_selected.png",
                height: 42,
                width: 42
            }
        };

        let factory = iconFactory(domTreeMock, textConverter, "images/icons");
        let icon = factory.createIcon(1000, properties, false, 0);

        expect(icon).not.toBe(null);
        expect(icon.title).toBe(properties.title);
        expect(icon.disk).toBe(false);
        expect(icon.image).toBe("images/icons/shell.png");
        expect(icon.imageSelected).toBe("images/icons/shell_selected.png");
        expect(icon.initX).toBe(0);
        expect(icon.element.id).toBe("icon_1000");
        expect(icon.element.name).toBe("div");
    });

    it("icon.setIconSize sets height and width", function () {
        let properties = {
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
        };

        let factory = iconFactory(domTreeMock, textConverter, "images/icons");
        let icon = factory.createIcon(500, properties, true, 20);

        icon.setIconSize();

        expect(icon.element.style.height).toBe("42px");
        expect(icon.element.style.width).toBe("42px");
    });

    it("icon.setPositionLeft sets left x position", function () {
        let properties = {
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
        };

        const left = "20px";

        let factory = iconFactory(domTreeMock, textConverter, "images/icons");
        let icon = factory.createIcon(500, properties, true, 20);

        icon.setPositionLeft(left);

        expect(icon.element.style.left).toBe(left);
    });

    it("icon.setPositionRight sets right x position", function () {
        let properties = {
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
        };

        const right = "20px";
        
        let factory = iconFactory(domTreeMock, textConverter, "images/icons");
        let icon = factory.createIcon(500, properties, true, 20);

        icon.setPositionRight(right);

        expect(icon.element.style.right).toBe(right);
    });

    it("icon.setPositionTop sets top y position", function () {
        let properties = {
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
        };

        const top = "40px";

        let factory = iconFactory(domTreeMock, textConverter, "images/icons");
        let icon = factory.createIcon(500, properties, true, 20);

        icon.setPositionTop(top);

        expect(icon.element.style.top).toBe(top);
    });
});