# Full-Stack Web Application

This is a full-stack web application with a FastAPI backend and a React frontend. The application appears to be a Todo list manager.

## Technologies

### Backend

- Python 3.12
- FastAPI
- SQLAlchemy
- Alembic for database migrations
- Pydantic for data validation
- Poetry for dependency management

### Frontend

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS

## Project Structure

```
.
├── backend/            # FastAPI backend
│   ├── alembic.ini
│   ├── migrations/
│   ├── pyproject.toml
│   └── v1/
└── frontend/           # React frontend
    ├── package.json
    ├── src/
    └── vite.config.ts
```

## Setup and Running

### Backend

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies library using Poetry:**
    ```bash
    poetry add library (you want to use library)
    ```

3.  **Activate the virtual environment and run database migrations:**
    ```bash
    poetry run alembic init
    poetry run alembic revision --autogenerate -m "first migrate"
    poetry run alembic upgrade head
    ```

4.  **Start the backend server:**
    ```bash
    cd backend/v1
    poetry run fastapi dev main.py
    ```
    Above command execute at the directory "main.py" is placed.

The backend will be running at `http://127.0.0.1:8000` or `http://127.0.0.1:8000/docs`.

### Frontend

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies using npm:**
    ```bash
    npm install
    ```

3.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```

The frontend will be running at `http://localhost:5173`.
