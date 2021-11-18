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
import base64
from base64 import b64encode
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


ForgotRouter = APIRouter()
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


def emailtimer(customerid):
    # Parameterized query
    stmt = """Update TwoFA SET Email= '0' WHERE CustomerID = %s"""
    mycursor.execute(stmt, (str(customerid), ))
    mydb.commit()

    sched.remove_job("emailcounter")


def smstimer(customerid):
    # Parameterized query
    stmt = """Update TwoFA SET Email= '0' WHERE CustomerID = %s"""
    mycursor.execute(stmt, (str(customerid), ))
    mydb.commit()

    sched.remove_job("smscounter")


def salt_encryption(password, customerID):
    salt = os.urandom(16)
    # print(salt)
    # print("before")
    # print(password)
    # print("LOOKHERE")
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    salt = b64encode(salt)
    # print(salt)
    salt = salt.decode('utf-8')
    # print(salt)
    # print("decoded salt")
    key = kdf.derive(password.encode())
    # print(key)
    encodedkey = base64.urlsafe_b64encode(key)
    # decodedkey=(base64.urlsafe_b64decode(encodedkey))
    # print(decodedkey)
    # print("LOOKLOOK")
   # salt= salt.encode('utf-8')
    salt = bytes(salt, 'utf-8')
    #salt = b64encode(bytes(salt, 'utf-8'))
    # print(salt)
    salt = base64.b64decode(salt)
    # print(salt)
    # print("After")
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    # print(kdf.verify(password.encode(), key))
    # print("these two needs to be same")
    # print(password.encode())
    # print(key)
    salt = b64encode(salt).decode('utf-8')
    # Parameterized query
    stmt = """INSERT into Salt(Salt,CustomerID) VALUES (%s, %s)"""
    mycursor.execute(stmt, (salt, str(customerID)))
    mydb.commit()

    return encodedkey

    # key = base64.urlsafe_b64encode(kdf.derive(token.encode()))
    # f = Fernet(key)
    # dataToken = f.encrypt(json.dumps(Data).encode())
    # print(dataToken)
    # print(f.decrypt(dataToken))


# This method will send 15 random characters as username to the customer email
@ForgotRouter.post('/forgotusername')
async def get_query_from_react(request: Request):
    data = await request.json()

    # Parameterized query
    stmt = """SELECT CustomerID,username,Email,Phone FROM Vanguard.Customer where Email = %s and Phone = %s"""
    mycursor.execute(stmt, (data['email'], data['phone']))
    myresult = mycursor.fetchall()
    mydb.commit()

    # if data['username'] == user["fakeusername"] and data['password'] == user["fakepassword"]:
    if (myresult):
        for x in myresult:
            CustomerID = x[0]
            Username = x[1]
            Email = x[2]
            Phone = x[3]
        token = auth_s.dumps({"id": CustomerID, "name": Username,
                              })  # convert to a secret token

        # Parameterized query
        stmt = """SELECT Choice,SMS,Email FROM Vanguard.TwoFA where CustomerID = %s"""
        mycursor.execute(stmt, (str(CustomerID)))
        myresult = mycursor.fetchall()
        mydb.commit()

        # if data['username'] == user["fakeusername"] and data['password'] == user["fakepassword"]:
        if (myresult):
            for x in myresult:
                Choice = x[0]
                SMSOTP = x[1]
                EmailOTP = x[2]
        if (Choice == 0):
            # EMAIL
            S = 15  # number of characters in the string.
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
                message = "Your temp username is \n" + randomotpemail + \
                          "\nplease change your username in your profile after you have successfully login"

                # Sending the Email
                smtp.sendmail(apiconfig.email, Email, message)
                # Terminating the session
                smtp.quit()
                # user["fakeotp"] = randomotpemail  # will be inserted into the user database

                # Parameterized query
                stmt = """Update Vanguard.Customer SET username= %s WHERE CustomerID = %s"""
                mycursor.execute(stmt, (str(randomotpemail), str(CustomerID)))
                mydb.commit()

            except Exception as ex:
                return {"message": "Something went wrong...."}
            return {"message": "Success"}
    else:
        return {"message": "Fail"}

# This method will send 15 random characters as password to the customer email


@ForgotRouter.post('/forgotpassword')
async def get_query_from_react2(request: Request):
    data = await request.json()

    # Parameterized query
    stmt = """SELECT CustomerID,username,Email,Phone FROM Vanguard.Customer where Username = %s and Email = %s"""
    mycursor.execute(stmt, (data['username'], data['email']))

    myresult = mycursor.fetchall()
    mydb.commit()
    # if data['username'] == user["fakeusername"] and data['password'] == user["fakepassword"]:
    if (myresult):
        for x in myresult:
            CustomerID = x[0]
            Username = x[1]
            Email = x[2]
            Phone = x[3]
        token = auth_s.dumps({"id": CustomerID, "name": Username,
                              })  # convert to a secret token

        # Parameterized query
        stmt = """SELECT Choice,SMS,Email FROM Vanguard.TwoFA where CustomerID = %s"""
        mycursor.execute(stmt, (str(CustomerID), ))
        myresult = mycursor.fetchall()
        mydb.commit()
        # if data['username'] == user["fakeusername"] and data['password'] == user["fakepassword"]:
        if (myresult):
            for x in myresult:
                Choice = x[0]
                SMSOTP = x[1]
                EmailOTP = x[2]
        if (Choice == 0):
            # EMAIL
            S = 15  # number of characters in the string.
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
                message = "Your temp password is \n" + randomotpemail + \
                          "\nplease change your password in your profile after you have successfully login"

                # Sending the Email
                smtp.sendmail(apiconfig.email, Email, message)
                # Terminating the session
                smtp.quit()

                ########## hash the password into the database ##########
                salted_password = salt_encryption(randomotpemail, CustomerID)
                salted_password = salted_password.decode("utf-8")
                # user["fakeotp"] = randomotpemail  # will be inserted into the user database

                # Parameterized query
                stmt = """Update Vanguard.Customer SET Custpassword = %s WHERE CustomerID = %s"""
                mycursor.execute(stmt, (salted_password, str(CustomerID)))
                mydb.commit()

                
            except Exception as ex:
                return {"message": "Something went wrong...."}
            return {"message": "Success"}
    else:
        return {"message": "Fail"}
