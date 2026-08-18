import React, { useState } from "react";
import { Plus, Database, Trash2, Download, ExternalLink, Loader2, Check } from "lucide-react";
import { Repository, InstalledSource } from "@/types";
import { fetchRepository, DEFAULT_REPOSITORIES } from "@/services/repositories";

interface RepositoriesViewProps {
  repos: Repository[];
  sources: InstalledSource[];
  onAddRepo: (repo: Repository) => void;
  onRemoveRepo: (repoId: string) => void;
  onInstallExtension: (repo: Repository, ext: any) => void;
}

export default function RepositoriesView({
  repos,
  sources,
  onAddRepo,
  onRemoveRepo,
  onInstallExtension
}: RepositoriesViewProps) {
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    try {
      setLoading(true);
      setMessage(null);
      const data = await fetchRepository(urlInput.trim());
      onAddRepo(data);
      setUrlInput("");
      setMessage({ text: `Successfully loaded repository "${data.name}" with ${data.extensions.length} extensions.` });
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Failed to load repository.",
        error: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDefault = async (defaultRepo: { name: string; url: string }) => {
    if (repos.some((r) => r.url === defaultRepo.url)) {
      setMessage({ text: `Repository "${defaultRepo.name}" is already added.` });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      const data = await fetchRepository(defaultRepo.url);
      onAddRepo(data);
      setMessage({ text: `Added "${data.name}" successfully.` });
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Failed to add default repository.",
        error: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#f5f5f7]">
          Repositories
        </h1>
        <p className="mt-2 text-sm text-[#86868b]">
          Add extension repositories to discover and install web-compatible anime providers.
        </p>
      </div>

      <div className="space-y-8">
        {/* Add Repository Card */}
        <div className="rounded-2xl bg-zinc-950 border border-white/10 p-6 space-y-4">
          <h3 className="text-base font-semibold text-[#f5f5f7]">Add Extension Repository</h3>

          <form onSubmit={handleAddCustom} className="flex flex-col sm:flex-row gap-3">
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://.../index.min.json"
              className="flex-1 rounded-xl bg-zinc-900 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-[#86868b] outline-none focus:border-white/30"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50 transition"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Add Repository</span>
            </button>
          </form>

          {message && (
            <p className={`text-xs ${message.error ? "text-red-400" : "text-emerald-400"}`}>
              {message.text}
            </p>
          )}

          {/* Quick Add Default Repos */}
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs text-[#86868b] mb-3 font-medium">Recommended Repositories:</p>
            <div className="flex flex-wrap gap-3">
              {DEFAULT_REPOSITORIES.map((def) => {
                const isAdded = repos.some((r) => r.url === def.url);
                return (
                  <button
                    key={def.url}
                    onClick={() => handleAddDefault(def)}
                    disabled={isAdded || loading}
                    className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-medium text-[#f5f5f7] hover:bg-zinc-800 disabled:opacity-50 transition border border-white/5"
                  >
                    <span>{def.name}</span>
                    {isAdded ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Plus className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Installed Repositories list */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-[#f5f5f7]">Installed Repositories ({repos.length})</h3>

          {repos.length === 0 ? (
            <div className="rounded-2xl bg-zinc-950 border border-white/10 p-12 text-center text-[#86868b]">
              <Database className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No repositories added yet.</p>
            </div>
          ) : (
            repos.map((repo) => (
              <div key={repo.id} className="rounded-2xl bg-zinc-950 border border-white/10 p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-base text-[#f5f5f7]">{repo.name}</h4>
                    <p className="mt-1 text-xs text-[#86868b] break-all">{repo.url}</p>
                  </div>

                  <button
                    onClick={() => onRemoveRepo(repo.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/25 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/5">
                  {repo.extensions.map((ext) => {
                    const isInstalled = sources.some((s) => s.id === ext.id);
                    return (
                      <div
                        key={ext.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-zinc-900/60 p-3.5 border border-white/5"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {ext.icon ? (
                            <img src={ext.icon} alt="" className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-[#86868b] flex-shrink-0">
                              <Database className="h-4 w-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h5 className="font-medium text-sm text-[#f5f5f7] truncate">{ext.name}</h5>
                            <p className="text-[11px] text-[#86868b]">
                              {ext.lang || "multi"} • v{ext.version || "1.0"}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => onInstallExtension(repo, ext)}
                          disabled={isInstalled}
                          className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            isInstalled
                              ? "bg-zinc-800 text-[#86868b] cursor-default"
                              : "bg-white text-black hover:bg-white/90 shadow-md"
                          }`}
                        >
                          {isInstalled ? "Installed" : "Install"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
