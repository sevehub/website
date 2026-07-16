// SeveTech blog post template
// Usage: import this file, then call article(...) wrapping your content

#let article(
  title: "",
  subtitle: "",
  author: "SEVETECH",
  date: datetime(year: 2026, month: 1, day: 1),
  body,
) = {
  set document(title: title, author: author, date: date)
  set page(
    fill: rgb("#faf6ee"),
    paper: "us-letter",
    margin: (top: 1in, bottom: 1in, left: 1in, right: 1in),
  )
  set text(
    font: "Georgia",
    size: 11pt,
    lang: "en",
  )
  set heading(numbering: none)

  set par(justify: true, leading: 0.65em)

  show heading.where(level: 1): it => {
    set text(font: "Georgia", size: 20pt, weight: "bold")
    v(0.6em)
    it.body
    v(0.2em)
    line(length: 100%, stroke: 0.5pt + rgb("#2b2620"))
    v(0.8em)
  }

  show heading.where(level: 2): it => {
    set text(font: "Georgia", size: 13pt, weight: "medium")
    v(1em)
    it.body
    v(0.4em)
  }

  show raw.where(block: true): it => {
    set text(font: "Georgia", size: 8.8pt)
    block(
      fill: rgb("#f0ead9"),
      inset: 10pt,
      radius: 2pt,
      width: 100%,
      it,
    )
  }

  show raw.where(block: false): it => {
    set text(font: "Georgia", size: 9.5pt)
    box(fill: rgb("#f0ead9"), outset: (y: 2pt), inset: (x: 2pt), it)
  }


  text(
    size: 10pt,
    fill: gray,
  )[#link("index2026.html")[← Index] | #link("https://sites.google.com/view/paperstackpro/home/blog")[🏠 Home]]
  v(1em)
  text(
    size: 8pt,
    fill: gray,
  )[#title #h(1em) \(#date.display("[month repr:short] [day], [year]")\)]
  v(1em)
  text(
    size: 6pt,
    fill: gray,
  )[#subtitle]

  body
}
