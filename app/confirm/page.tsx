export default function ConfirmPage() {
  return (
    <main className="min-h-screen bg-[#050816] px-4 py-10 text-zinc-100">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-[#0b1120]/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">Final step</p>
        <h1 className="mt-2 text-3xl font-semibold">Confirm details</h1>

        <form className="mt-6 space-y-5">
          <div>
            <label htmlFor="wallet" className="mb-2 block text-sm font-medium text-zinc-300">
              Wallet address
            </label>
            <input
              id="wallet"
              type="text"
              placeholder="Paste your wallet address"
              className="w-full rounded-xl border border-white/10 bg-[#0d1528] px-4 py-3 font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white/30"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-300">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-[#0d1528] px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white/30"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#14F195] px-4 py-3 text-sm font-semibold text-[#04130d] transition hover:bg-[#1af7a5]"
          >
            Submit
          </button>
        </form>
      </div>
    </main>
  );
}
