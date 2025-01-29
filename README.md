# Doctor Appointment System

A full-stack web application for managing doctor appointments, built with MERN stack (MongoDB, Express.js, React.js, Node.js) and microservices architecture.

## 🌐 Local Development URLs

- Frontend: `http://localhost:3000`
- Backend Services:
  - Gateway: `http://localhost:8080`
  - Doctor Service: `http://localhost:4001`
  - Auth Service: `http://localhost:4002`
  - Appointment Service: `http://localhost:4003`
  - Review Service: `http://localhost:4004`
  - Location Service: `http://localhost:4005`
  - Admin Service: `http://localhost:4006`
- API Documentation: `http://localhost:8080/api-docs`

## 🎥 Project Demo

https://www.youtube.com/watch?v=vXuBEFhtRvs

## 🏗 Architecture & Design

### Microservices Architecture
The application is built using a microservices architecture with the following services:

1. **Gateway Service**: API Gateway for routing and load balancing
2. **Doctor Service**: Manages doctor profiles and availability
3. **Auth Service**: Handles authentication and authorization
4. **Appointment Service**: Manages appointment bookings
5. **Review Service**: Handles doctor reviews and ratings
6. **Location Service**: Manages location data (cities, districts)
7. **Admin Service**: Administrative operations

### Tech Stack
- **Frontend**: 
  - React.js
  - Material-UI
  - Google Maps API
  - @react-oauth/google for authentication
- **Backend**: 
  - Node.js
  - Express.js
  - MongoDB
  - Redis for caching
  - RabbitMQ for message queuing
- **DevOps**:
  - Docker
  - Docker Compose

### Data Models

#### User
- _id: string
- name: string
- email: string
- password: string
- role: string
- picture: string

#### Doctor
- _id: string
- userId: string
- fullName: string
- specialization: string
- rating: number
- reviewCount: number
- address: object
- status: string

#### Appointment
- _id: string
- userId: string
- doctorId: string
- date: date
- time: string
- status: string
- review: object

#### Review
- _id: string
- appointmentId: string
- doctorId: string
- patientId: string
- rating: number
- comment: string
- status: string
- createdAt: date

#### City
- _id: string
- name: string
- code: string
- coordinates: object

#### District
- _id: string
- cityId: string
- name: string
- coordinates: object

## ✨ Features

1. **User Management**
   - Google OAuth Integration
   - Role-based access control (Admin, Doctor, Patient)
   - Profile management

2. **Doctor Search**
   - Location-based search
   - Filter by specialization
   - Interactive map view
   - Rating and review system

3. **Appointment System**
   - Real-time availability checking
   - Appointment scheduling
   - Email notifications
   - Status tracking (pending, confirmed, completed, cancelled)

4. **Review System**
   - Post-appointment reviews
   - Rating system
   - Comment moderation
   - Automatic doctor rating updates

5. **Location Management**
   - Turkish cities and districts
   - Geocoding support
   - Map integration

## 🔍 Design Decisions & Assumptions

1. **Authentication**
   - JWT-based authentication
   - Token refresh mechanism
   - Google OAuth for easy signup

2. **Appointment System**
   - 30-minute appointment slots
   - Maximum 30 days advance booking
   - Buffer time between appointments
   - Automatic status updates

3. **Location System**
   - Pre-loaded Turkish cities and districts
   - Coordinates for map display
   - District-level granularity

4. **Review System**
   - Only verified appointments can review
   - Profanity filter for comments
   - Review moderation system

## 🚧 Challenges & Solutions

1. **Microservices Communication**
   - Challenge: Service coordination and data consistency
   - Solution: Implemented message queues and event-driven architecture

2. **Location Data**
   - Challenge: Managing Turkish location data with coordinates
   - Solution: Created seeding scripts and proper data models

3. **Real-time Availability**
   - Challenge: Concurrent appointment bookings
   - Solution: Implemented Redis-based locking mechanism

4. **Map Integration**
   - Challenge: Performance with multiple markers
   - Solution: Implemented clustering and lazy loading

## 🚀 Future Improvements

1. **Technical Improvements**
   - Implement service discovery
   - Add circuit breakers
   - Improve error handling
   - Add comprehensive logging

2. **Feature Additions**
   - Real-time chat
   - Video consultations
   - Payment integration
   - Mobile application
   - Multi-language support

## 🛠 Setup Instructions

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Redis
- RabbitMQ
- Docker (optional)

## Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/Mertcanvuralll/DoctorAppointment.git
   cd DoctorAppointment
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   cd doctor-appointment-frontend && npm install
   cd ../doctor-appointment-backend && npm install
   ```

3. Start the services:

   ### Using Docker
   ```bash
   docker-compose up
   ```

   ### Without Docker

   Start backend services:
   ```bash
   cd doctor-appointment-backend
   npm run dev:doctors    # Port 4001
   npm run dev:auth       # Port 4002
   npm run dev:appointments # Port 4003
   npm run dev:reviews    # Port 4004
   npm run dev:locations  # Port 4005
   npm run dev:admin     # Port 4006
   ```

   Start frontend:
   ```bash
   cd doctor-appointment-frontend
   npm start            # Port 3000
   ```

## Accessing the Application

- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- API Documentation: http://localhost:8080/api-docs

## Service Ports

- Gateway: 8080
- Doctor Service: 4001
- Auth Service: 4002
- Appointment Service: 4003
- Review Service: 4004
- Location Service: 4005
- Admin Service: 4006 
