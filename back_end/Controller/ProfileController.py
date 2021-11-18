from fastapi.routing import APIRouter
from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
#from back_end import apiconfig
import apiconfig
import json
from itsdangerous import URLSafeSerializer  # cryptographic
import os
from twilio.rest import Client
import mysql.connector
import time
from datetime import datetime

from apscheduler.schedulers.background import BackgroundScheduler

import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from base64 import b64encode

import Controller.ForgotCredentialsController
import Controller.LoginController
import Controller.TwoFAController

sched = BackgroundScheduler()
sched.start()

mydb = mysql.connector.connect(
    host=apiconfig.sqlhost,
    user=apiconfig.sqluser,
    password=apiconfig.sqlpassword,
    database=apiconfig.database
)
# Initializing DB
# Cursor that enables execution of prepared statements
mycursor = mydb.cursor(prepared=True)

# Initializing cryptographic
auth_s = URLSafeSerializer(apiconfig.symmetrickey, "auth")

apps = APIRouter()


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
    # Parameterized query
    stmt = """Update Vanguard.Salt SET Salt = %s WHERE CustomerID = %s"""
    mycursor.execute(stmt, (salt, str(customerID)))
    mydb.commit()
    return encodedkey


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
    # Parameterized query
    stmt = """SELECT CustPassword FROM Vanguard.Customer where CustomerID = %s"""
    mycursor.execute(stmt, (customerID, ))
    myresult = mycursor.fetchall()
    mydb.commit()

    custpasswordtuple = myresult.pop()
    custpassword = custpasswordtuple[0]
    custpassword = str(custpassword)
    mydb.commit()
    custpassword = custpassword.encode('utf-8')
    decodedkey = base64.urlsafe_b64decode(custpassword)
    if(decodedkey == key):
        return True

    return False


@apps.post('/Profile')
async def get_accounts(request: Request):
    data = await request.json()

    cID = data['cID']
    name = ""
    # Parameterized query
    stmt = """SELECT CustName FROM Vanguard.Customer where CustomerID = %s"""
    mycursor.execute(stmt, (cID, ))
    myresult = mycursor.fetchall()
    mydb.commit()

    if (myresult):
        name = json.dumps(myresult)
    address = ""

    # Parameterized query
    stmt = """SELECT Address FROM Vanguard.Customer where CustomerID = %s"""
    mycursor.execute(stmt, (cID, ))
    myresult = mycursor.fetchall()
    mydb.commit()

    if (myresult):
        address = json.dumps(myresult)
    contact = ""
    # Parameterized query
    stmt = """SELECT Phone FROM Vanguard.Customer where CustomerID = %s"""
    mycursor.execute(stmt, (cID, ))
    myresult = mycursor.fetchall()
    mydb.commit()
    
    if (myresult):
        contact = json.dumps(myresult)
    email = ""
    # Parameterized query
    stmt = """SELECT Email FROM Vanguard.Customer where CustomerID = %s"""
    mycursor.execute(stmt, (cID, ))
    myresult = mycursor.fetchall()
    mydb.commit()

    if (myresult):
        email = json.dumps(myresult)
    usname = ""
    # Parameterized query
    stmt = """SELECT Custname FROM Vanguard.Customer where CustomerID = %s"""
    mycursor.execute(stmt, (cID, ))
    myresult = mycursor.fetchall()
    mydb.commit()

    if (myresult):
        usname = json.dumps(myresult)
        return {"message": "Success", "name": name, "usname": usname, "email": email, "address": address, "contact": contact}
    else:
        return {"message": "Failure"}


@apps.post('/changepass')
async def transfer_money(request: Request):
    data = await request.json()
    newpass = data['newpass']
    newpass = json.loads(newpass)

    # Parameterized query
    stmt = """SELECT CustomerID FROM Vanguard.Customer where Username = %s"""
    mycursor.execute(stmt, (data['username'], ))
    myresult = mycursor.fetchall()
    mydb.commit()

    customeridinTUPLE = myresult.pop()
    customerid = customeridinTUPLE[0]
    customerid = str(customerid)

    # Parameterized query
    stmt = """SELECT Salt FROM Vanguard.Salt where CustomerID = %s"""
    mycursor.execute(stmt, (customerid, ))
    myresult5 = mycursor.fetchall()
    mydb.commit()

    saltintuple = myresult5.pop()
    salt = saltintuple[0]
    verified_password = salt_decryption(data['password'], customerid, salt)
    if (verified_password):
        # Parameterized query
        stmt = """SELECT CustomerID FROM Vanguard.Customer where Username = %s"""
        mycursor.execute(stmt, (newpass[0], ))
        myresult = mycursor.fetchall()
        mydb.commit()

        customeridinTUPLE = myresult.pop()
        customerid = customeridinTUPLE[0]
        customerid = str(customerid)
        salted_password = salt_encryption(newpass[2], customerid)
        salted_password = salted_password.decode("utf-8")

        try:
            # Parameterized query
            stmt = """Update Customer SET CustPassword = %s WHERE CustomerID = %s"""
            mycursor.execute(stmt, (salted_password, str(customerid)))
            #mycursor.execute("UPDATE Vanguard.Customer SET CustPassword='" +newpass[2]+"' WHERE Username='" +newpass[0]+"' AND CustPassword='" +newpass[1]+"'AND CustomerID =" + str(customerid)+"")
            mydb.commit()

            return {"message": "Success"}
        except mysql.connector.Error as err:
            return {"message": "Failure"}
    else:
        return {"message": "wrong password or username"}


