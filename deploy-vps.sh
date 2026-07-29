#!/bin/bash

# ==============================================================================
# Skrip Auto-Deploy Poros Madura di VPS (Ubuntu) menggunakan Docker Compose
# ==============================================================================

# Warna output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}==> Memulai instalasi & deployment Poros Madura...${NC}"

# 1. Periksa apakah Docker sudah terinstal, jika belum install otomatis
if ! command -v docker &> /dev/null; then
    echo -e "${GREEN}==> Docker tidak ditemukan. Menginstal Docker...${NC}"
    sudo apt-get update -y
    sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    sudo systemctl start docker
    sudo systemctl enable docker
    echo -e "${GREEN}==> Docker berhasil diinstal.${NC}"
else
    echo -e "${GREEN}==> Docker sudah terinstal.${NC}"
fi

# 2. Periksa apakah Docker Compose v2 terinstal
if ! docker compose version &> /dev/null; then
    echo -e "${GREEN}==> Docker Compose tidak ditemukan. Menginstal Docker Compose...${NC}"
    sudo apt-get update -y
    sudo apt-get install -y docker-compose-plugin
    echo -e "${GREEN}==> Docker Compose berhasil diinstal.${NC}"
else
    echo -e "${GREEN}==> Docker Compose v2 sudah terinstal.${NC}"
fi

# 3. Membuat file .env untuk production jika belum ada
if [ ! -f .env ]; then
    echo -e "${GREEN}==> Membuat file .env untuk konfigurasi rahasia...${NC}"
    JWT_SEC=$(openssl rand -base64 32 | tr -d '\n')
    JWT_REF=$(openssl rand -base64 32 | tr -d '\n')
    DB_PASS=$(openssl rand -base64 12 | tr -d '\n' | tr -dc 'a-zA-Z0-9')
    
    cat <<EOT > .env
# Konfigurasi Database
DB_USER=postgres
DB_PASSWORD=${DB_PASS}
DB_NAME=porosmadura

# Kunci JWT Rahasia
JWT_SECRET=${JWT_SEC}
JWT_REFRESH_SECRET=${JWT_REF}

# API Keys untuk AI News Generator (Scraping)
GEMINI_API_KEY=""
XIEQA_API_KEY=""
EOT
    echo -e "${GREEN}==> File .env berhasil dibuat dengan password database & token acak baru.${NC}"
fi

# 4. Menjalankan Container
echo -e "${GREEN}==> Menjalankan Docker Compose (build & start)...${NC}"
sudo docker compose down
sudo docker compose up -d --build

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN} Sukses! Aplikasi Poros Madura telah online.${NC}"
echo -e "${GREEN} Frontend: http://localhost (Port 80)${NC}"
echo -e "${GREEN} Backend API: http://localhost/api (Port 80/api)${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "Gunakan perintah 'sudo docker compose logs -f' untuk memantau log aplikasi."
