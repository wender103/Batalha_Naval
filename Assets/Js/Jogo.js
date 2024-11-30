const Barcos = [
    { tipo: 'G', num: 3, tamanho: 4, url: 'Assets/Imgs/Background/Barco_G.png' },
    { tipo: 'M', num: 3, tamanho: 3, url: 'Assets/Imgs/Background/Barco_M.png' },
    { tipo: 'N', num: 4, tamanho: 2, url: 'Assets/Imgs/Background/Barco_N.png' },
    { tipo: 'P', num: 1, tamanho: 1, url: 'Assets/Imgs/Background/Barco_P.png' }
]

let Sala_Atual = undefined

function GerarMatriz() {
    const TamanhoGrade = 10
    const matriz = Array(TamanhoGrade).fill(null).map(() => Array(TamanhoGrade).fill(0))

    let barcoID = 1 // Contador para IDs únicos dos barcos

    function PodePosicionar(x, y, tamanho, orientacao) {
        if (orientacao === 'horizontal') {
            if (y + tamanho > TamanhoGrade) return false
            for (let i = 0; i < tamanho; i++) {
                if (matriz[x][y + i] !== 0) return false
            }
        } else { // vertical
            if (x + tamanho > TamanhoGrade) return false
            for (let i = 0; i < tamanho; i++) {
                if (matriz[x + i][y] !== 0) return false
            }
        }
        return true
    }

    function PosicionarBarco(x, y, tamanho, orientacao, tipo) {
        const idBarco = `${tipo}_${barcoID}` // ID único do barco
        if (orientacao === 'horizontal') {
            for (let i = 0; i < tamanho; i++) {
                matriz[x][y + i] = idBarco
            }
        } else { // vertical
            for (let i = 0; i < tamanho; i++) {
                matriz[x + i][y] = idBarco
            }
        }
    }

    Barcos.forEach(barco => {
        for (let i = 0; i < barco.num; i++) {
            let posicionado = false
            while (!posicionado) {
                const x = Math.floor(Math.random() * TamanhoGrade)
                const y = Math.floor(Math.random() * TamanhoGrade)
                const orientacao = Math.random() < 0.5 ? 'horizontal' : 'vertical'

                if (PodePosicionar(x, y, barco.tamanho, orientacao)) {
                    PosicionarBarco(x, y, barco.tamanho, orientacao, barco.tipo)
                    barcoID++ // Incrementa o ID único após posicionar o barco
                    posicionado = true
                }
            }
        }
    })

    return matriz
}

let Minha_Matriz
let Matriz_Bot = []
let Matriz_Inimigo

function Jogar_Novamente(Desmarcar_Reiniciar) {
    if(Sala_Atual) {
        if(Sala_Atual.Criador.Email == Usuario.email) {
            Sala_Atual.Oponente.Matriz = ConverterMatrizParaObjeto(GerarMatriz())
            Sala_Atual.Criador.Matriz = ConverterMatrizParaObjeto(GerarMatriz())

            db.collection('Salas_Batalha_Naval').doc(Sala_Atual.Criador.Email).update({ 
                Oponente: Sala_Atual.Oponente, 
                'Criardor': Sala_Atual.Criador,
                'Jogadas.Movimentos': [],
                'Jogadas.Vez_De': ContarBarcos().Vencedor,
                'Reiniciar_Jogo': true
            }).then(() => {
                Iniciar_Jogo(ConverterObjetoParaMatriz(Sala_Atual.Oponente.Matriz), Sala_Atual.Oponente.Email)
                Iniciar_Jogo(ConverterObjetoParaMatriz(Sala_Atual.Criador.Matriz), Sala_Atual.Criador.Email)
            })

        } else if (Desmarcar_Reiniciar) {
            db.collection('Salas_Batalha_Naval').doc(Sala_Atual.Criador.Email).update({ Reiniciar_Jogo: false }).then(() => {
                Iniciar_Jogo(ConverterObjetoParaMatriz(Sala_Atual.Oponente.Matriz), Sala_Atual.Oponente.Email)
                Iniciar_Jogo(ConverterObjetoParaMatriz(Sala_Atual.Criador.Matriz), Sala_Atual.Criador.Email)
            })
        }

    } else {
        Iniciar_Jogo(null)
        Iniciar_Jogo(GerarMatriz())
    }

    Container_Btns_Jogo.style.display = 'none'
    Parar_Chuva_De_Confetes()
}

