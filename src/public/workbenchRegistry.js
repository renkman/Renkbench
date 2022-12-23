"use strict";

import {createNode} from "./modules/domTree.js";
import {textConverter} from "./modules/text.js";
import {httpClient} from "./modules/httpClient.js";

import { createApiClient } from "./modules/apiClient.js";
import { createWindowRegistry } from "./modules/windowRegistry.js";
import { createWindowFactory } from "./modules/windowFactory.js";
import { createMenuFactory } from "./modules/menuFactory.js";
import { createIconFactory } from "./modules/iconFactory.js";
import { createWindowService } from "./modules/windowService.js";

// Renkbench dependency injection registry
export var createWorkbenchRegistry = () => {
	const apiClient = createApiClient(httpClient);
    const windowFactory = createWindowFactory(createNode, textConverter, element);
	const menuFactory = createMenuFactory(createNode, textConverter);
	const iconFactory = createIconFactory(createNode, textConverter, ICONS);
	const windowRegistry = createWindowRegistry(windowFactory, menuFactory, iconFactory);
	const windowService = createWindowService(registry, apiClient, element);

    const registry = {
        getApiClient: () => apiClient,
        getWindowFactory: () => windowFactory,
        getMenuFactory: () => menuFactory,
        getIconFactory: () => iconFactory,
        getRegistry: () => windowRegistry,
        getWindowService: () => windowService,
        httpClient: httpClient,
        textConverter: textConverter,
        createNode: createNode
    };

    return registry;
};