[![Build Status](https://travis-ci.org/thiswallz/orchestrator.svg?branch=master)](https://travis-ci.org/thiswallz/orchestrator)
[![NPM version](https://img.shields.io/npm/v/queue-orchestrator.svg)](https://www.npmjs.com/package/queue-orchestrator)

# Queue-orchestrator 

A module for sequencing and executing tasks based in promises, this module can reverse tasks if someone has failed.


## Node.js Usage

```sh
npm install queue-orchestrator --save
```

```js
    const Orchestrator = require("queue-orchestrator");
   
    const orchestrator = new Orchestrator();
    
    orchestrator.add({
      run(){
        return new Promise((resolve, reject) => {
          resolve("OK");
        }); 
      }
    });
    orchestrator.start().then(res=>console.log(res[0].result));
    //OK

```

## Using reverse 

```js
    const Orchestrator = require("queue-orchestrator");
    
    const orchestrator = new Orchestrator();
    
    orchestrator.add({
      reverse(){
        return new Promise((resolve, reject) => {
          resolve("The process has reversed");
        }); 
      },
      run(){
       return {data: "something"}; 
      }
    });
 
    orchestrator.add({
      reverse(){
        return new Promise((resolve, reject) => {
          resolve("The 2d process has reversed");
        }); 
      },
      run(){
       return {data: "something"}; 
      }
    });

    orchestrator.add({
      options: {
        break: true
      },
      run(){
        return new Promise((resolve, reject) => {
          reject("Rejected and reversing");
        }); 
      }
    });

    orchestrator.start().then(res=>{
      console.log(res[0].reversed===true);
      //true
      console.log(res[1].reversed===true);
      //true
      console.log(res[1].reverse);
      //The 2d process has reversed
    });

```

## General Usage

```js
describe('add task', () => {

  it('add() should be return undefined', () => {
    const orchestrator = new Orchestrator();
    expect(orchestrator.add({})).to.be.a('undefined');
  });

  it('tasks should be return 1 element if an item is passed', () => {
    const orchestrator = new Orchestrator();
    orchestrator.add({});
    expect(orchestrator.tasks.length).to.equal(1);
  });

});

describe('start tasks', () => {

  it('start should be return a promise', () => {
    const orchestrator = new Orchestrator();
    return expect(orchestrator.start()).to.be.a('promise'); 
  });

  it('starts promise should be resolve with a list of tasks responses', async () => {
    const orchestrator = new Orchestrator();
    orchestrator.add({});
    orchestrator.add({});

    const res = await orchestrator.start()
    return expect(res.length).to.equal(2);
  });
  
  it('starts promise should be resolve with an array of objects', async () => {
    const orchestrator = new Orchestrator();
    orchestrator.add({});
    orchestrator.add({});

    const res = await orchestrator.start()
    return expect(res).to.be.an('array');
  });


});

describe('tasks runner', () => {

  it('tasks must be executed', async() => {
    const orchestrator = new Orchestrator();
    orchestrator.add({
      run(){
       return {success: true}; 
      }
    });
    const res = await orchestrator.start();

    return expect(res[0]).to.have.own.property('success', true);
  });

  it('start process must be catch the promises resolve', async() => {
    const orchestrator = new Orchestrator();
    orchestrator.add({
      run(){
        return new Promise((resolve, reject) => {
          resolve("OK");
        }); 
      }
    });
    const res = await orchestrator.start();
    return expect(res[0]).to.have.own.property('result', "OK");
  });

  it('start process must be catch the promises reject', async() => {
    const orchestrator = new Orchestrator();
    orchestrator.add({
      run(){
        return new Promise((resolve, reject) => {
          reject(false);
        }); 
      }
    });
    orchestrator.add({
      run(){
        return new Promise((resolve, reject) => {
          reject(new Error("500xerr"));
        }); 
      }
    });

    const res = await orchestrator.start();
    
    return expect(res[0]).to.have.own.property('success', false) 
      && expect(res[1].result).to.have.own.property('message', "500xerr");
  });

});


describe('task break', () => {

  it('when the task is broken and its property break is true the process is finish', async() => {
    const orchestrator = new Orchestrator();
    orchestrator.add({
      run(){
        return new Promise((resolve, reject) => {
          resolve("OK");
        }); 
      }
    });

    orchestrator.add({
      options: {
        break: true
      },
      run(){
        return new Promise((resolve, reject) => {
          reject("some error");
        }); 
      }
    });

    orchestrator.add({
      run(){
        return new Promise((resolve, reject) => {
          resolve("OK");
        }); 
      }
    });
    
    const res = await orchestrator.start();
    return expect(res[2]).to.be.undefined;
  });


  it('should be execute only the first task', async() => {
    const orchestrator = new Orchestrator();
    orchestrator.add({
      options: {
        break: true
      },
      run(){
        return new Promise((resolve, reject) => {
          reject("Rejected");
        }); 
      }
    });

    orchestrator.add({});
    orchestrator.add({});

    const res = await orchestrator.start();
    return expect(res[2]).to.be.undefined 
      && expect(res[0]).to.have.own.property('result', "Rejected"); 
  });

});


describe('task reverse', () => {

  it('when something is wrong the reverse function has to execute for all the functions that have passed', async() => {
    const orchestrator = new Orchestrator();
    
    orchestrator.add({
      reverse(){
        return new Promise((resolve, reject) => {
          resolve("The process has reversed");
        }); 
      },
      run(){
       return {data: "something"}; 
      }
    });
 
    orchestrator.add({
      reverse(){
        return new Promise((resolve, reject) => {
          resolve("The 2d process has reversed");
        }); 
      },
      run(){
       return {data: "something"}; 
      }
    });

    orchestrator.add({
      options: {
        break: true
      },
      run(){
        return new Promise((resolve, reject) => {
          reject("Rejected and reversing");
        }); 
      }
    });

    const res = await orchestrator.start();

    return expect(res[0]).to.have.own.property('reversed', true)
      && expect(res[1]).to.have.own.property('reversed', true)
      && expect(res[1]).to.have.own.property('reverse', "The 2d process has reversed")

  });

});

```


## Tests

```sh
npm test
```

## License

  MIT
