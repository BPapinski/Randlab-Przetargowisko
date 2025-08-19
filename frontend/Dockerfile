FROM node:20

WORKDIR /app

# kopiujesz package.json i instalujesz dependencje
COPY package*.json ./
RUN npm install

# tu NIE kopiuj całego kodu, bo i tak będzie montowany wolumenem w docker-compose
# COPY . .  

# default command
CMD ["npm", "start"]
