import { CONFIG, type Config } from "$common/mod.ts";
import { Search } from "$http/ui/search.tsx";
import { css, cx } from "@hono/hono/css";
import { BUTTON_STYLE } from "$http/ui/common/button-styles.ts";
import type { Child } from "jsr:@hono/hono@^4.5.11/jsx";

const linkCardStyle = css`
grid-template-columns: auto 1fr;

border: 1px solid var(--primary-color);
border-radius: 0.25rem;

${BUTTON_STYLE}
place-items: start;
grid-column-gap: .5rem;

font-size: 1rem;
`;

const linkCardIconStyle = css`
display: block;
place-self: center;
padding: .5rem;
`;

export function IndexPage({ config }: { config: Config }) {
  const genericRangeStart = Number.parseInt(
    "1" + "0".repeat(config.ASN_NAMESPACE_RANGE.toString().length - 1),
  );
  const genericRangeEnd = config.ASN_NAMESPACE_RANGE - 1;
  return (
    <>
      <header>
        <h1>{config.ASN_PREFIX} Code Generator</h1>
        <p>
          Look up {config.ASN_PREFIX} codes in the DMS:
        </p>
        <Search />
      </header>
      <main>
        <p>
          Generic {config.ASN_PREFIX}{" "}
          codes are codes that are not assigned to any document and are
          accessible to all members of the organization.
        </p>
        <LinkCard icon={"add"} href="/asn" autofocus>
          Generate generic {CONFIG.ASN_PREFIX} code
          <br />
          <small>
            {config.ASN_PREFIX}
            {genericRangeStart}XXX-
            {config.ASN_PREFIX}
            {genericRangeEnd}XXX
          </small>
        </LinkCard>
        {CONFIG.ADDITIONAL_MANAGED_NAMESPACES.length
          ? (
            <p>
              Manually generate {config.ASN_PREFIX}{" "}
              codes for specific namespaces, such as namespaces for protected
              documents:
            </p>
          )
          : ""}
        {CONFIG.ADDITIONAL_MANAGED_NAMESPACES.map(({ namespace, label }) => (
          <LinkCard
            icon={"note_add"}
            href={`/asn?namespace=${namespace}`}
          >
            {label}
            <br />
            <small>
              {config.ASN_PREFIX}
              {namespace}XXX
            </small>
          </LinkCard>
        ))}
        <p>&nbsp;</p>
      </main>
    </>
  );
}

function LinkCard(
  { children, icon, autofocus, href }: {
    children: Child;
    icon: string;
    autofocus?: boolean;
    href: string;
  },
) {
  return (
    <a href={href} class={linkCardStyle} autofocus={autofocus}>
      <span
        class={cx(
          "icon material-symbols-outlined",
          linkCardIconStyle,
        )}
      >
        {icon}
      </span>
      <p class="title">
        {children}
      </p>
    </a>
  );
}
