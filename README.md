# Multi-sig faulty scenarios experiments

### Important notes

- Get the MS account number Id from the receipt in the auto creation Tx.  
- About keylist rotation: If keypair A was used to generate an account alias, then we want to set the new keylist with the pub key of B, C and D, then A, B, C and D need to sign with their priv key, else you get invalid signature error. (if you want to generate an alias from a keypair, that same keypair needs to sign when changing the keylist).  
- When changing the key with a key list with a threshold less than the number of the keys in the list, the threshold still applies in the change Tx signature, but the keypair that generated the alias needs to sign.  
- Whenever you do something wrong with signatures, everything appears to be fine, but when you execute the transaction you get the following error: ReceiptStatusError: receipt for transaction 0.0.1477@1707212617.356107471 contained error status INVALID_SIGNATURE.  
- Whith or without a threshold, the following still applies

Here are some faulty scenarios:

## what happens when an unrequested signer signs along with the requested ones?

The transaction gets executed normally

## what happens when an unrequested signer signs on behalf of a requested one?

invalid signature error

## what happens when a requested signer signs twice on behalf of another requested one?

invalid signature error  
