# FormulaLab

O FormulaLab é uma ferramenta web para visualizar e interagir com fórmulas matemáticas e de física. O objetivo é ajudar a compreender esses conceitos de forma prática, permitindo alterar os valores dos parâmetros e ver os resultados em gráficos e animações no mesmo instante.

## Como funciona

Os cálculos e gráficos são gerados em tempo real diretamente no navegador. O visual destaca as variáveis que podem ser controladas, facilitando a observação de como cada alteração afeta o resultado final.

## Conteúdo do projeto

Atualmente, o projeto conta com 38 tópicos divididos em duas categorias principais.

### Matemática

* Teorema de Pitágoras
* Função Linear
* Função Quadrática
* Área do Círculo
* Área do Triângulo
* Área do Retângulo
* Porcentagem
* Distância entre Dois Pontos
* Seno e Cosseno
* Progressão Aritmética
* Volume do Cubo
* Área e Volume da Esfera
* Juros Compostos
* Celsius para Fahrenheit
* Média Ponderada
* Curvas de Bézier
* Tipos de Ângulos
* Área do Quadrado
* Espiral de Ouro

### Física

* Queda Livre
* Movimento Uniforme
* Segunda Lei de Newton
* Lei de Ohm
* Energia Cinética
* Energia Potencial
* Trabalho
* Pressão
* Densidade
* Gravitação Universal
* Movimento Variado
* Período do Pêndulo
* Calor Sensível
* Lei de Hooke
* Força Elétrica
* Lançamento de Projéteis
* Órbitas Planetárias
* Dilatação do Tempo
* Gases Ideais

## Como acessar

O simulador está hospedado no Netlify e pode ser acessado diretamente pelo link:

[Acesse o FormulaLab](https://formula-lab.netlify.app)

## Como executar localmente

Como o deploy automático do Netlify está pausado para desenvolvimento, você pode executar o FormulaLab localmente no seu computador de duas formas simples:

### Opção 1: Abertura Direta
1. Navegue até a pasta do projeto no seu computador.
2. Dê um duplo clique no arquivo `index.html` para abri-lo diretamente em qualquer navegador.

### Opção 2: Servidor Local (Recomendado para transições suaves)
Se você estiver utilizando o VS Code:
1. Instale a extensão **Live Server**.
2. Clique com o botão direito no arquivo `index.html` e selecione **Open with Live Server**.

Se preferir usar o terminal na pasta do projeto:
* **Python**: Execute `python -m http.server 8000` e acesse `http://localhost:8000`.
* **Node.js (npm)**: Execute `npx serve` e acesse o endereço fornecido no terminal.
