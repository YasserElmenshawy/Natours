# Natours Application

Built using :node.js, express, mongoDB, mongoose 

# Run

### Install

```
npm install
```

### Start API

```
npm start
```

# Routes

### Tours
```
GET      /api/v1/tours
GET      /api/v1/tours/:id
POST     /api/v1/tours
PATCH    /api/v1/tours/:id
DELETE   /api/v1/tours/:id
GET      /api/v1/tours/distance/34.111745,-118.113498/unit/mi
GET      /api/v1/tours/tour-stats
GET      /api/v1/tours?duration[gte]=7
GET      /api/v1/tours/month-plan/2020
GET      /api/v1/tours/top-5-cheap
```
### Users

```
GET      /api/v1/users
GET      /api/v1/users/:id
GET      /api/v1/users/me
PATCH    /api/v1/users/:id
PATCH    /api/v1/users/
DELETE   /api/v1/users/:id
DELETE   /api/v1/users/me
```

### Authentication
```
POST    /api/v1/users/signup
POST    /api/v1/users/login
POST    /api/v1/users/forgotPassword
PATCH   /api/v1/users/resetPassword/:id
PATCH   /api/v1/users/resetPassword
```

### Review

```
GET     /api/v1/reviews
GET     /api/v1/reviews/:id
POST    /api/v1/reviews
PATCH   /api/v1/reviews
DELETE  /api/v1/reviews
```

### Tour/Review
```
GET     /api/v1/tours/:id
POST    /api/v1/tours/:id
```