function Iniciar_Jogo(matrizRecebida = null, Jogador=null) {
    const QuadradoPessoal = document.querySelector("#Quadrado_Pessoal")
    const QuadradoInimigo = document.querySelector("#Quadrado_Inimigo")
    const TamanhoGrade = 10 // Grade 10x10

    let BarcosRestantes = 0 // Total de partes dos barcos a serem destruídas

    function CriarGrade(Quadrado) {
        for (let i = 0; i < TamanhoGrade * TamanhoGrade; i++) {
            const Quadradinho = document.createElement('div')
            Quadradinho.classList.add('Quadradinho')

            // Adiciona o atributo data-x com o índice do quadradinho
            Quadradinho.setAttribute('data-x', i)

            if (Quadrado.id == "Quadrado_Inimigo") {
                //* Atacando --------------------------------------------
                Quadradinho.addEventListener('click', () => {
                    let Pode_Jogar = true

                    if(Sala_Atual) {
                        Pode_Jogar = Sala_Atual.Jogadas.Vez_De == Usuario.email
                    }

                    if(ContarBarcos().Vc_Precisa_Achar > 0 && ContarBarcos().Inimigo_Precisa_Achar > 0 && Pode_Jogar) {
                        if (Quadradinho.classList.contains("Clicked")) return

                        Quadradinho.classList.add('Clicked')

                        const resultado = Obter_Coordenadas(i)
                        Fazer_Mira(resultado.x, resultado.y)

                        const Img = Quadradinho.querySelector('img')
                        if (Img) {
                            Img.classList.add('Active')

                            if(Sala_Atual) {
                                Salvar_Jogada(resultado.x, resultado.y, false)
                            }

                        } else {
                            Quadradinho.classList.add('Missed')
                            if(!Sala_Atual) {
                                setTimeout(() => {
                                    Bot_Jogar()
                                }, 1000)
                            } else {
                                Salvar_Jogada(resultado.x, resultado.y)     
                            }
                        }
                        
                        if(Matriz_Inimigo[resultado.x][resultado.y] == 0) {
                            Matriz_Inimigo[resultado.x][resultado.y] = 'O'
                            Tocar_Tiro_Na_Agua()
                        } else {
                            Matriz_Inimigo[resultado.x][resultado.y] = 'X'
                            Tocar_Tiro_Acerto()
                        }

                        ContarBarcos()
                        Informar_Resultado()
                    }
                })

                Quadradinho.addEventListener('mouseenter', () => {
                    if(ContarBarcos().Vc_Precisa_Achar > 0 && ContarBarcos().Inimigo_Precisa_Achar > 0) {
                        const resultado = Obter_Coordenadas(i)
                        Fazer_Mira(resultado.x, resultado.y)
                    }
                })
            }

            Quadrado.appendChild(Quadradinho)
        }
    }

    const matriz = matrizRecebida || GerarMatriz()   

    if (!matrizRecebida && Jogador == null || matrizRecebida && Jogador == Usuario.email) {
        Minha_Matriz = matriz
        Matriz_Bot = [...Minha_Matriz]
    } else if(matrizRecebida && Jogador == null || matrizRecebida && Jogador != Usuario.email) {
        Matriz_Inimigo = matriz
    }

    let QuadradoAlvo = matrizRecebida ? QuadradoInimigo : QuadradoPessoal

    //? Caso o email for igual o email do user, os barcos irão ficar na lateral esquerda caso contrario na lateral direita onde o user terá de acertar o inimigo
    if(Jogador) {
        if(Jogador == Usuario.email) {
            QuadradoAlvo = QuadradoPessoal
        } else {
            QuadradoAlvo = QuadradoInimigo
        }
    }

    QuadradoAlvo.innerHTML = ''
    CriarGrade(QuadradoAlvo)

    const Quadradinhos = QuadradoAlvo.querySelectorAll('.Quadradinho')

    function PosicionarBarcoMatriz() {
        matriz.forEach((linha, x) => {
            linha.forEach((tipo, y) => {
                if (tipo !== 0) {
                    const barco = Barcos.find(b => b.tipo === tipo[0])                    
                                       
                    BarcosRestantes++

                    const index = x * TamanhoGrade + y
                    const Img = document.createElement('img')
                    Img.src = barco.url


                    const isHorizontal = (y > 0 && matriz[x][y - 1] === tipo) || (y < TamanhoGrade - 1 && matriz[x][y + 1] === tipo)
                    const isVertical = (x > 0 && matriz[x - 1][y] === tipo) || (x < TamanhoGrade - 1 && matriz[x + 1][y] === tipo)

                    if (barco.tamanho > 1) {
                        if (isHorizontal) {
                            const isStart = y === 0 || matriz[x][y - 1] !== tipo
                            const isEnd = y === TamanhoGrade - 1 || matriz[x][y + 1] !== tipo

                            if (isStart) Img.style.objectPosition = 'left center'
                            else if (isEnd) Img.style.objectPosition = 'right center'
                            else Img.style.objectPosition = 'center center'
                        } else if (isVertical) {
                            Img.style.transform = 'rotate(90deg)'

                            const isStart = x === 0 || matriz[x - 1][y] !== tipo
                            const isEnd = x === TamanhoGrade - 1 || matriz[x + 1][y] !== tipo

                            if (isStart) Img.style.objectPosition = 'left center'
                            else if (isEnd) Img.style.objectPosition = 'right center'
                            else Img.style.objectPosition = 'center center'
                        }
                    } else {
                        Img.style.objectPosition = 'center center'
                        Img.style.objectFit = 'contain'
                    }

                    Quadradinhos[index].appendChild(Img)
                }
            })
        })
    }

    PosicionarBarcoMatriz()
}

