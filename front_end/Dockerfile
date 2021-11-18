FROM node:lts-buster-slim

#EXPOSE 443
#EXPOSE 8002

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

WORKDIR /app
COPY . /app

#COPY ./package-lock.json /app
#COPY ./package.json /app

#RUN npm install
RUN npm cache clean --force
RUN npm install
CMD ["npm", "start"]
