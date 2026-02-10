// WordPress API client for form submissions
import nodeFetch from 'node-fetch';
import { format } from 'date-fns';
import { WP_SITE_URL } from './config';

// Configure fetch for both browser and Node.js environments
const fetch = typeof window !== 'undefined' ? window.fetch : nodeFetch;

// File system operations (Node.js only)
const fs = typeof window !== 'undefined' ? null : require('fs').promises;
const pathModule = typeof window !== 'undefined' ? null : require('path');

interface ContactFormData {
  name: string;
  company?: string;
  phone: string;
  message: string;
  budget?: string;
  file?: File;
}

export async function submitContactForm(formData: ContactFormData): Promise<{ success: boolean; message?: string }> {
  try {
    // Use direct WordPress form submission instead of REST API
    // The REST API has field name compatibility issues, but direct submission works
    const formEndpoint = `${WP_SITE_URL}/?_wpcf7=6`;
    
    // Create FormData for multipart form submission
    const submissionData = new FormData();
    
    // Add required Contact Form 7 fields
    submissionData.append('_wpcf7', '6'); // Form ID
    submissionData.append('your-name', formData.name);
    submissionData.append('your-phone', formData.phone);
    submissionData.append('your-message', formData.message);
    
    // Add optional fields
    if (formData.company) {
      submissionData.append('your-company', formData.company);
    }
    if (formData.budget) {
      submissionData.append('your-budget', formData.budget);
    }
    
    // Handle file upload and save to local storage
    let filePath = '';
    if (formData.file) {
      console.log('[WP-API] Processing file upload:', formData.file.name);
      console.log('[WP-API] File size:', formData.file.size);
      console.log('[WP-API] File type:', formData.file.type);
      
      // For browser environment, upload to local API
      if (typeof window !== 'undefined') {
        console.log('[WP-API] Browser environment - uploading to /api/upload');
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', formData.file);
          
          console.log('[WP-API] Sending request to /api/upload...');
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData
          });
          
          console.log('[WP-API] Upload response status:', uploadResponse.status);
          console.log('[WP-API] Upload response ok:', uploadResponse.ok);
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            console.log('[WP-API] Upload result:', uploadResult);
            filePath = uploadResult.path;
            console.log('[WP-API] File uploaded to:', filePath);
          } else {
            const errorText = await uploadResponse.text();
            console.error('[WP-API] Upload failed, response:', errorText);
            throw new Error('Upload failed');
          }
        } catch (uploadError) {
          console.error('[WP-API] File upload error:', uploadError);
          filePath = 'Upload failed';
        }
        
        // Add file path to form data for WordPress
        console.log('[WP-API] Adding to submissionData: your-file =', filePath);
        submissionData.append('your-file', filePath);
      } else {
        // Node.js environment - save the file locally
        try {
          const uploadsDir = pathModule.join(process.cwd(), 'uploads');
          await fs.mkdir(uploadsDir, { recursive: true });
          
          const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
          const safeFilename = formData.file.name.replace(/[^a-zA-Z0-9.]/g, '_');
          const filename = `upload-${timestamp}-${safeFilename}`;
          filePath = pathModule.join(uploadsDir, filename);
          
          const buffer = await formData.file.arrayBuffer();
          await fs.writeFile(filePath, Buffer.from(buffer));
          console.log('File saved to:', filePath);
          
          // Add file to form data
          submissionData.append('your-file', formData.file, formData.file.name);
          
        } catch (fileError) {
          console.error('File save error:', fileError);
          filePath = 'File upload failed: ' + (fileError instanceof Error ? fileError.message : 'Unknown error');
        }
      }
    }

    const response = await fetch(formEndpoint, {
      method: 'POST',
      body: submissionData,
      credentials: 'include' // Important for authenticated requests
    });

    console.log('WordPress response status:', response.status);
    
    // Save submission log with file information (Node.js only)
    if (typeof window === 'undefined') {
      try {
        const submissionsDir = pathModule.join(process.cwd(), 'submissions');
        await fs.mkdir(submissionsDir, { recursive: true });
        
        const logContent = `
WordPress Form Submission
========================================

Name: ${formData.name}
${formData.company ? `Company: ${formData.company}\n` : ''}
Phone: ${formData.phone}
Budget: ${formData.budget || 'Not specified'}

Message:
${formData.message}

${filePath ? `File: ${filePath}\n` : 'No file attached\n'}

========================================
Submitted at: ${new Date().toISOString()}
Status: ${response.redirected || response.status === 302 ? 'SUCCESS' : 'FAILED'}
========================================
`;
        
        const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
        const logFilename = pathModule.join(submissionsDir, `wp-submission-${timestamp}.txt`);
        await fs.writeFile(logFilename, logContent, 'utf8');
        console.log('Submission log saved to:', logFilename);
      } catch (logError) {
        console.error('Failed to save submission log:', logError);
      }
    } else {
      console.log('Browser environment - submission logged to console only');
    }
    
    // Contact Form 7 returns 302 redirect on success
    if (response.redirected || response.status === 302) {
      console.log('Form submitted successfully! Redirect URL:', response.url);
      return {
        success: true,
        message: 'Форма успешно отправлена!'
      };
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Form submission error:', errorData);
      return {
        success: false,
        message: errorData.message || 'Failed to submit form. Please try again.'
      };
    }

    const result = await response.text();
    console.log('WordPress response:', result);
    
    return {
      success: true,
      message: 'Форма успешно отправлена!'
    };
    
  } catch (error) {
    console.error('Network error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection.'
    };
  }
}

// Alternative approach: Use WordPress REST API with basic auth if needed
export async function submitFormWithAuth(formData: ContactFormData, username: string, password: string): Promise<{ success: boolean; message?: string }> {
  try {
    const authEndpoint = `${WP_SITE_URL}/wp-json/contact-form-7/v1/contact-forms/6/feedback`;
    
    const response = await fetch(authEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${username}:${password}`),
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Authentication failed or form submission error.'
      };
    }

    return {
      success: true,
      message: 'Form submitted successfully with authentication!'
    };
    
  } catch (error) {
    console.error('Auth submission error:', error);
    return {
      success: false,
      message: 'Authentication error. Please check credentials.'
    };
  }
}