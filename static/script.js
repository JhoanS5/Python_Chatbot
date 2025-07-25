const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// La referencia al indicador de escritura ahora será una variable mutable (let)
// porque el elemento se creará y se destruirá dinámicamente.
// Inicialmente es null porque el div no existe en el HTML al cargar la página.
let typingIndicatorDiv = null;


// Funcion para añadir mensajes al chat
function addMensaje(mensaje, remitente){
    const mensajeBurbuja = document.createElement('div');

    mensajeBurbuja.classList.add('bubble');

    if (remitente === 'user'){
        mensajeBurbuja.classList.add('user-bubble');

    }else{ // sender === 'bot'
        mensajeBurbuja.classList.add('bot-bubble')
    }

    mensajeBurbuja.textContent = mensaje;

    chatBox.appendChild(mensajeBurbuja);
    chatBox.scrollTop = chatBox.scrollHeight; // Hacer scroll automatico hacia abajo.
}

// Funciones para manejar el indicador de "pensando".

function mostrarLaBurbuja(){
    // Solo creamos el indicador si no existe ya
    if (!typingIndicatorDiv) {
        typingIndicatorDiv = document.createElement('div');
        typingIndicatorDiv.classList.add('typing-indicator');
        // Asignamos el contenido con los spans para la animación
        typingIndicatorDiv.innerHTML = '<span></span><span></span><span></span>'; 
        
        // Añadimos el indicador al chatBox
        chatBox.appendChild(typingIndicatorDiv);
    }
    // Aseguramos que esté visible (aunque ya lo hará el `appendChild` si es nuevo)
    typingIndicatorDiv.style.display = 'flex';
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll para verlo
} 

function ocultarLaBurbuja(){
    // Solo removemos el indicador si existe
    if (typingIndicatorDiv) {
        chatBox.removeChild(typingIndicatorDiv);
        typingIndicatorDiv = null; // Reseteamos la referencia para que se pueda crear de nuevo
    }
}

// Enviar el mensaje al backend (API)
async function enviarMensajeBackend() {
    // Obtengo la pregunta del usuario.
    const pregunta = userInput.value.trim();

    // Valido la pregunta
    if (pregunta === ''){
        return;
    }

    addMensaje(pregunta, 'user');
    userInput.value = ''; // Limpio la entrada del usuario luego de enviar su mensaje.

    mostrarLaBurbuja(); // Muestra el indicador antes de la petición

    //Manejo la peticion a la API.
    try{
        const respuesta = await fetch("http://127.0.0.1:8000/chat",{
            method: "POST",
            headers:{
                // "Content-Type" le dice al servidor qué tipo de datos estamos enviando en el cuerpo de la petición.
                "Content-Type": "application/json"
            },
            // Esto es lo que tu endpoint de FastAPI espera en el cuerpo de la petición.
            body: JSON.stringify({pregunta: pregunta})
        });

        if (!respuesta.ok){
            // Si la respuesta no es OK (ej. 404 Not Found, 500 Internal Server Error),
            // intentamos parsear el error del servidor (si es JSON).
            const errorData = await respuesta.json();
            // Lanzamos un nuevo error con el detalle del servidor o un mensaje genérico.
            throw new Error(errorData.detail || 'Error en la comunicación con el servidor');
        }

        const data = await respuesta.json();

        addMensaje(data.respuesta, 'bot');

    }catch (error){
        console.error('Error al enviar mensaje:', error);

        addMensaje('Lo siento, hubo un error al conectar con el asistente. Intenta de nuevo más tarde.', 'bot');

    }finally{
        ocultarLaBurbuja(); // Oculta el indicador al finalizar, sea éxito o error
    }

}

// Asignar los "escuchadores de eventos".

// Los escuchadores de eventos son como "sensores" que esperan a que ocurra un evento (como un clic o una pulsación de tecla)
// y luego ejecutan una función específica.

sendButton.addEventListener('click', enviarMensajeBackend);

userInput.addEventListener('keypress', (e) =>{
    if (e.key === 'Enter'){
        e.preventDefault(); // Detiene la acción por defecto del navegador para la tecla "Enter"
        enviarMensajeBackend();
    }
});

