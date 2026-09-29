---
title: "Botão de email que funciona no Outlook: o guia do VML"
description: "Por que o botão do seu email quebra no Outlook para Windows e como montar um botão à prova de falhas com VML, sem perder o visual no Gmail e no Apple Mail."
date: 2026-09-29
category: email-html
cover: ../../assets/covers/botao-email-outlook-vml.webp
coverAlt: "O mesmo email aberto no Gmail, com o botão preto, e no Outlook, com o botão virado um link azul, ao lado do código VML que resolve"
tags: ["Email HTML", "CRM", "Outlook"]
image: "/blog/og/botao-email-outlook-vml.jpg"
imageAlt: "Botão de email que funciona no Outlook: o guia do VML"
---

Todo mundo que produz email marketing já passou por isso: a campanha fica perfeita no Gmail, no Apple Mail e no celular. Aí alguém abre no Outlook do computador e o botão virou um link sublinhado, sem cor, sem borda arredondada e com o espaçamento todo errado.

Não é erro no seu código. É o Outlook.

## Por que o Outlook quebra o botão

As versões clássicas do Outlook para Windows (do 2007 ao 2019 e o Outlook do Microsoft 365 instalado no computador) não usam um navegador para mostrar o email. Elas usam o **motor de renderização do Microsoft Word**. E o Word entende só uma parte do HTML e do CSS:

- ignora `padding` em links, então a área do botão some;
- ignora `border-radius`, e os cantos ficam retos;
- não aplica `background-image` pelo CSS;
- trata `display: inline-block` de forma imprevisível.

O que o Word entende bem é **VML** (Vector Markup Language), um formato antigo da Microsoft para desenhar formas. A saída é usar VML só para o Outlook e HTML normal para todo o resto.

## O botão "à prova de balas"

A técnica é conhecida como *bulletproof button*. O mesmo botão é escrito duas vezes: uma em VML, dentro de um comentário condicional que só o Outlook lê, e outra em HTML, escondida do Outlook.

```html
<!--[if mso]>
  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:w="urn:schemas-microsoft-com:office:word"
    href="https://seusite.com.br/promocao"
    style="height:48px;v-text-anchor:middle;width:220px;"
    arcsize="17%" stroke="f" fillcolor="#111110">
    <w:anchorlock/>
    <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">
      Quero participar
    </center>
  </v:roundrect>
<![endif]-->
<!--[if !mso]><!-->
  <a href="https://seusite.com.br/promocao"
    style="background-color:#111110;border-radius:8px;color:#ffffff;display:inline-block;
    font-family:Arial,sans-serif;font-size:15px;font-weight:bold;line-height:48px;
    text-align:center;text-decoration:none;width:220px;-webkit-text-size-adjust:none;">
    Quero participar
  </a>
<!--<![endif]-->
```

## O que cada parte faz

- **`<!--[if mso]>`** — tudo aqui dentro só aparece no Outlook (`mso` quer dizer Microsoft Office). Os outros programas enxergam um comentário e ignoram.
- **`v:roundrect`** — desenha um retângulo com cantos arredondados, que é o fundo do botão. O `href` fica no próprio retângulo, então o botão inteiro é clicável.
- **`arcsize`** — é o arredondamento, em porcentagem da altura. Para cantos de 8px num botão de 48px: 8 ÷ 48 ≈ **17%**.
- **`stroke="f"`** — tira a borda que o VML desenha por padrão.
- **`fillcolor`** — a cor de fundo. Use exatamente a mesma cor da versão HTML.
- **`v-text-anchor:middle`** — centraliza o texto na vertical.
- **`<w:anchorlock/>`** — impede que o texto seja editado e mantém o clique no botão todo.
- **`<!--[if !mso]><!-->`** — o contrário: esconde o link HTML do Outlook e mostra para todos os outros.

## Dois detalhes que evitam dor de cabeça

**1. Declare o VML no começo do email.** Na tag `<html>`, inclua os namespaces:

```html
<html xmlns="http://www.w3.org/1999/xhtml"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:o="urn:schemas-microsoft-com:office:office">
```

E, dentro do `<head>`, este bloco evita que o Outlook distorça tamanhos em telas com zoom de 120% ou mais:

```html
<!--[if mso]>
<xml>
  <o:OfficeDocumentSettings>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>
<![endif]-->
```

**2. O VML não cresce com o texto.** Largura e altura são fixas. Se o texto do botão for longo, ele quebra em duas linhas e estoura o desenho. Escolha a largura com folga e mantenha o texto curto, algo como "Quero participar" em vez de "Clique aqui para participar da nossa promoção".

## E o Outlook novo?

O **novo Outlook para Windows**, o Outlook na web e o Outlook para Mac usam um navegador por baixo dos panos, então mostram a versão HTML normalmente. O VML continua necessário porque uma parte grande das empresas ainda usa o Outlook clássico no computador. E, em campanha de CRM, esse público costuma ser justamente o corporativo.

## Checklist antes de enviar

- [ ] As duas versões do botão têm **o mesmo link**, a mesma cor e o mesmo texto.
- [ ] O `arcsize` corresponde ao `border-radius` da versão HTML.
- [ ] O texto cabe na largura definida, com folga.
- [ ] O email foi testado no Outlook clássico, não só no Gmail. Ferramentas como Litmus e Email on Acid mostram dezenas de programas de uma vez.
- [ ] O link tem os parâmetros de rastreamento (UTM) nas duas versões.

## Sem montar isso na mão

No dia a dia de CRM, escrever esse bloco para cada botão de cada campanha é repetitivo e fácil de errar. Foi um dos motivos para eu criar o [Email Generator](https://emailgenerator.com.br/): ele monta o email com o botão em VML e HTML já sincronizados, com prévia e o código pronto para colar na plataforma de envio. Você pode ver [como ele foi pensado aqui](/projetos/sites/email-generator/).
