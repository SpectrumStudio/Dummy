
const nodemailer = require('nodemailer');
const express = require('express');
const fs = require('fs');
const path = require('path');
const ftp = require('basic-ftp');
const bodyParser = require('body-parser');
const os = require('os');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Endpoint to retry sending email only
app.post('/send-email', async (req, res) => {
    const { email, control, firstName, lastName, dob } = req.body;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.json({ success: false, message: 'Invalid email.' });
    }
    // Use Ethereal for test emails
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });
    let attachments = [];
    try {
        if (fs.existsSync(FILE_PATH)) {
            attachments.push({ filename: 'Request.txt', path: FILE_PATH });
        }
    } catch (e) { /* ignore */ }
    let mailOptions = {
        from: 'Dummy App <no-reply@dummy.com>',
        to: email,
        subject: 'Your Dummy SSN Request Was Sent',
        text: `Your request has been sent successfully.\n\nDetails:\nControl: ${control || ''}\nFirst Name: ${firstName || ''}\nLast Name: ${lastName || ''}\nDOB: ${dob || ''}\nEmail: ${email}\n\nResponse will be received within 3 hours.\n\nThanks,\nTeam Data Migrator`,
        attachments
    };

    let attempts = 0;
    const maxAttempts = 5;
    function trySendEmail() {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                attempts++;
                console.log(`Error sending email (attempt ${attempts}):`, error);
                if (attempts < maxAttempts) {
                    setTimeout(trySendEmail, 1000); // Wait 1 second before retry
                } else {
                    res.json({ success: false, message: 'Email not working, Try after sometime.' });
                }
            } else {
                console.log('Email sent:', info.response);
                // Ethereal preview URL
                console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
                res.json({ success: true, message: 'Email sent successfully.', previewUrl: nodemailer.getTestMessageUrl(info) });
            }
        });
    }
    trySendEmail();
});

// Endpoint to provide system info for preview
app.get('/sysinfo', (req, res) => {
    const computerName = os.hostname();
    const userName = os.userInfo().username;
    const now = new Date();
    // Format dateTime in 24-hour format and remove comma
    let dateTime = now.toLocaleDateString() + ' ' + now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + ':' + now.getSeconds().toString().padStart(2, '0');
    res.json({ computerName, userName, dateTime });
});


const DUMMY_DIR = 'C:/Dummy';
const FILE_PATH = path.join(DUMMY_DIR, 'FTP_Data.txt');


app.post('/save', (req, res) => {
    const { control, firstName, lastName, dob, email } = req.body;
    // Validation
    const controlValid = typeof control === 'string' && /^\d{7}$/.test(control);
    const firstNameValid = typeof firstName === 'string' && firstName.trim().length > 0;
    const lastNameValid = typeof lastName === 'string' && lastName.trim().length > 0;
    const dobValid = typeof dob === 'string' && dob.trim() !== '' && dob !== 'dd-mm-yyyy' && !isNaN(Date.parse(dob));
    const emailValid = typeof email === 'string' && /^\S+@\S+\.\S+$/.test(email);
    if (!controlValid) {
        return res.status(400).json({ field: 'control', message: 'Control must be exactly 7 digits.' });
    }
    if (!firstNameValid) {
        return res.status(400).json({ field: 'firstName', message: 'First name cannot be empty or spaces.' });
    }
    if (!lastNameValid) {
        return res.status(400).json({ field: 'lastName', message: 'Last name cannot be empty or spaces.' });
    }
    if (!dob || dob === 'dd-mm-yyyy' || !dobValid) {
        return res.status(400).json({ field: 'dob', message: 'Enter valid DOB.' });
    }
    if (!emailValid) {
        return res.status(400).json({ field: 'email', message: 'Email is invalid.' });
    }
    // System info
    const computerName = os.hostname();
    const userName = os.userInfo().username;
    const now = new Date();
    // Format dateTime in 24-hour format and remove comma
    const dateTime = now.toLocaleDateString() + ' ' + now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + ':' + now.getSeconds().toString().padStart(2, '0');
    // Ensure Dummy directory exists
    fs.mkdir(DUMMY_DIR, { recursive: true }, (dirErr) => {
        if (dirErr) {
            return res.json({ message: 'Error creating directory.' });
        }
        // Save with single spaces between values, no tags, and system info on next line
        const content = `${userName} ${computerName} ${dateTime} ${email} ${control} ${firstName} ${lastName} ${dob}`;
        fs.writeFile(FILE_PATH, content, err => {
            if (err) {
                return res.json({ message: 'Error saving file.' });
            }
            res.json({ message: 'File saved successfully.' });
        });
    });
});

app.post('/transfer', async (req, res) => {
    const client = new ftp.Client();
    client.ftp.verbose = false;
    const { email, control, firstName, lastName, dob } = req.body;
    try {
        await client.access({
            host: 'ftp.dlptest.com', // <-- Replace with your FTP server
            user: 'dlpuser',    // <-- Replace with your FTP username
            password: 'rNrKYTX9g7z3RgJRmxWuGHbeu',// <-- Replace with your FTP password
            secure: false
        });
        // Set transfer type to ASCII (TYPE A)
        //await client.send('TYPE A');
        // Change to DummySSN directory, create if it does not exist
        // Ensure DummySSN directory exists (on mainframe, this is logical in dataset name)
        // Upload as GDG inside DummySSN folder
        await client.uploadFrom(FILE_PATH, "FTPData.txt");
        // Send email after FTP transfer, then delete file after successful email
        if (email) {
            // Use Ethereal for test emails
            let testAccount = await nodemailer.createTestAccount();
            let transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            let attachments = [];
            try {
                if (fs.existsSync(FILE_PATH)) {
                    attachments.push({ filename: 'Request.txt', path: FILE_PATH });
                }
            } catch (e) { /* ignore */ }
            let mailOptions = {
                from: 'Dummy App <no-reply@dummy.com>',
                to: email,
                subject: 'Dummy SSN Request',
                text: `Your request has been sent successfully.\n\nDetails:\nControl: ${control || ''}\nFirst Name: ${firstName || ''}\nLast Name: ${lastName || ''}\nDOB: ${dob || ''}\nEmail: ${email}\n\nResponse will be received within 3 hours.
                If not received within next 3 hours, Please contact ITPSMS DM DL.\n\nThanks,\nTeam Data Migrator`,
                attachments
            };
            transporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    console.log('Error sending email:', error);
                    res.json({ message: 'File transferred. Email sending failed.' });
                } else {
                    console.log('Email sent:', info.response);
                    // Ethereal preview URL
                    console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
                    // Delete the file after successful email
                    try {
                        await fs.promises.access(FILE_PATH, fs.constants.F_OK);
                        await fs.promises.unlink(FILE_PATH);
                        console.log('FTP_Data.txt deleted after email sent.');
                    } catch (err) {
                        if (err.code === 'ENOENT') {
                            console.log('FTP_Data.txt already deleted or not found.');
                        } else {
                            console.log('Error deleting file after email:', err);
                        }
                    }
                    res.json({ message: 'File transferred and deleted. Email sent successfully.', previewUrl: nodemailer.getTestMessageUrl(info) });
                }
            });
        } else {
            res.json({ message: 'File transferred and deleted.' });
        }
    } catch (err) {
        console.log('FTP Error:', err); // Add this line to log the error details
        res.json({ message: 'FTP transfer failed.' });
    }
    client.close();
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
