'use strict';

const tree=require('../utils/tree');

class Tree{

constructor(projects){
this.projects=projects;
}

run(){

tree(this.projects.getCurrent());

}

}

module.exports=Tree;
