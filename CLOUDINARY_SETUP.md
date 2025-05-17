# Cloudinary Image Upload Setup

This document explains how to set up Cloudinary for image uploads in the SwapCred application.

## Direct Client-Side Upload Implementation

We've updated the application to use Cloudinary's direct upload from the client side, which avoids server-related issues and provides better performance:

1. The client-side code in `ExchangeForm.jsx` now directly communicates with Cloudinary's API
2. This approach uses Cloudinary's "unsigned upload" feature with a predefined upload preset
3. No server-side code is needed for handling file uploads

## How to Configure Cloudinary for Direct Uploads

1. **Create a Cloudinary Account**
   - Go to [Cloudinary.com](https://cloudinary.com/) and sign up for a free account
   - After signing up, you'll be taken to your dashboard

2. **Create an Upload Preset**
   - In your Cloudinary dashboard, go to Settings > Upload
   - Find the "Upload presets" section and click "Add upload preset"
   - Name it (e.g., "swapcred_unsigned")
   - Set "Signing Mode" to "Unsigned"
   - Configure other settings as needed (folder, transformations, etc.)
   - Save the preset

3. **Update Client-Side Configuration**
   - Open `client/src/pages/ExchangeForm.jsx`
   - Update the Cloudinary constants at the top:
     ```javascript
     const CLOUDINARY_CLOUD_NAME = 'your_cloud_name';
     const CLOUDINARY_UPLOAD_PRESET = 'your_preset_name';
     ```

## Testing the Upload

1. **Use the Test Page**
   - Open `client/src/test-cloudinary.html` in a browser
   - Try uploading an image
   - If successful, the image URL and data will be displayed

2. **Check the Main Application**
   - Start the application
   - Go to the Exchange form
   - Try uploading images with the form
   - Check browser console for any errors

## Troubleshooting

If uploads are not working:

1. Verify your cloud name is correct
2. Ensure the upload preset exists and is set to "unsigned"
3. Check browser network tab to see API responses
4. Check browser console for JavaScript errors
5. Try using a different browser

## Why This Approach?

The direct client-side upload approach has several advantages:

1. **Improved Performance**: Files go directly to Cloudinary, reducing server load
2. **Simplified Server Code**: No need to handle file uploads on the server
3. **Reliability**: Eliminates temporary file storage issues
4. **Ease of Deployment**: No need to configure server file permissions or storage

## Previous Server-Side Approach (Now Deprecated)

The previously implemented server-side upload paths are still available but no longer used:
- `/api/upload/image` - Uses disk storage (deprecated)
- `/api/upload/image-buffer` - Uses memory buffers (deprecated)
- `/api/upload/test-cloudinary` - Tests configuration
- `/api/upload/test-upload` - Tests signed uploads
- `/api/upload/test-unsigned` - Tests unsigned uploads 