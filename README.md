# Sílabas do Bê

Um jogo de alfabetização em português com três níveis e 45 palavras ilustradas, pensado para tocar no Safari do iPad. O projeto mantém o visual e os recursos da primeira versão. HTML, CSS e JavaScript puro: sem build, bibliotecas de produção, cadastro, anúncios, rastreamento ou serviços externos.

## Como brincar

Na tela inicial, os três níveis ficam disponíveis, sem desbloqueio:

- **Nível 0 — Juntar sílabas:** ampliado de cinco para **20 palavras** de duas sílabas. Mantém a figura, o modelo dividido e os dois botões. Observe o modelo e toque nas sílabas na ordem. A dica após um erro continua indicando por onde começar. Em COCO, há dois botões CO; é necessário tocar em cada um, pois o primeiro fica desabilitado após o acerto.
- **Nível 1 — Escolher sílabas:** ampliado de 20 para **30 palavras** de duas sílabas. A figura aparece sem nome ou divisão escrita. Primeiro, escolha a primeira sílaba entre quatro alternativas; depois, escolha a segunda entre quatro novas alternativas.
- **Nível 2 — Palavras maiores:** **15 palavras de três sílabas**, sem modelo escrito antes de completar, com seis alternativas em cada uma das três etapas. Cinco alternativas mantêm a consoante e mudam a vogal; a sexta muda a consoante, para aumentar a dificuldade. Por exemplo, BANANA exige BA + NA + NA em três toques independentes.

Nos níveis 1 e 2, todas as alternativas têm a mesma aparência e mudam de posição a cada etapa. Um erro mantém os acertos e a ordem dos botões e mostra “Vamos tentar outra?”. **Ajuda** destaca a sílaba correta e, com som e voz disponíveis, fala essa sílaba. A resposta não é destacada automaticamente.

Cada rodada tem **cinco palavras sorteadas, sem repetição**. No final, há **Jogar mais** e **Trocar nível**. Em todos os níveis, as palavras ainda não apresentadas têm prioridade até percorrer o respectivo banco. Só palavras efetivamente mostradas contam como apresentadas: sair no meio de uma rodada não considera as restantes como vistas. O histórico é separado por nível e dura enquanto a página permanece aberta. Trocar de nível inicia uma nova rodada e mantém esse histórico; recarregar a página reinicia as rodadas e o histórico.

Sílabas repetidas são etapas independentes: COCO precisa de dois toques, BANANA de três, e BATATA de três. Um toque antigo ou repetido na etapa anterior não pode completar a próxima. Não há cronômetro, punições ou pontuação competitiva. É possível jogar com toque ou teclado, sem arrastar.

Ao completar cada palavra, o jogo mostra a palavra escrita e sua divisão em sílabas. Três porquinhos e letras fazem uma comemoração de aproximadamente um segundo. A criança escolhe quando continuar.

Em **Opções**, é possível desligar sons e animações separadamente. O som começa desligado; quando habilitado, uma melodia breve e suave é gerada no próprio aparelho após um acerto. A preferência de movimento reduzido do sistema também é respeitada.

Nos níveis 1 e 2, com som habilitado, o navegador fala a palavra ao iniciar a rodada. **Ouvir de novo** alterna a cada toque: o primeiro fala a palavra inteira, o segundo fala cada sílaba separadamente e mais devagar, o terceiro volta à palavra inteira. Por exemplo: VACA → VA… CA; BANANA → BA… NA… NA. A fala inicial automática não conta como toque. A sequência recomeça a cada palavra e ao trocar de nível; Ajuda e erros não mudam a alternância. **Ajuda** fala a sílaba correta da etapa atual. Tocar novamente interrompe a fala anterior; desligar o som ou sair da palavra cancela todas as sílabas pendentes. A voz é sintetizada pelo sistema, sem gravações de pessoas. O app seleciona apenas vozes **locais** em português, dando preferência a pt-BR, sem chamar um serviço de voz externo. Se não existir uma voz local em português, a voz falhar ou o som estiver desligado, o responsável pode dizer o nome da figura; o jogo continua normalmente. As chamadas de fala são feitas diretamente no toque de escolher nível, continuar, ouvir ou pedir ajuda, para respeitar a exigência de interação do Safari. Se as vozes carregarem depois, o app espera um novo toque em **Ouvir de novo**, sem reprodução automática fora da interação.

Todas as figuras são desenhos SVG locais. Apenas as preferências de som e animação ficam no armazenamento local do navegador. Não são coletados dados pessoais, cookies ou eventos. As preferências permanecem ao recarregar quando o navegador permite. Bloquear armazenamento, áudio ou voz não impede o jogo.

## Banco de palavras

Os dados ficam em `words.js`, separados da lógica do jogo, com `id`, `word`, `syllables`, `image`, `description`, `levels` e `alternatives`. A configuração `levels` define o título, o número de sílabas e a quantidade de opções de cada nível. Os 20 registros originais pertencem aos níveis 0 e 1. Os novos registros em `newWords` indicam explicitamente o nível e geram suas alternativas completas.

