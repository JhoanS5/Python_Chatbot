from fastapi import FastAPI, HTTPException
from pydantic import BaseModel 
from openai import OpenAI 
from config import PROMPT_SISTEMA
from dotenv import load_dotenv 
import os 

from fastapi.staticfiles import StaticFiles 
from fastapi.responses import HTMLResponse 


# Cargar variables de entorno
load_dotenv() 

API_KEY = os.getenv("API_KEY")
BASE_URL = os.getenv("BASE_URL")

client = OpenAI(api_key=API_KEY, base_url=BASE_URL) 

# Inicializar FastAPI
app = FastAPI() 

# Esto permite que el navegador cargue archivos como CSS, JavaScript e imágenes desde esa ruta.
app.mount("/static", StaticFiles(directory="static"), name="static")

# Define una ruta para la URL raíz ("/") de tu aplicación web.
@app.get("/", response_class=HTMLResponse) 
async def read_root(): 
    with open("static/index.html", "r", encoding="utf-8") as Archivo:
        html_content = Archivo.read()
    return html_content

# Modelo de entrada
class Pregunta(BaseModel):
    pregunta: str

# Ruta principal de la API
@app.post("/chat")
def obtener_respuesta(p: Pregunta):
    try:
        response = client.chat.completions.create(
            model="mistralai/mistral-small-3.1-24b-instruct:free",
            messages=[
                {"role": "system", "content": PROMPT_SISTEMA},
                {"role": "user", "content": p.pregunta}
            ],
            stream=False
        )

        respuesta = response.choices[0].message.content.strip()
        if not respuesta:
            respuesta = "No estoy seguro de cómo responder a eso. ¿Puedes reformular la pregunta?"

        return {"respuesta": respuesta}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
