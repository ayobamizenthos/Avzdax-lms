"use client";

import { useState } from "react";
import { Play } from "lucide-react";

export function YouTubePlayer({
  youtubeId,
  title,
}: {
  youtubeId: string;
  title: string;
}) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="size-full"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setActive(true)}
      className="group relative block aspect-video w-full overflow-hidden rounded-md bg-black"
      aria-label={`Play ${title}`}
    >
      <img
        src={`https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`}
        alt={title}
        className="size-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
        onError={(event) => {
          event.currentTarget.src = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
        }}
      />
      <span className="absolute inset-0 grid place-items-center bg-gradient-to-t from-black/40 to-transparent">
        <span className="grid size-16 place-items-center rounded-full bg-white/95 text-brand shadow-float transition-transform group-hover:scale-105">
          <Play className="size-7 translate-x-0.5 fill-current" />
        </span>
      </span>
    </button>
  );
}
