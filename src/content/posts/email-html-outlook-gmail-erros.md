---
title: "Email HTML quebrado no Outlook e no Gmail: os erros mais comuns e como corrigir"
seoTitle: "Email HTML no Outlook e Gmail: erros comuns e como corrigir"
description: "Layout desmontado, fonte trocada, imagem gigante, email cortado: por que o HTML quebra no Outlook e no Gmail e o que corrigir em cada caso."
date: 2026-11-05
category: email-html
tags: ["Email HTML","Outlook","Gmail"]
cover: ../../assets/covers/email-html-outlook-gmail-erros.webp
coverAlt: "O mesmo email em duas janelas: no Gmail, aparece cortado com o aviso de mensagem cortada; no Outlook, o layout está desmontado, com a fonte trocada e o botão virado link"
draft: true
---

O email fica certo na prévia, e aí alguém abre no Outlook e as colunas estão desmontadas, a fonte virou Times New Roman e a imagem estourou a tela. No Gmail, o rodapé sumiu e apareceu um aviso de mensagem cortada.

Os dois têm causas diferentes, e a maioria dos problemas se repete. Aqui estão os mais comuns e o que fazer em cada caso.

## Por que o email quebra

O **Outlook clássico para Windows** usa o motor do Word para mostrar o email, não o de um navegador. Por isso, muita coisa que funciona em qualquer site é ignorada. O novo Outlook para Windows, o da web e o do Mac usam um navegador por baixo, e é no clássico que a maior parte destes problemas aparece.

O **Gmail** usa um motor moderno, mas limpa e limita o que recebe. Os problemas dele costumam ser de tamanho e de CSS removido.

## Os erros do Outlook clássico

### 1. Layout feito com div, flexbox ou grid

As colunas viram uma pilha, ou a largura se perde.

**Como corrigir:** monte a estrutura com tabelas, usando `role="presentation"` para não atrapalhar leitores de tela.

### 2. A largura do email ignorada

O suporte a `max-width` nas versões do Outlook baseadas no Word [é parcial](https://www.caniemail.com/features/css-max-width/), então o conteúdo pode se esticar pela janela inteira.

**Como corrigir:** use uma "tabela fantasma", que só o Outlook enxerga, com a largura fixa.

```html
<!--[if mso]>
<table role="presentation" width="600" align="center"><tr><td>
<![endif]-->
<div style="max-width:600px;margin:0 auto;">
  <!-- conteúdo do email -->
</div>
<!--[if mso]></td></tr></table><![endif]-->
```

### 3. Imagem gigante

Se a imagem foi exportada com o dobro do tamanho para telas retina, o Outlook pode mostrar o arquivo no tamanho real, ignorando o CSS.

**Como corrigir:** informe a largura no atributo da tag, não só no CSS. O `display:block` evita o espaço indesejado embaixo da imagem.

```html
<img src="banner.jpg" width="600" alt="Texto da oferta"
     style="display:block;width:100%;max-width:600px;height:auto;">
```

### 4. Botão que vira link

O preenchimento no `<a>` não funciona, e o botão vira um link sublinhado.

**Como corrigir:** esse tem um guia só dele: [botão de email que funciona no Outlook](/blog/botao-email-outlook-vml/).

### 5. Imagem de fundo que desaparece

O texto em cima da imagem pode ficar ilegível quando o fundo some. No Outlook, a imagem de fundo [depende de VML](https://www.caniemail.com/features/css-background-image/).

**Como corrigir:** defina sempre uma cor de fundo sólida que mantenha o texto legível. Só parta para o VML se a imagem for mesmo indispensável.

### 6. Fonte trocada

Fontes da web não carregam no Outlook clássico, e ele pode cair em Times New Roman.

**Como corrigir:** termine a lista de fontes com opções seguras, como `Arial, Helvetica, sans-serif`, e aplique a fonte em cada célula, não só no `<body>`.

### 7. Altura de linha estranha

Os títulos ficam apertados ou com um espaço diferente do desenhado.

**Como corrigir:** defina a altura de linha em pixels e acrescente a regra própria do Outlook.

```html
<td style="font-size:24px;line-height:30px;mso-line-height-rule:exactly;">
```

## Os erros do Gmail

### 8. O email cortado no meio

O Gmail esconde o conteúdo que passa de [102 KB](https://support.seguno.com/email-marketing/en/articles/7670542-why-gmail-clips-long-emails-and-how-seguno-warns-you) e mostra um aviso com o link para ver o resto. O problema mais comum é o rodapé e o link de descadastro ficarem na parte escondida.

**Como corrigir:** o limite é do código, não das imagens. Remova estilos que não são usados, tire comentários, reduza blocos repetidos e minifique o HTML antes de enviar.

### 9. Estilos que somem

O Gmail aceita a tag `<style>`, mas pode descartar regras, e o resultado varia entre os aplicativos e o tipo de conta. O Can I Email registra, por exemplo, [um caso em que o estilo inteiro foi removido](https://www.caniemail.com/features/css-background-image/) por causa de um `url()` com imagem de fundo.

**Como corrigir:** deixe o essencial em CSS na própria tag (`style="..."`) e use o `<style>` para melhorias, como os ajustes do celular. Assim, se ele sumir, o email continua legível.

## Os dois juntos: o modo escuro

Cada programa inverte as cores de um jeito, e uma logo escura pode desaparecer no fundo preto. O passo a passo está em [email no modo escuro: como evitar que sua campanha quebre](/blog/email-modo-escuro/).

## Resumo

| O que aparece | Onde | Causa provável | O que fazer |
|---|---|---|---|
| Colunas desmontadas | Outlook clássico | Layout com div ou flexbox | Usar tabelas |
| Email muito largo | Outlook clássico | `max-width` ignorado | Tabela fantasma |
| Imagem gigante | Outlook clássico | Sem `width` na tag | Informar o atributo |
| Botão virou link | Outlook clássico | Preenchimento no `<a>` ignorado | Botão em VML |
| Fundo sumiu | Outlook clássico | Imagem de fundo sem VML | Cor sólida legível |
| Times New Roman | Outlook clássico | Fonte da web sem alternativa | Lista com fontes seguras |
| "Mensagem cortada" | Gmail | HTML acima de 102 KB | Reduzir o código |
| Layout sem estilo | Gmail | CSS removido | Essencial em CSS na tag |

## Checklist antes de enviar

- [ ] A estrutura principal está em tabelas.
- [ ] As imagens têm `width` na tag e `alt` preenchido.
- [ ] O email tem cor de fundo de reserva onde houver imagem de fundo.
- [ ] A lista de fontes termina em opções seguras.
- [ ] O HTML final ficou abaixo de 102 KB.
- [ ] O email segue legível sem o bloco `<style>`.
- [ ] O teste passou pelo Outlook clássico, não só pelo Gmail. Ferramentas como Litmus e Email on Acid ajudam, e uma conta real no aplicativo também.

## Sem montar tudo na mão

Foi para não repetir essas correções em cada campanha que criei o [Email Generator](https://emailgenerator.com.br/): ele monta o email a partir de modelos para Gmail e Outlook, com prévia e o código pronto. Se precisar de emails sob medida para a sua marca, veja [alguns que eu fiz](/projetos/email-design/) e [me chame para conversar](/#contato).
