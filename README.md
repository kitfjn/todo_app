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

2.  **Install dependencies using Poetry:**
    ```bash
    poetry install
    ```

3.  **Activate the virtual environment:**
    ```bash
    poetry shell
    ```

4.  **Run database migrations:**
    ```bash
    alembic upgrade head
    ```

5.  **Start the backend server:**
    ```bash
    uvicorn v1.main:app --reload
    ```

The backend will be running at `http://127.0.0.1:8000`.

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
