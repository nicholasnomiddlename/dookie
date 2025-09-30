# PostgreSQL Database Setup for Dookie Exchange

## Prerequisites

- PostgreSQL 12 or higher installed on your machine

## Windows Installation

1. **Download PostgreSQL**
   - Visit: https://www.postgresql.org/download/windows/
   - Download the latest Windows installer
   - Run the installer

2. **During Installation**
   - Set a password for the `postgres` superuser (remember this!)
   - Keep default port: `5432`
   - Install pgAdmin 4 (GUI tool - recommended)

3. **Create Database**

   **Option A: Using pgAdmin 4**
   - Open pgAdmin 4
   - Connect to PostgreSQL (enter your password)
   - Right-click "Databases" → Create → Database
   - Name it: `dookie_exchange`
   - Click "Save"

   **Option B: Using SQL Shell (psql)**
   ```sql
   CREATE DATABASE dookie_exchange;
   ```

## Configuration

1. **Create Environment File**

   Copy `.env.example` to `.env` in the `crypto-exchange` directory:

   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` File**

   Update with your PostgreSQL credentials:

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=dookie_exchange
   DB_USER=postgres
   DB_PASSWORD=your_actual_password_here
   PORT=3001
   ```

3. **Initialize Database Schema**

   The database schema will be automatically initialized when you start the server.
   The server will create all necessary tables and insert demo data.

## Database Schema

The application uses the following tables:

- **users** - User accounts (currently uses demo user)
- **portfolios** - User portfolio with cash balance
- **holdings** - Cryptocurrency holdings (available assets)
- **staked_holdings** - Currently staked assets earning yield
- **unstaking_holdings** - Assets in the unstaking process

## Running the Application

After setting up PostgreSQL and creating your `.env` file:

```bash
npm run dev:all
```

The server will:
1. ✓ Connect to PostgreSQL database
2. ✓ Initialize schema (create tables if they don't exist)
3. ✓ Insert demo user and default holdings
4. ✓ Start the API server on port 3001

## Verification

Check that the database is working:

1. Server should show: `✓ Database initialized successfully`
2. Server should show: `✓ Server running on port 3001`
3. Navigate to http://localhost:3000 and verify your portfolio loads

## Troubleshooting

**Connection Failed**
- Verify PostgreSQL is running (check Services on Windows)
- Check credentials in `.env` match your PostgreSQL password
- Ensure database `dookie_exchange` exists

**Tables Not Created**
- Check server console for error messages
- Verify database user has CREATE TABLE permissions
- Try manually running `server/db/schema.sql` in pgAdmin

**Data Not Persisting**
- Check server console for database errors
- Verify `.env` file is in the correct location
- Check PostgreSQL logs for connection issues
