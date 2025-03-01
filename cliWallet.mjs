import { createWalletClient, http, parseEther, parseGwei } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'
import { createPublicClient } from 'viem'
import { encodeFunctionData } from 'viem';
import dotenv from 'dotenv';


dotenv.config();
// 添加ERC20 ABI
const erc20ABI = [
  {
    "inputs": [
      {"name": "to", "type": "address"},
      {"name": "value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

async function sendTransactionExample() {
  try {
    // 1. 生成私钥
    // const privateKey = generatePrivateKey()
    const privateKey = privateKeyToAccount(`${process.env.privateKey}`);
    console.log('Generated Private Key:', privateKey)

    // 推导账户
    // const account = privateKeyToAccount(privateKey)
    const userAddress = privateKey.address
    console.log('Account Address:', userAddress)

    // 查询余额
    const publicClient = createPublicClient({
      chain: sepolia,
      // transport: http('https://eth-sepolia.public.blastapi.io')
      transport: http()
    })

    const balance = await publicClient.getBalance({
      address: userAddress
    })
    console.log('Balance:', balance)

    // 查询nonce
    const nonce = await publicClient.getTransactionCount({
      address: userAddress
    })
    console.log('Nonce:', nonce)

    // 修改交易参数，构建ERC20转账数据
    const tokenAddress = '0x19f8C886f2C2E1362cfCDF177f160A6702B9162d' // LINK Token on Sepolia
    const toAddress = '0x320Cbc24f5959ba16420f78Eb184c33d13B63C43'
    const amount = 100000000000n // 1 TOKEN (18 decimals)

    const txParams = {
      account: privateKey,
      to: tokenAddress, // ERC20代币合约地址
      data: encodeFunctionData({
        abi: erc20ABI,
        functionName: 'transfer',
        args: [toAddress, amount]
      }),
      chainId: sepolia.id,
      
      maxFeePerGas: parseGwei('80'),
      maxPriorityFeePerGas: parseGwei('2'),
      
      nonce: nonce,
    }

    // 估算gas（对于ERC20转账，这一步很重要）
    const gasEstimate = await publicClient.estimateGas(txParams)
    txParams.gas = gasEstimate

    // 创建钱包客户端
    const walletClient = createWalletClient({
      account: privateKey,
      chain: sepolia,
      transport: http('https://eth-sepolia.public.blastapi.io') // 替换为你的RPC节点URL
    })

    // 方式 1 ： 
    // const txHash = await walletClient.sendTransaction(txParams)

    // 方式 2 ： 
    // 6. 签名交易
    const signedTx = await walletClient.signTransaction(txParams)
    console.log('Signed Transaction:', signedTx)

    // 7. 发送交易  eth_sendRawTransaction
    const txHash = await publicClient.sendRawTransaction({
      serializedTransaction: signedTx
    })

    console.log('Transaction Hash:', txHash)
    return txHash

  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

// 执行示例
sendTransactionExample()