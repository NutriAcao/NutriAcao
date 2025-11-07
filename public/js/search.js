/* arquivo: public/js/search.js - script do frontend: funcionalidades relacionadas a search - funções/constantes: local, lat, buscarLocalizacao, lon */

import { map } from "./map.js";

export function initSearch() {
  let marker;

  function buscarLocalizacao() {
    const local = document.getElementById("searchInput").value;

    if (!local) {
      alert("Digite uma localização válida.");
      return;
    }

    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(local)}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          const lat = data[0].lat;
          const lon = data[0].lon;

          if (marker) map.removeLayer(marker);

          marker = L.marker([lat, lon])
            .addTo(map)
            .bindPopup(`Localização: ${local}`)
            .openPopup();

          map.setView([lat, lon], 14);
        } else {
          alert("Local não encontrado.");
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar localização:", err);
        alert("Erro ao buscar localização.");
      });
  }

  document
    .getElementById("searchBtn")
    .addEventListener("click", buscarLocalizacao);
}
