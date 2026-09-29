---
title: "Email no modo escuro: como evitar que sua campanha quebre"
description: "Logo que some, texto ilegível, botão que muda de cor: por que o modo escuro mexe no seu email e o que fazer para ele ficar bom nos dois temas."
date: 2026-09-29
category: email-html
tags: ["Email HTML","CRM","Modo escuro"]
cover: ../../assets/covers/email-modo-escuro.webp
coverAlt: "O mesmo email no modo claro e no modo escuro; na versão escura, a logo preta quase desaparece no fundo"
---

Boa parte das pessoas usa o celular no modo escuro, e muitos programas de email aplicam esse tema às mensagens também. O resultado nem sempre é o que você desenhou: a logo preta some no fundo escuro, o texto cinza fica ilegível, o botão troca de cor e aquela imagem com fundo branco vira um retângulo brilhando no meio da tela.

Não dá para controlar tudo. Mas dá para desenhar o email de um jeito que ele fique bom nos dois temas.

## Por que cada programa faz uma coisa diferente

Não existe um "modo escuro de email" padrão. Cada programa decide o que fazer com a sua mensagem, e na prática há três comportamentos:

- **Não muda nada.** O email aparece exatamente como foi desenhado, mesmo com o aparelho no modo escuro.
- **Inversão parcial.** O programa escurece só os fundos claros e clareia os textos escuros. Fundos que já eram escuros costumam ficar como estão.
- **Inversão total.** O programa inverte praticamente todas as cores, inclusive as de fundos escuros e botões.

Alguns programas, como o Apple Mail, respeitam o CSS de modo escuro que você escrever. Outros, como os apps do Gmail no celular e as versões do Outlook, aplicam a própria inversão, sem ler as suas regras. É por isso que o mesmo email pode aparecer de três jeitos diferentes em três celulares.

## 1. Avise que o email está preparado

No `<head>`, declare que o email suporta os dois temas:

```html
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<style>
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
</style>
```

Isso diz aos programas que respeitam o padrão que você mesmo vai cuidar do tema escuro.

## 2. Escreva as regras do tema escuro

Para os programas que leem CSS, dá para definir cores específicas para o modo escuro:

```html
<style>
  @media (prefers-color-scheme: dark) {
    .fundo { background-color: #1c1c1c !important; }
    .texto { color: #f2f0eb !important; }
    .logo-clara { display: block !important; }
    .logo-escura { display: none !important; }
  }
</style>
```

O truque das duas logos é o mais útil: você coloca a versão escura e a versão clara no email, e o CSS mostra a certa para cada tema. Onde o CSS não for lido, aparece a versão padrão.

## 3. Proteja a logo e as imagens

A logo é a primeira vítima do modo escuro, principalmente quando é preta em PNG transparente. Algumas saídas:

- **Contorno ou "halo" claro** em volta da logo transparente, fino o suficiente para não aparecer no fundo branco, mas que a mantém visível no escuro.
- **Logo sobre um fundo próprio**, como uma pequena área clara ou um card, em vez de transparente.
- **Imagens com texto sempre com fundo próprio.** Nunca dependa da cor do fundo do email para um texto dentro de uma imagem ficar legível.

## 4. Cuidado com as cores extremas

Preto puro (`#000000`) e branco puro (`#ffffff`) são os primeiros a serem invertidos, e a inversão costuma gerar contrastes duros. Tons levemente diferentes, como um quase preto e um off-white, tendem a se comportar de forma mais previsível e ainda deixam o email mais elegante.

Vale também conferir o contraste do texto cinza: um cinza médio que funciona no fundo branco pode ficar apagado quando o programa clareia só um pouco.

## 5. Teste de verdade

Não dá para confiar só na prévia do editor. Antes de enviar:

- Abra o email no seu celular, com o modo escuro ligado, nos apps que o seu público mais usa.
- Se puder, use uma ferramenta de teste como Litmus ou Email on Acid, que mostram dezenas de programas nos dois temas de uma vez.
- Olhe especialmente a logo, os botões e as imagens com texto.

## Checklist antes de enviar

- [ ] `color-scheme` declarado no `<head>`.
- [ ] Regras de `prefers-color-scheme: dark` para fundo, texto e logo.
- [ ] Logo visível nos dois temas (duas versões, contorno ou fundo próprio).
- [ ] Imagens com texto com fundo próprio.
- [ ] Sem preto e branco puros nos elementos principais.
- [ ] Testado no celular com o modo escuro ligado.

Esse cuidado soma com o do [botão que funciona no Outlook](/blog/botao-email-outlook-vml/): os dois problemas aparecem justamente nos programas que o seu público mais usa. E se você monta emails com frequência, o [Email Generator](https://emailgenerator.com.br/) ajuda a ganhar tempo na estrutura, para sobrar mais atenção para esses detalhes.
