// Simple email API endpoint - saves form submissions to files
import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import { format } from 'date-fns';
import { IncomingForm } from 'formidable';
import { createHash } from 'crypto';

// Configure formidable for file uploads
const uploadDir = path.join(process.cwd(), 'temp_uploads');
const maxFileSize = 10 * 1024 * 1024; // 10MB

interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const config = {
  api: {
    bodyParser: false, // Disable body parser for file uploads
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EmailResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Create temp uploads directory if it doesn't exist
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp uploads directory:', error);
    }

    // Parse form data including files
    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize,
      multiples: false,
    });

    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err);
          reject(new Error('Failed to parse form data'));
          return;
        }
        resolve([fields, files]);
      });
    });

    // Extract form fields
    const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
    const company = Array.isArray(fields.company) ? fields.company[0] : fields.company;
    const phone = Array.isArray(fields.phone) ? fields.phone[0] : fields.phone;
    const message = Array.isArray(fields.message) ? fields.message[0] : fields.message;
    const budget = Array.isArray(fields.budget) ? fields.budget[0] : fields.budget;

    // Validate required fields
    if (!name || !phone || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required fields (name, phone, message)'
      });
    }

    // Handle file upload
    let fileInfo = '';
    let tempFilePath = '';
    
    if (files.file) {
      const fileArray = Array.isArray(files.file) ? files.file : [files.file];
      const uploadedFile = fileArray[0];
      
      if (uploadedFile) {
        tempFilePath = uploadedFile.filepath;
        const fileHash = createHash('md5').update(uploadedFile.originalFilename + Date.now()).digest('hex');
        const newFilename = `${fileHash}-${uploadedFile.originalFilename}`;
        const finalPath = path.join(uploadDir, newFilename);
        
        // Rename file to avoid conflicts
        await fs.rename(tempFilePath, finalPath);
        tempFilePath = finalPath;
        
        fileInfo = `
File Attachment:
- Name: ${uploadedFile.originalFilename}
- Size: ${uploadedFile.size} bytes
- Type: ${uploadedFile.mimetype}
- Path: ${tempFilePath}`;
      }
    }

    // Create submission content
    const emailContent = `
New Contact Form Submission
========================================

Name: ${name}
${company ? `Company: ${company}\n` : ''}
Phone: ${phone}
Budget: ${budget}

Message:
${message}

${fileInfo}

========================================
Submitted at: ${new Date().toISOString()}
========================================
`;

    // Create submissions directory if it doesn't exist
    const submissionsDir = path.join(process.cwd(), 'submissions');
    try {
      await fs.mkdir(submissionsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create submissions directory:', error);
    }

    // Save submission to file
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
    const filename = path.join(submissionsDir, `submission-${timestamp}.txt`);
    
    await fs.writeFile(filename, emailContent, 'utf8');
    
    console.log('Form submission saved to:', filename);
    console.log('Content:', emailContent);
    
    // Move uploaded file to permanent storage instead of deleting
    // This allows for verification while keeping the system clean
    if (tempFilePath && fileInfo) {
      try {
        // Create permanent uploads directory
        const permanentUploadsDir = path.join(process.cwd(), 'uploads');
        await fs.mkdir(permanentUploadsDir, { recursive: true });
        
        // Move file to permanent location
        const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
        const finalFilename = `upload-${timestamp}-${path.basename(tempFilePath)}`;
        const finalPath = path.join(permanentUploadsDir, finalFilename);
        
        await fs.rename(tempFilePath, finalPath);
        console.log('File moved to permanent storage:', finalPath);
        
        // Update the submission log with final file location
        const finalFileInfo = `
File Attachment:
- Name: ${path.basename(finalPath)}
- Size: ${(await fs.stat(finalPath)).size} bytes
- Location: uploads/${finalFilename}
- Permanent storage: ✓`;
        
        // Update the email content with final file info
        const finalContent = emailContent.replace(fileInfo, finalFileInfo);
        await fs.writeFile(filename, finalContent, 'utf8');
        
      } catch (moveError) {
        console.error('Failed to move file to permanent storage:', moveError);
      }
    }

    // IMPORTANT: This implementation does NOT send actual emails
    // It only saves submissions and files for development/testing purposes
    // No email functionality is implemented to avoid spam/privacy issues

    return res.status(200).json({
      success: true,
      message: 'Форма успешно отправлена!'
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process form submission'
    });
  }
}