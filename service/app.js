const express = require('express');
const fs = require('fs');

const app = express();

app.get('/', (request, response) => {
	var file = fs.readFileSync("workbench.json");
	var data = JSON.parse(file);
	
	response.set('Access-Control-Allow-Origin', '*');
	response.json(data);
});

app.listen(process.env.PORT || 8080, () => console.log(`Renkbench service app listening on port ${process.env.PORT || 8080}!`));