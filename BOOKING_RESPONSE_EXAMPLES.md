# Booking Payment Page - API Response Examples

This document provides comprehensive examples of API responses for different booking types in the BookingPaymentPage.jsx component.

## Overview

The BookingPaymentPage supports three types of bookings:

1. **Normal Booking** - Regular customer booking with payment gateway
   - **Guest User** - User not logged in, must provide personal information
   - **Logged In User** - User logged in, can use account info or fill manually
2. **Reward Booking** - Booking using user rewards (logged in or guest)
3. **OTS Booking** - Over-the-counter booking with cash payment

## API Endpoint

All booking types use the same endpoint: `POST /api/book-room`

## Request Structures

### 1. Normal Booking Request

#### 1a. Guest User Normal Booking Request

```json
{
  "psUnit": {
    "id": 1,
    "name": "PS5 Premium Room",
    "price_per_hour": 50000
  },
  "selectedGames": [
    {
      "id": 1,
      "name": "FIFA 24",
      "price": 0
    }
  ],
  "date": "2024-03-15T00:00:00.000Z",
  "startTime": "14:00",
  "duration": 2,
  "numberOfPeople": 2,
  "foodAndDrinks": [
    {
      "id": 1,
      "name": "Coca Cola",
      "quantity": 2,
      "price": 10000
    }
  ],
  "subtotal": 100000,
  "voucherDiscount": 0,
  "voucherCode": "",
  "promoId": null,
  "promoPercentage": 0,
  "notes": "Extra controller needed",
  "customer": {
    "fullName": "John Doe",
    "email": "",
    "phone": "081234567890"
  }
}
```

#### 1b. Logged In User Normal Booking Request

```json
{
  "psUnit": {
    "id": 1,
    "name": "PS5 Premium Room",
    "price_per_hour": 50000
  },
  "selectedGames": [
    {
      "id": 1,
      "name": "FIFA 24",
      "price": 0
    }
  ],
  "date": "2024-03-15T00:00:00.000Z",
  "startTime": "14:00",
  "duration": 2,
  "numberOfPeople": 2,
  "foodAndDrinks": [
    {
      "id": 1,
      "name": "Coca Cola",
      "quantity": 2,
      "price": 10000
    }
  ],
  "subtotal": 100000,
  "voucherDiscount": 0,
  "voucherCode": "",
  "promoId": null,
  "promoPercentage": 0,
  "notes": "Extra controller needed",
  "customer": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "081234567890"
  }
}
```

### 2. Reward Booking Request (Logged In User)

```json
{
  "user_reward_id": 123,
  "unit_id": 1,
  "game_id": 1,
  "total_visitors": 2,
  "start_time": "2024-03-15 14:00",
  "end_time": "2024-03-15 16:00",
  "notes": "No F&B needed."
}
```

### 3. Reward Booking Request (Guest User)

```json
{
  "user_reward_id": 123,
  "unit_id": 1,
  "game_id": 1,
  "total_visitors": 2,
  "start_time": "2024-03-15 14:00",
  "end_time": "2024-03-15 16:00",
  "notes": "No F&B needed.",
  "name": "Jane Smith",
  "phone": "081234567891"
}
```

### 4. OTS Booking Request

```json
{
  "unit_id": 1,
  "game_id": 1,
  "name": "Bob Wilson",
  "phone": "081234567892",
  "total_visitors": 2,
  "payment_method": "cash",
  "start_time": "2024-03-15 14:00",
  "end_time": "2024-03-15 16:00",
  "notes": "OTS Booking.",
  "fnbs": [
    {
      "id": 1,
      "quantity": 2
    }
  ]
}
```

## Response Examples

### 1. Normal Booking Success Response

