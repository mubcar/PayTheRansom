import * as aesjs from "aes-js";

export function encryptFile(file, publicKey) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const fileData = new Uint8Array(event.target.result);
      const encryptedFile = encryptWithPublicKey(fileData, publicKey);
      resolve(encryptedFile);
    };
    reader.onerror = function (event) {
      reject(event);
    };
    reader.readAsArrayBuffer(file);
  });
}

export function decryptFile(encryptedFile, privateKey) {
  const decryptedFile = decryptWithPrivateKey(encryptedFile, privateKey);
  return decryptedFile;
}

function encryptWithPublicKey(data, publicKey) {
  const key = publicKey.slice(0, 32);
  const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
  const encryptedData = aesCtr.encrypt(data);
  return encryptedData;
}

function decryptWithPrivateKey(encryptedData, privateKey) {
  const key = privateKey.slice(0, 32);
  const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
  const decryptedData = aesCtr.decrypt(encryptedData);
  return decryptedData;
}
