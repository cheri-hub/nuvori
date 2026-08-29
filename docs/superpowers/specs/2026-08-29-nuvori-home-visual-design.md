# Nuvori Home - Direcao Visual

**Data:** 2026-08-29  
**Status:** Direcao visual aprovada em conversa; aguardando revisao deste arquivo  
**Tela:** Home autenticada, primeira tela do prototipo

## 1. Tese visual

A Home precisa tornar o inicio pequeno e possivel. Ela sera calma e funcional, com um unico momento de fantasia: Muru acompanhado pela linha organica do primeiro passo.

O design nao e uma landing page e nao usa a estetica de academia, aplicativo medico ou produtividade. A pessoa deve chegar a uma acao clara antes de explorar colecao, historico ou social.

## 2. Sistema de tokens

### Cor

- **Musgo profundo** `#12221E`: canvas principal e contraste de fundo.
- **Nevoa** `#F1EEE4`: superficies claras e texto escuro em areas de leitura.
- **Tinta** `#1D2926`: texto principal e icones sobre nevoa.
- **Amber-pollen** `#E6A24A`: CTA primario e trecho ativo da linha.
- **Coral-brasa** `#D66A55`: estados de atencao, adaptacao e pequenos sinais de calor.
- **Mint-sinal** `#8CC6B4`: presenca social, confirmacao e estados positivos.

O canvas nao recebe gradientes nem orbes decorativos. O contraste deve ser testado para texto, foco e controles.

### Tipografia

- **Bricolage Grotesque:** titulos curtos, pergunta de check-in e nome de Muru; usada com parcimonia.
- **Instrument Sans:** corpo, labels e controles; sentence case.
- **IBM Plex Mono:** duracao e dados pontuais, nunca para mensagens acolhedoras.

Escala inicial: titulo de 32/36, pergunta de 24/28, corpo de 16/22, label de 13/16 e duracao de 18/22. Nenhuma escala usa largura de viewport como substituto de responsividade.

## 3. Layout

### Mobile-first

O viewport de referencia e 390 x 844. A tela usa uma coluna com padding lateral de 24 px e quatro zonas verticais:

1. Cabecalho: marca NUVORI e perfil, sem competir com a acao.
2. Presenca: Muru em estado idle sobre a linha do primeiro passo.
3. Inicio: pergunta de check-in, CTA primario e convite social secundario.
4. Navegacao: Home, Missao, Colecao e Perfil; social aparece como contexto, nao como quinta area fixa.

Nao ha hero card, painel de metricas ou barra de streak. O fundo e continuo; apenas controles e feedback de recompensa podem ter superficies delimitadas.

### Desktop e tablet

Em larguras maiores, o conteudo fica limitado a uma coluna central de leitura, com a linha de Muru expandindo horizontalmente como assinatura. O CTA e o convite permanecem no mesmo eixo da pergunta. A navegacao pode migrar para uma barra lateral compacta, sem transformar a Home em dashboard.

## 4. Wireframe de referencia

```text
+-----------------------------+
| NUVORI                 perfil|
|                             |
|        [ Muru ]              |
|      -----+                  |
|           +----               |
|                             |
|        Como esta para        |
|        comecar hoje?         |
|                             |
|     5 minutos parecem        |
|       possiveis hoje?        |
|                             |
|     [ Comecar 5 min ]        |
|                             |
|       Convidar alguem        |
|                             |
|-----------------------------|
| Home  Missao  Colecao  Perfil|
+-----------------------------+
```

## 5. Assinatura: linha do primeiro passo

A linha e uma rota organica curta, nao uma barra de desempenho. Em repouso, permanece incompleta e discreta. Ao iniciar, um segmento se ilumina com amber-pollen; durante a sessao, o progresso da linha e temporal, nao baseado em distancia, calorias ou velocidade. Ao concluir uma sessao valida, ela fecha o trecho atual e conduz visualmente a revelacao da capsula.

Esse e o unico elemento visual de risco. Muru, cor e movimento devem apoia-lo, nao competir com ele.

## 6. Estados de interface

### Repouso

Muru em idle, CTA com a duracao recomendada e convite social como acao secundaria. A Home nao mostra culpa, streak ou comparacao.

### Check-in

Depois do toque em Comecar, uma camada curta pergunta energia e resistencia; humor e opcional. A duracao recomendada pode ser aceita sem preencher cada campo.

### Convite social

Link/codigo, acao de compartilhar e estado de espera. Ao entrar, o participante aparece por nome/avatar publico. Nenhum dado emocional e exibido.

### Sessao ativa

Navegacao oculta, timer central, Muru caminhando e linha com segmento ativo. Apenas o anfitriao ve pausar, retomar e encerrar.

### Sessao adaptada

Acao **Hoje esta dificil** encerra a sessao como valida. A confirmacao deve reconhecer o inicio, sem linguagem de perda ou desempenho reduzido.

### Capsula

Um unico momento de luz e movimento completa a linha e revela a recompensa garantida. Nao usar confete, chuva de particulas ou gamificacao barulhenta.

### Retorno

Muru permanece no mesmo estagio. A mensagem reforca continuidade, como "Seu progresso continua aqui", sem mencionar sequencia perdida.

## 7. Escrita de interface

Usar verbos que descrevem a acao real: **Comecar 5 min**, **Convidar alguem**, **Pausar**, **Retomar**, **Hoje esta dificil**. Manter o mesmo nome em botao, confirmacao e estado final.

Erros devem explicar o que aconteceu e oferecer o proximo passo. Estados vazios devem convidar a primeira acao. O tom e curto, tranquilo, acolhedor e nao infantil.

## 8. Movimento e acessibilidade

- A linha e o unico movimento persistente; Muru pode ter idle e caminhada leves.
- `prefers-reduced-motion` troca transicoes por mudancas de estado sem deslocamento.
- Todo controle tem foco de teclado visivel e alvo de toque adequado.
- Texto deve caber sem sobreposicao em 320 px, 390 px e desktop.
- O contraste e revisado para texto, CTA, estados de foco e sinais sociais.

## 9. Criterios de aceite visual

- A pessoa identifica a acao primaria em menos de um olhar.
- O convite social e encontravel sem competir com Comecar.
- Muru aparece como primeiro sinal de produto, nao como decoracao escondida.
- A linha do primeiro passo e reconhecivel em repouso, sessao e recompensa.
- A Home continua legivel e calma em mobile, tablet e desktop.
- Nao ha decoracao que pareca um template generico ou uma interface de fitness.
