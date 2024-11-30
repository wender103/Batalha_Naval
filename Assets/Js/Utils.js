function Obter_Coordenadas(numero) {
    if (numero < 0 || numero > 99) {
        throw new Error('O número deve estar entre 0 e 99')
    }
    
    const x = Math.floor(numero / 10) // Calcula a linha (divisão inteira por 10)
    const y = numero % 10 // Calcula a coluna (resto da divisão por 10)
    
    return { x, y }
}

function Confetes() {
    if (typeof confetti !== 'function') {
        console.error('Confetti não foi carregado! Verifique a inclusão do script no HTML.')
        return
    }

    let params = {
        particleCount: 500, // Quantidade de confetes
        spread: 90, // O quanto eles se espalham
        startVelocity: 70, // Velocidade inicial
        origin: { x: 0, y: 1 }, // Posição inicial na tela
        angle: 45 // Ângulo em que os confetes serão lançados
    }

    // Joga confetes da esquerda pra direita
    confetti(params)

    // Joga confetes da direita para a esquerda
    params.origin.x = 1
    params.angle = 135
    confetti(params)
}

let chuvaIntervalo = null

function Chuva_De_Confetes() {
    if (!chuvaIntervalo) {
        chuvaIntervalo = setInterval(Confetes, 2200) // Chama a função Confetes a cada 500ms
    }
}

function Parar_Chuva_De_Confetes() {
    if (chuvaIntervalo) {
        clearInterval(chuvaIntervalo) // Para a execução
        chuvaIntervalo = null // Reseta o ID do intervalo
    }
}

//? Converte a matriz para obj para o Firebase entender
function ConverterMatrizParaObjeto(matriz) {
    return matriz.map((linha, index) => ({ id: index, valores: linha }))
}

//? Converte para matriz para o código entender
function ConverterObjetoParaMatriz(objeto) {
    return objeto.map(item => item.valores)
}