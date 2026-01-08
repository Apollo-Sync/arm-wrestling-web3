const express = require('express');
const { ethers } = require('ethers');
const app = express();
const port = 3000;

const provider = new ethers.providers.JsonRpcProvider('https://rpc.sepolia.org');
const contractAddress = '0x1C247b17b4929554a6710D0BC746615ccD785448';  // Thay sau khi deploy
const abi = [
  "event PointUpdate(address indexed player, uint256 points)"
];

const contract = new ethers.Contract(contractAddress, abi, provider);

let leaderboard = new Map();  // address => points

contract.on("PointUpdate", (player, points) => {
  leaderboard.set(player, points);
  console.log(`Updated ${player}: ${points}`);
});

async function init() {
  const filter = contract.filters.PointUpdate();
  const events = await contract.queryFilter(filter, -100000);  // Query past events (adjust block range if needed)
  for (let event of events) {
    leaderboard.set(event.args.player, event.args.points);
  }
}

init().catch(console.error);

app.get('/leaderboard', (req, res) => {
  let top = Array.from(leaderboard.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([addr, pts]) => ({ address: addr, points: pts }));
  res.json(top);
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
