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
    let createMenu = (menuContract, id, openWindowsCount) =>
	{
		if(!menuContract)
			return null;

		let create = (menuContract, id) => {
			let menu = createNode("div").id("menu-" + id).getNode();

			let items = menuContract.menu;
			for(let item of items)
			{
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
		
		let enableMenu = (node, id, enable, checkConditions) => {
			for(let i=0; i < node.children.length; i++)
			{
				let child = node.children[i];
				enableMenu(child, id, enable, checkConditions);				
	
				if(!child.className.includes("dropdown-entry"))
					continue;

				if(child.dataset.conditions === "true")
					continue;

				let isEnabled = enabled && enable && checkConditions(child.dataset.conditions, id);
				child.className = isEnabled ? "dropdown-entry": "dropdown-entry-disabled";
				setMenuEntryColor(child, isEnabled ? textConverter().fontColor.blueOnWhite : textConverter().fontColor.blueOnWhiteInactive);
				child.dataset.isEnabled = isEnabled;
			}
		};

		let setMenuEntryColor = (menuEntry, color) => {
			menuEntry.childNodes.forEach(word => {
				word.childNodes.forEach(character => {
					var position = character.style.backgroundPosition;
					var coordinates = position.split(" ");
					character.style.backgroundPosition = coordinates[0] + " -" + color + "px";
				});
			});
		};

		// let checkConditions = (conditionString, id) => {
		// 	if(!id)
		// 		return false;

		// 	let record = registry[id];
		// 	let conditions = JSON.parse(conditionString);
		// 	return conditions.every(condition => {
		// 		if(condition.operand === "greaterThan")
		// 			return record[condition.property] > condition.value;
		// 		return record[condition.property] === condition.value;
		// 	});
		// };
		
		let update = (openWindowsCount) => {		
			menu.childNodes.forEach(node => {
				node.childNodes[1].style.zIndex = openWindowsCount + 2;
			});

			// if(enabled)
			// 	enableMenu(menu, id, true, checkConditions);
		};
		
		let enabled = false;
		let menu = create(menuContract, id);
		update(openWindowsCount);
		
		return  {			
			id : id,
			
			// The DOM-element of this menu
			element : menu,

			enableMenu : (id, checkConditions) => {
				enabled = true;
				enableMenu(menu, id, true, checkConditions)
			},

			disableMenu : id => {
				enabled = false;
				enableMenu(menu, id, false)
			},

			updateMenu : openWindowsCount => update(openWindowsCount)
		};
	};
    
    return {
        createMenu: createMenu
    };
};