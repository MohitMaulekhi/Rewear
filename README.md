# ReWear - Community Clothing Exchange Platform

ReWear is a web-based platform that enables users to exchange unused clothing through direct swaps or a point-based redemption system. The goal is to promote sustainable fashion and reduce textile waste by encouraging users to reuse wearable garments instead of discarding them.

## 🌟 Features

### User Authentication
- Email/password signup and login with Firebase Auth
- User profiles with points balance tracking
- Admin role management

### Landing Page
- Platform introduction and value proposition
- Call-to-action buttons: "Start Swapping", "Browse Items", "List an Item"
- Featured items carousel showcasing community listings
- Responsive design with modern UI

### User Dashboard
- Personal profile with points balance display
- Overview of uploaded items with status tracking
- List of ongoing and completed swaps
- Quick action buttons for adding items and browsing

### Item Management
- **Add New Item Page**: Upload multiple images, enter detailed descriptions, categorize items, set condition and point values
- **Browse Items Page**: Filter by category, condition, search functionality, grid/list view options
- **Item Detail Page**: Full image gallery, detailed item information, uploader profile, swap/redemption options

### Swap System
- **Direct Swap Requests**: Users can request to swap items with each other
- **Point-based Redemption**: Earn points for listings, redeem points for desired items
- Real-time availability status and transaction tracking

### Admin Panel
- **Item Moderation**: Approve/reject item listings before they go live
- **User Management**: View all users, manage admin privileges
- **Content Oversight**: Remove inappropriate or spam items
- **Analytics Dashboard**: Track platform statistics and user activity

## 🛠 Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Image Storage**: Cloudinary
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd Rewear
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Gemini AI (for future features)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

4. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database with the following collections:
   - `users` - User profiles and points
   - `items` - Item listings
   - `swaps` - Swap transactions and requests
4. Set up storage rules for image uploads
5. Copy your Firebase configuration to the `.env` file

### Cloudinary Setup

1. Create an account at [Cloudinary](https://cloudinary.com)
2. Create an upload preset for the ReWear app
3. Add your cloud name and upload preset to the `.env` file

## 📱 Usage

### For Regular Users
1. **Sign Up**: Create an account with email and password
2. **Browse Items**: Explore available clothing items from the community
3. **List Items**: Upload photos and details of clothes you want to exchange
4. **Make Swaps**: Request direct swaps or use points to redeem items
5. **Track Activity**: Monitor your items, swaps, and points in the dashboard

### For Administrators
1. **Review Items**: Approve or reject new item listings
2. **Manage Users**: View user activity and grant admin privileges
3. **Monitor Platform**: Track platform statistics and content quality
4. **Remove Content**: Delete inappropriate or spam items

## 🌍 Sustainability Impact

ReWear contributes to environmental sustainability by:
- **Reducing Textile Waste**: Extending the lifecycle of clothing items
- **Promoting Circular Economy**: Encouraging reuse over disposal
- **Community Building**: Connecting like-minded individuals
- **Conscious Consumption**: Raising awareness about sustainable fashion

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
├── context/            # React context providers (Auth)
├── pages/              # Page components
├── services/           # External service integrations
└── utils/              # Utility functions and helpers
```

### Available Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## 🤝 Contributing

We welcome contributions to make ReWear even better! Please feel free to:
- Submit bug reports and feature requests
- Improve documentation
- Add new features
- Optimize performance

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Thanks to the open-source community for the amazing tools and libraries
- Special thanks to users who contribute to making fashion more sustainable
- Firebase for providing robust backend infrastructure
- Cloudinary for reliable image storage and management

---

**Together, let's make fashion more sustainable! 🌱👗**+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
