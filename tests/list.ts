import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import idl from "../target/idl/whiteven.json";

const PROGRAM_ID = new PublicKey(
  "CVDGd5GQ1NkKFWogGjg4LcmibPhDf9URu177YkZYYeNi"
);

type PartyRow = {
  name: string;
  index: string;
  partyPda: string;
  voteCount: string;
};

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = new Program(idl as anchor.Idl, provider);

  const [counterPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter")],
    PROGRAM_ID
  );

  const counterInfo = await provider.connection.getAccountInfo(counterPda);

  if (!counterInfo) {
    console.log("No party created yet.");
    return;
  }

  const counterAccountClient =
    (program.account as any)["PartyCounter"] ??
    (program.account as any)["partyCounter"] ??
    (program.account as any)["counter"];

  if (!counterAccountClient) {
    throw new Error("Cannot find PartyCounter account client in IDL");
  }

  const partyAccountClient =
    (program.account as any)["Party"] ??
    (program.account as any)["party"];

  if (!partyAccountClient) {
    throw new Error("Cannot find Party account client in IDL");
  }

  const counterData = await counterAccountClient.fetch(counterPda);
  const nextIndex = Number(counterData.nextIndex.toString());

  const rows: PartyRow[] = [];

  for (let i = 0; i < nextIndex; i++) {
    const indexBn = new anchor.BN(i);

    const [partyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("party"), indexBn.toArrayLike(Buffer, "le", 8)],
      PROGRAM_ID
    );

    const partyInfo = await provider.connection.getAccountInfo(partyPda);
    if (!partyInfo) continue;

    const party = await partyAccountClient.fetch(partyPda);

    rows.push({
      name: party.name,
      index: party.index.toString(),
      partyPda: partyPda.toBase58(),
      voteCount: party.voteCount.toString(),
    });
  }

  rows.sort((a, b) => {
    const voteDiff = Number(b.voteCount) - Number(a.voteCount);
    if (voteDiff !== 0) return voteDiff;
    return Number(a.index) - Number(b.index);
  });

  if (rows.length === 0) {
    console.table([]);
    return;
  }

  console.table(
    rows.map((row, idx) => ({
      Rank: idx + 1,
      Name: row.name,
      Index: row.index,
      PartyPDA: row.partyPda,
      VoteCount: row.voteCount,
    }))
  );}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});