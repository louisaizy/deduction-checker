var globalTP = 0;
var tokens = []
var schema_error = false;

 function getCharacters(line){
   var characters=[];
   for (var i = 0; i < line.length; i++) {
     currChar = line.charAt(i);
     characters.push(currChar);
   }
   return characters;
 }

function getTokens(characters){
   var tokenPointer = 0;
   while (tokenPointer < characters.length){
     if (characters[tokenPointer] == " ") {
        tokenPointer+=1;
     }
     else if (characters[tokenPointer] == "~") {
       tokens.push("neg");
       tokenPointer+=1;
     }
     else if (characters[tokenPointer] == "*") {
       tokens.push("and");
       tokenPointer+=1;
     }
     else if (characters[tokenPointer] == "V") {
       tokens.push("or");
       tokenPointer+=1;
     }
     else if (characters[tokenPointer] == "(") {
       if (tokenPointer+4<characters.length && characters[tokenPointer+1]=="U" && characters[tokenPointer+2]=="Q" && characters[tokenPointer+3] != characters[tokenPointer+3].toUpperCase() && characters[tokenPointer+4] == ")"){
         tokens.push("uq");
         tokenPointer += 5;
       }
       else if (tokenPointer+4<characters.length && characters[tokenPointer+1]=="E" && characters[tokenPointer+2]=="Q" && characters[tokenPointer+3] != characters[tokenPointer+3].toUpperCase() && characters[tokenPointer+4] == ")"){
         tokens.push("eq");
         tokenPointer += 5;
       }
       else {
         tokens.push("lp")
         tokenPointer+=1
       }
     }
     else if (characters[tokenPointer] == ")") {
       tokens.push("rp");
       tokenPointer+=1;
     }
     else if (characters[tokenPointer] != characters[tokenPointer].toLowerCase()) {
       if(tokenPointer+1<characters.length && characters[tokenPointer+1] != characters[tokenPointer+1].toUpperCase()){
         tokens.push("pred");
         tokenPointer += 1;
         while(tokenPointer<characters.length && characters[tokenPointer] != characters[tokenPointer].toUpperCase()){
           tokenPointer+=1;
         }
       }
       else {
         tokens.push("error");
         break;
       }
     }
     else if (characters[tokenPointer] != characters[tokenPointer].toUpperCase()){
       tokens.push("sentLet");
       tokenPointer+= 1;
     }
     else if (characters[tokenPointer] == "<") {
       if(tokenPointer+2<characters.length && characters[tokenPointer+1]=="=" && characters[tokenPointer+2]==">"){
         tokens.push("bicond");
         tokenPointer += 3;
       }
     }
     else if (characters[tokenPointer] == "=") {
       if(tokenPointer+1<characters.length && characters[tokenPointer+1]==">"){
         tokens.push("cond");
         tokenPointer += 2;
       }
       else {
         tokens.push("eqOp");
         tokenPointer += 1;
       }
     }
     else if (characters[tokenPointer] == "!") {
       if(tokenPointer+1<characters.length && characters[tokenPointer+1]=="="){
         tokens.push("notEqOp");
         tokenPointer += 2;
       }
       else{
         tokens.push("error");
         break;
       }
     }
     else {
       tokens.push("error");
       break;
     }
   }
}

function conditional(){
  disjunction();
  if (globalTP < tokens.length && (tokens[globalTP] == "bicond" || tokens[globalTP] == "cond")){
    globalTP+=1;
    disjunction();
  }
}

function disjunction(){
  conjunction();
  while (globalTP < tokens.length && tokens[globalTP] == "or"){
    globalTP+=1;
    conjunction();
  }
}

 function conjunction(){
   equality();
   while (globalTP < tokens.length && tokens[globalTP] == "and"){
     globalTP+=1;
     equality();
   }
 }

function equality(){
  negation();
  if (globalTP < tokens.length && (tokens[globalTP] == "eqOp" || tokens[globalTP] == "notEqOp")){
    globalTP+=1;
    negation();
  }
}

function negation(){
  while (globalTP < tokens.length && tokens[globalTP] == "neg"){
    globalTP+=1;
  }
  quant();
}

function quant(){
  while (globalTP < tokens.length && (tokens[globalTP] == "uq" || tokens[globalTP] == "eq")){
    globalTP+=1;
  }
  term();
}

function term(){
  if (globalTP < tokens.length && tokens[globalTP] == "pred"){
    globalTP+=1;
  }
  else if (globalTP < tokens.length && tokens[globalTP] == "sentLet"){
    globalTP+=1;
  }
  else if (globalTP < tokens.length && tokens[globalTP] == "lp"){
    globalTP+=1;
    conditional();
    if (globalTP < tokens.length && tokens[globalTP] == "rp"){
      globalTP+=1;
    }
    else {
      schema_error = true;
    }
  }
  else {
    schema_error = true;
  }
}

function isSchema(lineNumber){
  var line = document.getElementById('line'+lineNumber).value;
  characters = getCharacters(line);
  if (characters.length == 0){
    return true;
  }
  getTokens(characters);
  for(var i=0; i<tokens.length; i++){
    if (tokens[i]=="error"){
      return false;
    }
  }
 conditional();
 if (globalTP!=tokens.length || schema_error == true){
   return false;
 }
 else{
   return true;
 }
}

function check() {
  noIssues = true;
  for(i=1; i<16; i++){
    if (isSchema(i)==false){
      window.alert("Something is wrong.");
      noIssues = false;
      break;
    }
  }
  if (noIssues){
      window.alert("Looks good!");
  }
  tokens = [];
  schema_error = false;
  globalTP = 0;
}
