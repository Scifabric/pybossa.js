[![Build Status](https://travis-ci.org/Scifabric/pybossa.js.svg?branch=master)](https://travis-ci.org/Scifabric/pybossa.js)

# PyBossa.JS: a JavaScript for PyBossa.

PyBossa.JS is a simple JavaScript library that will allow you to create
a PyBossa project using three methods:

* pybossa.taskLoaded,
* pybossa.presentTask, 
* pybossa.saveTask, and
* pybossa.run('your-slug-project-name')

If you want to learn how to use the library, please, check the demo project and their documentation:

**NOTE**: pybossa.saveTask can have a task object or a task.id. It's up to you.

* [FlickrPerson for PyBossa](https://github.com/PyBossa/app-flickrperson) [[doc]](http://docs.pybossa.com/user/tutorial/)

If you want more details, check the [documentation](http://pybossajs.rtfd.org).

# Contributing to PyBossa.JS

If you want to contribute to this library, please, read carefully the
[Contribution Guidelines](CONTRIBUTING.md)

# Running Tests

You will need to have [npm](https://www.npmjs.com/) with either Node or io.js.
First time, run:

```
  npm install -g grunt-cli
  npm install
```

And from this point, you can run the tests simply with:

```
  grunt test
```

# Copyright

Copyright 2015 [SciFabric LTD](http://scifabric.com).

# License

GPLv3 (see [COPYING file](COPYING))
