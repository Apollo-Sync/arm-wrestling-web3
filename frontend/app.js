const contractAddress = '0x1C247b17b4929554a6710D0BC746615ccD785448';  // Thay sau khi deploy
const abi = [
  "function resetIfNeeded()",
  "function buyTurn() payable",
  "function play()",
  "function getPlayerState(address user) view returns (uint256, uint256, uint256, uint256, uint256)"
];

let provider;
let signer;
let contract;
let address;

const backendUrl = 'http://localhost:3000/leaderboard';  // URL backend

async function init() {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    address = await signer.getAddress();
    contract = new ethers.Contract(contractAddress, abi, signer);
    document.getElementById('connect').disabled = true;
    updateStatus();
  } else {
    alert('Cài MetaMask để chơi!');
  }
}

document.getElementById('connect').addEventListener('click', init);

async function updateStatus() {
  try {
    const [turnsLeft, buyPrice, totalGames, points, delayUntil] = await contract.getPlayerState(address);
    const delayTime = delayUntil > Math.floor(Date.now() / 1000) ? new Date(delayUntil * 1000).toLocaleString() : '';
    document.getElementById('status').innerHTML = `
      Địa chỉ ví: ${address}<br>
      Lượt chơi còn: ${turnsLeft}<br>
      Giá mua lượt tiếp: ${ethers.utils.formatEther(buyPrice)} ETH<br>
      Tổng trận chơi: ${totalGames}<br>
      Điểm: ${points}<br>
      ${delayTime ? `Delay đến: ${delayTime}` : ''}
    `;
    document.getElementById('play').disabled = turnsLeft === 0 || !!delayTime;
    document.getElementById('buy').disabled = false;
  } catch (e) {
    console.error(e);
  }
}

document.getElementById('play').addEventListener('click', async () => {
  try {
    const tx = await contract.play();
    await tx.wait();
    alert('Đã chơi! Kiểm tra trạng thái.');
    updateStatus();
  } catch (e) {
    alert(e.message);
  }
});

document.getElementById('buy').addEventListener('click', async () => {
  try {
    const [, buyPrice] = await contract.getPlayerState(address);
    const tx = await contract.buyTurn({ value: buyPrice });
    await tx.wait();
    alert('Đã mua lượt!');
    updateStatus();
  } catch (e) {
    alert(e.message);
  }
});

document.getElementById('leaderboard').addEventListener('click', async () => {
  try {
    const res = await fetch(backendUrl);
    const top = await res.json();
    let html = '<h2>Bảng Xếp Hạng</h2><ul>';
    top.forEach(player => {
      html += `<li>${player.address}: ${player.points} điểm</li>`;
    });
    html += '</ul>';
    document.getElementById('leaderboard-div').innerHTML = html;
  } catch (e) {
    alert('Lỗi lấy bảng xếp hạng');
  }
});

// Auto update status every 10s
setInterval(updateStatus, 10000);
