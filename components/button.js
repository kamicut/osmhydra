import React from 'react'

export default function Button ({href, onClick, children}) { 
  return <div className="f6 link dim br1 ba bw2 ph3 pv2 mb2 dib dark-green pointer">
  {
      href 
      ? <a href={href}>{children}</a>
      : <div onClick={onClick}>{children}</div>
  }
  </div>
}