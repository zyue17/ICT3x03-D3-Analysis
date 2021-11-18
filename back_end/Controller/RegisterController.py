import uvicorn
from fastapi import FastAPI, Request
import smtplib
import string
import random
from fastapi import APIRouter
#from back_end import apiconfig
import json
from itsdangerous import URLSafeSerializer  # cryptographic
import os
from twilio.rest import Client
import mysql.connector
import time
from datetime import datetime
# routing files
import apiconfig
from apscheduler.schedulers.background import BackgroundScheduler
from cryptography.fernet import Fernet
# encryption libraries
import base64
from base64 import b64encode
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


RegisterRouter = APIRouter()
# Initializing DB
mydb = mysql.connector.connect(
    host=apiconfig.sqlhost,
    user=apiconfig.sqluser,
    password=apiconfig.sqlpassword,
    database=apiconfig.database
)
# Cursor that enables execution of prepared statements
mycursor = mydb.cursor(prepared=True)
# Initializing cryptographic
auth_s = URLSafeSerializer(apiconfig.symmetrickey, "auth")

sched = BackgroundScheduler()
sched.start()


########################################ALL REGISTER FUNCTION AND CLASSES ##################################
class otp:
    def __init__(self, randomtop):
        self.randomtop = randomtop

    def savingrandomotp(self, randomtop):
        self.randomtop = randomtop

    def checkingrandomotp(self, Usercode):
        if self.randomtop == Usercode:
            return True
        else:
            return False


dualotp = otp("")


def salt_encryption(password, customerID):
    salt = os.urandom(16)
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    salt = b64encode(salt)
    salt = salt.decode('utf-8')
    key = kdf.derive(password.encode())
    # print(key)
    encodedkey = base64.urlsafe_b64encode(key)
    # decodedkey=(base64.urlsafe_b64decode(encodedkey))
    # print(decodedkey)
    # print("LOOKLOOK")
   # salt= salt.encode('utf-8')
    salt = bytes(salt, 'utf-8')
    #salt = b64encode(bytes(salt, 'utf-8'))
    salt = base64.b64decode(salt)
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    salt = b64encode(salt).decode('utf-8')
    # Parameterized queries
    stmt = """INSERT into Salt(Salt,CustomerID) VALUES (%s, %s)"""
    mycursor.execute(stmt, (salt, str(customerID)))

    return encodedkey

    # key = base64.urlsafe_b64encode(kdf.derive(token.encode()))
    # f = Fernet(key)
    # dataToken = f.encrypt(json.dumps(Data).encode())
    # print(dataToken)
    # print(f.decrypt(dataToken))


# END OF REGISTER FUNCTION AND CLASSES########################33
@RegisterRouter.post("/")
async def main():
    return {
        "message": "Main"
    }


def emailtimer(customerid):
    # Parameterized query
    stmt = """Update TwoFA SET Email= '0' WHERE CustomerID = %s"""
    mycursor.execute(stmt, (str(customerid), ))
    mydb.commit()
    sched.remove_job("emailcounter")


def smstimer(customerid):
    # Parameterized query
    stmt = """Update TwoFA SET SMS= '0' WHERE CustomerID = %s"""
    mycursor.execute(stmt, (str(customerid), ))
    mydb.commit()
    sched.remove_job("smscounter")


@RegisterRouter.post("/check_email")
async def check_username(request: Request):
    data = await request.json()
    # this is to select the verified customer and place it into 2FA table
    # Parameterized query
    stmt = """SELECT Email FROM Vanguard.Customer where Email = %s"""
    mycursor.execute(stmt, (data['Email'], ))
    myresult = mycursor.fetchall()
    mydb.commit()

    if (len(myresult) == 0):
        return {"message": "Success"}
    else:
        return {"message": "Name is taken"}


@RegisterRouter.post("/check_phonenumber")
async def check_username(request: Request):
    data = await request.json()
    # this is to select the verified customer and place it into 2FA table
    # Parameterized query
    stmt = """SELECT Phone FROM Vanguard.Customer where Phone='+65' %s"""
    mycursor.execute(stmt, (str(data['PhoneNumber']), ))
    # mycursor.execute(
    #     "SELECT Phone FROM Vanguard.Customer where Phone='+65" + str(data['PhoneNumber']) + "'")
    myresult = mycursor.fetchall()
    mydb.commit()

    if (len(myresult) == 0):
        return {"message": "Success"}
    else:
        return {"message": "Name is taken"}


@RegisterRouter.post("/check_username")
async def check_username(request: Request):
    data = await request.json()
    # this is to select the verified customer and place it into 2FA table
    # Parameterized query
    stmt = """SELECT Username FROM Vanguard.Customer where Username = %s"""
    mycursor.execute(stmt, (data['Username'], ))
    myresult = mycursor.fetchall()
    mydb.commit()

    stmt = """SELECT AdminUsername FROM Vanguard.Admintable where AdminUsername = %s"""
    mycursor.execute(stmt, (data['Username'], ))
    myadminresult = mycursor.fetchall()
    mydb.commit()
    if (len(myresult) == 0 and len(myadminresult)==0):
        return {"message": "Success"}
    else:
        return {"message": "Name is taken"}


