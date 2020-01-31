const express = require('express');
const fs = require('fs');
const path = require('path');

const public = path.join(__dirname, '../public');
const build = process.env.buildnumber || 'Local';
const release = process.env.release || 'Local';
const version = process.env.npm_package_version || 'Local';

const app = express();

const db = require('./repositories/initializer')('workbench');


app.get('/data', (request, response) => {
	var filePath = path.join(__dirname, '../../data', "workbench.json");
	var file = fs.readFileSync(filePath);
	var data = JSON.parse(file);
	
	response.set('Access-Control-Allow-Origin', '*');
	response.json(data);
});

app.get('/version', (request, response) => {
	response.json({
		version: version,
		build: build,
		release: release
	})
});

db.initDatabase().then(() => {
	app.use('/', express.static(public));
	app.listen(process.env.PORT || 8080, () => console.log(`Renkbench service app listening on port ${process.env.PORT || 8080}!`));
});