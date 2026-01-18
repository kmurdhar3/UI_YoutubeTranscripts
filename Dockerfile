FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Add your Supabase credentials here
ENV NEXT_PUBLIC_SUPABASE_URL=https://buyzgatijpqziwutygzr.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1eXpnYXRpanBxeml3dXR5Z3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MDAyNjgsImV4cCI6MjA4MTQ3NjI2OH0.9m8jJFIgGsgsnH07GCgXs7MgIFTo5_HI3xsrGnJj23s

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
