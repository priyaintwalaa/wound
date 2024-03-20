require("dotenv").config();

exports.generateEmailService = async (email,password,user) =>{
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.SMTP_MAIL,
          pass: process.env.SMTP_PASSWORD
        }
      })
      const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: email, // recipient email address
        subject: 'Added Successfully',
        html: `<p ClassName='text-dark'>
        You have been added successfully by ${user.email}
        </p>
        <p>
        These are the temporary credentials to login 
        email: ${email},
        password: ${password}
        </p>
    `
      }
      transporter.sendMail(mailOptions)
}