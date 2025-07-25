from fastapi import FastAPI, HTTPException
from pydantic import BaseModel # Importacion de BaseModel de Pydantic para definir la estructura de datos de las peticiones.
from openai import OpenAI # Importa el cliente de openAI para interactuar con su API (o la de OpenRouter).
from config import PROMPT_SISTEMA
from dotenv import load_dotenv #Importa load_dotenv para cargar variables del archivo .env
import os # Importa el modulo 'os' para acceder al sistema operativo, aquí para acceder a variables de entorno.

from fastapi.staticfiles import StaticFiles # Importa StaticFiles para permitir que FastAPI sirva (Proceso directo de entrega) archivos estáticos (HTML, CSS, JS).
from fastapi.responses import HTMLResponse # Importa HTMLResponse para poder devolver contenido HTML directamente como respuesta.


# Cargar variables de entorno
load_dotenv() # Carga las variables de entorno definidas en el archivo .env

API_KEY = os.getenv("API_KEY")
BASE_URL = os.getenv("BASE_URL")

client = OpenAI(api_key=API_KEY, base_url=BASE_URL) # Inicializa el cliente de OpenAI (que se conecta a OpenRouter) usando la clave y URL obtenidas.

# Inicializar FastAPI
app = FastAPI() # Crea una instancia de la aplicación FastAPI. Esta es la base de mi API web.

# Monta la carpeta 'static' del proyecto para que sea accesible públicamente en la URL /static.
# Esto permite que el navegador cargue archivos como CSS, JavaScript e imágenes desde esa ruta.
app.mount("/static", StaticFiles(directory="static"), name="static")

# Define una ruta para la URL raíz ("/") de tu aplicación web.
@app.get("/", response_class=HTMLResponse) # Decorador: Cuando una petición GET llegue a la raíz, esta función se ejecutará y devolverá HTML.
async def read_root():  # Define la función asíncrona que maneja la petición GET a la raíz.
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
