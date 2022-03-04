import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { renderMail } from 'svelte-mail';
import config from '$lib/_config';
import Mail from '$lib/ux/auth/Mail.svelte';
import type { UserDocument } from '@balleranalytics/nba-api-ts';

interface SvelteSSRComponent {
	// eslint-disable-next-line @typescript-eslint/ban-types
	render(data: {}): { html: string; css: { code: string }; head: string };
}

class Email {
	public to: string;
	public url: string;
	public browser: string;
	public os: string;
	public time: string;
	public fromEmail: string;
	public fromName: string;
	public _transporter: Transporter;

	constructor(user: UserDocument, url: string, browser: string, os: string, time: string) {
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
				user: config.ZOHO_USER,
				pass: config.ZOHO_PASS
			}
		});
	}

	async sendMagicLink(): Promise<boolean | void> {
		const { html, text } = await renderMail(Mail as unknown as SvelteSSRComponent, {
			data: {
				email: this.to,
				authLink: this.url,
				browser: this.browser,
				os: this.os,
				time: this.time
			}
		});
		// setup email data with unicode symbols
		const mailOptions = {
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
			return false;
		}
	}
}

export default Email;
