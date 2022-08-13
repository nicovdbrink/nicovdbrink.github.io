// @ts-ignore
import App from './App.svelte';
import { library } from '@fortawesome/fontawesome-svg-core'
import {
	faBiking,
	faGamepad,
	faRunning,
	faFutbol,
	faHeadphonesSimple
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faBiking,
    faRunning,
    faGamepad,
	faFutbol,
	faHeadphonesSimple
)

const app = new App({
    target: document.body,
    intro: true
});

export default app;