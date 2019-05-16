FROM node:8

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./

RUN npm install

# Bundle app source
COPY . .

RUN npm run build

EXPOSE 8989
CMD [ "npm", "start"]
