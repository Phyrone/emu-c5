<script lang="ts">
	import { createApiReference } from '@scalar/api-reference';
	import '@scalar/api-reference/style.css';

	function init(element: HTMLElement) {
		$effect(() => {
			const ref = createApiReference(element, {
				url: '/api/openapi.json'
			});

			return () => {
				ref.destroy();
			};
		});
	}
</script>

<div use:init></div>
