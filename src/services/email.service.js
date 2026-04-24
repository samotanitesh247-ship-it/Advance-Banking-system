import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
    }
});


// Verify the transporter configuration
transporter.verify((error, success) => {
    if(error){
        console.log("Error setting up email transporter", error);
    } else {
        console.log("Email transporter is ready to send emails");
    }
})

export const sendVerificationEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html
        });
        console.log("Verification email sent: ", info.messageId);
        console.log("Preview URL: ", nodemailer.getTestMessageUrl(info));
        
    } catch (error) {
        console.error("Error sending verification email", error);
    }
}

export async function sendRegistrationEmail(userEmail, name) {
    const subject = "Welcome to Bank Transaction System";
    const text = `Hi ${name},\n\nThank you for registering with our Bank Transaction System. We're excited to have you on board! If you have any questions or need assistance, feel free to reach out to our support team.\n\nBest regards,\nBank Transaction System Team`;
    const html = `<p>Hi ${name},</p><p>Thank you for registering with our Bank Transaction System. We're excited to have you on board! If you have any questions or need assistance, feel free to reach out to our support team.</p><p>Best regards,<br/>Bank Transaction System Team</p>`;
    
    await sendVerificationEmail(userEmail, subject, text, html);
}