# PhotoTribe Admin Panel - Access & Features

## 🔐 Admin Credentials

**Username:** `admin`  
**Password:** `PhotoTribeAdmin`  
**Email:** `admin@phototribe.com`  
**Role:** `ROLE_ADMIN`

> ⚠️ **IMPORTANT:** These credentials are automatically initialized when the backend starts for the first time. The admin user will be created in the database if it doesn't already exist.

---

## 🎯 How to Access Admin Panel

1. **Start the backend server** (http://localhost:8080)
2. **Start the frontend server** (http://localhost:5173)
3. **Navigate to Login page** and enter:
   - Username: `admin`
   - Password: `PhotoTribeAdmin`
4. **Click "Login"** - You'll be redirected to the gallery
5. **Look for "Admin" link in the navigation bar** (only visible to admin users)
6. **Click "Admin" to access the Admin Dashboard**

---

## 📊 Admin Dashboard Features

### 1. **Analytics Tab**
- **Total Visitors**: Number of unique visitors to the platform
- **Total Logins**: Count of successful user logins
- **Photos Uploaded**: Total number of photos uploaded
- **Photos Shared**: Total number of photos shared
- **Users Created**: Total user accounts created
- **Anonymous Visitors**: Count of non-authenticated visitors
- **Charts & Visualizations**: Visual representation of platform metrics

### 2. **Users Tab** (`/api/admin/users`)
- **View all users** registered on the platform
- **Edit user profiles** (bio, role)
- **Delete users** (soft delete - marks as inactive)
- **Suspend users** (30-day suspension)
- **Bulk delete users** - Select multiple users and delete in batch
- **User details**: ID, username, email, role, active status, suspension status

**Available endpoints:**
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/{id}` - Get user by ID
- `PUT /api/admin/users/{id}` - Update user (bio, role)
- `DELETE /api/admin/users/{id}` - Delete/deactivate user
- `POST /api/admin/users/{id}/suspend` - Suspend user for 30 days
- `POST /api/admin/users/batch-delete` - Delete multiple users

### 3. **Photos Tab** (`/api/admin/photos`)
- **View all photos** uploaded to the platform
- **Photo details**: ID, title, category, uploader, upload date, share count
- **Delete photos** individually
- **Bulk delete photos** - Select multiple photos and delete in batch
- **Photo management**: Remove inappropriate or duplicate content

**Available endpoints:**
- `GET /api/admin/photos` - List all photos
- `DELETE /api/admin/photos/{id}` - Delete specific photo
- `POST /api/admin/photos/batch-delete` - Delete multiple photos

### 4. **Categories Tab** (`/api/categories`)
- **Browse all categories** created on the platform
- **View category details**: Category name, photo count
- **Delete categories** if needed
- **Monitor category structure**: Ensure proper organization

**Available endpoints:**
- `GET /api/categories` - List all categories
- `DELETE /api/admin/categories/{id}` - Delete category

### 5. **Activity Logs Tab** (`/api/admin/activity-logs`)
- **Track all admin actions** performed on the platform
- **View activity history**: Who did what and when
- **Timestamp tracking**: Exact time of each activity
- **Action types**: User deletion, photo deletion, edits, etc.
- **Auditing**: Complete audit trail of administrative activities

**Available endpoints:**
- `GET /api/admin/activity-logs` - View all activity logs
- `POST /api/admin/activity-logs` - Record new activity

---

## 📈 Analytics & Reports

### Export Functionality
- **Export Analytics CSV**: Download platform analytics as a CSV file
- Includes all metrics and statistics for external analysis

### Dashboard Metrics
- **Pie Charts**: Distribution of photos by category
- **Line Charts**: Platform growth over time
- **Bar Charts**: User activity patterns
- **Real-time statistics**: Update with each action

---

## 🔒 Security Features

✅ **Role-based Access Control (RBAC)**
- Only users with `ROLE_ADMIN` can access the admin dashboard
- Automatic redirect to gallery if non-admin tries to access

✅ **JWT Authentication**
- Secure token-based authentication
- Bearer token required for all admin endpoints

✅ **Soft Delete Operations**
- Users can be "deleted" (marked inactive) but data is preserved
- Photos can be permanently deleted
- Maintains data integrity

✅ **Activity Logging**
- All admin actions are logged
- Complete audit trail maintained
- Timestamps for accountability

---

## 🛠️ Backend Implementation Details

### Admin User Initialization
```java
// Automatically runs on application startup
@Bean
public CommandLineRunner initializeAdminUser(...) {
    // Creates admin user with:
    // - Username: admin
    // - Password: PhotoTribeAdmin (encrypted)
    // - Role: ROLE_ADMIN
    // - Email: admin@phototribe.com
}
```

### Admin Controller
- **Base URL**: `/api/admin`
- **Protection**: `@PreAuthorize("hasRole('ADMIN')")`
- All endpoints require valid JWT token with ADMIN role

### Admin Endpoints Summary
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users/batch-delete` | Delete multiple users |
| GET | `/api/admin/photos` | List all photos |
| POST | `/api/admin/photos/batch-delete` | Delete multiple photos |
| GET | `/api/admin/categories` | List categories |
| GET | `/api/admin/analytics/dashboard` | Get dashboard metrics |
| GET | `/api/admin/analytics/export/csv` | Export analytics |
| GET | `/api/admin/activity-logs` | View activity logs |

---

## 🎨 Frontend Components

### AdminDashboard.jsx
- Main admin panel component
- Tab-based navigation
- Responsive design with glassmorphic styling
- Real-time data loading
- Error handling and user feedback

---

## 📋 Common Admin Tasks

### Task 1: Monitor Platform Activity
1. Go to Admin Dashboard
2. Click "Analytics" tab
3. View visitor metrics and engagement statistics
4. Export CSV for reporting

### Task 2: Manage Users
1. Click "Users" tab
2. View all registered users
3. Filter/search for specific users
4. Edit roles or suspend problematic users
5. Delete users if necessary (bulk delete available)

### Task 3: Moderate Content
1. Click "Photos" tab
2. Review uploaded photos
3. Delete inappropriate content
4. Monitor category assignments

### Task 4: View System Activity
1. Click "Activity Logs" tab
2. See all administrative actions performed
3. Track when photos/users were deleted
4. Maintain compliance records

---

## ⚙️ Configuration

The admin user is configured in `PhotoSharingApplication.java`:

```properties
# Admin Configuration
Admin Username: admin
Admin Password: PhotoTribeAdmin
Admin Email: admin@phototribe.com
Admin Role: ROLE_ADMIN
Initial Status: Active
```

To change admin credentials post-initialization:
1. Update the admin user via the Users tab interface, OR
2. Modify directly in the database (H2 for dev environment)

---

## 🔄 Database Schema

### User Role Values
- `ROLE_USER` - Regular user (default)
- `ROLE_ADMIN` - Administrator (can access admin panel)

### User Status Fields
- `isActive` - Whether user account is active (soft delete)
- `suspensionEndDate` - Date when suspension expires (NULL = not suspended)

---

## 🚀 Next Steps

1. **Start the application**:
   - Backend: `npm run start`  or `mvn spring-boot:run`
   - Frontend: `npm run dev`

2. **Log in as admin**:
   - Navigate to http://localhost:5173/login
   - Username: `admin`
   - Password: `PhotoTribeAdmin`

3. **Access admin dashboard**:
   - Look for "Admin" link in navigation (only visible to admins)
   - Click to open the comprehensive admin panel

4. **Start managing**:
   - View analytics and metrics
   - Manage users and content
   - Monitor platform activity
   - Export reports

---

## 📞 Support

For questions or issues with the admin panel:
- Check the browser console for errors
- Verify JWT token validity in Network tab
- Ensure user has `ROLE_ADMIN` role in the database
- Check backend logs for API errors

---

**Last Updated**: April 3, 2026  
**Version**: 1.0  
**Status**: ✅ Ready for Production
