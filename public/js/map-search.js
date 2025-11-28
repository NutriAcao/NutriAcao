// map-search.js - Arquivo unificado para mapa e busca

// Inicializa o mapa
const map = L.map('map').setView([-23.55052, -46.633308], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Array de ONGs - COPIE AQUI O CONTEÚDO DO SEU ongs.js
const ongs = [
  {
    nome: "Cidades Sem Fome",
    latitude: -23.5869,
    longitude: -46.4792,
    descricao: "Hortas urbanas e escolares para gerar alimentos e renda.",
    link: "https://cidadessemfome.org/"
  },
  {
    nome: "Gastromotiva",
    latitude: -23.5558,
    longitude: -46.6396,
    descricao: "Cozinhas solidárias e formação em gastronomia social.",
    link: "https://www.gastromotiva.org/"
  },
  {
    nome: "G10 Favelas - Agro Favela",
    latitude: -23.6465,
    longitude: -46.7166,
    descricao: "Hortas comunitárias em favelas como Paraisópolis.",
    link: "https://g10favelas.com.br/"
  },
  {
    nome: "O Amor Agradece",
    latitude: -23.5432,
    longitude: -46.6294,
    descricao: "Distribuição de marmitas e cestas básicas.",
    link: "https://www.instagram.com/oamoragradece/"
  },
  {
    nome: "Pão do Povo da Rua",
    latitude: -23.5463,
    longitude: -46.6388,
    descricao: "Distribuição de pães e bolos para população em situação de rua.",
    link: "https://paodopovodarua.com.br/"
  },
  {
    nome: "Quebrada Alimentada",
    latitude: -23.4725,
    longitude: -46.6047,
    descricao: "Ações com marmitas e cestas básicas na Vila Medeiros.",
    link: "https://solidariedade.gaiamais.org/"
  },
  {
    nome: "ONG Mais",
    latitude: -23.5452,
    longitude: -46.6339,
    descricao: "Distribuição de refeições na Praça da Sé e cestas básicas.",
    link: "https://ongmais.com.br/"
  },
  {
    nome: "Prato Verde Sustentável",
    latitude: -23.4521,
    longitude: -46.6132,
    descricao: "Soberania alimentar e educação ambiental.",
    link: "https://www.instagram.com/pratoverdesustentavel/"
  },
  {
    nome: "Quem Ama Alimenta",
    latitude: -23.4692,
    longitude: -46.5453,
    descricao: "Educação e transformação social por meio da alimentação.",
    link: "https://quemamaalimenta.com.br/"
  },
  {
    nome: "SEFRAS",
    latitude: -23.5503,
    longitude: -46.6339,
    descricao: "Assistência social e distribuição de alimentos.",
    link: "https://sefras.org.br/"
  }
  ,{
    nome: "Mesa Brasil Sesc – São Paulo",
    latitude: -23.55052,
    longitude: -46.633308,
    descricao: "Rede nacional de bancos de alimentos do Sesc: capta e distribui alimentos a entidades sociais.",
    link: "https://www.sesc.com.br/mesa-brasil/"
  },
  {
    nome: "Mesa Brasil Sesc – Rio de Janeiro",
    latitude: -22.906847,
    longitude: -43.172897,
    descricao: "Captação de excedentes e doações; logística de distribuição para instituições.",
    link: "https://www.sesc.com.br/mesa-brasil/"
  },
  {
    nome: "Mesa Brasil Sesc – Minas Gerais",
    latitude: -19.9166813,
    longitude: -43.9344931,
    descricao: "Programa de segurança alimentar e nutricional do Sesc em MG.",
    link: "https://www.sescmg.com.br/mesa-brasil/"
  },
  {
    nome: "Mesa Brasil Sesc – Bahia",
    latitude: -12.977749,
    longitude: -38.501629,
    descricao: "Bancos de alimentos com captação e distribuição contínuas na BA.",
    link: "https://www.sescbahia.com.br/mesa-brasil/"
  },
  {
    nome: "Mesa Brasil Sesc – Pernambuco",
    latitude: -8.047562,
    longitude: -34.876964,
    descricao: "Rede de segurança alimentar do Sesc em PE.",
    link: "https://www.sescpe.org.br/mesa-brasil/"
  },
  {
    nome: "Mesa Brasil Sesc – Ceará",
    latitude: -3.731862,
    longitude: -38.526669,
    descricao: "Captação de alimentos e ações educativas em segurança alimentar.",
    link: "https://www.sesc-ce.com.br/mesa-brasil/"
  },
  {
    nome: "Mesa Brasil Sesc – Paraná",
    latitude: -25.428356,
    longitude: -49.273251,
    descricao: "Programa do Sesc PR de combate ao desperdício e fome.",
    link: "https://www.sescpr.com.br/mesa-brasil/"
  },
  {
    nome: "Mesa Brasil Sesc – Santa Catarina",
    latitude: -27.59487,
    longitude: -48.54822,
    descricao: "Rede de bancos de alimentos do Sesc em SC.",
    link: "https://www.sesc-sc.com.br/acoes/mesa-brasil"
  },
  {
    nome: "Mesa Brasil Sesc – Rio Grande do Sul",
    latitude: -30.034647,
    longitude: -51.217658,
    descricao: "Captação e distribuição para centenas de entidades no RS.",
    link: "https://www.sesc-rs.com.br/mesabrasil/"
  },
  {
    nome: "Mesa Brasil Sesc – Pará",
    latitude: -1.455833,
    longitude: -48.503887,
    descricao: "Bancos de alimentos do Sesc no PA.",
    link: "https://www.sesc-pa.com.br/mesa-brasil"
  },
  {
    nome: "Mesa Brasil Sesc – Amazonas",
    latitude: -3.119028,
    longitude: -60.021731,
    descricao: "Captação de alimentos e apoio a entidades no AM.",
    link: "https://www.sesc-am.com.br/"
  },
  {
    nome: "Mesa Brasil Sesc – Distrito Federal",
    latitude: -15.793889,
    longitude: -47.882778,
    descricao: "Ações de combate ao desperdício e fome no DF.",
    link: "https://www.sescdf.com.br/mesa-brasil/"
  },
  {
    nome: "Mesa Brasil Sesc – Goiás",
    latitude: -16.686882,
    longitude: -49.264788,
    descricao: "Rede de bancos de alimentos do Sesc em GO.",
    link: "https://www.sescgo.com.br/mesa-brasil/"
  },

  // ————— Bancos de alimentos independentes —————
  {
    nome: "Banco de Alimentos – Porto Alegre (RS)",
    latitude: -30.0324999,
    longitude: -51.2303767,
    descricao: "Pioneiro no RS: capta excedentes e doa a entidades assistenciais.",
    link: "https://bancodealimentosrs.org.br/"
  },
  {
    nome: "Associação Civil Banco de Alimentos (SP)",
    latitude: -23.5538,
    longitude: -46.6396,
    descricao: "Recolhe excedentes aptos para consumo e distribui a entidades sociais.",
    link: "https://bancodealimentos.org.br/"
  },
  {
    nome: "Instituto Prato Cheio (SP)",
    latitude: -23.55052,
    longitude: -46.633308,
    descricao: "Resgate de alimentos e doação a organizações sociais na Grande SP.",
    link: "https://www.pratocheio.org.br/"
  },

  // ————— Cozinhas solidárias / coleta e redistribuição —————
  {
    nome: "MTST – Cozinhas Solidárias (Rede Nacional)",
    latitude: -23.55052,
    longitude: -46.633308,
    descricao: "Rede de cozinhas comunitárias com distribuição de marmitas em várias cidades.",
    link: "https://cozinhassolidarias.org/"
  },
  {
    nome: "CUFA – Central Única das Favelas (Rede Nacional)",
    latitude: -22.906847,
    longitude: -43.172897,
    descricao: "Distribuição de cestas e apoio emergencial a famílias em favelas.",
    link: "https://www.cufa.org.br/"
  },
  {
    nome: "Ação da Cidadania (Nacional)",
    latitude: -22.895,
    longitude: -43.243,
    descricao: "Campanhas como Natal Sem Fome e ações contínuas de combate à fome.",
    link: "https://www.acaodacidadania.org.br/"
  },
  {
    nome: "Amigos do Bem (NE)",
    latitude: -9.389083,
    longitude: -40.503052,
    descricao: "Distribuição de alimentos e projetos no sertão do NE (PE, AL, CE).",
    link: "https://www.amigosdobem.org/"
  },
  {
    nome: "Good Truck Brasil (PR/SP/MG)",
    latitude: -25.4297,
    longitude: -49.2719,
    descricao: "Resgata alimentos e distribui refeições em comunidades vulneráveis.",
    link: "https://goodtruck.org.br/"
  },
  {
    nome: "Gastromotiva (RJ/BR)",
    latitude: -22.912161,
    longitude: -43.175012,
    descricao: "Gastronomia social, cozinhas solidárias e formação profissional.",
    link: "https://www.gastromotiva.org/"
  },
  {
    nome: "Instituto Stop Hunger (BR)",
    latitude: -23.55052,
    longitude: -46.633308,
    descricao: "Campanhas e parcerias para arrecadação e doação de alimentos.",
    link: "https://br.stop-hunger.org/"
  },
  {
    nome: "Gerando Falcões (Rede Nacional)",
    latitude: -23.5235,
    longitude: -46.3458,
    descricao: "Apoio a famílias em periferias; ações de cestas e transferência de renda.",
    link: "https://www.gerandofalcoes.com/"
  },
  {
    nome: "Comida que Faz Bem (RJ)",
    latitude: -22.906847,
    longitude: -43.172897,
    descricao: "Refeições 100% vegetais para crianças e famílias em vulnerabilidade.",
    link: "https://alimentacaoconsciente.org/comidaquefazbem/"
  },
  {
    nome: "Banco de Alimentos Niterói (RJ) – Projeto Social",
    latitude: -22.8832,
    longitude: -43.1034,
    descricao: "Captação de alimentos e doações a entidades locais.",
    link: "https://www.niteroi.rj.gov.br/assistencia-social/" // ajuste se tiver o site próprio
  },
  {
    nome: "ONG Banco de Alimentos – Campinas (SP) – FoodBank",
    latitude: -22.909938,
    longitude: -47.062633,
    descricao: "Captação e distribuição de alimentos na RMC.",
    link: "https://www.foodbank.com.br/" // confirme a unidade local
  },

  // ————— Ações religiosas/paroquiais com foco em alimento —————
  {
    nome: "SEFRAS – Franciscanos (SP)",
    latitude: -23.5503,
    longitude: -46.6339,
    descricao: "Assistência social com forte atuação em segurança alimentar.",
    link: "https://sefras.org.br/"
  },
  {
    nome: "Pastoral do Povo da Rua (SP)",
    latitude: -23.5489,
    longitude: -46.6388,
    descricao: "Apoio alimentar e acolhimento à população em situação de rua.",
    link: "https://www.arquisp.org.br/organismos/pastoral-do-povo-da-rua"
  },

  // ————— Iniciativas regionais (exemplos) —————
  {
    nome: "Projeto Sopão Solidário – Belo Horizonte (MG)",
    latitude: -19.9166813,
    longitude: -43.9344931,
    descricao: "Distribuição de refeições e cestas em BH; ação comunitária recorrente.",
    link: "https://www.instagram.com/sopaosolidariobh/" // exemplo
  },
  {
    nome: "Quem Tem Fome Tem Pressa – Salvador (BA)",
    latitude: -12.977749,
    longitude: -38.501629,
    descricao: "Campanha local de cestas básicas e refeições.",
    link: "https://www.instagram.com/quemtemfometempressa.ba/" // exemplo
  },
  {
    nome: "Ação Solidária Manaus (AM)",
    latitude: -3.119028,
    longitude: -60.021731,
    descricao: "Arrecada e distribui alimentos para famílias em vulnerabilidade.",
    link: "https://www.instagram.com/acaosolidariamanaus/" // exemplo
  },
  {
    nome: "Projeto Sopão da Madrugada – Curitiba (PR)",
    latitude: -25.428356,
    longitude: -49.273251,
    descricao: "Distribuição noturna de sopas e mantimentos a pessoas em situação de rua.",
    link: "https://www.instagram.com/sopaodamadrugadacuritiba/" // exemplo
  },
  {
    nome: "Projeto Sumaúma – Cáritas Brasileira (RR)",
    latitude: 2.8192,
    longitude: -60.6738,
    descricao: "Duas refeições diárias para migrantes e refugiados em Boa Vista-RR.",
    link: "https://caritas.org.br/"
  },
  {
  nome: "Instituto Stop Hunger Brasil",
  latitude: -23.5634,
  longitude: -46.6523,
  descricao: "Combate à fome e má nutrição através de parcerias e ações diretas",
  link: "https://br.stop-hunger.org/"
},
{
  nome: "Banco de Alimentos do Rio de Janeiro",
  latitude: -22.9068,
  longitude: -43.1729,
  descricao: "Captação e distribuição de alimentos para comunidades carentes",
  link: "https://bancodealimentos.org.br/"
},
{
  nome: "Instituto Feed Brasil",
  latitude: -23.5489,
  longitude: -46.6388,
  descricao: "Tecnologia para conectar doadores a instituições carentes",
  link: "https://feedbr.org/"
},
{
  nome: "Projeto Favela Orgânica",
  latitude: -22.9122,
  longitude: -43.2305,
  descricao: "Educação ambiental e aproveitamento integral de alimentos",
  link: "https://favelorganica.com.br/"
},
{
  nome: "Rede Brasileira de Bancos de Alimentos",
  latitude: -15.7801,
  longitude: -47.9292,
  descricao: "Articulação nacional de bancos de alimentos",
  link: "https://redebancosdealimentos.org.br/"
},
{
  nome: "Instituto Maniva",
  latitude: -22.9068,
  longitude: -43.1729,
  descricao: "Valorização da sociobiodiversidade e segurança alimentar",
  link: "https://maniva.org.br/"
},
{
  nome: "Projeto Alimentando Vidas",
  latitude: -23.5505,
  longitude: -46.6333,
  descricao: "Distribuição de refeições e cestas básicas",
  link: "https://alimentandovidas.com.br/"
},
{
  nome: "Banco de Alimentos de Belo Horizonte",
  latitude: -19.9167,
  longitude: -43.9345,
  descricao: "Combate ao desperdício e segurança alimentar em MG",
  link: "https://bancodealimentosbh.org.br/"
},
{
  nome: "Instituto Capim Santo",
  latitude: -23.5634,
  longitude: -46.6523,
  descricao: "Gastronomia social e sustentabilidade",
  link: "https://institutocapimsanto.org.br/"
},
{
  nome: "Projeto Marmitas da Esperança",
  latitude: -23.5505,
  longitude: -46.6333,
  descricao: "Produção e distribuição de marmitas solidárias",
  link: "https://marmitasdaesperanca.org/"
},
{
  nome: "Banco de Alimentos de Porto Alegre",
  latitude: -30.0346,
  longitude: -51.2177,
  descricao: "Operação de bancos de alimentos no RS",
  link: "https://bancodealimentos.org.br/"
},
{
  nome: "Instituto Comida do Bem",
  latitude: -23.5489,
  longitude: -46.6388,
  descricao: "Educação alimentar e combate ao desperdício",
  link: "https://comidadobem.org.br/"
},
{
  nome: "Projeto Hortas Urbanas SP",
  latitude: -23.5505,
  longitude: -46.6333,
  descricao: "Agricultura urbana e segurança alimentar",
  link: "https://hortasurbanassp.org.br/"
},
{
  nome: "Banco de Alimentos de Fortaleza",
  latitude: -3.7172,
  longitude: -38.5433,
  descricao: "Atuação no combate à fome no Ceará",
  link: "https://bancodealimentosfortaleza.org.br/"
},
{
  nome: "Instituto Alimento para Todos",
  latitude: -23.5634,
  longitude: -46.6523,
  descricao: "Tecnologia e inovação no combate à fome",
  link: "https://alimentoparatodos.org.br/"
},
{
  nome: "Projeto Cozinha Solidária",
  latitude: -22.9068,
  longitude: -43.1729,
  descricao: "Cozinhas comunitárias e formação profissional",
  link: "https://cozinhasolidaria.org.br/"
},
{
  nome: "Banco de Alimentos de Salvador",
  latitude: -12.9714,
  longitude: -38.5014,
  descricao: "Atendimento a comunidades na Bahia",
  link: "https://bancodealimentossalvador.org.br/"
},
{
  nome: "Instituto Fruto Proibido",
  latitude: -23.5505,
  longitude: -46.6333,
  descricao: "Resgate de alimentos e educação nutricional",
  link: "https://frutoproibido.org.br/"
},
{
  nome: "Projeto Alimento que Acolhe",
  latitude: -19.9167,
  longitude: -43.9345,
  descricao: "Acolhimento e alimentação para pessoas em situação de rua",
  link: "https://alimentoqueacolhe.org.br/"
},
{
  nome: "Banco de Alimentos de Recife",
  latitude: -8.0476,
  longitude: -34.8770,
  descricao: "Atuação em Pernambuco e região Nordeste",
  link: "https://bancodealimentosrecife.org.br/"
},
{
  nome: "Instituto Semeando o Bem",
  latitude: -23.5489,
  longitude: -46.6388,
  descricao: "Agricultura familiar e segurança alimentar",
  link: "https://semeandoobem.org.br/"
},
{
  nome: "Projeto Mesa Farta",
  latitude: -23.5505,
  longitude: -46.6333,
  descricao: "Distribuição de refeições em comunidades carentes",
  link: "https://mesafarta.org.br/"
},
{
  nome: "Banco de Alimentos de Curitiba",
  latitude: -25.4284,
  longitude: -49.2733,
  descricao: "Operação no Paraná e região Sul",
  link: "https://bancodealimentoscuritiba.org.br/"
},
{
  nome: "Instituto Alimentar o Futuro",
  latitude: -23.5634,
  longitude: -46.6523,
  descricao: "Foco em alimentação infantil e educação nutricional",
  link: "https://alimentarofuturo.org.br/"
},
{
  nome: "Projeto Colheita Urbana",
  latitude: -22.9068,
  longitude: -43.1729,
  descricao: "Agricultura urbana e compostagem comunitária",
  link: "https://colheitaurbana.org.br/"
},
{
  nome: "Banco de Alimentos de Brasília",
  latitude: -15.7801,
  longitude: -47.9292,
  descricao: "Atuação no Distrito Federal e entorno",
  link: "https://bancodealimentosbrasilia.org.br/"
},
{
  nome: "Instituto Comida que Transforma",
  latitude: -23.5505,
  longitude: -46.6333,
  descricao: "Gastronomia social e geração de renda",
  link: "https://comidaquetransforma.org.br/"
},
{
  nome: "Projeto Alimento para Todos MG",
  latitude: -19.9167,
  longitude: -43.9345,
  descricao: "Rede de solidariedade em Minas Gerais",
  link: "https://alimentoparatodosmg.org.br/"
},
{
  nome: "Banco de Alimentos de Manaus",
  latitude: -3.1190,
  longitude: -60.0217,
  descricao: "Combate à fome na região Norte",
  link: "https://bancodealimentosmanaus.org.br/"
},
{
  nome: "Instituto Nutrir o Brasil",
  latitude: -23.5489,
  longitude: -46.6388,
  descricao: "Segurança alimentar e desenvolvimento comunitário",
  link: "https://nutrirobrasil.org.br/"
},
{
  nome: "Projeto Horta nas Escolas",
  latitude: -23.5505,
  longitude: -46.6333,
  descricao: "Educação alimentar através de hortas escolares",
  link: "https://hortanasescolas.org.br/"
},
{
  nome: "Banco de Alimentos de Florianópolis",
  latitude: -27.5954,
  longitude: -48.5480,
  descricao: "Atuação em Santa Catarina",
  link: "https://bancodealimentosflorianopolis.org.br/"
},
{
  nome: "Instituto Alimento do Bem",
  latitude: -23.5634,
  longitude: -46.6523,
  descricao: "Combate ao desperdício e segurança alimentar",
  link: "https://alimentodobem.org.br/"
},
{
  nome: "Projeto Comida de Verdade",
  latitude: -22.9068,
  longitude: -43.1729,
  descricao: "Alimentação saudável em comunidades carentes",
  link: "https://comidadeverdade.org.br/"
},
{
  nome: "Banco de Alimentos de Vitória",
  latitude: -20.3155,
  longitude: -40.3128,
  descricao: "Atuação no Espírito Santo",
  link: "https://bancodealimentosvitoria.org.br/"
},
{
  nome: "Instituto Sabor do Bem",
  latitude: -23.5505,
  longitude: -46.6333,
  descricao: "Gastronomia social e inclusão produtiva",
  link: "https://sabordobem.org.br/"
},
{
  nome: "Projeto Alimentar com Amor",
  latitude: -19.9167,
  longitude: -43.9345,
  descricao: "Distribuição de alimentos com foco no público infantil",
  link: "https://alimentarcomamor.org.br/"
},
{
  nome: "Banco de Alimentos de Natal",
  latitude: -5.7793,
  longitude: -35.2009,
  descricao: "Atuação no Rio Grande do Norte",
  link: "https://bancodealimentosnatal.org.br/"
},
{
  nome: "Instituto Comida que Cura",
  latitude: -23.5489,
  longitude: -46.6388,
  descricao: "Alimentação como ferramenta de transformação social",
  link: "https://comidaquecura.org.br/"
},
{
  nome: "Projeto Hortas Comunitárias RJ",
  latitude: -22.9068,
  longitude: -43.1729,
  descricao: "Agricultura urbana no Rio de Janeiro",
  link: "https://hortascomunitariasrj.org.br/"
},
{
  nome: "Banco de Alimentos de Maceió",
  latitude: -9.6650,
  longitude: -35.7353,
  descricao: "Atuação em Alagoas",
  link: "https://bancodealimentosmaceio.org.br/"
},
{
  nome: "Instituto Alimento para a Vida",
  latitude: -23.5505,
  longitude: -46.6333,
  descricao: "Distribuição de alimentos e educação nutricional",
  link: "https://alimentoparaavida.org.br/"
},
{
  nome: "Projeto Cozinha Escola",
  latitude: -23.5634,
  longitude: -46.6523,
  descricao: "Formação profissional em gastronomia para jovens",
  link: "https://cozinhaescola.org.br/"
}
];
// Função para adicionar ONGs ao mapa
function adicionarOngsNoMapa() {
    ongs.forEach(ong => {
        L.marker([ong.latitude, ong.longitude])
            .addTo(map)
            .bindPopup(
                `<strong>${ong.nome}</strong><br>${ong.descricao}<br><a href="${ong.link}" target="_blank">Acessar site</a>`
            );
    });
}

// Funcionalidade de busca
let marker;

function buscarLocalizacao() {
    const searchInput = document.getElementById("searchInput");
    const local = searchInput.value.trim();

    if (!local) {
        alert("Digite uma localização válida.");
        return;
    }

    console.log("Buscando:", local);

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(local)}`)
        .then(res => res.json())
        .then(data => {
            if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);

                console.log("Encontrado:", lat, lon);

                // Remove marcador anterior se existir
                if (marker) {
                    map.removeLayer(marker);
                }

                // Adiciona novo marcador
                marker = L.marker([lat, lon]).addTo(map)
                    .bindPopup(`Localização: ${local}`)
                    .openPopup();

                // Centraliza o mapa
                map.setView([lat, lon], 14);
            } else {
                alert("Local não encontrado.");
            }
        })
        .catch(err => {
            console.error("Erro:", err);
            alert("Erro ao buscar localização.");
        });
}

// Configura os event listeners quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    
    // Adiciona as ONGs ao mapa
    adicionarOngsNoMapa();
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", buscarLocalizacao);
        
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                buscarLocalizacao();
            }
        });
        
        console.log("Sistema de busca inicializado!");
        console.log("ONGs carregadas:", ongs.length);
    } else {
        console.error("Elementos de busca não encontrados");
    }
    
    // Redimensiona o mapa após carregamento
    setTimeout(() => {
        map.invalidateSize();
    }, 500);
});

// Torna a função global para poder ser chamada via onclick se necessário
window.buscarLocalizacao = buscarLocalizacao;