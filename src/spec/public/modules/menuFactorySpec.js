"use strict";

import { menuFactory } from "../../../public/modules/menuFactory.js";
import { textConverter } from "../../../public/modules/text.js";

describe("menuFactory tests", function () {
    let domTreeMock = (name, doc) => {
        let instance = (name => {
            let node = {
                name: name,
                id: null,
                class: null,
                style: {
                    zIndex: null
                },
                childNodes: [],
                innerHTML: null,
                dataset: {}
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

                appendTo: parent => {
                    parent.childNodes.push(node);
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


    it("menuFactory is not null", function () {
        expect(menuFactory).not.toBe(null);
    });

    it("menuFactory is a function", function () {
        expect(menuFactory).toEqual(jasmine.any(Function));
    });

    it("menuFactory creates a workbench menu", function () {
        let menuItems = [
            {
                name: "Amiga",
                entries: [
                    {
                        name: "Amiga 500",
                        command: "play",
                        conditions: [{ property: "isSelected", value: true }]
                    },
                    {
                        name: "Amiga 1000",
                        command: "work",
                        conditions: "true"
                    }
                ]
            },
            {
                name: "8 bit",
                entries: [
                    {
                        name: "VIC 20",
                        command: "load",
                        conditions: "true"
                    }
                ]
            }
        ];

        let expected = {
            name: "div",
            id: "menu-1",
            class: null,
            style: {
                zIndex: null
            },
            childNodes: [
                {
                    name: "div",
                    id: null,
                    class: "dropdown",
                    style: {
                        zIndex: null
                    },
                    childNodes: [
                        {
                            name: "button",
                            id: null,
                            class: "dropdown-title",
                            style: {
                                zIndex: null
                            },
                            childNodes: [],
                            innerHTML: '<div class="word"><div class="char" data-char="A" style="background-position: -408px -16px"></div><div class="char" data-char="m" style="background-position: -184px -16px"></div><div class="char" data-char="i" style="background-position: -152px -16px"></div><div class="char" data-char="g" style="background-position: -136px -16px"></div><div class="char" data-char="a" style="background-position: -88px -16px"></div></div><div class="stop"></div>',
                            dataset: {}
                        },
                        {
                            name: "div",
                            id: null,
                            class: "dropdown-content",
                            style: {
                                zIndex: 5
                            },
                            childNodes: [
                                {
                                    name: "div",
                                    id: null,
                                    class: "dropdown-entry-disabled",
                                    style: {
                                        zIndex: null
                                    },
                                    childNodes: [],
                                             // <div class="word"><div class="char" data-char="A" style="background-position: -408px -96px"></div><div class="char" data-char="m" style="background-position: -184px -96px"></div><div class="char" data-char="i" style="background-position: -152px -96px"></div><div class="char" data-char="g" style="background-position: -136px -96px"></div><div class="char" data-char="a" style="background-position: -88px -96px"></div><div class="char" data-char=" " style="background-position: -0px -96px"></div></div><div class="word"><div class="char" data-char="5" style="background-position: -48px -96px"></div><div class="char" data-char="0" style="background-position: -8px -96px"></div><div class="char" data-char="0" style="background-position: -8px -96px"></div></div><div class="stop"></div>
                                    innerHTML: '<div class="word"><div class="char" data-char="A" style="background-position: -408px -96px"></div><div class="char" data-char="m" style="background-position: -184px -96px"></div><div class="char" data-char="i" style="background-position: -152px -96px"></div><div class="char" data-char="g" style="background-position: -136px -96px"></div><div class="char" data-char="a" style="background-position: -88px -96px"></div><div class="char" data-char=" " style="background-position: -0px -96px"></div></div><div class="word"><div class="char" data-char="5" style="background-position: -48px -96px"></div><div class="char" data-char="0" style="background-position: -8px -96px"></div><div class="char" data-char="0" style="background-position: -8px -96px"></div></div><div class="stop"></div>',
                                    dataset:
                                    {
                                        command: "play",
                                        conditions: [{ property: "isSelected", value: true }],
                                        isEnabled: false
                                    }
                                },
                                {
                                    name: "div",
                                    id: null,
                                    class: "dropdown-entry",
                                    style: {
                                        zIndex: null
                                    },
                                    childNodes: [],
                                    innerHTML: '<div class="word"><div class="char" data-char="A" style="background-position: -408px -16px"></div><div class="char" data-char="m" style="background-position: -184px -16px"></div><div class="char" data-char="i" style="background-position: -152px -16px"></div><div class="char" data-char="g" style="background-position: -136px -16px"></div><div class="char" data-char="a" style="background-position: -88px -16px"></div><div class="char" data-char=" " style="background-position: -0px -16px"></div></div><div class="word"><div class="char" data-char="1" style="background-position: -16px -16px"></div><div class="char" data-char="0" style="background-position: -8px -16px"></div><div class="char" data-char="0" style="background-position: -8px -16px"></div><div class="char" data-char="0" style="background-position: -8px -16px"></div></div><div class="stop"></div>',
                                    dataset:
                                    {
                                        command: "work",
                                        conditions: "true",
                                        isEnabled: true
                                    }
                                }
                            ],
                            innerHTML: null,
                            dataset: {}
                        }
                    ],
                    innerHTML: null,
                    dataset: {}
                },
                {
                    name: "div",
                    id: null,
                    class: "dropdown",
                    style: {
                        zIndex: null
                    },
                    childNodes: [
                        {
                            name: "button",
                            id: null,
                            class: "dropdown-title",
                            style: {
                                zIndex: null
                            },
                            childNodes: [],
                            innerHTML: '<div class="word"><div class="char" data-char="8" style="background-position: -72px -16px"></div><div class="char" data-char=" " style="background-position: -0px -16px"></div></div><div class="word"><div class="char" data-char="b" style="background-position: -96px -16px"></div><div class="char" data-char="i" style="background-position: -152px -16px"></div><div class="char" data-char="t" style="background-position: -240px -16px"></div></div><div class="stop"></div>',
                            dataset: {}
                        },
                        {
                            name: "div",
                            id: null,
                            class: "dropdown-content",
                            style: {
                                zIndex: 5
                            },
                            childNodes: [
                                {
                                    name: "div",
                                    id: null,
                                    class: "dropdown-entry",
                                    style: {
                                        zIndex: null
                                    },
                                    childNodes: [],
                                    innerHTML: '<div class="word"><div class="char" data-char="V" style="background-position: -576px -16px"></div><div class="char" data-char="I" style="background-position: -472px -16px"></div><div class="char" data-char="C" style="background-position: -424px -16px"></div><div class="char" data-char=" " style="background-position: -0px -16px"></div></div><div class="word"><div class="char" data-char="2" style="background-position: -24px -16px"></div><div class="char" data-char="0" style="background-position: -8px -16px"></div></div><div class="stop"></div>',
                                    dataset:
                                    {
                                        command: "load",
                                        conditions: "true",
                                        isEnabled: true
                                    }
                                }
                            ],
                            innerHTML: null,
                            dataset: {}
                        }
                    ],
                    innerHTML: null,
                    dataset: {}
                }
            ],
            innerHTML: null,
            dataset: {}
        };

        let factory = menuFactory(domTreeMock, textConverter);
        let menu = factory.createMenu(menuItems, 1, 3);
     
        expect(menu).not.toBe(null);
        expect(menu.id).toBe(1);
        expect(menu.element).toEqual(expected);
        expect(menu.enableMenu).toEqual(jasmine.any(Function));
        expect(menu.disableMenu).toEqual(jasmine.any(Function));
        expect(menu.updateMenu).toEqual(jasmine.any(Function));
    });
});