As 20 palavras originais abaixo pertencem aos níveis 0 e 1:

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

Mais dez palavras foram adicionadas ao Nível 1:

| Palavra | Divisão | Palavra | Divisão |
| --- | --- | --- | --- |
| FOCA | FO + CA | NAVE | NA + VE |
| LOBO | LO + BO | REDE | RE + DE |
| LUVA | LU + VA | ROSA | RO + SA |
| PENA | PE + NA | RODA | RO + DA |
| SINO | SI + NO | FOGO | FO + GO |

O Nível 2 tem um banco separado de 15 palavras:

| Palavra | Divisão |
| --- | --- |
| BANANA | BA + NA + NA |
| BATATA | BA + TA + TA |
| TOMATE | TO + MA + TE |
| PANELA | PA + NE + LA |
| CANETA | CA + NE + TA |
| CAVALO | CA + VA + LO |
| BONECA | BO + NE + CA |
| JANELA | JA + NE + LA |
| SAPATO | SA + PA + TO |
| MACACO | MA + CA + CO |
| PIPOCA | PI + PO + CA |
| PETECA | PE + TE + CA |
| CEBOLA | CE + BO + LA |
| GIRAFA | GI + RA + FA |
| CAMISA | CA + MI + SA |

Para ampliar um nível, adicione um registro com o nível correspondente e uma figura SVG em `assets/`. O registro de `newWords` tem o formato `[id, palavra, sílabas, descrição, níveis]`; `alternativesFor` gera quatro opções para duas sílabas ou seis para três. Todas devem ser diferentes, com exatamente uma correta. A validação roda ao carregar o banco e verifica a compatibilidade com os níveis, todas as etapas e a existência de pelo menos cinco palavras por nível. Esta versão valida sílabas simples de consoante + vogal; palavras com outros formatos precisam de adaptação explícita da validação. Os testes conferem as 45 divisões acima e a existência das figuras locais.

## Abrir uma prévia

Não é necessário instalar pacotes. Na pasta do repositório, com Python 3:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

No mesmo computador, abra `http://localhost:8000`. Para testar no iPad, conecte-o à mesma rede Wi-Fi e abra, no Safari, `http://IP-DO-COMPUTADOR:8000`, substituindo o endereço pelo IP local do computador que iniciou o servidor. Permita a porta 8000 na rede local se necessário. Encerre o servidor com Ctrl+C.

Um servidor iniciado no ambiente da nuvem não fica acessível ao iPad pelo `localhost` do aparelho. Nesse caso, baixe o projeto para um computador na mesma rede ou use uma hospedagem estática com HTTPS. O servidor Python é apenas para desenvolvimento.

Depois de hospedar, a opção do Safari **Compartilhar → Adicionar à Tela de Início** cria um atalho. Esta versão não possui cache offline ou instalação de PWA.

## Testes

São **28 testes**:

- `tests/browser.cjs`: sete testes do Nível 0, incluindo as 20 palavras ao longo de quatro rodadas e os dois botões de COCO. Verificam dicas, progresso, toques repetidos, porquinhos, fim da animação, conclusão, reinício, teclado, preferências e som opcional.
- `tests/level-one.cjs`: onze testes de navegação, 30 palavras ao longo de seis rodadas, 60 etapas, erros, Ajuda, COCO, prioridade de palavras não mostradas mesmo em rodadas interrompidas, alternativas visualmente iguais, ausência da resposta escrita/acessível antes do acerto, layouts e integração de voz simulada. Incluem a alternância palavra/sílabas nos níveis 1 e 2, fala mais lenta, COCO e BANANA com sílabas repetidas, interrupção, som desligado e reinício ao trocar de palavra ou nível.
- `tests/level-two.cjs`: sete testes das 15 palavras, 45 etapas, seis opções por etapa, erros, Ajuda, BANANA e BATATA com etapas independentes, mudança entre os três níveis, três espaços, layouts e voz/teclado.
- `tests/words.cjs`: três testes do banco de 45 palavras, das 105 listas de alternativas, dos tamanhos de banco por nível e dos casos inválidos. Esses testes não precisam de servidor, navegador ou Playwright: `node --test tests/words.cjs`.

As suítes de navegador também verificam tamanho dos botões, ausência de rolagem horizontal, armazenamento/áudio/voz indisponíveis e ausência de solicitações externas do aplicativo. Os testes de voz simulam a API para conferir português, voz local, chamada durante uma interação, replay, Ajuda, falha e cancelamento. Eles não validam a pronúncia ou o áudio real do iPad.

Com o servidor de prévia ativo e Playwright disponível como ferramenta de desenvolvimento:

```sh
BROWSER_PATH=/usr/bin/chromium node --test tests/browser.cjs tests/level-one.cjs tests/level-two.cjs tests/words.cjs
```

