import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	// return {
	// 	toolbar: {
	// 		component: import('./components/code.vue')
	// 	}
	// };
	return {
		// 关闭 Github 图标工具栏
		enable: false
	};
};
