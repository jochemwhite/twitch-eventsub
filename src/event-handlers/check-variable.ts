export default function checkVariable(inputString: string): { word: string; variable: boolean }[] {
  const regex = /(?:^|\s)({[^{}]*\})(?=\s|$)/g;

  const matches: { word: string; variable: boolean }[] = [];

  // Split inputString into words
  const words = inputString.split(/\s+/);

  for (const word of words) {
    const isVariable = regex.test(word); // Check if the word matches the regex
    matches.push({ word, variable: isVariable });
    // Reset the lastIndex of regex to ensure correct behavior in subsequent tests
    regex.lastIndex = 0;
  }


  return matches;
}
