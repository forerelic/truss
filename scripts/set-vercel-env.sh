#!/bin/bash

# Set environment variables for Vercel production deployment

echo "Setting production environment variables for Vercel..."

# Production Supabase configuration
echo "https://ukidaidmoabldoanzqer.supabase.co" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVraWRhaWRtb2FibGRvYW56cWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MTUzOTEsImV4cCI6MjA3NTQ5MTM5MX0.c5IUIEJ0kukdZ3q7fCr-5eb7lpRyeZcY9kIXB3QG_uA" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "postgresql://postgres:IOlK7FZM0A0eOsIU@db.ukidaidmoabldoanzqer.supabase.co:5432/postgres" | npx vercel env add DATABASE_URL production
echo "ccBKsiONyLw3rlOAcP3CFBPaDi7rCCH8B4hYrTewgDA=" | npx vercel env add BETTER_AUTH_SECRET production
echo "https://truss.vercel.app" | npx vercel env add NEXT_PUBLIC_APP_URL production

# Also set for preview environments
echo "https://ywyxkdliofibqvjmhxwn.supabase.co" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL preview
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3eXhrZGxpb2ZpYnF2am1oeHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NTQ1NzAsImV4cCI6MjA3NTUzMDU3MH0.sWtQWJiujuHwts6VjT_iH8BUxfKYub2Sxn_aPuRO130" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
echo "postgresql://postgres:IOlK7FZM0A0eOsIU@db.ywyxkdliofibqvjmhxwn.supabase.co:5432/postgres" | npx vercel env add DATABASE_URL preview
echo "ccBKsiONyLw3rlOAcP3CFBPaDi7rCCH8B4hYrTewgDA=" | npx vercel env add BETTER_AUTH_SECRET preview
echo "https://truss.vercel.app" | npx vercel env add NEXT_PUBLIC_APP_URL preview

echo "Environment variables set successfully!"