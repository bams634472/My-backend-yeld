# My Yelp — AWS Amplify Deployment Guide

## Prerequisites
- Node.js 18+ installed
- AWS account (free tier)
- GitHub account
- Amplify CLI: `npm install -g @aws-amplify/cli`

---

## Step 1 — Install dependencies
```bash
npm install
```

---

## Step 2 — Configure Amplify CLI
```bash
amplify configure
```
Follow the prompts: sign into AWS, choose a region (e.g. us-east-1), create an IAM user.

---

## Step 3 — Initialize Amplify in the project
```bash
amplify init
```
Answers:
- Project name: `myyelp`
- Environment: `dev`
- Default editor: your editor
- App type: `javascript`
- Framework: `react`
- Source dir: `src`
- Build dir: `build`
- Build command: `npm run build`
- Start command: `npm start`

---

## Step 4 — Add Authentication
```bash
amplify add auth
```
Select: **Default configuration** → Username → No (skip advanced settings)

---

## Step 5 — Add GraphQL API
```bash
amplify add api
```
- Select: **GraphQL**
- Name: `schoolapi`
- Auth: **Amazon Cognito User Pool**
- When asked for schema: choose **existing schema** and point to `amplify/backend/api/schoolapi/schema.graphql`

---

## Step 6 — Push to AWS
```bash
amplify push
```
This provisions Cognito + AppSync + DynamoDB tables on AWS.
It will auto-generate a real `src/aws-exports.js` replacing the placeholder.

---

## Step 7 — Push code to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/my-yelp.git
git push -u origin main
```

---

## Step 8 — Deploy to AWS Amplify Hosting
1. Go to https://console.aws.amazon.com/amplify
2. Click **New app → Host web app**
3. Connect your GitHub repo
4. Amplify auto-detects React — click **Save and deploy**
5. Wait ~3 minutes for build to complete
6. Copy the live URL (e.g. `https://dev.d31mwgf7jpvc8m.amplifyapp.com`)

---

## Step 9 — Write your URL
Open `my_yelp_url.txt` and replace the placeholder with your live URL.

---

## Features
- **Authentication** — Sign up / sign in powered by AWS Cognito
- **Businesses** — Add, search, view businesses with categories, addresses, descriptions
- **Reviews** — Add reviews with ratings (1-5 stars) and text
- **Dashboard** — Live stats: business count, review count, average rating

---

## Commit History
- `460aefc` - Updated README for My Yelp app
- `2205bd2` - Initial commit: Yelp app with Amplify backend
