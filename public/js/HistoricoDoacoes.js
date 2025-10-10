document.addEventListener('DOMContentLoaded', function() {
    function setupTable(searchInputId, tableId, totalItensId, totalPaginasId, paginationControlsId) {
        const searchInput = document.getElementById(searchInputId);
        const table = document.getElementById(tableId);
        const totalItens = document.getElementById(totalItensId);
        const totalPaginas = document.getElementById(totalPaginasId);
        const paginationControls = document.getElementById(paginationControlsId);

        let currentPage = 1;
        const itemsPerPage = 10;

        function getRows() {
            return Array.from(table.querySelectorAll('tbody tr'));
        }

        function renderTable() {
            const rows = getRows();
            const searchTerm = searchInput.value.toLowerCase();
            const filteredRows = rows.filter(row =>
                row.textContent.toLowerCase().includes(searchTerm)
            );
            totalItens.textContent = filteredRows.length;
            const totalPages = Math.ceil(filteredRows.length / itemsPerPage) || 1;
            totalPaginas.textContent = totalPages;

            rows.forEach(row => row.style.display = 'none');
            filteredRows
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .forEach(row => row.style.display = '');

            renderPagination(totalPages);
        }

        function renderPagination(totalPages) {
            paginationControls.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement('button');
                btn.textContent = i;
                btn.className = (i === currentPage) ? 'active' : '';
                btn.addEventListener('click', () => {
                    currentPage = i;
                    renderTable();
                });
                paginationControls.appendChild(btn);
            }
        }

        searchInput.addEventListener('input', () => {
            currentPage = 1;
            renderTable();
        });

        renderTable();
    }

    // Empresa
    setupTable(
        'searchInputEmpresa',
        'doacoesTableEmpresa',
        'totalItensEmpresa',
        'totalPaginasEmpresa',
        'paginationControlsEmpresa'
    );

    // ONG
    setupTable(
        'searchInputOng',
        'doacoesTableOng',
        'totalItensOng',
        'totalPaginasOng',
        'paginationControlsOng'
    );
});



let dropdown = document.getElementById('contasDropdown')
let historicoOng = document.getElementById('historicoOng')
let historicoEmpresa = document.getElementById('historicoEmpresa')

let ong = document.getElementById('conta-ong-radio')



let teste = document.getElementById('teste')

teste.addEventListener('click',show)

dropdown.addEventListener('click',choice)


function show () {
dropdown.style.display = 'flex'
teste.style.display = 'none'
}

function choice() {
  if (ong.checked) {
    teste.innerHTML = `
      
        <img src="https://ui-avatars.com/api/?name=Usuario&background=3498db&color=fff" alt="Usuário">
        <div>
        <h4>Colaborador da Silva</h4>
        <p>ONG ABC</p>
        </div>
      
    `;

    dropdown.style.display = "none"
    teste.style.display = "flex"
    historicoOng.style.display = "block"
    historicoEmpresa.style.display = "none"
  } else {
    teste.innerHTML = `<img src="https://ui-avatars.com/api/?name=Usuario&background=3498db&color=fff" alt="Usuário">
            <div>
                <h4>Magnata da Silva</h4>
                <p>Empresa ABC</p>
                
            </div>`
            dropdown.style.display = "none"
            teste.style.display = "flex"
            historicoEmpresa.style.display = "block"
            historicoOng.style.display = "none"
  }
}


