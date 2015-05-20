var bind,
  slice = [].slice
// check for missing features
if (typeof bind !== 'function') {
  // adapted from Mozilla Developer Network example at
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
  bind = function bind(obj) {
    var args = slice.call(arguments, 1),
      self = this,
      nop = function() {
      },
      bound = function() {
        return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));
      };
    nop.prototype = this.prototype || {}; // Firefox cries sometimes if prototype is undefined
    bound.prototype = new nop();
    return bound;
  };
  Function.prototype.bind = bind;
}

module("pybossa.newTask() with PyBossa served from a root URL method");
test('should get a new task for the "slug" project from the server', function() {
        // We use the FakeServer feature to test pybossa.js
        var server = this.sandbox.useFakeServer();

        // Two sample projects are created
        project = [{"info": {"task_presenter": "some HTML and JS" }, "time_limit": null, "description": "Question", "short_name": "slug", "created": "2012-04-02T11:31:24.400338", "owner_id": 1, "calibration_frac": null, "bolt_course_id": null, "time_estimate": null, "hidden": 0, "long_tasks": null, "id": 1, "name": "Application Name"}];

        var tmp = JSON.stringify(project);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/api/project?short_name=slug",
            [200, { "Content-type": "application/json" },
            tmp] 
            );

        // One task for the project:
        var task = [{"info": {"variable": "value"}, "quorum": null, "calibration": 0, "created": "2012-04-02T11:31:24.478663", "project_id": 1, "state": "0", "id": 1, "priority_0": 0.0}];

        var tmp = JSON.stringify(task);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/api/project/1/newtask?offset=0",
            [200, { "Content-type": "application/json" },
            tmp]
            );

        // Test the method newTask( projectname );
        pybossa.url = "";
        pybossa.newTask( "slug" ).done( function( data ) {
                equal( data.question, project[0].description, "The obtained task belongs to the Slug project (id: 1)");
                equal( data.task[0].id, task[0].id, "The TaskRun has been created using the right Task (id: 1)");
                });

        // Trigger the server endpoints
        server.respond();
});

module("pybossa.saveTask() method");

test('should save a task for the "slug" project in the server', function() {

        var server = this.sandbox.useFakeServer();

        // One task for the project:
        var task = [{"info": {"variable": "value"}, "quorum": null, "calibration": 0, "created": "2012-04-02T11:31:24.478663", "project_id": 1, "state": "0", "id": 1, "priority_0": 0.0}];

        var tmp = JSON.stringify(task[0]);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/api/task/1",
            [200, { "Content-type": "application/json" },
            tmp] 
            );

        var taskrun = [{"info": {"answer": "Value"}, "user_id": 1, "task_id": 1, "created": "2012-04-02T11:51:24.478663", "finish_time": "2012-04-02T11:51:24.478663", "calibration": null, "project_id": 1, "user_ip": null, "timeout": null, "id": 1}];

        var tmp = JSON.stringify(taskrun[0]);

        // The endpoint for the FakeServer:
        server.respondWith(
            "POST", "/api/taskrun",
            [200, { "Content-type": "application/json" },
            tmp]
            );

        // Test the method submitTask( taskid, answer );
        taskid = 1;
        ans = taskrun[0].info;
        pybossa.saveTask( taskid, ans ).done( function( data ) {
                equal( data.info.answer, taskrun[0].info.answer, "The obtained task belongs to the Slug project (id: 1)");
                });

        server.respond();
});

module("pybossa.getCurrentTaskId() method");

test('should return the TaskId from the URL', function() {
        url = "http://pybossa.com/project/flickrperson/task/1";
        var res = pybossa.getCurrentTaskId(url);
        equal("1" , res, "The returned task.id is the same of the URL");
});

test('should return false as URL does not have the task slug', function() {
        url = "http://pybossa.com/project/flickrperson/newtask";
        var res = pybossa.getCurrentTaskId(url);
        equal(false , res, "The URL does not have a task");
});

