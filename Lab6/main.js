if (!localStorage.getItem('produtos-selecionados')) {
    localStorage.setItem('produtos-selecionados', JSON.stringify([]));
}

function criarProduto(produto) {
    const artigo = document.createElement('article');
    const titulo = document.createElement('h3');
    titulo.textContent = produto.title;

    const imagem = document.createElement('img');
    imagem.src = produto.image;
    imagem.alt = produto.title;

    const preco = document.createElement('p');
    preco.textContent = `${produto.price} €`;

    const descricao = document.createElement('p');
    descricao.textContent = produto.description;

    const botao = document.createElement('button');
    botao.textContent = '+ Adicionar ao cesto';

    botao.addEventListener('click', () => {
        let produtosSelecionados = JSON.parse(localStorage.getItem('produtos-selecionados')) || [];
        const existente = produtosSelecionados.find(p => p.id === produto.id);

        if (existente) {
            existente.quantidade += 1;
        } else {
            produtosSelecionados.push({
                id: produto.id,
                title: produto.title,
                price: produto.price,
                quantidade: 1,
                image: produto.image
            });
        }

        localStorage.setItem('produtos-selecionados', JSON.stringify(produtosSelecionados));
        atualizaCesto();
    });

    artigo.append(titulo, imagem, preco, descricao, botao);
    return artigo;
}

function carregarProdutos(produtos) {
    const secao = document.querySelector('#lista-produtos'); 
    produtos.forEach(produto => {
        const artigo = criarProduto(produto);
        secao.appendChild(artigo);
    });
}

function criaProdutoCesto(produto) {
    const artigo = document.createElement('article');
    const titulo = document.createElement('h3');
    titulo.textContent = produto.title;

    const imagem = document.createElement('img');
    imagem.src = produto.image;
    imagem.alt = produto.title;
    
    const totalItem = produto.price * produto.quantidade;
    const custoTotal = document.createElement('p');
    custoTotal.textContent = `Custo total: ${totalItem.toFixed(2)} €`;

    const botaoRemover = document.createElement('button');
    botaoRemover.textContent = '- Remover do Cesto';

    botaoRemover.addEventListener('click', () => {
        let produtosSelecionados = JSON.parse(localStorage.getItem('produtos-selecionados')) || [];
        const existente = produtosSelecionados.find(p => p.id === produto.id);

        if (existente && existente.quantidade > 1) {
            existente.quantidade -= 1;
        } else {
            const indice = produtosSelecionados.findIndex(p => p.id === produto.id);
            if (indice !== -1) {
                produtosSelecionados.splice(indice, 1);
            }
        }
        
        localStorage.setItem('produtos-selecionados', JSON.stringify(produtosSelecionados));
        atualizaCesto();
    });

    artigo.append(titulo, imagem, custoTotal, botaoRemover);
    return artigo;
}

function atualizaCesto() {
    const produtosSelecionados = JSON.parse(localStorage.getItem('produtos-selecionados')) || [];
    const secaoCesto = document.querySelector('#cesto');
    
    secaoCesto.innerHTML = '<h2>Produtos selecionados</h2>'; 

    if (produtosSelecionados.length === 0) {
        secaoCesto.innerHTML += '<p>O seu cesto está vazio 🛒</p>';
        return;
    }

    const listaCesto = document.createElement('section');
    listaCesto.id = 'lista-cesto';
    
    let total = 0;
    produtosSelecionados.forEach(produto => {
        const artigo = criaProdutoCesto(produto);
        listaCesto.appendChild(artigo);
        total += produto.price * produto.quantidade;
    });

    secaoCesto.appendChild(listaCesto);

    const totalElemento = document.createElement('h3');
    totalElemento.textContent = `Total: ${total.toFixed(2)} €`;
    secaoCesto.appendChild(totalElemento);
}

carregarProdutos(produtos); 
atualizaCesto();
