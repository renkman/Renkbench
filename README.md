# Renkbench
A Javascript Amiga Workbench 1.3.3 look and feel clone.
[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://github.com/lachsfilet/Renkbench/blob/master/LICENSE)
[![Build Status](https://dev.azure.com/janrenken/Renkbench/_apis/build/status/lachsfilet.Renkbench?branchName=master)](https://dev.azure.com/janrenken/Renkbench/_build/latest?definitionId=1&branchName=master)

## Goal
For getting some Javascript practice, in the year 2009 I created an Amiga Workbench clone and hosted it on [Lachsfilet.de](http://www.lachsfilet.de/).
Since not all look and feel features of the orginal Workbench were implemented, in December of 2018 I started to refactor the code and added some missing features.

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
* Split frontend code into multiple files?
* Err... unit tests?

## Backend
The Node.js backend currently delivers the menu and windows tree as JSON.