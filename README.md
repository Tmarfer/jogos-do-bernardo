# Sílabas do Bê

Um jogo de alfabetização em português com dois níveis, pensado para tocar no Safari do iPad. O projeto mantém o visual e os recursos da primeira versão. HTML, CSS e JavaScript puro: sem build, bibliotecas de produção, cadastro, anúncios, rastreamento ou serviços externos.

## Como brincar

Na tela inicial, os dois níveis ficam disponíveis, sem desbloqueio:

- **Nível 0 — Juntar sílabas:** mantém as cinco palavras originais (BOLA, CASA, GATO, PATO e SAPO), a figura, o modelo dividido em sílabas e os dois botões. Observe o modelo e toque nas sílabas na ordem. A dica após um erro continua indicando por onde começar.
- **Nível 1 — Escolher sílabas:** usa as 20 palavras abaixo. A figura aparece sem nome ou divisão escrita. Primeiro, escolha a primeira sílaba entre quatro alternativas; depois, escolha a segunda entre quatro novas alternativas. Todas têm a mesma aparência e mudam de posição a cada etapa. Um erro mantém os acertos e a ordem das alternativas e mostra “Vamos tentar outra?”. **Ajuda** destaca a sílaba correta e, com som e voz disponíveis, fala essa sílaba.

Cada rodada tem **cinco palavras sorteadas, sem repetição**. No final, há **Jogar mais** e **Trocar nível**. No Nível 1, as palavras ainda não apresentadas têm prioridade até percorrer o banco. Só palavras efetivamente mostradas contam como apresentadas: sair no meio de uma rodada não considera as restantes como vistas. O histórico é separado por nível e dura enquanto a página permanece aberta. Trocar de nível inicia uma nova rodada e mantém esse histórico; recarregar a página reinicia as rodadas e o histórico.

COCO tem duas etapas independentes: um toque em CO preenche só o primeiro espaço e é necessário outro toque para o segundo. Não há cronômetro, punições ou pontuação competitiva. É possível jogar com toque ou teclado, sem arrastar.

Ao completar cada palavra, o jogo mostra a palavra escrita e sua divisão em sílabas. Três porquinhos e letras fazem uma comemoração de aproximadamente um segundo. A criança escolhe quando continuar.

Em **Opções**, é possível desligar sons e animações separadamente. O som começa desligado; quando habilitado, uma melodia breve e suave é gerada no próprio aparelho após um acerto. A preferência de movimento reduzido do sistema também é respeitada.

No Nível 1, com som habilitado, o navegador fala a palavra ao iniciar a rodada. **Ouvir de novo** repete a palavra, e **Ajuda** fala a sílaba correta da etapa atual. A voz é sintetizada pelo sistema, sem gravações de pessoas. O app seleciona apenas vozes **locais** em português, dando preferência a pt-BR, sem chamar um serviço de voz externo. Se não existir uma voz local em português, a voz falhar ou o som estiver desligado, o responsável pode dizer o nome da figura; o jogo continua normalmente. As chamadas de fala são feitas diretamente no toque de escolher nível, continuar, ouvir ou pedir ajuda, para respeitar a exigência de interação do Safari. Se as vozes carregarem depois, o app espera um novo toque em **Ouvir de novo**, sem reprodução automática fora da interação.

Todas as figuras são desenhos SVG locais. Apenas as preferências de som e animação ficam no armazenamento local do navegador. Não são coletados dados pessoais, cookies ou eventos. As preferências permanecem ao recarregar quando o navegador permite. Bloquear armazenamento, áudio ou voz não impede o jogo.

## Banco de palavras

Os dados ficam em `words.js`, separados da lógica do jogo, com `id`, `word`, `syllables`, `image`, `description` e `alternatives` (uma lista de quatro sílabas para cada etapa).

