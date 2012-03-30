pybossa.js is a JavaScript library that uses jQuery for interacting with a PyBossa API.

The library has two main functions:

* pybossa.newTask("appname")
* pybossa.saveTask( taskid, answer)

The goal is to use both libraries in the following way:

    pybossa.newTask("applicationName").done( function( data ) { // load the data into the HTML skeleton ... });
     pybossa.submiTask( taskid, answer).done( function( data ) {// tear down any elements from the view, and reload a new task if you want});

Very soon there will be three demo applications using this library.
