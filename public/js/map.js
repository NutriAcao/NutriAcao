/* arquivo: public/js/map.js - script do frontend: funcionalidades relacionadas a map */

import { ongs } from "./ongs.js";

export const map = L.map("map").setView([-23.55052, -46.633308], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

export function loadOngs() {
  ongs.forEach((ong) => {
    L.marker([ong.latitude, ong.longitude])
      .addTo(map)
      .bindPopup(
        `<strong>${ong.nome}</strong><br>${ong.descricao}<br><a href="${ong.link}" target="_blank">Acessar site</a>`,
      );
  });
}
loadOngs();
setTimeout(() => {
  map.invalidateSize();
}, 100);
