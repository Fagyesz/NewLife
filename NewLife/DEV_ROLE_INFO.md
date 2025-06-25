# 🔧 DEV ROLE - DEVELOPMENT ACCESS

## 📋 **Overview**
The `dev` role provides **unrestricted access** to all features for development and testing purposes.

## 🔑 **How to Get Dev Role**
Your email must contain one of these keywords:
- `dev` (e.g., `john.dev@gmail.com`)
- `developer` (e.g., `developer.smith@gmail.com`) 
- `test` (e.g., `test.user@gmail.com`)
- Or exact match: `dev@ujeletbaptista.hu`

## ✅ **Dev Role Permissions**
- ✅ **Full Admin Access** (`isAdmin()` returns `true`)
- ✅ **Full Staff Access** (`isStaff()` returns `true`)
- ✅ **Create Events** (staff permission)
- ✅ **Edit Events** (staff permission)
- ✅ **Delete Events** (admin permission)
- ✅ **Access Admin Panel**
- ✅ **No restrictions whatsoever**

## 🎨 **Visual Indicators**
- **Role Text**: "Fejlesztő"
- **Special Styling**: Red background with border in navigation
- **Admin Access**: Full "📝 Szerkesztés" button

## 🧪 **Testing Examples**
To test the dev role, sign in with a Google account that has:
- `yourname.dev@gmail.com`
- `developer.test@gmail.com`
- `test.anything@gmail.com`

## 🔄 **Role Hierarchy**
1. **Dev** - Unlimited access (for development)
2. **Admin** - Full access (can delete)
3. **Staff** - Edit access (can create/edit)
4. **Member** - View only

## 🚀 **Perfect For**
- Development testing
- Feature debugging
- Quick access without restrictions
- Testing all permission levels

*The dev role bypasses all permission checks and has the same privileges as admin + staff combined.* 