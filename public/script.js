// Maintenance mode logic with overlay
let maintenanceOverlay = null;
function showMaintenanceOverlay() {
    if (!maintenanceOverlay) {
        maintenanceOverlay = document.createElement('div');
        maintenanceOverlay.id = 'maintenanceOverlay';
        maintenanceOverlay.style.position = 'fixed';
        maintenanceOverlay.style.top = 0;
        maintenanceOverlay.style.left = 0;
        maintenanceOverlay.style.width = '100vw';
        maintenanceOverlay.style.height = '100vh';
        maintenanceOverlay.style.background = 'linear-gradient(135deg, #e0e7ff 0%, #f4f4f4 100%)';
        maintenanceOverlay.style.display = 'flex';
        maintenanceOverlay.style.justifyContent = 'center';
        maintenanceOverlay.style.alignItems = 'center';
        maintenanceOverlay.style.zIndex = 9999;
        maintenanceOverlay.innerHTML = `
            <div style="background: #fff; border-radius: 18px; box-shadow: 0 6px 32px rgba(60, 72, 100, 0.18); padding: 48px 36px; display: flex; flex-direction: column; align-items: center; max-width: 420px;">
                <div style="font-size: 3.5rem; color: #ffb300; margin-bottom: 18px;">&#9888;</div>
                <h2 style="color:#d32f2f;font-size:2rem; margin-bottom: 10px; text-align: center;">Site Under Maintenance</h2>
                <div style="color:#3a4a5d; font-size: 1.15rem; text-align: center; margin-bottom: 8px;">We are performing scheduled maintenance.<br>Wait for 1 minute.</div>
                <div style="color:#7b9cff; font-size: 1rem; margin-top: 10px;">Thank you for your patience!</div>
            </div>
        `;
        document.body.appendChild(maintenanceOverlay);
    }
}
function hideMaintenanceOverlay() {
    if (maintenanceOverlay) {
        maintenanceOverlay.remove();
        maintenanceOverlay = null;
    }
}
function checkMaintenance() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    // Maintenance from 01:40:00 to 01:40:59
    if (hours === 11 && minutes === 50) {
        showMaintenanceOverlay();
        return true;
    } else {
        hideMaintenanceOverlay();
        return false;
    }
}
// Check on load and every 5 seconds
checkMaintenance();
setInterval(checkMaintenance, 5000);
// Reset button functionality
const transferBtn = document.getElementById('transferBtn');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const controlInputEl = document.getElementById('control');
const firstNameInputEl = document.getElementById('firstName');
const lastNameInputEl = document.getElementById('lastName');
const dobInputEl = document.getElementById('dob');
const emailInputEl = document.getElementById('email');


// Modal preview logic
let previewModal = null;
function showPreviewModal(content) {
    if (!previewModal) {
        previewModal = document.createElement('div');
        previewModal.id = 'previewModal';
        previewModal.style.position = 'fixed';
        previewModal.style.top = 0;
        previewModal.style.left = 0;
        previewModal.style.width = '100vw';
        previewModal.style.height = '100vh';
        previewModal.style.background = 'rgba(30, 34, 54, 0.45)';
        previewModal.style.display = 'flex';
        previewModal.style.justifyContent = 'center';
        previewModal.style.alignItems = 'center';
        previewModal.style.zIndex = 10000;
        previewModal.innerHTML = `
            <div style="background: #fff; border-radius: 22px; box-shadow: 0 10px 40px rgba(44,62,80,0.18); padding: 44px 38px 32px 38px; display: flex; flex-direction: column; align-items: center; min-width: 340px; max-width: 96vw; min-height: 320px;">
                <div style="font-size:2.5rem; color:#4f8cff; margin-bottom: 10px;">&#128196;</div>
                <h2 style='color:#1a237e; font-size:1.5rem; margin-bottom: 18px; letter-spacing:0.5px;'>Saved Data Preview</h2>
                <div style='background:#f4f7fb; color:#28324b; border-radius:10px; padding:20px 18px; font-size:1.13rem; margin-bottom: 28px; width:100%; white-space:pre-wrap; word-break:break-word; box-shadow:0 2px 8px rgba(44,62,80,0.06);'>${content.replace(/\n/g, '<br>')}</div>
                <button id="closePreviewBtn" style="padding: 12px 44px; font-size: 1.13rem; border: none; border-radius: 8px; background: linear-gradient(90deg, #4f8cff 0%, #6a7cff 100%); color: #fff; font-weight: 700; cursor: pointer; box-shadow: 0 2px 8px rgba(79, 140, 255, 0.08); transition: background 0.2s;">OK</button>
            </div>
        `;
        document.body.appendChild(previewModal);
        document.getElementById('closePreviewBtn').onclick = function() {
            previewModal.remove();
            previewModal = null;
        };
    }
}

function setTransferEnabled(enabled) {
    transferBtn.disabled = !enabled;
    if (!enabled) {
        transferBtn.classList.add('disabled');
    } else {
        transferBtn.classList.remove('disabled');
    }
}

// Initially disable transfer button
setTransferEnabled(false);

