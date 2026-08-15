"use strict";

const fs=require("fs");
const path=require("path");

const apps=JSON.parse(
fs.readFileSync(
path.join(__dirname,"../appRegistry/apps.json"),
"utf8"
));

function normalize(t){
return t.toLowerCase()
.replace(/ç/g,"c")
.replace(/ğ/g,"g")
.replace(/ı/g,"i")
.replace(/ö/g,"o")
.replace(/ş/g,"s")
.replace(/ü/g,"u");
}

function distance(a,b){

a=normalize(a);
b=normalize(b);

const m=[];

for(let i=0;i<=b.length;i++)m[i]=[i];
for(let j=0;j<=a.length;j++)m[0][j]=j;

for(let i=1;i<=b.length;i++){

for(let j=1;j<=a.length;j++){

m[i][j]=b[i-1]==a[j-1]
?m[i-1][j-1]
:Math.min(
m[i-1][j-1]+1,
m[i][j-1]+1,
m[i-1][j]+1
);

}

}

return m[b.length][a.length];

}

function find(name){

name=normalize(name);

let best=null;
let score=999;

for(const [pkg,list] of Object.entries(apps)){

for(const alias of list){

const d=distance(name,alias);

if(d<score){

score=d;
best=pkg;

}

}

}

return score<=2?best:null;

}

module.exports={find};
