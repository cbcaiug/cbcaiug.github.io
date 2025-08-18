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
const YOUR_EMAIL_ADDRESS = "musadrk2@gmail.com"; // For receiving notifications
const LOG_SHEET_NAME = "AI_Assistant_Log";
const UPDATES_SHEET_NAME = "Updates";

const ASSISTANT_FILES = {
    "Item Writer": "item-writer",
    "Lesson Plans (NCDC)": "lesson-plans-no-bv",
    "Lesson Plans (with Biblical Integration)": "lesson-plans-bv",
    "Scheme of Work(NCDC)": "sow-no-bv",
    "Scheme of Work (with Biblical Integration)": "sow-bv",
    "Lesson Notes Generator": "lesson-notes",
    "UCE Project Assistant": "uce-project-assistant",
    "Coteacher": "coteacher",
    "AI in Education Coach": "ai-coach",
    "Essay Grading Assistant": "essay-grader"
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
        // UPDATED: More robust parsing for the request body.
        // Handles cases where data arrives as stringified JSON in postData.contents
        // or as simple parameters.
        let body;
        if (e.postData && e.postData.contents) {
            body = JSON.parse(e.postData.contents);
        } else {
            // Fallback for form data submitted as parameters
            body = e.parameter;
        }

        const action = body.action;

        if (action === 'logEvent') {
            const event = body.event;
            logEventToSheet(event);

            if (event.type === 'feedback_submitted') {
                sendInstantFeedbackEmail(event.details);
            }

            return ContentService.createTextOutput(JSON.stringify({
                success: true,
                message: "Event logged successfully."
            })).setMimeType(ContentService.MimeType.JSON);
        
        } 
        else if (action === 'contact_form_submitted') {
            sendContactFormEmail(body.details);
            
            logEventToSheet({
                type: 'contact_form_submitted',
                assistant: 'Landing Page Widget',
                details: body.details
            });

            return ContentService.createTextOutput(JSON.stringify({
                success: true,
                message: "Contact form submitted successfully."
            })).setMimeType(ContentService.MimeType.JSON);
        }
                // NEW: Action to create a Google Doc from HTML content
        else if (action === 'createDoc') {
            const { htmlContent, title } = body.details;
            const docUrl = createGoogleDocFromHtml(htmlContent, title);
            
            logEventToSheet({
                type: 'google_doc_created',
                assistant: title, // Use the doc title as the assistant name for this log event
                details: { url: docUrl }
            });

            return ContentService.createTextOutput(JSON.stringify({
                success: true,
                url: docUrl
            })).setMimeType(ContentService.MimeType.JSON);
        }
        return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: "Invalid POST action."
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        console.error('Error in doPost:', error);
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

function logEventToSheet(event) {
    try {
        const headers = ["Timestamp", "UserType", "EventType", "AssistantName", "SessionID", "Details"];
        const sheet = getSheet(LOG_SHEET_NAME, headers);
        const timestamp = new Date();
        
        const eventDetails = event.details || {};
        const sessionId = eventDetails.sessionId || 'N/A';
        const userType = event.userType || 'User';

        delete eventDetails.sessionId; 
        
        const detailsString = Object.keys(eventDetails).length > 0 ? JSON.stringify(eventDetails) : '{}';

        sheet.appendRow([timestamp, userType, event.type, event.assistant, sessionId, detailsString]);

    } catch (error) {
        console.error(`Failed to log event to sheet: ${error.toString()}`);
    }
}


function getSheet(sheetName, headers = []) {
    const properties = PropertiesService.getScriptProperties();
    const spreadsheetId = properties.getProperty('logSheetId');
    let spreadsheet;

    if (spreadsheetId) {
        try {
            spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        } catch (e) {
            spreadsheet = null;
        }
    }

    if (!spreadsheet) {
        spreadsheet = SpreadsheetApp.create(LOG_SHEET_NAME);
        properties.setProperty('logSheetId', spreadsheet.getId());
        console.log(`Created new log spreadsheet with ID: ${spreadsheet.getId()}`);

        const defaultSheet = spreadsheet.getSheets()[0];
        defaultSheet.setName(LOG_SHEET_NAME);
        if (headers.length > 0) {
            const headerRange = defaultSheet.getRange(1, 1, 1, headers.length);
            headerRange.setValues([headers]);
            headerRange.setFontWeight("bold");
            defaultSheet.setFrozenRows(1);
        }
    }

    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
        if (headers.length > 0) {
            const headerRange = sheet.getRange(1, 1, 1, headers.length);
            headerRange.setValues([headers]);
            headerRange.setFontWeight("bold");
            sheet.setFrozenRows(1);
        }
    }

    return sheet;
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

function sendInstantFeedbackEmail(details) {
    const { rating, feedbackText, assistantName, email } = details;

    const hasRating = rating && rating > 0;
    const hasEmail = email && email.trim() !== '';
    let subject = "AI Assistant Info";
    if (hasRating && hasEmail) {
        subject = `New Signup & Feedback: ${rating} ★`;
    } else if (hasRating) {
        subject = `New Feedback: ${rating} ★`;
    } else if (hasEmail) {
        subject = `🎉 New Email Signup`;
    }

    let emailBody = `<p style="font-family: Arial, sans-serif;">You've received a new submission from your AI Educational Assistant!</p><hr>`;

    if (hasRating) {
        emailBody += `
        <p style="font-family: Arial, sans-serif;"><strong>Assistant Used:</strong> ${assistantName || 'N/A'}</p>
        <p style="font-family: Arial, sans-serif;"><strong>Rating:</strong> <span style="color: #f59e0b;">${'★'.repeat(rating)}</span><span style="color: #d1d5db;">${'☆'.repeat(5 - rating)}</span></p>
        <p style="font-family: Arial, sans-serif;"><strong>Feedback:</strong></p>
        <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; font-family: monospace;">${feedbackText || 'No detailed feedback provided.'}</pre>
        <hr>`;
    }

    if (hasEmail) {
        emailBody += `
        <p style="font-family: Arial, sans-serif;"><strong>🎉 New Email Signup!</strong></p>
        <p style="font-family: Arial, sans-serif;">A user has signed up for future updates.</p>
        <p style="font-family: Arial, sans-serif;"><strong>Email:</strong> ${email}</p>`;
    }

    MailApp.sendEmail({
        to: YOUR_EMAIL_ADDRESS,
        subject: subject,
        htmlBody: emailBody,
        name: "AI Assistant Bot"
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
        const fileResource = {
            title: `${title} - AI Assistant`, // Add a suffix to the title.
            mimeType: 'application/vnd.google-apps.document' // Specify that we want a Google Doc.
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

        // Return the public URL of the document.
        return docFile.alternateLink || `https://docs.google.com/document/d/${fileId}/`;

    } catch (error) {
        console.error('Error creating Google Doc:', error.toString());
        // This will allow the doPost function to catch the error and notify the user.
        throw new Error(error.toString());
    }
}
