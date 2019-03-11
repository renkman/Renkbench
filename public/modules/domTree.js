/*
*	Just an Amiga Workbench look and feel clone, written in Javascript.
*	Copyright 2019 by Jan Renken, Hamburg
*	
*	This software is licensed under the GNU General Public License Version 3.0.
*
*	So feel free to use, modify and distribute it.
*
*	Amiga for life...
*/

"use strict";

// Fluent node creation interface
export var createNode = name => {
    var instance = (name => {
        var node = document.createElement(name);
        
        return {
            id : id => {
                node.id = id;
                return instance;
            },
            
            class : className => {
                node.className=className;
                return instance;
            },
            
            style : style => {
                for(var setting in style)
                    node.style[setting]=style[setting];
                return instance;
            },
            
            appendTo : parent => {
                parent.appendChild(node);
                return instance;
            },
                            
            append : child => {
                node.appendChild(child);
                return instance;
            },
            
            innerHtml : content => {
                node.innerHTML=content;
                return instance;
            },
            
            clone : deep => {
                node=node.cloneNode(deep);
                return instance;
            },
            
            data : dataset => {
                for(var record in dataset)
                    node.dataset[record]=dataset[record];
                return instance;
            },
            
            tabIndex : tabIndex => {
                node.tabIndex = tabIndex
                return instance;
            },

            getNode : () => {
                return node;
            }
        };
    })(name);
    return instance;
};