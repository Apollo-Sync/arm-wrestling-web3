const contractAddress = '0x1C247b17b4929554a6710D0BC746615ccD785448';
const abi = [
  "function resetIfNeeded()",
  "function buyTurn() payable",
  "function play()",
  "function getPlayerState(address user) view returns (uint256, uint256, uint256, uint256, uint256)"
];

const backendUrl = 'http://23.88.48.244:3000/leaderboard';  // Dùng IP public để truy cập từ xa

const SEPOLIA_CHAIN_ID = 11155111;  // Chain ID của Sepolia

let provider;
let signer;
let contract;
let address;

async function switchToSepolia() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x' + SEPOLIA_CHAIN_ID.toString(16) }],  // 0xaa36a7
    });
    return true;
  } catch (switchError) {
    // Lỗi 4902: mạng chưa được thêm vào ví
    if (switchError.code === 4902 || switchError.code === -32603) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xaa36a7',
              chainName: 'Sepolia Test Network',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'SEP',
                decimals: 18
              },
              rpcUrls: ['https://rpc.ankr.com/eth_sepolia'],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }
          ]
        });
        return true;
      } catch (addError) {
        console.error(addError);
        alert('Không thể thêm mạng Sepolia tự động. Vui lòng thêm thủ công trong MetaMask.');
        return false;
      }
    } else {
      console.error(switchError);
      alert('Vui lòng chuyển sang mạng Sepolia Test Network trong MetaMask để chơi game!');
      return false;
    }
  }
}

async function checkAndSwitchNetwork() {
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  const currentChainId = parseInt(chainId, 16);

  if (currentChainId !== SEPOLIA_CHAIN_ID) {
    const switched = await switchToSepolia();
    if (!switched) return false;

    // Sau khi chuyển mạng, reload provider để cập nhật
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    address = await signer.getAddress();
    contract = new ethers.Contract(contractAddress, abi, signer);
  }
  return true;
}

async function init() {
  if (typeof window.ethereum === 'undefined') {
    alert('Vui lòng cài MetaMask để chơi game!');
    return;
  }

  try {
    // Yêu cầu kết nối ví
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    address = await signer.getAddress();

    // Bắt buộc kiểm tra và chuyển sang Sepolia
    const networkOk = await checkAndSwitchNetwork();
    if (!networkOk) {
      document.getElementById('status').innerHTML = '<p style="color:red;">⚠️ Vui lòng chuyển sang mạng Sepolia để chơi!</p>';
      return;
    }

    contract = new ethers.Contract(contractAddress, abi, signer);

    document.getElementById('connect').textContent = 'Đã Kết Nối (Sepolia)';
    document.getElementById('connect').disabled = true;

    updateStatus();
    enableButtons();

  } catch (error) {
    console.error(error);
    alert('Lỗi kết nối ví: ' + (error.message || 'Không xác định'));
  }
}

function enableButtons() {
  document.getElementById('play').disabled = false;
  document.getElementById('buy').disabled = false;
}

document.getElementById('connect').addEventListener('click', init);

async function updateStatus() {
  if (!contract) return;

  try {
    const [turnsLeft, buyPrice, totalGames, points, delayUntil] = await contract.getPlayerState(address);

    const delayTime = delayUntil > Math.floor(Date.now() / 1000)
      ? new Date(delayUntil * 1000).toLocaleString('vi-VN')
      : '';

    document.getElementById('status').innerHTML = `
      <strong>Địa chỉ ví:</strong> ${address.substring(0, 6)}...${address.substring(38)}<br>
      <strong>Lượt chơi còn:</strong> ${turnsLeft}<br>
      <strong>Giá mua lượt tiếp:</strong> ${ethers.formatEther(buyPrice)} SEP ETH<br>
      <strong>Tổng trận chơi:</strong> ${totalGames}<br>
      <strong>Điểm hiện tại:</strong> ${points}<br>
      ${delayTime ? `<strong style="color:red;">Delay đến:</strong> ${delayTime}` : ''}
    `;

    document.getElementById('play').disabled = turnsLeft === 0n || !!delayTime;
  } catch (e) {
    console.error(e);
    document.getElementById('status').innerHTML = '<p style="color:red;">Lỗi tải dữ liệu từ contract. Kiểm tra mạng Sepolia.</p>';
  }
}

document.getElementById('play').addEventListener('click', async () => {
  const networkOk = await checkAndSwitchNetwork();
  if (!networkOk) return;

  try {
    const tx = await contract.play();
    alert('Đang vật tay với bot... ⏳');
    await tx.wait();
    alert('Đã hoàn thành trận đấu! Kiểm tra kết quả.');
    updateStatus();
  } catch (e) {
    alert('Lỗi khi chơi: ' + (e.reason || e.message || 'Transaction bị từ chối'));
  }
});

document.getElementById('buy').addEventListener('click', async () => {
  const networkOk = await checkAndSwitchNetwork();
  if (!networkOk) return;

  try {
    const [, buyPrice] = await contract.getPlayerState(address);
    const tx = await contract.buyTurn({ value: buyPrice });
    alert('Đang mua lượt thêm... ⏳');
    await tx.wait();
    alert('Mua lượt thành công! 🎉');
    updateStatus();
  } catch (e) {
    alert('Lỗi mua lượt: ' + (e.reason || e.message || 'Không đủ ETH Sepolia hoặc bị từ chối'));
  }
});

document.getElementById('leaderboard').addEventListener('click', async () => {
  try {
    const res = await fetch(backendUrl);
    if (!res.ok) throw new Error('Backend không phản hồi');
    const top = await res.json();

    let html = '<h2>🏆 Bảng Xếp Hạng Top 10</h2><ol>';
    if (top.length === 0) {
      html += '<li>Chưa có ai lên bảng! Hãy là người đầu tiên!</li>';
    } else {
      top.forEach((player, index) => {
        html += `<li><strong>${index + 1}.</strong> ${player.address.substring(0, 6)}...${player.address.substring(38)} — ${player.points} điểm</li>`;
      });
    }
    html += '</ol>';
    document.getElementById('leaderboard-div').innerHTML = html;
  } catch (e) {
    document.getElementById('leaderboard-div').innerHTML = '<p style="color:red;">Lỗi tải bảng xếp hạng. Backend có đang chạy không?</p>';
  }
});

// Auto update mỗi 10 giây
setInterval(() => {
  if (contract) updateStatus();
}, 10000);
