# Warehouse Quality Control App

A comprehensive warehouse quality control application designed for operations teams to conduct efficient two-level QC processes on incoming shipments from suppliers.

## 🚀 Features

### Two-Level QC Workflow
- **Level 1 QC**: Initial receiving checks (packaging, documentation, quantity)
- **Level 2 QC**: Detailed unit-level inspection (functionality, specifications, labeling)

### User Experience
- Mobile-first responsive design optimized for warehouse environments
- Large touch-friendly interface suitable for warehouse gloves and tablets
- Color-coded status system for instant visual feedback
- Real-time progress tracking and completion indicators
- Barcode scanning simulation for efficient item identification
- Photo capture capabilities for quality documentation

### Process Management
- Digital signatures and inspector tracking for accountability
- Issue reporting and resolution workflow
- Real-time dashboard with analytics and status tracking
- Role-based access control (Inspector/Supervisor)
- Comprehensive audit trail and QC history

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Vite** for development and building

### Backend
- **Node.js** with Express.js
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## 🚀 Getting Started

### 0. Repository
```bash
git clone https://github.com/Mukulraj109/assign.git
cd assign
```

### 1. Clone the Repository
```bash
git clone https://github.com/Mukulraj109/assign.git
cd assign
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
JWT_SECRET=your-secret-key-here
PORT=3001
```

### 4. Start the Application

#### Development Mode (Frontend + Backend)
```bash
npm run dev:full
```

#### Start Backend Only
```bash
npm run dev:server
```

#### Start Frontend Only
```bash
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

## 👥 Demo Accounts

The application comes with pre-configured demo accounts for testing:

### Inspector Account
- **Username**: `inspector1`
- **Password**: `password`
- **Role**: Inspector (can perform QC operations)

### Supervisor Account
- **Username**: `supervisor1`
- **Password**: `password`
- **Role**: Supervisor (can view all operations and analytics)

## 📱 Usage Guide

### 1. Login
- Use the demo credentials or create new accounts
- The system supports role-based access control

### 2. Dashboard
- View all active shipments and their QC status
- Monitor pending Level 1 and Level 2 QC tasks
- Access real-time statistics and analytics

### 3. Level 1 QC Process
1. Select a pending shipment from the dashboard
2. Click "Start Level 1 QC"
3. Complete the following checks:
   - Packaging condition inspection
   - Documentation verification
   - Quantity count validation
   - Temperature requirements check
   - Labeling and identification review
4. Add inspector name and notes
5. Complete the Level 1 QC process

### 4. Level 2 QC Process
1. After Level 1 passes, start Level 2 QC
2. Inspect each item individually:
   - Visual inspection for defects
   - Functionality testing
   - Individual packaging check
   - Specifications verification
   - Product labeling validation
3. Record actual quantities and report issues
4. Complete QC for all items in the shipment

### 5. Shipment Details
- View comprehensive shipment information
- Track QC history and inspector details
- Review reported issues and resolutions

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Shipments
- `GET /api/shipments` - Get all shipments
- `GET /api/shipments/:id` - Get specific shipment
- `POST /api/shipments` - Create new shipment
- `PUT /api/shipments/:id` - Update shipment
- `DELETE /api/shipments/:id` - Delete shipment

### Quality Control
- `POST /api/qc/level1/:shipmentId/complete` - Complete Level 1 QC
- `POST /api/qc/level2/:shipmentId/items/:itemId/complete` - Complete Level 2 QC
- `POST /api/qc/photos/:shipmentId` - Upload QC photos
- `GET /api/qc/history/:shipmentId` - Get QC history
- `GET /api/qc/stats` - Get QC statistics

## 📁 Project Structure

```
warehouse-qc-app/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Level1QC.tsx     # Level 1 QC interface
│   │   ├── Level2QC.tsx     # Level 2 QC interface
│   │   ├── Login.tsx        # Authentication
│   │   └── ...
│   ├── context/             # React context providers
│   ├── services/            # API service layer
│   └── ...
├── server/                  # Backend server
│   ├── routes/              # API routes
│   ├── middleware/          # Express middleware
│   └── index.cjs           # Server entry point
├── public/                  # Static assets
└── ...
```

## 🔒 Security Features

- JWT-based authentication with token expiration
- Role-based access control
- File upload validation and size limits
- CORS configuration for secure cross-origin requests
- Password hashing with bcrypt

## 📊 Key Metrics & Analytics

The application tracks important QC metrics:
- Total shipments processed
- QC completion rates
- Inspector performance statistics
- Issue identification and resolution rates
- Time-to-completion analytics

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

## 🔄 Version History

- **v1.0.0** - Initial release with two-level QC workflow
- Full authentication system
- Real-time dashboard and analytics
- Mobile-optimized interface
- Photo upload capabilities

---

**Built with ❤️ for warehouse operations teams**