const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const compiledcreatecamp=require("./build/Factory.json");

const mnemonicPhrase = "prize verify carpet deposit game round burden cabin general boil topic world"; // 12 word mnemonic
let provider = new HDWalletProvider(mnemonicPhrase,'https://sepolia.infura.io/v3/f1d01d7f78944663887a954faa97cbec');

const web3= new Web3(provider);

let address;

const deploy=async()=>{
    //get all address;
    address=await web3.eth.getAccounts();
    //instance of deployble contract;
    const campaignInstance=new web3.eth.Contract(compiledcreatecamp.abi);
    //deploy contract to rinckby net work
    const campaign=await campaignInstance.deploy({data:compiledcreatecamp.evm.bytecode.object}).send({
        from: address[0],
        gass:'1000000'
    });
    
    
    console.log(campaign.options.address)
    //0x6236042ee595e0f410FfC8A4264F31A055A56116
}

deploy();