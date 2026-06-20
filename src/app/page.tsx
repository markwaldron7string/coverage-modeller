import { ModellerWorkspace } from "@/components/ModellerWorkspace";
import { UrlStateSync } from "@/components/UrlStateSync";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <UrlStateSync />
      <header className="mx-auto w-full max-w-5xl px-4 pt-8 sm:px-6 lg:pt-12">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Coverage Modeller
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Configure an auto policy and see what you&rsquo;d actually pay out of
          pocket across different claim scenarios &mdash; in real time.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        <ModellerWorkspace />
      </main>
    </div>
  );
}