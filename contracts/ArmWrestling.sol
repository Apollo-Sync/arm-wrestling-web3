pragma solidity ^0.8.0;

contract ArmWrestling {
    struct Player {
        uint256 turnsLeft;
        uint256 buyCount;
        uint256 currentBuyPrice;
        uint256 totalGames;
        uint256 points;
        uint256 lastResetDay;
        uint256 delayUntil;
    }

    mapping(address => Player) public players;

    uint256 constant DAY = 86400;
    uint256 constant INITIAL_PRICE = 1 ether;
    uint256 constant HOUR = 3600;

    event PointUpdate(address indexed player, uint256 points);

    function currentDay() public view returns (uint256) {
        return block.timestamp / DAY;
    }

    function resetIfNeeded() public {
        uint256 today = currentDay();
        if (players[msg.sender].lastResetDay < today) {
            players[msg.sender].turnsLeft = 5;
            players[msg.sender].buyCount = 0;
            players[msg.sender].currentBuyPrice = INITIAL_PRICE;
            players[msg.sender].lastResetDay = today;
        }
    }

    function buyTurn() public payable {
        resetIfNeeded();
        require(msg.value == players[msg.sender].currentBuyPrice, "Wrong amount");
        players[msg.sender].turnsLeft += 1;
        players[msg.sender].buyCount += 1;
        players[msg.sender].currentBuyPrice *= 2;
    }

    function play() public {
        resetIfNeeded();
        require(block.timestamp >= players[msg.sender].delayUntil, "Delayed");
        require(players[msg.sender].turnsLeft > 0, "No turns left");
        players[msg.sender].turnsLeft -= 1;
        uint256 winRate = 50 + players[msg.sender].totalGames;
        uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % 100;
        players[msg.sender].totalGames += 1;
        if (rand < winRate) {
            players[msg.sender].points += 1;
            emit PointUpdate(msg.sender, players[msg.sender].points);
        } else {
            players[msg.sender].delayUntil = block.timestamp + HOUR;
        }
    }

    function getPlayerState(address user) public view returns (uint256 turnsLeft, uint256 currentBuyPrice, uint256 totalGames, uint256 points, uint256 delayUntil) {
        uint256 today = currentDay();
        uint256 _turnsLeft = players[user].turnsLeft;
        uint256 _buyPrice = players[user].currentBuyPrice;
        if (players[user].lastResetDay < today) {
            _turnsLeft = 5;
            _buyPrice = INITIAL_PRICE;
        }
        return (_turnsLeft, _buyPrice, players[user].totalGames, players[user].points, players[user].delayUntil);
    }
}
