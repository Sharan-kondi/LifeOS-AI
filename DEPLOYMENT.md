# 100% Free LifeOS AI Deployment Guide

This guide details how to deploy the entire LifeOS AI platform completely **free of cost**, using modern cloud hosting platforms that offer generous free tiers.

---

## 🚀 The 100% Free Stack Architecture

```mermaid
graph TD
    User([User's Browser]) -->|HTTPS| Vercel[Vercel: Frontend UI <br/> Free forever]
    Vercel -->|HTTP API calls| Render[Render: Node Express Backend <br/> Free Web Service]
    Render -->|SQL Queries| Neon[Neon: Serverless PostgreSQL <br/> Free forever]
    Render -->|JSON HTTP requests| HF[Hugging Face Spaces: FastAPI AI Services <br/> Free Docker - 16GB RAM]
    HF -.->|LLM reasoning| Gemini[Gemini API <br/> Free/Hobby Key]
```

### Free Tier Providers:
1. **Frontend**: [Vercel](https://vercel.com/) (Free forever for personal projects).
2. **Backend API**: [Render](https://render.com/) (Free tier Node.js hosting).
3. **PostgreSQL Database**: [Neon.tech](https://neon.tech/) (Free serverless database, doesn't expire).
4. **AI Microservice**: [Hugging Face Spaces](https://huggingface.co/spaces) (Free Docker container hosting with **16GB RAM / 2 vCPUs** — necessary to run Keras/TensorFlow and Prophet models without memory crashes).

---

## Step 1: Set Up the PostgreSQL Database (Neon.tech)

We use Neon because Render's free database expires after 90 days, while Neon's serverless Postgres database remains free forever.

1. Sign up on [Neon Console](https://neon.tech/).
2. Create a new project called `lifeos-db` and select **PostgreSQL 15** or **16**.
3. In the dashboard, copy the **Connection String** from the homepage (make sure **Prisma** is selected). It should look like this:
   ```env
   postgres://alex:pwd@ep-cool-wood-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this string; you will need it for the Node backend.

---

## Step 2: Deploy the AI Python Service (Hugging Face Spaces)

Because FastAPI loads heavy TensorFlow/Keras and Prophet models, it requires at least **1GB of RAM** to start. Standard free hosts (like Render) limit memory to 512MB, causing immediate Out-of-Memory (OOM) crashes. 
Hugging Face Spaces offers a **100% Free Docker hosting tier with 16GB RAM and 2 vCPUs**.

### Instructions:
1. Sign up on [Hugging Face](https://huggingface.co/).
2. Click your profile icon in the top right -> **New Space**.
3. Configure the Space settings:
   - **Space Name**: `lifeos-ai-service`
   - **SDK**: Select **Docker** (very important).
   - **Template**: Choose **Blank** (do not select Gradio/Streamlit templates).
   - **Space License**: Apache 2.0.
   - **Visibility**: Public (this allows your Node backend to send HTTP requests to it).
4. Create the Space.
5. Hugging Face will generate a Git repository for your Space. Clone it and copy the contents of the `ai-services` folder, the `ml-models` folder, and the `datasets` folder into it:
   - Make sure your directory structure in the space looks like this:
     ```
     ├── Dockerfile
     ├── requirements.txt
     ├── app/
     │   └── main.py
     ├── datasets/
     │   └── exports/
     └── ml-models/
     ```
   - *Tip: You can use the Hugging Face web interface to upload files directly if you prefer.*
6. Set the Space **Repository Secrets** (equivalent to `.env` variables):
   - Go to your Space **Settings** -> **Variables and secrets** section.
   - Click **New Secret** and add:
     - Name: `GOOGLE_API_KEY`
     - Value: `AIzaSyAJ-Pfi4iezpsBYHMR1Ok43vB32MCRwbIM`
7. Hugging Face will automatically detect the `Dockerfile`, build your container, and start the FastAPI service.
8. Once built and running, copy your Space's public API URL. It will look like:
   ```
   https://<username>-lifeos-ai-service.hf.space
   ```
   *(Test it by opening `https://<username>-lifeos-ai-service.hf.space/docs` in your browser to see the FastAPI Swagger UI).*

---

## Step 3: Deploy the Node.js Backend API (Render)

1. Sign up or log in to [Render](https://render.com/).
2. Click **New +** (top right) -> **Web Service**.
3. Select **Connect GitHub** and choose your `LifeOS-AI` repository.
4. Configure the Web Service settings:
   - **Name**: `lifeos-backend`
   - **Root Directory**: `backend`
   - **Language**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm run dev`
5. Scroll down and click **Advanced** -> **Add Environment Variable**:
   - `DATABASE_URL`: *(Your Neon Connection String)*
   - `JWT_SECRET`: `lifeos_secret`
   - `PORT`: `5000`
   - `AI_SERVICE_URL`: *(Your Hugging Face Space URL, e.g., `https://username-lifeos-ai-service.hf.space`)*
   - `FRONTEND_URL`: `https://lifeos-frontend.vercel.app` *(update this after creating the Vercel frontend below)*
6. Click **Create Web Service**. Render will start compiling and deploying your backend.
7. **Migrate & Seed the Database**:
   Once Render displays `Live`, open the **Shell** tab in the Render sidebar and run these commands to create tables and import your transaction history:
   ```bash
   npx prisma db push
   npx ts-node src/seed/seedUsers.ts
   npx ts-node src/seed/seedTransactions.ts
   npx ts-node src/seed/seedSubscriptions.ts
   npx ts-node src/seed/seedProductivity.ts
   npx ts-node src/seed/seedAnomalies.ts
   ```
8. Copy your Render API domain (e.g., `https://lifeos-backend.onrender.com`).

---

## Step 4: Deploy the Next.js Frontend UI (Vercel)

1. Sign up or log in to [Vercel](https://vercel.com/) (choose **Hobby** free plan).
2. Click **Add New** -> **Project**.
3. Import your `LifeOS-AI` repository from GitHub.
4. Configure Project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `pnpm run build` *(Vercel auto-configures node/pnpm packages)*
5. Expand the **Environment Variables** section and add:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: *(Your Render backend URL + `/api`, e.g., `https://lifeos-backend.onrender.com/api`)*
6. Click **Deploy**. Vercel will build and deploy your app in about 1-2 minutes.
7. Vercel will generate a domain name (e.g., `https://lifeos-ai-frontend.vercel.app`).
8. **Final Step**: Go back to your Render Web Service dashboard, click **Environment**, and update the `FRONTEND_URL` variable to match this Vercel domain. This ensures that CORS requests are fully allowed.

---

### 🎉 You are Done!
Your platform is now fully deployed and active online for free:
- Log in to your Vercel URL.
- Use any of the 15 pre-configured demo users to autofill credentials and explore the financial trends, ML anomaly graphs, and AI Assistant reasoning!
