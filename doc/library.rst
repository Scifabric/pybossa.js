================
Using PyBossa.JS
================

Once the library has been loaded, you will be able to get tasks for a specific
application, and save the answer from the volunteer.

Getting a task
==============

In PyBossa every application is defined as a JSON object with several fields::

    {
        "info": {
                  'task_presenter:' <!-- HTML + JS -->
        },
        "time_limit": null,
        "description": "Question to ask to the volunteers",
        "short_name": "Short name or SLUG for the application",
        "created": "2012-04-04T11:11:43.335517",
        "owner_id": 1,
        [...]
        "hidden": 0,
        "id": 1,
        "name": "Name of the application"
    }

The **info** field is widely used in PyBossa. This field is used as a content
manager, where for example the applications add the HTML and JS code to
represent the task to the volunteers, and for storing the answers of the
volunteers of the tasks.

Therefore, we can say that the **info** field does not have a specific format
except for the applications, as every application need a task_presenter.

PyBossa.JS uses the description field to get the question that will be shown to
the volunteers in the presenter endpoint of the application. For example, in
the `FlickrPerson demo application <http://app-flickrperson.rtfd.org>`_ the
question is: Do you see a human in this photo? and that question has been
stored in the application JSON object (check the source code of the
application).

The tasks in PyBossa have the following structure::

    {
        "info": { fields about the task  },
        "quorum": null,
        "calibration": 0,
        "created": "2012-04-04T11:12:04.842043",
        "app_id": 1,
        "state": "0",
        "id": 1030,
        "priority_0": 0
    }

Again, we can see that every task has an **info** field, and that field is
where there will be all the information that the volunteers may need to solve
the problem. For instance, for the Flickr Person application, the task consist
in answering if there is a human in a photo, so the info field has the
following two elements::

  "info": { 
            'link': 'http://www.flickr.com/photos/teleyinex/2945647308/',¬
            'url': 'http://farm4.staticflickr.com/3208/2945647308_f048cc1633_m.jpg' 
          }¬  

The link to the Flickr page that publishes the photo and the direct link to the
photo. Those two items will be used by the presenter to load the photo and
create a link to the Flickr page.

Therefore, if we want to get one task for the Flickr Person application, we will only
need to write the following code in our application::

    pybossa.newTask( "flickrperson" ).done(
      function( data ) {
        $("#question h1").text(data.question);
        $("#task-id").text(data.task.id);
        $("#photo-link").attr("href", data.task.info.link);
        $("#photo").attr("src",data.task.info.url);
      };
    );

pybossa.newTask( "shortname" ) will return the following object::

    { 
      "question": application.description,
      "task": {
                "id": value,
                ...,
                "info": {
                         "url": "http...."
                         "link": "http..."
                        }
            }
    }

Therefore, loading the task data into the HTML skeleton will be easy, as the
object can be easily parsed. As you can see, PyBossa.JS gets the application ID
and gets one task for the application returning an object with all the required
data to load into the presenter.

Getting the Task ID from the URL
================================

PyBossa supports different endpoints for every application task::

    http://domain.com/app/slug/task/id

This is basically a new way of accessing tasks provided by PyBossa, but that
can be integrated within your application to request and load a new task data
based on the endpoint.

Your application can request a new task to PyBossa as before::

    pybossa.newTask( "flickrperson" ).done(
        function( data ) {
            ....
        }
    );

Remember that **data** contains the task.id, so once you get the task.id to
load, you can actually redirect the application to the specific task URL, or
load the data directly from the template. If you decide to redirect the
application to the specific task URL, then, PyBossa.JS provides a method that
will allow you to check if you have to request a newTask in your presenter or
just get the input data from the given task::

    pybossa.getCurrentTaskId( url )

Where url will be the **window.location.pathname** variable or in other words
the full URL of the user web browser that he is accessing in that moment. This
method will allow you to detect when the user is accessing directly a task or
requesting a new one, so you can in your web application decide what to do.

Saving the answer of the volunteer
==================================

Saving the answer is very simple. PyBossa.JS exports the following public
method to save the answer for a given task of a given application::

    pybossa.saveTask( taskid, answer )

Continuing with previous example, if you want to save the answer Yes for a Task
where the photo has a human, you will only have to do the following::

    pybossa.saveTask( taskid, { "answer": "yes" }).done(
        function( data ) {
        // Show some feedback for the user
        // Request a new task
        };
    );

The TaskId is usually saved in the DOM when you load the task (see previous
section). Then, you only need to provide a JSON object that will have the
answer for the task. All the data is stored in the PyBossa DB, and you can see
the results checking the API endpoint::

    http://PYBOSSA-SERVER/api/taskrun

Getting the user progress of the volunteer
==========================================

While getting and saving tasks are important methods, showing the user his
progress is also important. The following method gets the number of available
tasks that the user can do, and how many of them he has completed::

    pybossa.userProgress( appname [,url] )

This method gives you the possibility of specifying a different url if your
PyBossa server is not in the root of your website. 

The method will return a JSON object with the following keywords::

  { 'done': 10,
    'total: 100
  }

In this example, the user can do 100 tasks for the application and he has
contributed actually 10 of them. This means that the user has completed the 10%
of available tasks for him.

This method can be used like this in your web application::

    pybossa.userProgress( 'flickrperson' ).done(function(data){
        var pct = ((data.done*100)/data.total);
        // Set the percentage of the progress bar:
        $("#progressbar").css("width", pct.toString() + "%");
        // or load the number of tasks in words
        $("#stats").text("You have completed " + data.done + " of " + data.total + " available tasks!");
        // or let the user know the remaining number of tasks
        $("#stats).text("Remaining tasks for you: " + (data.total - data.done));
    });


