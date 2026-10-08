# Vídeos do JC Jurídico

Referência para os próximos vídeos promocionais (vertical 9:16, 1080x1920, 30 fps, sem narração e com música de fundo).

## Conteúdo

- `videos/jc-juridico-promo-v2.mp4`: versão atual, com 62 s.
  - Ordem das cenas: abertura → marca → cálculos → AdvogAI → clientes → agenda → financeiro → Funil Jurídico → biblioteca → marketplace → resumo → chamada.
- `videos/jc-juridico-promo-v1.mp4`: primeira versão, com 43 s. Foi descartada porque as telas apareciam cortadas.
- `stills/`: quadros de revisão da v2.
- `projeto/`: projeto Remotion completo, com código e telas capturadas.

## Como renderizar

```bash
cd projeto
npm install
# baixe a música (ver abaixo) para public/music/480.mp3
npx remotion studio                       # pré-visualização
npx remotion render JCPromo out/promo.mp4 --codec=h264 --crf=18
```

## Música

A trilha usada é "Motivating Mornings" (Mixkit, faixa 480), com a Mixkit Stock Music Free License: uso comercial liberado e sem atribuição. O arquivo não fica no repositório porque a licença não permite redistribuir a faixa sozinha.

- Download: https://mixkit.co/free-stock-music/ (busque a faixa pelo nome).
- Também foram testadas as faixas 471 Digital Clouds, 440 Uplifting Bass, 180 Talent in the Air e 834 Curiosity.

## Estrutura do código

- `src/theme.ts`: paleta JC (navy, bordô, ice) e fonte Montserrat.
- `src/JCPromo.tsx`: lista `SCENES`, com a ordem, a duração e a transição de cada cena. Para mudar o vídeo, edite essa lista.
- `src/components/Showcase.tsx`:
  - `Showcase`: mostra a tela inteira do sistema, destaca uma área por vez e exibe essa área ampliada abaixo, com legenda.
  - `ScrollScreen`: janela alta que rola a tela de cima a baixo.
- `src/components/Headline.tsx`: título com `**destaque**` em bordô, mais `Kicker` e `SubText`.
- `src/scenes/Telas.tsx`: cenas de Cálculos, Financeiro, Funil Jurídico e AdvogAI.
  - O chat da AdvogAI é recriado em código a partir de uma pergunta real feita no sistema.

## Como capturar as telas (aprendizados)

- Use sempre telas inteiras. Recortar demais no vídeo vertical corta gráficos e descrições, e foi esse o problema da v1. Mostre a tela completa e amplie os detalhes com o `Showcase`.
- No sistema, a página rola dentro do `<main>`. Para capturar telas longas:
  1. Ajuste `main.scrollTop`.
  2. Tire um print a cada posição.
  3. Junte os prints com PIL, descontando o cabeçalho fixo (cerca de 59 px no print).
- Antes de capturar:
  - Esconda o avatar flutuante da AdvogAI: no elemento fixo que contém `[aria-label*=AdvogAI]`, use `visibility: hidden`.
  - Tire o mouse de cima do conteúdo.
- Na tela de cálculo, o Relatório Técnico é fixo (sticky). Use um print em que o relatório inteiro aparece, em vez de juntar vários.
- Cada geração no Funil Jurídico gasta 1 dos 2 usos semanais.
- Conta de demonstração: dados fictícios (clientes, agenda e financeiro).
