import uvicorn
from fastapi import FastAPI, Request
from fastapi import APIRouter
#from back_end import apiconfig
import json
import os
import mysql.connector
import time
from datetime import datetime
# routing files
import apiconfig
from cryptography.fernet import Fernet
# encryption libraries
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from itsdangerous import URLSafeSerializer

TransferRouter = APIRouter()
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


@TransferRouter.post('/transfer')
async def transfer_money(request: Request):
    data = await request.json()
    # session check
    secretdata = auth_s.loads(data['token'])

    # Parameterized query
    stmt = """SELECT CustomerID,username FROM Vanguard.Customer where Username=%s and CustomerID = %s"""
    mycursor.execute(stmt, (str(secretdata['name']), str(secretdata['id'])))
    myresult = mycursor.fetchall()
    mydb.commit()

    if not (myresult):
        return {"message": "Customer does not exists"}
    transfer = data['transfer']
    transfer = json.loads(transfer)

    # Parameterized query
    stmt = """SELECT Balance FROM Vanguard.Accounts where AccountID = %s and CustomerID = %s"""
    mycursor.execute(stmt, (transfer[0], str(secretdata['id'])))
    myresult = mycursor.fetchall()
    mydb.commit()

    if not (myresult):
        return {"message": "Account does not belong to this Customer"}
    for x in myresult:
        balance = x[0]
    if transfer[2] == 0:
        return {"message": "Transfer Amount cannot be 0"}
    if transfer[0] != transfer[1] and float(balance) > float(transfer[2]):
        try:
            # Parameterized query
            stmt = """UPDATE Vanguard.Accounts SET Balance = Balance - %s where AccountID = %s"""
            mycursor.execute(stmt, (transfer[2], transfer[0]))

            # Parameterized query
            stmt = """UPDATE Vanguard.Accounts SET Balance = Balance + %s where AccountID = %s"""
            mycursor.execute(stmt, (transfer[2], transfer[1]))
            timestamp = int(time.time())

            # Parameterized query
            stmt = """INSERT INTO Vanguard.UserTransactions (Debit, Credit, Timestamp, AccountID, AccountID2) VALUES (%s, %s, %s, %s, %s)"""
            mycursor.execute(stmt, ("0", transfer[2], str(
                timestamp), transfer[0], transfer[1]))
            mydb.commit()

            return {"message": "Success"}
        except mysql.connector.Error as err:
            return {"message": "Unable to proceed with Transaction"}
    else:
        return {"message": "You either do not have enough balance or you are trying to transfer to yourself"}
