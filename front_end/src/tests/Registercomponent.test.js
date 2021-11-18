import {register} from '../tests/Registercomponent.js';

console.log("Email validation for register");
test('register', () => {
	expect(register("","6597231321","John Toh","ang mo kio street 25","jyn","123456789","123456789")).toBe("Fields should not be empty");
	expect(register("jy.com","6597231321","John Toh","ang mo kio street 25","jyn","123456789","123456789")).toBe("Please enter an valid email address");
});

console.log("Phone validation for register");
test('register', () => {
	expect(register("jy@gmail.com","asdjk123","John Toh","ang mo kio street 25","jyn","123456789","123456789")).toBe("Please input only numbers");
});

console.log("Full name validation for register");
test('register', () => {
	expect(register("jy@gmail.com","6597231321","123","ang mo kio street 25","jyn","123456789","123456789")).toBe("Please do not enter numbers in your full name");
});

console.log("Username validation for register");
test('register', () => {
	expect(register("jy@gmail.com","6597231321","John Toh","ang mo kio street 25","jy","123456789","123456789")).toBe("This username has been taken");
});

console.log("password validation for register");
test('register', () => {
	expect(register("jy@gmail.com","6597231321","John Toh","ang mo kio street 25","jyn","Abc1234","Abc1234")).toBe("Password should not be less than 8 characters and more than 15 characters");
	expect(register("jy@gmail.com","6597231321","John Toh","ang mo kio street 25","jyn","Abc1234%","abc12345")).toBe("Password mismatched");
});

console.log("Proper registration");
test('register', () => {
	expect(register("jy@gmail.com","6597231321","John Toh","ang mo kio street 25","jyn","Abc1234%","Abc1234%")).toBe("Registered Successfully");
});