test('should get a newTask() from the server', function() {
        var server = this.sandbox.useFakeServer();

        app = [{"info": {"task_presenter": "some HTML and JS" }, "time_limit": null, "description": "Question", "short_name": "slug", "created": "2012-04-02T11:31:24.400338", "owner_id": 1, "calibration_frac": null, "bolt_course_id": null, "time_estimate": null, "hidden": 0, "long_tasks": null, "id": 1, "name": "Application Name"}, 
               {"info": {"task_presenter": "some HTML and JS" }, "time_limit": null, "description": "Question", "short_name": "slug2", "created": "2012-04-02T11:41:24.400338", "owner_id": 2, "calibration_frac": null, "bolt_course_id": null, "time_estimate": null, "hidden": 0, "long_tasks": null, "id": 2, "name": "Application Name 2"}
        ];

        tmp = JSON.stringify(app)

        server.respondWith(
            "GET", "/api/app",
            [200, { "Content-type": "application/json" },
            tmp] 
            );

        task = [{"info": {"variable": "value"}, "quorum": null, "calibration": 0, "created": "2012-04-02T11:31:24.478663", "app_id": 1, "state": "0", "id": 1, "priority_0": 0.0}];

        tmp = JSON.stringify(task);

        server.respondWith(
            "GET", "/api/app/1/newtask",
            [200, { "Content-type": "application/json" },
            tmp]
            );


        var callback = this.spy();

        //pybossa.newTask( "slug" ).done( function (data) { callback(data) });
        pybossa.newTask( "slug" ).done( function( data ) {
                equal( data.question, app[0].description, "The obtained task belongs to the Slug application (id: 1)");
                equal( data.task[0].id, task[0].id, "The TaskRun will be created using the right Task (id: 1)");
                });
        server.respond();

        //sinon.assert.calledOnce(callback);


        });