Para instalar a ferramenta separadamente do jogo em Linux/macOS, quando ela não estiver disponível:

```sh
npm install --prefix /tmp/silabas-test-tools --no-save --package-lock=false playwright@1.62.1
PLAYWRIGHT_BROWSERS_PATH=/tmp/silabas-test-browsers /tmp/silabas-test-tools/node_modules/.bin/playwright install chromium
NODE_PATH=/tmp/silabas-test-tools/node_modules PLAYWRIGHT_BROWSERS_PATH=/tmp/silabas-test-browsers node --test tests/browser.cjs tests/level-one.cjs tests/level-two.cjs tests/words.cjs
```

Playwright é opcional e usado só para testes; não é enviado como dependência do jogo. Para usar outro Chromium instalado, defina `BROWSER_PATH`. `TEST_URL` altera o endereço do servidor e `SCREENSHOT_DIR` salva capturas fora do código. Para testar com WebKit, instale esse navegador pelo Playwright e use `TEST_BROWSER=webkit`, sem `BROWSER_PATH`.

Validação desta versão: **28 testes passaram no Chromium**, com layouts de 768 × 1024, 1024 × 768, 1024 × 650 (menos espaço para simular as barras do Safari) e 320 × 740. Os 46 SVGs foram conferidos como XML válido e as 25 novas figuras foram inspecionadas visualmente e carregadas sem erros no navegador. No Nível 2, a tela em paisagem divide a figura e as opções em duas colunas para manter os controles visíveis. No Nível 0, a comemoração usa menos espaço em paisagem para o botão de continuar caber na tela. O WebKit não está instalado; seu download foi bloqueado pela política de rede da nuvem. A emulação de tamanho e toque não substitui um teste em iPad real.

### Conferir no Safari do iPad

1. Abra a versão publicada e teste a escolha e a troca dos três níveis, em retrato e paisagem.
2. Habilite **Sons suaves** antes de entrar nos níveis 1 e 2. Confira a palavra falada ao entrar e ao avançar. Toque em **Ouvir de novo**: primeiro a palavra inteira; depois, cada sílaba separada; depois, a palavra inteira novamente. Experimente VACA, COCO e BANANA, confira a pausa entre sílabas e faça toques rápidos para verificar a interrupção da fila. Troque de palavra e confira que o primeiro toque volta à palavra inteira. Verifique também a pronúncia das sílabas em **Ajuda**, principalmente CO, GE e GI. A qualidade da pronúncia depende da voz do sistema.
3. Se não houver voz local em português, confira as vozes de português disponíveis nos ajustes de Acessibilidade do iPad. Enquanto isso, o responsável pode falar o nome da figura. Não é preciso fornecer dados ou credenciais ao jogo.
4. Desligue o som durante uma fala e confirme que ela para. Desligue as animações e confira que a comemoração fica estática.
5. Nos níveis 1 e 2, erre em cada etapa e confirme que nada é preenchido nem apagado. Use Ajuda, complete COCO com dois toques e BANANA/BATATA com três toques. Termine uma rodada e teste **Jogar mais** e **Trocar nível**.

## Publicar

Revise os arquivos antes de enviar alterações ao GitHub. O arquivo `.nojekyll` orienta o GitHub Pages a servir o projeto como um site estático.

O aplicativo público precisa destes **50 arquivos**: `index.html`, `styles.css`, `words.js`, `app.js` e os 46 SVGs em `assets/` (45 figuras e o porquinho). Mantenha também `.nojekyll` no GitHub Pages. Uma hospedagem estática serve esses arquivos; não recebe dados da criança e não precisa de banco, backend, instalação de pacotes ou comando de build.

Uma opção é **GitHub Pages**:

1. Revise as alterações locais. O commit do projeto inclui os quatro arquivos do aplicativo, `assets/`, os quatro arquivos de teste em `tests/`, `.gitignore`, `.nojekyll` e este `README.md`. O push envia esses arquivos para `Tmarfer/jogos-do-bernardo`.
2. Depois da revisão e de autorizar o envio, faça commit e push para a branch escolhida, por exemplo `main`.
3. No GitHub, abra **Settings → Pages → Build and deployment → Deploy from a branch**. Escolha a branch enviada e a pasta **/(root)**, e salve.
4. Use o endereço HTTPS informado pelo GitHub Pages e abra no Safari do iPad. Teste o fluxo completo depois de publicar. A publicação a partir da raiz também pode servir o README e o arquivo de teste; eles não contêm credenciais ou dados pessoais.

Com o Pages já configurado para `main` e `/(root)`, um novo push para `main` atualiza a publicação pelo mesmo fluxo. Não altere a configuração ou a visibilidade do repositório para atualizar o jogo.

Alternativamente, envie apenas os 50 arquivos públicos a uma hospedagem estática, mantendo `assets/` ao lado de `index.html`. Os caminhos são relativos, para funcionar tanto na raiz quanto numa subpasta como `/jogos-do-bernardo/`.
