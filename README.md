# Smart 404 Redirect

![](https://img.shields.io/badge/license-upl--1.0-black)

## Abstract

This is a javascript script for a 404 webpage where the browser should find the valid path that has the shortest edit distance (re: Levenshtein distance) from the path that was requested from the submitted URL based off of the latest sitemap.xml file. 

It then presents the suggestion (the shortest edit distance result based off of the sitemap.xml links) as suggested link (i.e. the path determined by the Levenshtein algo) on the 404 page.

## Usage

To use this script:

Create a 404.html page and include the above JavaScript code within a `<script>`  tag.
Make sure you have a valid sitemap.xml file in the root directory of your website. The sitemap should contain the URLs of your website's pages.
In the HTML body of your 404 page, include an element with the ID "suggestion" where the suggested link will be displayed. For example:

```html
<div id="suggestion"></div>
```
When a user lands on the 404 page, the script will automatically fetch the sitemap.xml file, find the path with the shortest edit distance from the requested path using the Levenshtein distance algorithm, and display the suggested link on the page.

### Generating a Sitemap

I use the script `static-sitemap-cli` from npm.

```bash
$ static-sitemap-cli --base http://localhost:3000 --no-clean
```
Then move the `sitemap.xml` file into the root of your projects html source directory that is to be published.


### Code

```javascript

// Function to calculate the Levenshtein distance between two strings
function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Function to find the path with the shortest edit distance from the sitemap
function findClosestPath(requestedPath, sitemapUrls) {
  let closestPath = '';
  let minDistance = Infinity;

  for (const url of sitemapUrls) {
    const distance = levenshteinDistance(requestedPath, url);
    if (distance < minDistance) {
      minDistance = distance;
      closestPath = url;
    }
  }

  return closestPath;
}

// Function to fetch the sitemap and find the closest path
async function suggestClosestPath() {
  try {
    const response = await fetch('/sitemap.xml');
    const sitemapXml = await response.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(sitemapXml, 'text/xml');
    const urlElements = xmlDoc.getElementsByTagName('url');

    const sitemapUrls = Array.from(urlElements).map(
      (urlElement) => urlElement.getElementsByTagName('loc')[0].textContent
    );

    const requestedPath = window.location.pathname;
    const closestPath = findClosestPath(requestedPath, sitemapUrls);

    const suggestionElement = document.getElementById('suggestion');
    suggestionElement.innerHTML = `Did you mean: <a href="${closestPath}">${closestPath}</a>`;
  } catch (error) {
    console.error('Error fetching sitemap:', error);
  }
}

// Call the function when the page loads
window.onload = suggestClosestPath;
```

 ## License
 
 Licensed under either of

 * Universal Permissive License 1.0
   ([LICENSE-UPL](LICENSE-UPL) or https://opensource.org/licenses/UPL)

 * Apache License, Version 2.0
   ([LICENSE-APACHE](LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
 
 at your option.

 ### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Universal Permissive License v 1.0 
license, shall be dual licensed as above, without any additional terms or conditions.