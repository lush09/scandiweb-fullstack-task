import React from "react";

// Very basic HTML-to-React parser for safe tags (p, b, i, ul, ol, li, br, strong, em, h1-h6, span)
// Extend as needed for more tags or attributes
export function parseHtmlToReact(html: string): React.ReactNode {
  const ALLOWED_TAGS = [
    "P",
    "B",
    "I",
    "UL",
    "OL",
    "LI",
    "BR",
    "STRONG",
    "EM",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "SPAN",
  ];
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  function walk(node: ChildNode): React.ReactNode {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return null;
    const el = node as HTMLElement;
    if (!ALLOWED_TAGS.includes(el.tagName)) return el.textContent;
    const children = Array.from(el.childNodes).map(walk);
    switch (el.tagName) {
      case "P":
        return <p>{children}</p>;
      case "B":
        return <b>{children}</b>;
      case "I":
        return <i>{children}</i>;
      case "UL":
        return <ul>{children}</ul>;
      case "OL":
        return <ol>{children}</ol>;
      case "LI":
        return <li>{children}</li>;
      case "BR":
        return <br />;
      case "STRONG":
        return <strong>{children}</strong>;
      case "EM":
        return <em>{children}</em>;
      case "H1":
        return <h1>{children}</h1>;
      case "H2":
        return <h2>{children}</h2>;
      case "H3":
        return <h3>{children}</h3>;
      case "H4":
        return <h4>{children}</h4>;
      case "H5":
        return <h5>{children}</h5>;
      case "H6":
        return <h6>{children}</h6>;
      case "SPAN":
        return <span>{children}</span>;
      default:
        return el.textContent;
    }
  }
  const root = doc.body.firstChild;
  if (!root) return null;
  return Array.from(root.childNodes).map(walk);
}
