/**
 * ******************************************************************
 * AI EDUCATIONAL ASSISTANT - GOOGLE APPS SCRIPT BACKEND (V7)
 * ******************************************************************
 *
 * This script manages prompts, handles event logging, sends emails,
 * and provides updates for the notification system.
 *
 * MODIFIED:
 * - UPDATED: doPost to be more robust, handling different incoming data
 * formats from client-side fetch requests.
 * - ADDED: A try-catch block in sendDailySummary to prevent errors
 * from malformed log entries.
 *
 * ******************************************************************
 */

// --- CONFIGURATION ---
// MODIFIED: 22/08/2025 8:35 PM EAT - Updated notification email address.
const YOUR_EMAIL_ADDRESS = "cbcaitool@gmail.com"; // For receiving notifications
const LOG_SHEET_NAME = "AI_Assistant_Log";
const UPDATES_SHEET_NAME = "Updates";

const ASSISTANT_FILES = {
    // MODIFIED: 21/08/2025 8:25 PM EAT - Added the new Prompt Assistant.
    "Prompt Assistant": "prompt-assistant",
    "Item Writer": "item-writer",
    "Lesson Plans (NCDC)": "lesson-plans-no-bv",
    "Lesson Plans (with Biblical Integration)": "lesson-plans-bv",
    "Scheme of Work(NCDC)": "sow-no-bv",
    "Scheme of Work (with Biblical Integration)": "sow-bv",
    "Lesson Notes Generator": "lesson-notes",
    "UCE Project Assistant": "uce-project-assistant",
    "AI in Education Coach": "ai-coach",
    "Essay Grading Assistant": "essay-grader",
    // --- NEW ASSISTANTS ADDED ---
    "Coteacher": "coteacher",
    "Data & Document Analyst": "data-analyst"
};


/**
 * =================================================================
 * WEB APP ENTRY POINTS (doGet, doPost)
 * =================================================================
 */

