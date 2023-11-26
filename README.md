# Simple Node.js Express App with MongoDB


The app is live at http://localhost:3000.

API Endpoints:

POST /api/users: Create a new user
GET /api/users: Retrieve a list of all users
GET /api/users/:userId: Retrieve a specific user by ID
PUT /api/users/:userId: Update user information
DELETE /api/users/:userId: Delete a user
PUT /api/users/:userId/orders: Add New Product in Order
GET /api/users/:userId/orders: Retrieve all orders for a specific user
GET /api/users/:userId/orders/total-price: Calculate Total Price of Orders for a Specific 

Validation:

Use Zod for data validation. Handle errors gracefully.
