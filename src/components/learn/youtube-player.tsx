"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

import { cn } from "@/lib/cn";

type YouTubePlayerInstance = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
};

type YouTubeApi = {
  Player: new (
    element: HTMLElement,
    options: Record<string, unknown>
  ) => YouTubePlayerInstance;
  PlayerState: { PLAYING: number; ENDED: number; PAUSED: number };
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiReady: Promise<void> | null = null;

function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiReady) return apiReady;

  apiReady = new Promise<void>((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });

  return apiReady;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

export function YouTubePlayer({
  youtubeId,
  title,
}: {
  youtubeId: string;
  title: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const frameRef = useRef<number>(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let cancelled = false;

    loadYouTubeApi().then(() => {
      if (cancelled || !hostRef.current || !window.YT) return;
      playerRef.current = new window.YT.Player(hostRef.current, {
        videoId: youtubeId,
        playerVars: {
          controls: 0,
          modestbranding: 1,
          rel: 0,
          disablekb: 1,
          iv_load_policy: 3,
          playsinline: 1,
          fs: 0,
        },
        events: {
          onReady: (event: { target: YouTubePlayerInstance }) => {
            setDuration(event.target.getDuration());
          },
          onStateChange: (event: { data: number; target: YouTubePlayerInstance }) => {
            const state = window.YT?.PlayerState;
            if (!state) return;
            if (event.data === state.PLAYING) {
              setPlaying(true);
              setStarted(true);
              setDuration(event.target.getDuration());
            } else {
              setPlaying(false);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameRef.current);
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [youtubeId]);

  useEffect(() => {
    if (!playing) return;
    const tick = () => {
      const player = playerRef.current;
      if (player?.getCurrentTime) {
        setCurrent(player.getCurrentTime());
        const total = player.getDuration();
        if (total) setDuration(total);
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [playing]);

  const toggle = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (playing) player.pauseVideo();
    else player.playVideo();
  }, [playing]);

  const seek = useCallback((value: number) => {
    playerRef.current?.seekTo(value, true);
    setCurrent(value);
  }, []);

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-md bg-black">
      <div className="pointer-events-none absolute inset-0">
        <div ref={hostRef} className="size-full" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-black via-black/60 to-transparent" />

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? `Pause ${title}` : `Play ${title}`}
        className={cn(
          "absolute inset-0 z-10 grid place-items-center transition-colors",
          playing ? "bg-transparent" : "bg-black/70"
        )}
      >
        {!playing ? (
          <span className="grid size-16 place-items-center rounded-full bg-white/95 text-ink shadow-float transition-transform group-hover:scale-105">
            <Play className="size-7 translate-x-0.5 fill-current" />
          </span>
        ) : null}
      </button>

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 flex items-center gap-3 bg-gradient-to-t from-black/85 to-transparent px-4 pb-3 pt-8 transition-opacity",
          started ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
        >
          {playing ? (
            <Pause className="size-4 fill-current" />
          ) : (
            <Play className="size-4 translate-x-0.5 fill-current" />
          )}
        </button>

        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={current}
          onChange={(event) => seek(Number(event.target.value))}
          aria-label="Seek"
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          style={{
            background: `linear-gradient(to right, #ffffff ${progress}%, rgba(255,255,255,0.25) ${progress}%)`,
          }}
        />

        <span className="shrink-0 font-mono text-xs tabular-nums text-white/80">
          {formatTime(current)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
