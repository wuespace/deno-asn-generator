import { getConfig } from "$common/mod.ts";
import { css } from "@hono/hono/css";
import { BUTTON_STYLE } from "$http/ui/common/button-styles.ts";

const formStyle = css`
  display: flex;
  margin-block: 1rem;
  font-size: 1rem;
`;

const prefixStyle = (isLookupEnabled: boolean) =>
  css`
    display: block;
    border: 1px solid var(--primary-color);
    padding: 0.5rem;
    user-select: none;

    display: grid;
    place-items: center;
    align-items: center;

    border-start-start-radius: 0.25rem;
    border-end-start-radius: 0.25rem;

    ${isLookupEnabled ? "" : "opacity: 0.5;"};
  `;

const inputStyle = css`
  min-width: 3rem;
  flex: 1;
  font-size: 1rem;
  padding: 0.5rem;
  border-radius: none;
  border-inline: none;
  border-block: 1px solid var(--primary-color);

  &:disabled {
    opacity: 0.5;
  }
`;

const submitStyle = css`
  ${BUTTON_STYLE} padding: 0.5rem;

  border: 1px solid var(--primary-color);

  &:disabled {
    opacity: 0.5;
  }
`;

export function Search() {
  const isLookupEnabled = Boolean(getConfig().ASN_LOOKUP_URL);
  return (
    <form class={formStyle} target="_blank" method="post" action="/lookup">
      <span class={prefixStyle(isLookupEnabled)}>{getConfig().ASN_PREFIX}</span>
      <input
        class={inputStyle}
        disabled={!isLookupEnabled}
        type="number"
        pattern="[0-9]+"
        required
        name="asn"
        placeholder={isLookupEnabled ? "ASN" : "ASN Lookup Disabled"}
      />
      <button
        type="submit"
        class={submitStyle}
        disabled={!isLookupEnabled}
        title="Lookup ASN"
      >
        <div className="material-symbols-outlined">
          feature_search
        </div>
      </button>
    </form>
  );
}
