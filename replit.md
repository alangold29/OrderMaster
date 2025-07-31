# Overview

This is a CRM web application designed for import/export broker companies to manage orders and track shipments. The system allows users to import historical order data from Excel files and manage orders through a modern web interface. The application provides comprehensive order tracking, filtering, and management capabilities with support for multiple entities like clients, exporters, importers, and producers.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API endpoints under `/api` namespace
- **File Processing**: Multer for file uploads and XLSX library for Excel parsing
- **Development**: Hot module replacement with Vite integration in development mode

## Database & ORM
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with TypeScript support
- **Schema**: Normalized design with separate tables for orders, clients, exporters, importers, and producers
- **Migrations**: Drizzle Kit for schema management and migrations

## Key Features
- **Order Management**: CRUD operations for orders with comprehensive filtering and sorting
- **Excel Import**: Bulk import of historical order data from Excel/CSV files
- **Entity Management**: Automatic creation and management of related entities (clients, exporters, etc.)
- **Search & Filtering**: Advanced filtering by multiple criteria including date ranges, entities, and status
- **Pagination**: Efficient data loading with pagination support
- **Responsive Design**: Mobile-friendly interface with adaptive layouts

## Data Model
The system uses a normalized database schema with:
- **Orders**: Main entity containing shipment details, dates, quantities, and pricing
- **Clients**: Customer entities linked to orders
- **Exporters**: Export company entities
- **Importers**: Import company entities  
- **Producers**: Producer/manufacturer entities
- **Foreign Key Relationships**: Orders reference related entities to maintain data integrity

## API Structure
RESTful endpoints following standard conventions:
- `GET /api/orders` - List orders with filtering and pagination
- `POST /api/orders` - Create new orders
- `PUT /api/orders/:id` - Update existing orders
- `DELETE /api/orders/:id` - Delete orders
- `POST /api/import/excel` - Bulk import from Excel files
- Entity endpoints for clients, exporters, importers, and producers

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: TypeScript ORM for database operations
- **drizzle-kit**: Schema management and migration tool

## Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Validation resolver for Zod integration
- **zod**: Schema validation library
- **wouter**: Lightweight client-side routing

## UI & Styling
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for managing component variants
- **clsx**: Conditional className utility
- **lucide-react**: Icon library

## File Processing
- **multer**: Multipart form data handling for file uploads
- **xlsx**: Excel file parsing and processing
- **@types/multer**: TypeScript definitions for Multer

## Development Tools
- **vite**: Build tool and development server
- **@vitejs/plugin-react**: React support for Vite
- **typescript**: Static type checking
- **esbuild**: Fast JavaScript bundler for production builds

## Session & Storage
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **date-fns**: Date manipulation utilities

The application is designed to be deployed on Replit with automatic database provisioning and uses environment variables for configuration.