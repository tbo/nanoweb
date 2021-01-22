const fetch = require('node-fetch');
const { html } = require('@nanoweb/template');

const SearchResult = async search => {
  const { hits } = await (
    await fetch(
      'https://latency-dsn.algolia.net/1/indexes/instant_search?x-algolia-api-key=6be0576ff61c053d5f9a3225e2a90f76&x-algolia-application-id=latency&hitsPerPage=40&query=' +
        search,
    )
  ).json();

  if (!hits.length) {
    return html`
      <p>Sorry we couldn't find any results for "<b>${search}</b>"</p>
      <p>Try something electronics related</p>
    `;
  }
  return html`
    <div style="display: grid; grid-gap: 50px; grid-template-columns: repeat(4, 1fr); margin: 20px">
      ${hits.map(
        hit => html`
          <div class="card" id="${hit.objectID}">
            <div style="background: white url('${hit.image}') no-repeat center; height: 180px;"></div>
            <div class="card-body">
              <h5 class="card-title">${hit.name}</h5>
              <p class="card-text">${hit.description}</p>
            </div>
          </div>
        `,
      )}
    </div>
  `;
};

const LiveSearchExample = req => {
  const { search } = req.query;
  return html`
    <div style="text-align: center;">
      <form method="GET" action="/search">
        <input
          type="text"
          placeholder="Search term"
          name="search"
          oninput="this.form.dispatchEvent(new Event('submit', {bubbles: true}))"
          value="${search}"
          autocomplete="off"
          autofocus
        />
      </form>
      ${search ? SearchResult(search) : html`Enter a search term above`}
    </div>
  `;
};

module.exports = LiveSearchExample;
