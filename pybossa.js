// pybossa.js library
//
// Copyright (C) 2015 SciFabric LTD.
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


(function(pybossa, $, undefined) {
    var url = '/';

    //AJAX calls
    function _userProgress(projectname) {
        return $.ajax({
            url: url + 'api/project/' + projectname + '/userprogress',
            cache: false,
            dataType: 'json'
        });
    }

    function _fetchProject(projectname) {
        return $.ajax({
            url: url + 'api/project',
            data: 'all=1&short_name='+projectname,
            dataType:'json'
        });
    }

    function _fetchNewTask(projectId, offset) {
        offset = offset || 0;
        return $.ajax({
            url: url + 'api/project/' + projectId + '/newtask',
            data: 'offset=' + offset,
            cache: false,
            dataType: 'json'
        });
    }
    function _fetchTask(taskId) {
        return $.ajax({
            url: url + 'api/task/' + taskId,
            cache: false,
            dataType: 'json'
        });
    }

    function _saveTaskRun(taskrun) {
        return $.ajax({
            type: 'POST',
            url: url + 'api/taskrun',
            dataType: 'json',
            contentType: 'application/json',
            data: taskrun
        });
    }

    // Private methods
    function _getProject(projectname){
        return _fetchProject(projectname)
        .then(function(data) {return data[0];});
    }

    function _getNewTask(project) {
        return _fetchNewTask(project.id)
        .then(_addProjectDescription.bind(undefined, project));
    }

    function _addProjectDescription(project, task) {
        return { question: project.description, task: task};
        }

    function _addAnswerToTask(task, answer) {
        task.answer = answer;
        return task;
    }

    function _createTaskRun(answer, task) {
        task = _addAnswerToTask(task, answer);
        var taskrun = {
            'project_id': task.project_id,
            'task_id': task.id,
            'info': task.answer
        };
        taskrun = JSON.stringify(taskrun);
        return _saveTaskRun(taskrun).then(function(data) {return data;});
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

    // fallback for user defined action
    var _taskLoaded = function(task, deferred) {
        deferred.resolve(task);
    };

    var _presentTask = function(task, deferred) {
        deferred.resolve(task);
    };

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

    function _run (projectname, _window) {
        _window = _window || window;
        _fetchProject(projectname).done(function(project) {
            project = project[0];
            function getNextTask(offset, previousTask) {
                offset = offset || 0;
                var def = $.Deferred();
                var taskId = _getCurrentTaskId(_window.location.pathname);
                var xhr = (taskId && (previousTask === undefined)) ? _fetchTask(taskId) : _fetchNewTask(project.id, offset);
                xhr.done(function(task) {
                    if (previousTask && task.id === previousTask.id) {
                        var secondTry = _fetchNewTask(project.id, offset+1)
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
                var nextLoaded = getNextTask(1, task),
                taskSolved = $.Deferred(),
                nextUrl;
                if (task.id) {
                    if (url != '/') {
                        nextUrl = url + '/project/' + projectname + '/task/' + task.id;
                    }
                    else {
                        nextUrl = '/project/' + projectname + '/task/' + task.id;
                    }
                    history.pushState({}, "Title", nextUrl);
                }
                _presentTask(task, taskSolved);
                $.when(nextLoaded, taskSolved).done(loop);
            }
            getNextTask(0, undefined).done(loop);
        });
    }


    // Public methods
    pybossa.newTask = function (projectname) {
        return _getProject(projectname).then(_getNewTask);
    };

    pybossa.saveTask = function (taskId, answer) {
        return _fetchTask(taskId).then(_createTaskRun.bind(undefined, answer));
    };

    pybossa.getCurrentTaskId = function (url) {
        if (url !== undefined) {
            return _getCurrentTaskId(url);
        }
        else {
            return _getCurrentTaskId(window.location.pathname);
        }
    };

    pybossa.userProgress = function (projectname) {
        return _userProgress( projectname );
    };

    pybossa.run = function (projectname, _window) {
        return _run(projectname, _window);
    };

    pybossa.taskLoaded = function (userFunc) {
        return _setUserTaskLoaded( userFunc );
    };

    pybossa.presentTask = function (userFunc) {
        return _setUserPresentTask( userFunc );
    };

    pybossa.setEndpoint = function (endpoint) {
        // Check that the URL has the trailing slash, otherwise add it
        if ( endpoint.charAt(endpoint.length-1) != '/' ) {
            endpoint += '/';
        }
        url = endpoint;
        return url;
    };

} (window.pybossa = window.pybossa || {}, jQuery));
