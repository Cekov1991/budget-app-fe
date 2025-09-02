# Budget App - Personal Expense Tracker

A modern budget tracking application built with SvelteKit and Tailwind CSS. Track your expenses manually or upload receipt images for AI-powered expense extraction and categorization.

## Features

### 🔐 Authentication
- User registration and login
- Secure session management
- Protected routes

### 💰 Expense Management
- Manual expense entry
- Receipt image upload with AI processing
- Automatic item extraction and categorization
- Expense editing and deletion
- Pagination for large expense lists

### 🏷️ Category Management
- Create custom expense categories
- Color-coded categories
- Edit and delete categories
- Default categories for new users

### 📊 Dashboard & Analytics
- Monthly and weekly expense summaries
- Category-wise spending breakdown
- Recent expenses overview
- Visual spending insights

### 📱 Modern UI
- Responsive design for all devices
- Clean, intuitive interface
- Loading states and error handling
- Tailwind CSS styling

## Prerequisites

Before running this application, make sure you have:

1. **Laravel Backend**: This frontend requires a Laravel backend API. Make sure your Laravel backend is running with the following routes:

```php
// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::apiResource('categories', CategoryController::class);
    Route::get('/expenses/stats', [ExpenseController::class, 'stats']);
    Route::apiResource('expenses', ExpenseController::class);
    Route::post('/receipts/upload', [ReceiptController::class, 'upload']);
    Route::post('/receipts/process', [ReceiptController::class, 'process']);
    Route::get('/receipts/{path}/url', [ReceiptController::class, 'getImageUrl']);
});
```

2. **Node.js**: Version 18 or higher
3. **Backend API URL**: Update the `API_BASE` URL in `src/lib/api.ts` to match your Laravel backend

## Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd budget-app-fe
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure API endpoint**:
Edit `src/lib/api.ts` and update the `API_BASE` constant:
```typescript
const API_BASE = 'http://your-laravel-backend.com/api';
```

4. **Start the development server**:
```bash
npm run dev
```

5. **Open your browser**:
Navigate to `http://localhost:5173`

## Usage

### Getting Started

1. **Register an Account**: Create a new account or sign in with existing credentials
2. **Create Categories**: Set up expense categories (Food, Transportation, Entertainment, etc.)
3. **Add Expenses**: Start tracking expenses manually or by uploading receipts

### Manual Expense Entry

1. Navigate to "Add Expense"
2. Choose "Manual Entry"
3. Fill in the expense details:
   - Description
   - Amount
   - Category
   - Date
4. Click "Create Expense"

### Receipt Upload (AI Processing)

1. Navigate to "Add Expense"
2. Choose "Upload Receipt"
3. Select a receipt image from your device
4. Click "Upload & Process"
5. Review the AI-extracted items
6. Select which items to add as expenses
7. Assign categories if not automatically suggested
8. Click "Create Expenses"

### Managing Categories

1. Navigate to "Categories"
2. Click "Add Category" to create new categories
3. Choose a name and color for easy identification
4. Edit or delete categories as needed

### Dashboard Overview

The dashboard provides:
- Total expenses for the current month and week
- Spending breakdown by category
- Recent expense activity
- Quick action buttons

## Project Structure

```
src/
├── lib/
│   ├── api.ts                 # API client and type definitions
│   ├── components/            # Reusable UI components
│   │   ├── Button.svelte
│   │   └── Input.svelte
│   └── stores/
│       └── auth.ts           # Authentication store
├── routes/
│   ├── (app)/               # Protected app routes
│   │   ├── +layout.svelte   # App layout with navigation
│   │   ├── dashboard/       # Dashboard page
│   │   ├── expenses/        # Expense management
│   │   └── categories/      # Category management
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   ├── +layout.svelte       # Root layout
│   └── +page.svelte         # Home page
└── app.html                 # HTML template
```

## API Integration

The app communicates with a Laravel backend through a comprehensive API client (`src/lib/api.ts`) that handles:

- Authentication (login, register, logout)
- User management
- Category CRUD operations
- Expense CRUD operations
- Receipt upload and processing
- Statistics and analytics

## Technology Stack

- **SvelteKit**: Full-stack framework
- **Svelte 5**: Latest Svelte with runes
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast build tool

## Building for Production

```bash
# Create a production build
npm run build

# Preview the production build locally
npm run preview
```

## Environment Configuration

For production deployment, you may need to:

1. Update the `API_BASE` URL in `src/lib/api.ts`
2. Configure CORS settings in your Laravel backend
3. Set up proper SSL certificates for HTTPS
4. Configure your deployment platform (Vercel, Netlify, etc.)

## Browser Support

This application supports all modern browsers that support:
- ES6+ features
- CSS Grid and Flexbox
- Fetch API
- File API (for receipt uploads)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
