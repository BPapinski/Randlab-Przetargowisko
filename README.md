# Randlab-Przetargowisko

Aplikacja webowa typu full-stack wykorzystująca Django (backend) oraz React (frontend) z bazą danych PostgreSQL (wcześniej MSSQL).

---

## 🛠️ Stack technologiczny

- **Backend:** Django, Django REST Framework  
- **Frontend:** React (Create React App)  
- **Baza danych:** PostgreSQL (zarządzana w Dockerze)  
- **Inne:**  
  - psycopg2-binary (obsługa PostgreSQL w Django)  
  - django-cors-headers (obsługa CORS dla Reacta)  
  - Jazzmin (usprawnienie panelu admina)  

---

## 🔧 Co zostało zrobione

- Konfiguracja narzędzi wspierających jakość kodu:
  - ✅ flake8 do analizy kodu  
  - ✅ isort do automatycznego sortowania importów  
  - ✅ black jako formatator kodu  
  - ✅ integracja z pre-commit  
- Migracja z MSSQL do PostgreSQL  
- Uruchomienie projektu w kontenerach Docker:  
  - ✅ Backend Django  
  - ✅ Frontend React  
  - ✅ Baza PostgreSQL w kontenerze z wolumenem danych  
- Utworzenie i konfiguracja projektu (backend + frontend)  
- Niestandardowy model użytkownika i REST API w Django  
- Implementacja paginacji, JWT, uwierzytelniania i czarnej listy tokenów  
- System słownika aliasów w frontendzie i backendzie  
- Rozszerzenie panelu administracyjnego dla `TenderEntry` i `Tender`  

---

## 🚀 Jak uruchomić projekt lokalnie (Docker)

1. **Uruchomienie kontenerów**
```bash
docker-compose up -d
```
2. **Sprawdzenie logów**
```bash
docker-compose logs -f backend   # backend Django
docker-compose logs -f frontend  # frontend React
docker-compose logs -f db        # baza PostgreSQL
```
3. **Dostęp do aplikacji**
Backend: http://localhost:8000/
Frontend: http://localhost:3000/
4. **Wejście do kontenerów (shell)**
```bash
docker-compose exec backend bash   # shell backend Django
docker-compose exec frontend bash  # shell frontend React
docker-compose exec db bash        # shell PostgreSQL
```
5. **Sprawdzenie połączenia Django z bazą**
```bash
docker-compose exec backend python manage.py dbshell
```
6. **Wykonanie migracji lub reset bazy**
```bash
docker-compose exec backend python manage.py migrate
docker-compose down -v  # usuwa kontenery i wolumeny bazy danych
```
7. **Sprawdzenie działania frontend**
```bash
docker-compose exec frontend npm start
```

8. **Uruchamianie skryptu do wypełniania bazy**
```bash
docker exec -it django_app python populate.py
```