| Palavra | Divisão | Palavra | Divisão |
| --- | --- | --- | --- |
| BOLA | BO + LA | DADO | DA + DO |
| CASA | CA + SA | DEDO | DE + DO |
| PATO | PA + TO | PIPA | PI + PA |
| GATO | GA + TO | MOTO | MO + TO |
| SAPO | SA + PO | BOTA | BO + TA |
| VACA | VA + CA | BOCA | BO + CA |
| FACA | FA + CA | CAMA | CA + MA |
| MALA | MA + LA | COCO | CO + CO |
| MAPA | MA + PA | SUCO | SU + CO |
| LATA | LA + TA | RATO | RA + TO |

Para ampliar o Nível 1, adicione um registro e uma figura SVG em `assets/`. Cada etapa deve ter quatro sílabas completas diferentes, com exatamente uma correta e alternativas que mantêm a consoante e mudam a vogal. A validação roda ao carregar o banco. Esta versão valida sílabas simples de consoante + vogal; palavras com outros formatos precisam de adaptação explícita da validação. `levelZeroIds` define as cinco palavras do Nível 0. Os testes conferem todas as divisões acima, as alternativas e a existência das figuras locais.

## Abrir uma prévia

Não é necessário instalar pacotes. Na pasta do repositório, com Python 3:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

No mesmo computador, abra `http://localhost:8000`. Para testar no iPad, conecte-o à mesma rede Wi-Fi e abra, no Safari, `http://IP-DO-COMPUTADOR:8000`, substituindo o endereço pelo IP local do computador que iniciou o servidor. Permita a porta 8000 na rede local se necessário. Encerre o servidor com Ctrl+C.

Um servidor iniciado no ambiente da nuvem não fica acessível ao iPad pelo `localhost` do aparelho. Nesse caso, baixe o projeto para um computador na mesma rede ou use uma hospedagem estática com HTTPS. O servidor Python é apenas para desenvolvimento.

Depois de hospedar, a opção do Safari **Compartilhar → Adicionar à Tela de Início** cria um atalho. Esta versão não possui cache offline ou instalação de PWA.

## Testes

São **18 testes**:

- `tests/browser.cjs`: os seis testes da primeira versão adaptados à escolha do Nível 0 e à ordem sorteada. Verificam as cinco palavras originais, dicas, manutenção do progresso, bloqueio de toques repetidos, porquinhos, fim da animação, conclusão, reinício, teclado, preferências e som opcional.
- `tests/level-one.cjs`: nove testes de navegação, 20 palavras ao longo de quatro rodadas, 40 etapas, erros, Ajuda, COCO, prioridade de palavras não mostradas mesmo em rodadas interrompidas, alternativas visualmente iguais, ausência da resposta escrita/acessível antes do acerto, layouts e integração de voz simulada.
- `tests/words.cjs`: três testes do banco, das divisões, das 40 listas de alternativas e dos casos inválidos. Esses testes não precisam de servidor, navegador ou Playwright: `node --test tests/words.cjs`.

As suítes de navegador também verificam tamanho dos botões, ausência de rolagem horizontal, armazenamento/áudio/voz indisponíveis e ausência de solicitações externas do aplicativo. Os testes de voz simulam a API para conferir português, voz local, chamada durante uma interação, replay, Ajuda, falha e cancelamento. Eles não validam a pronúncia ou o áudio real do iPad.

Com o servidor de prévia ativo e Playwright disponível como ferramenta de desenvolvimento:

```sh
BROWSER_PATH=/usr/bin/chromium node --test tests/browser.cjs tests/level-one.cjs tests/words.cjs
```

Para instalar a ferramenta separadamente do jogo em Linux/macOS, quando ela não estiver disponível:

```sh
npm install --prefix /tmp/silabas-test-tools --no-save --package-lock=false playwright@1.62.1
PLAYWRIGHT_BROWSERS_PATH=/tmp/silabas-test-browsers /tmp/silabas-test-tools/node_modules/.bin/playwright install chromium
NODE_PATH=/tmp/silabas-test-tools/node_modules PLAYWRIGHT_BROWSERS_PATH=/tmp/silabas-test-browsers node --test tests/browser.cjs tests/level-one.cjs tests/words.cjs
```

