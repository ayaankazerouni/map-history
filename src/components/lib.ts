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
 * Filters the events table based on the search terms.
 * Search terms are tokenized into words/phrases (phrases are surrounded by quotes).
 *
 * @param eventsTable An Arquero ColumnTable of events.
 * @param searchTerms The search terms string.
 * @param year The year to filter events up to.
 * @returns A filtered Arquero ColumnTable of events.
 */
export function filterEvents(eventsTable: Event[], searchTerms: string, year: number) {
  const lowerSearch = searchTerms.toLowerCase();
  return eventsTable
    .filter(event => {
      if (searchTerms.length > 0) {
        const lowerDesc = event.description.toLowerCase();
        const tokenized = tokenize(lowerSearch);
        if (event.year > year) {
          return false;
        } else {
          return tokenized.some(t => lowerDesc.includes(t));
        }
      } else {
        return false;
      }
    });
}
