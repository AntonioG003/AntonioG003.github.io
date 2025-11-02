let todosOsProdutos = [];

if (!localStorage.getItem('cesto')) {
    localStorage.setItem('cesto', JSON.stringify([]));
}

function carregarCategorias() {
    fetch('https://deisishop.pythonanywhere.com/products/')
        .then(response => response.json())
        .then(produtos => {
            const select = document.getElementById('filtro-categoria');
            select.innerHTML = '<option value="todas">Todas as categorias</option>'; 

            const categorias = [...new Set(produtos.map(p => p.category))].filter(c => c);

            categorias.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria;
                option.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1).replace('-', ' ');
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erro ao carregar categorias:', error);
        });
}


function carregarProdutos() {
    fetch('https://deisishop.pythonanywhere.com/products/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao obter produtos da API');
            }
            return response.json();
        })
        .then(produtos => {
            todosOsProdutos = produtos;
            aplicarFiltrosEOrdenacao();
        })
        .catch(error => {
            console.error('Erro ao carregar produtos:', error);
            const lista = document.getElementById('lista-produtos');
            lista.innerHTML = '<p>Não foi possível carregar os produtos.</p>';
        });
}

function aplicarFiltrosEOrdenacao() {
    let produtosFiltrados = [...todosOsProdutos];

    const categoriaSelecionada = document.getElementById('filtro-categoria').value;
    if (categoriaSelecionada !== 'todas') {
        produtosFiltrados = produtosFiltrados.filter(produto => produto.category === categoriaSelecionada);
    }

    const termoPesquisa = document.getElementById('pesquisa-produto').value.toLowerCase().trim();
    if (termoPesquisa) {
        produtosFiltrados = produtosFiltrados.filter(produto =>
            produto.name.toLowerCase().includes(termoPesquisa)
        );
    }

    const ordemSelecionada = document.getElementById('ordenar-por').value;
    if (ordemSelecionada === 'preco-crescente') {
        produtosFiltrados.sort((a, b) => a.price - b.price);
    } else if (ordemSelecionada === 'preco-decrescente') {
        produtosFiltrados.sort((a, b) => b.price - a.price);
    }

    mostrarProdutos(produtosFiltrados);
}

function mostrarProdutos(produtos) {
    const lista = document.getElementById('lista-produtos');
    lista.innerHTML = '';

    if (produtos.length === 0) {
        lista.innerHTML = '<p>Nenhum produto encontrado com os filtros selecionados.</p>';
        return;
    }

    produtos.forEach(produto => {
        const item = document.createElement('div');
        item.className = 'produto';
        item.innerHTML = `
            <h3>${produto.name}</h3>
            <img src="${produto.image}" alt="${produto.name}" style="width:150px; height:150px; object-fit:cover;">
            <p>${produto.description}</p>
            <p><strong>Preço:</strong> €${produto.price}</p>
            <button onclick="adicionarAoCesto(${produto.id}, '${produto.name}', ${produto.price}, '${produto.image}')">
                + Adicionar ao cesto
            </button>
        `;
        lista.appendChild(item);
    });
}

function obterCesto() {
    const cesto = localStorage.getItem('cesto');
    return cesto ? JSON.parse(cesto) : [];
}

function guardarCesto(cesto) {
    localStorage.setItem('cesto', JSON.stringify(cesto));
}

function adicionarAoCesto(id, nome, preco, imagem) {
    const cesto = obterCesto();
    const existente = cesto.find(item => item.id === id);

    if (existente) {
        existente.quantidade += 1;
    } else {
        cesto.push({ id, nome, preco, imagem, quantidade: 1 });
    }

    guardarCesto(cesto);
    atualizarCesto();
}

function atualizarCesto() {
    const lista = document.getElementById('lista-cesto');
    lista.innerHTML = '';

    const cesto = obterCesto();
    let total = 0;

    if (cesto.length === 0) {
        lista.innerHTML = '<p>O cesto está vazio 🛒</p>';
        return;
    }

    cesto.forEach(item => {
        total += item.preco * item.quantidade;

        const linha = document.createElement('div');
        linha.className = 'item-cesto';
        linha.innerHTML = `
            <img src="${item.imagem}" alt="${item.nome}" width="50">
            <p>${item.nome} (x${item.quantidade}) — €${(item.preco * item.quantidade).toFixed(2)}</p>
            <button onclick="removerDoCesto(${item.id})">Remover</button>
        `;
        lista.appendChild(linha);
    });

    const totalDiv = document.createElement('p');
    totalDiv.innerHTML = `<strong>Total: €${total.toFixed(2)}</strong>`;
    lista.appendChild(totalDiv);

    const limparBtn = document.createElement('button');
    limparBtn.textContent = 'Limpar cesto';
    limparBtn.onclick = limparCesto;
    lista.appendChild(limparBtn);
}

function removerDoCesto(id) {
    let cesto = obterCesto();
    cesto = cesto.filter(item => item.id !== id);
    guardarCesto(cesto);
    atualizarCesto();
}

function limparCesto() {
    localStorage.removeItem('cesto');
    atualizarCesto();
}


window.onload = function() {
    document.getElementById('filtro-categoria').addEventListener('change', aplicarFiltrosEOrdenacao);
    document.getElementById('ordenar-por').addEventListener('change', aplicarFiltrosEOrdenacao);
    document.getElementById('pesquisa-produto').addEventListener('input', aplicarFiltrosEOrdenacao);
    
    carregarCategorias();
    carregarProdutos();
    atualizarCesto();
};