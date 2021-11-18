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


loginrouter = APIRouter()

try:
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

    ############################# LOGGING RELATED#########################################
    dateTimeObj = datetime.now()
    timestampStr = dateTimeObj.strftime("%d-%b-%Y (%H:%M:%S.%f)")

    import socket
    hostname = socket.gethostname()
    IPAddr = socket.gethostbyname(hostname)

    import requests
    import json

    # import json
    # import urllib.request
    #
    # GEO_IP_API_URL  = 'http://ip-api.com/json/'
    #
    # # Can be also site URL like this : 'google.com'
    #
    #
    # # Creating request object to GeoLocation API
    # req             = urllib.request.Request(GEO_IP_API_URL+IPAddr)
    # # Getting in response JSON
    # response        = urllib.request.urlopen(req).read()
    # # Loading JSON from text to object
    # json_response   = json.loads(response.decode('utf-8'))
    #
    # # Print country
    # print(json_response['country'])

    #################3 SALT DECRYPTION TO BE TRIED OUT LATER ##########################
    def salt_decryption(password, customerID, salt):
        salt = bytes(salt, 'utf-8')
        #salt = b64encode(bytes(salt, 'utf-8'))
        salt = base64.b64decode(salt)
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = kdf.derive(password.encode())
        # print(key)
        # decodedkey=(base64.urlsafe_b64decode(encodedkey))
        # print(decodedkey)
        # print("LOOKLOOK")

        # Parameterized query
        sql_select_query = """SELECT CustPassword FROM Vanguard.Customer where CustomerID = %s"""
        mycursor.execute(sql_select_query, (customerID, ))
        myresult = mycursor.fetchall()
        mydb.commit()
        custpasswordtuple = myresult.pop()
        custpassword = custpasswordtuple[0]
        custpassword = str(custpassword)
        # mydb.commit()
        custpassword = custpassword.encode('utf-8')
        decodedkey = base64.urlsafe_b64decode(custpassword)

        if(decodedkey == key):
            return True

        return False

    def salt_decryption_admin(password,adminID, salt):
        salt = bytes(salt, 'utf-8')
        #salt = b64encode(bytes(salt, 'utf-8'))
        salt = base64.b64decode(salt)
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = kdf.derive(password.encode())
        # print(key)
        # decodedkey=(base64.urlsafe_b64decode(encodedkey))
        # print(decodedkey)
        # print("LOOKLOOK")

        # Parameterized query
        sql_select_query = """SELECT AdminPassword FROM Vanguard.Admintable where AdminID= %s"""
        mycursor.execute(sql_select_query, (adminID, ))
        myresult = mycursor.fetchall()
        mydb.commit()

        custpasswordtuple = myresult.pop()
        custpassword = custpasswordtuple[0]
        custpassword = str(custpassword)
        # mydb.commit()
        custpassword = custpassword.encode('utf-8')
        decodedkey = base64.urlsafe_b64decode(custpassword)

        if(decodedkey == key):
            return True

        return False
    # 3

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

    @loginrouter.post('/loginauthentication')
    async def get_login_from_react2(request: Request):
        data = await request.json()
        ######################################## retrieve customerid via username input ##########
        # Parameterized query
        stmt = """SELECT CustomerID FROM Vanguard.Customer where Username = %s"""
        mycursor.execute(stmt, (data['username'], ))
        myresult = mycursor.fetchall()
        mydb.commit()

        if (myresult):
            customeridinTUPLE = myresult.pop()
            customerid = str(customeridinTUPLE[0])
            # customerid = str(customerid)
            mydb.commit()
            # Parameterized query
            stmt = """SELECT Salt FROM Vanguard.Salt where CustomerID = %s"""
            mycursor.execute(stmt, (customerid, ))
            myresult = mycursor.fetchall()
            mydb.commit()

            saltintuple = myresult.pop()
            salt = saltintuple[0]
            verified_password = salt_decryption(
                data['password'], customerid, salt)
            mydb.commit()
            # ^^ decryption ####################################3
            if(verified_password):
                # Parameterized query
                stmt = """SELECT CustomerID,username,CustPassword,Email,Phone FROM Vanguard.Customer where Username = %s"""
                mycursor.execute(stmt, (data['username'], ))
                myresult = mycursor.fetchall()
                mydb.commit()

                # if data['username'] == user["fakeusername"] and data['password'] == user["fakepassword"]:
                if (myresult):
                    for x in myresult:
                        CustomerID = x[0]
                        Username = x[1]
                        CustPassword = x[2]
                        Email = x[3]
                        Phone = x[4]

                    # Parameterized query
                    stmt = """INSERT INTO LoginLogs(Logintimestamp,Ipaddress,Country,CustomerID,AttemptSuccess) VALUES (%s,%s,%s,%s,%s)"""
                    mycursor.execute(stmt, (timestampStr, IPAddr,
                                    "SG", str(CustomerID), "1"))

                    mydb.commit()

                    token = auth_s.dumps({"id": CustomerID, "name": Username,
                                        "password": CustPassword})  # convert to a secret token

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
                            smtp.sendmail(apiconfig.email, Email, message)
                            # Terminating the session
                            smtp.quit()
                            # set SMS and Email to 0 first

                            # Parameterized query
                            stmt = """Update TwoFA SET Email= '0', SMS='0' WHERE CustomerID = %s"""
                            mycursor.execute(stmt, (str(CustomerID), ))
                            mydb.commit()

                            # Parameterized query
                            stmt = """Update TwoFA SET Email = %s WHERE CustomerID = %s"""
                            mycursor.execute(
                                stmt, (str(randomotpemail), str(CustomerID)))
                            mydb.commit()

                            # Adding countdown timer
                            sched.remove_all_jobs()
                            sched.add_job(lambda: emailtimer(
                                CustomerID), 'interval', seconds=180, id="emailcounter")

                            # mycursor.close()
                            # mydb.close

                        except Exception as ex:
                            return {"message": "Something went wrong...."}
                        return {"message": "Success",
                                "User": token
                                }
                    elif (Choice == 1):
                        try:
                            S = 6  # number of characters in the string.
                            randomotpsms = ''.join(random.choices(
                                string.ascii_uppercase + string.digits, k=S))
                            randomotpsms = str(randomotpsms)
                            # print the random data
                            print(
                                "The randomly generated string for SMS is : " + randomotpsms)
                            client = Client(apiconfig.twiliosid,
                                            apiconfig.twiliotoken)

                            message = client.messages \
                                .create(
                                    body="Hi, your OTP code is  " + randomotpsms + ". code will expire in 3minutes",
                                    from_=apiconfig.twiliophonenumber,
                                    to=Phone
                                )
                            # Parameterized query
                            stmt = """Update TwoFA SET SMS = %s WHERE CustomerID = %s"""
                            mycursor.execute(
                                stmt, (str(randomotpsms), str(CustomerID)))
                            mydb.commit()

                            # Adding countdown timer
                            sched.remove_all_jobs()
                            sched.add_job(lambda: smstimer(CustomerID),
                                        'interval', seconds=180, id="smscounter")
                            
                        except Exception as ex:
                            return {"message": "Something went wrong...."}
                        return {"message": "Success",
                                "User": token
                                }
        else:
            stmt = """SELECT AdminID FROM Vanguard.Admintable where AdminUsername = %s"""
            mycursor.execute(stmt, (data['username'],))
            myresult = mycursor.fetchall()
            mydb.commit()

            AdminidinTUPLE = myresult.pop()
            AdminID = str(AdminidinTUPLE[0])
            # customerid = str(customerid)
            # mydb.commit()
            # Parameterized query
            stmt = """SELECT Salt FROM Vanguard.Salt where AdminID = %s"""
            mycursor.execute(stmt, (AdminID,))
            myresult = mycursor.fetchall()
            mydb.commit()

            saltintuple = myresult.pop()
            salt = saltintuple[0]
            verified_password = salt_decryption_admin(
                data['password'], AdminID, salt)
            mydb.commit()
            if(verified_password):
                # Parameterized query
                stmt = """SELECT AdminID,AdminName,AdminUsername,AdminPassword,AdminEmail,AdminPhone,PriorityID 
                        FROM Vanguard.Admintable where AdminUsername = %s"""
                mycursor.execute(stmt, (str(data['username']),))
                myresult = mycursor.fetchall()
                mydb.commit()

                if (myresult):

                    for x in myresult:
                        AdminID = x[0]
                        AdminName = x[1]
                        AdminUsername = x[2]
                        AdminPassword = x[3]
                        AdminEmail = x[4]
                        AdminPhone = x[5]
                        PriorityID = x[6]

                    # Parameterized query
                    stmt = """INSERT INTO LoginLogs(Logintimestamp,Ipaddress,Country,AdminID,AttemptSuccess) VALUES (%s,%s,%s,%s,%s)"""
                    mycursor.execute(
                        stmt, (timestampStr, IPAddr, "SG", str(AdminID), "1"))
                    mydb.commit()
                    token = auth_s.dumps({"id": AdminID, "name": AdminUsername,
                                        "password": AdminPassword, "priority": PriorityID})  # convert to a secret token

                    # Parameterized query
                    stmt = """SELECT Choice,SMS,Email FROM Vanguard.TwoFA where AdminID = %s"""
                    mycursor.execute(stmt, (str(AdminID), ))
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
                            smtp.login(apiconfig.email,
                                    apiconfig.emailpassword)

                            # Defining The Message
                            message = "Your code is \n" + randomotpemail + \
                                "\ncode will expire in 3minutes"

                            # Sending the Email
                            smtp.sendmail(apiconfig.email, AdminEmail, message)
                            # Terminating the session
                            smtp.quit()
                            # set SMS and Email to 0 first

                            # Parameterized query
                            stmt = """Update TwoFA SET Email= '0', SMS='0' WHERE CustomerID = %s"""
                            mycursor.execute(stmt, (str(AdminID), ))
                            mydb.commit()

                            # Parameterized query
                            stmt = """Update TwoFA SET Email = %s WHERE AdminID = %s"""
                            mycursor.execute(
                                stmt, (str(randomotpemail), str(AdminID)))
                            mydb.commit()

                            # Adding countdown timer
                            sched.remove_all_jobs()
                            sched.add_job(lambda: emailtimer(
                                AdminID), 'interval', seconds=180, id="emailcounter")

                        except Exception as ex:
                            return {"message": "Something went wrong...."}
                        return {"message": "Success",
                                "User": token
                                }
                    elif (Choice == 1):
                        try:
                            S = 6  # number of characters in the string.
                            randomotpsms = ''.join(random.choices(
                                string.ascii_uppercase + string.digits, k=S))
                            randomotpsms = str(randomotpsms)
                            # print the random data
                            print(
                                "The randomly generated string for SMS is : " + randomotpsms)
                            client = Client(apiconfig.twiliosid,
                                            apiconfig.twiliotoken)

                            message = client.messages \
                                .create(
                                    body="Hi, your OTP code is  " + randomotpsms + ". code will expire in 3minutes",
                                    from_=apiconfig.twiliophonenumber,
                                    to=str(AdminPhone)
                                )

                            # Parameterized query
                            stmt = """Update TwoFA SET SMS = %s WHERE AdminID = %s"""
                            mycursor.execute(
                                stmt, (str(randomotpsms), str(AdminID)))
                            mydb.commit()

                            # Adding countdown timer
                            sched.remove_all_jobs()
                            sched.add_job(lambda: smstimer(
                                AdminID), 'interval', seconds=180, id="smscounter")
                            
                        except Exception as ex:
                            return {"message": "Something went wrong...."}
                        return {"message": "Success",
                                "User": token
                                }
                    else:
                        return {"message": "Invalid username or password"}
            else:
                return {"message": "Invalid username or password"}



except mysql.connector.Error as error:
    print("Parameterized query failed {}".format(error))
# finally:
#     if mydb.is_connected():
#         mycursor.close()
#         mydb.close()
#         print("MySQL connection is closed")
