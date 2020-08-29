/*
index.js by Louisa Izydorczak
Javascript file for deduction checker program
*/


var globalTP = 0; //global token pointer
var tokens = [];
var schema_error = false;
var globalMarker = 0;
var citedLines = [];


/*
getCharacters function
Description: gets characters in a given line, removes spaces
Parameters: string
Returns: array of all characters in string without any spaces
*/
function getCharacters(line){
   var characters = [];
   for (var i = 0; i < line.length; i++) {
     currChar = line.charAt(i);
     if (currChar != ' '){
       characters.push(currChar);
     }
   }
   return characters;
 }


 /*
 getTokens function
 Description: populates global tokens array, separates and classifies characters
              by meaning
 Parameters: array of characters
 Returns: nothing
 Potential issues: relying on global variables. Could be shortened/ broken down?
 */
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
       if (tokenPointer+4<characters.length && characters[tokenPointer+1]=="U"
            && characters[tokenPointer+2]=="Q" && characters[tokenPointer+3]
            != characters[tokenPointer+3].toUpperCase() && characters[tokenPointer+4] == ")"){
         tokens.push("uq");
         tokenPointer += 5;
       }
       else if (tokenPointer+4<characters.length && characters[tokenPointer+1]=="E"
               && characters[tokenPointer+2]=="Q" && characters[tokenPointer+3]
               != characters[tokenPointer+3].toUpperCase() && characters[tokenPointer+4] == ")"){
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
       if(tokenPointer+1<characters.length && characters[tokenPointer+1]
              != characters[tokenPointer+1].toUpperCase()){
         tokens.push("pred");
         tokenPointer += 1;
         while(tokenPointer<characters.length && characters[tokenPointer]
              != characters[tokenPointer].toUpperCase()){
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
       if(tokenPointer+2<characters.length && characters[tokenPointer+1]=="="
          && characters[tokenPointer+2]==">"){
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


/*
conditional function
Description: increments global token pointer for one conditional or biconditional, and
             calls disjunction function before and after this token is found
Parameters: none
Returns: nothing
*/
function conditional(){
  disjunction();
  if (globalTP < tokens.length && (tokens[globalTP] == "bicond" || tokens[globalTP] == "cond")){
    globalTP+=1;
    disjunction();
  }
}


/*
disjunction function
Description: increments global token pointer for each disjunction sign, calling
             conjunction function before, after, and between any disjunction signs
Parameters: none
Returns: nothing
*/
function disjunction(){
  conjunction();
  while (globalTP < tokens.length && tokens[globalTP] == "or"){
    globalTP+=1;
    conjunction();
  }
}


/*
conjunction function
Description: increments global token pointer for each conjunction sign, calling
             equality function before, after, and between any conjunction signs
Parameters: none
Returns: nothing
*/
 function conjunction(){
   equality();
   while (globalTP < tokens.length && tokens[globalTP] == "and"){
     globalTP+=1;
     equality();
   }
 }


 /*
 equality function
 Description: increments global token pointer for one equal or not equal operator,
              calling negation function before and after this operator
 Parameters: none
 Returns: nothing
 */
function equality(){
  negation();
  if (globalTP < tokens.length && (tokens[globalTP] == "eqOp" || tokens[globalTP] == "notEqOp")){
    globalTP+=1;
    negation();
  }
}


/*
negation function
Description: increments global token pointer for each negation, calling
             the quant function after these negations
Parameters: none
Returns: nothing
*/
function negation(){
  while (globalTP < tokens.length && tokens[globalTP] == "neg"){
    globalTP+=1;
  }
  quant();
}


/*
quant function
Description: increments global token pointer for each universal or existential
             quantifier, calling term function after these quantifiers
Parameters: none
Returns: nothing
*/
function quant(){
  while (globalTP < tokens.length && (tokens[globalTP] == "uq" || tokens[globalTP] == "eq")){
    globalTP+=1;
  }
  term();
}


/*
term function
Description: checks for predicate, sentence letter, negation followed by term or
             expression in parentheses, updating schema error to true if none of
             these options are found
Parameters: none
Returns: nothing
*/
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


/*
isSchema function
Description: gets characters and then tokens at a given
             line number. Checks tokens for error and if there is
             none calls the conditional function. After this function is called,
             checks to see if all tokens have been consumed and if there is a schema error.
Parameters: integer (line number between 1 and 15)
Returns: boolean (whether or not line is a schema)
*/
function isSchema(lineNumber){
  var line = document.getElementById('line'+lineNumber).value;
  var characters = getCharacters(line);
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
   if (schema_error == true){
   }
   return false;
 }
 else{
   return true;
 }
}


/*
rule function
Description: gets the selected rule on a given line number
Parameters: integer between 1-15 (line number)
Returns: string (name of rule)
*/
function rule(lineNumber){
  var rule = document.getElementById('rules'+lineNumber).value;
  return rule;
}


/*
p function
Description: Checks that line is valid premise declaration, meaning the premise listed
             is the same as the line number and the citation box is empty.
Parameters: integer 1-15 (line number)
Returns: boolean (if line is valid premise declaration or not)
*/
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


/*
cq function
Description: Checks if line is a valid conversion of quantifiers line, meaning
             that it is the same as the cited line but has conversion of quantifiers.
             There are 4 possible ways to do conversion of quantifiers. The premise numbers
             are the same as the premises of the cited line.
Parameters: integer 1-15 (line number)
Returns: boolean (if line is valid conversion of quantifiers line or not)
Potential issues: Might work if there is no conversion of quantifiers. May not handle
                  change in parentheses. Could this function be shortened/ broken
                  into multiple functions?
*/
function cq(lineNumber){
  var citation = document.getElementById('cite'+lineNumber).value.trim();
  citedLines.length = 0;
  var i = 0;
  while(i<citation.length){
    if (citation[i]==" "){
      i++;
      continue;
    }
    else if (citation[i]=="("){
      i++;
      var currInt = "";
      while(i<citation.length && isInteger(citation[i])==true){
        currInt += citation[i];
        i++;
      }
      if (citation[i]>= citation.length || citation[i]!=")" || currInt == ""){
        return false;
      }
      else {
        i++;
        if (parseInt(currInt) < 1 || parseInt(currInt) >= lineNumber){
          return false;
        }
        citedLines.push(parseInt(currInt));
      }
    }
    else {
      return false;
    }
  }
  if (citedLines.length != 1){
    return false;
  }
  else {
    var citedLineNumber = citedLines[0];
  }
  var citedPrem = document.getElementById('prem'+citedLineNumber).value.trim();
  var currentPrem = document.getElementById('prem'+lineNumber).value.trim();
  if (citedPrem != currentPrem){
    return false;
  }
  var citedLine = document.getElementById('line'+ citedLineNumber).value.trim();
  var currentLine = document.getElementById('line'+lineNumber).value.trim();
  var citedLineChars = getCharacters(citedLine);
  var currentLineChars = getCharacters(currentLine);
  // tokens.length = 0;
  // getTokens(citedLineChars);
  // var citedLineTokens = [...tokens];
  // tokens.length = 0;
  // getTokens(currentLineChars);
  // var currentLineTokens = [...tokens];
  if (citedLineChars.length < 6 || currentLineChars.length < 6
       || citedLineChars.length!=currentLineChars.length){
    return false;
  }
  i = 0;
  var converted = false;
  while(i<citedLineChars.length-5){
    if (citedLineChars[i]!=currentLineChars[i]){
      if (citedLineChars[i] == "-" && citedLineChars[i+2] == "U"){
        if (currentLineChars[i+1] != "E" || currentLineChars[i+5] != "-"){
          return false;
        }
        else {
          converted = true;
          i+=5;
        }
      }
      else if (citedLineChars[i] == "-" && citedLineChars[i+2] == "E"){
        if (currentLineChars[i+1] != "U" || currentLineChars[i+5] != "-"){
          return false;
        }
        else {
          converted = true;
          i+=5;
        }
      }
      else if (citedLineChars[i+1] == "U" && citedLineChars[i+5] == "-"){
        if (currentLineChars[i] != "-" || currentLineChars[i+2] != "E"){
          return false;
        }
        else {
          converted = true;
          i+=5;
        }
      }
      else if (citedLineChars[i+1] == "E" && citedLineChars[i+5] == "-"){
        if (currentLineChars[i] != "-" || currentLineChars[i+2] != "U"){
          return false;
        }
        else {
          converted = true;
          i+=5;
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
  citedLines.length = 0;
  if (!converted) {
    window.alert("here");
    return false;
  }
  return true;
}


/*
isInteger function
Description: checks whether or not a given string could be written as an integer
Parameters: a string
Returns: boolean (whether or not string could be written as an integer)
*/
function isInteger(myString){
  if (parseInt(myString).toString() == myString){
    return true;
  }
  else {
    return false;
  }
}


/*
getPremises function
Description: gives the premises entered at a given line number in array form,
             stripping parentheses and spaces
Parameters: integer 1-15 (line number)
Returns: array of integers (premise numbers)
Potential issues: may get non-integers- check here rather than in other functions?
*/
function getPremises(lineNumber){
  var premisesEntry = document.getElementById('prem'+lineNumber).value.trim();
  if (premisesEntry.length == 0){
    return [];
  }
  var premises = premisesEntry.split(',').map(item => item.trim());
  filteredPremises = premises.filter(item => item != " ")
  return filteredPremises;
}


/*
createConditional function
Description: combines two strings into a conditional. If a string given contains
             a conditional or biconditional, the function puts parentheses around
             that part of the new conditional.
Parameters: two strings (antecedent and consequent lines)
Returns: one string (conditional)
*/
function createConditional(antecedentLine, consequentLine){
  antecedentChars = getCharacters(antecedentLine);
  consequentChars = getCharacters(consequentLine);
  tokens.length = 0;
  getTokens(antecedentChars);
  antecedentTokens = tokens;
  tokens.length = 0;
  getTokens(consequentChars);
  consequentTokens = tokens;
  tokens.length = 0;
  if (antecedentTokens.includes("cond") || antecedentTokens.includes("bicond")){
    antecedentLine = "(" + antecedentLine + ")";
  }
  if (consequentTokens.includes("cond") || consequentTokens.includes("bicond")){
    antecedentLine = "(" + antecedentLine + ")";
  }
  var conditional = antecedentLine + " => " + consequentLine;
  return conditional;
}


/*
discharge function
Description: checks if given line is a valid discharge line. This means that the
             citation is of the form: [int](int) and the 2 cited lines are above
             the current line. Also, the premises must be the same as that of the
             cited consequent minus the line number of the cited antecedent. The
             line must be a conditional merger of the antecedent and consequent lines.
Parameters: integer 1-15 (line number)
Returns: boolean (whether or not given line is valid discharge line)
Potential issues: Added parentheses may cause error. Could this function be broken
                  down or shortened?
*/
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
  globalTP = 0;
  return true;
}


/*
ruleOne function
Description: checks if given line is a valid rule one line, meaning that there
             are no premises or citations listed and the line is the very specific
             rule one line.
Parameters: integer 1-15 (line number)
Returns: boolean (whether or not line is a valid rule one line)
*/
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


/*
evaluateParen function
Description: evaluates true/false of an assignment which may or may not contain
             expressions in parentheses
Parameters: assignment- mixed array of booleans and strings (tokens)
Returns: boolean
*/
function evaluateParen(assignment){
  var tf;
  if (globalMarker < assignment.length && assignment[globalMarker] == "lp"){
    globalMarker += 1;
    tf = evaluateTF(assignment);
    if (assignment[globalMarker] == "rp"){
      globalMarker += 1;
    }
  }
  else {
    tf = assignment[globalMarker];
    globalMarker += 1;
  }
  return tf;
}


/*
evaluateNeg function
Description: evaluates true/false of an assignment which may or may not contain
             negations and/or expressions in parentheses
Parameters: assignment- mixed array of booleans and strings (tokens)
Returns: boolean
*/
function evaluateNeg(assignment){
  var myString = "";
  while (globalMarker < assignment.length && assignment[globalMarker] == "neg"){
    globalMarker += 1;
    myString += "!"
  }
  myString += evaluateParen(assignment);
  return eval(myString);
}


/*
evaluateAnd function
Description: evaluates true/false of an assignment which may or may not contain
             conjunctions, negations and/or expressions in parentheses
Parameters: assignment- mixed array of booleans and strings (tokens)
Returns: boolean
*/
function evaluateAnd(assignment){
  var myString = "";
  myString += evaluateNeg(assignment); //string
  while (globalMarker < assignment.length && assignment[globalMarker] == "and"){
    globalMarker += 1;
    myString += "&&"
    myString += evaluateNeg(assignment);
  }
  return eval(myString);
}


/*
evaluateOr function
Description: evaluates true/false of an assignment which may or may not contain
             disjunctions, conjunctions, negations and/or expressions in parentheses
Parameters: assignment- mixed array of booleans and strings (tokens)
Returns: boolean
*/
function evaluateOr(assignment){
  var myString = "";
  myString += evaluateAnd(assignment); //string
  while (globalMarker < assignment.length && assignment[globalMarker] == "or"){
    globalMarker += 1;
    myString += "||"
    myString += evaluateAnd(assignment);
  }
  return eval(myString);
}


/*
evaluateTF function
Description: evaluates true/false of an assignment which may or may not contain
             conditionals, biconditionals, disjunctions, conjunctions, negations
             and/or expressions in parentheses
Parameters: assignment- mixed array of booleans and strings (tokens)
Returns: final boolean, whether or not assignment evaluates to true or false
*/
function evaluateTF(assignment){
  var partOne = evaluateOr(assignment);
  if (globalMarker < assignment.length && (assignment[globalMarker] == "cond" || assignment[globalMarker]=="bicond")){
    var condType = assignment[globalMarker];
    globalMarker += 1;
    var partTwo = evaluateOr(assignment);
    if (condType == "bicond"){
      return eval(partOne == partTwo);
    }
    else {
      return eval(!partOne || partTwo);
    }
  }
  else {
    return eval(partOne);
  }
}


function quantified(index, lineChars){
  var isBound = false;
  var parenCount = 0;
  for (var i = 0; i < lineChars.length; i++){
    if (i == index){
      return isBound;
    }
    else if (lineChars[i] == "(" && i+2 < lineChars.length && lineChars[i+2] == "Q"){
      isBound = true;
    }
    else if (lineChars[i] == "(" && isBound == true){
      if (i+2 >= lineChars.length || lineChars[i+2]!="Q"){
        parenCount += 1;
      }
    }
    else if (lineChars[i] == ")" && isBound == true){
      if (i-2<0 || lineChars[i-2]!="Q"){
        parenCount -= 1;
        if (parenCount == 0) {
          isBound = false;
        }
      }
    }
    else if (i+1 < lineChars.length && lineChars[i] == "=" && lineChars[i+1] == ">" && isBound == true){
      if (parenCount == 0){
        isBound = false;
      }
    }
    else if (i+2 < lineChars.length && lineChars[i] == "<" && lineChars[i+1] == "=" && lineChars[i+2] == ">" && isBound == true){
      if (parenCount == 0){
        isBound = false;
      }
    }
  }
  return false;
}


/*
tf function
Description: checks whether or not a given line is a valid tf line. This involves
             ensuring that the citation is appropriate, that the premises are a
             combination of the cited lines' premises, and that the cited lines
             truth-functionally imply the current line.
Parameters: line number (integer 1-15)
Returns: boolean, whether or not line is a valid tf line
Issues: doesn't correctly handle quantified statements
*/
function tf(lineNumber){
  //globalMarker = 0;
  //ensure that citation is appropriate
  var citation = document.getElementById('cite'+lineNumber).value.trim();
  citedLines.length = 0;
  var i = 0;
  while(i<citation.length){
    if (citation[i]==" "){
      i++;
      continue;
    }
    else if (citation[i]=="("){
      i++;
      var currInt = "";
      while(i<citation.length && isInteger(citation[i])==true){
        currInt += citation[i];
        i++;
      }
      if (citation[i]>= citation.length || citation[i]!=")" || currInt == ""){
        return false;
      }
      else {
        i++;
        if (parseInt(currInt) < 1 || parseInt(currInt) >= lineNumber){
          return false;
        }
        citedLines.push(parseInt(currInt));
      }
    }
    else {
      return false;
    }
  }
  //ensure that premises match citation
  var requiredPrem = [];
  for(var j=0; j<citedLines.length; j++){
    var somePremises = getPremises(citedLines[j]);
    for(var k=0; k<somePremises.length; k++){
      if (!requiredPrem.includes(somePremises[k])){
        requiredPrem.push(somePremises[k]);
      }
    }
  }
  requiredPrem = requiredPrem.sort();
  actualPrem = getPremises(lineNumber).sort();
  if (requiredPrem.length!=actualPrem.length){
    return false;
  }
  for(var l=0; l<requiredPrem.length; l++){
    if (requiredPrem[l]!=actualPrem[l]){
      return false;
    }
  }
  //put cited lines together with conjunctions
  var implication = "";
  for(var m=0; m<citedLines.length; m++){
    implication += "(";
    implication += document.getElementById('line'+citedLines[m]).value.trim();
    implication += ")";
    if (m != citedLines.length - 1){
      implication += "*";
    }
  }
  //build conditional with cited line conjunction => current line
  implication += "=>(";
  implication += document.getElementById('line'+lineNumber).value.trim();
  implication += ")";
  //know you have a schema now
  //from this schema, build a template for assignments.
        //if you have lp, rp, cond, bicond, neg, and, or:
              //put the token
        //otherwise, put what is there together in a string- could be pred, sentLet, equality
  var assignmentTemplate = [];
  var implicationChars = getCharacters(implication);
  for(var x=0; x<implicationChars.length; x++){
  }
  var newString = "";
  var n = 0;
  while (n<implicationChars.length){
    if (implicationChars[n]=="("){
      if (implicationChars[n+1] == "U" || implicationChars[n+1] == "E"){
        newString += "(";
        newString += implicationChars[n+1];
        newString += "Q";
        newString += implicationChars[n+3];
        newString += ")";
        n+=5;
      }
      else {
        if (quantified(n, implicationChars)){
          newString += "(";
          n++;
        }
        else{
          if (newString != ""){
            assignmentTemplate.push(newString);
          }
          assignmentTemplate.push("lp");
          newString = "";
          n++;
        }
      }
    }
    else if (quantified(n, implicationChars)){
      newString += implicationChars[n];
      n++;
    }
    else if (implicationChars[n] == ")"){
      if (newString != ""){
        assignmentTemplate.push(newString);
      }
      assignmentTemplate.push("rp");
      newString = "";
      n++;
    }
    else if (implicationChars[n] == "-"){
      if (newString != ""){
        assignmentTemplate.push(newString);
      }
      assignmentTemplate.push("neg");
      newString = "";
      n++;
    }
    else if (implicationChars[n] == "*"){
      if (newString != ""){
        assignmentTemplate.push(newString);
      }
      assignmentTemplate.push("and");
      newString = "";
      n++;
    }
    else if (implicationChars[n] == "V"){
      if (newString != ""){
        assignmentTemplate.push(newString);
      }
      assignmentTemplate.push("or");
      newString = "";
      n++;
    }
    else if (implicationChars[n] == "=" && implicationChars[n+1]==">"){
      if (newString != ""){
        assignmentTemplate.push(newString);
      }
      assignmentTemplate.push("cond");
      newString = "";
      n+=2;
    }
    else if (implicationChars[n] == "<"){
      if (newString != ""){
        assignmentTemplate.push(newString);
      }
      assignmentTemplate.push("bicond");
      newString = "";
      n+=3;
    }
    else if (implicationChars[n]==" "){
      n++;
    }
    else {
      newString += implicationChars[n];
      n++;
    }
  }
  if (newString != ""){
    assignmentTemplate.push(newString);
  }
  //make an array of all the strings that need assignments (no repeats!)
  var tfSlots = [];
  for (var x=0; x<assignmentTemplate.length; x++){
    if(assignmentTemplate[x]!="neg" && assignmentTemplate[x]!="and" && assignmentTemplate[x]!="or" && assignmentTemplate[x]!="lp" && assignmentTemplate[x]!="rp" && assignmentTemplate[x]!="cond" && assignmentTemplate[x]!="bicond"){
      if (!tfSlots.includes(assignmentTemplate[x])){
        tfSlots.push(assignmentTemplate[x]);
      }
    }
  }
  //go through all possible assignments and create them- so if you have the same string multiple times replace with same boolean
  var assignments = []; //array of arrays
  assignments.length = 0;
  var assignment1 = []; //arrays of strings and booleans
  var assignment2 = [];
  for (var y=0; y<assignmentTemplate.length; y++){
    if (assignmentTemplate[y] == tfSlots[0]){
      assignment1.push(true);
    }
    else {
      assignment1.push(assignmentTemplate[y]);
    }
  }
  assignments.push(assignment1);
  for (var z=0; z<assignmentTemplate.length; z++){
    if (assignmentTemplate[z] == tfSlots[0]){
      assignment2.push(false);
    }
    else {
      assignment2.push(assignmentTemplate[z]);
    }
  }
  assignments.push(assignment2);
  for(var a=1; a<tfSlots.length; a++){
    var originalLength = assignments.length
    for(var b=0; b<originalLength; b++){
       var duplicate = [...assignments[b]];
       for(var c=0; c<assignments[b].length; c++){
         if (assignments[b][c]==tfSlots[a]){
           assignments[b][c]=true;
         }
       }
      for(var d=0; d<duplicate.length; d++){
        if (duplicate[d]==tfSlots[a]){
          duplicate[d]=false;
        }
      }
      assignments.push(duplicate);
    }
  }
  //each assignment is now an array. for each of these assignments, use evaluateTF function.
  var result = true;
  //var newAssign = "";
  for(var e=0; e<assignments.length; e++){
    globalMarker = 0;
    // newAssign = "";
    // for(var f=0; f<assignments[e].length; f++){
    //   newAssign+=assignments[e][f]+ " ";
    // }
    result = evaluateTF(assignments[e]);
    if (result == false){
      for(var f=0; f<assignments[e].length; f++){
      }
      return false;
    }
  }
  //globalMarker = 0;
  assignments.length = 0;
  assignment1.length = 0;
  assignment2.length = 0;
  tfSlots.length = 0;
   //if evaluateTF function returns false any time, there is an error with the tf line. else, looks good.
   return true;
}


function isUI(citedLineNumber, lineNumber){
  var citedLine = document.getElementById('line'+citedLineNumber).value.trim();
  var currentLine = document.getElementById('line'+lineNumber).value.trim();
  var citedLineChars = getCharacters(citedLine);
  var currentLineChars = getCharacters(currentLine);
  if (citedLineChars.length < 6){
    return false;
  }
  if (citedLineChars[0]!="(" || citedLineChars[1]!="U" || citedLineChars[2]!="Q" || citedLineChars[4]!=")"){
    return false;
  }
  var varOfInst = citedLineChars[3];
  var citedLineCharsSansUQ = [];
  for (var i=5; i<citedLineChars.length; i++){
    citedLineCharsSansUQ.push(citedLineChars[i]);
  }
  var currentLineCharsPlusParen = ["("];
  for (var j=0; j<currentLineChars.length; j++){
    currentLineCharsPlusParen.push(currentLineChars[j]);
  }
  currentLineCharsPlusParen.push(")");
  var currLineCharsToCheck = [];
  if (currentLineCharsPlusParen.length == citedLineCharsSansUQ.length){
    currLineCharsToCheck = [...currentLineCharsPlusParen];
  }
  else if (currentLineChars.length == citedLineCharsSansUQ.length) {
    currLineCharsToCheck = [...currentLineChars];
  }
  else{
    return false;
  }
  //now, compare currLineCharsToCheck to citedLineCharsSansUQ. the only diff can be
  //that the var of instantiation is replaced by some other variable (which remains consistent)
  var replaceVar = "none";
  for (var k=0; k<citedLineCharsSansUQ.length; k++){
    if (citedLineCharsSansUQ[k]==varOfInst){
      if (replaceVar == "none"){
        if (currLineCharsToCheck[k] == currLineCharsToCheck[k].toUpperCase()){
          return false;
        }
        replaceVar = currLineCharsToCheck[k];
      }
      else {
        if (currLineCharsToCheck[k]!=replaceVar){
          return false;
        }
      }
    }
    else {
      if (citedLineCharsSansUQ[k] != currLineCharsToCheck[k]){
        return false;
      }
    }
  }
  if (citedLineCharsSansUQ.length>6 && (citedLineCharsSansUQ[0]=="(" && citedLineCharsSansUQ[1]=="E" && citedLineCharsSansUQ[2] == "Q" || citedLineCharsSansUQ[1]=="(" && citedLineCharsSansUQ[2]=="E" && citedLineCharsSansUQ[3] == "Q")) {
    for (var l=6; l<citedLineCharsSansUQ.length;l++){
      if (citedLineCharsSansUQ[l] == replaceVar){
        return false;
      }
    }
  }
  return true;
}


function ui(lineNumber){
  //check citation
  var citation = document.getElementById('cite'+lineNumber).value.trim();
  citedLines.length = 0;
  var i = 0;
  while(i<citation.length){
    if (citation[i]==" "){
      i++;
      continue;
    }
    else if (citation[i]=="("){
      i++;
      var currInt = "";
      while(i<citation.length && isInteger(citation[i])==true){
        currInt += citation[i];
        i++;
      }
      if (citation[i]>= citation.length || citation[i]!=")" || currInt == ""){
        return false;
      }
      else {
        i++;
        if (parseInt(currInt) < 1 || parseInt(currInt) >= lineNumber){
          return false;
        }
        citedLines.push(parseInt(currInt));
      }
    }
    else {
      return false;
    }
  }
  if (citedLines.length != 1){
    return false;
  }
  else {
    var citedLine = citedLines[0];
  }
  //check premises
  var citedPrem = document.getElementById('prem'+citedLine).value.trim();
  var currentPrem = document.getElementById('prem'+lineNumber).value.trim();
  if (citedPrem != currentPrem){
    return false;
  }
  //check line
  if(!isUI(citedLine, lineNumber)){
    return false;
  }
  return true;
}


function isEG(citedLineNumber, lineNumber){
  var citedLine = document.getElementById('line'+citedLineNumber).value.trim();
  var currentLine = document.getElementById('line'+lineNumber).value.trim();
  var citedLineChars = getCharacters(citedLine);
  var currentLineChars = getCharacters(currentLine);
  if (currentLineChars.length < 6){
    return false;
  }
  if (currentLineChars[0]!="(" || currentLineChars[1]!="E" || currentLineChars[2]!="Q" || currentLineChars[4]!=")"){
    return false;
  }
  var varOfInst = currentLineChars[3];
  var currentLineCharsSansEQ = [];
  for (var i=5; i<currentLineChars.length; i++){
    currentLineCharsSansEQ.push(currentLineChars[i]);
  }
  var citedLineCharsPlusParen = ["("];
  for (var j=0; j<citedLineChars.length; j++){
    citedLineCharsPlusParen.push(citedLineChars[j]);
  }
  citedLineCharsPlusParen.push(")");
  var citedLineCharsToCheck = [];
  if (citedLineCharsPlusParen.length == currentLineCharsSansEQ.length){
    citedLineCharsToCheck = [...citedLineCharsPlusParen];
  }
  else if (citedLineChars.length == currentLineCharsSansEQ.length) {
    citedLineCharsToCheck = [...citedLineChars];
  }
  else{
    return false;
  }
  var replaceVar = "none";
  for (var k=0; k<currentLineCharsSansEQ.length; k++){
    if (currentLineCharsSansEQ[k]==varOfInst){
      if (replaceVar == "none"){
        if (citedLineCharsToCheck[k] == citedLineCharsToCheck[k].toUpperCase()){
          return false;
        }
        replaceVar = citedLineCharsToCheck[k];
      }
      else {
        if (citedLineCharsToCheck[k]!=replaceVar){
          return false;
        }
      }
    }
    else {
      if (currentLineCharsSansEQ[k] != citedLineCharsToCheck[k]){
        return false;
      }
    }
  }
  return true;
}


function eg(lineNumber){
  //check citation
  var citation = document.getElementById('cite'+lineNumber).value.trim();
  citedLines.length = 0;
  var i = 0;
  while(i<citation.length){
    if (citation[i]==" "){
      i++;
      continue;
    }
    else if (citation[i]=="("){
      i++;
      var currInt = "";
      while(i<citation.length && isInteger(citation[i])==true){
        currInt += citation[i];
        i++;
      }
      if (citation[i]>= citation.length || citation[i]!=")" || currInt == ""){
        return false;
      }
      else {
        i++;
        if (parseInt(currInt) < 1 || parseInt(currInt) >= lineNumber){
          return false;
        }
        citedLines.push(parseInt(currInt));
      }
    }
    else {
      return false;
    }
  }
  if (citedLines.length != 1){
    return false;
  }
  else {
    var citedLine = citedLines[0];
  }
  //check premises
  var citedPrem = document.getElementById('prem'+citedLine).value.trim();
  var currentPrem = document.getElementById('prem'+lineNumber).value.trim();
  if (citedPrem != currentPrem){
    return false;
  }
  //check line
  if(!isEG(citedLine, lineNumber)){
    return false;
  }
  return true;
}


function isFree(varOfInst, lineNumber){
  var line = document.getElementById('line'+lineNumber).value.trim();
  var lineChars = getCharacters(line);
  var isBound = false;
  var parenCount = 0;
  for (var i = 0; i < lineChars.length; i++){
    if (lineChars[i] == varOfInst){
      if (i-2 > 0 && (lineChars[i-2] == "E" || lineChars[i-2] == "U") && lineChars[i-1] == "Q"){
        isBound = true;
        continue;
      }
      else if (isBound == false){
        return true;
      }
    }
    else if (lineChars[i] == "(" && isBound == true){
      if (i+2 >= lineChars.length || lineChars[i+2]!="Q"){
        parenCount += 1;
      }
    }
    else if (lineChars[i] == ")" && isBound == true){
      if (i-2<0 || lineChars[i-2]!="Q"){
        parenCount -= 1;
        if (parenCount == 0) {
          isBound = false;
        }
      }
    }
    else if (i+1 < lineChars.length && lineChars[i] == "=" && lineChars[i+1] == ">" && isBound == true){
      if (parenCount == 0){
        isBound = false;
      }
    }
    else if (i+2 < lineChars.length && lineChars[i] == "<" && lineChars[i+1] == "=" && lineChars[i+2] == ">" && isBound == true){
      if (parenCount == 0){
        isBound = false;
      }
    }
  }
  return false;
}


function isFreeSubline(varOfInst, sublineChars){
  var lineChars = sublineChars;
  var isBound = false;
  var parenCount = 0;
  for (var i = 0; i < lineChars.length; i++){
    if (lineChars[i] == varOfInst){
      if (i-2 > 0 && (lineChars[i-2] == "E" || lineChars[i-2] == "U") && lineChars[i-1] == "Q"){
        isBound = true;
        continue;
      }
      else if (isBound == false){
        return true;
      }
    }
    else if (lineChars[i] == "(" && isBound == true){
      if (i+2 >= lineChars.length || lineChars[i+2]!="Q"){
        parenCount += 1;
      }
    }
    else if (lineChars[i] == ")" && isBound == true){
      if (i-2<0 || lineChars[i-2]!="Q"){
        parenCount -= 1;
        if (parenCount == 0) {
          isBound = false;
        }
      }
    }
    else if (i+1 < lineChars.length && lineChars[i] == "=" && lineChars[i+1] == ">" && isBound == true){
      if (parenCount == 0){
        isBound = false;
      }
    }
    else if (i+2 < lineChars.length && lineChars[i] == "<" && lineChars[i+1] == "=" && lineChars[i+2] == ">" && isBound == true){
      if (parenCount == 0){
        isBound = false;
      }
    }
  }
  return false;
}


//Question: does an instance require that every copy of a variable is replaced by the replace variable?
function isEII(citedLineNumber, lineNumber, replaceVar){
  var citedLine = document.getElementById('line'+citedLineNumber).value.trim();
  var currentLine = document.getElementById('line'+lineNumber).value.trim();
  var citedLineChars = getCharacters(citedLine);
  var currentLineChars = getCharacters(currentLine);
  if (citedLineChars.length < 6){
    return false;
  }
  if (citedLineChars[0]!="(" || citedLineChars[1]!="E" || citedLineChars[2]!="Q" || citedLineChars[4]!=")"){
    return false;
  }
  var varOfInst = citedLineChars[3];
  var citedLineCharsSansUQ = [];
  for (var i=5; i<citedLineChars.length; i++){
    citedLineCharsSansUQ.push(citedLineChars[i]);
  }
  var currentLineCharsPlusParen = ["("];
  for (var j=0; j<currentLineChars.length; j++){
    currentLineCharsPlusParen.push(currentLineChars[j]);
  }
  currentLineCharsPlusParen.push(")");
  var currLineCharsToCheck = [];
  if (currentLineCharsPlusParen.length == citedLineCharsSansUQ.length){
    currLineCharsToCheck = [...currentLineCharsPlusParen];
  }
  else if (currentLineChars.length == citedLineCharsSansUQ.length) {
    currLineCharsToCheck = [...currentLineChars];
  }
  else{
    return false;
  }
  //now, compare currLineCharsToCheck to citedLineCharsSansUQ. the only diff must be
  //that the var of instantiation is replaced by the replaceVar
  for (var k=0; k<citedLineCharsSansUQ.length; k++){
    if (citedLineCharsSansUQ[k]==varOfInst){
      if (currLineCharsToCheck[k]!=replaceVar){
        return false;
      }
    }
    else {
      if (citedLineCharsSansUQ[k] != currLineCharsToCheck[k]){
        return false;
      }
    }
  }
  return true;
}


function eii(lineNumber){
  //check citation form (m)u
  var citation = document.getElementById('cite'+lineNumber).value.trim();
  var citationChars = getCharacters(citation);
  if (citationChars.length < 4 || citationChars[0]!="("){
    return false;
  }
  var i = 1;
  var citedLineNumberString = "";
  while (citationChars.length > i && isInteger(citationChars[i])){
    citedLineNumberString += citationChars[i];
    i++;
  }
  if (i==1){
    return false;
  }
  var citedLineNumber = parseInt(citedLineNumberString);
  if (i+2!=citationChars.length || citationChars[i]!=")" || citationChars[i+1].toUpperCase() == citationChars[i+1]){
    return false;
  }
  if (citedLineNumber < 1 || citedLineNumber >= lineNumber){
    return false;
  }
  var varOfInst = citationChars[i+1];
  //check that instantial variable is not free in any line up to and including line m
  for (var k = 1; k<=citedLineNumber; k++){
    if (isFree(varOfInst, k)){
      return false;
    }
  }
  //check that premises are those of line (m) + current line number
  var citedPrem = getPremises(citedLineNumber);
  var currentPrem = getPremises(lineNumber);
  var currentPremShouldBe = [...citedPrem];
  currentPremShouldBe.push(lineNumber);
  currentPrem = currentPrem.sort();
  currentPremShouldBe = currentPremShouldBe.sort();
  if (currentPrem.length != currentPremShouldBe.length){
    return false;
  }
  for (var j = 0; j < currentPrem.length; j++){
    if (currentPrem[j]!=currentPremShouldBe[j]){
      return false;
    }
  }
  //check that new line is instance of schema on line m (similar to UI check but replacevar is already decided)
  if (!isEII(citedLineNumber, lineNumber, varOfInst)){
    return false;
  }
  return true;
}


function eie(lineNumber){
  var citation = document.getElementById('cite'+lineNumber).value.trim();
  var premises = document.getElementById('prem'+lineNumber).value.trim();
  var currentLine = document.getElementById('line'+lineNumber).value.trim();
  //check citation
  var squareBracketString = "";
  var parenString = "";
  if (citation.length == 0 || citation.charAt(0)!="["){
    return false;
  }
  var i = 1;
  while (i<citation.length && citation.charAt(i)!="]"){
     if (isInteger(citation.charAt(i))==false) {
       return false;
     }
     else {
       squareBracketString += citation.charAt(i);
       i++;
     }
  }
  if (i>=citation.length){
     return false;
  }
  else if (squareBracketString == "") {
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
      parenString += citation.charAt(i);
      i++;
    }
  }
  i++;
  if (i<citation.length || parenString == ""){
    return false;
  }
  //now know citation format is good. just need to check if numbers are appropriate.
  var citedLineNumber = parseInt(parenString);
  var citedRemovedPremNumber = parseInt(squareBracketString);
  if (citedLineNumber >= lineNumber || citedRemovedPremNumber >= lineNumber
    || citedLineNumber < 1 || citedRemovedPremNumber <1){
    return false;
  }
  //check that rule of citedRemovedPremNumber line is EII
  if (rule(citedRemovedPremNumber)!="EII") {
    return false;
  }
  //premises must be the same as those of citedLineNumber minus those of citedRemovedPremNumber
  var premises = getPremises(lineNumber);
  var citedLinePrem = getPremises(citedLineNumber.toString());
  var combinedPrem = premises.concat([citedRemovedPremNumber.toString()]);

  //compare premises to combined prem.
  citedLinePrem = citedLinePrem.sort();
  combinedPrem = combinedPrem.sort();
  if (citedLinePrem.length != combinedPrem.length){
    return false;
  }
  for (var k = 0; k<citedLinePrem.length; k++){
    if (citedLinePrem[k] != combinedPrem[k]){
      return false;
    }
  }
  //check if new line is same as line m
  var citedLine = document.getElementById('line'+citedLineNumber).value.trim();
  var citedLineChars = getCharacters(citedLine);
  var currentLineChars = getCharacters(currentLine);
  if (citedLineChars.length != currentLineChars.length){
    return false;
  }
  for (var l = 0; l<currentLineChars.length; l++){
    if (currentLineChars[l]!=citedLineChars[l]){
      return false;
    }
  }
  //check that the variable flagged doesn't occur free in schema on line m
  var flaggedVar = "None";
  var eiiCitation = document.getElementById('cite'+citedRemovedPremNumber).value.trim();
  var eiiCitationChars = getCharacters(eiiCitation);
  flaggedVar = eiiCitation[eiiCitationChars.length-1];
  if (isFree(flaggedVar, citedLineNumber)){
    return false;
  }
  //or in any premise of m aside from j (any prem of this line)
  for (var m=0; m<premises.length; m++){
    if (isFree(flaggedVar, premises[m])){
      return false;
    }
  }
  return true;
}


function isBasicUG(citedLineNumber, lineNumber){
  var citedLine = document.getElementById('line'+citedLineNumber).value.trim();
  var currentLine = document.getElementById('line'+lineNumber).value.trim();
  var citedLineChars = getCharacters(citedLine);
  var currentLineChars = getCharacters(currentLine);
  if (currentLineChars.length < 6){
    return false;
  }
  if (currentLineChars[0]!="(" || currentLineChars[1]!="U" || currentLineChars[2]!="Q" || currentLineChars[4]!=")"){
    return false;
  }
  var varOfInst = currentLineChars[3];
  var currentLineCharsSansUQ = [];
  for (var i=5; i<currentLineChars.length; i++){
    currentLineCharsSansUQ.push(currentLineChars[i]);
  }
  var citedLineCharsPlusParen = ["("];
  for (var j=0; j<citedLineChars.length; j++){
    citedLineCharsPlusParen.push(citedLineChars[j]);
  }
  citedLineCharsPlusParen.push(")");
  var citedLineCharsToCheck = [];
  if (citedLineCharsPlusParen.length == currentLineCharsSansUQ.length){
    citedLineCharsToCheck = [...citedLineCharsPlusParen];
  }
  else if (citedLineChars.length == currentLineCharsSansUQ.length) {
    citedLineCharsToCheck = [...citedLineChars];
  }
  else{
    return false;
  }
  var replaceVar = "none";
  for (var k=0; k<currentLineCharsSansUQ.length; k++){
    if (currentLineCharsSansUQ[k]==varOfInst){
      if (replaceVar == "none"){
        if (citedLineCharsToCheck[k] == citedLineCharsToCheck[k].toUpperCase()){
          return false;
        }
        replaceVar = citedLineCharsToCheck[k];
      }
      else {
        if (citedLineCharsToCheck[k]!=replaceVar){
          return false;
        }
      }
    }
    else {
      if (currentLineCharsSansUQ[k] != citedLineCharsToCheck[k]){
        return false;
      }
    }
  }
  //replace var must not be free in any premise of citedLineNumber
  // citedPrem = getPremises(citedLineNumber);
  // for (var l=0; l<citedPrem.length; l++){
  //   if (isFree(replaceVar, citedPrem[l])){
  //     return false;
  //   }
  // }
  return true;
}



function isLiberalizedUG(citedLineNumber, currentLineNumber){
  return false;
}


function ug(lineNumber){
  //check citation format: (m)
  var citation = document.getElementById('cite'+lineNumber).value.trim();
  citedLines.length = 0;
  var i = 0;
  while(i<citation.length){
    if (citation[i]==" "){
      i++;
      continue;
    }
    else if (citation[i]=="("){
      i++;
      var currInt = "";
      while(i<citation.length && isInteger(citation[i])==true){
        currInt += citation[i];
        i++;
      }
      if (citation[i]>= citation.length || citation[i]!=")" || currInt == ""){
        return false;
      }
      else {
        i++;
        if (parseInt(currInt) < 1 || parseInt(currInt) >= lineNumber){
          return false;
        }
        citedLines.push(parseInt(currInt));
      }
    }
    else {
      return false;
    }
  }
  if (citedLines.length != 1){
    return false;
  }
  //get citedLine from citation
  else {
    var citedLine = citedLines[0];
  }
  //check premises: same as those of citedLine
  var citedPrem = document.getElementById('prem'+citedLine).value.trim();
  var currentPrem = document.getElementById('prem'+lineNumber).value.trim();
  if (citedPrem != currentPrem){
    return false;
  }
  //check if is basic ug
  if (isBasicUG(citedLine, lineNumber)){
    return true;
  }
  //if not, check if is liberalized ug
  else if (isLiberalizedUG(citedLine, lineNumber)) {
    return true;
  }
  else {
    return false;
  }
}


function ruleThree(lineNumber){
  var citation = document.getElementById('cite'+lineNumber).value.trim();
  if (citation != ""){
    return false;
  }
  var premises = document.getElementById('prem'+lineNumber).value.trim();
  if (premises != ""){
    return false;
  }
  //check that schema is of form u=v=>(R<=>S)
  var line = document.getElementById('line'+lineNumber).value.trim();
  var lineChars = getCharacters(line);
  if (lineChars.length<12){
    return false;
  }
  if (lineChars[0].toUpperCase()==lineChars[0]){
    return false;
  }
  else{
    var u = lineChars[0];
  }
  if (lineChars[1]!="="){
    return false;
  }
  if (lineChars[2].toUpperCase()==lineChars[2]){
    return false;
  }
  else{
    var v = lineChars[2];
  }
  if (lineChars[3]!="="){
    return false;
  }
  if (lineChars[4]!=">"){
    return false;
  }
  if (lineChars[5]!="("){
    return false;
  }
  var i = 6;
  //compare R and S- same but R has free u at some places where S has free v
  var r = [];
  while (i<lineChars.length && lineChars[i]!="<"){
    if (lineChars[i]!= " "){
      r.push(lineChars[i]);
    }
    i++;
  }
  if (lineChars[i] != "<") {
    return false;
  }
  i++;
  if (lineChars[i] != "="){
    return false;
  }
  i++;
  if (lineChars[i] != ">"){
    return false;
  }
  i++;
  var s = [];
  while (i<lineChars.length-1){
    if (lineChars[i]!= " "){
      s.push(lineChars[i]);
    }
    i++;
  }
  if (lineChars[i]!= ")"){
    return false;
  }
  if (r.length != s.length){
    return false;
  }
  for (var j = 0; j< r.length; j++){
    if (r[j] != u){
      if (r[j] != s[j]){
        return false;
      }
    }
    else {
      if (isFreeSubline(u, r)){
        if (!isFreeSubline(v, s)){
          return false;
        }
      }
      else {
        if (r[j]!=s[j]){
          return false;
        }
      }
    }
  }
  return true;
}


/*
check function
Description: called when check button is pressed. Loops through each row and
             checks if its line is a schema and if the rule selected works. A popup
             will come up and give either an error message or confirm that everything
             looks good.
Parameters: none
Returns: none
Potential issues: does not say how the error came about. Talk to Prof. Sehon to
see if he would like this feature. parentheses issues.
*/
function check() {
  var noIssues = true;
  for(var i=1; i<16; i++){
    if (isSchema(i)==false){
      window.alert("Something is wrong.");
      window.alert("here")
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
    else if (rule(i)=="TF"){
      noIssues = tf(i);
      if (noIssues == false){
        window.alert("Something is wrong.");
        break;
      }
    }
    else if (rule(i)=="UI"){
      noIssues = ui(i);
      if (noIssues == false){
        window.alert("Something is wrong.");
        break;
      }
    }
    else if (rule(i)=="EG"){
      noIssues = eg(i);
      if (noIssues == false){
        window.alert("Something is wrong.");
        break;
      }
    }
    else if (rule(i)=="EII"){
      noIssues = eii(i);
      if (noIssues == false){
        window.alert("Something is wrong.");
        break;
      }
    }
    else if (rule(i)=="EIE"){
      noIssues = eie(i);
      if (noIssues == false){
        window.alert("Something is wrong.");
        break;
      }
    }
    else if (rule(i)=="UG"){
      noIssues = ug(i);
      if (noIssues == false){
        window.alert("Something is wrong.");
        break;
      }
    }
    else if (rule(i)=="III"){
      noIssues = ruleThree(i);
      if (noIssues == false){
        window.alert("Something is wrong.");
        break;
      }
    }
  }
  if (noIssues){
      window.alert("Looks good!");
  }
  tokens.length = 0;
  schema_error = false;
  globalTP = 0;
}
