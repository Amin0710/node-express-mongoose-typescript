# Simple Node.js Express App with MongoDB


The app is live at http://localhost:3000.

API Endpoints:

Create a new user:

- **Create a new user:** 
  - Endpoint: `POST /api/users`

- **Retrieve a list of all users:** 
  - Endpoint: `GET /api/users`

- **Retrieve a specific user by ID:** 
  - Endpoint: `GET /api/users/:userId`

- **Update user information:** 
  - Endpoint: `PUT /api/users/:userId`

- **Delete a user:** 
  - Endpoint: `DELETE /api/users/:userId`

- **Add New Product in Order:** 
  - Endpoint: `PUT /api/users/:userId/orders`

- **Retrieve all orders for a specific user:** 
  - Endpoint: `GET /api/users/:userId/orders`

- **Calculate the Total Price of Orders for a Specific User:** 
  - Endpoint: `GET /api/users/:userId/orders/total-price`

Validation:
Use Zod for data validation. Handle errors gracefully.


User "data": {
        "userId": "number",
        "username": "string",
        "fullName": {
            "firstName": "string",
            "lastName": "string"
        },
        "age": "number",
        "email": "string",
        "isActive": "boolean",
        "hobbies": [
            "string",
            "string"
        ],
        "address": {
            "street": "string",
            "city": "string",
            "country": "string"
        }
    }

Order "data": {
    "productName": "string",
    "price": "number",
    "quantity": "number"
}
