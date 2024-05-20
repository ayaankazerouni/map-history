# Map History

(Web scraping code)

1. Make sure you have Python installed.
2. Clone the repo.
3. `cd map-history`
4. `python3 -m pip install -r requirements.txt` to install dependencies

## TODOs

- [ ] Right now this only grabs "Events", ignoring "Births" and "Deaths". Events mostly have places named in them.
- [ ] Use NLP to figure out if the event description names a place (or if it names multiple, figure out which place is the correct place). [Possibly useful tutorial](https://programminghistorian.org/en/lessons/finding-places-world-historical-gazetteer).
- [ ] Use an API to get the long/lat for the named place.
- [ ] Emit the event to a database or file.
