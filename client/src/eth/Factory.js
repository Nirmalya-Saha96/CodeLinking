import web3 from "./web3";
import createCamp from "./build/Factory.json"

const address='0xa81c657138d89a54f77Dc5b015Ff7C544aABFbe4'
const abi=createCamp.abi;

export default new web3.eth.Contract(abi,address)
