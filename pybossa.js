// PyBossa.JS library
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

 // Private methods 
 function getApp(appname){
    return $.ajax({
        url: '/api/app',
        datatype:'json'
        })
        .pipe( function( data ) {
            $.each(data, function(){
                if (this.short_name == appname) {
                    tmp = this;
                    return false;
                }
            });
            return tmp;
            } );
 }

 function getTask( app ) {
     return $.ajax({
            url: '/api/app/' + app.id + '/newtask',
            datatype: 'json'
             })
            .pipe( function( data ) {
                    taskrun = { question: app.description, task: data};
                    return taskrun;
             });
 }

 // Public methods
 pybossa.newTask = function ( appname ) {
     return getApp(appname).pipe(getTask);
 }

 pybossa.saveTask = function ( taskid, answer ) {
     taskrun = {};
     task = $.ajax({
                url: '/api/task/' + taskid,
                datatype: 'json'
            });

     task.done( function( t ) {
             taskrun = {
                'created': t.create_time,
                'app_id': t.app_id,
                'task_id': t.id,
                'info': answer
                };

             taskrun = JSON.stringify(taskrun);
             jqxhr = $.ajax({
                    type: 'POST',
                    dataType: 'json',
                    url: '/api/taskrun', 
                    data: taskrun,
                    contentType: 'application/json'
                    })
                    .done( function(data) {console.log("done!");} );
             });
 }

} ( window.pybossa = window.pybossa || {}, jQuery ));
