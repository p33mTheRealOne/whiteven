import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import idl from "../target/idl/whiteven.json";

const PROGRAM_ID = new PublicKey(
  "CVDGd5GQ1NkKFWogGjg4LcmibPhDf9URu177YkZYYeNi"
);

async function main() {
  const indexArg = process.argv[2];

  if (!indexArg) {
    throw new Error("Usage: npx ts-node tests/vote.ts <party_index>");
  }

  const partyIndex = new anchor.BN(indexArg);

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = new Program(idl as anchor.Idl, provider);
  const voter = provider.wallet;

  const [partyPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("party"), partyIndex.toArrayLike(Buffer, "le", 8)],
    PROGRAM_ID
  );

  const [voterRecordPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vote"), partyPda.toBuffer(), voter.publicKey.toBuffer()],
    PROGRAM_ID
  );

  const tx = await (program.methods as any)
    .voteParty(partyIndex)
    .accountsPartial({
      voter: voter.publicKey,
      party: partyPda,
      voterRecord: voterRecordPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const partyAccountClient =
    (program.account as any)["Party"] ??
    (program.account as any)["party"];

  if (!partyAccountClient) {
    throw new Error("Cannot find Party account client in IDL");
  }

  const partyAccount = await partyAccountClient.fetch(partyPda);

  console.log("Voted successfully");
  console.log("Party index:", partyIndex.toString());
  console.log("Party PDA:", partyPda.toBase58());
  console.log("Vote count:", partyAccount.voteCount.toString());
  console.log("Tx:", tx);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});