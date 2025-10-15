let radioOng = document.getElementById('ong');
let radioEmpresa = document.getElementById('empresa');
let labelOng = document.querySelector('label[for="ong"]');
let labelEmpresa = document.querySelector('label[for="empresa"]');

radioOng.addEventListener('click', selecionar);

radioEmpresa.addEventListener('click', selecionar);

function selecionar() {
    if (radioOng.checked) {
        labelOng.classList.add('activeTipoUsuario');
        labelEmpresa.classList.remove('activeTipoUsuario')
    }
    if (radioEmpresa.checked) {
        labelEmpresa.classList.add('activeTipoUsuario');
        labelOng.classList.remove('activeTipoUsuario');
    }
}