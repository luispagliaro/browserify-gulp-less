'use strict';

// Variable privada. Accesible solamente en este contexto, no es visible desde afuera de este archivo por no usar exports
// Browserify utiliza require para cargar jquery, instalado via npm.
var $ = require('jquery'),
    taskTemplate = '<li class="task"><input class="complete" type="checkbox" /> <input class="description" type="text" placeholder="Enter task description..." /> <button class="delete-button">Delete</button></li>';

// Función privada. Accesible solamente en este contexto, no es visible desde afuera de este archivo por no usar exports
function _renderTask(task) {
    // Convierte el string en un elemento HTML.
    var $task = $(taskTemplate);

    if (task.complete) {
        $task.find('.complete').attr('checked', 'checked');
    }

    $task.find('.description').val(task.description);
    return $task;
}

// Funciones públicas. Las funciones con exports son accesibles desde fuera de este archivo.
exports.renderTasks = function(tasks) {
    var elementArray = $.map(tasks, _renderTask);

    $('#task-list').empty().append(elementArray);
};

exports.renderNew = function() {
    var $taskList = $('#task-list');

    $taskList.prepend(_renderTask({}));
};