# BSC Auto-Withdraw (Sweeper) — Plantilla

Bot de ejemplo en **Node.js + ethers** que vigila las transacciones **pendientes** en **BNB Smart Chain (BSC)** y, cuando una de tus wallets recibe BNB, **barre (sweep) el saldo** automáticamente a una dirección de destino.

> **Plantilla educativa.** No incluye claves privadas ni dirección de destino: se pasan por **variables de entorno**. Úsala solo con **tus propias** wallets y **prueba primero en testnet**.

## Cómo funciona

1. Se conecta a un nodo por **WebSocket**.
2. Escucha el evento `pending` (mempool) del nodo.
3. Si el `to` de una transacción pendiente es una de las wallets configuradas, consulta su saldo.
4. Envía **todo el saldo menos el gas** a la dirección de destino.
5. Registra en consola el monto y el hash de la transacción.

## Requisitos

- **Node.js 18+**
- **ethers** (`npm i ethers`)
- Un **RPC WebSocket** (público o propio; ver lista abajo)

## Configuración (variables de entorno)

| Variable | Obligatoria | Descripción |
|---|---|---|
| `PRIVATE_KEYS` | Sí | Claves privadas separadas por **coma**. |
| `RECEIVER` | Sí | Dirección de destino del barrido. |
| `RPC_URL` | No | Endpoint **WebSocket** del nodo. Por defecto: `wss://bsc-testnet.publicnode.com`. |

**macOS / Linux:**

```bash
export PRIVATE_KEYS="0xCLAVE1,0xCLAVE2"
export RECEIVER="0xDIRECCION_DESTINO"
export RPC_URL="wss://bsc-testnet.publicnode.com"
node bot.js
```

**Windows (PowerShell):**

```powershell
$env:PRIVATE_KEYS="0xCLAVE1,0xCLAVE2"
$env:RECEIVER="0xDIRECCION_DESTINO"
node bot.js
```

**Con un `.env`** (Node 20+):

```bash
# .env  (no lo subas a git)
PRIVATE_KEYS=0xCLAVE1,0xCLAVE2
RECEIVER=0xDIRECCION_DESTINO
RPC_URL=wss://bsc-testnet.publicnode.com
```

```bash
node --env-file=.env bot.js
```

## RPCs de BSC

Lista pública en <https://chainlist.org/chain/56>:

```
# Mainnet (WebSocket)
wss://bsc-rpc.publicnode.com

# Mainnet (HTTP)
https://bsc-dataseed1.binance.org/

# Testnet
wss://bsc-testnet.publicnode.com
https://data-seed-prebsc-1-s1.binance.org:8545/
```

## Instalación y ejecución

```bash
npm i ethers

# define las variables de entorno (arriba) y luego:
node bot.js
```

## Seguridad

- **Nunca** hardcodees claves privadas ni las subas a git. Este template las lee de variables de entorno a propósito.
- Cualquiera con una clave privada controla esos fondos. Genera claves nuevas si alguna vez se expusieron.
- Empieza en **testnet** (`chainId 97`) antes de usar mainnet (`chainId 56`).
- Este bot solo mueve fondos de wallets cuyas claves **tú** proporcionas; no es una herramienta para drenar wallets de terceros.
- Un endpoint propio (Alchemy, QuickNode, etc.) es más fiable que los públicos.

## Licencia

Sin licencia definida. Plantilla de ejemplo; úsala bajo tu responsabilidad.
