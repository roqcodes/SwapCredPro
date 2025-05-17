# Changelog

## Version 1.0.1 (Bug Fix Release)

### New Features
- Added ShopifyErrorHandler component for user-friendly error displays
- Improved error handling for Shopify account not found scenarios

### UI/UX Improvements
- Replaced generic "Server API route not found" error with friendly, actionable Shopify error screens
- Added retry functionality for failed Shopify connections
- Enhanced error messages with specific instructions for users

### Bug Fixes
- Fixed error handling in Shopify API integration
- Improved user experience when Shopify customer account doesn't exist
- Added more descriptive error messages throughout the app

## Version 1.0.0 (Final Release)

### New Features
- Added ExchangeList component for "View All Requests" functionality
- Created route for viewing all exchange requests at /exchange
- Added Credit History tab in Admin Dashboard
- Implemented CreditHistoryTable component to display credit history records
- Added cleanup script (cleanup.sh) to remove unnecessary files
- Added npm clean script in package.json
- Created comprehensive README.md with project documentation

### UI/UX Improvements
- Updated color scheme to more subtle blue tones
- Removed rounded corners from app header/navbar for cleaner look
- Enhanced Admin Dashboard with badge notifications for requests
- Improved table layouts and consistency across the application
- Added proper pagination for exchange lists

### Bug Fixes
- Fixed "View All Requests" 404 error by adding proper route
- Ensured consistent use of INR as currency for credit assignments
- Added explicit error handling for Shopify API interactions
- Fixed potential race conditions in database updates

### Code Quality & Maintenance
- Standardized component naming and file structure
- Added comments and documentation throughout the codebase
- Removed unnecessary files and optimized project structure
- Updated dependencies to latest stable versions
- Improved code organization and reusability 