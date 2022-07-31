const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email{
    constructor(user,url){
        this.to = user.email;
        this.firstname = user.name.split(' ')[0];
        this.url = url;
        this.form = `'admin <${process.env.EMAIL_FORM}>'`
    }

    newTransport(){
        if(process.env.NODE_ENV === 'production'){
            //sending
            return nodemailer.createTransport({
                service:'SendGrid',
                auth:{
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST, 
            port: process.env.EMAIL_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }
    //Send the actual email
    async send(template,subject){
        //1) render Html based on a pug template
            const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`,
                {
                    firstName:this.firstname,
                    url: this.url,
                    subject
                }
            );
                
        //2)Define the email option
            const mailOption = {
                from: this.form,
                to: this.to,
                subject,
                html,
                text: htmlToText.fromString(html)
            };
        //3) Actually send email
            await this.newTransport().sendMail(mailOption);
        
    }
    async sendWelcom(){
        await this.send('welcom','wellcome to natours family')
    }
    async sendPasswordReset(){
        await this.send('passwordReset','your password reset token ( valid for 10 min ) ');
    };

};

