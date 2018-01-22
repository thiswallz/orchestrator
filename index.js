'use strict';
const Task = require('./lib/task');

class Orchestrator {

  constructor(tasks, opts){
    if (tasks && !Array.isArray(tasks)) {
      throw new TypeError('Expected an array of tasks');
    }
    this._options = Object.assign({
      name: ""
    }, opts);

    this._tasks = [];
    this.name = this._options.name;
  }

  add(task){
    const tasks = Array.isArray(task) ? task : [task];

    for (const task of tasks) {
      this._tasks.push(new Task(this, task));
    }
  }

  get tasks(){
    return this._tasks;
  }

  async _reverse(pos = 0){
    const res = [];
    const reversing = async pos => {
      if (pos === -1) return;
      try{
        res.push({
          pos,
          reversed: true,
          reverse: await this._tasks[pos].reverse()
        });
      }catch(e){
        res.push({
          pos,
          revered: false,
          reverse: e
        });
      }
      await reversing(pos - 1);
    };
    await reversing(pos);
    return res;
  }

  async start(){
    let results = [];

    for (let [index, task] of this._tasks.entries()) {
      try{
        const promise = await task.run();
        results.push({ success: true, result: promise }); 
      }catch(e){
        results.push({ success: false, result: e });
        if(task.options.break===true){
          const reverses = await this._reverse(index);
          reverses.map(res=>{
            Object.assign(results[res.pos], res);
          });
          break;
        }
      }
    }
    return results;
  }
}


module.exports = Orchestrator;