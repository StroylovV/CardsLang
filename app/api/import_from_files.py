import io
import logging
import re  # Добавили библиотеку для поиска квадратных скобок
from typing import Any, List
from fastapi import APIRouter, Depends, UploadFile, HTTPException, Form
from app.core.security import get_current_user_id
from app.schemas import Word_Create 
from app.service import WordService
import docx
from fastapi_cache import FastAPICache

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

ALLOWED_MIME_TYPES = [
    "text/plain",  # .txt
    "application/msword",  # .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"  # .docx
]

def pars_words(text: str) -> List[dict]:
    pairs = []
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
            
        word, translate, transcription = None, None, None
        
        # Перебираем возможные разделители
        for sep in [" - ", " / ", " — "]:
            if sep in line:
                # Разбиваем строку по разделителю и очищаем от пробелов
                parts = [p.strip() for p in line.split(sep)]
                
                # Если в строке 3 части: Слово - Транскрипция - Перевод
                if len(parts) >= 3:
                    word = parts[0]
                    transcription = parts[1]
                    translate = parts[2]
                    break
                    
                # Если в строке 2 части: Слово - Перевод
                elif len(parts) == 2:
                    word = parts[0]
                    translate = parts[1]
                    
                    # Проверяем, есть ли транскрипция в квадратных скобках (например: apple [æpl])
                    match = re.match(r"^(.*?)\s*\[(.*?)\]$", word)
                    if match:
                        word = match.group(1).strip()
                        transcription = match.group(2).strip()
                    break
                    
        if word and translate:
            pairs.append({
                "word": word, 
                "translate": translate, 
                "transcription": transcription
            })
    
    return pairs

@router.post("/app/import_files")
async def import_words_from_files(
    file: UploadFile,
    dictionary_id: int = Form(...),
    word_service: WordService = Depends(),
    current_user_id: int = Depends(get_current_user_id)
) -> Any:

    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400, 
            detail="Неверный формат файла. Разрешены только .txt, .doc и .docx"
        )

    try:
        data = await file.read() 
        
        # (.txt)
        if file.content_type == "text/plain":
            text = data.decode("utf-8")
            parsed_data = pars_words(text)

        # (.docx)
        elif file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            document = docx.Document(io.BytesIO(data))
            full_text = "\n".join([paragraph.text for paragraph in document.paragraphs])
            parsed_data = pars_words(full_text)

        # (.doc)
        elif file.content_type == "application/msword":
            raise HTTPException(
                status_code=400, 
                detail="Формат .doc устарел. Пожалуйста, откройте файл в Word и пересохраните его как .docx"
            )
            
        for item in parsed_data:
            new_word = Word_Create(
                word=item["word"], 
                translate=item["translate"],
                transcription=item["transcription"]
            )
            
            await word_service.add_word(new_word, dictionary_id=dictionary_id)

        await FastAPICache.clear(namespace="summary")
        return {
            "message": f"Успешно обработано слов: {len(parsed_data)}", 
            "data": parsed_data
        }
            
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Ошибка кодировки файла. Используйте UTF-8.")
    except Exception as e:
        logger.error(f"Ошибка при обработке файла '{file.filename}': {str(e)}")
        
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера при обработке файла")