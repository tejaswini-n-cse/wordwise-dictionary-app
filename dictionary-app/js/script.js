const form = document.querySelector("#search-form");
const input = document.querySelector("#word-input");
const statusEl = document.querySelector("#status");
const resultEl = document.querySelector("#result");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const word = input.value.trim();
  if (word) searchWord(word);
});

async function searchWord(word) {
  statusEl.textContent = `Looking up “${word}”…`;
  resultEl.classList.add("hidden");
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!response.ok) throw new Error(response.status === 404 ? "Word not found. Check the spelling and try again." : "The dictionary service is unavailable. Please try again.");
    const entries = await response.json();
    renderEntry(entries[0]);
    statusEl.textContent = "";
  } catch (error) {
    statusEl.textContent = error.message || "Something went wrong. Please try again.";
  }
}

function renderEntry(entry) {
  const phonetic = entry.phonetic || entry.phonetics?.find(p => p.text)?.text || "Pronunciation unavailable";
  const audio = entry.phonetics?.find(p => p.audio)?.audio;
  resultEl.innerHTML = `
    <div class="word-row">
      <div><h2 class="word">${escapeHTML(entry.word)}</h2><div class="phonetic">${escapeHTML(phonetic)}</div></div>
      <button class="audio-btn" id="audio-button" aria-label="Play pronunciation" title="Play pronunciation" ${audio ? "" : "disabled"}>▶</button>
    </div>
    ${(entry.meanings || []).map(meaning => `
      <div class="meaning">
        <p class="part">${escapeHTML(meaning.partOfSpeech || "Meaning")}</p>
        ${(meaning.definitions || []).slice(0, 4).map((item, index) => `
          <p class="definition"><strong>${index + 1}.</strong>${escapeHTML(item.definition || "")}</p>
          ${item.example ? `<p class="example">“${escapeHTML(item.example)}”</p>` : ""}
        `).join("")}
      </div>`).join("")}
    <p class="source">Word data from Free Dictionary API</p>`;
  resultEl.classList.remove("hidden");
  if (audio) document.querySelector("#audio-button").addEventListener("click", () => new Audio(audio).play());
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}