'use strict';

class Task {

  constructor(orchestrator, task){
    this._run = task.run || null;
    this._reverse = task.reverse || null;
    this._options = Object.assign({
      break: false 
    }, task.options);
  }

  get options(){
    return this._options;
  }

  async reverse(){
    if(typeof this._reverse === 'function'){
      return await this._reverse();
    }else{
      return Promise.reject('There is not reverse function');
    }
  }

  async run(){
    if(typeof this._run === 'function'){
      return await this._run();
    }else{
      return Promise.reject('There is not run function');
    }
  }
} 

module.exports = Task;
