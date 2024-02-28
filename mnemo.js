import {
    Client,
    AccountId,
    PrivateKey,
    Signer,
    Hbar,
    TransferTransaction,
    TransactionRecordQuery,
    KeyList,
    AccountUpdateTransaction,
    PublicKey,
    Key,
    AccountInfoQuery,
    Mnemonic,
    AccountCreateTransaction
  } from "@hashgraph/sdk";

// Generates a mnemonic phrase of the specified length (12 or 24 only)
async function generateMnemo(len) {
    if (len !== 12 && len !== 24) {
      throw new Error("Invalid mnemonic phrase length. Only 12 or 24 are supported.");
    }
    return len === 12 ? await Mnemonic.generate12() : await Mnemonic.generate();
  }

  // Generates a mnemonic phrase, converts it to a private key, stores it securely, and returns the mnemonic list
  async function generateMnemonicPhraseList(len) {
    const m = await generateMnemo(len);
    const pk = await m.toStandardECDSAsecp256k1PrivateKey();
    return pk.toStringRaw()
  }
  
  // Generates a "disrupted" version of a mnemonic phrase list for testing
  function generateMnemoTestList(list) {
    const newList = list.slice(); // Create a copy
    const disrp12 = [3, 6, 9, 10];
    const disrp24 = [2, 8, 13, 15, 19, 22];
    if (newList.length === 12) {
      disrp12.forEach((i) => (newList[i] = undefined));
    } else if (newList.length === 24) {
      disrp24.forEach((i) => (newList[i] = undefined));
    } else {
      throw new Error("Your mnemonic array is invalid!");
    }
    return newList;
  }
  
  // Compares two mnemonic phrase lists and checks if they match
  function testMnemoLists(mnemoList, testList) {
    return mnemoList.join() === testList.join();
  }

  async function createAccount(pks){
    const pubKey=PrivateKey.fromStringECDSA(pks).publicKey.toStringRaw()
    if (pubKey){
      const res = await fetch("http://localhost:3000/sign-and-execute",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "data":pubKey
        })
      }).then(x=>x.json())
    console.log("Response is: ",res);
    }else{
      throw new Error("Failed to create account, no key on this device");
    }
  }

  async function main() {
    console.log("*** Start ***");
    let x=await generateMnemonicPhraseList(24)

    console.log("x is ",x);
    await createAccount(x)

    console.log("*** Success ***");
  }

  main()
  