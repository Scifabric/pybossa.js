var url = '/';

function _userProgress(projectname) {
    return $.ajax({
        url: url + 'api/project/' + projectname + '/userprogress',
        dataType: 'json'
    });
}

function _fetchProject(projectname) {
    return $.ajax({
        url: url + 'api/project',
        data: 'short_name='+projectname,
        dataType:'json'
    });
}

function _fetchNewTask(projectId, offset) {
    offset = offset || 0;
    return $.ajax({
        url: url + 'api/project/' + projectId + '/newtask',
        data: 'offset=' + offset,
        dataType: 'json'
    });
}
function _fetchTask(taskId) {
    return $.ajax({
        url: url + 'api/task/' + taskId,
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

function _setEndpoint(endpoint) {
    // Check that the URL has the trailing slash, otherwise add it
    if ( endpoint.charAt(endpoint.length-1) != '/' ) {
        endpoint += '/';
    }
    url = endpoint;
    return url;
}

var serverQueries = {
    userProgress: _userProgress,
    fetchProject: _fetchProject,
    fetchNewTask: _fetchNewTask,
    fetchTask:    _fetchTask,
    saveTaskRun: _saveTaskRun,
    setEndpoint: _setEndpoint,
    url:         url
};

module.exports = serverQueries;
