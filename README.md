# Consultant Booking Platform

A full-stack web application for booking consultants, managing appointments, and handling user profiles. The platform supports multiple user roles with Google OAuth authentication.

## Features

- 👥 Multiple user roles (clients, consultants, admins)
- 🔐 Google OAuth authentication
- 📅 Advanced booking system
- 📄 Document upload support
- 💼 Consultant profile management
- 📱 Responsive design

## Tech Stack

### Frontend
- React
- Tailwind CSS
- Context API
- SWR for data fetching
- Heroicons for UI components

### Backend
- Node.js
- Express
- MongoDB
- Redis for caching
- JWT + Google OAuth

## Getting Started

### Prerequisites
- Node.js >= 14
- MongoDB
- Redis
- Google OAuth credentials

### Installation

1. Clone the repository
```bash
git clone https://github.com/Aymen-benYedder/Consultant.git
cd Consultant
```

2. Install dependencies for both frontend and backend
```bash
# Install backend dependencies
cd consultant-backend
npm install

# Install frontend dependencies
cd ../consultant-frontend
npm install
```

3. Set up environment variables

Backend (.env):
```env
PORT=8000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
REDIS_URL=your_redis_url
```

Frontend (.env):
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

4. Start the development servers

Backend:
```bash
cd consultant-backend
npm run dev
```

Frontend:
```bash
cd consultant-frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api

## Project Structure

```
consultant/
├── consultant-frontend/     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # Context providers
│   │   ├── services/       # API services
│   │   ├── store/         # State management
│   │   └── utils/         # Utility functions
│   └── package.json
│
└── consultant-backend/     # Express backend
    ├── src/
    │   ├── controllers/   # Route controllers
    │   ├── middleware/    # Express middleware
    │   ├── models/        # Mongoose models
    │   ├── routes/        # API routes
    │   └── utils/         # Utility functions
    └── package.json
```

## API Documentation

Detailed API documentation can be found in the [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) file.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
