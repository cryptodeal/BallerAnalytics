import nodemailer from 'nodemailer';
import { renderMail } from 'svelte-mail';
import Mail from '$lib/_api/auth/Mail.svelte';

class Email {
	constructor(user, url, browser, os, time) {
		this.to = user.email;
		this.url = url;
		this.browser = browser;
		this.os = os;
		this.time = time;
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
		const { html, text } = await renderMail(Mail, {
			data: {
				email: this.to,
				authLink: this.url,
				browser: this.browser,
				os: this.os,
				time: this.time
			}
		});
		// setup email data with unicode symbols
		let mailOptions = {
			from: `${this.fromName} <${this.fromEmail}>`,
			to: this.to,
			subject: 'Login Email Test',
			text: await text,
			html: await html
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
