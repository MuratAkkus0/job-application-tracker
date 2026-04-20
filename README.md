# Job Application Tracker

A modern, full-stack job application tracking system with an intuitive Kanban board interface. Built to streamline the job search process with real-time drag-and-drop functionality and optimistic UI updates.

## Overview

This application helps job seekers organize and track their applications through different stages of the hiring process. With a clean, responsive interface and robust backend, it provides a seamless experience for managing job opportunities.

## Tech Stack

**Frontend**
- Next.js 16 (App Router, Server Components, Server Actions)
- React 19 with TypeScript
- Tailwind CSS 4
- shadcn/ui components
- dnd-kit for drag-and-drop

**Backend**
- MongoDB with Mongoose ODM
- Better Auth for authentication
- Server Actions for data mutations
- Next.js caching strategies

## Key Features

### Kanban Board Interface
- Visual pipeline with customizable columns (Applied, Interview, Offer, Rejected)
- Drag-and-drop cards between stages with smooth animations
- Optimistic UI updates for instant feedback

### Job Application Management
- Create, update, and delete job applications
- Track company details, position, salary, and application dates
- Real-time status updates with visual indicators

### Authentication & Security
- Secure user authentication with Better Auth
- Session-based access control
- Protected routes and API endpoints

### Performance Optimizations
- Server-side data fetching with caching
- Optimistic state updates for better UX
- Efficient database queries with Mongoose

## Architecture Highlights

- **Server Actions**: Type-safe data mutations without API routes
- **Optimistic Updates**: Immediate UI feedback while server processes requests
- **Service Layer**: Clean separation of business logic and data access
- **Modular Components**: Reusable, composable UI components
- **Position Management**: Smart positioning algorithm for drag-and-drop ordering

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB instance
- pnpm (recommended)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd job-application-tracker
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Configure the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000
```

4. Run the development server
```bash
pnpm dev
```

5. (Optional) Seed the database with sample data
```bash
pnpm seed:jobs
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── api/auth/          # Authentication endpoints
│   ├── dashboard/         # Main dashboard page
│   ├── login/             # Login page
│   └── register/          # Registration page
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   └── KanbanBoard.tsx    # Main board component
├── lib/
│   ├── actions/           # Server actions
│   ├── auth/              # Authentication configuration
│   ├── hooks/             # Custom React hooks
│   ├── models/            # Mongoose models
│   ├── services/          # Business logic layer
│   └── utils/             # Utility functions
└── scripts/               # Database scripts
```

## Development Highlights

- **Production-Ready Code**: Clean, maintainable, and scalable architecture
- **Type Safety**: Full TypeScript coverage with strict mode
- **Best Practices**: Following Next.js 16 and React 19 conventions
- **Error Handling**: Comprehensive error handling with user feedback
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Future Enhancements

- Analytics dashboard for application statistics
- Email notifications for important updates
- Resume and cover letter management
- Interview scheduling integration
- Application notes and reminders

---

Built with modern web technologies and best practices for optimal performance and developer experience.
