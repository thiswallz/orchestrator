[![Build Status](https://travis-ci.org/thiswallz/orchestrator.svg?branch=master)](https://travis-ci.org/thiswallz/orchestrator)
[![NPM version](https://img.shields.io/npm/v/queue-orchestrator.svg)](https://www.npmjs.com/package/queue-orchestrator)

# Queue-orchestrator 

A basic and simple module for sequencing and executing tasks based in promises, this module can reverse tasks if something has failed.

You can chain and execute special promises if something is wrong, also if you set "break:true" the chain stops and start to execute the reverse functions backward.

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

## Using reverse concept if a promise is rejected

## Example 1

```js
const Orchestrator = require("queue-orchestrator");
const axios = require('axios');
 
const orchestrator = new Orchestrator();

orchestrator.add({
  reverse(){
    return new Promise((resolve, reject) => {
      resolve("The process has reversed");
    }); 
  },
  run(){
    return axios.get('https://jsonplaceholder.typicode.com/posts/1');
  }
});

orchestrator.add({
  reverse(){
    return new Promise((resolve, reject) => {
      resolve("The 2d process has reversed");
    }); 
  },
  run(){
    return axios.get('https://jsonplaceholder.typicode.com/posts/1');
  }
});

orchestrator.add({
  options: {
    break: true
  },
  run(){
    return Promise.reject('Rejected on purpose');
  }
})     

orchestrator.start().then(res=>{
  console.log(res[0].reverse);
  //The process has reversed
  
  console.log(`${res[0].reversed} - ${res[1].reversed} - ${res[2].reversed}`);
  //true - true - false

  console.log(res[1].result.data);
  /*
   * Response : { userId: 1,
   *   id: 1,
   *   title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
   *   body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut qu
   *   as totam\nnostrum rerum est autem sunt rem eveniet architecto' }
   */

  console.log(res[2]);
  /*
   * Response: { success: false,
   * result: 'Rejected on purpose',
   * pos: 2,
   * reversed: false,
   * reverse: 'There is not reverse function' }
   */
});

```

### Example 2
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

### Options

General Orchestrator features.

| F(X)          |  Params          | Return  | Detail  |
|---------------|-----------------|---------|---------|
| start      |  | promise  | This method starts to chain javascript promises|
| add      | option object | void  | This method add a promise|

Add() method options.

| Properties              | Type    | Detail  |
|-------------------------|---------|---------|
| options: {break: true}| boolean |  When the promise failed it will start to execute reversing promises backward if break is true|
| run                   | function | Main method, you have to return a promise here|
| reverse                   | function | Revere method, you have to return a promise here|


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
