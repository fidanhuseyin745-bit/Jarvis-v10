'use strict';

class Analyzer{

analyze(text){

return{

length:text.length,

hasExpress:text.includes('express'),

hasReact:text.includes('react'),

hasPython:text.includes('flask')

};

}

}

module.exports=Analyzer;
