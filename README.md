What Worked For Me (WWFM)
A platform that organizes solutions by effectiveness, helping people discover what actually works for their goals based on community experiences.
Vision
WWFM helps people achieve their goals by organizing information around effectiveness rather than marketing. We collect real user experiences to rank solutions based on what actually works, not what's advertised most heavily.
Project Status
This project is currently in early development. We are building the foundation and core features.
Tech Stack

Frontend: Next.js, React, TypeScript, Tailwind CSS
Backend: Node.js, Express (via Next.js API routes)
Database: PostgreSQL (via Supabase)
Hosting: Vercel
Authentication: Supabase Auth

Getting Started
Prerequisites
Before you begin, make sure you have these programs installed on your computer:

Node.js (version 16 or newer) - This runs JavaScript on your computer
npm or yarn - These help install and manage code packages
A Supabase account - This provides our database and user login system

Step-by-Step Installation

Copy this project to your computer
Open your terminal or command prompt and type these commands:
git clone https://github.com/jandy1990/wwfm-platform.git
cd wwfm-platform
This downloads all the project files and moves you into the project folder.
Install all necessary code packages
In the same terminal window, type:
npm install
Or if you use yarn:
yarn
This installs all the required code libraries the project needs to run.
Set up your private settings
cp .env.example .env.local
This creates a new file called .env.local by copying the example file.
Next, open the new .env.local file in any text editor and replace the placeholder values with your own Supabase account information.
Start the development server
In your terminal, type:
npm run dev
Or with yarn:
yarn dev
This starts the project on your computer.
View the website
Open your web browser and go to:
http://localhost:3000
You should now see the WWFM website running on your own computer!

Project Structure
This section will be updated as we develop the project structure.
Contributing
As this project is in early development, please reach out before making contributions. We're still establishing the core architecture and development practices.
License
Copyright (c) 2025 jandy1990
All rights reserved.
