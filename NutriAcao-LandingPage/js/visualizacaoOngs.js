// pesquisa de alimentos
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const table = document.getElementById('doacoesTable');
    const rows = table.getElementsByTagName('tr');
    const totalItens = document.getElementById('totalItens');
    
    // Contador de itens visíveis
    function updateItemCount() {
        let visibleCount = 0;
        for (let i = 1; i < rows.length; i++) {
            if (rows[i].style.display !== 'none') {
                visibleCount++;
            }
        }
        totalItens.textContent = visibleCount;
    }
    
    // Função de pesquisa
    searchInput.addEventListener('input', function() {
        const searchText = this.value.toLowerCase();
        
        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            const itemName = cells[1].textContent.toLowerCase();
            
            if (itemName.includes(searchText)) {
                rows[i].style.display = '';
            } else {
                rows[i].style.display = 'none';
            }
        }
        
        updateItemCount();
    });
    
    // Toggle submenu
    document.getElementById('toggleGestao').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('gestaoSubmenu').classList.toggle('show');
    });
    
    // Paginação simples
    const pageButtons = document.querySelectorAll('.page-btn');
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    let currentPage = 1;
    const itemsPerPage = 10;
    
    function showPage(page) {
        const startIndex = (page - 1) * itemsPerPage + 1;
        const endIndex = page * itemsPerPage;
        
        for (let i = 1; i < rows.length; i++) {
            if (i >= startIndex && i <= endIndex) {
                rows[i].style.display = '';
            } else {
                rows[i].style.display = 'none';
            }
        }
        
        // Atualizar botões ativos
        pageButtons.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.getAttribute('data-page')) === page) {
                btn.classList.add('active');
            }
        });
        
        currentPage = page;
        updateItemCount();
    }
    
    // Inicializar primeira página
    showPage(1);
    
    // Event listeners para botões de paginação
    pageButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const page = parseInt(this.getAttribute('data-page'));
            showPage(page);
        });
    });
    
    prevButton.addEventListener('click', function() {
        if (currentPage > 1) {
            showPage(currentPage - 1);
        }
    });
    
    nextButton.addEventListener('click', function() {
        if (currentPage < pageButtons.length) {
            showPage(currentPage + 1);
        }
    });
});