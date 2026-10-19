# Sonhos da Mary 🌙

Um cantinho de histórias para o Felipe ler com a Mary antes de dormir. O site combina uma biblioteca de historinhas com uma experiência de leitura acolhedora, tema escuro inspirado na Kuromi e uma identidade feita especialmente para ela.

> **Projeto estático:** não precisa de servidor, banco de dados, instalação de dependências ou processo de build. Os arquivos podem ser publicados diretamente pelo GitHub Pages.

## Recursos

- Catálogo com **222 histórias** incluídas no projeto, organizadas por categoria.
- Busca por título, descrição ou categoria.
- Botão para sortear uma história, dando preferência às que ainda não foram lidas.
- Leitor com navegação entre histórias, tempo estimado, contagem de palavras e ajuste do tamanho do texto.
- Memória das histórias lidas e barra de progresso salvas no navegador.
- Abertura animada com a Kuromi, animações na interface e som sintetizado ao clicar em botões e links.
- Layout adaptável a celulares e computadores; as animações respeitam a preferência de movimento reduzido do dispositivo.

## Tecnologias

- HTML, CSS e JavaScript sem framework.
- [Google Fonts](https://fonts.google.com/): Lexend e Baloo 2.
- [Font Awesome](https://fontawesome.com/): ícones.
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API): som de clique gerado no navegador.

## Arquivos do projeto

```text
.
├── index.html                 # Página, leitor e estrutura do site
├── style.css                  # Tema, layout, animações e responsividade
├── script.js                  # Busca, filtros, leitura, memórias e som
├── stories-data.js            # Catálogo de histórias em JavaScript
├── scripts/
│   └── import_corujita.py     # Ferramenta opcional para atualizar o catálogo
└── assets/                    # Pasta para imagens e outros arquivos locais
```

## Abrir localmente

Não é necessário instalar nada para visualizar o site:

1. Baixe ou clone este repositório.
2. Abra `index.html` no navegador.

Se preferir testar usando um servidor local, com Python instalado, abra um terminal na pasta do projeto e execute:

```bash
python -m http.server 8000
```

Depois, acesse <http://localhost:8000>.

Google Fonts, Font Awesome, figurinhas animadas da Kuromi e imagens das histórias dependem de conexão com a internet. O texto das histórias já está incluído em `stories-data.js`.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub e envie para ele os arquivos deste projeto, incluindo `index.html`, `style.css`, `script.js` e `stories-data.js`.
2. No repositório, abra **Settings → Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione sua branch principal (normalmente `main`) e a pasta **/(root)**; clique em **Save**.
5. Aguarde a publicação. O GitHub mostrará o endereço do site na página **Settings → Pages**.

Consulte o [guia oficial de publicação do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages).

### Usar um domínio comprado na Hostinger

O site pode continuar hospedado no GitHub Pages enquanto o DNS do domínio fica na Hostinger:

1. Em **Settings → Pages** do repositório, informe o domínio em **Custom domain** e salve.
2. No hPanel da Hostinger, abra os registros DNS do domínio e crie os registros abaixo. Substitua `SEU-USUARIO` pelo nome da sua conta do GitHub.

| Tipo | Nome/Host | Aponta para |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `SEU-USUARIO.github.io` |

3. Aguarde a propagação do DNS. Ela pode levar algum tempo.
4. Quando o GitHub concluir a configuração do certificado, habilite **Enforce HTTPS** em **Settings → Pages**.

Consulte a documentação do GitHub sobre [domínios personalizados](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site) e o guia da Hostinger para [gerenciar registros DNS](https://support.hostinger.com/en/articles/1583249-how-to-manage-dns-records-at-hostinger). Não remova registros `MX` ou `TXT` que já sejam usados pelo e-mail ou por outros serviços do domínio.

## Catálogo de histórias

O arquivo `stories-data.js` contém os títulos, categorias, descrições, textos, duração estimada, imagem e link da fonte de cada história. Para atualizar o catálogo a partir do sitemap atual do Corujita, use Python 3.10 ou mais recente e execute:

```bash
python scripts/import_corujita.py
```

O importador precisa de acesso à internet. Ele consulta o sitemap e as páginas de histórias do Corujita e grava um novo `stories-data.js`; revise as alterações antes de enviá-las ao GitHub. Se uma página falhar durante a importação, o script informa o endereço para que você possa revisar.

O conteúdo do Corujita foi incluído com a autorização de uso informada pelo autor. Cada história mantém um link para sua página de origem. Ao republicar ou atualizar o catálogo, preserve os créditos e confirme que a autorização continua válida.

## Memórias de leitura e privacidade

O site não tem conta, servidor ou banco de dados. As histórias marcadas como lidas ficam no `localStorage` do navegador e do dispositivo em que foram lidas. Portanto:

- A memória não sincroniza entre aparelhos ou navegadores.
- Limpar os dados do site no navegador apaga as histórias marcadas como lidas.
- O catálogo e os arquivos enviados a um repositório público ficam acessíveis a qualquer pessoa.

## Créditos e direitos

- **Feito pelo Felipe, com muito amor para Mary.**
- As histórias do Corujita mantêm seus respectivos links de origem e são usadas com a autorização informada pelo autor.
- Kuromi e demais personagens Sanrio pertencem à [Sanrio](https://www.sanrio.com/). Os stickers animados são carregados do [GIPHY](https://giphy.com/sanrio_kuromi).
- As fontes e os ícones são servidos por Google Fonts e Font Awesome.

Este repositório não inclui um arquivo de licença. A publicação do código no GitHub, por si só, não concede licença para reutilizar histórias, imagens, marcas ou outros materiais de terceiros.
