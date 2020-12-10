/* 
************************************************************************************
    NOTE: JS BLUEPRINT
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
