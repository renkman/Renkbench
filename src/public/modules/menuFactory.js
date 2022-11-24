"use strict";

// Manages workbench windows
export var windowFactory = createNode => {
    var createNode = createNode;

    var createMenu = (items, id) =>
	{
		if(!items)
			return null;

		var create = (items, id) => {
			var menu = createNode("div").id("menu-" + id).getNode();
			for(var itemIndex in items)
			{
				var item = items[itemIndex];
				var dropdown = createNode("div").class("dropdown").appendTo(menu).getNode();
				var title = textConverter().convertText(item.name, textConverter().fontColor.blueOnWhite);
				createNode("button").class("dropdown-title").appendTo(dropdown).innerHtml(title).getNode();
				
				var content = createNode("div").class("dropdown-content").appendTo(dropdown).getNode();
				for(var entryId in item.entries)
				{
					var entry = item.entries[entryId];
					var enabled = entry.conditions === "true";			
					var text = textConverter().convertText(entry.name, enabled ? textConverter().fontColor.blueOnWhite : textConverter().fontColor.blueOnWhiteInactive);
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
		
		var enableMenu = (node, enable) => {
			for(var i=0; i < node.children.length; i++)
			{
				var child = node.children[i];
				enableMenu(child, enable);				
	
				if(!child.className.includes("dropdown-entry"))
					continue;

				if(child.dataset.conditions === "true")
					continue;

				var isEnabled = enabled && enable && checkConditions(child.dataset.conditions);
				child.className = isEnabled ? "dropdown-entry": "dropdown-entry-disabled";
				setMenuEntryColor(child, isEnabled ? textConverter().fontColor.blueOnWhite : textConverter().fontColor.blueOnWhiteInactive);
				child.dataset.isEnabled = isEnabled;
			}
		};

		var checkConditions = conditionString => {
			if(!oldSelectedElement || !oldSelectedElement.dataset || !oldSelectedElement.dataset.id)
				return false;

			var selectedId = oldSelectedElement.dataset.id;
			var record = registry[selectedId];
			var conditions = JSON.parse(conditionString);
			return conditions.every(condition => {
				if(condition.operand === "greaterThan")
					return record[condition.property] > condition.value;
				return record[condition.property] === condition.value;
			});
		};
		
		var update = () => {		
			menu.childNodes.forEach(node => {
				node.childNodes[1].style.zIndex = openOrder.length + 2;
			});

			if(enabled)
				enableMenu(menu, true);
		};
		
		var enabled = false;
		var menu = create(items, window);
		update();
		
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

			updateMenu : () => update()
		};
	};
    
    return {
        createMenu: createMenu
    };
};