@apps.post('/changeemail')
async def transfer_money(request: Request):
    data = await request.json()
    # Data Encryption
    newemail = data['newemail']
    newemail = json.loads(newemail)
    # Parameterized query
    stmt = """SELECT CustomerID FROM Vanguard.Customer where Username = %s"""
    mycursor.execute(stmt, (newemail[0], ))
    myresult3 = mycursor.fetchall()
    mydb.commit()

    customeridinTUPLE = myresult3.pop()
    customerid = customeridinTUPLE[0]
    customerid = str(customerid)
    # Parameterized query
    stmt = """SELECT Salt FROM Vanguard.Salt where CustomerID = %s"""
    mycursor.execute(stmt, (customerid, ))
    myresult5 = mycursor.fetchall()
    mydb.commit()

    saltintuple = myresult5.pop()
    salt = saltintuple[0]
    verified_password = salt_decryption(data['password'], customerid, salt)
    if (verified_password):
        # Parameterized query
        stmt = """UPDATE Vanguard.Customer SET Email = %s WHERE Username = %s AND CustomerID = %s"""
        mycursor.execute(stmt, (newemail[2], newemail[0], str(customerid)))
        myresult = mycursor.fetchall()
        mydb.commit()

        if (len(myresult) == 0):
            mydb.commit()
            return {"message": "Success"}
        else:
            mydb.commit()
            return {"message": "Failed"}
    else:
        return {"message": "wrong password or username"}


@apps.post('/changeadd')
async def transfer_money(request: Request):
    data = await request.json()
    newadd = data['newadd']
    newadd = json.loads(newadd)

    # Parameterized query
    stmt = """SELECT CustomerID FROM Vanguard.Customer where Username = %s"""
    mycursor.execute(stmt, (newadd[0], ))
    myresult = mycursor.fetchall()
    mydb.commit()

    customeridinTUPLE = myresult.pop()
    customerid = customeridinTUPLE[0]
    customerid = str(customerid)

    # Parameterized query
    stmt = """SELECT Salt FROM Vanguard.Salt where CustomerID = %s"""
    mycursor.execute(stmt, (customerid, ))
    myresult5 = mycursor.fetchall()
    mydb.commit()

    saltintuple = myresult5.pop()
    salt = saltintuple[0]
    verified_password = salt_decryption(data['password'], customerid, salt)

    if (verified_password):
        # Parameterized query
        stmt = """SELECT CustomerID FROM Vanguard.Customer where Username = %s"""
        mycursor.execute(stmt, (newadd[0], ))
        myresult = mycursor.fetchall()
        mydb.commit()

        customeridinTUPLE = myresult.pop()
        customerid = customeridinTUPLE[0]
        customerid = str(customerid)
        # Parameterized query
        stmt = """UPDATE Vanguard.Customer SET Address = %s WHERE Username = %s AND CustomerID = %s"""
        mycursor.execute(stmt, (newadd[2], newadd[0], str(customerid)))
        myresult = mycursor.fetchall()
        mydb.commit()

        if (len(myresult) == 0):
            mydb.commit()
            return {"message": "Success"}
        else:
            mydb.commit()
            return {"message": "Name is taken"}
    else:
        return {"message": "wrong password or username"}


@apps.post('/changecon')
async def transfer_money(request: Request):
    data = await request.json()
    newcon = data['newcon']
    newcon = json.loads(newcon)
    # Parameterized query
    stmt = """SELECT CustomerID FROM Vanguard.Customer where Username = %s"""
    mycursor.execute(stmt, (newcon[0], ))
    myresult = mycursor.fetchall()
    mydb.commit()

    customeridinTUPLE = myresult.pop()
    customerid = customeridinTUPLE[0]
    customerid = str(customerid)
    # Parameterized query
    stmt = """SELECT Salt FROM Vanguard.Salt where CustomerID = %s"""
    mycursor.execute(stmt, (customerid, ))
    myresult5 = mycursor.fetchall()
    mydb.commit()

    saltintuple = myresult5.pop()
    salt = saltintuple[0]
    verified_password = salt_decryption(data['password'], customerid, salt)

    if (verified_password):
       # Parameterized query
        stmt = """UPDATE Vanguard.Customer SET Phone=%s WHERE Username=%s AND CustomerID = %s"""
        mycursor.execute(stmt, (str(newcon[2]), newcon[0], str(customerid)))
        myresult = mycursor.fetchall()
        mydb.commit()

        if (len(myresult) == 0):
            mydb.commit()
            return {"message": "Success"}
        else:
            mydb.commit()
            return {"message": "Name is taken"}
    else:
        return {"message": "wrong password or username"}
