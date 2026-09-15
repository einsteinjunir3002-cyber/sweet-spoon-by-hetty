'use client'

export function AnnouncementBar({ text }: { text: string }) {
  return (
    <div className="announcement-bar" role="banner" aria-live="polite">
      <div className="container">
        <p>{text}</p>
      </div>
    </div>
  )
}
