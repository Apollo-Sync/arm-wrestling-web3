pragma solidity ^0.8.20;

// SPDX-License-Identifier: UNLICENSED
contract ArmWrestling {
    struct Player {
        uint256 turnsLeft;         // Lượt chơi còn lại trong ngày
        uint256 buyCount;          // Số lần mua lượt trong ngày (để tính giá nhân đôi)
        uint256 currentBuyPrice;   // Giá mua lượt hiện tại
        uint256 totalGames;        // Tổng số trận đã chơi (dùng tính tỷ lệ thắng)
        uint256 points;            // Tổng điểm tích lũy
        uint256 lastResetDay;      // Ngày reset cuối (timestamp / 86400)
        uint256 delayUntil;        // Thời gian phải chờ nếu thua (timestamp)
    }

    mapping(address => Player) public players;

    uint256 constant DAY = 86400;          // 1 ngày = 86400 giây
    uint256 constant INITIAL_PRICE = 1 ether;
    uint256 constant HOUR = 3600;          // Delay 1 tiếng khi thua

    event PointUpdate(address indexed player, uint256 points);

    /// @dev Trả về ngày hiện tại (UTC)
    function currentDay() public view returns (uint256) {
        return block.timestamp / DAY;
    }

    /// @dev Reset lượt và giá nếu sang ngày mới
    function resetIfNeeded() public {
        uint256 today = currentDay();
        if (players[msg.sender].lastResetDay < today) {
            players[msg.sender].turnsLeft = 5;
            players[msg.sender].buyCount = 0;
            players[msg.sender].currentBuyPrice = INITIAL_PRICE;
            players[msg.sender].lastResetDay = today;
        }
    }

    /// @dev Mua thêm 1 lượt chơi
    function buyTurn() public payable {
        resetIfNeeded();
        require(msg.value == players[msg.sender].currentBuyPrice, "Wrong ETH amount sent");
        players[msg.sender].turnsLeft += 1;
        players[msg.sender].buyCount += 1;
        players[msg.sender].currentBuyPrice *= 2;  // Nhân đôi giá lần sau
    }

    /// @dev Chơi 1 trận vật tay với bot
    function play() public {
        resetIfNeeded();
        require(block.timestamp >= players[msg.sender].delayUntil, "You are delayed after losing");
        require(players[msg.sender].turnsLeft > 0, "No turns left today");

        players[msg.sender].turnsLeft -= 1;

        // Tỷ lệ thắng: bắt đầu 50%, tăng 1% mỗi trận, max 65%
        uint256 baseWinRate = 50 + players[msg.sender].totalGames;
        uint256 winRate = baseWinRate > 65 ? 65 : baseWinRate;

        // Pseudo-random (đủ tốt cho testnet/game)
        uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % 100;

        players[msg.sender].totalGames += 1;

        if (rand < winRate) {
            // THẮNG
            players[msg.sender].points += 10;
        } else {
            // THUA
            players[msg.sender].points += 5;
            players[msg.sender].delayUntil = block.timestamp + HOUR;
        }

        emit PointUpdate(msg.sender, players[msg.sender].points);
    }

    /// @dev Trả về trạng thái người chơi (view, xử lý reset nếu cần)
    function getPlayerState(address user) public view returns (
        uint256 turnsLeft,
        uint256 currentBuyPrice,
        uint256 totalGames,
        uint256 points,
        uint256 delayUntil
    ) {
        uint256 today = currentDay();
        uint256 _turnsLeft = players[user].turnsLeft;
        uint256 _buyPrice = players[user].currentBuyPrice;

        if (players[user].lastResetDay < today) {
            _turnsLeft = 5;
            _buyPrice = INITIAL_PRICE;
        }

        return (
            _turnsLeft,
            _buyPrice,
            players[user].totalGames,
            players[user].points,
            players[user].delayUntil
        );
    }
}
