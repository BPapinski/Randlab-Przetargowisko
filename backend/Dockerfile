#Pobiera obraz bazowy python:3.11-slim.
FROM python:3.11-slim

# instalacja klienta postgres (dla pg_isready)
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

#: Ustawia katalog roboczy na /app.
WORKDIR /app

# Kopiuje plik requirements.txt do katalogu /app.
COPY requirements.txt .

#Instaluje zależności Pythona z requirements.txt za pomocą pip.
RUN pip install --no-cache-dir -r requirements.txt
