# Meu App

Aplicação web desenvolvida com configuração para execução de um serviço
backend. Este projeto utiliza variáveis de ambiente para definir a porta
do servidor, parâmetros da aplicação e dados de acesso administrativo.

> **Nota:** Este README é um modelo inicial. Atualize o nome, a
> descrição, as funcionalidades e os comandos de execução de acordo com
> a estrutura real do projeto.

## Funcionalidades e configuração

-   Configuração da porta do servidor através de `PORT`.
-   Segredo de autenticação configurável através de `JWT_SECRET`.
-   Parâmetro de taxa mensal (`TAXA_MENSAL`).
-   Limite máximo configurável (`VALOR_MAXIMO`).
-   Configuração do telefone e da palavra-passe do administrador.

## Requisitos

-   Node.js (versão compatível com o projeto).
-   npm.
-   Git (opcional, para controlo de versões e publicação no GitHub).

## Instalação

1.  Clone este repositório:

    ``` bash
    git clone URL_DO_REPOSITORIO
    ```

2.  Entre na pasta do projeto:

    ``` bash
    cd NOME_DA_PASTA
    ```

3.  Instale as dependências:

    ``` bash
    npm install
    ```

4.  Crie um ficheiro `.env` na raiz do projeto e configure as variáveis
    indicadas abaixo.

5.  Inicie a aplicação usando o comando definido nos scripts do
    `package.json`:

    ``` bash
    npm start
    ```

Se o projeto não tiver o script `start`, confirme os comandos
disponíveis no `package.json` antes de iniciar.

## Variáveis de ambiente

Configure estas variáveis no ficheiro `.env` local ou na secção
**Environment** do serviço de alojamento:

  Variável           Descrição
  ------------------ ------------------------------------------------------
  `PORT`             Porta em que o servidor deverá escutar.
  `JWT_SECRET`       Segredo longo e aleatório usado para assinar tokens.
  `TAXA_MENSAL`      Taxa mensal utilizada pela aplicação.
  `VALOR_MAXIMO`     Valor máximo configurado no sistema.
  `ADMIN_TELEFONE`   Telefone da conta administrativa.
  `ADMIN_PASSWORD`   Palavra-passe da conta administrativa.

Exemplo de `.env.example` (sem credenciais reais):

``` env
PORT=3000
JWT_SECRET=SUBSTITUA_POR_UM_SEGREDO_LONGO_E_ALEATORIO
TAXA_MENSAL=0.10
VALOR_MAXIMO=20000
ADMIN_TELEFONE=
ADMIN_PASSWORD=
```

## Publicação no Render

Para publicar como **Web Service**:

1.  Envie o código para um repositório GitHub.
2.  No Render, escolha **New + → Web Service**.
3.  Ligue o repositório GitHub e selecione este projeto.
4.  Configure o comando de construção de acordo com o projeto. Para
    muitos projetos Node.js, pode ser `npm install`.
5.  Configure o comando de arranque conforme o `package.json` (por
    exemplo, `npm start`, apenas se esse script existir).
6.  Adicione as variáveis de ambiente na secção **Environment** do
    Render.
7.  Clique em **Create Web Service** e acompanhe o processo em **Logs**.

O servidor deve escutar na porta fornecida pelo ambiente de alojamento.
Em aplicações Node.js, confirme que o código utiliza `process.env.PORT`
e aceita ligações externas, por exemplo através de `0.0.0.0`, conforme a
framework utilizada.

## Segurança

-   **Nunca envie o ficheiro `.env` para o GitHub.**
-   Inclua `.env` no `.gitignore`.
-   Mantenha `.env.example` sem palavras-passe, tokens ou outros
    segredos reais.
-   Use um `JWT_SECRET` longo, aleatório e exclusivo.
-   Defina uma palavra-passe administrativa forte e altere imediatamente
    quaisquer credenciais de exemplo.
-   Se um segredo real tiver sido publicado ou partilhado, substitua-o.

## Estrutura do projeto

A estrutura exacta depende dos ficheiros existentes. Uma estrutura comum
é:

``` text
meu-app/
├── src/
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Suporte

Para instruções específicas de instalação e publicação, consulte os
scripts e as dependências definidos no `package.json` e a documentação
da framework utilizada.
