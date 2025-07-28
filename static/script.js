const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

let typingIndicatorDiv = null;

// Funcion para añadir mensajes al chat
function addMensaje(mensaje, remitente){
    const mensajeBurbuja = document.createElement('div');

    mensajeBurbuja.classList.add('bubble');

    if (remitente === 'user'){
        mensajeBurbuja.classList.add('user-bubble');

    }else{
        mensajeBurbuja.classList.add('bot-bubble')
    }

    mensajeBurbuja.textContent = mensaje;

    chatBox.appendChild(mensajeBurbuja);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Funciones para manejar el indicador de "pensando".
function mostrarLaBurbuja(){

    if (!typingIndicatorDiv) {
        typingIndicatorDiv = document.createElement('div');
        typingIndicatorDiv.classList.add('typing-indicator');
        typingIndicatorDiv.innerHTML = '<span></span><span></span><span></span>'; 
        
        chatBox.appendChild(typingIndicatorDiv);
    }
    
    typingIndicatorDiv.style.display = 'flex';
    chatBox.scrollTop = chatBox.scrollHeight; 
} 

function ocultarLaBurbuja(){
    
    if (typingIndicatorDiv) {
        chatBox.removeChild(typingIndicatorDiv);
        typingIndicatorDiv = null; 
    }
}

// Enviar el mensaje al backend (API)
async function enviarMensajeBackend() {
    
    const pregunta = userInput.value.trim();

    if (pregunta === ''){
        return;
    }

    addMensaje(pregunta, 'user');
    userInput.value = ''; 

    mostrarLaBurbuja(); 

    //Manejo la peticion a la API.
    try{
        const respuesta = await fetch("http://127.0.0.1:8000/chat",{
            method: "POST",
            headers:{
                
                "Content-Type": "application/json"
            },
            
            body: JSON.stringify({pregunta: pregunta})
        });

        if (!respuesta.ok){
            const errorData = await respuesta.json();
            
            throw new Error(errorData.detail || 'Error en la comunicación con el servidor');
        }

        const data = await respuesta.json();

        addMensaje(data.respuesta, 'bot');

    }catch (error){
        console.error('Error al enviar mensaje:', error);

        addMensaje('Lo siento, hubo un error al conectar con el asistente. Intenta de nuevo más tarde.', 'bot');

    }finally{
        ocultarLaBurbuja(); 
    }

}

sendButton.addEventListener('click', enviarMensajeBackend);

userInput.addEventListener('keypress', (e) =>{
    if (e.key === 'Enter'){
        e.preventDefault(); 
        enviarMensajeBackend();
    }
});

