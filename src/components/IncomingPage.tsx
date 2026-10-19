import type { CSSProperties } from 'react';

const instructions = [
  ['401000', '55', 'push rbp'],
  ['401001', '48 89 e5', 'mov rbp, rsp'],
  ['401004', 'e8 37 00 00 00', 'call write_page'],
  ['401009', '5d', 'pop rbp'],
  ['40100a', 'c3', 'ret'],
];
const stack = ['aaaabaaa', 'caaadaaa', 'eaaafaaa', 'gaaahaaa', 'iaaajaaa', 'kaaalaaa'];

export default function IncomingPage() {
  return <>
    <svg className="book-page-build incoming-presets" viewBox="0 0 460 440" fill="none" aria-hidden="true" fontFamily="JetBrains Mono, monospace" fontSize="12">
      <path d="M18 65V18H77M383 18H440V65M18 374V426H77M383 426H440V374" stroke="#b79fdf" strokeOpacity=".24" />
      <g className="incoming-scene incoming-mode-disassemble">
        <text x="32" y="45" fill="#b79fdf" fontSize="10">55 48 89 e5 e8 37 00 00 00 5d c3</text>
        <path d="M32 65H428" stroke="#b79fdf" strokeOpacity=".2" />
        <g className="book-byte-field">
          {instructions.map(([address, hex, operation], index) => <g className="incoming-instruction" key={address} style={{'--instruction':index} as CSSProperties}>
            <text x="32" y={104 + index * 30} fill="#b79fdf" fontSize="10">{address}</text>
            <text x="99" y={104 + index * 30} fill="#91dce6" fontSize="9">{hex}</text>
            <text x="246" y={104 + index * 30} fill={index === 2 ? '#ed94c9' : '#d5c9e7'} fontSize="10">{operation}</text>
          </g>)}
        </g>
        <path className="incoming-instruction-pointer" d="M20 95L26 100L20 105" stroke="#91dce6" strokeWidth="1.5" />
        <path d="M32 268H428" stroke="#b79fdf" strokeOpacity=".2" />
        <g className="incoming-recovered-source" fill="#c2a7ed">
          <text x="34" y="301">int main(void) {'{'}</text>
          <text x="49" y="327" fill="#91dce6">return write_page();</text>
          <text x="34" y="353">{'}'}</text>
          <text x="34" y="394" fill="#b79fdf" fontSize="10">// still reversing the draft</text>
        </g>
      </g>
      <g className="incoming-scene incoming-mode-stack">
        <text x="32" y="45" fill="#91dce6">cyclic(64)</text>
        <text x="32" y="68" fill="#b79fdf" fontSize="9">aaaabaaacaaadaaaeaaafaaagaaahaaa...</text>
        {stack.map((value, index) => <g key={value} className="incoming-stack-slot" style={{'--slot':index} as CSSProperties}>
          <path d={`M122 ${91 + index * 38}H420V${129 + index * 38}H122Z`} fill={index === 5 ? '#ed94c9' : '#91dce6'} fillOpacity={index === 5 ? '.06' : '.02'} stroke={index === 5 ? '#ed94c9' : '#b79fdf'} strokeOpacity=".3" />
          <text x="133" y={115 + index * 38} fill="#b79fdf" fontSize="9">+0x{(index * 8).toString(16).padStart(2, '0')}</text>
          <text className="incoming-stack-bytes" x="218" y={115 + index * 38} fill={index === 5 ? '#ed94c9' : '#91dce6'}>{value}</text>
        </g>)}
        <text x="32" y="115" fill="#b79fdf" fontSize="10">buffer</text>
        <text x="32" y="267" fill="#b79fdf" fontSize="10">saved rbp</text>
        <text x="32" y="305" fill="#ed94c9" fontSize="10">saved rip</text>
        <g className="incoming-offset-found">
          <text x="32" y="365" fill="#ed94c9">offset = 0x28</text>
          <text x="32" y="397" fill="#b79fdf" fontSize="10">offset found. post not found.</text>
        </g>
      </g>
      <g className="incoming-scene incoming-mode-debug" fill="#91dce6">
        <g className="incoming-debug-command" style={{'--command':0} as CSSProperties}><text x="32" y="47">(gdb) break write_page</text><text x="32" y="73" fill="#b79fdf" fontSize="10">Breakpoint 1 at 0x401040</text></g>
        <g className="incoming-debug-command" style={{'--command':1} as CSSProperties}><text x="32" y="119">(gdb) continue</text><text x="32" y="145" fill="#ed94c9" fontSize="11">Breakpoint 1, write_page()</text></g>
        <g className="incoming-debug-command" style={{'--command':2} as CSSProperties}><text x="32" y="197" fill="#b79fdf" fontSize="10">draft.c:42</text><text x="32" y="224" fill="#d5c9e7">42  while (!ready) {'{'}</text><text x="32" y="250" fill="#d5c9e7">43    write_notes();</text><text x="32" y="276" fill="#d5c9e7">44  {'}'}</text></g>
        <g className="incoming-debug-command" style={{'--command':3} as CSSProperties}><text x="32" y="327">(gdb) print ready</text><text x="32" y="353" fill="#ed94c9">$1 = false</text><text x="32" y="401">(gdb) <tspan className="incoming-debug-cursor">_</tspan></text></g>
      </g>
    </svg>
    <div className="book-build-state" aria-hidden="true">
      <span className="book-build-cursor" />
      <span className="incoming-status-labels"><span className="incoming-mode-disassemble">Reversing the next page...</span><span className="incoming-mode-stack">Offset found. Post not found.</span><span className="incoming-mode-debug">Breakpoint hit. Draft pending.</span></span>
      <span className="book-build-meter"><span /></span>
    </div>
  </>;
}
