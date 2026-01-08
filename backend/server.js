const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors({ origin: '*' }));  // Cho phép frontend từ port 8000 truy cập

const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');

const contractAddress = '0xCe88Cd7abd9Ed6F9CD21958ea4200a69300993B7';
const abi = ["event PointUpdate(address indexed player, uint256 points)"];

const contract = new ethers.Contract(contractAddress, abi, provider);

let leaderboard = new Map();

contract.on("PointUpdate", (player, points) => {
  leaderboard.set(player, Number(points));
  console.log(`Update realtime: ${player} -> ${Number(points)} điểm`);
});

async function loadPastEvents() {
  try {
    const events = await contract.queryFilter(contract.filters.PointUpdate());
    events.forEach(e => leaderboard.set(e.args.player, Number(e.args.points)));
    console.log(`Load ${events.length} event cũ`);
  } catch (e) {
    console.log('Chưa có event nào hoặc lỗi nhỏ');
  }
}

loadPastEvents();

app.get('/leaderboard', (req, res) => {
  const top = Array.from(leaderboard.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([addr, pts]) => ({ address: addr, points: pts }));
  res.json(top);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend chạy OK: http://23.88.48.244:${port}`);
});
