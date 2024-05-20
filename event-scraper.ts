import * as cheerio from 'cheerio';

// Scrape the webpage https://en.wikipedia.org/wiki/January_1
// and return the events that happened on January 1st.
export async function scrapeEvents(): Promise<string[]> {
  const url = 'https://en.wikipedia.org/wiki/January_1';
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  const events: string[] = [];

  $('.mw-parser-output ul li').each((index, element) => {
    const text = $(element).text();
    events.push(text);
  });

  return events;
}

const events = await scrapeEvents();
console.log(events);
