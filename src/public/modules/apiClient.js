"use strict";

// Renkbench API client
export var httpClient = httpClient => {
	const WINDOWS_URI = 'api/windows/';
    const MENU_URI = 'api/menu';
    const VERSION_URI = 'api/version';
    
    let getWorkbench = () => getWindow(0);

    let getWindow = id => getResult(WINDOWS_URI + "/" + id);
    
    let getMenu = id => getResult(MENU_URI + "/" + id);

    let getVersion = () => getResult(VERSION_URI);

    let getResult = uri =>
    {
        let result = {};
        
        httpClient.getJson(uri)
            .then(response => {
                result = response;
            })
            .catch(console.error);
        
        return result;
    };

    return {
        getWorkbench : getWorkbench,
        getWindow : getWindow,
        getMenu : getMenu,
        getVersion : getVersion
    };
};