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

  //visualizar doações
    const modal = document
        .querySelector('dialog');

   function openModal(){
        modal.showModal();
   }

   function closeModal(){
        modal.close();
   }

    // Dados de exemplo para os pedidos
        const ordersData = {
            1: {
                date: "04/02/2025",
                institution: "Fome Do Cão",
                status: "reservado",
                contact: "(11) 98765-4321",
                address: "Av. Principal, 456 - Centro, São Paulo - SP",
                items: [
                    { name: "Pão Francês", quantity: 1000, unit: "unidades", notes: "Preferência por pão fresco" }
                ]
            },
            2: {
                date: "04/02/2025",
                institution: "Fone Do Cão",
                status: "disponivel",
                contact: "(11) 91234-5678",
                address: "Rua dos Cães, 789 - Vila Nova, São Paulo - SP",
                items: [
                    { name: "Pão Francês", quantity: 1000, unit: "unidades", notes: "" }
                ]
            },
            3: {
                date: "15/12/2024",
                institution: "Amor Animal",
                status: "disponivel",
                contact: "(11) 94567-8901",
                address: "Alameda dos Animais, 321 - Jardim das Flores, São Paulo - SP",
                items: [
                    { name: "Arroz", quantity: 500, unit: "kg", notes: "Preferência por arroz tipo 1" }
                ]
            },
            4: {
                date: "20/11/2024",
                institution: "Casa do Caminho",
                status: "reservado",
                contact: "(11) 92345-6789",
                address: "Travessa da Esperança, 654 - Centro, São Paulo - SP",
                items: [
                    { name: "Feijão", quantity: 300, unit: "kg", notes: "" }
                ]
            },
            5: {
                date: "10/01/2025",
                institution: "Lar São Francisco",
                status: "disponivel",
                contact: "(11) 93456-7890",
                address: "Praça da Paz, 987 - Vila Mariana, São Paulo - SP",
                items: [
                    { name: "Leite", quantity: 200, unit: "litros", notes: "Leite integral preferencialmente" }
                ]
            },
            6: {
                date: "22/03/2025",
                institution: "Fone Do Cão",
                status: "disponivel",
                contact: "(11) 95678-9012",
                address: "Rua dos Cães, 789 - Vila Nova, São Paulo - SP",
                items: [
                    { name: "Macarrão", quantity: 400, unit: "kg", notes: "Qualquer tipo de macarrão" }
                ]
            },
            7: {
                date: "30/06/2024",
                institution: "Amor Animal",
                status: "reservado",
                contact: "(11) 96789-0123",
                address: "Alameda dos Animais, 321 - Jardim das Flores, São Paulo - SP",
                items: [
                    { name: "Óleo", quantity: 150, unit: "litros", notes: "Óleo de soja" }
                ]
            },
            8: {
                date: "15/09/2024",
                institution: "Casa do Caminho",
                status: "disponivel",
                contact: "(11) 97890-1234",
                address: "Travessa da Esperança, 654 - Centro, São Paulo - SP",
                items: [
                    { name: "Açúcar", quantity: 250, unit: "kg", notes: "Açúcar cristal" }
                ]
            },
            9: {
                date: "10/11/2024",
                institution: "Lar São Francisco",
                status: "reservado",
                contact: "(11) 98901-2345",
                address: "Praça da Paz, 987 - Vila Mariana, São Paulo - SP",
                items: [
                    { name: "Café", quantity: 180, unit: "kg", notes: "Café moído" }
                ]
            },
            10: {
                date: "05/05/2025",
                institution: "Fone Do Cão",
                status: "disponivel",
                contact: "(11) 99012-3456",
                address: "Rua dos Cães, 789 - Vila Nova, São Paulo - SP",
                items: [
                    { name: "Farinha", quantity: 320, unit: "kg", notes: "Farinha de trigo" }
                ]
            },
            11: {
                date: "05/05/2025",
                institution: "Fone Do Cão",
                status: "disponivel",
                contact: "(11) 99012-3456",
                address: "Rua dos Cães, 789 - Vila Nova, São Paulo - SP",
                items: [
                    { name: "Farinha", quantity: 320, unit: "kg", notes: "Farinha de trigo" }
                ]
            }
        };

        function openModal(orderId) {
            const modal = document.getElementById('orderModal');
            const order = ordersData[orderId];
            
            if (order) {
                // Preenche as informações do pedido
                document.getElementById('orderId').textContent = orderId;
                document.getElementById('orderDate').textContent = order.date;
                document.getElementById('institution').textContent = order.institution;
                
                // Atualiza o status
                const statusElement = document.getElementById('orderStatus');
                statusElement.innerHTML = `<span class="status ${order.status}">${order.status === 'reservado' ? 'Reservado' : 'Disponível'}</span>`;
                
                document.getElementById('contact').textContent = order.contact;
                document.getElementById('address').textContent = order.address;
                
                // Preenche os itens do pedido
                const itemsList = document.getElementById('itemsList');
                itemsList.innerHTML = '';
                
                order.items.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.unit}</td>
                        <td>${item.notes || '-'}</td>
                    `;
                    itemsList.appendChild(row);
                });
                
                // Atualiza o botão de ação baseado no status
                const actionButton = document.getElementById('actionButton');
                if (order.status === 'reservado') {
                    actionButton.textContent = 'Cancelar pedido';
                    actionButton.style.backgroundColor = '#e74c3c';
                } else {
                    actionButton.textContent = 'Reservar Pedido';
                    actionButton.style.backgroundColor = '#3498db';
                }
                
                modal.showModal();
            }
        }

        function closeModal() {
            const modal = document.getElementById('orderModal');
            modal.close();
        }

        function handleAction() {
            // cancelar pedido
            alert('em processo de produção');
        }

        // Fechar modal clicando fora
        document.getElementById('orderModal').addEventListener('click', function(event) {
            if (event.target === this) {
                closeModal();
            }
        });