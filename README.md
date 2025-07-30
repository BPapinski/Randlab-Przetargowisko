# Randlab-Przetargowisko

Full-stack web application using **Django (backend)** and **React (frontend)** with **Microsoft SQL Server (MSSQL)** as the database.

---

## 🛠️ Stack technologiczny

- **Backend**: Django, Django REST Framework
- **Frontend**: React (Create React App)
- **Baza danych**: Microsoft SQL Server (zarządzany przez SQL Server Management Studio)
- **Inne**: `django-cors-headers`, `mssql-django`, ODBC Driver 17

---

## 🔧 Co zostało zrobione

- Utworzenie i konfiguracja projektu


## 🚀 Jak uruchomić projekt lokalnie

### 1. Backend

cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

### 2. frontend

cd frontend
npm install
npm start

### 🧩 W planach (TODO)

- Uwierzytelnianie użytkowników

- Pierwsze modele i API

- Panel admina

- Integracja frontendu z REST API

### Dane do logowania

- email: admin@email.com

- haslo: admin