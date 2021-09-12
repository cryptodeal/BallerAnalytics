import nodemailer from 'nodemailer';

class Email {
	constructor(user, url) {
		this.to = user.email;
		this.url = url;
		this.fromEmail = 'admin@tankienews.com';
		this.fromName = 'James Deal';
		this._transporter = nodemailer.createTransport({
			host: 'smtp.zoho.com',
			port: 465,
			auth: {
				user: import.meta.env.VITE_ZOHO_USER,
				pass: import.meta.env.VITE_ZOHO_PASS
			}
		});
	}

	async sendMagicLink() {
		// setup email data with unicode symbols
		let mailOptions = {
			from: `${this.fromName} <${this.fromEmail}>`,
			to: this.to,
			subject: 'Login Email Test',
			text: `Login URL: ${this.url}`,
			html: `<b>Login URL:</b> <a href='${this.url}'>${this.url}</a>`
		};

		try {
			return this._transporter.sendMail(mailOptions);
		} catch (err) {
			console.log(err);
			return err;
		}
	}
}

export default Email;
