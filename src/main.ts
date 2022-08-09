import App from './App.svelte';
import { library } from '@fortawesome/fontawesome-svg-core'
import {
	faRocket,
	faTimes
} from '@fortawesome/free-solid-svg-icons';

library.add(
	faRocket,
	faTimes
)

const app = new App({
	target: document.body
});

export default app;