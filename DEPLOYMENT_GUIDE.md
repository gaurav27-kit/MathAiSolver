# Step-by-Step Deployment Guide

This guide will walk you through deploying your `maths_solver` application to a cloud server (like DigitalOcean, AWS, Linode, etc.) using Docker and MongoDB Atlas.

---

## Step 1: Push Your Code to GitHub
First, you need to get your code off your local computer and onto GitHub so your server can download it.

1. Open your terminal in the `maths_solver` folder.
2. Initialize git (if you haven't already):
   ```bash
   git init
   ```
3. Add all your files:
   ```bash
   git add .
   ```
4. Commit your changes:
   ```bash
   git commit -m "Ready for production deployment"
   ```
5. Go to [GitHub.com](https://github.com/), create a new repository (make it Private or Public).
6. Follow the instructions on GitHub to push your code. It usually looks like this:
   ```bash
   git remote add origin https://github.com/yourusername/maths_solver.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Set Up MongoDB Atlas
We need a production database in the cloud.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Build a Database (choose the **Free Tier / M0 Sandbox**).
3. Under **Security > Database Access**, create a new database user. Give them a username and a strong password. (Save this password!)
4. Under **Security > Network Access**, click "Add IP Address". Choose **"Allow Access from Anywhere"** (or `0.0.0.0/0`).
5. Go to **Databases**, click **Connect**, choose **"Connect your application"**, and copy the connection string. It will look like this:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`
6. Replace `<password>` with the password you just created, and add your database name (`maths_solver`) before the `?`. It should now look like:
   `mongodb+srv://admin:myStrongPassword123@cluster0.mongodb.net/maths_solver?retryWrites=true&w=majority`

---

## Step 3: Set up Your Cloud Server (VPS)
You need a server to run your Docker containers. [DigitalOcean Droplets](https://www.digitalocean.com/products/droplets/) or AWS EC2 instances are great for this.

1. Rent a server with **Ubuntu** installed (a $5 or $6/month server is plenty).
2. SSH into your server using your terminal:
   ```bash
   ssh root@your_server_ip
   ```
3. Install **Docker** and **Docker Compose** on your server. Run these commands:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo apt-get install docker-compose-plugin
   ```

---

## Step 4: Deploy Your App
Now we bring the code and the database together on the server.

1. Still logged into your server, clone your GitHub repository:
   ```bash
   git clone https://github.com/yourusername/maths_solver.git
   cd maths_solver
   ```
2. Create the `.env` file that the backend needs. Run:
   ```bash
   nano backend/.env
   ```
3. Paste the following into the file, using your real MongoDB Atlas URI and a random secret string:
   ```env
   MONGODB_URI="mongodb+srv://<YOUR_USERNAME>:<YOUR_PASSWORD>@cluster0.mongodb.net/maths_solver?retryWrites=true&w=majority"
   SESSION_SECRET="put_some_long_random_string_here"
   PORT=8080
   NODE_ENV=production
   ```
4. Press `Ctrl + O`, then `Enter` to save. Press `Ctrl + X` to exit Nano.
5. Start the application! Run:
   ```bash
   docker compose up -d --build
   ```

---

## Step 5: Test It Out!
Docker will download the images, build your backend, build your frontend, and start the Nginx server on port 80.

1. Open your web browser.
2. Type in your server's IP address (e.g., `http://123.45.67.89`).
3. You should see your MathAI Solver frontend load immediately!
4. Try to register a new account. Nginx will route the request to the backend, the backend will talk to MongoDB Atlas, and it will succeed!

**Congratulations! Your app is live.**
