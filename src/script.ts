// @ts-nocheck
// Function to calculate the Levenshtein distance between two strings
export function levenshteinDistance(a: string, b: string) {
  const matrix: number[][] = [];

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
                // @ts-ignore
  return matrix[b.length][a.length];
}


// Function to find the path with the shortest edit distance from the sitemap
export function findClosestPath(requestedPath: string, sitemapUrls: (string|null)[]) {
  let closestPath = '';
  let minDistance = Infinity;

  for (const url of sitemapUrls) {
    if (url !== null) {
      const distance = levenshteinDistance(requestedPath, url);
                      // @ts-ignore
      if (distance < minDistance) {
                        // @ts-ignore
        minDistance = distance;
        closestPath = url;
      }
    }
  }

  return closestPath;
}


// Function to fetch the sitemap and find the closest path
export async function suggestClosestPath() {
  try {
    const response = await fetch('/sitemap.xml');
    const sitemapXml = await response.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(sitemapXml, 'text/xml');
    const urlElements = xmlDoc.getElementsByTagName('url');

    const sitemapUrls =
        Array.from(urlElements)
            .map(
                (urlElement) =>
                // @ts-ignore
                    urlElement.getElementsByTagName('loc')[0].textContent);

    const requestedPath = window.location.pathname;
    const closestPath = findClosestPath(requestedPath, sitemapUrls);

    const suggestionElement = document.getElementById('suggestion');
    if (suggestionElement) {
      suggestionElement.innerHTML =
          `Did you mean: <a href="${closestPath}">${closestPath}</a>`;
    }
  } catch (error) {
    console.error('Error fetching sitemap:', error);
  }
}


// Call the function when the page loads
export function onPageLoad() {
  suggestClosestPath();
  window.onload = suggestClosestPath;
};

