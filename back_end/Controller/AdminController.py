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

AdminDashboardRouter = APIRouter()
# Initializing DB
mydb = mysql.connector.connect(
    host=apiconfig.sqlhost,
    user=apiconfig.sqluser,
    password=apiconfig.sqlpassword,
    database=apiconfig.database
)
# Cursor that enables execution of prepared statements
mycursor = mydb.cursor(prepared=True)

dateTimeObj = datetime.now()
timestampStr = dateTimeObj.strftime("%d-%b-%Y (%H:%M:%S.%f)")


def Admin_query_forcustomerlogs(adminname, customerName):
    # Parameterized query
    stmt = """SELECT AdminID FROM Vanguard.Admintable where AdminName = %s"""
    mycursor.execute(stmt, (adminname[0],))
    myresult = mycursor.fetchall()
    mydb.commit()
    if (myresult):
        # Parameterized query
        stmt = """SELECT CustomerID FROM Vanguard.Customer where CustName = %s"""
        mycursor.execute(stmt, (customerName, ))
        mycustomerresult = mycursor.fetchall()
        mydb.commit()
        adminidinTUPLE = myresult.pop()
        adminid = adminidinTUPLE[0]
        customeridinTUPLE = mycustomerresult.pop()
        CustomerID = customeridinTUPLE[0]

        # Parameterized query
        stmt = """INSERT into AdminLogs(AdminTransactions,AdminTimeStamp,AdminID,CustomerID) VALUES ('Searching Customer Login Logs', %s, %s, %s)"""
        mycursor.execute(stmt, (timestampStr, str(adminid), str(CustomerID),))
        # mycursor.execute("INSERT into AdminLogs(AdminTransactions,AdminTimeStamp,AdminID,CustomerID) VALUES ('" +"Searching Customer Login Logs"+ "','"+timestampStr+"','"+str(adminid)+"','" + str(CustomerID) + "')")
        mydb.commit()

def Admin_query_fortransactionslog(adminname, customerName):
    # Parameterized query
    stmt = """SELECT AdminID FROM Vanguard.Admintable where AdminName = %s"""
    mycursor.execute(stmt, (adminname[0], ))
    myresult = mycursor.fetchall()
    mydb.commit()
    if (myresult):
        # Parameterized query
        stmt = """SELECT CustomerID FROM Vanguard.Customer where CustName = %s"""
        mycursor.execute(stmt, (customerName, ))
        mycustomerresult = mycursor.fetchall()
        mydb.commit()

        adminidinTUPLE = myresult.pop()
        adminid = adminidinTUPLE[0]
        customeridinTUPLE = mycustomerresult.pop()
        CustomerID = customeridinTUPLE[0]

        # Parameterized query
        stmt = """INSERT into AdminLogs(AdminTransactions,AdminTimeStamp,AdminID,CustomerID) VALUES ('Searching customer transactions', %s, %s, %s)"""
        mycursor.execute(stmt, (timestampStr, str(adminid), str(CustomerID)))
        # mycursor.execute("INSERT into AdminLogs(AdminTransactions,AdminTimeStamp,AdminID,CustomerID) VALUES ('" +"Searching Customer Login Logs"+ "','"+timestampStr+"','"+str(adminid)+"','" + str(CustomerID) + "')")
        mydb.commit()

def Admin_query_foradmin(adminid, currentadminid):
    # Parameterized query
     stmt = """INSERT into AdminLogs(AdminTransactions,AdminTimeStamp,AdminID,AdminID2) VALUES ('Searching Admin Actions', %s, %s, %s)"""
     mycursor.execute(stmt, (timestampStr, str(currentadminid), str(adminid)))
     # mycursor.execute("INSERT into AdminLogs(AdminTransactions,AdminTimeStamp,AdminID,CustomerID) VALUES ('" +"Searching Customer Login Logs"+ "','"+timestampStr+"','"+str(adminid)+"','" + str(CustomerID) + "')")
     mydb.commit()

@AdminDashboardRouter.post('/AdminDashboard')
async def get_adminaccount(request: Request):
    data = await request.json()
    aID = data['aID']
    # End of Data Encryption
    name = ""
    priority= ""
    # Parameterized query
    stmt = """SELECT AdminName,PriorityID FROM Vanguard.Admintable where AdminID = %s"""
    mycursor.execute(stmt, (aID, ))
    myresult = mycursor.fetchall()
    mydb.commit()

    if (myresult):
        name = json.dumps(myresult[0])
        ## add into the dashboard for admin
        return {"message": "Success", "name": name}
    else:
        return {"message": "Failure"}
    
    


