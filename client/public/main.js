const { ethers } = require('ethers');
const foundry = require('foundry-js');
const AES = require('aes-js');

// Define some constants
const CONTRACT_ADDRESS = '0x123...'; // Replace with your contract address
const ABI = []; // Replace with your contract ABI

// Initialize the contract instance
const provider = new ethers.providers.Web3Provider(window.ethereum);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

// Define some helper functions
async function uploadFileToWebsite(file) {
  const fileUrl = await foundry.uploadFile(file);
  return fileUrl;
}

async function encryptData(data, publicKey) {
  const encryptedData = AES.encrypt(data, publicKey).toString();
  return encryptedData;
}

async function decryptData(data, privateKey) {
  const decryptedData = AES.decrypt(data, privateKey).toString(AES.enc.Utf8);
  return decryptedData;
}

async function signTransaction(transaction) {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const signer = provider.getSigner(accounts[0]);
  const signedTransaction = await signer.signTransaction(transaction);
  return signedTransaction;
}

// Define the sell function
async function sellTokens() {
  try {
    const fileInput = document.getElementById("fileToEncrypt");
    const file = fileInput.files[0];
    const price = document.getElementById("price").value;
    const buyerPublicKey = document.getElementById("buyerPublicKey").value;

    if (!file || !price || !buyerPublicKey) {
      alert("Please fill in all fields");
      return;
    }

    // Upload the file to the website
    const fileUrl = await uploadFileToWebsite(file);

    // Encrypt the price and file URL using AES.js and the buyer's public key
    const encryptedPrice = await encryptData(price, buyerPublicKey);
    const encryptedFileUrl = await encryptData(fileUrl, buyerPublicKey);

    // Call the smart contract function to make an offer
    await contract.makeOffer(encryptedPrice, encryptedFileUrl);

    // Update the UI to reflect that the offer was made
    const message = document.getElementById('sellerMessage');
    message.textContent = 'Offer made successfully!';
  } catch (error) {
    console.error(error);
    alert("An error occurred while selling tokens");
  }
}

// Define the buy function
async function buyTokens() {
  // Get the buyer address and public key from the form inputs
  const buyerAddress = document.getElementById('buyerAddress').value;
  const buyerPublicKey = document.getElementById('buyerPublicKey').value;

  // Check if there is an offer made by the seller to the buyer's public key
  const offer = await contract.getOffer(buyerPublicKey);

  if (offer !== null) {
    // Decrypt the encrypted price and file URL using the buyer's private key
    const privateKey = await signTransaction();
    const decryptedPrice = await decryptData(offer.price, privateKey);
    const decryptedFileUrl = await decryptData(offer.fileUrl, privateKey);

    // Update the UI with decrypted price and file URL
    document.getElementById('decryptedPrice').textContent = `Price: ${decryptedPrice} ETH`;
    document.getElementById('decryptedFileUrl').href = decryptedFileUrl;
    document.getElementById('decryptedFileUrl').textContent = 'Download file';

    // Handle the confirm payment button click event
    document.getElementById('confirmPaymentButton').onclick = async () => {
      // Call the smart contract function to confirm payment
      await contract.confirmPayment(buyerAddress, decryptedPrice);

      // Update the UI to reflect that the payment was confirmed
      alert('Payment confirmed successfully!');
    };
  } else {
    // If there is no offer, show the no offers message
    const noOffersMessage = document.createElement('div');
    noOffersMessage.textContent = 'No offers made yet';
    document.body.appendChild(noOffersMessage);
  }
}

// Add event listener to sell button
document.getElementById('sellButton').addEventListener('click', sellTokens);

// Add event listener to buy button
document.getElementById('buyButton').addEventListener('click', buyTokens);
