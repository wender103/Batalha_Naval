function Tocar_Musica() {
    // Cria um novo objeto Audio
    const audio = new Audio('Assets/Audios/Agua.mp3')

    // Configura o áudio para tocar em loop
    audio.loop = true
    audio.volume = 0.1

    // Toca o áudio
    audio.play()

    // Retorna o objeto de áudio caso precise manipulá-lo depois
    return audio
}

document.addEventListener('click', () => {
    Tocar_Musica()
})

function Tocar_Tiro_Na_Agua() {
    // Cria um novo objeto Audio
    const audio = new Audio('Assets/Audios/Explosao_Error.mp3')

    // Configura o áudio para tocar em loop
    audio.loop = false
    audio.volume = 0.6

    // Toca o áudio
    audio.play()

     // Cria um novo objeto Audio
    const audio2 = new Audio('Assets/Audios/Caindo_Na_Agua.mp3')

    // Configura o áudio para tocar em loop
    audio2.loop = false
    audio2.volume = 0.6

    // Toca o áudio
    setTimeout(() => {
        audio2.play()
    }, 700)

    // Retorna o objeto de áudio caso precise manipulá-lo depois
    return audio
}

function Tocar_Tiro_Acerto() {
    // Cria um novo objeto Audio
    const audio = new Audio('Assets/Audios/Explosao_Acerto.mp3')

    // Configura o áudio para tocar em loop
    audio.loop = false
    audio.volume = 0.6

    // Toca o áudio
    audio.play()
}

function Tocar_Vitoria() {
    // Cria um novo objeto Audio
    const audio = new Audio('Assets/Audios/Vitoria.mp3')

    // Configura o áudio para tocar em loop
    audio.loop = false
    audio.volume = 0.6

    // Toca o áudio
    audio.play()
}

function Tocar_Derrota() {
    // Cria um novo objeto Audio
    const audio = new Audio('Assets/Audios/Derrota.mp3')

    // Configura o áudio para tocar em loop
    audio.loop = false
    audio.volume = 0.6

    // Toca o áudio
    audio.play()
}