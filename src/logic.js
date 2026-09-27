// QVAC Passphrase Generator — core logic.
// completion() brainstorms memorable multi-word passphrase IDEAS around a
// theme word. This is a creative idea generator only — no security claims.
//
// The one-shot example is given as real multi-turn history (user/assistant
// pairs), not as prose in the system prompt, so the small model doesn't just
// parrot the example back regardless of the real input.

import { completion } from "@qvac/sdk";

function looksUnusable(text) {
  if (!text || text.trim().length === 0) return true;
  const bad = ["i cannot", "i can't", "as an ai", "i'm not able", "i am not able"];
  const lower = text.toLowerCase();
  return bad.some((phrase) => lower.includes(phrase));
}

function parseLines(raw) {
  return raw
    .split("\n")
    .map((line) =>
      line
        .trim()
        .replace(/^[-*\d.)\s]+/, "")
        .replace(/^["']|["']$/g, "")
        .trim()
    )
    // Ideas may be a single smashed-together token (e.g. "OceanDrifting42")
    // or a few space-separated words — either is valid, so filter on
    // reasonable length rather than requiring multiple whitespace tokens.
    .filter((line) => line.length >= 6 && line.length <= 40 && /[a-zA-Z]{3,}/.test(line));
}

// Title-cases every word and joins them with no separator, e.g.
// "sea breeze" -> "SeaBreeze". Used so a multi-word theme still produces a
// single smashed-together token like the rest of the fallback ideas, instead
// of leaving a raw space and lowercase trailing words (e.g. the old
// `theme.charAt(0).toUpperCase() + theme.slice(1)` approach turned "sea
// breeze" into "Sea breeze", not "SeaBreeze").
function titleCaseWords(theme) {
  return theme
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

// Deterministic fallback ideas, always available regardless of model output.
function fallbackIdeas(theme) {
  const cap = titleCaseWords(theme.trim());
  return [
    `${cap}Sunrise7Whisper`,
    `Blue${cap}Wandering42`,
    `${cap}AndThunder99`,
    `Quiet${cap}Harbor21`,
    `${cap}TravelsFar8`,
  ];
}

export async function generatePassphrases(modelId, theme) {
  const run = completion({
    modelId,
    history: [
      {
        role: "system",
        content:
          "You brainstorm memorable multi-word passphrase IDEAS built around a theme word. " +
          "Each idea should combine the theme with 2-4 other everyday words and optionally a " +
          "number, joined together or separated by spaces (e.g. word-word-word style). " +
          "Reply with ONLY a plain list, one idea per line, no numbering, no extra commentary.",
      },
      { role: "user", content: "Theme: ocean" },
      {
        role: "assistant",
        content:
          "OceanDrifting42\nBlueOceanWhisper\nOcean7Lighthouse\nQuietOceanTide99\nOceanAndStarlight",
      },
      { role: "user", content: `Theme: ${theme}` },
    ],
    stream: true,
    completionOpts: { temperature: 0.85, maxTokens: 150 },
  });

  let raw = "";
  for await (const token of run.tokenStream) raw += token;

  let ideas = looksUnusable(raw) ? [] : parseLines(raw);

  // Deterministically enforce the 3-5 count requirement rather than trusting
  // the prompt alone: top up with fallback ideas if short, trim if long.
  if (ideas.length < 3) {
    const extra = fallbackIdeas(theme).filter((f) => !ideas.includes(f));
    ideas = ideas.concat(extra);
  }
  ideas = ideas.slice(0, 5);
  if (ideas.length < 3) ideas = fallbackIdeas(theme).slice(0, 3);

  return { theme, ideas };
}
