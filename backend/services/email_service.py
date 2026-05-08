import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import threading

class EmailService:
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        
    def _send_email_async(self, recipient: str, subject: str, html_content: str):
        sender_email = os.getenv('SMTP_USER', '')
        sender_password = os.getenv('SMTP_PASSWORD', '')
        
        if not sender_email or not sender_password:
            print("WARNING: SMTP credentials not found. Email not sent.")
            return False
            
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"HR Manager <{sender_email}>"
            msg["To"] = recipient

            part = MIMEText(html_content, "html")
            msg.attach(part)

            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, recipient, msg.as_string())
            server.quit()
            print(f"Email sent successfully to {recipient}")
            return True
        except Exception as e:
            print(f"Failed to send email to {recipient}: {e}")
            return False

    def send_otp_email(self, recipient: str, otp: str):
        """
        Sends an OTP email asynchronously
        """
        subject = "Your Password Reset Code - HRManager"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #2D3DC0;">HRManager</h2>
                </div>
                <div style="background-color: #f9f9f9; border-radius: 8px; padding: 30px; text-align: center;">
                    <h3 style="margin-top: 0;">Password Reset Request</h3>
                    <p>You have requested to reset your password. Use the following 6-digit verification code:</p>
                    <div style="background-color: #fff; border: 2px dashed #2D3DC0; border-radius: 6px; padding: 15px; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #2D3DC0;">
                        {otp}
                    </div>
                    <p style="font-size: 14px; color: #666;">This code will expire in 1 hour.</p>
                    <p style="font-size: 14px; color: #666;">If you did not request a password reset, please ignore this email.</p>
                </div>
                <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
                    &copy; 2026 HRManager System. All rights reserved.
                </div>
            </body>
        </html>
        """
        
        # Run in a separate thread so it doesn't block the API response
        thread = threading.Thread(target=self._send_email_async, args=(recipient, subject, html_content))
        thread.start()

email_service = EmailService()
