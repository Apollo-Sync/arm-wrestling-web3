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