Playwright é opcional e usado só para testes; não é enviado como dependência do jogo. Para usar outro Chromium instalado, defina `BROWSER_PATH`. `TEST_URL` altera o endereço do servidor e `SCREENSHOT_DIR` salva capturas fora do código. Para testar com WebKit, instale esse navegador pelo Playwright e use `TEST_BROWSER=webkit`, sem `BROWSER_PATH`.

Validação desta versão: **18 testes passaram no Chromium**, com layouts de 768 × 1024, 1024 × 768, 1024 × 650 (menos espaço para simular as barras do Safari) e 320 × 740. Os 21 SVGs também foram conferidos como XML válido e as 20 figuras foram inspecionadas visualmente. O WebKit não está instalado; seu download foi bloqueado pela política de rede da nuvem. A emulação de tamanho e toque não substitui um teste em iPad real.

### Conferir no Safari do iPad

1. Abra a versão publicada e teste a escolha e a troca dos dois níveis, em retrato e paisagem.
2. Habilite **Sons suaves** antes de entrar no Nível 1. Confira a palavra falada ao entrar e ao avançar e toque em **Ouvir de novo**. Verifique a pronúncia das palavras e das sílabas em **Ajuda**, principalmente CO e GE. A qualidade da pronúncia depende da voz do sistema.
3. Se não houver voz local em português, confira as vozes de português disponíveis nos ajustes de Acessibilidade do iPad. Enquanto isso, o responsável pode falar o nome da figura. Não é preciso fornecer dados ou credenciais ao jogo.
4. Desligue o som durante uma fala e confirme que ela para. Desligue as animações e confira que a comemoração fica estática.
5. No Nível 1, erre em cada etapa e confirme que nada é preenchido nem apagado. Use Ajuda, complete COCO com dois toques e termine uma rodada. Teste **Jogar mais** e **Trocar nível**.

## Publicar

Revise os arquivos antes de enviar alterações ao GitHub. O arquivo `.nojekyll` orienta o GitHub Pages a servir o projeto como um site estático.

O aplicativo público precisa destes **25 arquivos**: `index.html`, `styles.css`, `words.js`, `app.js` e os 21 SVGs em `assets/` (20 figuras e o porquinho). Mantenha também `.nojekyll` no GitHub Pages. Uma hospedagem estática serve esses arquivos; não recebe dados da criança e não precisa de banco, backend, instalação de pacotes ou comando de build.

Uma opção é **GitHub Pages**:

1. Revise as alterações locais. O commit do projeto inclui os quatro arquivos do aplicativo, `assets/`, os três arquivos de teste em `tests/`, `.gitignore`, `.nojekyll` e este `README.md`. O push envia esses arquivos para `Tmarfer/jogos-do-bernardo`.
2. Depois da revisão e de autorizar o envio, faça commit e push para a branch escolhida, por exemplo `main`.
3. No GitHub, abra **Settings → Pages → Build and deployment → Deploy from a branch**. Escolha a branch enviada e a pasta **/(root)**, e salve.
4. Use o endereço HTTPS informado pelo GitHub Pages e abra no Safari do iPad. Teste o fluxo completo depois de publicar. A publicação a partir da raiz também pode servir o README e o arquivo de teste; eles não contêm credenciais ou dados pessoais.

Com o Pages já configurado para `main` e `/(root)`, um novo push para `main` atualiza a publicação pelo mesmo fluxo. Não altere a configuração ou a visibilidade do repositório para atualizar o jogo.

Alternativamente, envie apenas os 25 arquivos públicos a uma hospedagem estática, mantendo `assets/` ao lado de `index.html`. Os caminhos são relativos, para funcionar tanto na raiz quanto numa subpasta como `/jogos-do-bernardo/`.
