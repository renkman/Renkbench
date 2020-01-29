const express = require('express');
const fs = require('fs');
const path = require('path');

const public = path.join(__dirname, '../public');

const app = express();

const db = require('./repositories/initializer')('workbench');

db.initDatabase();

app.get('/data', (request, response) => {
	var filePath = path.join(__dirname, '../../data', "workbench.json");
	var file = fs.readFileSync(filePath);
	var data = JSON.parse(file);
	
	response.set('Access-Control-Allow-Origin', '*');
	response.json(data);
});

app.use('/', express.static(public))

app.listen(process.env.PORT || 8080, () => console.log(`Renkbench service app listening on port ${process.env.PORT || 8080}!`));