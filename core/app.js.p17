'use strict';

const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

const ProjectManager = require('../project/manager');
const ProjectBuilder = require('../agents/projectBuilder');
const Runner = require('../commands/run');
const AIManager = require('./aiManager');
const Brain = require("../kernel/brain/brainPipeline");
const Dashboard = require('../dashboard/dashboard');

class App {

  constructor() {
    this.projects = new ProjectManager();
    this.builder = new ProjectBuilder(this.projects);
    this.runner = new Runner(this.projects);
    this.ai = new AIManager();
    this.brain = Brain;
    this.dashboard = new Dashboard();
  }

  async start() {

    const rl = readline.createInterface({
      input: stdin,
      output: stdout
    });

    this.dashboard.run();

    console.log('🤖 Jarvis v6 Başladı');
    console.log('Komutlarını doğal dille yazabilirsin. Örnek: "express oluştur", "durum", "yardım"');
    console.log('Çıkmak için: çık\n');

    while (true) {

      let cmd;

      try {
        cmd = await rl.question('Jarvis > ');
      } catch (e) {
        break;
      }

      if (cmd === undefined) break;

      cmd = cmd.trim();

      if (cmd === '') continue;

      if (cmd.toLowerCase() === 'çık' || cmd.toLowerCase() === 'exit' || cmd.toLowerCase() === 'quit') {
        console.log('👋 Görüşürüz.');
        break;
      }

      try {
        const result = await this.brain.run(cmd,this.ai);
        if(result) console.log(result);
      } catch (e) {
        console.log('❌', e.message);
      }

    }

    rl.close();
    this.ai.stopServer();

  }

}

module.exports = App;
