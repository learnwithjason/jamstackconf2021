import React, { createElement, Fragment, useEffect, useRef } from "react";
import { render } from "react-dom";
import { autocomplete } from "@algolia/autocomplete-js";
import "@algolia/autocomplete-theme-classic";
import {Action} from './Action'

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
    if (!containerRef.current) {
      return undefined;
    }

    // Initialize autocomplete on the newly created container
    const search = autocomplete({
      container: containerRef.current,
      renderer: { createElement, Fragment },
      render({ children }, root) {       
        render(children, root);
      },
      getSources: ({ query }) => [
        {
          sourceId: "actions",
          templates: {
            item({ item }) {
              return <Action key={item.label} hit={item} />;
            }
          },
          getItems({ state }) {
            const pattern = getQueryPattern(query);

            return [
              {
                label: "/bag",
                placeholder: "  yourAddress@email.com",
                onSelect() {
                  // Get the email from the query
                  const ticketId = query.split(this.label + " ");

                  // Send the email address to the claim-swag serverless function
                  fetch("/.netlify/functions/claim-swag", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      email: ticketId[1],
                    }),
                  })
                    .then((res) => res.json())
                    .then((data) => showMessage(data.message))
                    .catch((err) => showMessage(err))       
                },
                icon: (
                  <svg
                    width="138"
                    height="212"
                    viewBox="0 0 138 212"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M86.119 18.8795L113.411 43.6006C124.586 53.7225 124.586 71.2775 113.411 81.3994L86.119 106.121C76.403 114.921 61.597 114.921 51.881 106.12L24.5889 81.3994C13.4143 71.2775 13.4143 53.7225 24.5889 43.6006L51.881 18.8795C61.597 10.0787 76.403 10.0787 86.119 18.8795Z"
                      stroke="black"
                      strokeWidth="8"
                    />
                    <mask id="path-2-inside-1" fill="white">
                      <rect y="57" width="138" height="155" rx="3" />
                    </mask>
                    <rect
                      y="57"
                      width="138"
                      height="155"
                      rx="3"
                      fill="white"
                      stroke="black"
                      strokeWidth="16"
                      mask="url(#path-2-inside-1)"
                    />
                  </svg>
                )
              }
            ].filter(({ label }) => pattern.test(label))
            .map((action) => ({
              ...action,
              highlighted: highlight(action.label, pattern)
            }));
          },
          onSelect(params) {
            // item is the full item data
            // setQuery is a hook to set the query state
            const { item, setQuery } = params;

            item.onSelect(params);
            setQuery("");
          },
        }
      ],
      ...props
    });

    // Destroy the search instance in cleanup
    return () => {
      search.destroy();
    };
  }, [props]);

  return <div ref={containerRef} />;
}
