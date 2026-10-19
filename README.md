# Sonhos da Mary 🌙

Um cantinho de histórias para o Felipe ler com a Mary antes de dormir. O site combina uma biblioteca de historinhas com uma experiência de leitura acolhedora, tema escuro inspirado na Kuromi e uma identidade feita especialmente para ela.

> **Frontend estático:** a página pode ser publicada diretamente pelo GitHub Pages. A sincronização entre dispositivos usa uma API Node.js no Vercel, conectada ao MongoDB Atlas; essa parte é opcional para quem só quer usar o site em um aparelho. Não há cadastro individual no site; o responsável ainda precisa de um projeto de hospedagem para a API.

## Recursos

- Catálogo com **222 histórias** incluídas no projeto, organizadas por categoria.
- Busca por título, descrição ou categoria.
- Botão para sortear uma história, dando preferência às que ainda não foram lidas.
- Leitor com navegação entre histórias, tempo estimado, contagem de palavras e ajuste do tamanho do texto.
- Memória das histórias lidas e barra de progresso salvas no navegador.
- Sincronização opcional entre dispositivos por uma coleção compartilhada protegida por uma chave, sem cadastro no site.
- Abertura animada com a Kuromi, animações na interface e som sintetizado ao clicar em botões e links.
- Layout adaptável a celulares e computadores; as animações respeitam a preferência de movimento reduzido do dispositivo.

## Tecnologias

- HTML, CSS e JavaScript sem framework.
- [Google Fonts](https://fonts.google.com/): Lexend e Baloo 2.
- [Font Awesome](https://fontawesome.com/): ícones.
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API): som de clique gerado no navegador.
- [Vercel Functions](https://vercel.com/docs/functions): API privada para leitura e gravação do progresso.
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/): persistência compartilhada das histórias lidas.

## Arquivos do projeto

```text
.
├── index.html                 # Página, leitor e estrutura do site
├── style.css                  # Tema, layout, animações e responsividade
├── script.js                  # Busca, filtros, leitura, memórias e som
├── stories-data.js            # Catálogo de histórias em JavaScript
├── sync-config.js             # URL pública da API de sincronização
├── api/
│   └── progress.js            # API Vercel que acessa o MongoDB no servidor
├── package.json               # Dependência do driver MongoDB
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

## Sincronizar leituras entre dispositivos com MongoDB

O GitHub Pages entrega arquivos estáticos e não consegue conectar com segurança ao MongoDB diretamente. A API `api/progress.js` faz essa conexão no servidor do Vercel, mantendo a URI do Atlas fora do código público. Os dispositivos compartilham uma única coleção de progresso, sem conta ou senha no site; a sincronização ocorre automaticamente ao abrir a página e ao marcar uma história como lida.

### 1. Troque a senha do usuário MongoDB

A URI MongoDB compartilhada durante a configuração deve ser tratada como exposta. No MongoDB Atlas, abra **Database Access** e troque a senha desse usuário (ou crie outro usuário de banco). Dê a ele apenas permissão de leitura e gravação no banco `sonhos_da_mary`. Use a nova URI somente como variável privada no Vercel; não a coloque em `sync-config.js`, no GitHub ou no frontend.

### 2. Publique a API no Vercel

1. Importe este repositório em um projeto Vercel. O Vercel detecta a função dentro de `api/` e instala o driver descrito em `package.json`.
2. Em **Project → Settings → Environment Variables**, crie estas variáveis:

   | Nome | Valor |
   | --- | --- |
   | `MONGODB_URI` | URI MongoDB com a senha nova, só no ambiente do servidor |
   | `MONGODB_DB` | `sonhos_da_mary` |
   | `ALLOWED_ORIGINS` | `https://maryprincesa.fun,https://www.maryprincesa.fun,https://fuckingyourlife.github.io` |

   Para testar a partir de `http://localhost:8000`, inclua esse endereço em `ALLOWED_ORIGINS`, separado por vírgula. A página aberta como `file://` não pode chamar a API por causa das regras de origem do navegador.
3. No **Network Access** do Atlas, autorize conexões de saída da função Vercel. Mantenha a autenticação do usuário de banco ativa.
4. Implante ou faça novo deploy para aplicar as variáveis. Copie o endereço público do projeto, por exemplo `https://SEU-PROJETO.vercel.app`.

O Vercel mantém variáveis de ambiente no servidor e as funções dentro de `api/` são publicadas como endpoints. Veja a documentação de [Vercel Functions](https://vercel.com/docs/functions/runtimes/node-js) e [variáveis de ambiente](https://vercel.com/docs/environment-variables/managing-environment-variables).

### 3. Conecte o frontend à API

No arquivo `sync-config.js`, informe o endereço da função:

```js
window.MARY_SYNC_API_URL = 'https://SEU-PROJETO.vercel.app/api/progress';
```

Envie essa alteração ao GitHub Pages. Depois do deploy, os aparelhos mesclam automaticamente o progresso local com a coleção do MongoDB, sem pedir senha ou exigir clique para sincronizar.

As leituras antigas do aparelho são mescladas à coleção na primeira conexão. Novas leituras são gravadas no MongoDB e continuam disponíveis depois de trocar ou limpar o navegador. O botão **Desconectar dispositivo** remove a chave salva apenas daquele aparelho; não apaga o progresso no banco.

Como o site não pede conta nem senha, o endpoint de progresso é público para leitura e gravação. A API aceita somente os IDs das histórias existentes e apenas acrescenta leituras; alguém que descubra o endereço ainda pode marcar histórias como lidas para todos. O CORS restringe o uso normal por outros sites, mas não substitui autenticação contra chamadas diretas. A URI e a senha do MongoDB permanecem privadas no Vercel e nunca são enviadas ao navegador.

## Créditos e direitos

- **Feito pelo Felipe, com muito amor para Mary.**
- As histórias do Corujita mantêm seus respectivos links de origem e são usadas com a autorização informada pelo autor.
- Kuromi e demais personagens Sanrio pertencem à [Sanrio](https://www.sanrio.com/). Os stickers animados são carregados do [GIPHY](https://giphy.com/sanrio_kuromi).
- As fontes e os ícones são servidos por Google Fonts e Font Awesome.
- A sincronização entre dispositivos depende da API no Vercel, do MongoDB Atlas e do endereço da API configurados pelo responsável pelo site.

Este repositório não inclui um arquivo de licença. A publicação do código no GitHub, por si só, não concede licença para reutilizar histórias, imagens, marcas ou outros materiais de terceiros.
