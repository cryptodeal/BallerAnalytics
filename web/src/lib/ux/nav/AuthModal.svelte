<script lang="ts">
	import Modal from '$lib/ux/Modal.svelte';
	import { getNotificationsContext } from 'svelte-notifications';
	import { Form, Field, ErrorMessage } from 'svelte-forms-lib';
	import * as yup from 'yup';
	import IconX from '~icons/fluent/dismiss-24-regular';
	const { addNotification } = getNotificationsContext();
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	export let modalId: string, triggerTxt: string, closeDrawer: () => void;
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
			}).then((res) => {
				if (res.status === 200) {
					addNotification({
						text: `Success: Check Email for Auth Link`,
						position: 'top-right',
						type: 'success',
						removeAfter: 4000
					});
				} else {
					addNotification({
						text: `Error: Login Error; Please Try Again`,
						position: 'top-right',
						type: 'danger',
						removeAfter: 4000
					});
				}
			});
		}
	};
</script>

<Modal {modalId} {triggerTxt} onClick={closeDrawer}>
	<div slot="header">
		<div class="flex justify-center">
			<h3 class="font-bold">Login / Register</h3>
		</div>
	</div>
	<div slot="content">
		<div class="register-container p-1">
			<Form class="content" {...formProps}>
				<div class="m-1">
					<label for="email">email</label>
					<Field class="form-field" name="email" type="email" />
					<ErrorMessage class="form-error" name="email" />
				</div>

				<flex-container>
					<button class="cursor-pointer" type="submit">submit</button>
				</flex-container>
			</Form>
		</div>
	</div>

	<div slot="footer" />
</Modal>
