import { createPublicClient, http, parseAbi } from 'viem'
import { mainnet } from 'viem/chains'
     
const client = createPublicClient({ 
    chain: mainnet, 
    transport: http(), 
})

async function main() {
    var number=await client.getBlockNumber()
    console.log(number)
}
const nftAbi=parseAbi([
    'function ownerOf(uint256 tokenId) view returns (address)',
    'function tokenURI(uint256 tokenId) view returns (string)'

])

const NftContractAddr="0x0483b0dfc6c78062b9e999a82ffb795925381415";
async function getNFTOwner(tokenId) {
    
        const owner=await client.readContract({
            address: "0x0483b0dfc6c78062b9e999a82ffb795925381415",
            abi: nftAbi,
            functionName: 'ownerOf',
            args:[tokenId]
        });
        console.log('持有人：' , owner);

        const tokenURI=await client.readContract({
            address : "0x0483b0dfc6c78062b9e999a82ffb795925381415",
            abi:nftAbi,
            functionName: 'tokenURI',
            args:[tokenId]
        });
        console.log('元数据 URI :',tokenURI);
        let metdata=tokenURI;
        if (tokenURI.startsWith('ipfs://')){
            metdata=tokenURI.replace('ipfs://','https://ipfs.io/ipfs/');
        }
        
        
        const response=await fetch(metdata);
        const finaldata=await response.json();
        
        console.log('元数据是：',finaldata);

    
}
getNFTOwner(79).catch(console.error)