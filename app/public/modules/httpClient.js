"use strict";

// Provides HTTP functions
export var httpClient = (() => {
    var createRequest = (url, resolve, reject, method = "GET") =>
    {
        var request=new XMLHttpRequest();            
        request.open(method, url, true);
        request.onload = () => {
            if(request.status === 200)
                resolve(request.response);
            else
                reject(request.statusText)
        };

        request.onerror = () => {
            reject(Error("Network error"));
        }

        if(method === "POST")
            request.setRequestHeader("Content-Type", 
                "application/x-www-form-urlencoded; charset=UTF-8");
        
        return request;
    };

    //Validates a value before it will be transmitted.
	var validate = value =>
	{
		if(value.match(/<.*>/))
			return false;
		return value;
	};

    // Sends a HTTP request to the passed URL
    var get = (url, method) =>
        new Promise((resolve, reject) => {
            var request = createRequest(url, resolve, reject, method);         
            request.send();
        });

    var getJson = (url, method) => 
        get(url, method).then(JSON.parse);

    //Sends an AJAX POST request.
	var post = form =>
        new Promise((resolve, reject) => {
            var request = createRequest(form.action, resolve, reject, "POST");
            var data=[];
            for(var i=0;i<form.elements.length;i++)
            {
                var node=form.elements[i]
                if((name=node.name)
                && (value=validate(node.value)))
                    data.push(name + "=" + encodeURIComponent(value));
            }
            request.send(data.join("&"));
        });

    return {
        get: get,
        getJson: getJson,
        post: post
    };
})();