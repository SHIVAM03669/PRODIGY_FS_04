# Real-Time Chat Application

A modern, real-time chat application built with React, Node.js, Express, Socket.IO, and MongoDB. Features user authentication, real-time messaging, file uploads, and room-based chat functionality.

## 🚀 Features

- **Real-time Messaging**: Instant message delivery using Socket.IO
- **User Authentication**: Secure login and registration with JWT tokens
- **Chat Rooms**: Create and join different chat rooms
- **File Uploads**: Share images and files in conversations
- **Online Status**: See who's currently online
- **Modern UI**: Beautiful Material-UI based interface
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Material-UI (MUI)** - UI component library
- **Socket.IO Client** - Real-time communication
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
PRODIGY_FS_04/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── auth/      # Authentication components
│   │   │   └── chat/      # Chat components
│   │   ├── contexts/      # React contexts
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                # Node.js backend
│   ├── routes/           # API routes
│   ├── controllers/      # Route controllers
│   ├── models/          # MongoDB models
│   ├── uploads/         # File uploads directory
│   ├── app.js           # Main server file
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PRODIGY_FS_04
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**

   Create a `.env` file in the `server` directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/chat-app
   JWT_SECRET=your-secret-key-here
   PORT=5000
   ```

   For MongoDB Atlas, use your connection string:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chat-app
   ```

5. **Start the backend server**
   ```bash
   cd server
   npm start
   ```
   The server will run on `http://localhost:5000`

6. **Start the frontend application**
   ```bash
   cd client
   npm start
   ```
   The React app will run on `http://localhost:3000`

## 📖 Usage

1. **Register/Login**: Create an account or sign in with existing credentials
2. **Join/Create Rooms**: Create new chat rooms or join existing ones
3. **Start Chatting**: Send messages in real-time
4. **Share Files**: Upload and share images with other users
5. **See Online Users**: View who's currently online

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Rooms
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create a new room
- `GET /api/rooms/:id` - Get room details

### Messages
- `GET /api/messages/:roomId` - Get messages for a room
- `POST /api/messages` - Send a new message

### File Upload
- `POST /api/upload` - Upload files/images

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- Secure file upload handling

## 🎨 UI Features

- Material-UI components for consistent design
- Responsive layout for mobile and desktop
- Dark/light theme support
- Real-time online status indicators
- File upload progress indicators

## 🚀 Deployment

### Backend Deployment (Heroku/Netlify)
1. Set environment variables in your hosting platform
2. Deploy the `server` directory
3. Ensure MongoDB connection is configured

### Frontend Deployment (Vercel/Netlify)
1. Build the React app: `npm run build`
2. Deploy the `build` folder
3. Update API endpoints to point to your deployed backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Created as part of the PRODIGY_FS_04 project.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally or your Atlas connection string is correct
   - Check if the database name in the connection string exists

2. **Port Already in Use**
   - Change the PORT in the .env file
   - Kill processes using the default port

3. **CORS Errors**
   - Ensure the frontend URL is allowed in the CORS configuration
   - Check if the backend is running on the correct port

4. **Socket.IO Connection Issues**
   - Verify the backend server is running
   - Check if the Socket.IO client is connecting to the correct URL

## 📞 Support

For support and questions, please open an issue in the repository. 