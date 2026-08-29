# NUVORI — Documento de Design do Produto
**Versão:** MVP 0.1  
**Conceito:** leve por fora, científico por dentro.

## 1. Visão

Nuvori é uma plataforma gamificada voltada inicialmente para pessoas com baixa motivação, esgotamento ou grande dificuldade de iniciar atividade física.

A proposta não é ensinar o usuário a treinar mais, competir ou atingir alta performance.

A proposta central é:

**Ajudar a pessoa a começar.**

Mensagem principal:

**Começar já conta.**

Tagline provisória:

**Pequenos passos. Grandes jornadas.**

---

# 2. Problema

Muitas pessoas sabem que deveriam se movimentar, cuidar da saúde e criar hábitos, mas encontram uma barreira muito grande entre:

**“Eu sei que deveria fazer.”**

e

**“Eu consegui começar.”**

Benefícios futuros como saúde, condicionamento ou perda de peso frequentemente são recompensas distantes.

Nuvori procura trazer parte da recompensa para o presente.

---

# 3. Público inicial

Pessoas que:

- estão com pouca energia;
- sentem grande resistência para iniciar exercícios;
- possuem rotina profissional desgastante;
- não sentem grande recompensa espontânea após exercícios;
- abandonam aplicativos tradicionais de fitness;
- respondem melhor a entretenimento, jogos ou interação social;
- querem se movimentar, mas têm dificuldade para transformar intenção em ação.

O aplicativo não será apresentado como tratamento médico ou psicológico.

---

# 4. Princípio central

O usuário não precisa esperar o exercício se tornar prazeroso sozinho.

Nuvori cria três camadas de recompensa:

### Recompensa durante
Algo agradável acompanha a atividade.

Exemplos:

- música;
- podcast;
- audiobook;
- vídeo;
- conversa com amigos.

### Componente social
O usuário pode realizar a atividade acompanhado física ou virtualmente.

### Recompensa imediatamente após
Ao concluir a sessão, recebe imediatamente uma recompensa dentro do universo do jogo.

---

# 5. Game Loop

Fluxo principal:

**Check-in**

↓

**Microatividade**

↓

**Recompensa durante**

↓

**Sessão**

↓

**Conclusão**

↓

**Cápsula**

↓

**Criatura / item / progresso**

↓

**Feedback rápido**

↓

**Aprendizado pessoal**

↓

**Nova sessão futura**

O jogo deve diminuir a resistência necessária para iniciar a atividade seguinte.

---

# 6. Check-in

Antes da sessão, o usuário informa rapidamente:

### Energia
- baixa;
- média;
- boa.

### Resistência para começar
Escala simples.

### Humor
Registro opcional e leve.

O sistema usa essas informações juntamente com o histórico para sugerir uma duração.

---

# 7. Sessões

Inicialmente, a principal atividade será:

**Caminhada livre**

Pode ser realizada:

- na rua;
- em esteira;
- dentro de casa;
- enquanto conversa com alguém.

Durações:

- 5 minutos;
- 10 minutos;
- 15 minutos;
- 20 minutos.

Não existe exigência de velocidade, distância ou calorias.

---

# 8. Modo mínimo

Dias difíceis precisam fazer parte do sistema.

Se o usuário estiver com muita resistência:

**5 minutos já contam.**

Uma sessão curta recebe recompensa normalmente.

O produto não deve comunicar:

“Hoje você fez menos.”

Ele comunica:

**“Hoje você conseguiu começar.”**

---

# 9. Sessão adaptada

Caso o usuário escolha 15 minutos mas perceba que não conseguirá continuar, poderá selecionar:

**Hoje está difícil**

O usuário poderá encerrar antecipadamente.

A sessão será registrada como:

**Sessão adaptada**

e continuará válida.

O objetivo é evitar que adaptação seja interpretada como fracasso.

---

# 10. Recompensa acoplada

Antes de iniciar:

**O que deixaria isso mais agradável hoje?**

Opções:

