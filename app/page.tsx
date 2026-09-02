"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ChainKey = "sol" | "eth" | "bsc";

type ResultState = {
  chain: ChainKey;
  address: string;
  balance: string | null;
  unit: string;
  loading: boolean;
  error: string | null;
};

const EVM_RE = /^0x[a-fA-F0-9]{40}$/;
const SOLANA_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const VALID_CODES = [
  "X7K9-MP4Q-2V8L",
  "A9F2-K7XQ-8M4P",
  "N4Z8-RQ2K-7X5M",
  "P6W3-9KXA-4Q8V",
];

const chainStyles = {
  sol: { label: "Solana", color: "#14F195", dot: "bg-[#14F195]" },
  eth: { label: "Ethereum", color: "#7C93F0", dot: "bg-[#7C93F0]" },
  bsc: { label: "BNB Smart Chain", color: "#F0B90B", dot: "bg-[#F0B90B]" },
} as const;

const shortenAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

const getInitialResults = (address: string): ResultState[] => {
  if (EVM_RE.test(address)) {
    return [
      { chain: "eth", address, balance: null, unit: "ETH", loading: true, error: null },
      { chain: "bsc", address, balance: null, unit: "BNB", loading: true, error: null },
    ];
  }

  if (SOLANA_RE.test(address)) {
    return [
      { chain: "sol", address, balance: null, unit: "SOL", loading: true, error: null },
    ];
  }

  return [];
};

export default function Home() {
  const [activationCode, setActivationCode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [address, setAddress] = useState("");
  const [results, setResults] = useState<ResultState[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasResults = results.length > 0;
  const normalizedAddress = useMemo(() => address.trim(), [address]);
  const selectedResult =
    results.find((result) => !result.loading && !result.error && result.balance !== null) ??
    results[0];
  const depositChain = EVM_RE.test(normalizedAddress)
    ? "eth"
    : SOLANA_RE.test(normalizedAddress)
      ? "sol"
      : selectedResult?.chain ?? "eth";
  const depositValue = Number(selectedResult?.balance ?? 0) * 0.015;
  const canProceed = Boolean(selectedResult && !selectedResult.loading && !selectedResult.error && selectedResult.balance !== null);

  const handleActivation = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedCode = activationCode.trim();

    if (VALID_CODES.includes(trimmedCode)) {
      setIsUnlocked(true);
      setError("");
      return;
    }

    setError("Invalid activation code.");
    setIsUnlocked(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = normalizedAddress;

    if (!trimmed) {
      setResults([]);
      setError("Doesn't look like a valid Solana or EVM address.");
      return;
    }

    const isEvm = EVM_RE.test(trimmed);
    const isSolana = SOLANA_RE.test(trimmed);

    if (!isEvm && !isSolana) {
      setResults([]);
      setError("Doesn't look like a valid Solana or EVM address.");
      return;
    }

    const nextResults = getInitialResults(trimmed);
    setResults(nextResults);
    setError("");
    setIsSubmitting(true);

    try {
      const requests = nextResults.map(async (result) => {
        try {
          const response = await fetch(
            `/api/balance?address=${encodeURIComponent(trimmed)}&chain=${result.chain}`
          );

          if (!response.ok) {
            throw new Error("Could not fetch balance");
          }

          const payload = (await response.json()) as { balance?: number; unit?: string; error?: string };

          if (typeof payload.balance !== "number" || Number.isNaN(payload.balance)) {
            throw new Error(payload.error || "Could not fetch balance");
          }

          setResults((current) =>
            current.map((item) =>
              item.chain === result.chain
                ? {
                    ...item,
                    balance: payload.balance?.toFixed(6) ?? "0.000000",
                    unit: payload.unit ?? item.unit,
                    loading: false,
                    error: null,
                  }
                : item
            )
          );
        } catch {
          setResults((current) =>
            current.map((item) =>
              item.chain === result.chain
                ? { ...item, loading: false, error: "Could not fetch balance", balance: null }
                : item
            )
          );
        }
      });

      await Promise.all(requests);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isUnlocked) {
    return (
      <main className="min-h-screen bg-[#050816] px-4 py-10 text-zinc-100">
        <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-[#0b1120]/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Activation required</p>
          <h1 className="mt-3 text-3xl font-semibold">Locked</h1>

          <form onSubmit={handleActivation} className="mt-6 space-y-4">
            <label htmlFor="activation" className="block text-sm font-medium text-zinc-300">
              Enter activation code
            </label>
            <input
              id="activation"
              value={activationCode}
              onChange={(event) => setActivationCode(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0d1528] px-4 py-3 font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-white/30"
              placeholder="XXXX-XXXX-XXXX"
              spellCheck={false}
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#050816] transition hover:bg-zinc-200"
            >
              Confirm activation
            </button>
          </form>

          {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-10 text-zinc-100">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-white/10 bg-[#0b1120]/80 p-6 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-400">Wallet checker</p>
              <h1 className="mt-2 text-3xl font-semibold">Balance Lookup</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-zinc-300" htmlFor="address">
              Wallet address
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0d1528] px-4 py-3 font-mono text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-white/30"
                placeholder="Paste a Solana or EVM wallet address"
                spellCheck={false}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#050816] transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Checking…" : "Submit"}
              </button>
            </div>
          </form>

          {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

          <div className="mt-6 space-y-3">
            {!hasResults && !error && !isSubmitting ? (
              <p className="rounded-xl border border-dashed border-white/10 bg-white/2 px-4 py-8 text-sm text-zinc-400">
                Enter a wallet address to check balances.
              </p>
            ) : null}

            {results.map((result) => {
              const style = chainStyles[result.chain];

              return (
                <div
                  key={result.chain}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0d1528] px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-200">{style.label}</p>
                      <p className="font-mono text-xs text-zinc-400">{shortenAddress(result.address)}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    {result.loading ? (
                      <p className="font-mono text-sm text-zinc-400">checking…</p>
                    ) : result.error ? (
                      <p className="font-mono text-sm text-red-400">{result.error}</p>
                    ) : (
                      <p className="font-mono text-sm text-zinc-100">
                        {result.balance} {result.unit}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {canProceed ? (
              <div className="pt-2">
                <Link
                  href={`/deposit?chain=${depositChain}&balance=${encodeURIComponent(String(selectedResult?.balance ?? 0))}&amount=${encodeURIComponent(String(depositValue))}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#14F195] px-4 py-3 text-sm font-semibold text-[#04130d] transition hover:bg-[#1af7a5]"
                >
                  Proceed
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
