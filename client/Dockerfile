FROM node:20

WORKDIR /app

# Copy only package files
COPY package.json package-lock.json ./

# Clean install (VERY IMPORTANT)
RUN npm ci --legacy-peer-deps

# Copy rest of code
COPY . .

# Build
RUN npm run build

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]


CMD ["serve", "-s", "dist", "-l", "3000"]