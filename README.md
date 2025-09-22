# VishMat Trainer Prototype

Прототип веб-приложения для тренировки решения дифференциальных уравнений. Состоит из FastAPI-бэкенда с генерацией и проверкой
задач (через SymPy) и фронтенда на React + Tailwind CSS.

## Запуск

### Бэкенд
1. Создать виртуальное окружение и установить зависимости:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Запустить сервер:
   ```bash
   uvicorn app.main:app --reload
   ```

### Фронтенд
1. Установить зависимости и запустить Vite:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Открыть приложение по адресу `http://localhost:5173`.

   Для подготовки статического билда выполните `npm run build` — готовые файлы попадут в каталог `docs`,
   откуда их можно деплоить на GitHub Pages или другую площадку, проксирующую запросы к API.

Фронтенд настроен на проксирование запросов `/api` на `http://localhost:8000`.

## Структура
- `backend/app/data` — банк тем, статические и шаблонные задачи.
- `backend/app/services` — проверка решений (SymPy), генерация задач.
- `frontend/src/pages` — ключевые страницы: главная, темы, тренировка, прогресс и профиль.
- `frontend/src/components` — редактор формул и переключатель темы.

## Возможности
- Мини-теория и примеры для 6 основных тем курса.
- Генерация вариативных задач с авто-проверкой и подсказками в 3 уровня.
- Режим экзамена с таймером.
- Геймификация: XP, streak, бейджи и отслеживание прогресса.

## Сборка десктопного приложения (Windows)

Приложение можно упаковать в автономный `.exe`, который хранит данные локально в
`%APPDATA%/VishMatTrainer/app.db` и не требует отдельного запуска сервера.

1. Соберите фронтенд:
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```
2. Создайте и активируйте Python-окружение, установите зависимости:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows PowerShell
   pip install -r backend/requirements.txt -r desktop_app/requirements.txt
   ```
3. Соберите `.exe` через PyInstaller:
   ```bash
   pyinstaller desktop_app/app.spec
   ```
4. Готовый билд появится в `dist/VishMatTrainer/VishMatTrainer.exe`.

Для тестирования без упаковки можно запустить `python desktop_app/app.py` —
откроется окно с приложением, использующим встроенный сервер FastAPI.

При необходимости путь к каталогу с данными можно переопределить переменной
окружения `VISHMAT_DATA_DIR`.
