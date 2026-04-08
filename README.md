# Staj Task

This project is a full-stack technical task developed with ASP.NET Core Web API and Next.js. It is designed for managing companies and financial transactions based on Excel data.

## Technologies

### Backend
- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL
- JWT Authentication
- Layered Architecture

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

## Implemented Features

### Authentication
- User login with JWT
- Token-based authentication
- Protected API access

### Dashboard
- Total company count
- Total transaction count
- Total debt
- Total receivable
- Net balance
- Monthly net effect
- Company-based summary data

### Company Management
- List companies
- Add new company manually
- Prevent duplicate companies by tax number
- Search by company name

### Transaction Management
- List transactions
- Add new transaction manually
- Company-based transaction tracking

### Excel Import
- Company Excel upload endpoint is implemented
- Transaction Excel upload endpoint structure is prepared
- Uploaded Excel data is parsed and saved into the database
- Duplicate company records are skipped during import

Excel upload is currently tested through API requests using Postman.

### Frontend
- Login page is implemented
- Frontend and backend connection is established for authentication

## API Endpoints

### Auth
- POST /api/auth/login

### Companies
- GET /api/companies
- POST /api/companies
- POST /api/companies/import

### Transactions
- GET /api/transactions
- POST /api/transactions

### Dashboard
- GET /api/dashboard/summary

## Excel Import Format

Company Excel file should include:

- Name
- TaxNumber

Duplicate companies (based on TaxNumber) are automatically skipped during import.

## Authentication

After login, a JWT token is returned.

This token must be included in requests:

Authorization: Bearer <token>

## Configuration

Before running the backend, create an `appsettings.json` file based on:

appsettings.Example.json

Update the database connection string according to your local PostgreSQL setup.

## Project Structure

```text
staj-task/
├── backend/
│   ├── Controllers/
│   ├── Data/
│   ├── DTOs/
│   ├── Entities/
│   ├── Migrations/
│   ├── Repositories/
│   ├── Services/
│   └── Settings/
├── frontend/
│   ├── public/
│   └── src/
└── README.md