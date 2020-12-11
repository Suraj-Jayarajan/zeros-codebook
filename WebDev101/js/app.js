/* 
************************************************************************************
    NOTE: JS BLUEPRINT
    - JS deceptively looks like other programming languages
    - Objects: are not OOP based, they are just collection of key value pairs 
        (Associative Arrays) where value is a JS data type
    - Whenever a js code runs JS engine creates an excution context at a global 
        context, this contains two things by default
        - Global Obj (Global means not attached to any function)
        - this
        -------------------------------------------------------------
        |   Excecution Context                                      |
        |   -------------------------     -----------------------   |
        |   |  Global Object        |     |     this            |   |
        |   | (for browser window)  |     |                     |   |
        |   |_______________________|     |_____________________|   |
        |___________________________________________________________|
    
************************************************************************************
*/



//== COMMENTS ====================================================================//

// Single Line Comment
/**
 * Block Comments
 */

//==/COMMENTS ====================================================================//



//== OUTPUTS =====================================================================//
// On Console
console.log('Abra Kadabra!');
console.info('Hello World!');
console.warn('Hello World!');
console.error('Hello World!');

// On Document
document.write('Hello World!');

// On Browser
alert('Hi');
//==/OUTPUTS =====================================================================//



//== DATA TYPES AND VARIABLES ====================================================//
/**
 * JS is a dynamically typed language, meaning that there exist data types, 
 * but variables are not bound to any of them.
**/


// Data types
let u = undefined;
let n = null;
let b = true; // Boolean
let i = 0.00; // Number
let s = "xy"; // String
let arr = [0,'1','Sgds']; // arrays
let obj = {
    key1: 'val1',
    key2: 'val2',
};
let fun = function(){
    return 'yes';
}
var v = 'global';
const CONST_VAR = 3.0;


// Implicit Type conversion (String>Number>Boolean)
console.log('string + number',typeof(s+i)); // string + number = string
console.log('string + boolean',typeof(s+b)); // string + boolean = string
console.log('number + boolean',typeof(i+b)); // number + boolean = number

// Explicit Type Conversion
let toString = String(3.02); // number to string
let toBoolean = Boolean(1);
let toNum = Number('54');
let toStr = (53).toString();


// Arithemetical Operators: +,-,*,/,%,=
// Logical Operators: >,<,>=,<=,==,===,!,!=,!==,
// shorthand operators: +=,-=,*=,/=,x++,x--,++x,--x,

//==/DATA TYPES AND VARIABLES ====================================================//



//== INPUTS ======================================================================//
// On Browser
let isYes = confirm('Is it true?');
let ans = prompt('What is your name');

// On Document  
let input = document.querySelector('input[name="username"]').value;
//==/INPUTS ======================================================================//



//== CONDITIONAL LOGIC ===========================================================//
if(isYes){
    alert('Yes');
}
else{
    alert('No');
}


switch(ans){
    case 'Suraj':
        alert('Sounds like a unoticable name');
        break;
    case 'Ashish':
        alert('Too Common');
        break;
     default:
         alert('dumb');
         break;
}
//== /CONDITIONAL LOGIC ==========================================================//



//== LOOPS =======================================================================// 
// do-while
i = 0;
do{
    document.write(' '+i);
    i++;
}while(i<10);
document.write('<br>    ');

// while
i=0;
while(i<10){
    document.write(' '+i);
    i++;
}
document.write('<br>    ');

// for
for(let i=0;i<10;i++){
    document.write(' '+i);
}

// for in
for(let i in arr){
    console.log('>>For in',i,arr[i]);
}

for(let o in obj){
    console.log('>>For in',i,obj[o]);
}


// for of
arr = ['A','B','C','D'];
for(let i of arr){
    console.log('>>For of',i);
}

for(let o of Object.keys(obj)){
    console.log('>>For of',obj[o]);
}
//== /LOOPS ======================================================================// 



//== FUNCTIONS ===================================================================//
function newMethod(par1,par2,par3=0){
    return par1 + par2 + par3;
}

console.log('>>fn', newMethod(1,3));
//== /FUNCTIONS ==================================================================//



//== OBJECTS =====================================================================//
let obj0 = {
    var1 : 10,
    var2 : 'NEEW',
    var3 : ['a','b','c'],
    var4 : function(){
        return true;
    }
}

console.log(obj0.var3)
//==/OBJECTS =====================================================================//



//== OOPS ========================================================================//
/**
 * JavaScript has no formal support for classes, hences it achieves OOP by using 
 * associative arrays, which are Objects
 *********************************************************************************/



/** 
 *  METHOD 1: FUNCTION AS A CLASS
 *  Constructor Pattern(Function as a class): Function as returns an object, 
 *  objects can be initialized by using new keyword. Parameters can also be 
 *  passed to act as initial values.
 */
function Fruit(name=null){
    return {
        name: name,
        color: null,
        nutrition: null,
        isRotten: false,
    }
}

let apple = new Fruit('Apple');
console.log('>>Fn Obj', apple);  



/**
 * METHOD 2: OBJECT PATTERN
 */
let Vegitable = new Object({
    name: null,
    color: null,
    nutrition: null,
    isRotten: false,
});

let carrot = Object.create(Vegitable);
//carrot.name = 'Carrot';
console.log('>>Obj', carrot);  


// NO PROPER INHERITANCE

//==/OOPS ========================================================================//
