import React, { useState } from "react";
import { Monitor, Sliders, Shield, Info, Check, Volume2, Globe } from "lucide-react";

export default function SettingsView() {
  const [autoplay, setAutoplay] = useState(true);
  const [quality, setQuality] = useState("1080p");
  const [subtitles, setSubtitles] = useState("English");
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#f5f5f7]">
          Settings
        </h1>
        <p className="mt-2 text-sm text-[#86868b]">
          Configure player behavior, appearance, and system preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Playback Section */}
        <div className="rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2 text-sm font-semibold text-[#f5f5f7]">
            <Sliders className="h-4 w-4 text-blue-400" />
            Playback & Streaming
          </div>

          <div className="divide-y divide-white/5">
            <div className="flex items-center justify-between p-6">
              <div>
                <h4 className="font-medium text-sm text-[#f5f5f7]">Autoplay Next Episode</h4>
                <p className="text-xs text-[#86868b] mt-0.5">Automatically play next episode upon countdown completion</p>
              </div>
              <button
                onClick={() => {
                  setAutoplay(!autoplay);
                  handleSave();
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoplay ? "bg-blue-600" : "bg-zinc-800"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoplay ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-6">
              <div>
                <h4 className="font-medium text-sm text-[#f5f5f7]">Preferred Quality</h4>
                <p className="text-xs text-[#86868b] mt-0.5">Default video playback stream resolution</p>
              </div>
              <select
                value={quality}
                onChange={(e) => {
                  setQuality(e.target.value);
                  handleSave();
                }}
                className="rounded-xl bg-zinc-900 border border-white/10 px-3 py-2 text-xs font-medium text-white outline-none"
              >
                <option value="1080p">1080p Full HD</option>
                <option value="720p">720p HD</option>
                <option value="480p">480p SD</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-6">
              <div>
                <h4 className="font-medium text-sm text-[#f5f5f7]">Preferred Subtitles</h4>
                <p className="text-xs text-[#86868b] mt-0.5">Default subtitle language track</p>
              </div>
              <select
                value={subtitles}
                onChange={(e) => {
                  setSubtitles(e.target.value);
                  handleSave();
                }}
                className="rounded-xl bg-zinc-900 border border-white/10 px-3 py-2 text-xs font-medium text-white outline-none"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="Japanese">Japanese (Original)</option>
                <option value="Off">Off</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2 text-sm font-semibold text-[#f5f5f7]">
            <Monitor className="h-4 w-4 text-purple-400" />
            Appearance & Interface
          </div>

          <div className="p-6 flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm text-[#f5f5f7]">tvOS Cinematic Theme</h4>
              <p className="text-xs text-[#86868b] mt-0.5">Apple TV restrained dark aesthetic with frosted blur glass</p>
            </div>
            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
              Active
            </span>
          </div>
        </div>

        {/* About Section */}
        <div className="rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2 text-sm font-semibold text-[#f5f5f7]">
            <Info className="h-4 w-4 text-emerald-400" />
            About AniStream
          </div>

          <div className="p-6 space-y-3 text-xs text-[#86868b]">
            <div className="flex justify-between">
              <span>Version</span>
              <span className="text-[#f5f5f7] font-medium">tvOS 19.4 (Build 22F72)</span>
            </div>
            <div className="flex justify-between">
              <span>Metadata Provider</span>
              <span className="text-[#f5f5f7] font-medium">AniList GraphQL API</span>
            </div>
            <div className="flex justify-between">
              <span>Repository Engine</span>
              <span className="text-[#f5f5f7] font-medium">Web Extension Sandboxed Router</span>
            </div>
          </div>
        </div>

        {savedMessage && (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-400 border border-emerald-500/20 animate-fadeIn">
            <Check className="h-4 w-4" />
            Settings updated successfully.
          </div>
        )}
      </div>
    </main>
  );
}
