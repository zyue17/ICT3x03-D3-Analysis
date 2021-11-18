import {TwoFA, login} from '../tests/Logincomponent.js';

console.log("Input Validation and Sanitization to prevent SQL injection check 1");
test('login', () => {
	expect(login("user","")).toBe("Fields should not be empty");
	expect(login("","123456789")).toBe("Fields should not be empty");
	
});

console.log("Input Validation and Sanitization to prevent SQL injection check 2");
test('login', () => {
	expect(login("user","1234567")).toBe("Password should not be less than 8 characters and more than 15 characters");
	expect(login("user","1234567890123456")).toBe("Password should not be less than 8 characters and more than 15 characters");
	
});

console.log("Input Validation and Sanitization to prevent SQL injection check 3");
test('login', () => {
	expect(login("user","'OR '1'='1' --")).toBe("Unsuccessful Login");
	expect(login("'administrator'--'","'OR '1'='1' --")).toBe("Unsuccessful Login");
	
});

console.log("Proper login test");
test('login', () => {
	expect(login("user","Abcd1234%")).toBe("True");
	
});

console.log("TwoFA Validation check");
test('TwoFA', () => {
	expect(TwoFA("A42d")).toBe("Unsuccessful");
	expect(TwoFA("1234567")).toBe("Unsuccessful");
});

console.log("Proper TwoFA test");
test('TwoFA', () => {
	expect(TwoFA("A42d6J")).toBe("True");
});