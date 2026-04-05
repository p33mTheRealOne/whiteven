import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import idl from "../target/idl/whiteven.json";

const PROGRAM_ID = new PublicKey(
  "CVDGd5GQ1NkKFWogGjg4LcmibPhDf9URu177YkZYYeNi"
);

async function main() {
  const partyName = process.argv[2];

  if (!partyName) {
    throw new Error('Usage: npx ts-node tests/create.ts "Party Name"');
  }

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = new Program(idl as anchor.Idl, provider);

  const authority = provider.wallet;

  const [counterPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter")],
    PROGRAM_ID
  );

  let nextIndex = new anchor.BN(0);

  const counterInfo = await provider.connection.getAccountInfo(counterPda);

  if (counterInfo) {
    const counterAccountClient =
      (program.account as any)["PartyCounter"] ??
      (program.account as any)["partyCounter"] ??
      (program.account as any)["counter"];

    if (!counterAccountClient) {
      throw new Error("Cannot find PartyCounter account client in IDL");
    }

    const counterData = await counterAccountClient.fetch(counterPda);
    nextIndex = new anchor.BN(counterData.nextIndex.toString());
  }

  const [partyPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("party"), nextIndex.toArrayLike(Buffer, "le", 8)],
    PROGRAM_ID
  );

  const tx = await (program.methods as any)
    .createParty(partyName)
    .accountsPartial({
      authority: authority.publicKey,
      counter: counterPda,
      party: partyPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log("Created party successfully");
  console.log("Name:", partyName);
  console.log("Index:", nextIndex.toString());
  console.log("Counter PDA:", counterPda.toBase58());
  console.log("Party PDA:", partyPda.toBase58());
  console.log("Tx:", tx);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});