- ouvir algo;
- conversar com alguém;
- assistir algo;
- caminhar sozinho.

O aplicativo poderá futuramente aprender quais combinações aumentam a adesão individual.

---

# 11. Universo do jogo

Nuvori possui criaturas colecionáveis.

A estética segue:

**fantasia suave → evolução visual épica.**

As criaturas começam adoráveis e acessíveis e podem evoluir para formas marcantes e visualmente impressionantes.

Não haverá combate no MVP.

A experiência será baseada em:

- descoberta;
- coleção;
- vínculo;
- evolução;
- personalização.

---

# 12. Famílias iniciais

Seis famílias:

### Floresta
Constância e crescimento.

### Oceano
Adaptação e recuperação.

### Céu
Curiosidade e exploração.

### Crepúsculo
Introspecção e persistência em dias difíceis.

### Cristal
Clareza e estabilidade.

### Brasa
Energia que retorna gradualmente.

---

# 13. Primeiras criaturas

### Floresta
Lumi → Lumira → Lumera  
Brami → Bramur → Bravorn

### Oceano
Nubi → Nubira → Nubilume  
Coru → Coralis → Coralith

### Céu
Piko → Pikori → Pikorael  
Aeri → Aeriel → Aerynth

### Crepúsculo
Muru → Muruk → Murakhan  
Nyxli → Nyxara → Nyxareth

### Cristal
Kiri → Kirion → Kiralith  
Veya → Veyra → Veylora

### Brasa
Firi → Firun → Firavor  
Ashu → Ashkar → Ashvaren

Muru será inicialmente o principal candidato a mascote da marca.

---

# 14. Evolução

Cada criatura possui três estágios:

**Inicial → Evoluída → Ascendida**

A evolução não depende de quilômetros ou calorias.

Ela depende principalmente de:

- sessões concluídas;
- vínculo com a criatura;
- variedade de experiências;
- atividades sociais;
- retorno em dias de baixa energia.

Exemplo:

Muru → Muruk

Requisitos possíveis:

- 8 sessões;
- 1 sessão social;
- 1 sessão realizada em dia de baixa energia.

---

# 15. Evoluções alternativas

Futuramente uma mesma criatura poderá possuir caminhos diferentes.

Exemplo:

uma evolução relacionada a experiências sociais;

outra relacionada a jornadas individuais.

Nenhuma evolução será considerada superior.

A criatura passa a refletir parcialmente o estilo de jornada do usuário.

---

# 16. Cápsulas

Toda sessão válida concede uma recompensa.

Princípio:

**A recompensa é garantida. O conteúdo é variável.**

Nunca:

“Talvez você ganhe alguma coisa.”

Sempre:

“Você ganhou uma cápsula. Vamos descobrir o que existe nela.”

---

# 17. Tipos iniciais de cápsula

### Cápsula de Jornada
Recebida por sessões comuns.

### Cápsula de Companhia
Obtida por atividades sociais.

Pode existir limite diário para evitar exploração artificial.

### Cápsula de Descoberta
Obtida por experimentar comportamentos novos.

---

# 18. Raridades

Cinco níveis:

- Comum;
- Incomum;
- Raro;
- Épico;
- Lendário.

Raridade significa principalmente:

**frequência de descoberta.**

Não:

**qualidade da criatura.**

Uma criatura comum poderá ser tão desejável quanto uma lendária.

---

# 19. Probabilidades iniciais experimentais

Valores provisórios:

Comum — 55%  
Incomum — 27%  
Raro — 12%  
Épico — 5%  
Lendário — 1%

Esses valores deverão ser balanceados durante testes.

---

# 20. Proteção contra azar

O sistema utilizará um mecanismo de proteção progressiva.

Quanto mais tempo o usuário permanece sem determinada raridade, maior poderá se tornar a chance.

Poderá existir garantia após determinado número de cápsulas.

O objetivo é reduzir frustração extrema.

---

# 21. Duplicatas

