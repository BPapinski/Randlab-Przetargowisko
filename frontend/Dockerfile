# Pobiera obraz bazowy node:20.
FROM node:20

# Ustawia katalog roboczy na /app.
WORKDIR /app

# kopiujesz package.json i instalujesz dependencje
COPY package*.json ./
RUN npm install


COPY . .

# Buduj aplikację (jeśli to produkcja)
RUN npm run build
# default command
CMD ["npm", "start"]
