// pybossa.js library
// Copyright (C) 2012 Daniel Lombraña González
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


(function( pybossa, $, undefined ) {
 var url = '/api';

 // Private methods
 function getApp(appname){
    return $.ajax({
        url: url + '/app',
        data: 'short_name='+appname,
        dataType:'json'
        })
        .pipe( function( data ) {
            return data[0];
            } );
 }

 function getTaskRun( app ) {
     return $.ajax({
            url: url + '/app/' + app.id + '/newtask',
            dataType: 'json'
             })
            .pipe( function( data ) {
                    taskrun = { question: app.description, task: data};
                    return taskrun;
             });
 }

 function getTask( taskid, answer ) {
     return $.ajax({
            url: url + '/task/' + taskid,
            dataType: 'json'
             })
            .pipe( function( data ) {
                    tmp = data;
                    tmp.answer = answer;
                    return tmp;
             });
 }

 function createTaskRun( data ) {
     taskrun = {};
     taskrun = {
        'app_id': data.app_id,
        'task_id': data.id,
        'info': data.answer
        };

     taskrun = JSON.stringify(taskrun);

     return $.ajax({
            type: 'POST',
            url: url + '/taskrun',
            dataType: 'json',
            contentType: 'application/json',
            data: taskrun
             })
            .pipe( function( data ) {
                    return data;
             });
 }

 function getCurrentTaskId(url) {
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

 function userProgress( appname ) {
     return $.ajax({
         url: url + '/app/' + appname + '/userprogress',
         dataType: 'json',
     });
 }

 // fallback for user defined action
 function __taskLoaded (task, deferred) {
     deferred.resolve(task);
 }
 
 function taskLoaded (userFunc) {

     this.__taskLoaded = userFunc;
 }
 
 function presentTask (userFunc) {
     this.__presentTask = userFunc;
 }

 function run ( appname ) {
     var me = this;
     $.ajax({
         url: url + '/app',
         data: 'short_name=' + appname,
         dataType:'json'
         }).done(function(app) {
             app = app[0];
             function getTask(offset) {
                 offset = offset || 0;
                 var def = $.Deferred();
                 var xhr = $.ajax({
                     url: url + '/app/' + app.id + '/newtask',
                     data: 'offset=' + offset,
                     dataType: 'json'
                 });
                 if (window.history.length <= 1) {
                    var taskId = getCurrentTaskId(window.location.pathname);
                    if (taskId) {
                        param =  '/task/' + taskId;
                        var xhr = $.ajax({
                            url: url + '/task/' + taskId,
                            dataType: 'json'
                        })
                    }
                 }
                 xhr.done(function(task) {
                     var udef = $.Deferred();
                     me.__taskLoaded(task, udef);
                     udef.done(function(task) {
                         def.resolve(task);
                     });
                 });
                 return def.promise();
             }

             function loop(task, answer) {
                 var nextLoaded = getTask(1),
                     taskSolved = $.Deferred();

                 if (task) {
                    history.pushState ({}, "Title", '/app/' + appname + '/task/' + task.id);
                 }
                 me.__presentTask(task, taskSolved);
                 $.when(nextLoaded, taskSolved).done(loop);
             }
             getTask().done(loop);
     });
 }


 // Public methods
 pybossa.newTask = function ( appname ) {
     return getApp(appname).pipe(getTaskRun);
 };

 pybossa.saveTask = function ( taskid, answer ) {
     return getTask( taskid, answer ).pipe(createTaskRun);
 };

 pybossa.getCurrentTaskId = function ( url ) {
     if (url !== undefined) {
         return getCurrentTaskId(url);
     }
     else {
        return getCurrentTaskId(window.location.pathname);
     }
 };

 pybossa.userProgress = function ( appname ) {
     return userProgress( appname );
 };

 pybossa.run = function ( appname ) {
     return run( appname );
 }

 pybossa.taskLoaded = function ( userFunc ) {
     return taskLoaded( userFunc );
 }

 pybossa.presentTask = function ( userFunc ) {
     return presentTask( userFunc );
 }

 pybossa.setEndpoint = function ( endpoint ) {
     url = endpoint + '/api';
     return url;
 }

} ( window.pybossa = window.pybossa || {}, jQuery ));
