/**
 * The strip above the header: a few short promises, dot separated.
 *
 * Not sticky. It says its piece at the top of the page and then gets out of
 * the way — a line that follows you down the screen is an advert.
 */
export default function AnnouncementBar({ messages }: { messages: string[] }) {
  return (
    <div className="announce">
      <p className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-5 py-2.5 md:px-16">
        {messages.map((message, i) => (
          <span key={message} className="flex items-center gap-3">
            {i > 0 && (
              <span aria-hidden="true" className="announce-dot">
                ·
              </span>
            )}
            {message}
          </span>
        ))}
      </p>
    </div>
  );
}
