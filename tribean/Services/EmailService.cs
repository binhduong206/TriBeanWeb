using System.Net;
using System.Net.Mail;

namespace Tribean.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendResetPasswordEmailAsync(string toEmail, string resetLink)
        {
            var smtpHost = _config["Email:SmtpHost"];
            var smtpPort = int.Parse(_config["Email:SmtpPort"]!);
            var smtpUser = _config["Email:SmtpUser"];
            var smtpPass = _config["Email:SmtpPass"];
            var fromEmail = _config["Email:FromEmail"];
            var fromName = _config["Email:FromName"];

            var subject = "Reset Your TriBean Password";
            var body = $@"
                <!DOCTYPE html>
                <html>
                <head>
                <meta charset='UTF-8' />
                <style>
                    body {{ font-family: 'Roboto', Arial, sans-serif; background: #faf8f5; margin: 0; padding: 0; }}
                    .container {{ max-width: 520px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }}
                    .header {{ background: #3a7d44; padding: 32px; text-align: center; }}
                    .header h1 {{ color: white; margin: 0; font-size: 24px; }}
                    .body {{ padding: 32px; }}
                    .body p {{ color: #444; line-height: 1.6; font-size: 15px; }}
                    .btn {{ display: inline-block; margin: 24px 0; padding: 14px 32px; background: #3a7d44; color: white !important; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; }}
                    .note {{ font-size: 13px; color: #888; margin-top: 16px; }}
                    .footer {{ background: #faf8f5; padding: 20px 32px; text-align: center; font-size: 12px; color: #aaa; }}
                </style>
                </head>
                <body>
                <div class='container'>
                    <div class='header'>
                    <h1>☕ TriBean Coffee</h1>
                    </div>
                    <div class='body'>
                    <p>Hi there,</p>
                    <p>We received a request to reset your password. Click the button below to set a new password. This link will expire in <strong>15 minutes</strong>.</p>
                    <a href='{resetLink}' class='btn'>Reset My Password</a>
                    <p class='note'>If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
                    <p class='note'>Or copy this link:<br/><a href='{resetLink}'>{resetLink}</a></p>
                    </div>
                    <div class='footer'>© 2026 TriBean Coffee. All rights reserved.</div>
                </div>
                </body>
                </html>";

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUser, smtpPass),
                EnableSsl = true
            };

            var mail = new MailMessage
            {
                From = new MailAddress(fromEmail!, fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mail.To.Add(toEmail);

            await client.SendMailAsync(mail);
        }
    }
}