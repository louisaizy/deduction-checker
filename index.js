var globalTP = 0;
var tokens = []
var schema_error = false;


function getCharacters(line){
   var characters=[];
   for (var i = 0; i < line.length; i++) {
     currChar = line.charAt(i);
     if (currChar != ' '){
       characters.push(currChar);
     }
   }
   return characters;
 }


function getTokens(characters){
   var tokenPointer = 0;
   while (tokenPointer < characters.length){
     if (characters[tokenPointer] == " ") {
        tokenPointer+=1;
     }
     else if (characters[tokenPointer] == "-") {
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
     else if (characters[tokenPointer] == "(" || characters[tokenPointer] == "[") {
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
     else if (characters[tokenPointer] == ")" || characters[tokenPointer] == "]") {
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
  else if (globalTP < tokens.length && tokens[globalTP] == "neg"){
    globalTP+=1;
    term();
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


function rule(lineNumber){
  var rule = document.getElementById('rules'+lineNumber).value;
  return rule;
}


function p(lineNumber){
  var premises = document.getElementById('prem'+lineNumber).value;
  var citation = document.getElementById('cite'+lineNumber).value;
  if (premises.trim() != lineNumber.toString() || citation.trim() != ""){
    return false;
  }
  else {
    return true;
  }
}


function cq(lineNumber){
  var citation = document.getElementById('cite'+lineNumber).value.trim();
  if (parseInt(citation).toString() != citation || citation >= lineNumber) {
    return false;
  }
  var citedPrem = document.getElementById('prem'+citation).value.trim();
  var currentPrem = document.getElementById('prem'+lineNumber).value.trim();
  if (citedPrem != currentPrem){
    return false;
  }
  var citedLine = document.getElementById('line'+citation).value.trim();
  var currentLine = document.getElementById('line'+lineNumber).value.trim();
  var citedLineChars = getCharacters(citedLine);
  var currentLineChars = getCharacters(currentLine);
  tokens = [];
  getTokens(citedLineChars);
  var citedLineTokens = tokens;
  tokens = [];
  getTokens(currentLineChars);
  var currentLineTokens = tokens;
  tokens = [];
  if (citedLineTokens.length < 2 || currentLineTokens.length < 2 || citedLineTokens.length!=currentLineTokens.length){
    return false;
  }
  var i = 0;
  while(i<citedLineTokens.length-1){
    if (citedLineTokens[i]!=currentLineTokens[i]){
      if (citedLineTokens[i] == "neg" && citedLineTokens[i+1] == "uq"){
        if (currentLineTokens[i] != "eq" || currentLineTokens[i+1] != "neg"){
          return false;
        }
        else {
          i+=2;
        }
      }
      else if (citedLineTokens[i] == "neg" && citedLineTokens[i+1] == "eq"){
        if (currentLineTokens[i] != "uq" || currentLineTokens[i+1] != "neg"){
          return false;
        }
        else {
          i+=2;
        }
      }
      else if (citedLineTokens[i] == "uq" && citedLineTokens[i+1] == "neg"){
        if (currentLineTokens[i] != "neg" || currentLineTokens[i+1] != "eq"){
          return false;
        }
        else {
          i+=2;
        }
      }
      else if (citedLineTokens[i] == "eq" && citedLineTokens[i+1] == "neg"){
        if (currentLineTokens[i] != "neg" || currentLineTokens[i+1] != "uq"){
          return false;
        }
        else {
          i+=2;
        }
      }
      else {
        return false;
      }
    }
    else{
      i++;
    }
  }
  return true;
}


function isInteger(myString){
  if (parseInt(myString).toString() == myString){
    return true;
  }
  else {
    return false;
  }
}


function getPremises(lineNumber){
  var premisesEntry = document.getElementById('prem'+lineNumber).value.trim();
  if (premisesEntry.length == 0){
    return [];
  }
  var premises = premisesEntry.split(',').map(item => item.trim());
  filteredPremises = premises.filter(item => item != " ")
  return filteredPremises;
}


function createConditional(antecedentLine, consequentLine){
  antecedentChars = getCharacters(antecedentLine);
  consequentChars = getCharacters(consequentLine);
  tokens = [];
  getTokens(antecedentChars);
  antecedentTokens = tokens;
  tokens = [];
  getTokens(consequentChars);
  consequentTokens = tokens;
  tokens = [];
  if (antecedentTokens.includes("cond") || antecedentTokens.includes("bicond")){
    antecedentLine = "(" + antecedentLine + ")";
  }
  if (consequentTokens.includes("cond") || consequentTokens.includes("bicond")){
    antecedentLine = "(" + antecedentLine + ")";
  }
  var conditional = antecedentLine + " => " + consequentLine;
  return conditional;
}


function discharge(lineNumber){
  var citation = document.getElementById('cite'+lineNumber).value.trim();
  var premises = document.getElementById('prem'+lineNumber).value.trim();
  var currentLine = document.getElementById('line'+lineNumber).value.trim();
  //check citation
  var citedAntecedentString = "";
  var citedConsequentString = "";
  if (citation.length == 0 || citation.charAt(0)!="["){
    return false;
  }
  var i = 1;
  while (i<citation.length && citation.charAt(i)!="]"){
     if (isInteger(citation.charAt(i))==false) {
       return false;
     }
     else {
       citedAntecedentString += citation.charAt(i);
       i++;
     }
  }
  if (i>=citation.length){
     return false;
  }
  else if (citedAntecedentString == "") {
    return false;
  }
  else {
    i += 1;
  }
  while (i<citation.length && citation.charAt(i)!="("){
    if (citation.charAt(i) == " "){
      i += 1;
    }
    else {
       return false;
    }
  }
  if (i>=citation.length){
    return false;
  }
  else {
    i += 1;
  }

  while (i<citation.length && citation.charAt(i)!=")"){
    if (isInteger(citation.charAt(i))== false) {
      return false;
    }
    else {
      citedConsequentString += citation.charAt(i);
      i++;
    }
  }
  i++;
  if (i<citation.length || citedConsequentString == ""){
    return false;
  }
  //now know citation format is good. just need to check if numbers are appropriate.
  var citedConsequentLineNum = parseInt(citedConsequentString);
  var citedAntecedentLineNum = parseInt(citedAntecedentString);
  if (citedConsequentLineNum >= lineNumber || citedAntecedentLineNum >= lineNumber
    || citedConsequentLineNum < 1 || citedAntecedentLineNum <1){
    return false;
  }
  //check premises. need to be same as original prem minus cited one.
  var premises = getPremises(lineNumber);
  var citedConsequentPremises = getPremises(citedConsequentLineNum.toString());
  var combinedPrem = premises.concat([citedAntecedentLineNum.toString()]);
  //compare premises to combined prem.
  citedConsequentPremises = citedConsequentPremises.sort();
  combinedPrem = combinedPrem.sort();
  if (citedConsequentPremises.length != combinedPrem.length){
    return false;
  }
  for (var k = 0; k<citedConsequentPremises.length; k++){
    if (citedConsequentPremises[k] != combinedPrem[k]){
      return false;
    }
  }
  //check lines- merger of 2 cited
  var antecedentLine = document.getElementById('line'+citedAntecedentLineNum).value.trim();
  var consequentLine = document.getElementById('line'+citedConsequentLineNum).value.trim();
  var dischargeLine = document.getElementById('line'+lineNumber).value.trim();
  var mergerLine = createConditional(antecedentLine, consequentLine);
  var mergerCharacters = getCharacters(mergerLine);
  var dischargeCharacters = getCharacters(dischargeLine);
  if (mergerCharacters.length != dischargeCharacters.length){
    return false;
  }
  for (i=0;i<mergerCharacters.length;i++){
    if (mergerCharacters[i]!=dischargeCharacters[i]){
      return false;
    }
  }
  return true;
}


function ruleOne(lineNumber){
  var currentLine = document.getElementById('line'+lineNumber).value.trim();
  if (currentLine != "(UQx)(x=x)"){
    return false;
  }
  var citation = document.getElementById('cite'+lineNumber).value.trim();
  if (citation != ""){
    return false;
  }
  var premises = document.getElementById('prem'+lineNumber).value.trim();
  if (premises != ""){
    return false;
  }
  return true;
}


function check() {
  noIssues = true;
  for(i=1; i<16; i++){
    if (isSchema(i)==false){
      window.alert("Something is wrong.");
      noIssues = false;
      break;
    }
    if (rule(i)=="P"){
      noIssues = p(i);
      if (noIssues ==false){
        window.alert("Something is wrong.");
        break;
      }
    }
    else if (rule(i)=="CQ"){
      noIssues = cq(i);
      if (noIssues == false){
        window.alert("Something is wrong.");
        break;
      }
    }
    else if (rule(i)=="D"){
      noIssues = discharge(i);
      if (noIssues == false){
        window.alert("Something is wrong.");
        break;
      }
    }
    else if (rule(i)=="I"){
      noIssues = ruleOne(i);
      if (noIssues == false){
        window.alert("Something is wrong.");
        break;
      }
    }
  }
  if (noIssues){
      window.alert("Looks good!");
  }
  tokens = [];
  schema_error = false;
  globalTP = 0;
}
