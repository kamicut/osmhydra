import React from 'react'

export default function Button ({href, onClick, children}) { 
  const commonStyle = "f6 link dim br1 ba bw2 ph3 pv2 mb2 dib dark-green pointer"
  if (href) {
    return <a href={href} className={`link dark-green ${commonStyle}`}>{children}</a>
  }
  return <div onClick={onClick} className={commonStyle}>{children}</div>
}