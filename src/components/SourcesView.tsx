import React from "react";
import { Cpu, CheckCircle2, ShieldCheck, Globe } from "lucide-react";
import { InstalledSource } from "@/types";

interface SourcesViewProps {
  sources: InstalledSource[];
  onToggleSource: (sourceId: string) => void;
  onGoToRepositories: () => void;
}

export default function SourcesView({
  sources,
  onToggleSource,
  onGoToRepositories
}: SourcesViewProps) {
  const enabledCount = sources.filter((s) => s.enabled).length;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#f5f5f7]">
          Anime Sources
        </h1>
        <p className="mt-2 text-sm text-[#86868b]">
          Manage authorized web-compatible extension adapters and providers.
        </p>
      </div>

      <div className="space-y-6">
        {/* Status banner */}
        <div className="rounded-2xl bg-zinc-950 border border-white/10 p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#f5f5f7]">
                {enabledCount} of {sources.length} Sources Active
              </h3>
              <p className="text-xs text-[#86868b] mt-0.5">
                Web extension adapters are running sandboxed securely.
              </p>
            </div>
          </div>

          <button
            onClick={onGoToRepositories}
            className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition border border-white/5"
          >
            Add Repositories
          </button>
        </div>

        {/* Sources list */}
        <div className="rounded-2xl bg-zinc-950 border border-white/10 overflow-hidden divide-y divide-white/5">
          {sources.length === 0 ? (
            <div className="p-8 text-center text-[#86868b]">
              <p className="text-sm">No sources installed yet.</p>
              <button
                onClick={onGoToRepositories}
                className="mt-4 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-black"
              >
                Add Repository
              </button>
            </div>
          ) : (
            sources.map((source) => (
              <div key={source.id} className="flex items-center justify-between p-5 hover:bg-white/5 transition">
                <div className="flex items-center gap-4">
                  {source.icon ? (
                    <img src={source.icon} alt="" className="h-12 w-12 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-[#86868b]">
                      <Globe className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-sm text-[#f5f5f7]">{source.name}</h4>
                    <p className="text-xs text-[#86868b] mt-0.5">
                      {source.lang ? source.lang.toUpperCase() : "Multi"} • ID: {source.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    source.enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-[#86868b]"
                  }`}>
                    {source.enabled ? "Enabled" : "Disabled"}
                  </span>
                  <button
                    onClick={() => onToggleSource(source.id)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                      source.enabled
                        ? "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                        : "bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/20"
                    }`}
                  >
                    {source.enabled ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
