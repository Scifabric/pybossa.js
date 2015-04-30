================
Using PyBossa.JS
================

Once the library has been loaded, you will be able to get tasks for a specific
project, and save the answer from the volunteer.

Getting a task
==============

In PyBossa every project is defined as a JSON object with several fields:
.. code-block:: javascript

    {
        "info": {
                  'task_presenter:' <!-- HTML + JS -->
        },
        "time_limit": null,
        "description": "Question to ask to the volunteers",
        "short_name": "Short name or SLUG for the project",
        "created": "2012-04-04T11:11:43.335517",
        "owner_id": 1,
        [...]
        "hidden": 0,
        "id": 1,
        "name": "Name of the project"
    }

The **info** field is widely used in PyBossa. This field is used as a content
manager, where for example the projects add the HTML and JS code to
represent the task to the volunteers, and for storing the answers of the
volunteers of the tasks.

Therefore, we can say that the **info** field does not have a specific format
except for the projects, as every project needs a task_presenter.

PyBossa.JS uses the description field to get the question that will be shown to
the volunteers in the presenter endpoint of the project. For example, in
the `FlickrPerson demo project <http://app-flickrperson.rtfd.org>`_ the
question is: Do you see a human in this photo? and that question has been
stored in the project JSON object (check the source code of the
project).

The tasks in PyBossa have the following structure::

    {
        "info": { fields about the task  },
        "quorum": null,
        "calibration": 0,
        "created": "2012-04-04T11:12:04.842043",
        "project_id": 1,
        "state": "0",
        "id": 1030,
        "priority_0": 0
    }

Again, we can see that every task has an **info** field, and that field is
where there will be all the information that the volunteers may need to solve
the problem. For instance, for the Flickr Person project, the task consist
in answering if there is a human in a photo, so the info field has the
following two elements::

  "info": { 
            'link': 'http://www.flickr.com/photos/teleyinex/2945647308/',¬
            'url': 'http://farm4.staticflickr.com/3208/2945647308_f048cc1633_m.jpg' 
          }¬  

The link to the Flickr page that publishes the photo and the direct link to the
photo. Those two items will be used by the presenter to load the photo and
create a link to the Flickr page.

Presenting the Tasks to the user
================================

In order to present the tasks to the user, you have to create an HTML template.
The template is the skeleton that will be used to load the data of the tasks:
the question, the photos, user progress, and input fields & submit buttons 
to solve the task. 

Flickr Person uses a basic HTML skeleton and this library to load the data 
of the tasks into the HTML template, and take actions based on the users's answers.

.. note::
  When a task is submitted by an authenticated user, the task will save his
  user_id. For anonymous users the submitted task will only have the user IP
  address.


1. Loading the Task data
~~~~~~~~~~~~~~~~~~~~~~~~

Every PyBossa project will have DOM skeleton where you will load the task data.

PyBossa.JS provides two methods that have to
been overridden with some logic, as each project will have a different
needs:

  * pybossa.taskLoaded(function(task, deferred){});
  * pybossa.presentTask(function(task, deferred){});

The **pybossa.taskLoaded** method will be in charge of adding new items to the
JSON task object and resolve the deferred object once the data has been loaded 
(i.e. when an image has been downloaded), so another task for the current user 
can be pre-loaded. An example:

.. code-block:: javascript

    pybossa.taskLoaded(function(task, deferred) {
        if ( !$.isEmptyObject(task) ) {
            // load image from flickr
            var img = $('<img />');
            img.load(function() {
                // continue as soon as the image is loaded
                deferred.resolve(task);
            });
            img.attr('src', task.info.url_b).css('height', 460);
            img.addClass('img-polaroid');
            task.info.image = img;
        }
        else {
            deferred.resolve(task);
        }
    });

Then **pybossa.presentTask** method will be called when a task has been loaded
(previous method) from the PyBossa server:

.. code-block:: javascript

  { question: application.description,
    task: { 
            id: value,
            ...,
            info: { 
                    url_m: 
                    link:
                   } 
          } 
  }


That JSON object will be accessible via the task object passed as an argument
to the pybossa.presentTask method. First we will need to check that we are not
getting an empty object, as it will mean that there are no more available tasks
for the current user. In that case, we should hide the skeleton, and say thanks
to the user as he has participated in all the tasks of the project.

