import { createPublicClient, http, formatUnits } from 'viem';
import { mainnet } from 'viem/chains';

// 配置 Viem 客户端
const client = createPublicClient({
  chain: mainnet,
  transport: http(), 
});


//采集并打印usdt 转账信息

const USDT_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const USDT_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
    name: 'Transfer',
    type: 'event',
  },
];

async function listenUSDTransfer(){

    console.log('Starting to listen for USDT transfers...');
    
    const unwatch=client.watchContractEvent({
        address: USDT_ADDRESS,
        abi: USDT_ABI,
        event: 'Transfer',
        onLogs: (logs) => {
    
            logs.forEach((log) => {
            const { from, to, value } = log.args;
            const valueInUSDT = formatUnits(value, 6); 
            const txHash = log.transactionHash; 
            const blockNumber= log.blockNumber;
            console.log(
                `在${blockNumber}区块，${txHash}交易中从 ${from} 转账  ${valueInUSDT} USDT 给 ${to},`
            );
            });
    },
});
}


// 监听最新区块
function listenToNewBlocks() {
  console.log('Starting to listen for new blocks...');

  // 使用 watchBlocks 监听新区块
  const unwatch = client.watchBlocks({
    onBlock: (block) => {
      const blockNumber = block.number; // 区块高度
      const blockHash = block.hash;     // 区块哈希
      console.log(`New Block: Height = ${blockNumber}, Hash = ${blockHash}`);
    },
    onError: (error) => {
      console.error('Error while listening to blocks:', error);
    },
  });
}

// 执行监听
listenToNewBlocks();
listenUSDTransfer();