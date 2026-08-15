'use strict';

class TaskManager {

 constructor() {
  this.tasks = [];
  this.projectType = null;
}

  create(projectType, modules) {

  this.projectType = projectType;

  this.tasks = modules.map((m, i) => ({
    id: i + 1,
    name: m,
    status: 'pending'
  }));

}

  next() {
    return this.tasks.find(t => t.status === 'pending');
  }

  complete(name) {
    const task = this.tasks.find(t => t.name === name);
    if (task) task.status = 'done';
  }

  progress() {

    if (this.tasks.length === 0) return 0;

    const done = this.tasks.filter(t => t.status === 'done').length;

    return Math.round((done / this.tasks.length) * 100);

  }

  list() {
    return this.tasks;
  }

}

module.exports = TaskManager;
