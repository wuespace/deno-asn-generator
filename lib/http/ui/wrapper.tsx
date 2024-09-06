import type { Child } from "@hono/hono/jsx";
import { css, cx, Style } from "@hono/hono/css";

const bodyClass = css`
background: var(--primary-color);
display: grid;
place-items: center;
align-content: center;
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
width: clamp(0px, 100%, 20rem);
overflow-x: hidden;

padding: 1rem;
border-radius: 0.5rem;

@media print {
	width: 100%;
	height: 100%;
}
`;

export function Wrapper({ children }: { children?: Child }) {
	return (
		<html>
			<head>
				<title>Wrapper</title>
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
				`}
				</Style>
			</head>
			<body class={cx(bodyClass)}>
				<main class={mainClass}>
					{children}
				</main>
				<script src="/static/main.js"></script>
			</body>
		</html>
	);
}
