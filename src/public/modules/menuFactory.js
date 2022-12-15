/*
*	Just an Amiga Workbench look and feel clone, written in Javascript.
*	Copyright 2022 by Jan Renken, Hamburg
*	
*	This software is licensed under the GNU General Public License Version 3.0.
*
*	So feel free to use, modify and distribute it.
*
*	Amiga for life...
*/

"use strict";

// Creates workbench menu
export var createMenuFactory = (createNode, textConverter) => {
    let createMenu = (items, id, openWindowsCount) =>
	{
		if(!items)
			return null;

		let create = (items, id) => {
			let menu = createNode("div").id("menu-" + id).getNode();
			for(let itemIndex in items)
			{
				let item = items[itemIndex];
				let dropdown = createNode("div").class("dropdown").appendTo(menu).getNode();
				let title = textConverter().convertText(item.name, textConverter().fontColor.blueOnWhite);
				createNode("button").class("dropdown-title").appendTo(dropdown).innerHtml(title).getNode();
				
				let content = createNode("div").class("dropdown-content").appendTo(dropdown).getNode();
				for(let entryId in item.entries)
				{
					let entry = item.entries[entryId];
					let enabled = entry.conditions === "true";			
					let text = textConverter().convertText(entry.name, enabled ? textConverter().fontColor.blueOnWhite : textConverter().fontColor.blueOnWhiteInactive);
					createNode("div").class(enabled ? "dropdown-entry" : "dropdown-entry-disabled")
						.appendTo(content)
						.innerHtml(text)
						.data({
							command: entry.command,
							conditions : entry.conditions,
							isEnabled : enabled
						})
						.getNode();
				}
			}
			return menu;
		};
		
		let enableMenu = (node, enable) => {
			for(let i=0; i < node.children.length; i++)
			{
				let child = node.children[i];
				enableMenu(child, enable);				
	
				if(!child.className.includes("dropdown-entry"))
					continue;

				if(child.dataset.conditions === "true")
					continue;

				let isEnabled = enabled && enable && checkConditions(child.dataset.conditions);
				child.className = isEnabled ? "dropdown-entry": "dropdown-entry-disabled";
				setMenuEntryColor(child, isEnabled ? textConverter().fontColor.blueOnWhite : textConverter().fontColor.blueOnWhiteInactive);
				child.dataset.isEnabled = isEnabled;
			}
		};

		let checkConditions = conditionString => {
			if(!oldSelectedElement || !oldSelectedElement.dataset || !oldSelectedElement.dataset.id)
				return false;

			let selectedId = oldSelectedElement.dataset.id;
			let record = registry[selectedId];
			let conditions = JSON.parse(conditionString);
			return conditions.every(condition => {
				if(condition.operand === "greaterThan")
					return record[condition.property] > condition.value;
				return record[condition.property] === condition.value;
			});
		};
		
		let update = (openWindowsCount) => {		
			menu.childNodes.forEach(node => {
				node.childNodes[1].style.zIndex = openWindowsCount + 2;
			});

			if(enabled)
				enableMenu(menu, true);
		};
		
		let enabled = false;
		let menu = create(items, id);
		update(openWindowsCount);
		
		return  {			
			id : id,
			
			// The DOM-element of this menu
			element : menu,

			enableMenu : () => {
				enabled = true;
				enableMenu(menu, true)
			},

			disableMenu : () => {
				enabled = false;
				enableMenu(menu, false)
			},

			updateMenu : openWindowsCount => update(openWindowsCount)
		};
	};
    
    return {
        createMenu: createMenu
    };
};