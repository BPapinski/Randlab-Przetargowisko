# Randlab-Przetargowisko

A full-stack web application for tender management, built with **Django** (backend), **React** (frontend), and **PostgreSQL** (database).

## 🛠️ Technology Stack

- **Backend**: `Django`, `Django REST Framework`
- **Frontend**: `React` (Create React App)
- **Database**: `PostgreSQL` (managed in Docker)
- **Other tools**:
  - `psycopg2-binary`: PostgreSQL driver for Django
  - `django-cors-headers`: Handles CORS
  - `Jazzmin`: Enhances admin panel

## 🚀 Key Features

### Tender Management
- **Adding**: Form to add tenders with *name*, *status*, *client*, and unlimited *developers* (position, company, price, margin).
- **Attachments**: Add any number of attachments to tenders.

### Searching and Filtering
- Search bar and filters to sort tenders by *price*, *client*, *company*, and *status*.
- Position aliasing groups similar names (e.g., `Frontend Dev` and `Frontend Developer`) for simplified filtering and analysis.

### Data Visualization
- Sidebar displays real-time stats:
  - Total tenders
  - Statuses (*won*/*lost*)
  - Average value
  - Unique developers

### Authentication and Security
- JWT-based user authentication with token blacklist for revoked tokens.

### Enhanced Admin Panel
- `Jazzmin` library improves admin panel for managing `Tender` and `TenderEntry` models.

## 🔧 Technical Solutions
- **Code Quality**: `flake8`, `isort`, and `black` with pre-commit hooks for automated code validation/formatting.
- **Migration**: Migrated from MSSQL to PostgreSQL.
- **Containerization**: Runs in Docker containers (`Django` backend, `React` frontend, `PostgreSQL` database).
- **API**: Custom user model with REST API supporting pagination.


## 🚀 Running Locally (Docker)

1. Start containers:
```bash
docker-compose up -d
```

2. Access the application:

Backend: http://localhost:8000/
Frontend: http://localhost:3000/

3. Run migrations:
```bash
docker-compose exec backend python manage.py migrate
```
4. Populate database with sample data:
```bash
docker-compose exec backend python populate.py
```
5. Clean up environment
```bash
docker-compose down -v
```
[!NOTE]
Ensure Docker is installed and running before executing the above commands.