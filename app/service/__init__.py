from app.service.words import WordService
from app.service.dictionary import DictionaryService
from app.service.user import UserService

# Для удобства импорта сервисов в других модулях
__all__ = ["UserService", "WordService", "DictionaryService"]