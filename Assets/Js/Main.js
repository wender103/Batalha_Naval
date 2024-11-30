const Paginas = document.querySelectorAll('.Paginas')
const Btn_Voltar = document.getElementById('Btn_Voltar')
let Pagina_Atual = ''
function Abrir_Paginas(ID_Pagina) {
    if(Usuario) {
        Pagina_Atual = ID_Pagina
        Parar_Chuva_De_Confetes()

        Paginas.forEach(pagina => {
            pagina.classList.remove('Active')
        })

        document.getElementById(ID_Pagina).classList.add('Active')

        if(ID_Pagina != 'Pag_Home') {
            Btn_Voltar.style.display = 'block'

            if(ID_Pagina == 'Pag_Entrar_Em_Sala') {
                Carregar_Salas_Criadas()
            }

        } else {
            Btn_Voltar.style.display = 'none'
        }

        document.getElementById('Container_Btns_Jogo').style.display = 'none'

    } else {
        Fazer_Login()
    }
}

function Voltar_Pagina() {
    if(Pagina_Atual == 'Pag_Criar_Sala' || Pagina_Atual == 'Pag_Jogo' || Pagina_Atual == 'Pag_Esperando') {
        Abrir_Paginas('Pag_Home')
        Parar_Chuva_De_Confetes()

        if(Sala_Atual) {
            if(Sala_Atual.Criador.Email == Usuario.email) {
                Excluir_Sala()
            } else if(Sala_Atual.Oponente.Email == Usuario.email){
                Sair_Da_Sala()
            }
        }
    }
}