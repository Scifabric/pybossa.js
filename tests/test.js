module("pybossa.newTask() with PyBossa served from a root URL method");
test('should get a new task for the "slug" application from the server', function() {
        // We use the FakeServer feature to test pybossa.js
        var server = this.sandbox.useFakeServer();

        // Two sample applications are created
        app = [{"info": {"task_presenter": "some HTML and JS" }, "time_limit": null, "description": "Question", "short_name": "slug", "created": "2012-04-02T11:31:24.400338", "owner_id": 1, "calibration_frac": null, "bolt_course_id": null, "time_estimate": null, "hidden": 0, "long_tasks": null, "id": 1, "name": "Application Name"}];

        var tmp = JSON.stringify(app);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/api/app?short_name=slug",
            [200, { "Content-type": "application/json" },
            tmp] 
            );

        // One task for the application:
        var task = [{"info": {"variable": "value"}, "quorum": null, "calibration": 0, "created": "2012-04-02T11:31:24.478663", "app_id": 1, "state": "0", "id": 1, "priority_0": 0.0}];

        var tmp = JSON.stringify(task);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/api/app/1/newtask",
            [200, { "Content-type": "application/json" },
            tmp]
            );

        // Test the method newTask( appname );
        pybossa.url = "";
        pybossa.newTask( "slug" ).done( function( data ) {
                equal( data.question, app[0].description, "The obtained task belongs to the Slug application (id: 1)");
                equal( data.task[0].id, task[0].id, "The TaskRun has been created using the right Task (id: 1)");
                });

        // Trigger the server endpoints
        server.respond();
        });

module("pybossa.saveTask() method");

test('should save a task for the "slug" application in the server', function() {

        var server = this.sandbox.useFakeServer();

        // One task for the application:
        var task = [{"info": {"variable": "value"}, "quorum": null, "calibration": 0, "created": "2012-04-02T11:31:24.478663", "app_id": 1, "state": "0", "id": 1, "priority_0": 0.0}];

        var tmp = JSON.stringify(task[0]);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/api/task/1",
            [200, { "Content-type": "application/json" },
            tmp] 
            );

        var taskrun = [{"info": {"answer": "Value"}, "user_id": 1, "task_id": 1, "created": "2012-04-02T11:51:24.478663", "finish_time": "2012-04-02T11:51:24.478663", "calibration": null, "app_id": 1, "user_ip": null, "timeout": null, "id": 1}];

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
                equal( data.info.answer, taskrun[0].info.answer, "The obtained task belongs to the Slug application (id: 1)");
                });

        server.respond();
       });

module("pybossa.getCurrentTaskId() method");

test('should return the TaskId from the URL', function() {
        url = "http://pybossa.com/app/flickrperson/task/1";
        var res = pybossa.getCurrentTaskId(url);
        equal("1" , res, "The returned task.id is the same of the URL");
       });

test('should return false as URL does not have the task slug', function() {
        url = "http://pybossa.com/app/flickrperson/newtask";
        var res = pybossa.getCurrentTaskId(url);
        equal(false , res, "The URL does not have a task");
       });

module("pybossa.userProgress( appname ) with PyBossa served from a root URL method");
test('should get the userprogress using the "slug" application from the server', function() {
        // We use the FakeServer feature to test pybossa.js
        var server = this.sandbox.useFakeServer();

        app = {'done': 10, 'total': 100};

        var tmp = JSON.stringify(app);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/api/app/slug/userprogress",
            [200, { "Content-type": "application/json" },
            tmp] 
            );

        // Test the method newTask( appname );
        pybossa.userProgress( "slug" ).done( function( data ) {
                equal( data.total, 100, "The total number of tasks is correct");
                equal( data.done, 10, "The done number of tasks is correct");
                });

        // Trigger the server endpoints
        server.respond();
        });

module("pybossa.run() with PyBossa served from a root URL method");
test('should get a new task for the "slug" application from the server', function() {
        // We use the FakeServer feature to test pybossa.js
        var server = this.sandbox.useFakeServer();

        // Two sample applications are created
        app = [{"info": {"task_presenter": "some HTML and JS" }, "time_limit": null, "description": "Question", "short_name": "slug", "created": "2012-04-02T11:31:24.400338", "owner_id": 1, "calibration_frac": null, "bolt_course_id": null, "time_estimate": null, "hidden": 0, "long_tasks": null, "id": 1, "name": "Application Name"}];

        var tmp = JSON.stringify(app);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/api/app?short_name=slug",
            [200, { "Content-type": "application/json" },
            tmp] 
            );

        // One task for the application:
        var task = [{"info": {"variable": "value"}, "quorum": null, "calibration": 0, "created": "2012-04-02T11:31:24.478663", "app_id": 1, "state": "0", "id": 1, "priority_0": 0.0}];

        var tmp = JSON.stringify(task);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/api/app/1/newtask?offset=0",
            [200, { "Content-type": "application/json" },
            tmp]
            );

        // Second task for the application:
        var task2 = [{"info": {"variable": "value2"}, "quorum": null, "calibration": 0, "created": "2012-04-02T11:31:24.478664", "app_id": 1, "state": "0", "id": 2, "priority_0": 0.0}];

        var tmp2 = JSON.stringify(task2);

        // The endpoint for the FakeServer:
        server.respondWith(
            "GET", "/api/app/1/newtask?offset=1",
            [200, { "Content-type": "application/json" },
            tmp2]
            );

        // Test the method newTask( appname );
        var answerId = 0;
        pybossa.taskLoaded(function(task, deferred){
                //console.log(answerId);
                console.log("Id of task: " + task[0].id);
                console.log("AnswerID: " + answerId);
                answerId += 1;
                equal( task[0].app_id, 1, "The obtained task belongs to the Slug application (id: 1)");
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
