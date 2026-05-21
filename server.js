// **** PostersFlow ****
// I am lorcan solan this is my name in web
import express from "express";
import path from "path";
import multer from 'multer';
import nodemailer from 'nodemailer'
import fs from 'fs'
const app = express();
const PORT = 3500;
// multer => dest
const upload = multer({ dest: 'uploads/' });
// middelware for read json data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
// create Transport (gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'xxxxx@gmail.com',
        pass: 'xxxx xxxx yyyy yyyy'// u can use you app password by (env)
    }
});
// GET => page looking for jobs
app.get('/', (req, res) => {
    res.render('jobs.ejs')
})
// POST => '/api/looking-poster'
app.post('/api/looking-poster', upload.single('attachment'), async (req, res) => {
    try {
        const { email, title, content } = req.body;
        const file = req.file;
        if (!email) return res.status(400).json({ message: "Email address is required" });
        const Separate_Email_data = email.split(",");
        if (!title || !content) return res.status(400).json({ "message": "Title and content are required" });
        // Create array for Storage files
        const attachments = [];
        if (file) {
            attachments.push({
                filename: file.originalname,
                path: file.path
            });
        }
        if (Separate_Email_data.length > 10) return res.status(400).json({ "message": "you're right about the 20 emails To avoid Banned" })
        // Send message a lot of in the sametime By =>  (For)
        for (let i = 0; i < Separate_Email_data.length; i++) {
            const recipients = Separate_Email_data[i].trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(recipients)) {
                console.warn(`Skipping invalid email: ${element}`);
                continue; 
            }
            // here i did not use any messaage style because i want be simple style like normal users
            const mailOptions = {
                from: '<your-email@gmail.com>',
                to: recipients,
                subject: title,
                text: content,
                attachments: attachments
            };
            const info = await transporter.sendMail(mailOptions);
            console.log(`email: ${recipients} | ID: ${info.messageId}`);
        };
        res.status(200).json({ "message": "Emails dispatched successfully" })
        fs.unlinkSync(file.path);
    } catch (error) {
        console.error(error, "Error while sending from the server:");
        res.status(500).json({ error: "Error while sending from the server:", details: error.message })
    }
})

app.listen(PORT, () => {
    console.log(`server is run on ${PORT}`);
});