//! Bot 
// Função para marcar o quadrado no tabuleiro
function marcarQuadrado(x, y, classe='Crash') {
    // Supondo que cada linha tenha N colunas
    const N = Math.sqrt(document.querySelectorAll('#Quadrado_Pessoal .Quadradinho').length)

    // Calcular o índice baseado em x e y
    const indice = x * N + y

    // Selecionar pelo índice
    const quadrado = document.querySelector(`#Quadrado_Pessoal .Quadradinho:nth-child(${indice + 1})`)
    
    if (quadrado) {
        quadrado.classList.add(classe)
    }
}


// Função para o bot atacar
function Bot_Jogar(_Cordenada_X, _Cordenada_Y, Buscar_Barco=true, Jogador =false) {

    function Sortear_Jogada() {
        const x = Math.floor(Math.random() * 10)
        const y = Math.floor(Math.random() * 10)

        if(!Checar_Local_Ja_Atacado(x, y)) {

            return [x, y]
        } else {
            return Sortear_Jogada()
        }
    }

    let [X, Y] = Sortear_Jogada()
    
    if(_Cordenada_X != undefined && _Cordenada_Y != undefined) {
        X = _Cordenada_X
        Y = _Cordenada_Y
        
    }
    
    if(!Checar_Local_Ja_Atacado(X, Y)) {
        marcarQuadrado(X, Y, 'Crash')

        //? Caso o bot acerte o tiro
        if(Matriz_Bot[X][Y] != 0) {
            if(!Jogador) {
                if(Matriz_Bot[X][Y] != 'P') {
                    if(Buscar_Barco) {
                        const Barco = Matriz_Bot[X][Y]
                        setTimeout(() => {
                            Buscar_Barco_Proximo(X, Y, Barco)
                        }, 1000)
                    }
                } else {
                    setTimeout(() => {
                        Bot_Jogar()
                    }, 1000)
                }
            }

            Tocar_Tiro_Acerto()
            Matriz_Bot[X][Y] = 'X'

        } else {
            Tocar_Tiro_Na_Agua()
            Matriz_Bot[X][Y] = 'O'
        }

        Informar_Resultado()
    }

}

