from app.schemas import Word_Create
from fastapi import APIRouter, HTTPException

words_list = [
    {
        "id": 1,
        "word": "hello",
        "translate": "Привет",
        
    },
    {
        "id": 2,
        "word": "sasi",
        "translate": "sasi",
        
    },
]

router=APIRouter()

@router.get("/words")
def get_words():
    return {"words": words_list, "total": len(words_list)}

@router.get("/words/{word_id}")
async def get_word(word_id: int):
    for word in words_list:  # ← Обновлено (не async for)
        if word["id"] == word_id:
            return word
    raise HTTPException(status_code=404, detail=f"Слово с id {word_id} не найдено")
    
    

@router.post("/word")
def add_words(add_word: Word_Create):
    words_list.append({
        "id":len(words_list)+1,
        "word":add_word.Word,
        "translate":add_word.Translate,
    })
    return {"Ok":True}

@router.delete("/word")
def del_word():
    pass