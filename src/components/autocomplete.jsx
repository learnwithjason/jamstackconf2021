import React, { createElement, Fragment, useEffect, useRef } from 'react';
import { render } from 'react-dom';
import { autocomplete, getAlgoliaResults } from '@algolia/autocomplete-js';
import algoliasearch from 'algoliasearch/lite';
import '@algolia/autocomplete-theme-classic';

const searchClient = algoliasearch(
  'NSG548YGWI',
  '252979f55a71ee0c9de0adb8f88d5276',
);

function getQueryPattern(query, flags = "i") {
  const pattern = new RegExp(
    `(${query
      .trim()
      .toLowerCase()
      .split(" ")
      .map((token) => `^${token}`)
      .join("|")})`,
    flags
  );
  return pattern;
}

function showMessage(message) {
  console.log(message);
  // Display a message on page

}



function highlight(text, pattern) {
  const tokens = text.split(pattern);

  return tokens.map((token) => {
    if (!pattern.test("") && pattern.test(token)) {
      return <mark key={0}>{token}</mark>;
    }

    return token;
  });
}

export default function Autocomplete(props) {
  const containerRef = useRef(null);

  useEffect(() => {
    const search = autocomplete({
      container: containerRef.current,
      renderer: { createElement, Fragment },
      render({ children }, root) {
        render(children, root);
      },
      getSources: ({ query }) => [
        {
          sourceId: 'actions',
          templates: {
            item({ item }) {
              return (
                <p>
                  {item.label} {item.placeholder}
                </p>
              );
            },
          },
          getItems() {
            const pattern = getQueryPattern(query);

            return [
              {
                label: '/slap',
                placeholder: ' your.email@example.org',
                async onSelect(params) {
                  const [, email] = query.split(this.label + ' ');

                  const data = await fetch('/api/claim-swag', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                  }).then((res) => res.json());

                  showMessage(data);
                },
              },
            ].filter(({ label }) => pattern.test(label))
          },
          onSelect(params) {
            const { item, setQuery } = params;

            item.onSelect(params);
            setQuery('');
          },
        },
        {
          sourceId: 'swag',
          templates: {
            header() {
              return <h3>More Swag</h3>;
            },
            item({ item, components }) {
              return (
                <a href={item.url}>
                  <components.Highlight hit={item} attribute="title" />
                </a>
              );
            },
          },
          getItemUrl({ item }) {
            return item.url;
          },
          getItems() {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: 'swag',
                  query,
                },
              ],
            });
          },
        },
      ],
      ...props,
    });

    return () => {
      search.destroy();
    };
  }, [props]);

  return <div ref={containerRef} />;
}
