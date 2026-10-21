export default function DigitalFlag() {
  return <svg className="digital-flag" viewBox="0 0 112 120" aria-hidden="true">
    <path className="digital-flag-ground" d="M10 108h22m8 0h5m8 0h19" />
    <path className="digital-flag-pole" d="M21 18h4v84h-4ZM17 101h12v4H17Z" />
    <g className="digital-flag-cloth">
      <path className="digital-flag-field" d="M25 22h55v4h12v5h8v27h-8v5H80v4H25Z" />
      <path className="digital-flag-edge" d="M25 22h55v4h12v5h8M25 67h55v-4h12v-5h8" />
      <text x="35" y="51">CTF</text>
      <path className="digital-flag-fragment fragment-one" d="M92 19h4v4h-4Z" />
      <path className="digital-flag-fragment fragment-two" d="M99 66h3v3h-3Z" />
      <path className="digital-flag-fragment fragment-three" d="M86 75h3v3h-3Z" />
    </g>
    <path className="digital-flag-signal" d="M8 40h6m-9 8h9m-6 8h6" />
  </svg>;
}
