import React from 'react'

export default function SimpleQuote(props: any) {
  const { block } = props;
  return (
  <h1 style={{direction: 'rtl'}}> {block.getText()}</h1>
  )
}
