'use strict';

class TaskAgent{

run(tasks){

console.log('');

console.log('📋 Görev Planı');

console.log('--------------');

tasks.forEach((t,i)=>{

console.log(`${i+1}. ${t}`);

});

console.log('');

}

}

module.exports=TaskAgent;
