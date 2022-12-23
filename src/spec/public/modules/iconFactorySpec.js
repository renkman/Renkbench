"use strict";

import { createIconFactory } from "../../../public/modules/iconFactory.js";
import { textConverter } from "../../../public/modules/text.js";

describe("iconFactory tests", function () {
    const domTreeMock = (name, doc) => {
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
        expect(createIconFactory).not.toBe(null);
    });

    it("iconFactory is a function", function () {
        expect(createIconFactory).toEqual(jasmine.any(Function));
    });

    it("iconFactory.createIcon creates a workbench icon", function () {
        const properties = {
            id: 500,
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

        let passedIcon = {};
        const workbench = {
            id : 0,
            addIcon: icon => {
                passedIcon = icon;
            }
        };

        const factory = createIconFactory(domTreeMock, textConverter, "images/icons");
        let icon = factory.createIcon(properties, workbench, 20);

        expect(icon).not.toBe(null);
        expect(icon.title).toBe(properties.title);
        expect(icon.disk).toBe(true);
        expect(icon.image).toBe("images/icons/workbench.png");
        expect(icon.imageSelected).toBe("images/icons/workbench_selected.png");
        expect(icon.initX).toBe(20);
        expect(icon.element.id).toBe("icon_500");
        expect(icon.element.name).toBe("div");
        expect(passedIcon).toBe(icon);
    });

    it("iconFactory.createIcon creates a window icon", function () {
        const properties = {
            id : 1000,
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

        let passedIcon = {};
        const window = {
            id : 1985,
            addIcon: icon => {
                passedIcon = icon;
            }
        };

        const factory = createIconFactory(domTreeMock, textConverter, "images/icons");
        let icon = factory.createIcon(properties, window, 0);

        expect(icon).not.toBe(null);
        expect(icon.title).toBe(properties.title);
        expect(icon.disk).toBe(false);
        expect(icon.image).toBe("images/icons/shell.png");
        expect(icon.imageSelected).toBe("images/icons/shell_selected.png");
        expect(icon.initX).toBe(0);
        expect(icon.element.id).toBe("icon_1000");
        expect(icon.element.name).toBe("div");
        expect(passedIcon).toBe(icon);
    });

    it("icon.setIconSize sets height and width", function () {
        const properties = {
            id: 2000,
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

        let window = {
            id : 0,
            addIcon : icon => {}
        };

        const factory = createIconFactory(domTreeMock, textConverter, "images/icons");
        let icon = factory.createIcon(properties, window, 20);

        icon.setIconSize();

        expect(icon.element.style.height).toBe("42px");
        expect(icon.element.style.width).toBe("42px");
    });

    it("icon.setPositionLeft sets left x position", function () {
        const properties = {
            id: 3000,
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

        const window = {
            id : 0,
            addIcon : icon => {}
        };

        const left = "20px";

        const factory = createIconFactory(domTreeMock, textConverter, "images/icons");
        let icon = factory.createIcon(properties, window, 20);

        icon.setPositionLeft(left);

        expect(icon.element.style.left).toBe(left);
    });

    it("icon.setPositionRight sets right x position", function () {
        const properties = {
            id: 4000,
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

        const window = {
            id : 0,
            addIcon : icon => {}
        };

        const right = "20px";
        
        const factory = createIconFactory(domTreeMock, textConverter, "images/icons");
        let icon = factory.createIcon(properties, window, 20);

        icon.setPositionRight(right);

        expect(icon.element.style.right).toBe(right);
    });

    it("icon.setPositionTop sets top y position", function () {
        const properties = {
            id: 1200,
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

        let passedIcon = {};
        const window = {
            id : 0,
            addIcon: icon => {
                passedIcon = icon;
            }
        };

        const top = "40px";

        const factory = createIconFactory(domTreeMock, textConverter, "images/icons");
        let icon = factory.createIcon(properties, window, 20);

        icon.setPositionTop(top);

        expect(icon.element.style.top).toBe(top);
        expect(passedIcon).toBe(icon);
    });
});