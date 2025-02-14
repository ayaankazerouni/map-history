interface HistoryEvent {
  day: number,
  month: string,
  year: number,
  description: string,
  latitude: number,
  longitude: number
}

type YearRange = {
  start: number,
  end: number
}

export const stripHtml = (element: string): string => {
  let tmp = document.createElement('div');
  tmp.innerHTML = element;
  return tmp.innerText || "";
}

export const filteredEvents = (
  events: HistoryEvent[],
  searchTerms: string,
  ranges: YearRange[]
): HistoryEvent[] => {
  console.log(events.length);
  const start = Math.min(...ranges.map(e => e.start));
  const end = Math.max(...ranges.map(e => e.end));
  const eventsToDraw = searchTerms.length === 0 ?
    events.filter(e => e.year >= start && e.year <= end) : 
    events.filter(e => tokenize(searchTerms).some(t => stripHtml(e.description).includes(t)));

  return eventsToDraw;
}

export const formatYear = (year: number): string => {
  return `${Math.abs(year)} ${year < 0 ? 'BC' : 'AD'}`;
}

export const tipText = (
  description: string,
  events: HistoryEvent[]
): string => {
  const d = events.filter((e) => e.description == description)[0];
  const year = `${Math.abs(d.year)} ${d.year < 0 ? 'BC' : 'AD'}`;
  return `<h4>${d.day} ${d.month}, ${year}</h4> ${d.description}`;
}

const tokenize = (input: string): string[] => {
    const regex = /"([^"]*)"|\S+/g;
    let match = regex.exec(input);
    const tokens: string[] = [];
 
    if (match !== null) {
        // If content was quoted, add the capture group.
        // Otherwise, add the match as is.
        tokens.push(match[1] ? match[1] : match[0]);
    }
  
    return tokens;
}

