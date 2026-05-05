FROM node:18-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# Instala dependências de produção
RUN npm install --production

# Copia o restante dos arquivos da API
COPY . .

# Porta padrão do serviço
EXPOSE 10000

# Comando para iniciar (ajuste para index.js se necessário)
CMD ["node", "server.js"]