function Buscar_Barco_Proximo(X, Y, Barco) {
    const barcoInfo = Barcos.find(b => b.tipo === Barco[0])
    if (!barcoInfo) return [] // Se o barco não existe na lista, retorna vazio

    const tamanho = barcoInfo.tamanho
    const resultado = []

    // Função auxiliar para verificar se a posição está dentro da matriz
    function posicaoValida(x, y) {
        return x >= 0 && x < Matriz_Bot.length && y >= 0 && y < Matriz_Bot[0].length
    }

    // Procurar em todas as direções
    // Cima
    for (let i = 1; i <= tamanho; i++) {
        const novoX = X - i
        if (posicaoValida(novoX, Y) && Matriz_Bot[novoX][Y] === Barco) {
            resultado.push({ x: novoX, y: Y })
        } else {
            break
        }
    }

    // Baixo
    for (let i = 1; i <= tamanho; i++) {
        const novoX = X + i
        if (posicaoValida(novoX, Y) && Matriz_Bot[novoX][Y] === Barco) {
            resultado.push({ x: novoX, y: Y })
        } else {
            break
        }
    }

    // Direita
    for (let i = 1; i <= tamanho; i++) {
        const novoY = Y + i
        if (posicaoValida(X, novoY) && Matriz_Bot[X][novoY] === Barco) {
            resultado.push({ x: X, y: novoY })
        } else {
            break
        }
    }

    // Esquerda
    for (let i = 1; i <= tamanho; i++) {
        const novoY = Y - i
        if (posicaoValida(X, novoY) && Matriz_Bot[X][novoY] === Barco) {
            resultado.push({ x: X, y: novoY })
        } else {
            break
        }
    }

    if(resultado.length > 0) {
        for (let c = 0; c < resultado.length; c++) {
            setTimeout(() => {
                Bot_Jogar(resultado[c].x, resultado[c].y, false)
            }, c * 1000)
        }

        setTimeout(() => {
            Bot_Jogar()
        }, 1600)
    } else {
        setTimeout(() => {
            Bot_Jogar()
        }, 1000)
    }
}

function Checar_Local_Ja_Atacado(x, y) {    
    //? Linhas
    if(Matriz_Bot[x][y] == 'X' || Matriz_Bot[x][y] == 'O') {
        return true
    } else {
        return false
    }
}

const Botao_Jogar_Contra_Bot = document.getElementById("Botao_Jogar_Contra_Bot")
Botao_Jogar_Contra_Bot.addEventListener('click', () => {
    Iniciar_Jogo(null)
    Iniciar_Jogo(GerarMatriz())
    ContarBarcos()
})

function Fazer_Mira(X, Y) {
    const QuadradoInimigo = document.querySelector("#Quadrado_Inimigo")

    QuadradoInimigo.querySelectorAll('.Quadradinho').forEach(quadrado => {
        const DataX = parseInt(quadrado.dataset.x) // Converte para número inteiro
        const Coordenadas = Obter_Coordenadas(DataX) // Converte o índice para coordenadas

        // Verifica se a coordenada está alinhada com a mira
        if (Coordenadas.x === X && !quadrado.classList.contains('Clicked') || Coordenadas.y === Y && !quadrado.classList.contains('Clicked')) {
            quadrado.classList.add('Mira')
        } else {
            quadrado.classList.remove('Mira')
        }
    })
}

function ContarBarcos() {
    let Barcos_Encontrados = []
    for (let c = 0; c < Matriz_Inimigo.length; c++) {
        for (let b = 0; b < Matriz_Inimigo[c].length; b++) {
            if(Matriz_Inimigo[c][b] != 0 && Matriz_Inimigo[c][b] != 'X' && Matriz_Inimigo[c][b] != 'O') {
                Barcos_Encontrados.push(Matriz_Inimigo[c][b])
            }
        }
    }

    let Barcos_Encontrados_Inimigo = []
    for (let c = 0; c < Matriz_Bot.length; c++) {
        for (let b = 0; b < Matriz_Bot[c].length; b++) {
            if(Matriz_Bot[c][b] != 0 && Matriz_Bot[c][b] != 'X' && Matriz_Bot[c][b] != 'O') {
                Barcos_Encontrados_Inimigo.push(Matriz_Bot[c][b])
            }
        }
    }

    let Barcos_N_Repetidos = [...new Set(Barcos_Encontrados)]
    let Barcos_N_Repetidos_Inimigo = [...new Set(Barcos_Encontrados_Inimigo)]
    
    // Atualiza o p com a quantidade de barcos e emojis
    const pElemento = document.querySelector('#Qtns_Barcos')
    const emojiBarco = '🚢'
    pElemento.textContent = `${emojiBarco.repeat(Barcos_N_Repetidos.length)} (${Barcos_N_Repetidos.length} barcos)`

    let Email_Ganhador = null

    if(Sala_Atual) {
        let Eh_Dono_Sala = Sala_Atual.Criador.Email == Usuario.email
        let Ganhou = null

        if(Barcos_N_Repetidos.length < 1 && Barcos_N_Repetidos_Inimigo.length > 0) {
            Ganhou = true
        } else if(Barcos_N_Repetidos_Inimigo.length < 1 && Barcos_N_Repetidos.length > 0) {
            Ganhou = false
        }

        if(Ganhou != null) {
            if(Ganhou && Eh_Dono_Sala) {
                Email_Ganhador = Usuario.email
            } else if(!Ganhou && Eh_Dono_Sala) {
                Email_Ganhador = Sala_Atual.Oponente.Email
            } else if(Ganhou && !Eh_Dono_Sala) {
                Email_Ganhador = Sala_Atual.Oponente.Email
            }  else if(!Ganhou && !Eh_Dono_Sala) {
                Email_Ganhador = Sala_Atual.Criador.Email
            }
        }
    }

    return {Vc_Precisa_Achar: Barcos_N_Repetidos.length, Inimigo_Precisa_Achar: Barcos_N_Repetidos_Inimigo.length, Vencedor: Email_Ganhador}
}

