---
title: "Por que seu site está lento: as 5 causas mais comuns"
description: "Imagens, fontes, scripts, ícones e animações: o que mais pesa num site, como descobrir o culpado e o que eu mudei no meu para subir a nota do PageSpeed."
date: 2026-10-13
category: web
tags: ["Performance","PageSpeed","Web"]
cover: ../../assets/covers/site-lento-5-causas.webp
coverAlt: "Painel de desempenho com a nota do celular subindo de 67 para 89 e uma lista com as cinco causas: imagens, fontes, scripts, ícones e animações"
---

Site lento custa caro e quase ninguém percebe de onde vem o prejuízo. A pessoa clica no anúncio, a página fica branca por alguns segundos e ela volta para o Google antes de ver qualquer coisa. Não aparece reclamação, não aparece erro: aparece só um visitante a menos.

A boa notícia é que, na maioria dos sites que eu analiso, a lentidão vem quase sempre dos mesmos cinco lugares. E dá para resolver boa parte sem refazer o site.

## Primeiro: meça do jeito certo

Antes de mexer em qualquer coisa, abra o [PageSpeed Insights](https://pagespeed.web.dev/), cole o endereço e olhe a aba **celular**. Ela simula um aparelho intermediário numa conexão mais lenta, e é ali que os problemas aparecem. A nota do computador quase sempre é alta e engana.

Três números importam mais que a nota geral:

- **LCP (maior elemento visível):** quanto tempo até aparecer o conteúdo principal, normalmente o título ou a imagem do topo. A meta é ficar abaixo de 2,5 segundos.
- **CLS (estabilidade):** o quanto a página "pula" enquanto carrega. A meta é ficar abaixo de 0,1.
- **INP (resposta ao toque):** quanto tempo a página demora para reagir a um clique. A meta é ficar abaixo de 200 ms.

Logo abaixo, a seção **Diagnóstico** lista o que está atrasando a página. Quase sempre o culpado está numa destas cinco categorias.

## 1. Imagens grandes demais

É a causa número um, de longe. O padrão é sempre o mesmo: uma foto de 4000 px exportada direto da câmera ou do banco de imagens, em JPG ou PNG, aparecendo numa área de 600 px da tela.

O que resolver:

- **Exporte no tamanho em que a imagem aparece**, com o dobro da largura para telas retina. Se ela ocupa 600 px, exporte com 1200 px.
- **Use WebP.** Na mesma qualidade, fica bem mais leve que JPG e PNG. Expliquei os detalhes no post sobre [WebP, PNG ou JPG](/blog/webp-png-ou-jpg/).
- **Carregue depois o que está fora da tela** com `loading="lazy"` nas imagens que só aparecem com a rolagem. A imagem do topo, ao contrário, não deve ter lazy: ela precisa chegar primeiro.
- **Informe largura e altura** (`width` e `height`) em todas as imagens. Assim o navegador reserva o espaço e a página não pula quando elas carregam, o que melhora o CLS.

No meu site, só trocar as miniaturas da home por versões no tamanho em que elas aparecem tirou cerca de **330 KB** da página.

## 2. Fontes demais (e de fora)

Cada peso de fonte é um arquivo. Regular, médio, negrito e itálico de duas famílias já são oito downloads antes de o texto aparecer do jeito certo.

O que resolver:

- **Use só os pesos que o layout realmente usa.** Normalmente dois ou três bastam.
- **Hospede as fontes no próprio site**, em WOFF2, em vez de puxar de um serviço externo. É uma conexão a menos para abrir.
- **Use `font-display: swap`**, para o texto aparecer na hora com uma fonte do sistema e trocar quando a fonte certa chegar, em vez de ficar invisível.
- **Pré-carregue só a fonte do título principal**, que costuma ser o LCP. Pré-carregar tudo tem o efeito contrário: congestiona o começo do carregamento.

## 3. Scripts que travam a página

Chat, pixel de anúncio, mapa de calor, widget de avaliação, biblioteca de animação, plugin de formulário. Cada um parece leve sozinho, mas juntos seguram a página: enquanto o navegador baixa e executa JavaScript, ele não desenha a tela nem responde ao toque.

O que resolver:

- **Corte o que ninguém usa.** É comum encontrar pixel de campanha que acabou há um ano, ou dois plugins fazendo a mesma coisa.
- **Use `defer`** nos scripts, para eles rodarem depois que o HTML já foi lido.
- **Deixe o pesado para depois do carregamento.** No meu site, a animação 3D do fundo da home só começa a carregar depois que a página inteira já apareceu, em vez de disputar espaço com a abertura.
- **Quebre tarefas longas.** Montar todas as animações da página de uma vez trava o celular por alguns décimos de segundo. Montar uma seção de cada vez resolve.

## 4. Fonte de ícones inteira para usar dez ícones

Esse é o mais traiçoeiro, porque parece inofensivo. Bibliotecas como o Font Awesome carregam milhares de ícones em arquivos de fonte que somam centenas de KB, e o site usa quinze.

No meu, eram **19 ícones** puxando cerca de **300 KB** de fontes. Troquei por SVG: cada ícone virou um desenho pequeno dentro do próprio CSS, com a mesma aparência, e os 300 KB sumiram.

O que resolver:

- **Use SVG** para ícones, de preferência só os que a página usa.
- Se não der para trocar agora, **carregue a fonte de ícones sem bloquear a página**, para ela não atrasar o primeiro desenho da tela.

## 5. Animações que escondem o conteúdo

Animação de entrada é ótima para a experiência, mas pode derrubar a nota. O problema acontece quando o título começa invisível e só aparece depois que uma biblioteca de JavaScript carrega e roda a animação. Para o PageSpeed, o conteúdo principal só existiu naquele momento, e o LCP vai lá para cima.

O que resolver:

- **Faça a entrada principal em CSS**, que roda desde o primeiro quadro, sem esperar nenhum script.
- **Não comece o conteúdo do topo totalmente invisível.** Uma entrada que desliza ou parte de uma opacidade baixa já resolve, sem esconder o título do navegador.
- **Respeite quem desativou animações** no sistema (`prefers-reduced-motion`): para essas pessoas, mostre tudo direto.

## O que isso deu no meu site

Fiz tudo isso no [joaoa.com.br](/) sem tirar nenhuma animação nem mudar o visual. A nota do PageSpeed no celular subiu de **67 para a faixa de 80 a 89** (ela varia um pouco a cada teste), e no computador chegou a **100**.

Nenhuma dessas mudanças foi grande sozinha. O ganho veio da soma: imagens no tamanho certo, ícones em SVG, scripts para depois e entrada em CSS.

## Checklist rápido

- [ ] Teste no PageSpeed na aba **celular**, não só no computador.
- [ ] Imagens em WebP, exportadas com o dobro da largura em que aparecem.
- [ ] `loading="lazy"` nas imagens abaixo da dobra, nunca na do topo.
- [ ] `width` e `height` em todas as imagens.
- [ ] No máximo dois ou três pesos de fonte, hospedados no próprio site.
- [ ] Scripts com `defer` e os que ninguém usa removidos.
- [ ] Ícones em SVG em vez de fonte de ícones.
- [ ] Entrada da página em CSS, sem esconder o título até o JavaScript carregar.

## Quer ajuda com o seu?

Se o seu site está lento e você não sabe por onde começar, eu posso analisar e dizer o que está pesando. E se for o caso de um site novo, ele já nasce assim: rápido no celular desde o começo. Veja alguns dos [sites que eu fiz](/projetos/sites/) e [me chame para conversar](/#contato).

Para as imagens, o [Kompres](https://kompres.com.br/) converte e comprime em lote para WebP direto no navegador, sem instalar nada.
