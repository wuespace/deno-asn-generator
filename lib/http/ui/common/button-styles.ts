import { css } from "@hono/hono/css";

export const BUTTON_STYLE = css`
cursor: pointer;

color: var(--primary-color);
font-size: 0.8rem;
text-decoration: none;

display: grid;
place-items: center;
align-items: center;

background: transparent;

transition: background 0.2s ease-out;
&:hover {
	background: #f3f3f3;
	transition: none;
}

&:active {
	background: #dfdfdf;
	transition: none;
}
`;