Duplicatas nunca serão inúteis.

Uma criatura repetida poderá gerar:

**Essência**

Essência poderá ser utilizada para:

- skins;
- evolução;
- animações;
- customizações.

---

# 22. Skins

Skins são cosméticas.

Exemplos:

- noturna;
- chuva;
- festival;
- cósmica;
- floresta antiga;
- neon;
- sazonal.

Não alteram chance, capacidade ou progressão física.

---

# 23. Componente social

Inicialmente:

- adicionar amigos;
- convidar amigo para sessão;
- iniciar timers sincronizados;
- receber recompensa social.

Chamadas de áudio não serão construídas inicialmente.

Usuários poderão utilizar:

- Discord;
- WhatsApp;
- ligação;
- outras ferramentas externas.

Isso reduz significativamente a complexidade do MVP.

---

# 24. Privacidade social

Amigos poderão visualizar informações como:

“Quer caminhar 10 minutos?”

ou

“Concluiu uma sessão.”

Não terão acesso automaticamente a:

- humor;
- resistência;
- energia;
- histórico emocional;
- insights pessoais.

---

# 25. Retorno após ausência

Nuvori não utilizará streak punitiva.

Nunca:

“Você perdeu sua sequência de 32 dias.”

Ao retornar:

**“Que bom ver você novamente.”**

O progresso continua salvo.

Nenhuma criatura perde nível.

Nenhuma coleção desaparece.

---

# 26. Linguagem

A comunicação deve ser:

- curta;
- tranquila;
- acolhedora;
- não infantil;
- não clínica;
- sem linguagem agressiva de academia.

Evitar:

“Sem desculpas.”

“Supere seus limites.”

“Você falhou.”

“Não desista agora.”

Preferir:

“5 minutos parecem possíveis hoje?”

“Você começou.”

“Seu progresso continua aqui.”

“Hoje foi um dia difícil. Ainda assim você apareceu.”

---

# 27. Identidade

Nome provisório:

**NUVORI**

Mascote inicial:

**Muru**

Conceito visual:

- fantasia;
- natureza;
- crepúsculo;
- elementos luminosos;
- formas orgânicas;
- interface acolhedora.

Evitar estética clássica de:

- academia;
- aplicativo médico;
- produtividade empresarial.

---

# 28. Filosofia

Regra principal de UX:

**Nunca aumentar culpa para aumentar comportamento.**

A plataforma deve trabalhar com baixa energia, não contra ela.

---

# 29. Aprendizado comportamental

Cada sessão poderá registrar:

- energia antes;
- resistência antes;
- duração planejada;
- duração realizada;
- recompensa durante;
- sessão individual/social;
- horário;
- dia;
- prazer durante;
- estado após.

Inicialmente os insights serão estatísticos, sem IA.

Exemplo:

“Você conclui mais sessões quando conversa com alguém.”

“10 minutos parece funcionar melhor para você atualmente.”

---

# 30. Métrica central

A principal métrica não será:

- calorias;
- quilômetros;
- passos;
- peso.

Será:

## Taxa de ativação

Quantas vezes uma intenção de atividade realmente se transforma em início.

Também serão monitorados:

- início;
- conclusão;
- sessões adaptadas;
- retorno;
- retenção;
- comportamento social.

---

# 31. Monetização

Modelo aprovado:

**Free robusto + Passe de Temporada**

O jogo principal continuará disponível gratuitamente.

---

# 32. Free

Inclui:

- check-in;
- sessões;
- criaturas;
- cápsulas;
- coleção;
- evolução;
- amigos;
- social;
- insights básicos;
- eventos;
- progressão normal.

---

# 33. Passe de Temporada

Cada temporada poderá durar aproximadamente 6–8 semanas.

Terá:

### Trilha gratuita
Recompensas cosméticas básicas.

### Trilha premium
Mais:

- skins;
- cenários;
- animações;
- acessórios;
- personalizações.

Progressão baseada em participação.

Não em intensidade física.

---

