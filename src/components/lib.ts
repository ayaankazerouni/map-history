/**
 * Split the input string into words (or phrases
 * if they are quoted).
 * @param input
 * @returns an array of strings
 */
export function tokenize(input: string) {
    const regex = /"([^"]*)"|\S+/g;
    let match;
    const tokens: string[] = [];

    while ((match = regex.exec(input)) !== null) {
        // If content was quoted, add the capture group
        //  to the list. Otherwise, add the match as is.
        tokens.push(match[1] ? match[1] : match[0]);
    }

    return tokens;
}

/**
 * @param element An HTML string.
 * @returns The string with all HTML content stripped.
 */
export function stripHtml(element: string) {
  let tmp = document.createElement('div');
  tmp.innerHTML = element;
  return tmp.innerText || "";
}


interface Event { year: number, description: string }
/**
 *
 * @param events A search phrase
 * @returns
 */
export function filterTest(searchTerms: string) {
  const lowerSearch = searchTerms.toLowerCase();

  return (e: Event) => {
    const lowerDesc = e.description.toLowerCase();
    const tokenized = tokenize(lowerSearch);
    return tokenized.some(t => lowerDesc.includes(t));
  };
}
