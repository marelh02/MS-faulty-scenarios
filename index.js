import {
  Client,
  AccountId,
  PrivateKey,
  Hbar,
  TransferTransaction,
  TransactionRecordQuery,
  KeyList,
  AccountUpdateTransaction,
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

  // generate a list of keys for the examples (5 here)
  let dummyKeys = [];
  for (let i = 0; i < 5; i++) {
    dummyKeys.push(PrivateKey.generateECDSA());
  }

  let dummyPubKeys=dummyKeys.map(x=>x.publicKey)



  // create a `KeyList` that represents
  const multisigPublicKeys = [...dummyPubKeys.slice(0,3)];
  const multisigPrivateKeys = [...dummyKeys.slice(0,3)];
  const multisigKeyList = new KeyList(multisigPublicKeys, 2);


  // generate an account alias
  const accountAlias = dummyPubKeys[4].toAccountId(0, 0);
  const newAccId = await autoCreateAccount(client,operatorId,operatorKey,accountAlias,50)

  console.log(`The id of the MS account is ${newAccId}`);
  // console.log(`Are they equal? -> ${accountAlias==newAccId}`);

  console.log("Changing the account keyList");
  await changeAccountKey(client,newAccId,multisigKeyList,[dummyKeys[4],...dummyKeys.slice(0,2)]) 
  console.log("Keylist changed");

  //unrequested signer signs
try {
  const l1=[dummyKeys[4],...dummyKeys.slice(0,2)]
  console.log("An unrequested signer signs");
  await hbarTrasnfer(client,newAccId,l1,1,operatorId)
} catch (error) {
  console.log("test 1 failed");
}

  // //unrequested signer signs on behalf of a requested one
  try {
    const l2=[dummyKeys[3],dummyKeys[1]]
  console.log("An unrequested signer signs on behalf of a requested one");
  await hbarTrasnfer(client,newAccId,l2,1,operatorId)
  } catch (error) {
    console.log("test 2 failed");
  }
  

  //a requested signer signs twice on behalf of another requested one
  try {
    const l3=[dummyKeys[1],dummyKeys[1]]
  console.log("a requested signer signs twice on behalf of another requested one");
  await hbarTrasnfer(client,newAccId,l3,1,operatorId)
  } catch (error) {
    console.log("test 3 failed");
  }

  console.log("*** *** The end *** ***");
  process.exit(0);
}

function transactionHashscanUrl(txRecord) {
  const txId = txRecord.transactionId.toString();
  return `https://hashscan.io/testnet/transaction/${txId}`;
}

async function autoCreateAccount(client, operatorId, operatorKey, accountAlias,initialBalance) {
  // create new account from account alias using a `TransferTransaction`, and return the accountId
  const createAccountTx = new TransferTransaction()
    .addHbarTransfer(operatorId, new Hbar(-initialBalance))
    .addHbarTransfer(accountAlias, new Hbar(initialBalance))
    .freezeWith(client);
  const createAccountTxSigned = await createAccountTx.sign(operatorKey);
  const createAccountTxSubmitted = await createAccountTxSigned.execute(client);
  const createAccountTxRecord = await createAccountTxSubmitted.getRecord(
    client
  );
  const createAccountTxRecordWithChildren = await new TransactionRecordQuery()
    .setTransactionId(createAccountTxRecord.transactionId)
    .setIncludeChildren(true)
    .execute(client);
  const multisigAccountId =
    createAccountTxRecordWithChildren?.children[0]?.receipt?.accountId;
  return multisigAccountId;
}

async function changeAccountKey(client,multisigAccountId,newKeylist,signersList) {
  // change the multisig account id then sign with all the private keys in 'signersList'
  let makeMultisigTx = new AccountUpdateTransaction()
    .setAccountId(multisigAccountId)
    .setKey(newKeylist)
    .freezeWith(client);

    let i=1
    signersList.forEach(async signer => {      
      makeMultisigTx = await makeMultisigTx.sign(signer);
      console.log(`Signer No.${i} passed`);
      i=i+1
    });
  
  const makeMultisigTxSubmitted = await makeMultisigTx.execute(
    client
  );
  const makeMultisigTxRecord = await makeMultisigTxSubmitted.getRecord(client);
  console.log(
    "makeMultisigTxRecord",
    transactionHashscanUrl(makeMultisigTxRecord)
  );
}

async function hbarTrasnfer(client,multisigAccountId,signersList,ammount,receiverId){
  // Sign a `TransferTransaction` using both the ED25519 key and ECDSA key,
  // then attempt to execute it
  let transferTx = new TransferTransaction()
    .addHbarTransfer(multisigAccountId, new Hbar(-ammount))
    .addHbarTransfer(receiverId, new Hbar(ammount))
    .freezeWith(client);
    let i=1
    signersList.forEach(async signer => {
      transferTx = await transferTx.sign(signer);
      console.log(`Signer No.${i} passed`);
      i=i+1
    });

  
  const transfer2of2TxSubmitted = await transferTx.execute(
    client
  );
  const transfer2of2TxRecord = await transfer2of2TxSubmitted.getRecord(client);
  console.log(
    "transfer2of2TxRecord",
    transactionHashscanUrl(transfer2of2TxRecord)
  );
}

main();
