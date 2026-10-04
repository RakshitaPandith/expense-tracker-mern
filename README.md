# Expense Tracker - MERN Stack

A full-stack Expense Tracker and Finance Dashboard built with the MERN stack. The application allows users to securely manage their income and expenses and view their financial activity through an interactive dashboard.

## Features

- User registration and login
- JWT-based authentication
- Add, edit and delete income transactions
- Add, edit and delete expense transactions
- Dashboard with financial overview
- Total balance calculation
- Monthly income and expense tracking
- Savings rate calculation
- Spending by category
- Daily income trends
- Daily expense trends
- Recent transactions
- Income and expense statistics
- Responsive user interface
- MongoDB database integration

## Tech Stack

### Frontend

- React.js
- Vite
- React Router
- Axios
- Recharts
- Tailwind CSS
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)

## Project Structure

```text
expense-tracker-mern/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── eslint.config.js
│
├── .gitignore
└── README.md