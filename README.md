# Renkbench
A Javascript Amiga Workbench 1.3.3 look and feel clone.
[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://github.com/lachsfilet/Renkbench/blob/master/LICENSE)
[![Build Status](https://janrenkenproximity.visualstudio.com/Renkbench/_apis/build/status/lachsfilet.Renkbench%20(1)?branchName=master)](https://janrenkenproximity.visualstudio.com/Renkbench/_build/latest?definitionId=4&branchName=master)
[![Release Status](https://janrenkenproximity.vsrm.visualstudio.com/_apis/public/Release/badge/32667b41-0105-4d9e-9373-339cff2ee9ae/1/1)](https://janrenkenproximity.vsrm.visualstudio.com/_apis/public/Release/badge/32667b41-0105-4d9e-9373-339cff2ee9ae/1/1)
<!-- [![Build Status](https://dev.azure.com/janrenken/Renkbench/_apis/build/status/lachsfilet.Renkbench?branchName=master)](https://dev.azure.com/janrenken/Renkbench/_build/latest?definitionId=1&branchName=master) -->

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
* Put the workbench.json data into a NoSQL database (e. g. [MongoDB](https://www.mongodb.com/))

## Backend
The Node.js backend currently delivers the menu and windows tree as JSON.

## Docker
I added a Dockerfile to enhance the delivery process and get the advantage to run it locally without setting up a Node.js deamon. For CI build and release I added Azure DevOps pipelines as YAML code.

## Unit tests
I started with unit testing using [Jasmine](https://github.com/jasmine/jasmine), [jasmine-es6](https://github.com/vinsonchuong/jasmine-es6) and [window](https://github.com/lukechilds/window), after I cut the createNode builder out of the monolith.