const Container_Btns_Jogo = document.getElementById('Container_Btns_Jogo')
const Btn_Jogar_Novamente = document.getElementById('Btn_Jogar_Novamente')
const P_Jogar_Novamente = document.getElementById('P_Jogar_Novamente')

Btn_Jogar_Novamente.addEventListener('click', () => {
    Jogar_Novamente()
})

function Informar_Resultado() {
    if(ContarBarcos().Vc_Precisa_Achar < 1) {
        Chuva_De_Confetes()
        Tocar_Vitoria()
        Container_Btns_Jogo.style.display = 'flex'

        if(Sala_Atual) {
            if(Sala_Atual.Criador.Email == Usuario.email) {
                P_Jogar_Novamente.style.display = 'none'
                Btn_Jogar_Novamente.style.display = 'block'

            } else {
                P_Jogar_Novamente.style.display = 'block'
                Btn_Jogar_Novamente.style.display = 'none'
            }
        } else {
            P_Jogar_Novamente.style.display = 'none'
        }

    } else if(ContarBarcos().Inimigo_Precisa_Achar < 1) {
        Container_Btns_Jogo.style.display = 'flex'

        if(Sala_Atual) {
            if(Sala_Atual.Criador.Email == Usuario.email) {
                P_Jogar_Novamente.style.display = 'none'
                Btn_Jogar_Novamente.style.display = 'block'

            } else {
                P_Jogar_Novamente.style.display = 'block'
                Btn_Jogar_Novamente.style.display = 'none'
            }
        } else {
            P_Jogar_Novamente.style.display = 'none'
        }

        setTimeout(() => {
            P_Sua_Vez_Aviso.innerText = 'Você perdeu! 😢'
        }, 1000)
    }
}

//? ------------------------------------------------------ Online ---------------------------------------------------------------------
function Criar_Sala() {
    const Input_Nome_Da_Nova_Sala = document.getElementById('Input_Nome_Da_Nova_Sala')

    if(Input_Nome_Da_Nova_Sala.value.trim() != '') {
        Abrir_Paginas('Pag_Esperando')

        const Nova_Sala = {
            Nome: Input_Nome_Da_Nova_Sala.value,
            Criador: {
                Email: Usuario.email,
                Matriz: ConverterMatrizParaObjeto(GerarMatriz())
            },
            Is_Publica: document.getElementById('Checkbox_Sala_Publica').checked,
            Oponente: null,
            Codigo: db.collection('Salas_Batalha_Naval').doc().id,
            Jogadas: {
                Vez_De: Usuario.email,
                Movimentos: []
            },
            Reiniciar_Jogo: false,
            Pontos: {
                Player1: 0,
                Player2: 0
            },
        }

        Sala_Atual = Nova_Sala

        Codigo_Da_Sala.innerText = Nova_Sala.Codigo

        db.collection('Salas_Batalha_Naval').doc(Usuario.email).set(Nova_Sala).then(() => {
            Input_Nome_Da_Nova_Sala.value = ''
            document.getElementById('Checkbox_Sala_Publica').checked = false
            Listner_Sala(Nova_Sala.Criador.Email)
        })
    }
}

