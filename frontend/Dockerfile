# Pobiera obraz bazowy node:20.
FROM node:20

# Ustawia katalog roboczy na /app.
WORKDIR /app

# kopiujesz package.json i instalujesz dependencje
COPY package*.json ./
RUN npm install

# default command
CMD ["npm", "start"]
