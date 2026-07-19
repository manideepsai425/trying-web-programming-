// ============================================================
// SIMPLIFIED SELF-ATTENTION
// This is NOT a real trained model. Real attention scores come from
// learned Query, Key, Value matrices multiplied together. Here we
// FAKE those scores using two simple, explainable rules instead,
// so you can see the SHAPE of the mechanism without a real model:
//
//   1. Closer words attend to each other more (distance rule).
//   2. Identical/repeated words attend to each other strongly
//      (a rough stand-in for "semantic similarity").
//
// The real formula (for reference) is:
//   Attention(Q, K, V) = softmax( (Q * K^T) / sqrt(d_k) ) * V
//   - Q (query)  = "what am I looking for?"      (per word, a vector)
//   - K (key)    = "what do I contain?"           (per word, a vector)
//   - V (value)  = "what do I actually pass on?"  (per word, a vector)
//   - Q * K^T    = how well each word's query matches every key
//   - sqrt(d_k)  = scaling factor so scores don't get huge
//   - softmax    = turns raw scores into probabilities that sum to 1
// ============================================================

let words = [];
let attn = []; // attn[i][j] = how much word i attends to word j

const sentenceInput = document.getElementById('sentence');
const goBtn = document.getElementById('goBtn');
const wordBank = document.getElementById('wordBank');
const hint = document.getElementById('hint');
const canvas = document.getElementById('heat');
const ctx = canvas.getContext('2d');

let selected = -1;

function softmax(row) {
  const max = Math.max(...row);
  const exps = row.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(v => v / sum);
}

function buildAttention(wordList) {
  const n = wordList.length;
  const scores = [];
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      let score = -Math.abs(i - j) * 0.6;          // rule 1: distance penalty
      if (wordList[i] === wordList[j] && i !== j) score += 3; // rule 2: same word boost
      if (i === j) score += 1.2;                   // words also attend to themselves
      row.push(score);
    }
    scores.push(softmax(row)); // softmax turns scores into a probability row
  }
  return scores;
}

function render() {
  words = sentenceInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  attn = buildAttention(words);
  selected = -1;
  renderWordBank();
  drawHeatmap();
  hint.textContent = 'Tap a word above to highlight its attention row.';
}

function renderWordBank() {
  wordBank.innerHTML = '';
  words.forEach((w, i) => {
    const span = document.createElement('span');
    span.textContent = w;
    span.addEventListener('click', () => {
      selected = (selected === i) ? -1 : i;
      renderWordBank();
      drawHeatmap();
      hint.textContent = selected === -1
        ? 'Tap a word above to highlight its attention row.'
        : `"${words[selected]}" is attending to every word below — brighter = more attention.`;
    });
    if (i === selected) span.classList.add('active');
    wordBank.appendChild(span);
  });
}

function drawHeatmap() {
  const n = words.length;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  if (n === 0) return;

  const cell = Math.min(W, H) / n;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const weight = attn[i][j]; // between 0 and 1
      const isRowSelected = (selected === -1 || selected === i);
      const alpha = isRowSelected ? weight : weight * 0.08;

      ctx.fillStyle = `rgba(255,138,95,${alpha})`;
      ctx.fillRect(j * cell, i * cell, cell, cell);
      ctx.strokeStyle = '#20242e';
      ctx.strokeRect(j * cell, i * cell, cell, cell);
    }
  }

  // axis labels (rough, small font)
  ctx.fillStyle = '#9aa1ac';
  ctx.font = `${Math.max(9, cell * 0.22)}px sans-serif`;
  for (let i = 0; i < n; i++) {
    ctx.save();
    ctx.translate(4, i * cell + cell / 2 + 3);
    ctx.fillText(words[i], 0, 0);
    ctx.restore();
  }
}

goBtn.addEventListener('click', render);
sentenceInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') render();
});

render();