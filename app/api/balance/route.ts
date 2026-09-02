import { NextRequest, NextResponse } from "next/server";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { createPublicClient, formatEther, http } from "viem";
import { bsc, mainnet } from "viem/chains";

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;
const SOLANA_ADDRESS_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
const ETH_RPC_URL = process.env.ETH_RPC_URL || "https://ethereum-rpc.publicnode.com";
const BSC_RPC_URL = process.env.BSC_RPC_URL || "https://bsc-rpc.publicnode.com";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address")?.trim() ?? "";
  const chain = searchParams.get("chain") ?? "";
  const requiredAmount = Number(searchParams.get("amount") ?? "");

  if (!address) {
    return NextResponse.json({ error: "Address is required." }, { status: 400 });
  }

  if (chain === "sol") {
    if (!SOLANA_ADDRESS_RE.test(address)) {
      return NextResponse.json(
        { error: "Doesn't look like a valid Solana address." },
        { status: 400 }
      );
    }

    try {
      const connection = new Connection(SOLANA_RPC_URL, "confirmed");
      const publicKey = new PublicKey(address);
      const balance = await Promise.race([
        connection.getBalance(publicKey),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Request timed out")), 8000);
        }),
      ]);

      const balanceValue = Number(balance) / LAMPORTS_PER_SOL;

      if (Number.isFinite(requiredAmount)) {
        return NextResponse.json({
          balance: balanceValue,
          unit: "SOL",
          requiredAmount,
          confirmed: balanceValue >= requiredAmount,
        });
      }

      return NextResponse.json({
        balance: balanceValue,
        unit: "SOL",
      });
    } catch (error) {
      console.error("Solana balance fetch failed", error);
      return NextResponse.json(
        { error: "Could not fetch balance" },
        { status: 502 }
      );
    }
  }

  if (chain === "eth" || chain === "bsc") {
    if (!EVM_ADDRESS_RE.test(address)) {
      return NextResponse.json(
        { error: "Doesn't look like a valid EVM address." },
        { status: 400 }
      );
    }

    const rpcUrl = chain === "eth" ? ETH_RPC_URL : BSC_RPC_URL;
    const selectedChain = chain === "eth" ? mainnet : bsc;

    try {
      const client = createPublicClient({
        chain: selectedChain,
        transport: http(rpcUrl, { timeout: 8000 }),
      });

      const balance = await Promise.race([
        client.getBalance({ address: address as `0x${string}` }),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Request timed out")), 8000);
        }),
      ]);

      const balanceValue = Number(formatEther(balance));

      if (Number.isFinite(requiredAmount)) {
        return NextResponse.json({
          balance: balanceValue,
          unit: chain === "eth" ? "ETH" : "BNB",
          requiredAmount,
          confirmed: balanceValue >= requiredAmount,
        });
      }

      return NextResponse.json({
        balance: balanceValue,
        unit: chain === "eth" ? "ETH" : "BNB",
      });
    } catch (error) {
      console.error(`${chain.toUpperCase()} balance fetch failed`, error);
      return NextResponse.json(
        { error: "Could not fetch balance" },
        { status: 502 }
      );
    }
  }

  return NextResponse.json(
    { error: "Unsupported chain." },
    { status: 400 }
  );
}
