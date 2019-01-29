const express = require('express');
const app = express();
//const hostname = '127.0.0.1';
//const port = 3000;

const data = [
	{
		"id" : 1,
		"pid" : 0,
		"icons" : {
			"title": "Note!",
			"image" : { 
				"file" : "workbench.png",
				"width" : 35,
				"height" : 30
			},
			"imageSelected" : {
				"file" : "workbench_selected.png",
				"width" : 35,
				"height" : 30
			}
		},
		"window" : {
			"title": "Note!"
		},
		"content" : {
			"title": "Hello again!",
			"articles" : [
				{
					"title": "Renkbench relaunch",
					"text": "Currently lachsfilet.de is just running with static content from a node.js service, since my webhost has updated the PHP version.<br/>I took advantage of the resulting downtime to refactor my Workbench Javascript code and added some missing features like window resizing and scrolling by arrow buttons and scrollbar.<br/>A reworked backend and new content will follow soon.<br/><br/>Well, to be serious, as soon as possible. Whenever that is..."
				}
			]
		}
	}
];

app.get('/', (request, response) => {
	//response.set('Access-Control-Allow-Origin', '*');
	response.json(data);
});

app.listen(process.env.PORT || 8080, () => console.log(`Example app listening on port ${process.env.PORT || 8080}!`));