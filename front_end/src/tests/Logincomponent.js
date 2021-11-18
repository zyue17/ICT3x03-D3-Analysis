export const login = (x,y) => {
if(y.length == 0 || x.length ==0){
	return "Fields should not be empty";
}
else if (y.length <8 || y.length >15){
	return "Password should not be less than 8 characters and more than 15 characters"
}
else if (y=="'OR '1'='1' --" || x =="'administrator'--'"){
	return "Unsuccessful Login";
}
else
	return "True"
}


export const TwoFA = (x) => {
if(x.length ==0){
	return "Fields should not be empty";
}
else if(x.length >0 && x.length <6){
	return "Unsuccessful";
}

else if(x.length >6){
	return "Unsuccessful";
}
else
	return "True"
}