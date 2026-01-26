FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RAZORPAY_KEY_ID=rzp_live_S7iRzAnpi1Y6Kq
RAZORPAY_KEY_SECRET=4OSsJy75yTyamZI6uWqBIu2Q
RAZORPAY_WEBHOOK_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

 
# Add your Supabase credentials here
ENV NEXT_PUBLIC_SUPABASE_URL=
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080
ENV PORT=8080

CMD ["npm", "start"]