# 34. O que nunca será vendido

Não vender:

- cápsulas aleatórias;
- probabilidades melhores;
- energia;
- evolução acelerada;
- chance de lendário;
- multiplicadores de exercício;
- recuperação de streak.

Dinheiro compra principalmente:

**expressão visual.**

Não vantagem comportamental.

---

# 35. Arquitetura

### Aplicativo
React Native + Expo.

### Backend próprio
Node.js + TypeScript na VPS.

### VPS disponível
2 vCPU  
4 GB RAM

### Supabase
Inicialmente:

- PostgreSQL;
- Auth;
- Storage;
- Realtime.

---

# 36. Responsabilidades da VPS

- API;
- motor de cápsulas;
- pity system;
- evolução;
- temporadas;
- regras comportamentais;
- analytics;
- painel administrativo;
- tarefas agendadas.

---

# 37. Segurança

Toda lógica econômica sensível deve acontecer no servidor.

Exemplo:

**App solicita conclusão**

↓

**Servidor valida**

↓

**Servidor calcula recompensa**

↓

**Banco registra**

↓

**Aplicativo recebe resultado**

↓

**Animação é apresentada**

O aplicativo nunca decide sozinho qual recompensa foi obtida.

---

# 38. Funcionamento offline

O timer deve funcionar sem conexão.

Sessões offline ficam:

**aguardando sincronização**

Quando a conexão retornar:

- sessão é enviada;
- servidor valida;
- recompensa é liberada.

---

# 39. Assets

Inicialmente:

- arte 2D;
- PNG/WebP;
- animações leves.

Não utilizar modelos 3D no MVP.

Criaturas podem possuir estados como:

- idle;
- sono;
- caminhada;
- felicidade;
- reação à cápsula.

---

# 40. Estrutura principal do aplicativo

Cinco áreas principais:

### Home
Check-in e início.

### Missão
Configuração da sessão.

### Sessão
Timer e criatura acompanhante.

### Coleção
Criaturas, evolução e skins.

### Perfil
Histórico e informações básicas.

---

# 41. Protótipo

Primeira versão extremamente pequena.

Inclui:

- check-in;
- sessão;
- timer;
- Muru;
- cápsula;
- poucas recompensas;
- registro antes/durante/depois.

Objetivo:

**Testar se o loop é divertido o suficiente para gerar retorno.**

---

# 42. Alpha

Adicionar:

- autenticação;
- backend real;
- banco;
- 12 criaturas;
- raridades;
- essências;
- evolução;
- coleção;
- pity;
- analytics.

Teste inicial:

aproximadamente 20–50 pessoas.

---

# 43. Beta

Adicionar:

- amigos;
- sessões sincronizadas;
- cápsula social;
- notificações;
- painel administrativo;
- retorno após ausência.

Objetivo:

**Testar se o social aumenta adesão e retenção.**

---

# 44. MVP público

Adicionar:

- primeira temporada;
- passe gratuito;
- passe premium;
- cosméticos;
- pagamento;
- publicação.

Primeira plataforma prioritária:

**Android**

Mantendo arquitetura compatível com iOS.

---

# 45. Primeira temporada — conceito provisório

**Vale das Estrelas**

Duração:

6–8 semanas.

Pode incluir:

- skins;
- acessórios;
- cenários;
- efeitos;
- pequena narrativa;
- conteúdo cosmético temático.

---

# 46. Hipótese principal do produto

A hipótese que precisa ser validada antes de grandes investimentos é:

**Pessoas com dificuldade de iniciar atividade física retornam com maior frequência quando sessões pequenas são associadas a prazer durante a atividade, vínculo social e recompensa lúdica imediatamente após.**

---

# 47. Pergunta decisiva

Não é:

“Quantos downloads conseguimos?”

Nem:

“Quantos quilômetros as pessoas caminharam?”

É:

## “A pessoa voltou porque queria continuar sua jornada?”

Se a resposta for sim, Nuvori encontrou seu núcleo.