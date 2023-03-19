use foundry_rs::testing::*;

use path::Path;
use std::fs;
use std::sync::Arc;

#[test]
fn test_encrypted_file_exchange() {
    let (mut foundry, _temp_dir) = new_test_foundry();
    let solidity_project = Path::new("contracts\FileExchange.sol");

    let abi_str = fs::read_to_string(solidity_project.join("abi.json")).unwrap();
    let abi = Arc::new(serde_json::from_str::<ethabi::Contract>(&abi_str).unwrap());

    let bytecode = fs::read(solidity_project.join("bytecode.bin")).unwrap();

    let seller = foundry.new_account();
    let buyer = foundry.new_account();

    // Deploy the PaymentToken contract
    let payment_token = foundry.deploy_contract(&abi, bytecode.clone(), &seller);

    // Deploy the EncryptedFileExchange contract
    let encrypted_file = "dummy_encrypted_file".as_bytes().to_vec();
    let encrypted_address = "dummy_encrypted_address".as_bytes().to_vec();

    let encrypted_file_exchange = foundry.deploy_contract(
        &abi,
        bytecode,
        &seller,
        payment_token.address(),
        seller.address(),
        encrypted_file.clone(),
        encrypted_address.clone(),
    );

    // Test some EncryptedFileExchange contract functionality
    let is_buyer_confirmed: bool = encrypted_file_exchange.call("isBuyerConfirmed", &[]);
    assert_eq!(is_buyer_confirmed, false);

    let is_seller_confirmed: bool = encrypted_file_exchange.call("isSellerConfirmed", &[]);
    assert_eq!(is_seller_confirmed, false);

    // Add more tests here...
}
