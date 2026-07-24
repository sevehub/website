
#import "website.typ": article

#show: article.with(
  title: "JupyterLite: Bringing Digital Enhancements to Paper Notebooks",
  subtitle: "Extend your paper notebooks with Python and JavaScript programming, all in your browser",
  author: "SEVETECH",
  date: datetime(year: 2026, month: 4, day: 27),
)


#line(length: 100%, stroke: 0.5pt + rgb("#dddddd"))

*JupyterLite* is a serverless, browser-based distribution of JupyterLab that runs Python code entirely in your browser without requiring any backend server or infrastructure. Everything executes locally in your browser using *WebAssembly*. No cloud bills, no compute costs, no vendor lock-in.

#link("https://sevehub.github.io/sevetechjupyterlite/lab/index.html")[We have a dedicated JupyterLite instance on GitHub Pages] that provides an interactive environment for working with our four notebooks. The instance is enhanced with custom extensions, and includes the SymPy library, giving you a fully equipped computational environment right in your browser with no installation required.

We've already explored JupyterLite's GitHub Gist integration in a different post. If you're looking for a practical way to share and version-control your notebooks, that covers how to link your JupyterLite environment with GitHub Gists.

When most people think of Jupyter, they envision Python notebooks and data science workflows. But JupyterLite supports multiple programming languages, each with distinct use cases.

+ *Python for Data Analysis*

  JupyterLite provides a complete Python environment with NumPy, Pandas, Matplotlib, and Plotly pre-installed. Analytics teams can explore datasets, build visualizations, and prototype analyses directly in the browser at zero infrastructure cost.

+ *JavaScript for Interactive Applications*

  JupyterLite also supports JavaScript kernels, fundamentally expanding what's possible. You're no longer confined to data analysis, you can build interactive web applications, dashboards, and collaborative tools that run entirely client-side.

  Frontend engineers can prototype interactive features without provisioning Node.js servers. Product teams can develop internal tools without backend infrastructure overhead. JupyterLite transforms from a data science tool into a full development environment.

+ *P5.js for Creative Coding and Visualization*

  The integration of P5.js, the JavaScript library for creative coding, brings computational creativity into this browser-native environment.

To integrate JupyterLite with your knowledge base, you can add Logseq deep links directly in your notebook.

Logseq deep links give you a way to jump straight into a specific page in your graph. You can create a special `logseq://` link that opens Logseq and lands you right where you want to be.

Logseq's own UI does most of the work. When you open a page, the three-dot menu lets you copy a ready-made deep link to that page (Copy page URL). Paste those links in a JupyterLite notebook, and clicking them will pull Logseq into view with the right content already open.

This feature is fully supported in the file-based version of Logseq, where deep links are known to work reliably. The newer database-backed version is still evolving, and deep link behavior hasn't been fully confirmed there yet. But if you're using the file version, deep links are one of the simplest ways to make Logseq feel more like a connected, system-wide knowledge tool rather than a standalone app.

The Jupyter notebook linked to the button below demonstrates a simple weekly-review layout that uses Logseq deep links. In a link such as `logseq://graph/GridMemo?page=2026-W15`, `GridMemo` is the name of my Logseq graph and should be replaced with the name of your local graph. The page reference `2026-W15` points to a Weekly Review page, but it can just as easily point to any page in your own graph.

When building a weekly review in Logseq, you simply tag any block you want to include with the weekly tag, for example `#2026-W17`, where 17 is the ISO week number. Every block carrying that tag will automatically appear in the Linked References section of the weekly page named `2026-W17`, giving you an instant overview of everything you marked for that week. This also mirrors the layout of our Weekly Planner Notebooks, so you work with the same ISO week numbers across Logseq, and your analog systems, creating a seamless hybrid workflow.

A similar URI scheme exists in Obsidian, it allows you to create links that open specific files directly via the `obsidian://` protocol. For example, to open your weekly review file, you would use `obsidian://open?path=weeklyreview_2026_w17.md`, which launches the specified file in your Obsidian vault.


== Ephemeral Bookmark Manager

Here we introduce a new digital tool to complement our set of paper notebooks. The *ephemeral bookmark manager* is a simple webpage that relies on LocalStorage for persistence, allowing you to save a set of URLs and download them as markdown files that you can then easily drag and drop into a JupyterLite notebook, accessible via the QR code in our #link("https://a.co/d/00Uvapl8")[Sketchbook INK].


In this way, you can create a computational notebook alongside your design using the same filename as your page ID. For example, if you're working on design concepts in INK5, create a JupyterLite notebook named `INK5.ipynb`. During your design session, save relevant research URLs to the ephemeral bookmark manager, like articles, design inspiration, documentation links, or reference materials. When you're ready, download the bookmarks as markdown (named as `6117_bookmarks.md` based on the day you're working), then drag that markdown file into your INK3 notebook, as shown in the video below.

This keeps your design work and computational research synchronized, with both using the same organizational reference.

When you scan your INK pages and save them to Google Drive, the ephemeral bookmark manager becomes even more valuable. You can quickly get the shareable link from your scanned PDF and add it to the bookmark manager alongside your other research references. This way, your computational notebook will display the link to your scanned hand-written note.

== Date Organization: ISO 8601 Ordinal Numbering

We suggest organizing all work using ISO 8601 ordinal numbering to maintain consistency across both digital and analog systems. Rather than relying on traditional date formats, we recommend a simple two-part structure: the last digit of the year followed by the progressive day number starting from January 1st. Under this system, April 27, 2026 becomes `6117`, where 6 represents the final digit of 2026 and 117 is the ordinal day count.

You might consider applying this system ubiquitously throughout your workflow: in filenames (such as `6117_bookmarks.md`), or on INK pages as date markers. This approach remains both human-readable and machine-sortable, making it easy to organize work chronologically without parsing complex date formats.

This pairs well with maintaining a physical Yearfolio, which provides a comprehensive archive along with a smart ordinal ISO 8601 lookup system. With it, you can quickly locate any work from any day of the year using its ordinal number. Paper records, digital notebooks, and computational work will thus all share a unified, single, elegant dating method.
