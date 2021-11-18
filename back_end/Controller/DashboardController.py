#from dns.query import send_tcp
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
from itsdangerous import URLSafeSerializer
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import decimal
from itertools import groupby
from operator import itemgetter
from collections import defaultdict

DashBoardRouter = APIRouter()
# Initializing DB
mydb = mysql.connector.connect(
    host=apiconfig.sqlhost,
    user=apiconfig.sqluser,
    password=apiconfig.sqlpassword,
    database=apiconfig.database
)
# Cursor that enables execution of prepared statements
mycursor = mydb.cursor(prepared=True)
auth_s = URLSafeSerializer(apiconfig.symmetrickey, "auth")

# Fix for 'Object of type Decimal is not JSON serializable' error


class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        return json.JSONEncoder.default(self, obj)


@DashBoardRouter.post('/accountdetails')
async def get_accounts(request: Request):
    data = await request.json()
    # session check
    secretdata = auth_s.loads(data['token'])

    # Parameterized query
    stmt = """SELECT CustomerID,username FROM Vanguard.Customer where Username = %s and CustomerID = %s"""
    mycursor.execute(stmt, (str(secretdata['name']), str(secretdata['id'])))
    sessionresult = mycursor.fetchall()
    mydb.commit()

    if not (sessionresult):
        return {"message": "Failure"}
    cID = str(secretdata['id'])
    if cID != sessionresult[0]:
        name = ""

        # Parameterized query
        stmt = """SELECT CustName FROM Vanguard.Customer where CustomerID = %s"""
        mycursor.execute(stmt, (cID, ))
        myresult = mycursor.fetchall()
        mydb.commit()

        if (myresult):
            name = json.dumps(myresult)
        accounts = []

        # Parameterized query
        stmt = """SELECT AccountID,Balance FROM Vanguard.Accounts where CustomerID = %s"""
        mycursor.execute(stmt, (cID, ))
        myresult = mycursor.fetchall()
        mydb.commit()

        if (myresult):
            for x in myresult:
                accounts.append({"AccountID": x[0], "Balance": x[1]})
            accounts = json.dumps(accounts)
            return {"message": "Success", "accounts": accounts, "name": name}
        else:
            return {"message": "Failure"}


@DashBoardRouter.post('/add_account')
async def add_accounts(request: Request):
    data = await request.json()
    # session check
    secretdata = auth_s.loads(data['token'])
    cID = str(secretdata['id'])
    cName = str(secretdata['name'])

    # Parameterized query
    stmt = """SELECT CustomerID,username FROM Vanguard.Customer where Username = %s and CustomerID = %s"""
    mycursor.execute(stmt, (cName, cID))
    sessionresult = mycursor.fetchall()
    mydb.commit()

    if not (sessionresult):
        return {"message": "Failure"}

    # Parameterized query
    stmt = """SELECT COUNT(CustomerID) FROM Vanguard.Accounts where CustomerID = %s"""
    mycursor.execute(stmt, (cID, ))
    myresult = mycursor.fetchall()
    mydb.commit()

    if (myresult[0][0] < 5):
        # Parameterized query
        stmt = """INSERT INTO Vanguard.Accounts (Balance, CustomerID) VALUES (0, %s)"""
        mycursor.execute(stmt, (cID, ))
        mydb.commit()

        return {"message": "Success"}
    else:
        return {"message": "You have too many accounts"}


@DashBoardRouter.post('/transaction_history')
async def transaction_history(request: Request):
    data = await request.json()
    # session check
    secretdata = auth_s.loads(data['token'])
    cID = str(secretdata['id'])
    cName = str(secretdata['name'])

    # Parameterized query
    stmt = """SELECT CustomerID,username FROM Vanguard.Customer where Username = %s and CustomerID = %s"""
    mycursor.execute(stmt, (cName, cID))
    myresult = mycursor.fetchall()
    mydb.commit()

    if not (myresult):
        return {"message": "Failure"}
    account_transactions = {}
    # Parameterized query
    stmt = """SELECT AccountID,Balance FROM Vanguard.Accounts where CustomerID = %s"""
    mycursor.execute(stmt, (cID, ))
    myresult = mycursor.fetchall()
    mydb.commit()

    if (myresult):
        for x in myresult:
            # Parameterized query
            stmt = """SELECT TransactionID,Debit,Credit,Timestamp,AccountID,AccountID2 FROM Vanguard.UserTransactions WHERE AccountID = %s ORDER BY Timestamp DESC"""
            mycursor.execute(stmt, (str(x[0]), ))
            dbresult = mycursor.fetchall()
            mydb.commit()

            if (dbresult):
                transaction_details = []
                for y in dbresult:
                    transaction_details.append(
                        {"tID": y[0], "debit": y[1], "credit": y[2], "timestamp": y[3], "sender": y[4], "recipient": y[5]})
                for i in transaction_details:
                    if i['sender'] not in account_transactions:
                        account_transactions[i['sender']] = [i]
                    else:
                        account_transactions[i['sender']].append(i)

            # Parameterized query
            stmt = """SELECT TransactionID,Debit,Credit,Timestamp,AccountID,AccountID2 FROM Vanguard.UserTransactions WHERE AccountID2 = %s ORDER BY Timestamp DESC"""
            mycursor.execute(stmt, (str(x[0]), ))
            dbresult = mycursor.fetchall()
            mydb.commit()

            if (dbresult):
                transaction_details = []
                for y in dbresult:
                    transaction_details.append(
                        {"tID": y[0], "debit": y[1], "credit": y[2], "timestamp": y[3], "sender": y[4], "recipient": y[5]})
                for i in transaction_details:
                    if i['recipient'] not in account_transactions:
                        account_transactions[i['recipient']] = [i]
                    else:
                        account_transactions[i['recipient']].append(i)
        if len(account_transactions) > 0:
            return {"message": "Success", "transaction_details": json.dumps(account_transactions, cls=JSONEncoder)}
        else:
            return {"message": "No Transactions"}
    else:
        return {"message": "No Transactions"}


# Encryption code
# ------------------------------------------------------
# key = apiconfig.cryptokey
# salt = os.urandom(16)
# kdf = PBKDF2HMAC(
#     algorithm=hashes.SHA256(),
#     length=32,
#     salt=salt,
#     iterations=100000,
# )
# key = base64.urlsafe_b64encode(kdf.derive(token.encode()))
# f = Fernet(key)
# dataToken = f.encrypt(json.dumps(Data).encode())
# print(dataToken)
# print(f.decrypt(dataToken))
# ------------------------------------------------------
# End of Encryption code
