'use strict';

class Executor {

  constructor(builder, taskManager, ai, projects) {
    this.builder = builder;
    this.taskManager = taskManager;
    this.ai = ai || null;
    this.projects = projects || null;
  }

  async run() {
    if (this.taskManager.projectType) {

      console.log(`📦 ${this.taskManager.projectType} projesi oluşturuluyor...`);

      await this.builder.build(`${this.taskManager.projectType} oluştur`);

      this.taskManager.projectType = null;

    }
    while (true) {

      const task = this.taskManager.next();

      if (!task) break;

      console.log(`⚙️ ${task.name}...`);

      switch (task.name) {

        case 'jwt':
          this.builder.addJWT();
          break;

        case 'login':
          this.builder.addLogin();
          break;

        case 'swagger':
          this.builder.addSwagger();
          break;

        case 'docker':
          this.builder.addDocker();
          break;

        case 'sqlite':
          this.builder.addSQLite();
          break;

        case 'postgres':
          this.builder.addPostgres();
          break;

        case 'mongo':
          this.builder.addMongo();
          break;

        case 'oauth':
          this.builder.addOAuth();
          break;

        case 'test':
          this.builder.addTest();
          break;

        case 'readme':
          if (this.ai && this.projects) {
            await this.ai.generateReadme(this.projects.getCurrent());
          }
          break;

        case 'git_commit':
          if (this.projects) {
            const gitCommit = require('../commands/gitcommit');
            gitCommit(this.projects.getCurrent(), 'Jarvis otomatik commit');
          }
          break;

      }

      this.taskManager.complete(task.name);

      console.log(`📈 %${this.taskManager.progress()}`);

    }

    console.log('🎉 Tüm görevler tamamlandı.');

  }

}

module.exports = Executor;
