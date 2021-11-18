FROM tiangolo/uvicorn-gunicorn-fastapi:python3.8-slim-2021-06-09

EXPOSE 8000

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Update and install required libraries
RUN apt update -y

# Update and install required python libraries
RUN pip3 install --upgrade pip

# Install pip requirements
COPY requirements.txt /app/requirements.txt
RUN pip3 install -r /app/requirements.txt

WORKDIR /app
COPY . /app

CMD ["uvicorn", "main:apps", "--host", "0.0.0.0", "--port", "8000"]
