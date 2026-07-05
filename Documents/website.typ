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
    paper: "us-letter",
    margin: (top: 1in, bottom: 1in, left: 1in, right: 1in),
  )
  set par(justify: true)
  set text(
    font: "Georgia",
    size: 11pt,
    lang: "en",
  )
  set heading(numbering: none)

  // Title Page
  align(center)[
    #text(size: 28pt, weight: "bold")[#title]
    #v(0.5em)
    #text(size: 14pt, fill: gray)[#subtitle]
    #v(2em)
    #text(size: 12pt, weight: "bold")[#author]
    #text(
      size: 11pt,
      fill: gray,
    )[ #date.display("[month repr:short] [day], [year]")]
  ]
  pagebreak()

  body
}
