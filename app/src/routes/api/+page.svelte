<script lang="ts">
	import { createApiReference } from '@scalar/api-reference';

	import '@scalar/api-reference/style.css';

	function init(element: HTMLElement) {
		$effect(() => {
			const ref = import('@scalar/api-reference').then(({ createApiReference }) =>
				createApiReference(element, {
					url: '/api/openapi.json'
				})
			);
			//const ref = createApiReference(element, {
			//    url: '/api/openapi.json'
			//});

			return async () => {
				//ref.destroy();
				(await ref).destroy();
			};
		});
	}
</script>

<div use:init></div>
