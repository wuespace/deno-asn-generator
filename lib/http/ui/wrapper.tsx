import type { Child } from "@hono/hono/jsx";
import { css, cx, Style } from "@hono/hono/css";
import { CONFIG } from "$common/config.ts";

const bodyClass = css`
background: var(--primary-color);
/* display: grid;
place-items: center;
align-content: top; */
margin: 0;
padding: 1rem;

@media print {
	background: transparent;
	height: 100%;
	align-content: stretch;
	place-items: stretch;
}
`;

const mainClass = css`
background: white;
font-family: var(--font-family);
width: clamp(0px, 100%, 30rem);
margin: 0 auto;
overflow-x: hidden;

padding: 1rem;
border-radius: 0.5rem;

@media print {
	width: 100%;
	height: 100%;
}
`;

const hideOnPrint = css`
@media print {
	display: none;
}
`;

export function Wrapper({ children }: { children?: Child }) {
  return (
    <html>
      <head>
        <title>{CONFIG.ASN_PREFIX} Number Generator</title>
        <link
          rel="icon"
          type="image/svg+xml"
          href="/static/asn-generator-logo.svg"
        />
        <link rel="icon" type="image/png" href="/static/asn-generator-logo.png" />
        <link
          rel="stylesheet"
          href="/static/material-symbols/style.css"
        />
        <link rel="stylesheet" href="/static/theme.css" />
        <Style>
          {css`
				* {
					box-sizing: border-box;
				}

				html, body {
					height: 100%;
				}

				:focus {
					outline-color: var(--primary-color);
				}

        h1 {
          margin: 0;
        }
				`}
        </Style>
      </head>
      <body class={cx(bodyClass)}>
        <main class={mainClass}>
          {children}
          <footer class={cx(hideOnPrint)}>
            <a href="/about">About</a> <a href="/format">ASN Format</a>
          </footer>
        </main>
        <script src="/static/main.js"></script>
      </body>
    </html>
  );
}
