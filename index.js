
class Node {

  constructor(name){
    this._name= name;
    this.edges= [];
  }

  addEdge(node){
    this.edges.push(node);
  }

}



const a = Node('a')
const b = Node('b')

a.addEdge(b);

