import type { Child } from "@hono/hono/jsx";
import { css, cx, Style } from "@hono/hono/css";

const bodyClass = css`
background: var(--primary-color);
display: grid;
place-items: center;
align-content: center;
`

const mainClass = css`
background: white;
font-family: var(--font-family);
`

export function Wrapper({ children }: { children?: Child }) {
	return (
		<html>
			<head>
				<title>Wrapper</title>
				<link rel="stylesheet" href="/static/theme.css" />
				<Style>{css`
				* {
					box-sizing: border-box;
				}
				`}</Style>
			</head>
			<body class={cx(bodyClass)}>
				<main class={mainClass}>
				{children}
				</main>
			</body>
		</html>
	);
}