resetBtn.onclick = function () {
    controlInputEl.value = '';
    firstNameInputEl.value = '';
    lastNameInputEl.value = '';
    dobInputEl.value = '';
    emailInputEl.value = '';
    document.getElementById('status').textContent = '';
    // Optionally clear error messages if present
    const controlError = document.getElementById('controlError');
    if (controlError) controlError.style.display = 'none';
    const firstNameError = document.getElementById('firstNameError');
    if (firstNameError) firstNameError.style.display = 'none';
    const lastNameError = document.getElementById('lastNameError');
    if (lastNameError) lastNameError.style.display = 'none';
    const emailError = document.getElementById('emailError');
    if (emailError) emailError.style.display = 'none';
    setTransferEnabled(false);
    const dobError = document.getElementById('dobError');
    if (dobError) dobError.style.display = 'none';
};
// Restrict year in DOB to 4 digits
document.getElementById('dob').addEventListener('input', function (e) {
    const dobInput = e.target;
    // Only allow valid yyyy-mm-dd format and restrict year to 4 digits
    const parts = dobInput.value.split('-');
    if (parts.length > 0 && parts[0].length > 4) {
        parts[0] = parts[0].slice(0, 4);
        dobInput.value = parts.join('-');
    }
    setTransferEnabled(false);
    // Clear DOB error on input
    const dobError = document.getElementById('dobError');
    if (dobError) dobError.style.display = 'none';
});

// Disable transfer if any field changes
controlInputEl.addEventListener('input', () => setTransferEnabled(false));
firstNameInputEl.addEventListener('input', () => setTransferEnabled(false));
lastNameInputEl.addEventListener('input', () => setTransferEnabled(false));
emailInputEl.addEventListener('input', () => setTransferEnabled(false));

document.getElementById('saveBtn').onclick = async function () {
    const control = controlInputEl.value;
    const firstName = firstNameInputEl.value;
    const lastName = lastNameInputEl.value;
    const dob = dobInputEl.value;
    const email = emailInputEl.value;
    const emailError = document.getElementById('emailError');
    // Basic email validation
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        emailError.textContent = 'Please enter a valid email address.';
        emailError.style.display = 'block';
        setTransferEnabled(false);
        return;
    } else {
        emailError.style.display = 'none';
    }
    let data;
    // Clear all error messages first
    const controlError = document.getElementById('controlError');
    const firstNameError = document.getElementById('firstNameError');
    const lastNameError = document.getElementById('lastNameError');
    const dobError = document.getElementById('dobError');
    const emailErrorDiv = document.getElementById('emailError');
    if (controlError) controlError.style.display = 'none';
    if (firstNameError) firstNameError.style.display = 'none';
    if (lastNameError) lastNameError.style.display = 'none';
    if (dobError) dobError.style.display = 'none';
    if (emailErrorDiv) emailErrorDiv.style.display = 'none';
    try {
        const res = await fetch('/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ control, firstName, lastName, dob, email })
        });
        data = await res.json();
        if (res.ok && data.message === 'File saved successfully.') {
            // Fetch system info from backend for popup
            const sysRes = await fetch('/sysinfo');
            const sysInfo = await sysRes.json();
            const previewContent = `UserName: ${sysInfo.userName}\nComputerName: ${sysInfo.computerName}\nDateTime: ${sysInfo.dateTime}\nEmail: ${email}\nControl: ${control}\nFirstName: ${firstName}\nLastName: ${lastName}\nDOB: ${dob}`;
            showPreviewModal(previewContent);
            setTransferEnabled(true);
        } else {
            setTransferEnabled(false);
        }
        // Only show status for non-validation errors
        if (!data.field && data.message) {
            document.getElementById('status').textContent = data.message;
        } else {
            document.getElementById('status').textContent = '';
        }
        // Show field-specific error if present
        if (data.field && data.message) {
            if (data.field === 'control' && controlError) {
                controlError.textContent = data.message;
                controlError.style.display = 'block';
            } else if (data.field === 'firstName' && firstNameError) {
                firstNameError.textContent = data.message;
                firstNameError.style.display = 'block';
            } else if (data.field === 'lastName' && lastNameError) {
                lastNameError.textContent = data.message;
                lastNameError.style.display = 'block';
            } else if (data.field === 'dob' && dobError) {
                dobError.textContent = data.message;
                dobError.style.display = 'block';
            } else if (data.field === 'email' && emailErrorDiv) {
                emailErrorDiv.textContent = data.message;
                emailErrorDiv.style.display = 'block';
            }
        }
    } catch (err) {
        document.getElementById('status').textContent = 'An error occurred.';
        setTransferEnabled(false);
    }
};

transferBtn.onclick = async function () {
    if (transferBtn.disabled) return;
    setTransferEnabled(false);
    const email = emailInputEl.value;
    const control = controlInputEl.value;
    const firstName = firstNameInputEl.value;
    const lastName = lastNameInputEl.value;
    const dob = dobInputEl.value;
    const statusDiv = document.getElementById('status');
    const res = await fetch('/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, control, firstName, lastName, dob })
    });
    const data = await res.json();
    if (data.message.includes('File transferred and deleted. Email sent successfully.')) {
        statusDiv.textContent = 'File is FTPed and email is sent.';
    } else if (data.message.includes('File transferred and deleted. Email sending failed.')) {
        statusDiv.innerHTML = 'FTP successful but email is not sent. <button id="retryEmailBtn" style="margin-left:10px;padding:4px 18px;font-size:1em;border-radius:6px;border:none;background:#4f8cff;color:#fff;cursor:pointer;">Try emailing again</button>';
        document.getElementById('retryEmailBtn').onclick = async function() {
            statusDiv.textContent = 'Trying to send email again...';
            const retryRes = await fetch('/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, control, firstName, lastName, dob })
            });
            const retryData = await retryRes.json();
            if (retryData.success) {
                statusDiv.textContent = 'Email sent successfully.';
            } else if (retryData.message && retryData.message.toLowerCase().includes('email not working')) {
                statusDiv.textContent = 'Email not working, Try after sometime.';
            } else {
                statusDiv.textContent = 'Email sending failed. Please try again.';
            }
        };
        setTransferEnabled(true);
    } else if (data.message && data.message.toLowerCase().includes('ftp transfer failed')) {
        statusDiv.textContent = 'FTP failed, please try again.';
        setTransferEnabled(true);
    } else {
        statusDiv.textContent = data.message;
    }
};
