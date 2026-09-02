"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const wallets = {
  eth: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  bnb: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
  sol: "3xQvM5Wk3mZnyMZV8zk1L6yYp8dF8dG9FQ7H5u3J4J9Q",
};

const chainMeta = {
  eth: { label: "Ethereum", color: "text-[#7C93F0]" },
  bnb: { label: "BNB Smart Chain", color: "text-[#F0B90B]" },
  sol: { label: "Solana", color: "text-[#14F195]" },
} as const;

function DepositPageContent() {
  const searchParams = useSearchParams();
  const chain = (searchParams.get("chain") as keyof typeof wallets) ?? "eth";
  const balance = Number(searchParams.get("balance") ?? "0");
  const amount = Number(searchParams.get("amount") ?? "0");
  const wallet = wallets[chain] ?? wallets.eth;
  const meta = chainMeta[chain] ?? chainMeta.eth;

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-10 text-zinc-100">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#0b1120]/80 p-6 shadow-2xl shadow-black/30 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.22em] text-zinc-400">Deposit</p>
        <h1 className="mt-2 text-3xl font-semibold">Send to the {meta.label} wallet</h1>

        <div className="mt-6 rounded-xl border border-white/10 bg-[#0d1528] p-4">
          <p className="text-sm font-medium text-zinc-400">This is the {amount.toFixed(6)} {chain === "sol" ? "SOL" : chain === "eth" ? "ETH" : "BNB"}</p>
          <p className="mt-4 text-sm text-zinc-300">
            Detected balance: <span className="font-mono text-zinc-100">{balance.toFixed(6)}</span>
          </p>
          <p className={`mt-4 text-sm font-medium ${meta.color}`}>{meta.label}</p>
          <p className="mt-2 font-mono text-xs text-zinc-300">{wallet}</p>
        </div>
      </div>
    </main>
  );
}

export default function DepositPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050816] px-4 py-10 text-zinc-100">Loading...</div>}>
      <DepositPageContent />
    </Suspense>
  );
}
