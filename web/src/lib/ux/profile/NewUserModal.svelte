<script lang="ts">
	import Modal from '$lib/ux/Modal.svelte';
	import { Form, Field, ErrorMessage } from 'svelte-forms-lib';
	import * as yup from 'yup';
	import IconX from '~icons/fluent/dismiss-24-regular';

	const formProps = {
		initialValues: { email: '' },
		validationSchema: yup.object().shape({
			email: yup.string().email().required()
		}),
		onSubmit: (values) => {
			fetch('/api/auth.json', {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(values)
			});
		}
	};
</script>

<Modal>
	<div slot="trigger" let:open>
		<div class="h-full w-full text-center" on:click={open}>login / register</div>
	</div>

	<div slot="header" let:store={{ close }}>
		<div class="flex justify-end">
			<button class="bg-transparent cursor-pointer" on:click={close}>
				<IconX class="stroke-current hover:stroke-blue-500" />
			</button>
		</div>
		<h1 class="p-1">Login / Register</h1>
	</div>
	<div slot="content">
		<div class="register-container p-1">
			<Form class="content" {...formProps}>
				<div class="m-1">
					<label class="text-dark-600 dark:text-light-200" for="email">email</label>
					<Field class="form-field" name="email" type="email" />
					<ErrorMessage class="form-error" name="email" />
				</div>

				<flex-container>
					<button class="m-1 cursor-pointer" type="submit">submit</button>
				</flex-container>
			</Form>
		</div>
	</div>

	<div slot="footer" let:store={{ close }} />
</Modal>

<style lang="postcss">
	:root {
		--primary-light: #a6f9d6;
		--primary: #5be2a9;
		--primary-dark: #53ce9a;
		--secondary: #1e2145;
		--white: #fff;
		--grey: #e6e6ff;
		--grey-dark: #6d7098;
		--red: #ff6b6b;
	}

	label {
		display: block;
		color: var(--grey-dark);
		font-weight: bold;
		margin-top: 20px;
		margin-bottom: 4px;
		text-transform: uppercase;
		font-size: 12px;
		letter-spacing: 1.9px;
		line-height: 2;
	}

	:global(.form-field) {
		font-family: inherit;
		font-size: inherit;
		width: 100%;
		padding: 12px;
		box-sizing: border-box;
		border: 1px solid var(--grey);
		border-radius: 4px;
		transition: all 150ms ease;
		background: var(--white);
	}

	:global(.form-field:focus) {
		outline: none;
		box-shadow: 0 0 0 4px rgb(227, 227, 245);
		border-color: var(--grey);
	}

	:global(.form-error) {
		font-size: 12px;
		color: var(--red);
		margin-top: 10px;
		word-wrap: break-word;
	}

	flex-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 0;
		width: 100%;
	}

	.register-container {
		width: 100%;
	}
</style>
