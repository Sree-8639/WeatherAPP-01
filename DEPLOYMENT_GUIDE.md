# 🚀 Complete Deployment Guide - Render

This guide walks you through deploying the Weather APP to Render for continuous 24/7 operation.

---

## 📋 Prerequisites

Before you start, ensure you have:
- ✅ GitHub account (already have: Sree-8639/WeatherAPP-01)
- ✅ Render account (free to create)
- ✅ Active internet connection
- ✅ Valid payment method (for Starter plan)

---

## 🎯 Step-by-Step Deployment

### **Step 1: Create Render Account**

1. Go to [https://render.com](https://render.com)
2. Click **"Sign Up"** button
3. Choose **"Sign up with GitHub"**
4. Authorize Render to access your GitHub account
5. Complete your profile setup

---

### **Step 2: Connect Your GitHub Repository**

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** in the top right
3. Select **"Web Service"**
4. Click **"Deploy an existing repository"**
5. In the popup, search for: `WeatherAPP-01`
6. Click **"Connect"** next to your repository
7. Authorize Render to access your GitHub

---

### **Step 3: Configure Web Service**

#### **Basic Configuration:**

| Field | Value |
|-------|-------|
| **Name** | `weather-app` (or any name you prefer) |
| **Environment** | `Node` |
| **Region** | Select nearest to you (e.g., `Frankfurt`, `Singapore`, `US Oregon`) |
| **Branch** | `main` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

#### **Step-by-step:**

1. **Name your service:**
   - Field: `Name`
   - Enter: `weather-app`

2. **Set environment:**
   - Field: `Environment`
   - Select: `Node`

3. **Choose region:**
   - Field: `Region`
   - Select your preferred region (closer = lower latency)

4. **Set branch:**
   - Field: `Branch`
   - Already set to: `main` ✓

5. **Build command:**
   - Field: `Build Command`
   - Should show: `npm install` ✓

6. **Start command:**
   - Field: `Start Command`
   - Should show: `npm start` ✓

---

### **Step 4: Configure Plan (IMPORTANT!)**

This is crucial for continuous 24/7 operation:

1. Scroll down to **"Plan"** section
2. **DO NOT select Free** ❌ (spins down after 15 minutes)
3. **SELECT "Starter"** ✅ ($7/month, runs 24/7)
4. The plan will show:
   - 750 hours/month (enough for 24/7 operation)
   - Automatic restart on failure
   - Health checks enabled

---

### **Step 5: Add Environment Variables (Optional)**

If you're using OpenWeatherMap API:

1. Scroll to **"Environment"** section
2. Click **"Add Environment Variable"**
3. Add the following:

```
Key:   OPENWEATHER_API_KEY
Value: your-openweathermap-api-key
```

To get your API key:
- Go to [https://openweathermap.org/api](https://openweathermap.org/api)
- Sign up (free tier available)
- Get your API key from account settings

---

### **Step 6: Review Configuration**

Before deploying, verify:

```
✅ Name: weather-app
✅ Environment: Node
✅ Region: [Your selected region]
✅ Branch: main
✅ Build Command: npm install
✅ Start Command: npm start
✅ Plan: Starter ($7/month)
✅ render.yaml: Detected ✓
✅ .nvmrc: Detected ✓
```

---

### **Step 7: Deploy!**

1. Scroll to the bottom
2. Click **"Create Web Service"** button
3. Watch the deployment logs in real-time:
   - 🔵 **Building** - Installing dependencies
   - 🔵 **Deploying** - Starting server
   - 🟢 **Live** - Service is running

---

### **Step 8: Verify Deployment**

Once deployment shows **"Live"** (green):

1. **Get your live URL:**
   - Displayed at top of the service page
   - Format: `https://weather-app-xxxxx.onrender.com`

2. **Test the app:**
   - Open your browser
   - Navigate to: `https://weather-app-xxxxx.onrender.com`
   - Should load the weather app immediately

3. **Test health check:**
   - Navigate to: `https://weather-app-xxxxx.onrender.com/health`
   - Should return:
   ```json
   {
     "status": "OK",
     "timestamp": "2026-05-24T10:30:45.123Z",
     "service": "Weather APP"
   }
   ```

4. **Test API info endpoint:**
   - Navigate to: `https://weather-app-xxxxx.onrender.com/api/info`
   - Should return service information

---

## 📊 Monitoring & Management

### **View Logs:**
1. Go to your service on Render Dashboard
2. Click **"Logs"** tab
3. View real-time server logs
4. Useful for debugging

### **View Metrics:**
1. Go to **"Metrics"** tab
2. Monitor:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

### **Redeploy:**
1. Click **"Manual Deploy"** button
2. Select **"Deploy latest commit"**
3. Renders deploys the latest version

### **View Deployments:**
1. Click **"Deployments"** tab
2. See all deployment history
3. Rollback to previous versions if needed

---

## 🔄 Auto-Deploy on GitHub Push

Your service is configured for **auto-deploy**:

1. When you push to `main` branch on GitHub
2. Render automatically detects the change
3. Builds and deploys automatically
4. **Zero downtime** - smooth transition

**To trigger auto-deploy:**
```bash
# Make a change locally
git add .
git commit -m "your message"
git push origin main

# Render automatically deploys within 1-2 minutes
```

---

## 🔐 Environment Variables

### **View/Edit Variables:**
1. Go to service page
2. Click **"Environment"** tab
3. View or modify variables
4. Changes take effect on next deployment

### **Common Variables:**
```
NODE_ENV = production
PORT = automatically set by Render
OPENWEATHER_API_KEY = your-api-key (if needed)
```

---

## 🚨 Troubleshooting

### **Service won't start:**
1. Check **Logs** tab for errors
2. Verify `npm start` works locally:
   ```bash
   npm install
   npm start
   ```
3. Check for missing dependencies in `package.json`

### **App is slow:**
1. Check **Metrics** tab
2. Upgrade to higher plan if needed
3. Optimize code if possible

### **Health check failing:**
1. Service automatically restarts
2. Check `/health` endpoint in logs
3. Verify server.js has health check

### **Can't connect to live URL:**
1. Wait 2-3 minutes for DNS propagation
2. Check if service status is **"Live"** (green)
3. Try incognito/private browsing
4. Check browser console for errors

---

## 💰 Cost Breakdown

| Plan | Cost | Hours/Month | Best For |
|------|------|------------|----------|
| Free | $0 | 750 (spins down) | Development |
| Starter | $7 | 750 (always running) | **Production** ✅ |
| Standard | $12 | 750 (always running) | High traffic |

---

## 🎉 Success!

Your weather app is now:
- ✅ **Live on the internet** at `https://weather-app-xxxxx.onrender.com`
- ✅ **Running 24/7** continuously
- ✅ **Auto-restarting** if it crashes
- ✅ **Auto-deploying** on GitHub pushes
- ✅ **Monitored** with health checks
- ✅ **Accessible globally** from anywhere

---

## 📞 Support

**For Render Support:**
- Docs: [https://render.com/docs](https://render.com/docs)
- Email: support@render.com
- Status: [https://status.render.com](https://status.render.com)

**For Weather App Issues:**
- GitHub Issues: [https://github.com/Sree-8639/WeatherAPP-01/issues](https://github.com/Sree-8639/WeatherAPP-01/issues)
- Check logs on Render Dashboard

---

## 🔗 Your Live App

Once deployed, your app will be accessible at:

```
https://weather-app-xxxxx.onrender.com
```

(Replace `xxxxx` with your unique service ID)

Share this URL with anyone to let them use your weather app!

---

**Last Updated:** May 24, 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
