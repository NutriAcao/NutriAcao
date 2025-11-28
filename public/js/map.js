import { ongs } from "./ongs.js";

let map;
if (document.getElementById('map')) {
  map = L.map('map').setView([-23.55052, -46.633308], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  function loadOngs() {
    ongs.forEach(ong => {
      L.marker([ong.latitude, ong.longitude])
        .addTo(map)
        .bindPopup(
          `<strong>${ong.nome}</strong><br>${ong.descricao}<br><a href="${ong.link}" target="_blank">Acessar site</a>`
        );
    });
  }
  
  loadOngs();
  
  setTimeout(() => {
    map.invalidateSize();
  }, 100);
}

export { map };
export function loadOngs() {
  if (map) {
    ongs.forEach(ong => {
      L.marker([ong.latitude, ong.longitude])
        .addTo(map)
        .bindPopup(
          `<strong>${ong.nome}</strong><br>${ong.descricao}<br><a href="${ong.link}" target="_blank">Acessar site</a>`
        );
    });
  }
}