@AdminDashboardRouter.post('/Admin_RequestCustomerLoginLogs')
async def get_CustomerLoginLogs(request: Request):
    data = await request.json()
    CustomerName = data['CustomerName']
    CustomerPhone = data['CustomerPhone']
    Adminname = data['Adminname']
    CustomerPhone="+65"+str(CustomerPhone)
    # End of Data Encryption
    name = ""

    # Parameterized query
    stmt = """SELECT CustomerID FROM Vanguard.Customer where CustName = %s AND Phone = %s"""
    mycursor.execute(stmt, (CustomerName, CustomerPhone))
    myresult = mycursor.fetchall()
    mydb.commit()

    Admin_query_forcustomerlogs(Adminname, CustomerName)
    if (myresult):
        customeridinTUPLE = myresult.pop()
        CustomerID = customeridinTUPLE[0]
        # Parameterized query
        stmt = """SELECT Logintimestamp,Ipaddress,Country,AttemptSuccess FROM Vanguard.LoginLogs where CustomerID = %s"""
        mycursor.execute(stmt, (str(CustomerID), ))
        myresult = mycursor.fetchall()
        mydb.commit()

        Logintimestamp = []
        Ipaddress = []
        Country = []
        AttemptSuccess = []
        results = []

        for x in myresult:
            results.append(x[0])
            results.append(x[1])
            results.append(x[2])
            results.append(x[3])
            Logintimestamp.append(x[0])
            Ipaddress.append(x[1])
            Country.append(x[2])
            AttemptSuccess.append(x[3])

        return {"message": "Success", "Logintimestamp": results, "Ipaddress": Ipaddress, "Country": Country, "AttemptSuccess": AttemptSuccess}
    else:
        return {"message": "Failure"}


@AdminDashboardRouter.post('/Admin_Customertransactions')
async def get_customertransactions(request: Request):
    data = await request.json()
    # End of Data Encryption
    name = ""
    priority= ""
    CustomerName = data['CustomerName']
    CustomerPhone = data['CustomerPhone']
    Account= data['Account']
    Adminname = data['Adminname']
    CustomerPhone = "+65"+str(CustomerPhone)
    # Parameterized query
    stmt = """SELECT CustomerID FROM Vanguard.Customer where CustName = %s AND Phone = %s"""
    mycursor.execute(stmt, (CustomerName, str(CustomerPhone)))
    myresult = mycursor.fetchall()
    mydb.commit()

    Admin_query_fortransactionslog(Adminname, CustomerName)
    if (myresult):
        customeridinTUPLE = myresult.pop()
        CustomerID = customeridinTUPLE[0]
        # Parameterized query
        stmt = """SELECT AccountID FROM Vanguard.Accounts where CustomerID = %s"""
        mycursor.execute(stmt, (str(CustomerID),))

        myresultaccount = mycursor.fetchall()
        mydb.commit()
        accountlist = [item for t in myresultaccount for item in t]
        TransactionsID = []
        if(Account in accountlist):
            stmt = """SELECT TransactionID,Debit,Credit,TimeStamp,AccountID,AccountID2 FROM Vanguard.UserTransactions where AccountID = %s"""
            mycursor.execute(stmt, (str(Account),))
            myresulttransactionid = mycursor.fetchall()
            mydb.commit()
            for x in myresulttransactionid:
                TransactionsID.append("ID")
                TransactionsID.append(x[0])
                TransactionsID.append("Debit")
                TransactionsID.append(x[1])
                TransactionsID.append("Credit")
                TransactionsID.append(x[2])
                TransactionsID.append("TimeStamp")
                TransactionsID.append(x[3])
                TransactionsID.append("AccountID")
                TransactionsID.append(x[4])
                TransactionsID.append("To AccountID")
                TransactionsID.append(x[5])

        else :
              return {"message": "Failure"}

        return {"message": "Success", "transactions": TransactionsID}
    else:
        return {"message": "Failure"}


@AdminDashboardRouter.post('/Admin_RequestAdminLogs')
async def get_Admin_RequestAdminLogs(request: Request):
    data = await request.json()
    AdminID = data['AdminID']
    currentAdminID =  data['aID']
    # End of Data Encryption
    #Admin_query_foradmin(AdminID,currentAdminID)
    # Parameterized query
    stmt = """SELECT AdminTransactions FROM Vanguard.AdminLogs where AdminID = %s"""
    mycursor.execute(stmt, (str(AdminID),))
    myresult = mycursor.fetchall()
    mydb.commit()
    Admin_query_foradmin(currentAdminID,AdminID)
    results=[]
    if (myresult):
        for x in myresult:
            results.append(x[0])

        return {"message": "Success", "Transactions": results}
    else:
        return {"message": "Failure"}