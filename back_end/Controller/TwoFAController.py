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
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

TwoFArouter = APIRouter()
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
    stmt = """Update TwoFA SET SMS= '0' WHERE CustomerID = %s"""
    mycursor.execute(stmt, (str(customerid), ))
    mydb.commit()
    sched.remove_job("smscounter")


@TwoFArouter.post('/emailaut')
async def get_email_from_react2(request: Request):
    data = await request.json()
    secretdata = auth_s.loads(data['token'])
    # EMAIL (check for customer first before admin login.)
    if (len(data['code']) == 6):
        if (data['value'] == 0):
            # Parameterized query
            stmt = """SELECT Email from TwoFA where CustomerID = %s and Email = %s"""
            mycursor.execute(stmt, (str(secretdata['id']), str(data['code'])))
            myresult = mycursor.fetchall()
            mydb.commit()

            if (myresult):
                token = auth_s.dumps({"id": secretdata['id'], "name": secretdata['name'],
                                      "password": secretdata['password'],
                                      "OTP": data['code']})  # convert to a secret token with OTP CODE
                # Data Encryption
                Data = {"id": secretdata['id'], "name": secretdata['name']}
                mydb.commit()
                return {"message": "Success",
                        "User": token,
                        "Data": json.dumps(Data)}
            else:
                # Parameterized query
                stmt = """SELECT Email from TwoFA where AdminID = %s and Email = %s"""
                mycursor.execute(
                    stmt, (str(secretdata['id']), str(data['code'])))
                myresult = mycursor.fetchall()
                mydb.commit()

                if (myresult):
                    admintoken = auth_s.dumps({"id": secretdata['id'], "name": secretdata['name'],
                                          "password": secretdata['password'],
                                          "OTP": data['code'],"priority":secretdata['priority']})  # convert to a secret token with OTP CODE
                    # Data Encryption
                    Data = {"id": secretdata['id'], "name": secretdata['name'], "priority":secretdata['priority']}
                    mydb.commit()
                    if(secretdata['priority'] == 1):
                        return {"message": "AdminSuccess",
                                "User": admintoken,
                                "Data": json.dumps(Data)}
                    elif (secretdata['priority'] == 2):
                        return {"message": "AdminSuccess2",
                                "User": admintoken,
                                "Data": json.dumps(Data)}
                    elif (secretdata['priority'] == 3):
                        return {"message": "AdminSuccess3",
                                "User": admintoken,
                                "Data": json.dumps(Data)}
                else:
                    return {"message": "Fail"}
        # SMS
        if (data['value'] == 1):
            # Parameterized query
            stmt = """SELECT SMS from TwoFA where CustomerID = %s and SMS = %s"""
            mycursor.execute(stmt, (str(secretdata['id']), str(data['code'])))
            myresult = mycursor.fetchall()
            mydb.commit()

            if (myresult):
                token = auth_s.dumps({"id": secretdata['id'], "name": secretdata['name'],
                                      "password": secretdata['password'],
                                      "OTP": data['code'],})  # convert to a secret token with OTP CODE
                Data = {"id": secretdata['id'], "name": secretdata['name']}
                mydb.commit()
                return {"message": "Success",
                        "User": token,
                        "Data": json.dumps(Data)}
            else:
                # Parameterized query
                stmt = """SELECT SMS from TwoFA where AdminID = %s and SMS = %s"""
                mycursor.execute(
                    stmt, (str(secretdata['id']), str(data['code'])))
                myresult = mycursor.fetchall()
                mydb.commit()

                if (myresult):
                    admintoken = auth_s.dumps({"id": secretdata['id'], "name": secretdata['name'],
                                          "password": secretdata['password'],
                                          "OTP": data['code'],"priority":secretdata['priority']})  # convert to a secret token with OTP CODE
                    Data = {"id": secretdata['id'], "name": secretdata['name'],"priority":secretdata['priority']}
                    mydb.commit()
                    if (secretdata['priority'] == 1):
                        return {"message": "AdminSuccess",
                                "User": admintoken,
                                "Data": json.dumps(Data)}
                    elif (secretdata['priority'] == 2):
                        return {"message": "AdminSuccess2",
                                "User": admintoken,
                                "Data": json.dumps(Data)}
                    elif (secretdata['priority'] == 3):
                        return {"message": "AdminSuccess3",
                                "User": admintoken,
                                "Data": json.dumps(Data)}
                else:
                    return {"message": "Fail"}
    return {"message": "Fail"}


