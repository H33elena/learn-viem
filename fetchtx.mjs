import { createPublicClient, http, formatUnits } from 'viem';
import { mainnet } from 'viem/chains';

// USDC 合约地址和 ABI
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDC_ABI = [
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

// 配置 Viem 客户端
const client = createPublicClient({
  chain: mainnet,
  transport: http(), // 替换为你的 RPC URL
});

// 查询函数
async function getRecentUSDCTransfers() {
  try {
    // 获取最新区块号
    const latestBlock = await client.getBlockNumber();
    console.log(`Latest block: ${latestBlock}`);

    // 计算查询范围：最近 100 个区块
    const fromBlock = latestBlock - 100n;
    const toBlock = latestBlock;

    // 查询 Transfer 事件日志
    const logs = await client.getLogs({
      address: USDC_ADDRESS,
      event: USDC_ABI[0], // Transfer 事件
      fromBlock,
      toBlock,
    });

    // 解析并打印日志，包括交易 ID
    console.log(`Found ${logs.length} Transfer events in the last 100 blocks:`);
    logs.forEach((log, index) => {
      const { from, to, value } = log.args;
      const valueInUSDC = formatUnits(value, 6); // USDC 有 6 位小数
      const txHash = log.transactionHash; // 交易 ID
      console.log(
        ` 从 ${from} 转账给 ${to}, ${valueInUSDC} USDC， 交易ID: ${txHash},`
      );
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
  }
}

// 执行查询
getRecentUSDCTransfers();