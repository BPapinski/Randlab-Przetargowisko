# Randlab-Przetargowisko

Aplikacja webowa typu full-stack wykorzystująca **Django (backend)** oraz **React (frontend)** z bazą danych **Microsoft SQL Server (MSSQL)**.

---

## 🛠️ Stack technologiczny

- **Backend**: Django, Django REST Framework  
- **Frontend**: React (Create React App)  
- **Baza danych**: Microsoft SQL Server (zarządzana przez SQL Server Management Studio)  
- **Inne**:  
  - `mssql-django` (obsługa MSSQL w Django)  
  - `django-cors-headers` (obsługa CORS dla Reacta)  
  - ODBC Driver 17 (sterownik do połączenia z MSSQL)

---

## 🔧 Co zostało zrobione

- Utworzenie i konfiguracja projektu (backend + frontend)
- Wdrożenie niestandardowego modelu użytkownika
- Usprawnienie panelu administracyjnego za pomocą **Jazzmin**
- Implementacja systemu przetargów z możliwością dodawania zgłoszeń
- Stworzenie REST API w oparciu o Django REST Framework
- Integracja frontendu z backendem
- Implementacja paginacji z możliwością wyboru liczby elementów na stronę  
  ✅ Dane odświeżają się natychmiast po zmianie liczby elementów


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

- Formularze dodawania i edycji przetargów oraz zgłoszeń

- Filtrowanie i sortowanie danych

- funkcja słownika aliasów

### Dane do logowania

- email: admin@email.com

- haslo: admin