function Excluir_Sala() {
    db.collection('Salas_Batalha_Naval').doc(Usuario.email).delete()
    Sala_Atual = undefined
}

const Container_Salas_Criadas = document.getElementById('Container_Salas_Criadas')
function Carregar_Salas_Criadas() {
    Container_Salas_Criadas.innerHTML = ''
    let Todas_As_Salas = []
    db.collection('Salas_Batalha_Naval').get().then(Snapshot => {
        let Snapshot_Salas = Snapshot.docs

        Snapshot_Salas.forEach(Sala => {
            Todas_As_Salas.push(Sala.data())

            if(Sala.data().Is_Publica && !Sala.data().Oponente) {
                const Div_Sala = document.createElement('div')
                const Nome_Sala = document.createElement('p')

                Nome_Sala.innerText = Sala.data().Nome
                Div_Sala.classList.add('Salas')

                Div_Sala.appendChild(Nome_Sala)
                Container_Salas_Criadas.appendChild(Div_Sala)

                Div_Sala.addEventListener('click', () => {
                    Entrar_Na_Sala(Sala.data().Codigo)
                })
            }
        })
    })
}

const Btn_Atualizar_Salas = document.getElementById('Btn_Atualizar_Salas')

Btn_Atualizar_Salas.addEventListener('click', () => {
    // Verifica se o botão já está bloqueado
    if (Btn_Atualizar_Salas.classList.contains('Bloqueado')) return

    // Chama a função para carregar as salas
    Carregar_Salas_Criadas()

    // Bloqueia o botão e adiciona a classe "Bloqueado"
    Btn_Atualizar_Salas.classList.add('Bloqueado')
    Btn_Atualizar_Salas.disabled = true

    // Define o temporizador de 3 segundos para desbloquear
    setTimeout(() => {
        Btn_Atualizar_Salas.classList.remove('Bloqueado')
        Btn_Atualizar_Salas.disabled = false
    }, 3000)
})

const Input_Entrar_Sala_Pelo_Codigo = document.getElementById('Input_Entrar_Sala_Pelo_Codigo')
Input_Entrar_Sala_Pelo_Codigo.addEventListener('keypress', (e) => {
    if(e.key == 'Enter' && Input_Entrar_Sala_Pelo_Codigo.value.trim() != '') {
        Entrar_Na_Sala(Input_Entrar_Sala_Pelo_Codigo.value)
    }
})

function Entrar_Na_Sala(_Codigo_Sala) {
    let Sala_Encontrada = false
    db.collection('Salas_Batalha_Naval').get().then(Snapshot =>  {
        let Snapshot_Salas = Snapshot.docs

        Snapshot_Salas.forEach(Sala => {
            if(Sala.data().Codigo == _Codigo_Sala) {
                Sala_Encontrada = true
                if(Sala.data().Oponente) {
                    Abrir_Paginas('Pag_Entrar_Em_Sala')
                    Carregar_Salas_Criadas()
                    alert('Alguém entrou na sala antes de você!')

                } else {
                    db.collection('Salas_Batalha_Naval').doc(Sala.data().Criador.Email).update({  
                        Oponente: { Email: Usuario.email, Matriz: ConverterMatrizParaObjeto(GerarMatriz()) }
                    }).then(() => {
                        Listner_Sala(Sala.data().Criador.Email)
                        document.getElementById('P_Sua_Vez_Aviso').innerText = 'Vez Do Oponente'
                    })
                }
            }
        })

        if(!Sala_Encontrada) {
            alert('Sala não encontrada')
        }
    })
}

function Sair_Da_Sala() {
    db.collection('Salas_Batalha_Naval').doc(Sala_Atual.Criador.Email).update({
        Oponente: null,
        'Jogadas.Vez_De': Sala_Atual.Criador.Email,
        'Jogadas.Movimentos': [],
        'Pontos.Player1': 0,
        'Pontos.Player2': 0
    }).then(() => {
        Sala_Atual = undefined
    })
}

//? ------------------------------------ Salvar Movimentos
const filaJogadas = []
let executandoSalvamento = false

function Salvar_Jogada(X, Y, Trocar_Jogador = true) {
    // Adiciona a jogada na fila
    filaJogadas.push({ X, Y, Trocar_Jogador })

    // Inicia o processamento da fila se ainda não estiver executando
    if (!executandoSalvamento) {
        processarFila()
    }
}

