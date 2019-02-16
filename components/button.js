import React from 'react'

export default function Button ({href, children}) { 
  return <a className="f6 link dim br1 ba bw2 ph3 pv2 mb2 dib dark-green" href={href}>{children}</a>
}