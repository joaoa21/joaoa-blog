---
title: "WebP, PNG ou JPG: qual formato usar em cada imagem do site"
description: "Quando cada formato vale a pena, como reduzir o peso sem perder qualidade e por que o email é a exceção à regra do WebP."
date: 2026-09-29
category: web
tags: ["Imagens", "Performance", "Web"]
cover: ../../assets/covers/webp-png-ou-jpg.webp
coverAlt: "A mesma imagem em três formatos: PNG com 1,4 MB, JPG com 312 KB e WebP com 196 KB, destacado como o mais leve"
draft: true
---

A imagem é quase sempre o arquivo mais pesado de uma página. Um banner exportado no formato errado pode pesar mais que todo o resto do site junto, e isso aparece direto no tempo de carregamento, na nota do PageSpeed e na paciência de quem abre pelo celular.

A boa notícia é que a escolha é simples quando você entende o que cada formato faz de melhor.

## Os três formatos em uma frase

- **JPG** é feito para **fotografia**. Comprime muito bem imagens com muitas cores e degradês, mas não tem transparência e perde qualidade a cada compressão.
- **PNG** é feito para **gráficos com cor chapada**: ícones, logos, prints de tela, ilustrações com contorno. Aceita transparência e não perde qualidade, mas fica pesado em fotos.
- **WebP** faz **as duas coisas**: tem compressão com e sem perda, aceita transparência e costuma ficar bem mais leve que JPG e PNG com a mesma aparência.

## Então é só usar WebP em tudo?

Em sites, quase sempre sim. Todos os navegadores atuais leem WebP, e a economia é real: na mesma qualidade visual, um WebP costuma ficar na faixa de 25% a 35% menor que o JPG equivalente, e bem menor que um PNG de foto.

Na prática, meu padrão para sites é:

- **Fotos e banners:** WebP com qualidade entre 75% e 85%.
- **Imagens com transparência:** WebP em vez de PNG.
- **Ícones e logos:** SVG sempre que possível. É vetor, fica nítido em qualquer tela e pesa quase nada.
- **PNG** só quando o arquivo precisa ser editado depois ou quando vai para um lugar que não aceita WebP.

## A exceção: email marketing

Aqui a regra muda. O **Outlook para Windows** não mostra WebP (ele usa o motor do Word, como expliquei no post sobre [botões de email no Outlook](/blog/botao-email-outlook-vml/)), e outros programas de email também têm suporte irregular.

Em email, use **JPG para fotos e PNG para imagens com transparência ou texto**. E capriche na compressão, porque o email também é aberto no celular, muitas vezes no 4G.

## O peso também depende do tamanho

Trocar o formato resolve metade do problema. A outra metade é a **dimensão**: não adianta um WebP lindo com 4000 px de largura se ele aparece numa área de 800 px.

A regra que eu sigo:

1. Descubra a largura em que a imagem aparece na tela (ex.: 800 px).
2. Exporte com **o dobro dessa largura** (1600 px), para ficar nítida em telas retina.
3. Só então comprima.

Uma referência de peso para começar: banner principal abaixo de 200 KB, imagens de conteúdo abaixo de 100 KB e miniaturas abaixo de 30 KB.

## Qualidade: onde está o ponto certo

Na compressão com perda (JPG e WebP), a qualidade não precisa ser 100%. Entre **75% e 85%** a diferença para o olho é mínima, e o arquivo cai pela metade ou mais. Abaixo de 70%, começam a aparecer borrões nas bordas e faixas nos degradês.

Para PNG, o truque é outro: reduzir a quantidade de cores. Um PNG com 256 cores em vez de milhões costuma ficar muito menor, desde que a imagem não tenha degradês suaves.

## Checklist antes de publicar uma imagem

- [ ] Fotos e banners em WebP no site; JPG no email.
- [ ] Largura exportada com o dobro do espaço em que a imagem aparece.
- [ ] Qualidade entre 75% e 85%.
- [ ] Peso dentro da meta (banner abaixo de 200 KB).
- [ ] Ícones e logos em SVG sempre que possível.

## Fazendo isso sem abrir o Photoshop

Converter e comprimir imagem por imagem cansa rápido, principalmente quando são dezenas de banners por semana. Foi por isso que criei o [Kompres](https://kompres.com.br/): ele converte e comprime imagens em lote para WebP, PNG ou JPG, deixa escolher a qualidade ou um tamanho máximo em KB e baixa tudo em ZIP, com o processamento feito no próprio navegador. Você pode ver [como ele foi pensado aqui](/projetos/sites/kompres/).
