//
// Auto-withdraw (sweeper) bot — plantilla para BSC
//
// Instala ethers:   npm i ethers
// Instala Node.js:  sudo apt install nodejs
//
// IMPORTANTE: este es un EJEMPLO/TEMPLATE. Las claves privadas y la wallet de
// destino NO van en el código: se leen de variables de entorno (ver README).
//
// RPCs públicos de BSC (ver https://chainlist.org/chain/56):
//   Mainnet: https://bsc-dataseed1.binance.org/
//   Mainnet: wss://bsc-rpc.publicnode.com
//   Testnet: https://data-seed-prebsc-1-s1.binance.org:8545/
//   Testnet: wss://bsc-testnet.publicnode.com
//

const ethers = require('ethers');

// --- CONFIGURACIÓN (por variables de entorno, NUNCA en el código) ---
// PRIVATE_KEYS: claves privadas separadas por coma, p. ej. "aaa...,bbb...,ccc..."
// RECEIVER:     dirección a la que se barre (sweep) el saldo.
// RPC_URL:      endpoint WebSocket del nodo (opcional; por defecto, BSC testnet público).
const RPC_URL = process.env.RPC_URL || "wss://bsc-testnet.publicnode.com";
const addressReceiver = process.env.RECEIVER || "";
const privateKeys = (process.env.PRIVATE_KEYS || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

if (!addressReceiver || privateKeys.length === 0) {
  console.error("Faltan RECEIVER o PRIVATE_KEYS. Defínelos como variables de entorno (ver README).");
  process.exit(1);
}

const provider = new ethers.WebSocketProvider(RPC_URL);

const bot = async () => {
  const wallets = privateKeys.map((pk) => new ethers.Wallet(pk, provider));
  const walletAddresses = wallets.map((w) => w.address.toLowerCase());

  console.log(
    `Bot iniciado. ${wallets.length} wallet(s). Barrera a ${addressReceiver}. Esperando transacciones...`
  );

  provider.on('pending', async (txHash) => {
    try {
      const tx = await provider.getTransaction(txHash);
      if (!tx || !tx.to) return;

      const toAddress = tx.to.toLowerCase();

      // ¿La transacción entrante va a una de nuestras wallets?
      if (walletAddresses.includes(toAddress)) {
        console.log(`Transacción entrante detectada para ${toAddress}`);

        const wallet = wallets.find((w) => w.address.toLowerCase() === toAddress);

        try {
          const balance = await provider.getBalance(wallet.address);
          console.log(`Balance actual: ${ethers.formatEther(balance)} BNB`);

          const feeData = await provider.getFeeData();
          const gasLimit = 21000n;
          const gasPrice = feeData.maxFeePerGas || feeData.gasPrice;

          // Enviar todo el balance menos el gas estimado.
          const maxAmount =
            balance > gasLimit * gasPrice ? balance - gasLimit * gasPrice : 0n;

          if (maxAmount > 0n) {
            const sent = await wallet.sendTransaction({
              to: addressReceiver,
              value: maxAmount,
              maxFeePerGas: feeData.maxFeePerGas,
              maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
              gasLimit,
            });

            console.log(`BNB retirado de ${wallet.address}. Monto: ${ethers.formatEther(maxAmount)} BNB`);
            console.log(`Hash de la transacción: ${sent.hash}`);
          } else {
            console.log(`No hay balance para retirar en ${wallet.address}`);
          }
        } catch (e) {
          console.log(`Error al retirar de ${wallet.address}: ${e}`);
        }
      }
    } catch (error) {
      console.error(`Error al procesar la transacción: ${error}`);
    }
  });

  provider.on('error', (error) => {
    console.error('Error en el proveedor:', error);
  });
};

bot().catch(console.error);
