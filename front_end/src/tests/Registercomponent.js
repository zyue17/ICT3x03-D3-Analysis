export const register = (email,phone,fullname,address,username,password,confirmpassword) => {
var numbers = /^[0-9]+$/;
var emailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
if(email.length == 0){
	return "Fields should not be empty";
}
else if (!email.match(emailformat)){
	return "Please enter an valid email address"
}
else if (!phone.match(numbers)){
	return "Please input only numbers"
}
else if (fullname.match(numbers)){
	return "Please do not enter numbers in your full name"
}
else if (username == "jy"){
	return "This username has been taken";
}
else if (password.length <8 || password.length >15){
	return "Password should not be less than 8 characters and more than 15 characters"
}
else if (password != confirmpassword){
	return "Password mismatched"
}
else
	return "Registered Successfully"
}


