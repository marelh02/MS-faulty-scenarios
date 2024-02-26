import {
    Client,
    AccountId,
    PrivateKey,
    Hbar,
    TransferTransaction,
    TransactionRecordQuery,
    KeyList,
    AccountUpdateTransaction,
    Mnemonic
  } from "@hashgraph/sdk";
  import dotenv from "dotenv";
  
  dotenv.config();
  
  // ensure required environment variables are available
  if (!process.env.OPERATOR_ID || !process.env.OPERATOR_KEY) {
    throw new Error("Must set OPERATOR_ID and OPERATOR_KEY in .env");
  }
  
  // configure client using environment variables
  const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
  const operatorKey = PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY);
  const client = Client.forTestnet().setOperator(operatorId, operatorKey);
  
  //entrypoint for execution of this example (called at the bottom of the file)
  async function main() {
  
    console.log("*** *** Begining the experiments *** ***");

    const mnemo24 = await Mnemonic.generate()
    const mnemo12 = await Mnemonic.generate12()

    console.log("24");
    console.log(mnemo24.toString())

    console.log("12");
    console.log(mnemo12)

    const meinStr=mnemo12.toString()

    const pk=await (await Mnemonic.fromString(meinStr)).toStandardECDSAsecp256k1PrivateKey()
    console.log(pk.toStringRaw());
    console.log(PrivateKey.fromStringECDSA(pk.toStringRaw()).toStringRaw());

    

    console.log("*** *** The end *** ***");
    process.exit(0);
  }
  
  main();
  