module("pybossa.userProgress( projectname ) with PyBossa served from a root URL method");
test('should get the userprogress using the "slug" project from the server', function() {
        // We use the FakeServer feature to test pybossa.js
        var server = this.sandbox.useFakeServer();

        project = {'done': 10, 'total': 100};

        var tmp = JSON.stringify(project);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/api/project/slug/userprogress",
            [200, { "Content-type": "application/json" },
            tmp] 
            );

        // Test the method newTask( projectname );
        pybossa.userProgress( "slug" ).done( function( data ) {
                equal( data.total, 100, "The total number of tasks is correct");
                equal( data.done, 10, "The done number of tasks is correct");
                });

        // Trigger the server endpoints
        server.respond();
});

module("pybossa.run() with PyBossa served from a root URL method");
test('should get a new task for the "slug" project from the server', function() {
        // We use the FakeServer feature to test pybossa.js
        var server = this.sandbox.useFakeServer();

        // Two sample projects are created
        project = [{"info": {"task_presenter": "some HTML and JS" }, "time_limit": null, "description": "Question", "short_name": "slug", "created": "2012-04-02T11:31:24.400338", "owner_id": 1, "calibration_frac": null, "bolt_course_id": null, "time_estimate": null, "hidden": 0, "long_tasks": null, "id": 1, "name": "Application Name"}];

        var tmp = JSON.stringify(project);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/api/project?short_name=slug",
            [200, { "Content-type": "application/json" },
            tmp] 
            );

        // One task for the project:
        var task = [{"info": {"variable": "value"}, "quorum": null, "calibration": 0, "created": "2012-04-02T11:31:24.478663", "project_id": 1, "state": "0", "id": 1, "priority_0": 0.0}];

        var tmp = JSON.stringify(task);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/api/project/1/newtask?offset=0",
            [200, { "Content-type": "application/json" },
            tmp]
            );

        // Second task for the project:
        var task2 = [{"info": {"variable": "value2"}, "quorum": null, "calibration": 0, "created": "2012-04-02T11:31:24.478664", "project_id": 1, "state": "0", "id": 2, "priority_0": 0.0}];

        var tmp2 = JSON.stringify(task2);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/api/project/1/newtask?offset=1",
            [200, { "Content-type": "application/json" },
            tmp2]
            );

        // Test the method newTask( projectname );
        var answerId = 0;
        pybossa.taskLoaded(function(task, deferred){
                //console.log(answerId);
                console.log("Id of task: " + task[0].id);
                console.log("AnswerID: " + answerId);
                answerId += 1;
                equal( task[0].project_id, 1, "The obtained task belongs to the Slug project (id: 1)");
                equal( task[0].id, answerId, "The TaskRun has been created using the wrong Task (id: " + answerId + ")");
                deferred.resolve();
        });

        pybossa.presentTask(function(task, deferred){
            // pybossa.saveTask(task.id, answer) <- works
            console.log("Task presented!");
            if (task[0]) {
                deferred.resolve();
            }
        });

        pybossa.run('slug');

        // Trigger the server endpoints
        server.respond();
        expect(4);
});

test('should get the task specified in the url (server/project/projectName/task/3)', function() {
        // We use the FakeServer feature to test pybossa.js
        var server = this.sandbox.useFakeServer();

        // Two sample projects are created
        project = [{"info": {"task_presenter": "some HTML and JS" }, "time_limit": null, "description": "Question", "short_name": "slug", "created": "2012-04-02T11:31:24.400338", "owner_id": 1, "calibration_frac": null, "bolt_course_id": null, "time_estimate": null, "hidden": 0, "long_tasks": null, "id": 1, "name": "Application Name"}];

        var tmp = JSON.stringify(project);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/pybossa/api/project?short_name=slug",
            [200, { "Content-type": "application/json" },
            tmp] 
            );

        // One task for the project:
        var task = [{"info": {"variable": "value"}, "quorum": null, "calibration": 0, "created": "2012-04-02T11:31:24.478663", "project_id": 1, "state": "0", "id": 1, "priority_0": 0.0}];

        var tmp = JSON.stringify(task);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/pybossa/api/project/1/newtask?offset=0",
            [200, { "Content-type": "application/json" },
            tmp]
            );

        // Second task for the project:
        var task2 = [{"info": {"variable": "value2"}, "quorum": null, "calibration": 0, "created": "2012-04-02T11:31:24.478664", "project_id": 1, "state": "0", "id": 2, "priority_0": 0.0}];

        var tmp2 = JSON.stringify(task2);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/pybossa/api/project/1/newtask?offset=1",
            [200, { "Content-type": "application/json" },
            tmp2]
            );

        var requestedTask = [{"info": {"variable": "value2"}, "quorum": null, "calibration": 0, "created": "2012-04-02T11:31:24.478664", "project_id": 1, "state": "0", "id": 3, "priority_0": 0.0}];

        var tmp3 = JSON.stringify(requestedTask);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/pybossa/api/task/3",
            [200, { "Content-type": "application/json" },
            tmp3]
            );

        // The first task must be the requested one with id=3, the second one with id=1
        var firstTask = true;
        pybossa.taskLoaded(function(task, deferred){
                var expectedID = (firstTask) ? 3 : 2;
                equal(task[0].id, expectedID, "Wrong task received");
                if (firstTask) firstTask = false;
                deferred.resolve(task);
        });

        pybossa.presentTask(function(task, deferred){
            if (task[0]) {
                deferred.resolve(task);
            }
        });

        var _window = {location: {pathname: "http://pybossaServer.com/project/1/task/3"},
                       history: {pushState: function(somethig, another, state){
                                                var that = _window;
                                                that.location.pathname = state;}
                                }
                      };

        pybossa.run('slug', _window);

        // Trigger the server endpoints
        server.respond();
        expect(2);
});

