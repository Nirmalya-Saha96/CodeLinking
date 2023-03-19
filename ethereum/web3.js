import Web3 from "web3";


let web3;

if( typeof window !== "undefined" && typeof window.web3 !== "undefined"){
   //in the browser and using metamask get provider
   web3=new Web3(window.web3.currentProvider);
}
else{
  //user not using metamask
  const provider=new Web3.providers.HttpProvider(
      'https://sepolia.infura.io/v3/f1d01d7f78944663887a954faa97cbec',
  )
  web3=new Web3(provider);
}


export default web3;