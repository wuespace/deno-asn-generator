import { css, cx } from "@hono/hono/css";
import { Search } from "$http/ui/search.tsx";
import { BUTTON_STYLE } from "$http/ui/common/button-styles.ts";
import type { ASNData } from "$common/mod.ts";

const hideOnPrint = css`
@media print {
	display: none;
}
`;

const asnTextClass = css`
text-align: center;
user-select: all;
`;

const mainClass = css`
height: 100%;
display: flex;
flex-direction: column;
gap: 0rem;
justify-content: center;
align-items: stretch;
`;

const buttonRowClass = css`
display: flex;
gap: .25rem;
justify-content: end;
`;

const buttonClass = css`
display: block;
aspect-ratio: 1 / 1;
width: 3rem;
padding: .25rem;
border-radius: .25rem;
overflow: hidden;

border: none;

${BUTTON_STYLE}
`;

const spacerClass = css`
flex-grow: 1;
`;

export function ASNPage({ asn }: { asn: ASNData }) {
  const script = { __html: `globalThis.asn = ${JSON.stringify(asn)};` };
  return (
    <>
      <script dangerouslySetInnerHTML={script}></script>
      <header class={cx(hideOnPrint)}>
        <nav class={buttonRowClass}>
          <a href="/" class={buttonClass} title="Home">
            <span class="material-symbols-outlined">
              arrow_back
            </span>
          </a>
          <div class={spacerClass}></div>
          <button
            autofocus
            class={buttonClass}
            onclick={"globalThis.copy()"}
            title="Copy ASN to clipboard"
          >
            <div className="material-symbols-outlined">
              content_copy
            </div>
          </button>
          <a
            class={buttonClass}
            href="/asn"
            title="Generate a new ASN"
          >
            <span class="material-symbols-outlined">
              refresh
            </span>
          </a>
          <button
            class={buttonClass}
            onclick={"globalThis.print()"}
            title="Print ASN Barcode"
          >
            <span class="material-symbols-outlined">
              print
            </span>
          </button>
          <a
            class={buttonClass}
            href={`/svg/${asn.asn}`}
            download
            title="Download ASN Barcode"
          >
            <div className="material-symbols-outlined">
              barcode
            </div>
          </a>
        </nav>
        <Search />
      </header>
      <main class={mainClass}>
        <p class={hideOnPrint}>
          New ASN:
        </p>
        <img src={`/svg/${asn.asn}?embed=true`} alt="Barcode" />
        <p class={asnTextClass}>{asn.asn}</p>
      </main>
    </>
  );
}
