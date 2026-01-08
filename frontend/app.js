const contractAddress = '0xCe88Cd7abd9Ed6F9CD21958ea4200a69300993B7';
const abi = [
  "function resetIfNeeded()",
  "function buyTurn() payable",
  "function play()",
  "function getPlayerState(address user) view returns (uint256, uint256, uint256, uint256, uint256)"
];

const backendUrl = 'http://23.88.48.244:3000/leaderboard';
const SEPOLIA_CHAIN_ID = 11155111;

let provider, signer, contract, address;

async function switchToSepolia() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }],
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0xaa36a7',
          chainName: 'Sepolia Test Network',
          rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
          nativeCurrency: { name: 'Sepolia ETH', symbol: 'SEP', decimals: 18 },
          blockExplorerUrls: ['https://sepolia.etherscan.io']
        }]
      });
    } else {
      alert('Vui lòng chuyển sang mạng Sepolia!');
      return false;
    }
  }
  return true;
}

async function checkNetwork() {
  const chainId = await provider.getNetwork().then(n => Number(n.chainId));
  if (chainId !== SEPOLIA_CHAIN_ID) {
    return await switchToSepolia();
  }
  return true;
}

async function init() {
  if (!window.ethereum) {
    alert('Cài MetaMask!');
    return;
  }
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    address = await signer.getAddress();
    if (!(await checkNetwork())) return;
    contract = new ethers.Contract(contractAddress, abi, signer);
    document.getElementById('connect').textContent = 'Đã Kết Nối Sepolia';
    document.getElementById('connect').disabled = true;
    document.getElementById('play').disabled = false;
    document.getElementById('buy').disabled = false;
    updateStatus();
  } catch (e) {
    alert('Lỗi kết nối: ' + e.message);
  }
}

async function updateStatus() {
  if (!contract) return;
  try {
    const [turnsLeft, buyPrice, totalGames, points, delayUntil] = await contract.getPlayerState(address);
    const turns = Number(turnsLeft);
    const games = Number(totalGames);
    const score = Number(points);
    const price = ethers.formatEther(buyPrice);
    const now = Math.floor(Date.now() / 1000);
    const delayTime = delayUntil > now ? new Date(delayUntil * 1000).toLocaleString('vi-VN') : '';

    document.getElementById('status').innerHTML = `
      <strong>Ví:</strong> ${address.slice(0,6)}...${address.slice(-4)}<br>
      <strong>Lượt còn:</strong> ${turns}/5<br>
      <strong>Giá mua:</strong> ${price} SEP ETH<br>
      <strong>Tổng trận:</strong> ${games}<br>
      <strong>Điểm:</strong> ${score}<br>
      ${delayTime ? `<strong style="color:red;">Delay đến:</strong> ${delayTime}` : ''}
    `;

    document.getElementById('play').disabled = turns === 0 || delayUntil > now;
  } catch (e) {
    document.getElementById('status').innerHTML = '<p style="color:red;">Lỗi tải (F5 refresh)</p>';
  }
}

// ====================== PLAY BUTTON ======================
document.getElementById('play').onclick = async () => {
  if (!(await checkNetwork())) return;

  // Hiển thị GIF vật tay
  const gifUrl = 'https://media3.giphy.com/media/XEaDnT4gBwGRrYPKw1/giphy.gif'; // GIF căng thẳng đẹp
  document.getElementById('wrestling-gif').src = gifUrl;
  document.getElementById('animation-container').style.display = 'block';
  document.getElementById('play').disabled = true;

  try {
    const oldState = await contract.getPlayerState(address);
    const oldPoints = Number(oldState[3]);

    const tx = await contract.play();
    await tx.wait();

    // Ẩn GIF
    document.getElementById('animation-container').style.display = 'none';

    const newState = await contract.getPlayerState(address);
    const newPoints = Number(newState[3]);
    const pointsGained = newPoints - oldPoints;

    if (pointsGained === 10) {
      // HIỆN WIN OVERLAY SIÊU NGẦU
      const winOverlay = document.getElementById('win-overlay');
      winOverlay.style.display = 'flex';

      setTimeout(() => {
        winOverlay.style.display = 'none';
      }, 4000); // Tự ẩn sau 4 giây

      winOverlay.onclick = () => { winOverlay.style.display = 'none'; };
      document.querySelector('.win-message').onclick = (e) => e.stopPropagation();
    } else if (pointsGained === 5) {
      alert('💪 THUA! +5 điểm (Delay 1 tiếng) 😤 Luyện tiếp nào!');
    } else {
      alert('Kết quả lạ? Refresh trang thử xem.');
    }

    updateStatus();
  } catch (e) {
    document.getElementById('animation-container').style.display = 'none';
    alert('Lỗi chơi: ' + (e.reason || e.message || 'Hết lượt/delay'));
  } finally {
    document.getElementById('play').disabled = false;
  }
};

// ====================== BUY & LEADERBOARD (giữ nguyên) ======================
document.getElementById('buy').onclick = async () => {
  if (!(await checkNetwork())) return;
  try {
    const [, buyPrice] = await contract.getPlayerState(address);
    const tx = await contract.buyTurn({ value: buyPrice });
    await tx.wait();
    alert('Mua lượt thành công! 💰');
    updateStatus();
  } catch (e) {
    alert('Lỗi mua: ' + (e.reason || e.message));
  }
};

document.getElementById('leaderboard').onclick = async () => {
  try {
    const res = await fetch(backendUrl);
    const top = await res.json();
    let html = '<h2>🏆 Top 10 Cao Thủ</h2><ol>';
    if (!top.length) html += '<li>Chưa ai lên top! Bạn sẽ là số 1?</li>';
    top.forEach((p, i) => html += `<li>${i+1}. ${p.address.slice(0,6)}...${p.address.slice(-4)} — ${p.points} điểm</li>`);
    html += '</ol>';
    document.getElementById('leaderboard-div').innerHTML = html;
  } catch (e) {
    document.getElementById('leaderboard-div').innerHTML = '<p style="color:red;">Lỗi backend</p>';
  }
};

document.getElementById('connect').onclick = init;

setInterval(updateStatus, 10000);
updateStatus(); // Gọi lần đầu nếu đã kết nối trước
