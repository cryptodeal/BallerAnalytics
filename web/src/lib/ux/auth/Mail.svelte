<script lang="ts">
	export let authLink: string;
	export let email: string;
	export let browser: string;
	export let os: string;
	export let time: string;
</script>

<table
	cellpadding="0"
	cellspacing="0"
	width="100%"
	style="background-color:#ffffff;backgroundtable-layout:fixed;vertical-align:top;min-width:320px;Margin:0 auto;border-spacing:0;border-collapse:collapse;width:100%"
>
	<tbody>
		<tr vertical-align="top" style="vertical-align:top">
			<td vertical-align="top" style="word-break:break-word;vertical-align:top">
				<div>
					<div
						style="Margin:0 auto;min-width:320px;max-width:500px;word-wrap:break-word;word-break:break-word"
					>
						<div style="border-collapse:collapse;display:table;width:100%">
							<div
								style="min-width:320px;max-width:500px;display:table-cell;vertical-align:top;width:500px"
							>
								<div style="width:100%!important">
									<div
										style="border-top:0px solid transparent;border-left:0px solid transparent;border-bottom:20px solid transparent;border-right:0px solid transparent;padding-top:0px;padding-bottom:0px;padding-right:0px;padding-left:0px"
									>
										<div />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div>
					<div
						style="Margin:0 auto;min-width:320px;max-width:500px;word-wrap:break-word;word-break:break-word"
					>
						<div style="border-collapse:collapse;display:table;width:100%">
							<div
								style="min-width:320px;max-width:500px;display:table-cell;vertical-align:top;width:500px"
							>
								<div style="width:100%!important">
									<div
										style="border-top:0px solid transparent;border-left:0px solid transparent;border-bottom:0px solid transparent;border-right:0px solid transparent;padding-top:0px;padding-bottom:15px;padding-right:50px;padding-left:50px"
									>
										<div content="left" style="padding-right:0px;padding-left:0px">
											<div style="font-size:1px;line-height:10px">&nbsp;</div>
										</div>

										<div
											style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.8;padding-top:5px;padding-right:0px;padding-bottom:0px;padding-left:0px"
										>
											<div
												style="line-height:1.8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px"
											>
												<p style="line-height:1.8;font-size:12px;margin:0">
													<span style="font-size:34px;color:black;">
														<strong>Baller Analytics </strong>
													</span>
												</p>
											</div>
										</div>

										<div
											style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.8;padding-top:15px;padding-right:0px;padding-bottom:15px;padding-left:0px"
										>
											<div
												style="font-size:12px;line-height:1.8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif"
											>
												<p style="font-size:14px;line-height:1.8;margin:0;color:black;">
													<span style="font-size:14px">
														Click the button below to log in to <strong>
															<span class="il">Baller Analytics</span></strong
														>.
													</span>
												</p>
												<p style="font-size:14px;line-height:1.8;margin:0;color:black;">
													<span style="font-size:14px">
														This button will expire in 20 minutes.
													</span>
												</p>
											</div>
										</div>

										<div
											content="left"
											style="padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:0px"
										>
											<a
												href={authLink}
												style="text-decoration:none;display:inline-block;background:#6851ff;background-color:#6851ff;border-radius:7px;width:auto;width:auto;border-top:1px solid #6851ff;border-right:1px solid #6851ff;border-bottom:1px solid #6851ff;border-left:1px solid #6851ff;padding-top:15px;padding-bottom:15px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;text-align:center;color:white;word-break:keep-all;font-size:18px;line-height:1.5;padding-left:30px;padding-right:30px;font-size:18px"
												target="_blank"
												data-saferedirecturl="https://www.google.com/url?q={authLink}"
											>
												<strong>Log in to Baller Analytics</strong></a
											>
										</div>

										<div
											style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.8;padding-top:20px;padding-right:0px;padding-bottom:10px;padding-left:0px"
										>
											<div
												style="font-size:12px;line-height:1.8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif"
											>
												<p style="font-size:14px;line-height:1.8;margin:0;color:black;">
													Button not showing? <strong>
														<a style="color:#6851ff;text-decoration:none;" href={authLink}
															>Click here</a
														></strong
													>
												</p>
												<br />
												<p style="font-size:14px;line-height:1.8;margin:0;color:black;">
													<span style="font-size:14px"
														>Confirming this request will securely log you in using <strong
															><a href="mailto:{email}" style="color:#6851ff;text-decoration:none;"
																>{email}</a
															></strong
														>.</span
													>
												</p>
												<p style="font-size:14px;line-height:1.8;margin:0">&nbsp;</p>

												<p style="font-size:14px;line-height:1.8;margin:0;">
													<span style="font-size:14px"
														>This login was requested using <strong>{browser}, {os}</strong> at
														<strong>{time}</strong>.</span
													>
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div>
					<div
						style="Margin:0 auto;min-width:320px;max-width:500px;word-wrap:break-word;word-break:break-word"
					>
						<div style="border-collapse:collapse;display:table;width:100%">
							<div
								style="min-width:320px;max-width:500px;display:table-cell;vertical-align:top;width:500px"
							>
								<div style="width:100%!important">
									<div
										style="border-top:0px solid transparent;border-left:0px solid transparent;border-bottom:0px solid transparent;border-right:0px solid transparent;padding-top:10px;padding-bottom:40px;padding-right:50px;padding-left:50px"
									>
										<div
											style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;line-height:1.8;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px"
										>
											<div
												style="font-size:12px;line-height:1.8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif"
											>
												<p style="font-size:14px;line-height:1.8;margin:0">
													<span style="font-size:14px">
														<strong>
															<span href="" style="color:#000000!important;"
																>- Baller Analytics Team</span
															>
														</strong>
													</span>
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</td>
		</tr>
	</tbody>
</table>
