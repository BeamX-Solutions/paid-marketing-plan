# Marketing Plan Generator Setup Guide

This application is now restructured with a separate Node.js backend and React frontend.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## Project Structure

```
marketing-plan-generator/
├── backend/          # Node.js Express API
│   ├── src/
│   ├── prisma/
│   └── package.json
├── frontend/         # React application
│   ├── src/
│   ├── public/
│   └── package.json
└── setup.md          # This file
```

## Setup Instructions

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your actual API keys:
   - `JWT_SECRET`: A secure random string for JWT signing
   - `ANTHROPIC_API_KEY`: Your Anthropic Claude API key
   - `RESEND_API_KEY`: Your Resend email service API key (optional for email features)

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   The default configuration should work with the backend running on port 5000.

4. Start the frontend development server:
   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`

## Running the Application

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm start`
3. Open `http://localhost:3000` in your browser

## API Endpoints

- **Authentication**
  - `POST /api/auth/register` - Register new user
  - `POST /api/auth/login` - Login user

- **Marketing Plans**
  - `POST /api/plans/create` - Create new plan
  - `GET /api/plans` - Get user's plans
  - `GET /api/plans/:id` - Get specific plan
  - `POST /api/plans/:id/generate` - Generate plan content with AI
  - `DELETE /api/plans/:id` - Delete plan

- **Analytics**
  - `POST /api/analytics/track` - Track events
  - `GET /api/analytics/dashboard` - Get dashboard data

- **Email**
  - `POST /api/email/send-plan/:planId` - Share plan via email
  - `POST /api/email/welcome` - Send welcome email

## Building for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

The built files will be in the `frontend/build` directory.

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-super-secret-jwt-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
RESEND_API_KEY=your-resend-api-key-here
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Features

- User authentication with JWT
- Create and manage marketing plans
- AI-powered plan generation using Claude
- Email sharing functionality
- Analytics dashboard
- Responsive design
- TypeScript for type safety
- Proper error handling

## Troubleshooting

1. **Port already in use**: Make sure ports 3000 and 5000 are available
2. **Database errors**: Run `npx prisma db push` in the backend directory
3. **API key errors**: Ensure your environment variables are set correctly
4. **CORS errors**: Check that FRONTEND_URL is set correctly in backend .env

## Development Tips

- Use `npm run lint` in both directories to check for code issues
- The frontend has a proxy configured to work with the backend during development
- Database changes require running `npx prisma db push` and `npx prisma generate`