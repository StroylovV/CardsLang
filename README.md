# 🌍 CardsLang API

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Poetry](https://img.shields.io/badge/Poetry-60A5FA?style=for-the-badge&logo=python&logoColor=white)](https://python-poetry.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=for-the-badge&logo=sqlalchemy)](https://www.sqlalchemy.org/)

**CardsLang** — это асинхронный бэкенд для сервиса изучения иностранных языков. Позволяет пользователям создавать персональные словари, управлять карточками слов и эффективно расширять словарный запас.

## ✨ Ключевые особенности

* **Async First**: Полностью асинхронная архитектура (FastAPI + SQLAlchemy 2.0 + AsyncPG).
* **Умные словари**: Автоматическое создание словаря при первом обращении к конкретному языку.
* **Безопасность**: 
    * Аутентификация через **JWT** в HttpOnly Cookies.
    * Хеширование паролей с использованием `passlib` и `bcrypt`.
* **Валидация**: Строгая типизация данных на входе и выходе с помощью Pydantic v2.
* **Менеджмент зависимостей**: Использование `Poetry` для детерминированных сборок.

## 🛠 Технологический стек

* **Язык:** Python 3.11+
* **Фреймворк:** FastAPI
* **ORM:** SQLAlchemy 2.0 (Async)
* **База данных:** PostgreSQL / SQLite
* **Миграции:** Alembic (опционально)
* **Валидация:** Pydantic v2

## 🚀 Быстрый старт

### Требования
* Python 3.11 или выше

### Установка

1. **Клонируйте репозиторий:**
   ```bash
   git clone [https://github.com/StroylovV/CardsLang.git](https://github.com/StroylovV/CardsLang.git)
   cd CardsLang
### Внешний экземпляр PostgreSQL

1. Установите интерпретатор Python (>=3.12)
2. Установите `poetry` в глобальное окружение интерпретатора командой:
```bash
pip install poetry
```
3. Перейдите в директорию с файлом `pypoetry.toml` и выполните из нее следующую команду для создания виртуального окружения и установки зависимостей:
```bash
poetry install
```
4. Настройте переменные окружения:
Создайте файл .env в корне проекта на основе этого примера:
   ```bash
    API__TITLE="CardsLang API"
    API__DESCRIPTION="API для карточек слов"
    API__VERSION=1.0.0
    API__CONTACT_NAME="Vitaliy Stroylov"
    API__CONTACT_EMAIL="vitaliestroilov@yandex.ru"
    API__CONTACT_URL="https://t.me/stroylovv"
    
    DATABASE__POSTGRES_HOST=localhost
    DATABASE__POSTGRES_PORT=5432
    DATABASE__POSTGRES_USER=postgres
    DATABASE__POSTGRES_PASSWORD=postgres
    DATABASE__POSTGRES_DB=CardsLang
    
    SECURITY__JWT_SECRET_KEY=change-in-production
    SECURITY__JWT_ALGORITHM=HS256
    SECURITY__JWT_EXPIRE_MINUTES=30
5. Настройте значения переменных окружения в файле `.env`

6. Запустите приложение командой:
  ```bash
  poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000
  ```