const response =
  (await fetch('https://raw.githubusercontent.com/aourednik/historical-basemaps/refs/heads/master/index.json'));

const data = await response.json();

process.stdout.write(JSON.stringify(data));
