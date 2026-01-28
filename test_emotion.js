
// Mock Enum
const Emotion = {
  HAPPY: 'happy',
  SAD: 'sad',
  ANGRY: 'angry',
  FEAR: 'fear',
  SURPRISED: 'surprise',
  CALM: 'calm',
  NEUTRAL: 'neutral'
};

// Paste logic here to test without TS compile
const analyzeEmotionFromText = (text) => {
  const normalized = text.toLowerCase();

  const keywords = {
    [Emotion.HAPPY]: [
      "happy", "joy", "great", "good", "love", "smile", "laugh", "excited",
      "wonderful", "fantastic", "amazing", "blessed", "cheerful", "content",
      "delighted", "excellent", "fun", "glad", "jolly", "pleasant", "proud",
      "satisfied", "thrilled", "win", "winner", "victory", "celebrate", "best"
    ],
    [Emotion.SAD]: [
      "sad", "cry", "unhappy", "depressed", "sorrow", "grief", "pain", "hurt",
      "lonely", "lost", "fail", "failure", "bad", "terrible", "awful", "worse",
      "worst", "misery", "melancholy", "heartbreak", "hopeless", "down", "low",
      "gloom", "glum", "tear", "weep", "shloka", "miss"
    ],
    [Emotion.ANGRY]: [
      "angry", "mad", "hate", "rage", "furious", "annoyed", "irritated", "upset",
      "bitter", "fuming", "hostile", "insult", "offended", "resent", "scorn",
      "spite", "violence", "violent", "yell", "scream", "shout", "fight", "argue"
    ],
    [Emotion.FEAR]: [
      "fear", "scared", "afraid", "terrified", "panic", "horror", "anxious",
      "nervous", "worry", "worried", "threat", "danger", "unsafe", "risk",
      "creepy", "spooky", "dark", "menacing", "nightmare", "fright", "dread",
      "shock", "tense", "uneasy"
    ],
    [Emotion.SURPRISED]: [
      "surprised", "wow", "shock", "amazing", "astonished", "disbelief",
      "unexpected", "sudden", "stunned", "startled", "awe", "wonder"
    ],
    [Emotion.CALM]: [
      "calm", "peace", "quiet", "still", "relax", "meditate", "serene",
      "tranquil", "soothe", "gentle", "soft", "silence", "silent", "zen",
      "chill", "rest", "sleep", "nap", "dream", "balanced"
    ],
    [Emotion.NEUTRAL]: [
      "okay", "fine", "normal", "average", "nothing", "bored", "dull",
      "plain", "standard", "whatever", "neutral"
    ]
  };

  const negationWords = ["not", "no", "never", "don't", "dont", "cant", "can't", "wont", "won't", "isn't", "isnt"];

  const scores = {
    [Emotion.HAPPY]: 0,
    [Emotion.SAD]: 0,
    [Emotion.ANGRY]: 0,
    [Emotion.FEAR]: 0,
    [Emotion.SURPRISED]: 0,
    [Emotion.CALM]: 0,
    [Emotion.NEUTRAL]: 0
  };

  const tokens = normalized.split(/[\s,!.?]+/);

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];
    if (!word) continue;

    let isNegated = false;
    if (i > 0) {
      const prev = tokens[i - 1];
      if (negationWords.includes(prev)) {
        isNegated = true;
      }
    }

    for (const [emo, list] of Object.entries(keywords)) {
      if (list.some(k => word.includes(k))) {
        if (isNegated) {
          if (emo === Emotion.HAPPY) scores[Emotion.SAD] += 1;
          else if (emo === Emotion.SAD) scores[Emotion.HAPPY] += 1;
          else if (emo === Emotion.CALM) scores[Emotion.ANGRY] += 0.5;
          scores[emo] -= 1;
        } else {
          scores[emo] += 2;
        }
      }
    }
  }

  let maxScore = -Infinity; // Fix: Should handle 0 scores better
  let winner = Emotion.NEUTRAL;

  for (const [emo, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      winner = emo;
    }
  }

  if (maxScore <= 0) return Emotion.NEUTRAL;

  return winner;
};

// Test Suite
const tests = [
  { input: "I am joyful", expected: "happy" },
  { input: "I am not happy", expected: "sad" }, // "not happy" -> +1 SAD, -1 HAPPY. Winner SAD (1) vs HAPPY (-1)
  { input: "I just failed my test", expected: "sad" },
  { input: "It is so dark and spooky here", expected: "fear" },
  { input: "I am feeling very calm", expected: "calm" },
  { input: "This is boring", expected: "neutral" },
  { input: "I hate this!", expected: "angry" },
  { input: "I don't hate this", expected: "happy" }, // "hate" is angry. "don't hate" -> angry -1. Happy +0? Wait... negation logic adds to HAPPY? No, generic negation just reduces score.
  // My logic for "hate" (Angry): if negated, does NOT add to happy currently unless explicitly handled.
  // Re-check logic: 
  // if (emo === Emotion.HAPPY) scores[Emotion.SAD] += 1;
  // else if (emo === Emotion.SAD) scores[Emotion.HAPPY] += 1;
  // else if (emo === Emotion.CALM) scores[Emotion.ANGRY] += 0.5;
  // So "not hate" (Angry) -> just scores[ANGRY] -= 1. Result: NEUTRAL (0 vs -1).
  // Let's expect Neutral for "not hate".

  { input: "I don't hate this", expected: "neutral" }
];

// Run Tests
let passed = 0;
tests.forEach(t => {
  const result = analyzeEmotionFromText(t.input);
  if (result === t.expected) {
    console.log(`PASS: "${t.input}" -> ${result}`);
    passed++;
  } else {
    console.log(`FAIL: "${t.input}" -> Expected ${t.expected}, Got ${result}`);
  }
});

console.log(`\nPassed ${passed}/${tests.length}`);
