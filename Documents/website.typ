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