```json
{
  "message": "Booking berhasil dibuat, silakan lanjutkan pembayaran.",
  "data": {
    "id": 62,
    "invoice_number": "BOOK-20250910-PIPUER",
    "bookable_type": "App\\Models\\User",
    "bookable_id": 7,
    "unit_id": 1,
    "game_id": 1,
    "start_time": "2025-09-10 15:00:00",
    "end_time": "2025-09-10 17:00:00",
    "total_price": "25000.00",
    "status": "pending",
    "notes": "Test Booking Yang Mendapatkan point.",
    "created_at": "2025-09-10T02:08:46.000000Z",
    "updated_at": "2025-09-10T02:08:46.000000Z",
    "deleted_at": null,
    "event_id": null,
    "total_visitors": 2,
    "promo_id": null,
    "reminder_sent": false,
    "created_by_admin_id": null,
    "tax_amount": "0.00",
    "service_fee_amount": "5000.00",
    "user_reward_id": null,
    "payment_method": "midtrans",
    "points_earned": 4,
    "booking_type": "Online",
    "bookable": {
      "id": 7,
      "username": "cust1_demo",
      "name": "Customer 1",
      "phone": "080000000000",
      "email": null,
      "role": "CUST",
      "total_spend": "136050.00",
      "api_token_expires_at": "2025-10-10T02:07:36.000000Z",
      "isActive": true,
      "remember_token": null,
      "created_at": "2025-09-08T06:13:21.000000Z",
      "updated_at": "2025-09-10T02:07:36.000000Z",
      "deleted_at": null,
      "total_points": 1010,
      "total_booking_hours": 3
    },
    "unit": {
      "id": 1,
      "room_id": 1,
      "name": "Reguler 1",
      "description": null,
      "status": "available",
      "max_visitors": 2,
      "price": "10000.00",
      "created_at": "2025-09-07T21:43:57.000000Z",
      "updated_at": "2025-09-07T21:43:57.000000Z",
      "deleted_at": null,
      "points_per_hour": 2
    },
    "created_by_admin": null,
    "fnbs": [],
    "user_reward": null
  },
  "snapToken": "b466c7fa-bff2-4eb0-b8d7-f8e82865413a",
  "snapUrl": "https://app.sandbox.midtrans.com/snap/v4/redirection/b466c7fa-bff2-4eb0-b8d7-f8e82865413a"
}
```

### 2. Reward Booking Success Response

```json
{
  "success": true,
  "message": "Reward booking created successfully",
  "data": {
    "id": 1002,
    "invoice_number": "REWARD-2024-0315-001",
    "booking_status": "confirmed",
    "total_amount": 0,
    "reward_used": {
      "id": 123,
      "reward_name": "Free 2-Hour Gaming Session",
      "discount_percentage": 100,
      "expires_at": "2024-12-31T23:59:59.000Z"
    },
    "booking_details": {
      "unit": {
        "id": 1,
        "name": "PS5 Premium Room"
      },
      "game": {
        "id": 1,
        "name": "FIFA 24"
      },
      "date": "2024-03-15",
      "start_time": "14:00",
      "end_time": "16:00",
      "duration": 2,
      "visitors": 2,
      "customer": {
        "name": "Jane Smith",
        "phone": "081234567891"
      }
    },
    "pricing_breakdown": {
      "room_price": 100000,
      "reward_discount": 100000,
      "total": 0
    },
    "created_at": "2024-03-15T13:45:00.000Z",
    "updated_at": "2024-03-15T13:45:00.000Z"
  }
}
```

### 3. OTS Booking Success Response

```json
{
  "success": true,
  "message": "OTS booking created successfully",
  "data": {
    "id": 1003,
    "invoice_number": "OTS-2024-0315-001",
    "booking_status": "confirmed",
    "total_amount": 138000,
    "payment_method": "cash",
    "payment_status": "pending",
    "booking_details": {
      "unit": {
        "id": 1,
        "name": "PS5 Premium Room"
      },
      "game": {
        "id": 1,
        "name": "FIFA 24"
      },
      "date": "2024-03-15",
      "start_time": "14:00",
      "end_time": "16:00",
      "duration": 2,
      "visitors": 2,
      "customer": {
        "name": "Bob Wilson",
        "phone": "081234567892"
      }
    },
    "fnb_items": [
      {
        "id": 1,
        "name": "Coca Cola",
        "quantity": 2,
        "price": 10000,
        "total": 20000
      }
    ],
    "pricing_breakdown": {
      "room_price": 100000,
      "fnb_total": 20000,
      "subtotal": 120000,
      "tax": 12000,
      "service_fee": 6000,
      "total": 138000
    },
    "created_at": "2024-03-15T13:45:00.000Z",
    "updated_at": "2024-03-15T13:45:00.000Z"
  }
}
```

