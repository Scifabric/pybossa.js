pybossa.js is a JavaScript library that uses jQuery for interacting with a PyBossa API.

The library has two main functions:

* pybossa.newTask("appname")
* pybossa.saveTask( taskid, answer)

The goal is to use both libraries in the following way:

    pybossa.newTask("applicationName").done( function( data ) { // load the data into the HTML skeleton ... });
    pybossa.submiTask( taskid, answer).done( function( data ) {// tear down any elements from the view, and reload a new task if you want});

If you want to learn how to use the library, please, check the two demo applications and their documentation:

* [FlickrPerson for PyBossa](https://github.com/PyBossa/app-flickrperson) [[doc]](http://app-flickrperson.rtfd.org)
* [Urban Parks for PyBossa](https://github.com/PyBossa/app-geocoding) [[doc]](http://app-geocoding.rtfd.org)


