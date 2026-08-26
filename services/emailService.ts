import nodemailer from "nodemailer";

const gmailUser = process.env.GMAIL_USER;
const gmailPassword = process.env.GMAIL_APP_PASSWORD;

console.log("GMAIL_USER:", gmailUser);
console.log(
  "GMAIL_APP_PASSWORD exists:",
  !!gmailPassword
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailUser,
    pass: gmailPassword,
  },
});

export const sendPasswordResetOtp = async (
  email: string,
  otp: string
): Promise<void> => {
  if (!gmailUser || !gmailPassword) {
    throw new Error(
      "Gmail credentials are missing in .env"
    );
  }

  console.log(
    "Sending password reset OTP to:",
    email
  );

  await transporter.sendMail({
    from: `"IRONFORGE Gym" <${gmailUser}>`,
    to: email,
    subject: "IRONFORGE Password Reset OTP",

    text: `Your IRONFORGE password reset OTP is ${otp}. It is valid for 10 minutes.`,

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 500px;
        margin: auto;
        padding: 20px;
      ">
        <h2 style="color:#e11d48;">
          IRONFORGE Password Reset
        </h2>

        <p>
          You requested a password reset.
        </p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          text-align: center;
          background: #f5f5f5;
          padding: 20px;
          margin: 20px 0;
          border-radius: 10px;
        ">
          ${otp}
        </div>

        <p>
          This OTP is valid for
          <strong>10 minutes</strong>.
        </p>

        <p>
          If you did not request this password reset,
          you can ignore this email.
        </p>
      </div>
    `,
  });

  console.log(
    "Password reset OTP email sent successfully ✅"
  );
};