@TwoFArouter.post('/resend')
async def resend(request: Request):
    sched.remove_all_jobs()
    data = await request.json()
    secretdata = auth_s.loads(data['token'])
    # Parameterized query
    stmt = """SELECT CustomerID,Email,Phone FROM Vanguard.Customer where Username = %s and CustPassword = %s"""
    mycursor.execute(stmt, (secretdata['name'], secretdata['password']))
    myresult = mycursor.fetchall()
    mydb.commit()

    if(myresult):
        for x in myresult:
            CustomerID = x[0]
            CustomerEmail = x[1]
            CustomerPhone = x[2]
        # Parameterized query
        stmt = """Update TwoFA SET Email= '0', SMS='0' WHERE CustomerID = %s"""
        mycursor.execute(stmt, (str(CustomerID),))
        mydb.commit()

        # EMAIL
        if (data['value'] == 0):
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
                smtp.sendmail(apiconfig.email, CustomerEmail, message)

                # Terminating the session
                smtp.quit()
                # Parameterized query
                stmt = """Update TwoFA SET Email = %s WHERE CustomerID = %s"""
                mycursor.execute(stmt, (str(randomotpemail), str(CustomerID),))
                mydb.commit()

                # Adding countdown timer
                sched.add_job(lambda: emailtimer(CustomerID),
                              'interval', seconds=180, id="emailcounter")
            except Exception as ex:
                return {"message": "Something went wrong...."}
            return {"message": "Success"}
        # SMS
        if (data['value'] == 1):
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
                    to=CustomerPhone
                )
            # Parameterized query
            stmt = """Update TwoFA SET SMS = %s WHERE CustomerID = %s"""
            mycursor.execute(stmt, (str(randomotpsms), str(CustomerID)))
            mydb.commit()

            # Adding countdown timer
            sched.add_job(lambda: smstimer(CustomerID),
                          'interval', seconds=180, id="smscounter")
            return {"message": "Success"}
    else:
        # Parameterized query
        stmt = """SELECT AdminID,AdminName,AdminUsername,AdminPassword,AdminEmail,AdminPhone,PriorityID FROM Vanguard.Admintable where AdminUsername = %s and AdminPassword = %s"""
        mycursor.execute(stmt, (secretdata['name'], secretdata['password']))
        myresult = mycursor.fetchall()
        mydb.commit()

        for x in myresult:
            AdminID = x[0]
            AdminEmail = x[4]
            AdminPhone = x[5]
        # Parameterized query
        stmt = """Update TwoFA SET Email= '0', SMS='0' WHERE AdminID = %s"""
        mycursor.execute(stmt, (str(AdminID)))
        mydb.commit()
        # EMAIL
        if (data['value'] == 0):
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
                smtp.sendmail(apiconfig.email, AdminEmail, message)

                # Terminating the session
                smtp.quit()
                # Parameterized query
                stmt = """Update TwoFA SET Email = %s WHERE AdminID = %s"""
                mycursor.execute(stmt, (str(randomotpemail), str(AdminID)))
                mydb.commit()
                # Adding countdown timer
                sched.add_job(lambda: emailtimer(CustomerID),
                              'interval', seconds=180, id="emailcounter")
            except Exception as ex:
                return {"message": "Something went wrong...."}
            return {"message": "Success"}
        # SMS
        if (data['value'] == 1):
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
                    to=AdminPhone
                )
            # Parameterized query
            stmt = """Update TwoFA SET SMS = %s WHERE AdminID = %s"""
            mycursor.execute(stmt, (str(randomotpsms), str(AdminID)))
            mydb.commit()
            # Adding countdown timer
            sched.add_job(lambda: smstimer(AdminID), 'interval',
                          seconds=180, id="smscounter")
            return {"message": "Success"}
