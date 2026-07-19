# trying-web-programming-


A small, dependency-free web page that shows a simplified version of the
mechanism inside every Transformer-based LLM (GPT, Claude, etc.): **self-attention**.
Type a sentence, tap a word, and see how strongly it "attends to" every
other word in the sentence, rendered as a heatmap.

This is a teaching toy, not a real model — see **How the demo differs from
real attention** below.

---

## Files

| File | Role |
|---|---|
| `canvas.html` | Page structure — the input box, word list, and canvas |
| `looks.css` | Visual styling — dark theme, layout, heatmap cell borders |
| `brain.js` | Logic — builds a fake attention matrix and draws it |

All three must sit in the **same folder**. `canvas.html` links to the
other two by exact filename:

```html
<link rel="stylesheet" href="looks.css">
<script src="brain.js"></script>