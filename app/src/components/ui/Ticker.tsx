import { Fragment } from 'react'

/** Infinite marquee strip. Content is duplicated so the loop is seamless. */
export function Ticker({ items }: { items: string[] }) {
  const row = (key: string) => (
    <Fragment key={key}>
      {items.map((item, i) => (
        <span key={`${key}-${i}`} className="inline-flex items-center gap-8">
          <span>{item}</span>
          <span className="text-brand" aria-hidden>
            ◎
          </span>
        </span>
      ))}
    </Fragment>
  )
  return (
    <div className="ticker" aria-hidden>
      <div className="ticker-track">
        {row('a')}
        {row('b')}
      </div>
    </div>
  )
}
