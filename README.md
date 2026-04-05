# whiteven
ระบบเลือกตั้งเเบบ Blockchain ชื่อคนโหวตเป็นไปไม่ได้ที่จะรู้, ทุกคนสามารถตรวจสอบการโหวตได้ เเม้กระทั่งประชาชนทั่วไป, ต้นทุนตํ่า, รู้ผลโหวตทันที, โกงการนับไม่ได้

## Setup
โหลด Rust, Solana CLI, Anchor Framework บน Windows (WSL), Linux, Mac.

https://www.anchor-lang.com/docs/installation

```bash
# เช็ค Rust version:
rustc --version

# เช็ค Solana CLI version:
solana --version

# เช็ค Anchor CLI version:
anchor --version

# ดู config:
solana config get

# เปลี่ยนเป็น devnet:
solana config set --url devnet

# สร้าง wallet ใหม่:
solana-keygen new

# Request airdrop ของ devnet SOL:
solana airdrop 5

# ดู balance:
solana balance
```

### เตรียม Project
```bash
# โคลน repo
git clone https://github.com/...

# สร้าง node modules
yarn
```

## Start

### สร้าง Program
```bash
# มันจะสร้าง keypair ใหม่เองถ้ายังไม่มี
anchor build

# Sync all keys:
anchor keys sync

# ถ้า program_id ใน lib.rs เปลี่ยนให้สร้าง program ใหม่
anchor build
```

### Deploy program

```bash
# เปลี่ยนเป็น Devnet
solana config set --url devnet

# ต้องมี SOL ในนี้เพราะการ Deploy ต้องใช้ SOL
solana balance

# Deploy
anchor deploy
```

### Tests
