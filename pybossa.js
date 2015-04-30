// pybossa.js library
// Copyright (C) 2013 SF Isle of Man
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

/* Bug workaround for IE when debugging toolbar is not open */
if (typeof(console) == 'undefined') {
  console = {
    log: function () {},
    warn: function () {},
    error: function () {}
  };
}

(function( pybossa, $, undefined ) {
    var url = '/';


    // Private methods
    function _getProject(projectname){
        return $.ajax({
            url: url + 'api/project',
            data: 'short_name='+projectname,
            dataType:'json'
        })
        .pipe( function( data ) {
            return data[0];
        } );
    }

    function _getTaskRun( project ) {
        return $.ajax({
            url: url + 'api/project/' + project.id + '/newtask',
            dataType: 'json'
        })
        .pipe( function( data ) {
            taskrun = { question: project.description, task: data};
            return taskrun;
        });
    }

    function _getTask( taskid, answer ) {
        return $.ajax({
            url: url + 'api/task/' + taskid,
            dataType: 'json'
        })
        .pipe( function( data ) {
            tmp = data;
            tmp.answer = answer;
            return tmp;
        });
    }

    function _createTaskRun( data ) {
        taskrun = {};
        taskrun = {
            'project_id': data.project_id,
            'task_id': data.id,
            'info': data.answer
        };

        taskrun = JSON.stringify(taskrun);

        return $.ajax({
            type: 'POST',
            url: url + 'api/taskrun',
            dataType: 'json',
            contentType: 'application/json',
            data: taskrun
        })
        .pipe( function( data ) {
            return data;
        });
    }

    function _getCurrentTaskId(url) {
        pathArray = url.split('/');
        if (url.indexOf('/task/')!=-1) {
            var l = pathArray.length;
            var i = 0;
            for (i=0;i<l;i++) {
                if (pathArray[i]=='task') {
                    return pathArray[i+1];
                }
            }
        }
        return false;
    }

    function _userProgress( projectname ) {
        return $.ajax({
            url: url + 'api/project/' + projectname + '/userprogress',
            dataType: 'json'
        });
    }

    // fallback for user defined action
    function _taskLoaded (task, deferred) {
        deferred.resolve(task);
    }

    function _setUserTaskLoaded (userFunc) {
        _taskLoaded = userFunc;
    }

    function _setUserPresentTask (userFunc) {
        _presentTask = userFunc;
    }

    function _resolveNextTaskLoaded(task, deferred) {
        var udef = $.Deferred();
        _taskLoaded(task, udef);
        udef.done(function(task) {
            deferred.resolve(task);
        });
    }

    function _run ( projectname ) {
        $.ajax({
            url: url + 'api/project',
            data: 'short_name=' + projectname,
            dataType:'json'
        }).done(function(project) {
            project = project[0];
            function getFirstTask() {
                var def = $.Deferred();
                var taskId = _getCurrentTaskId(window.location.pathname);
                var requestUrl = taskId ? url + 'api/task/' + taskId : url + 'api/project/' + project.id + '/newtask';
                var xhr = $.ajax({
                    url: requestUrl,
                    dataType: 'json'
                });
                xhr.done(function(task){
                    _resolveNextTaskLoaded(task, def);
                });
                return def.promise();
            }
            function getTask(offset, previousTask) {
                offset = offset || 0;
                var def = $.Deferred();
                var xhr = $.ajax({
                    url: url + 'api/project/' + project.id + '/newtask',
                    data: 'offset=' + offset,
                    dataType: 'json'
                });
                xhr.done(function(task) {
                    if (previousTask && task.id === previousTask.id) {
                        var secondTry = $.ajax({
                            url: url + 'api/project/' + project.id + '/newtask',
                            data: 'offset=' + (offset+1),
                            dataType: 'json'
                        })
                        .done(function(secondTask){
                            _resolveNextTaskLoaded(secondTask, def);
                        });
                    }
                    else {
                        _resolveNextTaskLoaded(task, def);
                    }
                });
                return def.promise();
            }

            function loop(task) {
                var nextLoaded = getTask(1, task),
                taskSolved = $.Deferred();
                if (task.id) {
                    if (url != '/') {
                        var nextUrl = url + '/project/' + projectname + '/task/' + task.id;
                    }
                    else {
                        var nextUrl = '/project/' + projectname + '/task/' + task.id;
                    }
                    history.pushState ({}, "Title", nextUrl);
                }
                _presentTask(task, taskSolved);
                $.when(nextLoaded, taskSolved).done(loop);
            }
            getFirstTask().done(loop);
        });
    }


    // Public methods
    pybossa.newTask = function ( projectname ) {
        return _getProject(projectname).pipe(_getTaskRun);
    };

    pybossa.saveTask = function ( taskid, answer ) {
        return _getTask( taskid, answer ).pipe(_createTaskRun);
    };

    pybossa.getCurrentTaskId = function ( url ) {
        if (url !== undefined) {
            return _getCurrentTaskId(url);
        }
        else {
            return _getCurrentTaskId(window.location.pathname);
        }
    };

    pybossa.userProgress = function ( projectname ) {
        return _userProgress( projectname );
    };

    pybossa.run = function ( projectname ) {
        return _run( projectname );
    }

    pybossa.taskLoaded = function ( userFunc ) {
        return _setUserTaskLoaded( userFunc );
    }

    pybossa.presentTask = function ( userFunc ) {
        return _setUserPresentTask( userFunc );
    }

    pybossa.setEndpoint = function ( endpoint ) {
        // Check that the URL has the trailing slash, otherwise add it
        if ( endpoint.charAt(endpoint.length-1) != '/' ) {
            endpoint += '/';
        }
        url = endpoint;
        return url;
    }

} ( window.pybossa = window.pybossa || {}, jQuery ));