If the task object is not empty, then we have task to load into the *skeleton*.

The PyBossa.JS library treats the user input as an "async function". This is
why the function gets a deferred object, as this object will be *resolved* when
the user submits an answer. We use this approach to load in
the background the next task for the user while the volunteer is solving the
current one. Once the answer has been saved in the server, we resolve the
deferred:

.. code-block:: javascript

    pybossa.presentTask(function(task, deferred) {
        if ( !$.isEmptyObject(task) ) {
            loadUserProgress();
            $('#photo-link').html('').append(task.info.image);
            $("#photo-link").attr("href", task.info.link);
            $("#question").html(task.info.question);
            $('#task-id').html(task.id);
            $('.btn-answer').off('click').on('click', function(evt) {
                var answer = $(evt.target).attr("value");
                if (typeof answer != 'undefined') {
                    //console.log(answer);
                    pybossa.saveTask(task.id, answer).done(function() {
                        deferred.resolve();
                    });
                    $("#loading").fadeIn(500);
                    if ($("#disqus_thread").is(":visible")) {
                        $('#disqus_thread').toggle();
                        $('.btn-disqus').toggle();
                    }
                }
                else {
                    $("#error").show();
                }
            });
            $("#loading").hide();
        }
        else {
            $(".skeleton").hide();
            $("#loading").hide();
            $("#finish").fadeIn(500);
        }
    });

It is important to note that in this method we bind the *on-click* action for
the submit buttons (the user will click in one of them to submit an answer) 
to call the above snippet:

.. code-block:: javascript

    $('.btn-answer').off('click').on('click', function(evt) {
        var answer = $(evt.target).attr("value");
        if (typeof answer != 'undefined') {
            //console.log(answer);
            pybossa.saveTask(task.id, answer).done(function() {
                deferred.resolve();
            });
            $("#loading").fadeIn(500);
            if ($("#disqus_thread").is(":visible")) {
                $('#disqus_thread').toggle();
                $('.btn-disqus').toggle();
            }
        }
        else {
            $("#error").show();
        }
    });


Finally, the pybossa.presentTask calls a method named
**loadUserProgress**. This method is in charge of getting the user progress of
the user and update the progress bar accordingly:

.. code-block:: javascript

    function loadUserProgress() {
        pybossa.userProgress('flickrperson').done(function(data){
            var pct = Math.round((data.done*100)/data.total);
            $("#progress").css("width", pct.toString() +"%");
            $("#progress").attr("title", pct.toString() + "% completed!");
            $("#progress").tooltip({'placement': 'left'}); 
            $("#total").text(data.total);
            $("#done").text(data.done);
        });
    }

You can update the code to only show the number of answers, or remove it
completely, however the volunteers will benefit from this type of information
as they will be able to know how many tasks they have to do, giving an idea of
progress while the contribute to the project.

Finally, we only need in our application to run the PyBossa project:

.. code-block:: javascript

    pybossa.run('slug-project-name')


3. Saving the answer
--------------------

The *pybossa.saveTask* method saves an answer for a given task. In the
previous section we show that in the pybossa.presentTask method the *task-id*
can be obtained, as we will be passing the object to saveTask method.

The method allows us to give a successful pop-up feedback for the user, so you  
can use the following structure to warn the user and tell him that his answer
has been successfully saved:

.. code-block:: javascript

  pybossa.saveTask( taskid, answer ).done(
    function( data ) {
        // Show the feedback div
        $("#success").fadeIn(); 
        // Fade out the pop-up after a 1000 miliseconds
        setTimeout(function() { $("#success").fadeOut() }, 1000);
    };
  );

We recommend to read the `PyBossa tutorial <http://docs.pybossa.com/en/latest/user/create-application-tutorial.html>`_ as we explain step by step how to create a project.

4. Setting a different end point
--------------------------------

Sometimes the PyBossa server is not in the root of the domain, so you will find
the server running for example here: http://server/pybossa

In this case, you will need to change the API endpoint, otherwise PyBossa.JS
will fail to load the task for your project. In order to set the right
end point, you can use the following method:

.. code-block:: javascript

    pybossa.setEndpoint('http://server/pybossa');

And then you can call the pybossa.run method as usual. The setEndpoint method
will configure the right URL for using the API.
