import { map } from "./map.js";

export function initSearch() {
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");

  // Não fazer nada se o mapa ou elementos de busca não existirem
  if (!map || !searchBtn || !searchInput) {
    console.error("Elementos de busca não encontrados");
    return;
  }

  let marker;

  function buscarLocalizacao() {
    const local = searchInput.value.trim();

    if (!local) {
      alert("Digite uma localização válida.");
      return;
    }

    console.log("Buscando localização:", local);

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(local)}`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);

          console.log("Localização encontrada:", lat, lon);

          if (marker) {
            map.removeLayer(marker);
          }

          marker = L.marker([lat, lon]).addTo(map)
            .bindPopup(`Localização: ${local}`)
            .openPopup();

          map.setView([lat, lon], 14);
        } else {
          alert("Local não encontrado.");
        }
      })
      .catch(err => {
        console.error("Erro ao buscar localização:", err);
        alert("Erro ao buscar localização.");
      });
  }

  // Remove o onclick do HTML e usa apenas o event listener
  searchBtn.addEventListener("click", buscarLocalizacao);
  
  // Adiciona também busca ao pressionar Enter
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      buscarLocalizacao();
    }
  });
}