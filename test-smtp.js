const nodemailer = require("nodemailer");

async function testSmtp() {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "testeverythinginthisworld@gmail.com",
            pass: "Testeverythinginthisworld001"
        }
    });

    try {
        await transporter.verify();
        console.log("SMTP Connection successful!");
    } catch (e) {
        console.error("SMTP Connection failed:", e.message);
    }
}

testSmtp();
