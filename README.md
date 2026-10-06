# Sílabas do Bê

Um primeiro jogo de alfabetização em português, pensado para tocar no Safari do iPad. HTML, CSS e JavaScript puro: sem build, bibliotecas de produção, cadastro, anúncios, rastreamento ou serviços externos.

## Como brincar

São cinco palavras de duas sílabas: **BO · LA**, **CA · SA**, **GA · TO**, **PA · TO** e **SA · PO**. Observe a figura e o modelo e toque nas sílabas na ordem. Um toque incorreto oferece uma dica gentil e mantém as sílabas já montadas. Não há cronômetro, punições ou pontuação competitiva.

Ao completar cada palavra, três porquinhos e letras fazem uma comemoração de aproximadamente um segundo. A criança escolhe quando continuar. No final, pode brincar novamente.

Em **Opções**, é possível desligar sons e animações separadamente. O som começa desligado; quando habilitado, uma melodia breve e suave é gerada no próprio aparelho após um acerto. Não há voz ou áudio gravado. A preferência de movimento reduzido do sistema também é respeitada.

Todas as figuras são desenhos SVG locais. Apenas as preferências de som e animação ficam no armazenamento local do navegador. Não são coletados dados pessoais, cookies ou eventos. A partida reinicia quando a página é recarregada; as preferências permanecem quando o navegador permite. Bloquear armazenamento ou áudio não impede o jogo.

## Abrir uma prévia

Não é necessário instalar pacotes. Na pasta do repositório, com Python 3:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

No mesmo computador, abra `http://localhost:8000`. Para testar no iPad, conecte-o à mesma rede Wi-Fi e abra, no Safari, `http://IP-DO-COMPUTADOR:8000`, substituindo o endereço pelo IP local do computador que iniciou o servidor. Permita a porta 8000 na rede local se necessário. Encerre o servidor com Ctrl+C.

Um servidor iniciado no ambiente da nuvem não fica acessível ao iPad pelo `localhost` do aparelho. Nesse caso, baixe o projeto para um computador na mesma rede ou use uma hospedagem estática com HTTPS. O servidor Python é apenas para desenvolvimento.

Depois de hospedar, a opção do Safari **Compartilhar → Adicionar à Tela de Início** cria um atalho. Esta versão não possui cache offline ou instalação de PWA.

## Testes

A suíte de navegador em `tests/browser.cjs` verifica as cinco palavras, dicas, manutenção do progresso, bloqueio de toques repetidos, três porquinhos, término da animação, conclusão e reinício. Também verifica toque, teclado, movimento reduzido, preferências após recarregar, armazenamento/áudio indisponíveis, som opcional, tamanho dos botões, ausência de rolagem horizontal e ausência de solicitações externas.

Com o servidor de prévia ativo e Playwright disponível como ferramenta de desenvolvimento:

```sh
BROWSER_PATH=/usr/bin/chromium node --test tests/browser.cjs
```

Para instalar a ferramenta separadamente do jogo em Linux/macOS, quando ela não estiver disponível:

```sh
npm install --prefix /tmp/silabas-test-tools --no-save --package-lock=false playwright@1.62.1
PLAYWRIGHT_BROWSERS_PATH=/tmp/silabas-test-browsers /tmp/silabas-test-tools/node_modules/.bin/playwright install chromium
NODE_PATH=/tmp/silabas-test-tools/node_modules PLAYWRIGHT_BROWSERS_PATH=/tmp/silabas-test-browsers node --test tests/browser.cjs
```

Playwright é opcional e usado só para testes; não é enviado como dependência do jogo. Para usar outro Chromium instalado, defina `BROWSER_PATH`. `TEST_URL` altera o endereço do servidor e `SCREENSHOT_DIR` salva capturas fora do código. Para testar com WebKit, instale esse navegador pelo Playwright e use `TEST_BROWSER=webkit`, sem `BROWSER_PATH`.

Validação desta versão: testes no Chromium em 768 × 1024, 1024 × 768, 1024 × 650 (menos espaço para simular as barras do Safari) e 320 × 740. O download do WebKit foi bloqueado pela política de rede da nuvem. A emulação de tamanho e toque não substitui um teste em iPad real. Antes de usar com a criança, confira no Safari do iPad: figuras, ordem das sílabas, dica após erro, próxima palavra, final, rotação da tela e opções de som/animação.

## Publicar

Revise os arquivos antes de enviar alterações ao GitHub. O arquivo `.nojekyll` orienta o GitHub Pages a servir o projeto como um site estático.

O aplicativo público precisa somente destes **9 arquivos**: `index.html`, `styles.css`, `app.js` e os seis SVGs em `assets/`. Uma hospedagem estática serve esses arquivos; não recebe dados da criança e não precisa de banco, backend, instalação de pacotes ou comando de build.

Uma opção é **GitHub Pages**:

1. Revise as alterações locais. O commit do projeto inclui os três arquivos do aplicativo, `assets/`, `tests/browser.cjs`, `.gitignore`, `.nojekyll` e este `README.md`. O push envia esses arquivos para `Tmarfer/jogos-do-bernardo`.
2. Depois da revisão e de autorizar o envio, faça commit e push para a branch escolhida, por exemplo `main`.
3. No GitHub, abra **Settings → Pages → Build and deployment → Deploy from a branch**. Escolha a branch enviada e a pasta **/(root)**, e salve.
4. Use o endereço HTTPS informado pelo GitHub Pages e abra no Safari do iPad. Teste o fluxo completo depois de publicar. A publicação a partir da raiz também pode servir o README e o arquivo de teste; eles não contêm credenciais ou dados pessoais.

Alternativamente, envie apenas os nove arquivos públicos a uma hospedagem estática, mantendo `assets/` ao lado de `index.html`. Os caminhos são relativos, para funcionar tanto na raiz quanto numa subpasta como `/jogos-do-bernardo/`.
