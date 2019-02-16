import React from 'react'
import App, { Container } from 'next/app'
import Head from 'next/head'

class OSMHydra extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {}

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }

    return { pageProps }
  }

  render () {
    const { Component, pageProps } = this.props

    return (
      <Container>
        <Head>
          <link rel="stylesheet" href="https://unpkg.com/tachyons@4.10.0/css/tachyons.min.css" />
          <link rel="shortcut icon" href="/static/favicon.ico" />
          <link rel="icon" type="image/png" href="/static/favicon.png" />
          <style>{`body { margin: 0; background: #F4F4F4; color: #111 }`}</style>
        </Head>
        <article className="code mw7 ma5">
          <Component {...pageProps} />
        </article>
      </Container>
    )
  }
}

export default OSMHydra