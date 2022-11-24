import { iconFactory } from "../../../public/modules/iconFactory.js";
import { textConverter } from "../../../public/modules/text.js";


describe("iconFactory tests", function () {
    var domTreeMock = (name, doc) => {
        var instance = ((name, doc) => {
            var node = {
                id: "Id",
                class: "Class",
                style: {
                    height: "0px",
                    width: "0px",
                    top: "0px",
                    right: "0px"
                },
                children: [],
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
                    node.children.push(child);
                    return instance;
                },

                innerHtml: content => {
                    node.innerHTML = content;
                    return instance;
                },

                data: dataset => {
                    for (var record in dataset)
                        node.dataset[record] = dataset[record];
                    return instance;
                },

                getNode: () => {
                    return node;
                }
            };
        })(name, doc);
        return instance;
    }


    it("iconFactory is not null", function () {
        expect(iconFactory).not.toBe(null);
    });

    it("iconFactory is a function", function () {
        expect(iconFactory).toEqual(jasmine.any(Function));
    });

    it("iconFactory creates a workbench icon", function () {
        var workbenchElement = {
            offsetTop: 0,
            offsetHeight: 4000
        };

        var properties = {
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
        }

        var passedIcon = {};
        var parentWindow = {
            id: 0,
            iconStartPos: {
                y: "10px"
            },
            addIcon: icon => passedIcon = icon
        };

        var iconStartPos = { x: "20px", y: "40px" };

        var factory = iconFactory(domTreeMock, textConverter);
        var icon = factory.createIcon(500, properties, parentWindow, iconStartPos, 0, workbenchElement);

        expect(icon).not.toBe(null);
        expect(icon.title).toBe(properties.title);
        expect(icon.disk).toBe(true);
        expect(icon.image).toBe("images/icons/workbench.png");
        expect(icon.imageSelected).toBe("images/icons/workbench_selected.png");
        expect(icon.initX).toBe(20);
        expect(icon.element.style.right).toBe("20px");
        expect(icon.element.style.top).toBe("10px");
        expect(icon.element.style.height).toBe("42px");
        expect(icon.element.style.width).toBe("42px");
        expect(icon).toBe(passedIcon);
    });

    it("iconFactory creates a window icon", function () {
        var properties = {
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
        }

        var passedIcon = {};
        var parentWindow = {
            id: 1000,
            iconStartPos: {
                y: "10px"
            },
            addIcon: icon => passedIcon = icon
        };

        var iconStartPos = { x: "20px", y: "40px" };

        var factory = iconFactory(domTreeMock, textConverter);
        var icon = factory.createIcon(500, properties, parentWindow, iconStartPos, 0, {});

        expect(icon).not.toBe(null);
        expect(icon.title).toBe(properties.title);
        expect(icon.disk).toBe(false);
        expect(icon.image).toBe("images/icons/shell.png");
        expect(icon.imageSelected).toBe("images/icons/shell_selected.png");
        expect(icon.initX).toBe(0);
        expect(icon.element.style.right).toBe("0px");
        expect(icon.element.style.top).toBe("10px");
        expect(icon.element.style.height).toBe("42px");
        expect(icon.element.style.width).toBe("42px");
        expect(icon).toBe(passedIcon);
    });
});