### 4. Validation Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "unit_id": ["The unit id field is required."],
    "start_time": ["The start time field is required."],
    "customer.phone": ["The phone number format is invalid."]
  },
  "status_code": 422
}
```

### 5. Server Error Response

```json
{
  "success": false,
  "message": "Internal server error. Please try again later.",
  "error": "Database connection failed",
  "status_code": 500
}
```

### 6. Authentication Error Response

```json
{
  "success": false,
  "message": "Unauthorized. Please log in to continue.",
  "error": "Token expired",
  "status_code": 401
}
```

### 7. Insufficient Funds Error (Reward Booking)

```json
{
  "success": false,
  "message": "Insufficient reward points",
  "error": "User does not have enough points for this reward",
  "status_code": 400
}
```

### 8. Unit Not Available Error

```json
{
  "success": false,
  "message": "Selected unit is not available for the requested time slot",
  "error": "Unit is already booked for the selected time",
  "status_code": 409
}
```

## Redux State Updates

After a successful booking, the Redux state is updated as follows:

```javascript
// bookingSlice state after successful booking
{
  status: "succeeded",
  error: null,
  redirectUrl: "https://app.sandbox.midtrans.com/snap/v2/vtweb/...", // For normal booking
  invoiceNumber: "INV-2024-0315-001",
  bookingData: {
    // Full response data from API
    success: true,
    message: "Booking created successfully",
    data: { /* ... */ }
  },
  promoValidation: {
    status: "idle",
    error: null,
    promoData: null
  }
}
```

## Frontend Behavior

### Normal Booking

#### Guest User Normal Booking

1. User navigates to booking without login
2. System sets `isGuestBooking: true` flag
3. User must fill personal information form (name, phone, terms agreement)
4. No "Use my account information" checkbox option
5. Confirmation modal appears
6. After confirmation, booking is submitted with customer data
7. If successful, user is redirected to Midtrans payment gateway
8. Payment status is handled via webhook/callback

#### Logged In User Normal Booking

1. User navigates to booking while logged in
2. System sets `isGuestBooking: false` flag
3. User can choose to:
   - Fill personal information manually, OR
   - Use "Use my account information" checkbox to auto-fill from profile
4. Confirmation modal appears
5. After confirmation, booking is submitted with customer data
6. If successful, user is redirected to Midtrans payment gateway
7. Payment status is handled via webhook/callback

### Reward Booking

1. User with reward proceeds directly
2. No payment gateway redirection
3. Booking is immediately confirmed
4. User is redirected to success page

### OTS Booking

1. Staff fills customer information
2. Selects payment method (cash)
3. Booking is immediately confirmed
4. No payment gateway involved

## Error Handling

The component handles various error scenarios:

1. **Validation Errors**: Display specific field errors
2. **Server Errors**: Show generic error message
3. **Network Errors**: Retry mechanism with user feedback
4. **Authentication Errors**: Redirect to login page
5. **Booking Conflicts**: Suggest alternative time slots

## Testing Scenarios

### Success Cases

- ✅ Normal booking with valid data
- ✅ Reward booking for logged-in user
- ✅ Reward booking for guest user
- ✅ OTS booking with cash payment
- ✅ Booking with F&B items
- ✅ Booking with promo code

### Error Cases

- ❌ Missing required fields
- ❌ Invalid phone number format
- ❌ Unit not available
- ❌ Insufficient reward points
- ❌ Server timeout
- ❌ Network connectivity issues
- ❌ Invalid promo code
- ❌ Expired reward

## Key Differences: Guest vs Logged In User

### Guest User Normal Booking

- **Authentication**: No login required
- **Personal Info**: Must fill manually (name, phone, terms agreement)
- **UI Features**:
  - Shows "Guest Booking Information" banner
  - No "Use my account information" checkbox
  - PersonalInfoForm component hides account checkbox
- **Data Flow**:
  - `isGuestBooking: true` flag set in navigation state
  - Customer data included in API payload
  - Same Midtrans payment flow as logged in users
- **Points**: **NO POINTS EARNED** - Points section is hidden

### Logged In User Normal Booking

- **Authentication**: User must be logged in
- **Personal Info**: Can choose to:
  - Fill manually, OR
  - Use "Use my account information" checkbox to auto-fill from profile
- **UI Features**:
  - Shows "Use my account information" checkbox option
  - Can toggle between manual input and account data
  - PersonalInfoForm component shows account checkbox
- **Data Flow**:
  - `isGuestBooking: false` flag set in navigation state
  - Customer data included in API payload
  - Same Midtrans payment flow as guest users
- **Points**: **POINTS EARNED** - Points taken from API response `points_earned` field

### Common Features

- Both use same API endpoint (`/api/book-room`)
- Both require personal information validation
- Both redirect to Midtrans for payment
- Both use same response structure
- Both support promo codes and F&B items

## Points Calculation Logic

### For Logged In Users (Normal Booking)

1. **Primary Source**: Uses `points_earned` from booking API response
2. **Fallback**: If API data not available, uses `bookingDetails.duration` (1 point per hour)
3. **Display**: Shows points section with earned points

### For Guest Users

1. **Points**: Always 0 (no points earned)
2. **Display**: Points section is completely hidden

### For Reward/OTS Bookings

1. **Points**: Always 0 (no points earned)
2. **Display**: Points section is completely hidden

### API Response Points Data

```json
{
  "data": {
    "points_earned": 4, // ← This value is used for points display
    "unit": {
      "points_per_hour": 2 // ← Used for calculation on backend
    },
    "bookable": {
      "total_points": 1010, // ← User's total accumulated points
      "total_booking_hours": 3 // ← User's total booking hours
    }
  }
}
```

## Notes

- All timestamps are in ISO 8601 format
- Phone numbers should follow Indonesian format (+62)
- Currency amounts are in Indonesian Rupiah (IDR)
- Midtrans integration is only for normal bookings
- Reward and OTS bookings bypass payment gateway
- All responses include proper error codes and messages
- Frontend validates data before API submission
- Redux state is properly serialized for storage
