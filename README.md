# Renkbench
A Javascript Amiga Workbench 1.3.3 look and feel clone.
[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://github.com/lachsfilet/Renkbench/blob/master/LICENSE)
[![Build Status](https://dev.azure.com/janrenken/Renkbench/_apis/build/status/lachsfilet.Renkbench?branchName=master)](https://dev.azure.com/janrenken/Renkbench/_build/latest?definitionId=1&branchName=master)
[![Release Status](https://vsrm.dev.azure.com/janrenken/_apis/public/Release/badge/efce0c4b-a0fc-45d4-b52e-d8852f6bf714/2/3)](https://vsrm.dev.azure.com/janrenken/_apis/public/Release/badge/efce0c4b-a0fc-45d4-b52e-d8852f6bf714/2/3)

## Goal
For getting some Javascript practice, in the year 2009 I created an [Amiga Workbench](https://en.wikipedia.org/wiki/Workbench_(AmigaOS)#Workbench_1.x) clone and hosted it on [Lachsfilet.de](http://www.lachsfilet.de/).
Since not all look and feel features of the orginal Workbench were implemented, in December of 2018 I started to refactor the code and added some missing features.

In the meantime I put the whole page into a [Docker](https://www.docker.com/) container to simplify the deployment process.

## Frontend features
Currently, the Workbench clone contains the following features:

* Drag and drop functionality for icons and windows
* Topaz style font
* Original window behavior with resizing and scrolling
* Window to the front and to the back buttons
* Closing of windows
* Directories displayed as drawers
* Context menu in the main title bar triggered by mouse right click
* Touch events for handheld usage
* Customized keyboard input using Topaz font

## To-do
* Bugfixing
* Content
* Introduce applications
* Further refactoring
* Continue splitting frontend code into multiple files
* Put the workbench.json data into the NoSQL database [CouchDB](https://couchdb.apache.org/)
* Setup Docker Compose

## Backend
The Node.js backend currently delivers the menu and windows tree as JSON.

## Docker
I added a Dockerfile to enhance the delivery process and get the advantage to run it locally without setting up a Node.js deamon. For CI build and release I added Azure DevOps pipelines as YAML code.

## Unit tests
I started with unit testing using [Jasmine](https://github.com/jasmine/jasmine), [jasmine-es6](https://github.com/vinsonchuong/jasmine-es6) and [window](https://github.com/lukechilds/window), after I cut the createNode builder out of the monolith.