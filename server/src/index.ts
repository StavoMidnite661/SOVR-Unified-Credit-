import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from 'tigerbeetle-node';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// TigerBeetle Client Initialization
// In production, these should come from environment variables
const TB_CLUSTER_ID = BigInt(process.env.TB_CLUSTER_ID || '0');
const TB_ADDRESSES = [process.env.TB_ADDRESS || '127.0.0.1:3000'];

let tbClient: any;

try {
  tbClient = createClient({
    cluster_id: TB_CLUSTER_ID,
    replica_addresses: TB_ADDRESSES,
  });
  console.log('TigerBeetle client initialized');
} catch (e) {
  console.error('Failed to initialize TigerBeetle client:', e);
  // For the sake of the demo server not crashing if TB isn't running:
  console.log('Running in degraded mode (No TigerBeetle connection)');
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', tbConnected: !!tbClient });
});

app.get('/ledger/accounts', async (req, res) => {
  if (!tbClient) return res.status(503).json({ error: 'TigerBeetle not connected' });

  try {
    // In real TB, you lookup accounts by IDs
    // For simplicity, we assume we know the IDs
    const accountIds = [BigInt(1000), BigInt(2000), BigInt(3000), BigInt(4000), BigInt(5000)];
    const accounts = await tbClient.lookupAccounts(accountIds);

    // Convert BigInt to strings for JSON
    const serializedAccounts = accounts.map((acc: any) => ({
      ...acc,
      id: acc.id.toString(),
      debits_pending: acc.debits_pending.toString(),
      debits_posted: acc.debits_posted.toString(),
      credits_pending: acc.credits_pending.toString(),
      credits_posted: acc.credits_posted.toString(),
      user_data_128: acc.user_data_128.toString(),
    }));

    res.json(serializedAccounts);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/transactions/transfer', async (req, res) => {
  if (!tbClient) return res.status(503).json({ error: 'TigerBeetle not connected' });

  const { debit_id, credit_id, amount, code } = req.body;

  try {
    // 128-bit ID generation for TigerBeetle
    const id = BigInt(Date.now()) + BigInt(Math.floor(Math.random() * 1000));

    const transfer = {
      id,
      debit_account_id: BigInt(debit_id),
      credit_account_id: BigInt(credit_id),
      amount: BigInt(Math.floor(amount * 100)),
      pending_id: BigInt(0),
      ledger: 1,
      code: code || 1,
      flags: 0,
      timestamp: BigInt(0),
    };

    const results = await tbClient.createTransfers([transfer]);

    if (results.length > 0) {
      return res.status(400).json({ error: `Transfer failed: ${results[0].code}` });
    }

    res.json({ success: true, transfer_id: transfer.id.toString() });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, () => {
  console.log(`SOVR Server listening at http://localhost:${port}`);
});
