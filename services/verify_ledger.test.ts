import { tigerBeetle } from "./tigerBeetle";
import { performProtocolSwap, performBurn, performNormalization, performPayment, getTBAccountBalance } from "./productionMiddleware";

async function runTests() {
  console.log("Starting TigerBeetle Ledger Verification...");

  // Initial Balances
  console.log("Initial Balances:");
  tigerBeetle.getAllAccounts().forEach(acc => {
    console.log(`Account ${acc.id} (${acc.credits_posted - acc.debits_posted})`);
  });

  // 1. Test Swap (SOVR -> usdSOVR)
  console.log("\nTesting Swap: 100 SOVR -> 250 usdSOVR");
  await performProtocolSwap(250, true);
  const userLiability = getTBAccountBalance("2000");
  console.log(`User Liability (Account 2000): ${userLiability} (Expected: 250)`);
  if (userLiability !== 250) throw new Error("Swap failed");

  // 2. Test Burn
  console.log("\nTesting Burn: 100 usdSOVR");
  await performBurn(100);
  const burnBalance = getTBAccountBalance("5000");
  const userLiabilityAfterBurn = getTBAccountBalance("2000");
  console.log(`Burn Account (Account 5000): ${burnBalance} (Expected: 100)`);
  console.log(`User Liability (Account 2000): ${userLiabilityAfterBurn} (Expected: 150)`);
  if (burnBalance !== 100 || userLiabilityAfterBurn !== 150) throw new Error("Burn failed");

  // 3. Test Normalization (Credit issuance)
  console.log("\nTesting Normalization: 100 Credits");
  await performNormalization(100);
  const gatewayPool = getTBAccountBalance("3000");
  console.log(`Gateway Pool (Account 3000): ${gatewayPool} (Expected: 100)`);
  if (gatewayPool !== 100) throw new Error("Normalization failed");

  // 4. Test Payment
  console.log("\nTesting Payment: 50 USD");
  await performPayment(50, "merch_123");
  const merchantRevenue = getTBAccountBalance("4000");
  const gatewayPoolAfterPay = getTBAccountBalance("3000");
  console.log(`Merchant Revenue (Account 4000): ${merchantRevenue} (Expected: 50)`);
  console.log(`Gateway Pool (Account 3000): ${gatewayPoolAfterPay} (Expected: 50)`);
  if (merchantRevenue !== 50 || gatewayPoolAfterPay !== 50) throw new Error("Payment failed");

  console.log("\n✅ ALL LEDGER TESTS PASSED");
}

runTests().catch(err => {
  console.error("\n❌ TEST FAILED");
  console.error(err);
  process.exit(1);
});
