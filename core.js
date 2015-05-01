var server = require('./server.js');
var url = server.url;

function _getProject(projectname){
    return server.fetchProject(projectname)
    .then(function(data) {return data[0];});
}

function _getNewTask(project) {
    return server.fetchNewTask(project.id)
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
    return server.saveTaskRun(taskrun).then(function(data) {return data;});
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

function _run (projectname) {
    server.fetchProject(projectname).done(function(project) {
        project = project[0];
        function getFirstTask() {
            var def = $.Deferred();
            var taskId = _getCurrentTaskId(window.location.pathname);
            var xhr = taskId ? server.fetchTask(taskId) : server.fetchNewTask(project.id);
            xhr.done(function(task){
                _resolveNextTaskLoaded(task, def);
            });
            return def.promise();
        }
        function getTask(offset, previousTask) {
            offset = offset || 0;
            var def = $.Deferred();
            var xhr = server.fetchNewTask(project.id, offset);
            xhr.done(function(task) {
                if (previousTask && task.id === previousTask.id) {
                    var secondTry = server.fetchNewTask(project.id, offset+1)
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

pybossa = pybossa || {};

pybossa.newTask = function (projectname) {
    return _getProject(projectname).then(_getNewTask);
};

pybossa.saveTask = function (taskid, answer) {
    return server.fetchTask(taskid).then(_createTaskRun.bind(undefined, answer));
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
    return server.userProgress( projectname );
};

pybossa.run = function (projectname) {
    return _run( projectname );
}

pybossa.taskLoaded = function (userFunc) {
    return _setUserTaskLoaded( userFunc );
}

pybossa.presentTask = function (userFunc) {
    return _setUserPresentTask( userFunc );
}

pybossa.setEndpoint = function (endpoint) {
    return server.setEndpoint(endpoint);
}

module.exports = pybossa;