async function processarFila() {
    if (filaJogadas.length === 0) {
        executandoSalvamento = false
        return
    }

    executandoSalvamento = true

    const { X, Y, Trocar_Jogador } = filaJogadas.shift()

    // Atualiza os dados da jogada
    if (Trocar_Jogador) {
        if (Sala_Atual.Criador.Email === Usuario.email) {
            Sala_Atual.Jogadas.Vez_De = Sala_Atual.Oponente.Email
        } else {
            Sala_Atual.Jogadas.Vez_De = Sala_Atual.Criador.Email
        }
    }

    Sala_Atual.Jogadas.Movimentos.push({
        Jogador: Usuario.email,
        Posicao: {
            X: X,
            Y: Y
        }
    })

    try {
        // Aguarda a conclusão do salvamento no banco
        await db.collection('Salas_Batalha_Naval').doc(Sala_Atual.Criador.Email).update({
            Jogadas: Sala_Atual.Jogadas
        })

        // Após salvar, processa a próxima jogada
        processarFila()
    } catch (error) {
        console.error('Erro ao salvar a jogada:', error)

        // Reinsere a jogada no início da fila para tentar novamente
        filaJogadas.unshift({ X, Y, Trocar_Jogador })

        // Aguarda um tempo antes de tentar novamente
        setTimeout(processarFila, 1000)
    }
}


//TODO --------------------------------------------------------- Listener ---------------------------------------------------
function Listner_Sala(_Email_Sala) {
    db.collection('Salas_Batalha_Naval').doc(_Email_Sala).onSnapshot(Snapshot => {
        if(Snapshot.exists) {
            const dadosSala = Snapshot.data()            
            Sala_Atual = dadosSala // Atualiza a sala atual
            
            if (dadosSala.Oponente) {
                //! Caso não esteja na pág do jogo da velha, vai para a pág do jogo da velha
                if (Pagina_Atual != 'Pag_Jogo') {
                    Abrir_Paginas('Pag_Jogo')
                    Iniciar_Jogo(ConverterObjetoParaMatriz(Sala_Atual.Oponente.Matriz), Sala_Atual.Oponente.Email)
                    Iniciar_Jogo(ConverterObjetoParaMatriz(Sala_Atual.Criador.Matriz), Sala_Atual.Criador.Email)
                }
                
                // Atualiza os movimentos do oponente
                const Movimentos = dadosSala.Jogadas.Movimentos
                
                try {
                    if(Movimentos[Movimentos.length -1].Jogador != Usuario.email) {
                        Bot_Jogar(Movimentos[Movimentos.length -1].Posicao.X, Movimentos[Movimentos.length -1].Posicao.Y, false, Movimentos[Movimentos.length -1].Jogador)
                    }
                } catch{}

                if(dadosSala.Reiniciar_Jogo && Usuario.email == dadosSala.Oponente.Email) {
                    Jogar_Novamente(true)
                }

            } else {
                // Caso não tenha oponente, volta para a pág de espera
                if (Pagina_Atual == 'Pag_Jogo') {
                    Abrir_Paginas('Pag_Esperando')
                    Sala_Atual = dadosSala
                }
            }

            if(Usuario.email == dadosSala.Jogadas.Vez_De) {
                P_Sua_Vez_Aviso.innerText = 'Sua Vez'
            } else {
                P_Sua_Vez_Aviso.innerText = 'Vez Do Oponente'
            }
        } else {
            if(Sala_Atual.Criador != Usuario.email) {
                Abrir_Paginas('Pag_Entrar_Em_Sala')
                Carregar_Salas_Criadas()
            }
        }
    })
}

window.addEventListener('beforeunload', (event) => {
    // ? Aqui você pode chamar uma função para salvar algo, limpar dados, etc.
    if(Sala_Atual.Criador.Email == Usuario.email) {
        Excluir_Sala() // Exemplo de função
    } else if(Sala_Atual.Oponente.Email == Usuario.email){
        Sair_Da_Sala()
    }
    Abrir_Paginas('Pag_Home')

    // * Essa mensagem só funciona em alguns navegadores
    event.preventDefault()
    event.returnValue = '' // Isso ajuda a exibir uma mensagem de confirmação no navegador
})