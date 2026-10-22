# Temporal Patterns in Discharge Summary Requests

Project page

## Interactive findings

The three findings use [Chart.js 4.5.1](https://www.chartjs.org/), loaded from
jsDelivr, with hover/tap tooltips, keyboard navigation (arrow keys, Home, End),
and request-type percentages that update on hover. The original images remain as
fallbacks if JavaScript or the charting library is unavailable.

`static/js/chart-data.js` contains monthly values reconstructed from the vector
geometry of the PDFs in `reference/figures`, rather than raw clinical data.
To regenerate it, install PyMuPDF and run from the repository root:

```sh
python scripts/extract_chart_data.py
```

Serve the page locally with `python -m http.server 8000`.

## Acknowledgments
Parts of this project page were adopted from the [Nerfies](https://nerfies.github.io/) page.

## Website License
<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.
