**Smart Contracts**
```
0xCe88Cd7abd9Ed6F9CD21958ea4200a69300993B7
```
**What is this game ?**
```
Game Mechanics:Players access the website, connect their EVM wallet, and begin arm-wrestling matches against the bot.
- Each day, players receive 5 free plays against the bot.
- Once free plays are exhausted, players can purchase additional plays using ETH on the Sepolia network.
- The pricing for additional plays follows an exponential increase to prevent whales with large ETH holdings from disrupting game balance:
-- First purchase of the day: 1 Sepolia ETH = 1 play.
-- Second purchase: 2 Sepolia ETH = 1 play.
-- Third purchase: 4 Sepolia ETH = 1 play.
-- Fourth purchase: 8 Sepolia ETH = 1 play.
-- (Doubles for each subsequent purchase within the same day).

```


**Tree structure**
```
arm-wrestling-web3/
├── contracts/
│   └── ArmWrestling.sol
├── scripts/
│   └── deploy.js
├── hardhat.config.js
├── backend/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   └── package.json
└── package.json  (root, cho Hardhat)
```

**1. Setup version nodejs + npm**
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```
```
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```
```
nvm install 22
nvm use 22
nvm alias default 22
```
**Check version**
```
node -v    # → v22.xx.x
npm -v     # → 10.xx.x
```

**2. install dependencies**
```
cd arm-wrestling-web3
```

```
npm install
```

```
npm install dotenv
```

```
cd backend
npm install
cd ..
```

**3. Create your .env file**
```
PRIVATE_KEY=0xabc123...your_real_private_key_here
INFURA_API_KEY=your_infura_or_alchemy_key_if_you_have  # Tùy chọn, nếu dùng Infura/Alchemy
```
**4. Deploy contracts**
```
npx hardhat clean
npx hardhat run scripts/deploy.js --network sepolia
```

**5. Create sever game (You need open 2 terminal with tmux)**

- Allow port
```
sudo ufw allow 8000
```

- Running backend
```
cd ~/arm-wrestling-web3/backend
node server.js
```

- running frontend
```
cd ~/arm-wrestling-web3/frontend
python3 -m http.server 8000
```
**6. enter game**
```
http://IP:port
ex: http://23.88.48.244:8000/
```



