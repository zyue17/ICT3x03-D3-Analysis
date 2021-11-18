import uvicorn
from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
import smtplib
import string
import random
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

# encryption libraries
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

#Routing to other files
import Controller.ForgotCredentialsController
import Controller.LoginController
import Controller.TwoFAController
import Controller.ProfileController
import Controller.DashboardController
import Controller.TransferController
import Controller.RegisterController
import Controller.DepositWithdrawController
import Controller.AdminController

sched = BackgroundScheduler()
sched.start()

mydb = mysql.connector.connect(
    host=apiconfig.sqlhost,
    user=apiconfig.sqluser,
    password=apiconfig.sqlpassword,
    database=apiconfig.database
)
# Initializing DB
mycursor = mydb.cursor()

# Initializing cryptographic
auth_s = URLSafeSerializer(apiconfig.symmetrickey, "auth")

apps = FastAPI()
#linking of routes
apps.include_router(Controller.ForgotCredentialsController.ForgotRouter)
apps.include_router(Controller.LoginController.loginrouter)
apps.include_router(Controller.TwoFAController.TwoFArouter)
apps.include_router(Controller.ProfileController.apps)
apps.include_router(Controller.DashboardController.DashBoardRouter)
apps.include_router(Controller.TransferController.TransferRouter)
apps.include_router(Controller.RegisterController.RegisterRouter)
apps.include_router(Controller.DepositWithdrawController.DepositWithdrawRouter)
apps.include_router(Controller.AdminController.AdminDashboardRouter)

origins = [
    "http://localhost:8000",
    "http://localhost:8001",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:8000/check_email",
    "http://127.0.0.1:8001",
    # "http://172.17.0.3:8001",
    # "http://172.17.0.3:80",
    "https://vanguard.sitict.net",
    "https://vanguard.sitict.net:8000",
    "https://vanguard.sitict.net:3000"
]

apps.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
