"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

const wallets = {
  eth: "0x120D139dB706614f71e470A97852679F6FaebcB7",
  bnb: "0x120D139dB706614f71e470A97852679F6FaebcB7",
  sol: "X2ro74HaRbZ2XKDJ57yMmsKFD3CS4y9XFKtzSeQkCQ1",
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
  const symbol = chain === "sol" ? "SOL" : chain === "eth" ? "ETH" : "BNB";
  const [checking, setChecking] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [message, setMessage] = useState("Waiting for transfer confirmation.");

  const handleConfirmTransfer = async () => {
    setChecking(true);
    setMessage("Checking your transfer...");

    try {
      const response = await fetch(
        `/api/balance?address=${encodeURIComponent(wallet)}&chain=${chain}&amount=${encodeURIComponent(String(amount))}`
      );

      const payload = (await response.json()) as {
        confirmed?: boolean;
        balance?: number;
        unit?: string;
        error?: string;
      };

      if (!response.ok || typeof payload.confirmed !== "boolean") {
        throw new Error(payload.error || "Could not verify transfer");
      }

      if (payload.confirmed) {
        setIsConfirmed(true);
        setMessage("Deposit confirmed. You can continue.");
      } else {
        setIsConfirmed(false);
        setMessage(`Not detected yet. Current balance: ${payload.balance ?? 0} ${payload.unit ?? symbol}.`);
      }
    } catch {
      setIsConfirmed(false);
      setMessage("Could not verify transfer right now. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-10 text-zinc-100">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-[#0b1120]/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">Wallet deposit</p>
            <h1 className="mt-2 text-3xl font-semibold">Deposit {meta.label}</h1>
          </div>
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/10 ${
              chain === "eth"
                ? "bg-[#7C93F0]/15 text-[#7C93F0]"
                : chain === "bnb"
                  ? "bg-[#F0B90B]/15 text-[#F0B90B]"
                  : "bg-[#14F195]/15 text-[#14F195]"
            }`}
          >
            {symbol.slice(0, 1)}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0d1528] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Deposit amount</p>
              <p className="mt-2 text-3xl font-semibold font-mono text-white">{amount.toFixed(6)} {symbol}</p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/3 px-3 py-1.5 text-xs font-medium text-zinc-300">
              {meta.label}
            </div>
          </div>

          <div className="mt-5 h-px w-full bg-white/10" />

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Wallet</p>
              <p className="mt-2 font-mono text-sm break-all text-zinc-200">{wallet}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Detected balance</p>
              <p className="mt-2 font-mono text-lg text-zinc-100">{balance.toFixed(6)} {symbol}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-black/10 p-4">
          <p className="text-sm font-medium text-zinc-300">Send exactly this amount to the wallet above.</p>
          <p className="mt-2 text-sm text-zinc-400">
            This is the <span className="font-mono text-white">{amount.toFixed(6)} {symbol}</span> deposit required for your order.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleConfirmTransfer}
            disabled={checking}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#050816] transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {checking ? "Checking transfer..." : "I have made the transfer"}
          </button>

          <button
            type="button"
            disabled={!isConfirmed}
            onClick={() => {
              window.location.href = "/confirm";
            }}
            className="w-full rounded-xl border border-[#14F195]/50 bg-[#14F195]/10 px-4 py-3 text-sm font-semibold text-[#14F195] transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            Proceed
          </button>

          <p className="text-center text-sm text-zinc-300">{message}</p>
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
