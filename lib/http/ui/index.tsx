import { css, cx } from "@hono/hono/css";
import { generateASN } from "$common/asn.ts";

const hideOnPrint = css`
@media print {
	display: none;
}
`

const mainClass = css`
display: flex;
flex-direction: column;
gap: 0rem;
justify-content: center;
align-items: center;
`

export async function IndexPage() {
	const asn = await generateASN();
	const script = {__html: `globalThis.asn = ${JSON.stringify(asn)};`};
	return <>
		<script dangerouslySetInnerHTML={script}></script>
		<header class={cx(hideOnPrint)}>
			<button onclick={'globalThis.copy()'}>Copy</button>
			<button onclick={'globalThis.location.reload()'}>Reload</button>
			<button onclick={'globalThis.print()'}>Print</button>
			<a href={`/svg/${asn.asn}`} download>Download</a>
		</header>
		<main class={mainClass}>
			<img src={`/svg/${asn.asn}?embed=true`} alt="Barcode" />
			<p>{asn.asn}</p>
		</main>
		<footer class={cx(hideOnPrint)}>
			<a href="/about">About</a>
		</footer>
	</>
}