test('loads a different "next" task when requesting what would be returned as "next" task', function() {
        // We use the FakeServer feature to test pybossa.js
        var server = this.sandbox.useFakeServer();

        // Two sample projects are created
        project = [{"info": {"task_presenter": "some HTML and JS" }, "time_limit": null, "description": "Question", "short_name": "slug", "created": "2012-04-02T11:31:24.400338", "owner_id": 1, "calibration_frac": null, "bolt_course_id": null, "time_estimate": null, "hidden": 0, "long_tasks": null, "id": 1, "name": "Application Name"}];

        var tmp = JSON.stringify(project);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/pybossa/api/project?short_name=slug",
            [200, { "Content-type": "application/json" },
            tmp] 
            );

        // One task for the project:
        var task = [{"info": {"variable": "value"}, "quorum": null, "calibration": 0, "created": "2012-04-02T11:31:24.478663", "project_id": 1, "state": "0", "id": 1, "priority_0": 0.0}];

        var tmp = JSON.stringify(task);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/pybossa/api/project/1/newtask?offset=0",
            [200, { "Content-type": "application/json" },
            tmp]
            );

        // Second task for the project:
        var task2 = [{"info": {"variable": "value2"}, "quorum": null, "calibration": 0, "created": "2012-04-02T11:31:24.478664", "project_id": 1, "state": "0", "id": 2, "priority_0": 0.0}];

        var tmp2 = JSON.stringify(task2);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/pybossa/api/project/1/newtask?offset=1",
            [200, { "Content-type": "application/json" },
            tmp2]
            );

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/pybossa/api/task/2",
            [200, { "Content-type": "application/json" },
            tmp2]
            );

        var requestedTask = [{"info": {"variable": "value2"}, "quorum": null, "calibration": 0, "created": "2012-04-02T11:31:24.478664", "project_id": 1, "state": "0", "id": 3, "priority_0": 0.0}];

        var tmp3 = JSON.stringify(requestedTask);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/pybossa/api/project/1/newtask?offset=2",
            [200, { "Content-type": "application/json" },
            tmp3]
            );

        // The first task must be the requested one with id=2, the second one with an id different than 3
        pybossa.taskLoaded(function(task, deferred){
            deferred.resolve(task);
        });

        var firstTask = true;
        pybossa.presentTask(function(task, deferred){
            if (firstTask) {
                equal(task[0].id, 2, "Wrong task received");
                firstTask = false;
            }
            else {
                notEqual(task[0].id, 2, "Wrong task received");
            }
            if (task[0].id === 2) {
                deferred.resolve(task);
            }
        });

        var _window = {location: {pathname: "http://pybossaServer.com/project/1/task/2"},
                       history: {pushState: function(somethig, another, state){
                                                var that = _window;
                                                that.location.pathname = state;}
                                }
                      };

        pybossa.run('slug', _window);

        // Trigger the server endpoints
        server.respond();
        expect(2);
});
