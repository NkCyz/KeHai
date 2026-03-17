<script setup lang="ts">
import { onActivated, onBeforeUnmount, onDeactivated, onMounted } from 'vue';

const token = 'TaXSSeC06XG3DuvK';
const baseUrl = 'http://localhost';

declare global {
	interface Window {
		difyChatbotConfig?: {
			token: string;
			baseUrl: string;
			dynamicScript?: boolean;
			inputs: Record<string, unknown>;
			systemVariables: Record<string, unknown>;
			userVariables: Record<string, unknown>;
		};
	}
}

const bubbleButtonId = 'dify-chatbot-bubble-button';
const bubbleWindowId = 'dify-chatbot-bubble-window';

function clearEmbedArtifacts() {
	document.getElementById(bubbleButtonId)?.remove();
	document.getElementById(bubbleWindowId)?.remove();
	document.querySelectorAll(`script[src="${baseUrl}/embed.min.js"]`).forEach(el => el.remove());
}

function mountDify() {
	clearEmbedArtifacts();

	window.difyChatbotConfig = {
		token,
		baseUrl,
		dynamicScript: true,
		inputs: {},
		systemVariables: {},
		userVariables: {}
	};

	const script = document.createElement('script');
	script.src = `${baseUrl}/embed.min.js`;
	script.id = token;
	script.async = true;
	document.body.appendChild(script);
}

function unmountDify() {
	clearEmbedArtifacts();
	document.getElementById(token)?.remove();
	delete window.difyChatbotConfig;
}

onMounted(() => {
	mountDify();
});

onActivated(() => {
	mountDify();
});

onDeactivated(() => {
	unmountDify();
});

onBeforeUnmount(() => {
	unmountDify();
});
</script>

<template>
	<div class="quote-agent"></div>
</template>

<style>
#dify-chatbot-bubble-button {
	background-color: #1c64f2 !important;
}
#dify-chatbot-bubble-window {
	width: 24rem !important;
	height: 40rem !important;
}
</style>