@RegisterRouter.post("/register")
async def register_customer(request: Request):
    data = await request.json()
    data['Phone'] = str(data['Phone'])

    # process : create customer insertation > select customer ID with   create 2FA with customer ID (FK)
    # this is to insert verified customer
    # Parameterized query
    stmt = """INSERT into Customer(CustName,Address,Email,Phone,Gender,Username) VALUES (%s, %s, %s, %s, %s, %s)"""
    mycursor.execute(stmt, (data['Fullname'], data['Address'], data['Email'],
                     "+65"+data['Phone'], data['Gender'], data['Username']))

    # mycursor.execute("INSERT into Customer(CustName,Address,Email,Phone,Gender,Username) VALUES ('" + data[
    #     'Fullname'] + "','" + data['Address'] + "','" + data['Email'] + "','+65" + data['Phone'] + "','" + data[
    #                      'Gender'] + "','" + data['Username'] + "')")
    mydb.commit()

    ############## NEED THE CUSTOMER ID SO HAVE TO CREATE FIRST WITHOUT PASSWORD INSERTED ###################
    ############# THIS IS TO KEEP THINGS INTERNAL SO ITS NOT LEAKED OUT ##############################
    # Parameterized query
    stmt = """SELECT CustomerID FROM Vanguard.Customer where Username = %s"""
    mycursor.execute(stmt, (data['Username'], ))
    myresult = mycursor.fetchall()
    mydb.commit()

    if(myresult):
        customeridinTUPLE = myresult.pop()
        customerid = customeridinTUPLE[0]
        customerid = str(customerid)
        salted_password = salt_encryption(data['Password'], customerid)
        salted_password = salted_password.decode("utf-8")

        ############################## UPDATE THE PASSWORD WITH SALTED PASSWORD######################
        # Parameterized query
        stmt = """Update Customer SET CustPassword = %s WHERE CustomerID = %s"""
        mycursor.execute(stmt, (salted_password, str(customerid)))
        mydb.commit()

        # this is to select the verified customer and place it into 2FA table
        # Parameterized query
        stmt = """SELECT CustomerID FROM Vanguard.Customer where Username = %s"""
        mycursor.execute(stmt, (data['Username'], ))
        myresult = mycursor.fetchall()
        mydb.commit()

        customeridinTUPLE = myresult.pop()
        customerid = customeridinTUPLE[0]
        customerid = str(customerid)

        # Insertion into 2FA table
        # Parameterized query
        stmt = """INSERT into TwoFA(Choice,SMS,Email,CustomerID) VALUES (%s, %s, %s, %s)"""
        mycursor.execute(stmt, (data['Preferences'], "0", "0", customerid))
        # mycursor.execute("INSERT into TwoFA(Choice,SMS,Email,CustomerID) VALUES ('" + data[
        #     'Preferences'] + "',0,0,'" + customerid + "')")
        mydb.commit()

        return {"message": "Success"
                }
    else:
        return {"message" : "Fail"}


####################################################start of register EMAIL######################################
@RegisterRouter.post('/send_register_email')
async def send_register_email(request: Request):
    data = await request.json()
    # EMAIL
    S = 6  # number of characters in the string.
    # call random.choices() string module to find the string in Uppercase + numeric data.
    randomotpemails = ''.join(random.choices(
        string.ascii_uppercase + string.digits, k=S))
    randomotpemail = str(randomotpemails)
    print("The randomly generated string is : " +
          randomotpemail)  # print the random data
    try:
        # Create your SMTP session
        smtp = smtplib.SMTP('smtp.gmail.com', 587)

        # Use TLS to add security
        smtp.starttls()

        # User Authentication (WHERE TO HIDE THIS?????????????????????????????????????????????)
        smtp.login(apiconfig.email, apiconfig.emailpassword)

        # Defining The Message
        message = "Your code is \n" + randomotpemail + \
                  "\ncode will expire in 3minutes"

        # Sending the Email
        smtp.sendmail(apiconfig.email, data['Email'], message)

        # Terminating the session
        smtp.quit()
        dualotp.savingrandomotp(randomotpemail)
    except Exception as ex:
        return {"message": "Something went wrong...."}
    return {"message": "Success"}


@RegisterRouter.post('/verifyemail')
async def verify_email(request: Request):
    data = await request.json()

    results = dualotp.checkingrandomotp(data["EmailCode"])
    if (results):
        return {"message": "Success"}
    else:
        return {"message": "no"}


####################################################start of register PHONE######################################
@RegisterRouter.post('/send_register_phone')
async def send_register_phone(request: Request):
    data = await request.json()
    S = 6  # number of characters in the string.
    randomotpsms = ''.join(random.choices(
        string.ascii_uppercase + string.digits, k=S))
    randomotpsms = str(randomotpsms)
    print("The randomly generated string for SMS is : " +
          randomotpsms)  # print the random data
    client = Client(apiconfig.twiliosid, apiconfig.twiliotoken)

    message = client.messages \
        .create(
            body="Hi, your OTP code is  " + randomotpsms + ". code will expire in 3minutes",
            from_=apiconfig.twiliophonenumber,
            to="+65" + str(data["PhoneNumber"])
        )
    dualotp.savingrandomotp(randomotpsms)


@RegisterRouter.post('/verifyphone')
async def verify_phone(request: Request):
    data = await request.json()

    results = dualotp.checkingrandomotp(data["PhoneCode"])
    if (results):
        return {"message": "Success"}
    else:
        return {"message": "no"}
