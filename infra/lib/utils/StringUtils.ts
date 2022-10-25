export function capitalize(word: string | null | undefined) {
  if (word === undefined || word === null || word.length === 0) {
    return "";
  }
  const firstLetter = word.charAt(0);
  const remainingLetters = word.slice(1);
  return firstLetter.toLocaleUpperCase() + remainingLetters;
}
