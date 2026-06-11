export const emailTemplate = (email, otp) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
    <style>
        body{
            background:#f4f4f4;
            font-family:Arial, sans-serif;
        }

        .container{
            max-width:600px;
            margin:auto;
            background:white;
            padding:40px;
            border-radius:12px;
            text-align:center;
        }

        .email{
            color:#333;
            font-size:18px;
        }

        .otp{
            font-size:32px;
            font-weight:bold;
            color:#2563eb;
            margin:20px 0;
        }
    </style>
    </head>

    <body>
        <div class="container">
            <h1>Email Verification</h1>

            <p class="email">
                Hello ${email},
            </p>

            <p>Your OTP code is:</p>

            <div class="otp">
                ${otp}
            </div>

            <p>This code expires after 10 minutes.</p>
        </div>
    </body>
    </html>
    `;
};