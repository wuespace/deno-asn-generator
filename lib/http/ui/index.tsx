import { css, cx } from "@hono/hono/css";
import { generateASN } from "$common/asn.ts";
import { Search } from "$http/ui/search.tsx";
import { BUTTON_STYLE } from "$http/ui/common/button-styles.ts";
import { ASNData } from "$common/mod.ts";

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

export async function IndexPage({asn}: {asn: ASNData}) {
  const script = { __html: `globalThis.asn = ${JSON.stringify(asn)};` };
  return (
    <>
      <script dangerouslySetInnerHTML={script}></script>
      <header class={cx(hideOnPrint)}>
        <nav class={buttonRowClass}>
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
          <button
            class={buttonClass}
            onclick={"globalThis.location.reload()"}
            title="Generate a new ASN"
          >
            <span class="material-symbols-outlined">
              refresh
            </span>
          </button>
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
      <footer class={cx(hideOnPrint)}>
        <a href="/about">About</a> <a href="/format">ASN Format</a>
      </footer>
    </>
  );
}