function doGet(e) {
    try {
        const action = e.parameter.action;
        let output;

        if (action === 'getAssistants') {
            output = ContentService.createTextOutput(JSON.stringify({
                success: true,
                assistants: Object.keys(ASSISTANT_FILES)
            }));
        } else if (action === 'getPrompt' && e.parameter.assistant) {
            const assistantName = e.parameter.assistant;
            const fileName = ASSISTANT_FILES[assistantName];

            if (fileName) {
                const promptContent = HtmlService.createHtmlOutputFromFile(fileName).getContent();
                output = ContentService.createTextOutput(JSON.stringify({
                    success: true,
                    assistant: assistantName,
                    prompt: promptContent
                }));
            } else {
                output = ContentService.createTextOutput(JSON.stringify({
                    success: false,
                    error: `Assistant '${assistantName}' not found.`
                }));
            }
        } else if (action === 'getUpdates') {
            const updates = getUpdatesFromSheet();
            output = ContentService.createTextOutput(JSON.stringify({
                success: true,
                updates: updates
            }));
        } else {
            output = ContentService.createTextOutput(JSON.stringify({
                success: false,
                error: 'Invalid action or missing parameters.'
            }));
        }

        return output.setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        console.error('Error in doGet:', error);
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: 'Internal Server Error: ' + error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}


function doPost(e) {
    try {
        console.log("doPost triggered.");
        let body;
        if (e.postData && e.postData.contents) {
            body = JSON.parse(e.postData.contents);
        } else {
            body = e.parameter;
        }
        console.log("Request body parsed. Action: " + body.action);

        const action = body.action;

        if (action === 'logEvent') {
            const event = body.event;
            console.log("Action is 'logEvent'. Event type: " + event.type);
            
            // MODIFIED: 21/08/2025 4:31 PM - Capture IP Address from the request.
            const ipAddress = e.source ? e.source.remoteAddress : 'N/A';
            
            // Pass the new data to our logging function. The Browser/OS info will be added from the client later.
            logEventToSheet(event, ipAddress);

            if (event.type === 'feedback_submitted') {
                console.log("Event type is 'feedback_submitted'. Attempting to send email...");
                sendInstantFeedbackEmail(event.details);
                console.log("sendInstantFeedbackEmail function was called.");
            }

            return ContentService.createTextOutput(JSON.stringify({
                success: true,
                message: "Event logged successfully."
            })).setMimeType(ContentService.MimeType.JSON);
        
        } else if (action === 'contact_form_submitted') {
            console.log("Action is 'contact_form_submitted'.");
            sendContactFormEmail(body.details);
            
            // MODIFIED: 22/08/2025 8:30 PM EAT - Bug fix for widget logging.
            // This now correctly captures the IP and calls the updated logEventToSheet function.
            const ipAddress = e.source ? e.source.remoteAddress : 'N/A';
            logEventToSheet({
                type: 'contact_form_submitted',
                assistant: 'Landing Page Widget',
                details: body.details
            }, ipAddress);
            
            return ContentService.createTextOutput(JSON.stringify({
                success: true,
                message: "Contact form submitted successfully."
            })).setMimeType(ContentService.MimeType.JSON);

        } else if (action === 'createDoc') {
            console.log("Action is 'createDoc'.");
            const { htmlContent, title } = body.details;
            const docInfo = createGoogleDocFromHtml(htmlContent, title);
            logEventToSheet({
                type: 'google_doc_created',
                assistant: title,
                details: { url: docInfo.url }
            });
            return ContentService.createTextOutput(JSON.stringify({
                success: true,
                url: docInfo.url,
                id: docInfo.id
            })).setMimeType(ContentService.MimeType.JSON);
        }
        
        console.log("No valid action found in doPost.");
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: "Invalid POST action."
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        console.error('CRITICAL Error in doPost:', error.toString());
        console.error('Received postData:', e.postData ? e.postData.contents : 'No postData');
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: 'Internal Server Error: ' + error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * =================================================================
 * SPREADSHEET & LOGGING
 * =================================================================
 */

// MODIFIED: 21/08/2025 4:31 PM - Function now accepts ipAddress and extracts browserOs.
function logEventToSheet(event, ipAddress = 'N/A') {
    try {
        const headers = ["SessionID", "Timestamp", "IPAddress", "BrowserOS", "UserType", "EventType", "AssistantName", "Details"];
        
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const monthlyLogSheetName = `Log - ${year}-${month}`;

        const sheet = getSheet(monthlyLogSheetName, headers);
        
        const eventDetails = event.details || {};
        const sessionId = eventDetails.sessionId || 'N/A';
        const userType = event.userType || 'User';
        // NEW: 21/08/2025 4:31 PM - Extract Browser/OS from the details payload sent by the client.
        const browserOs = eventDetails.browserOs || 'N/A';

        // Clean the details object of metadata before it gets formatted for the "Details" column.
        delete eventDetails.sessionId; 
        delete eventDetails.browserOs;
        
        const formattedDetails = formatDetailsForSheet(event.type, eventDetails);

        // MODIFIED: 21/08/2025 4:31 PM - Appending row with new data in the correct order.
        sheet.appendRow([sessionId, new Date(), ipAddress, browserOs, userType, event.type, event.assistant, formattedDetails]);

    } catch (error) {
        console.error(`Failed to log event to sheet: ${error.toString()}`);
    }
}


/**
 * MODIFIED: 21/08/2025 4:16 PM - Overhauled to support monthly log sheets.
 * - Now creates a well-structured spreadsheet on first run.
 * - Ensures "Updates" sheet is always first.
 * - Adds new monthly log sheets to the end of the workbook.
 */
function getSheet(sheetName, headers = []) {
    const properties = PropertiesService.getScriptProperties();
    const spreadsheetId = properties.getProperty('logSheetId');
    let spreadsheet;

    if (spreadsheetId) {
        try {
            spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        } catch (e) {
            spreadsheet = null; // Spreadsheet was deleted, will be recreated.
        }
    }

    // If the spreadsheet doesn't exist, create and configure it from scratch.
    if (!spreadsheet) {
        spreadsheet = SpreadsheetApp.create("AI Assistant Analytics Log");
        properties.setProperty('logSheetId', spreadsheet.getId());
        console.log(`Created new log spreadsheet with ID: ${spreadsheet.getId()}`);

        // 1. Delete the default "Sheet1".
        spreadsheet.deleteSheet(spreadsheet.getSheets()[0]);

        // 2. Create and configure the "Updates" sheet first.
        const updatesSheet = spreadsheet.insertSheet(UPDATES_SHEET_NAME, 0); // Insert at position 0
        const updatesHeaders = ["Timestamp", "UpdateMessage", "DetailsURL"];
        const updatesHeaderRange = updatesSheet.getRange(1, 1, 1, updatesHeaders.length);
        updatesHeaderRange.setValues([updatesHeaders]);
        updatesHeaderRange.setFontWeight("bold");
        updatesSheet.setFrozenRows(1);

        // 3. Create the very first monthly log sheet.
        const logSheet = spreadsheet.insertSheet(sheetName, 1); // Insert at position 1
        if (headers.length > 0) {
            const headerRange = logSheet.getRange(1, 1, 1, headers.length);
            headerRange.setValues([headers]);
            headerRange.setFontWeight("bold");
            logSheet.setFrozenRows(1);
        }
        return logSheet; // Return the newly created log sheet.
    }

    // If the spreadsheet exists, check for the requested sheet.
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
        // If sheet doesn't exist, create it at the end of the workbook.
        const sheetIndex = spreadsheet.getSheets().length;
        sheet = spreadsheet.insertSheet(sheetName, sheetIndex);
        
        if (headers.length > 0) {
            const headerRange = sheet.getRange(1, 1, 1, headers.length);
            headerRange.setValues([headers]);
            headerRange.setFontWeight("bold");
            sheet.setFrozenRows(1);
        }
    }

    return sheet;
}
/**
 * NEW: Formats the details of an event into a human-readable string for Google Sheets.
 * Handles different event types to provide the most useful output.
 * @param {string} eventType - The type of the event (e.g., 'feedback_submitted').
 * @param {object} details - The details object for the event.
 * @return {string} A formatted string, potentially with Google Sheets formulas.
 */
function formatDetailsForSheet(eventType, details) {
  try {
    if (!details || Object.keys(details).length === 0) {
      return "No details provided.";
    }

    if (eventType === 'google_doc_created' && details.url) {
      // If it's a doc creation, create a clickable hyperlink in the sheet.
      return `=HYPERLINK("${details.url}", "View Generated Document")`;
    }

    if (eventType === 'feedback_submitted') {
      // If it's feedback, create a clean, multi-line report.
      const report = [];
      if (details.rating) {
        report.push(`Rating: ${details.rating} / 5`);
      }
      if (details.feedbackText) {
        // Use quotes to handle feedback that might contain commas or special characters.
        report.push(`Feedback: "${details.feedbackText}"`);
      }
      if (details.email) {
        report.push(`Email Signup: ${details.email}`);
      }
      // Join with CHAR(10), which is the formula for a newline in a Sheets cell.
      return report.join(String.fromCharCode(10));
    }

    // For any other event type, just return the standard JSON string as a fallback.
    return JSON.stringify(details);

  } catch (e) {
    // If formatting fails for any reason, return the raw object to avoid losing data.
    return JSON.stringify(details);
  }
}

function getUpdatesFromSheet() {
    try {
        const sheet = getSheet(UPDATES_SHEET_NAME, ["Timestamp", "UpdateMessage", "DetailsURL"]);
        const data = sheet.getDataRange().getValues();

        if (data.length <= 1) return [];

        const updates = data.slice(1).map(row => ({
            timestamp: new Date(row[0]).toISOString(),
            message: row[1],
            url: row[2] || null
        })).filter(u => u.message);

        return updates.reverse();

    } catch (error) {
        console.error(`Failed to get updates from sheet: ${error.toString()}`);
        return [];
    }
}


/**
 * =================================================================
 * EMAIL FUNCTIONALITY
 * =================================================================
 */

// UPDATED: This function is now more robust and handles all feedback cases clearly.
function sendInstantFeedbackEmail(details = {}) {
    const { rating, feedbackText, assistantName, email } = details;

    // Determine a clearer subject line based on what was submitted.
    let subject = `⭐ New Feedback for "${assistantName}"`; // A clear default subject.
    if (rating && email) {
        subject = `⭐ Signup & Feedback (${rating}★) for "${assistantName}"`;
    } else if (rating) {
        subject = `⭐ New Feedback (${rating}★) for "${assistantName}"`;
    } else if (email) {
        subject = `🎉 New Signup for "${assistantName}"`;
    }

    let emailBody = `<p style="font-family: Arial, sans-serif;">You've received a new submission for the <strong>${assistantName || 'AI Assistant'}</strong>.</p><hr>`;

    // Always show the rating section if a rating was given.
    if (rating) {
        emailBody += `
        <p style="font-family: Arial, sans-serif;"><strong>Rating:</strong> <span style="color: #f59e0b;">${'★'.repeat(rating)}</span><span style="color: #d1d5db;">${'☆'.repeat(5 - rating)}</span></p>`;
    }

    // Always include the feedback text box, showing a message if it was empty.
    emailBody += `
        <p style="font-family: Arial, sans-serif;"><strong>Feedback Provided:</strong></p>
        <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; font-family: monospace;">${feedbackText || 'No detailed feedback was provided.'}</pre>`;

    // Always clarify whether the user consented to be contacted.
    if (email) {
        emailBody += `<hr>
        <p style="font-family: Arial, sans-serif;"><strong>🎉 Contact Consent: YES</strong></p>
        <p style="font-family: Arial, sans-serif;">A user has signed up for updates with the email: <strong>${email}</strong></p>`;
    } else {
        emailBody += `<hr>
        <p style="font-family: Arial, sans-serif;"><strong>Contact Consent:</strong> No</p>`;
    }

    // We've added a 'replyTo' parameter. This is a minor change, but it is often
// enough to force Google's security system to re-request authorization.
MailApp.sendEmail({
    to: YOUR_EMAIL_ADDRESS,
    subject: subject,
    htmlBody: emailBody,
    name: "AI Assistant Bot",
    replyTo: email || YOUR_EMAIL_ADDRESS // If user provides email, you can reply directly
});
}

function sendContactFormEmail(details) {
    const { name, email, message } = details;
    const subject = `New Message from AI Assistant Website`;
    
    let emailBody = `
        <p style="font-family: Arial, sans-serif;">You have received a new message from the contact widget on your website.</p>
        <hr>
        <p style="font-family: Arial, sans-serif;"><strong>Name:</strong> ${name || 'Not provided'}</p>
        <p style="font-family: Arial, sans-serif;"><strong>Email:</strong> ${email || 'Not provided'}</p>
        <p style="font-family: Arial, sans-serif;"><strong>Message:</strong></p>
        <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; font-family: monospace;">${message || 'No message content.'}</pre>
    `;

    MailApp.sendEmail({
        to: YOUR_EMAIL_ADDRESS,
        subject: subject,
        htmlBody: emailBody,
        name: "Website Contact Bot"
    });
}



function sendDailySummary() {
    try {
        const sheet = getSheet(LOG_SHEET_NAME);
        const data = sheet.getDataRange().getValues();
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

        const headers = data[0];
        const tsIdx = headers.indexOf("Timestamp");
        const userTypeIdx = headers.indexOf("UserType");
        const eventTypeIdx = headers.indexOf("EventType");
        const sessionIdIdx = headers.indexOf("SessionID");
        const detailsIdx = headers.indexOf("Details");

        const recentData = data.slice(1).filter(row => new Date(row[tsIdx]) > twentyFourHoursAgo);

        if (recentData.length === 0) {
            console.log("No activity in the last 24 hours. No summary email sent.");
            return;
        }

        const stats = {
            User: { generationCount: 0, shareCount: 0, feedbackSkippedCount: 0, feedbackSubmissions: [], sessionCount: 0 },
            Admin: { generationCount: 0, shareCount: 0, feedbackSkippedCount: 0, feedbackSubmissions: [], sessionCount: 0 }
        };
        
        const uniqueSessions = { User: new Set(), Admin: new Set() };

        recentData.forEach(row => {
            const userType = row[userTypeIdx] || 'User';
            const eventType = row[eventTypeIdx];
            const sessionId = row[sessionIdIdx];
            if (!stats[userType]) return;

            if (sessionId && sessionId !== 'N/A') {
                uniqueSessions[userType].add(sessionId);
            }

            // ADDED: try-catch block to prevent a single malformed
            // details string from breaking the entire summary.
            let details = {};
            try {
                if (row[detailsIdx]) {
                    details = JSON.parse(row[detailsIdx]);
                }
            } catch(e) {
                console.error("Could not parse details from log row: ", row);
            }


            if (eventType === 'generation' || eventType === 'regeneration') {
                stats[userType].generationCount++;
            } else if (eventType === 'share_click') {
                stats[userType].shareCount++;
            } else if (eventType === 'feedback_skipped') {
                stats[userType].feedbackSkippedCount++;
            } else if (eventType === 'feedback_submitted') {
                stats[userType].feedbackSubmissions.push({
                    rating: details.rating || 'N/A',
                    text: details.feedbackText || 'N/A',
                    email: details.email || 'N/A',
                    assistant: details.assistantName || 'N/A'
                });
            }
        });

        stats.User.sessionCount = uniqueSessions.User.size;
        stats.Admin.sessionCount = uniqueSessions.Admin.size;

        const today = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        let htmlBody = `
            <h1 style="font-family: Arial, sans-serif; color: #333;">AI Assistant Daily Summary</h1>
            <p style="font-family: Arial, sans-serif; color: #555;">Report for ${today}</p>
        `;

        const createActivityTable = (userType, userStats) => {
            const totalActivity = userStats.generationCount + userStats.shareCount + userStats.feedbackSkippedCount + userStats.feedbackSubmissions.length;
            if (totalActivity === 0) return '';
            return `
                <h2 style="font-family: Arial, sans-serif; color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px;">${userType} Activity</h2>
                <table style="width: 100%; max-width: 500px; border-collapse: collapse; font-family: Arial, sans-serif; margin-bottom: 20px;">
                    <tr style="background-color: #f9f9f9;">
                        <td style="padding: 8px; border: 1px solid #ddd;">Unique Sessions:</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;"><strong>${userStats.sessionCount}</strong></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">Generations:</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;"><strong>${userStats.generationCount}</strong></td>
                    </tr>
                    <tr style="background-color: #f9f9f9;">
                        <td style="padding: 8px; border: 1px solid #ddd;">Shares:</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;"><strong>${userStats.shareCount}</strong></td>
                    </tr>
                     <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">Feedback Submissions:</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;"><strong>${userStats.feedbackSubmissions.length}</strong></td>
                    </tr>
                    <tr style="background-color: #f9f9f9;">
                        <td style="padding: 8px; border: 1px solid #ddd;">Feedback Modals Skipped:</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;"><strong>${userStats.feedbackSkippedCount}</strong></td>
                    </tr>
                </table>
            `;
        };

        htmlBody += '<hr>' + createActivityTable('User', stats.User);
        htmlBody += createActivityTable('Admin', stats.Admin);

        const allFeedback = [...stats.User.feedbackSubmissions, ...stats.Admin.feedbackSubmissions];

        if (allFeedback.length > 0) {
            htmlBody += `<hr><h2 style="font-family: Arial, sans-serif; color: #333;">Feedback & Signups Received Today</h2>`;
            allFeedback.forEach(fb => {
                htmlBody += `
                    <div style="border: 1px solid #ccc; border-radius: 5px; padding: 10px; margin-bottom: 10px; font-family: Arial, sans-serif; background-color: #fff;">
                        <p><strong>Assistant:</strong> ${fb.assistant}</p>
                        <p><strong>Rating:</strong> ${fb.rating !== 'N/A' ? `<span style="color: #f59e0b;">${'★'.repeat(fb.rating)}</span><span style="color: #d1d5db;">${'☆'.repeat(5 - fb.rating)}</span>` : 'N/A'}</p>
                        <p><strong>Feedback:</strong> ${fb.text || '<em>No comment</em>'}</p>
                        <p><strong>Email Signup:</strong> ${fb.email !== 'N/A' ? `<strong>${fb.email}</strong>` : '<em>Not provided</em>'}</p>
                    </div>
                `;
            });
        }

        MailApp.sendEmail({
            to: YOUR_EMAIL_ADDRESS,
            subject: `AI Assistant Daily Summary - ${today}`,
            htmlBody: `<div style="background-color: #f4f7f6; padding: 20px;">${htmlBody}</div>`,
            name: "AI Assistant Daily Reporter"
        });

    } catch (error) {
        console.error(`Failed to send daily summary: ${error.toString()}`);
        MailApp.sendEmail(YOUR_EMAIL_ADDRESS, "AI Assistant Script Error", `The daily summary function failed with error: ${error.toString()}`);
    }
}
/**
 * =================================================================
 * DOCUMENT CREATION
 * =================================================================
 */

/**
 * Creates a Google Doc from an HTML string and returns its URL.
 * The document is created in the script owner's Drive and is publicly viewable.
 * @param {string} htmlContent - The HTML content for the document body.
 * @param {string} title - The title for the new document.
 * @return {string} The URL of the newly created Google Doc.
 */
function createGoogleDocFromHtml(htmlContent, title) {
    try {
        // Create a temporary blob from the HTML content.
        // Google's services will convert this HTML blob into a formatted doc.
        const blob = Utilities.newBlob(htmlContent, 'text/html', `${title}.html`);
        
                // Define the resource for the new file we're creating in Google Drive.
        const FOLDER_ID = "1UdUZfa3f-TK4bbRDRk_VW1gJnFGzZBaj"; // <-- IMPORTANT: Replace with your actual folder ID.

        const fileResource = {
            title: `${title} - AI Assistant`, // Add a suffix to the title.
            mimeType: 'application/vnd.google-apps.document', // Specify that we want a Google Doc.
            // NEW: This tells Drive to create the file inside our specific folder.
            parents: [{ id: FOLDER_ID }]
        };

        // Use the Drive API to insert the new file, providing the blob as the content.
        // This is where the automatic conversion from HTML to a Google Doc happens.
        const docFile = Drive.Files.insert(fileResource, blob);

        // Get the ID of the file that was just created.
        const fileId = docFile.id;

        // IMPORTANT: Set the sharing permissions to make the file public.
        const permission = {
            value: 'anyone',
            type: 'anyone',
            role: 'reader' // Users can view, but not edit the original.
        };
        Drive.Permissions.insert(permission, fileId);

        // Return an object containing both the public URL and the file ID.
// The frontend will use the ID to create direct download links.
return {
    url: docFile.alternateLink || `https://docs.google.com/document/d/${fileId}/`,
    id: fileId
};

    } catch (error) {
        console.error('Error creating Google Doc:', error.toString());
        // This will allow the doPost function to catch the error and notify the user.
        throw new Error(error.toString());
    }
}