document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.getElementById('menu-button');
    const navMenu = document.getElementById('menu');

    menuButton.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });

    const navLinks = document.querySelectorAll('#nav-list .nav-link, #nav-list .btn-login, #nav-list .btn-cadastro');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    });

    const header = document.getElementById('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 0) {
            header.classList.add('rolagem');
        } else {
            header.classList.remove('rolagem');
        }
    });

    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const link = item.querySelector('.accordion-link');
        link.addEventListener('click', function(e) {
            e.preventDefault(); 

            accordionItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            item.classList.toggle('active');
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {


  var marker;

  function buscarLocalizacao() {
    var local = document.getElementById("searchInput").value;

    if (!local) {
      alert("Local não encontrado. Digite uma localização válida.");
      return;
    }

    var url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(local)}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          var lat = data[0].lat;
          var lon = data[0].lon;

          if (marker) {
            map.removeLayer(marker);
          }

          marker = L.marker([lat, lon]).addTo(map)
            .bindPopup("Localização: " + local)
            .openPopup();

          map.setView([lat, lon], 14);
        } else {
          alert("Local não encontrado.");
        }
      })
      .catch(error => {
        console.error("Erro ao buscar localização:", error);
        alert("Erro ao buscar localização.");
      });
  }

  // Associa a função ao botão
  document.getElementById("searchBtn").addEventListener("click", buscarLocalizacao);
});

const map = L.map('map').setView([-23.55052, -46.633308], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Lista de ONGs
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
];

// Adiciona os marcadores ao mapa
ongs.forEach(ong => {
  L.marker([ong.latitude, ong.longitude])
    .addTo(map)
    .bindPopup(
      `<strong>${ong.nome}</strong><br>${ong.descricao}<br><a href="${ong.link}" target="_blank">Acessar site</a>`
    );
});