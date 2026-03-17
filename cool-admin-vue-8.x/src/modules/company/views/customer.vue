<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-refresh-btn />
			<cl-add-btn />
			<cl-multi-delete-btn />
			<cl-flex1 />
			<cl-search-key :placeholder="$t('搜索客户编码/客户名称')" :width="260" />
		</cl-row>

		<cl-row>
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>

		<cl-upsert ref="Upsert" />
	</cl-crud>
</template>

<script lang="ts" setup>
defineOptions({
	name: "company-customer",
});

import { useCrud, useTable, useUpsert } from "@cool-vue/crud";
import { useCool } from "/@/cool";
import { useI18n } from "vue-i18n";
import { reactive,ref } from "vue";
import { ElMessage } from "element-plus";

const { service } = useCool();
const { t } = useI18n();

const options = reactive({
	customerNature: [
		{ label: t("终客户"), value: 0 },
		{ label: t("集成商"), value: 1 },
	],
	dealStatus: [
		{ label: t("未成交"), value: 0 },
		{ label: t("已成交"), value: 1 },
		{ label: t("多次成交"), value: 2 },
	],
	winStatus: [
		{ label: t("未赢单"), value: 0 },
		{ label: t("已赢单"), value: 1 },
		{ label: t("多次赢单"), value: 2 },
	],
	level: [
		{ label: t("核心客户"), value: 0 },
		{ label: t("一般客户"), value: 1 },
		{ label: t("潜在客户"), value: 2 },
	],
	manageStatus: [
		{ label: t("背调中"), value: 0 },
		{ label: t("初次接触"), value: 1 },
		{ label: t("需求确认"), value: 2 },
		{ label: t("合作中"), value: 3 },
		{ label: t("合作结束"), value: 4 },
		{ label: t("目前无需求"), value: 5 },
		{ label: t("放弃"), value: 6 },
	],
	backgroundSource: [
		{ label: t("公司资源"), value: 0 },
		{ label: t("自由开拓"), value: 1 },
		{ label: t("客户介绍"), value: 2 },
		{ label: t("电话咨询"), value: 3 },
	],
	backgroundIsListed: [
		{ label: t("否"), value: 0 },
		{ label: t("是"), value: 1 },
	],
	lastFollowType: [
		{ label: t("电话拜访"), value: 0 },
		{ label: t("微信拜访"), value: 1 },
		{ label: t("钉钉拜访"), value: 2 },
		{ label: t("网络平台"), value: 3 },
		{ label: t("上门拜访"), value: 4 },
	],
	followStatus: [
		{ label: t("无需求跟进"), value: 0 },
		{ label: t("有需求跟进"), value: 1 },
	],
	factorySituation: [
		{ label: t("总厂"), value: 0 },
		{ label: t("分厂"), value: 1 },
	],
	hasFixedMaintenanceSupplier: [
		{ label: t("否"), value: 0 },
		{ label: t("是"), value: 1 },
	],
	hasCooperatedWithUs: [
		{ label: t("否"), value: 0 },
		{ label: t("是"), value: 1 },
	],
	cooperationIntention: [
		{ label: t("愿意合作"), value: 0 },
		{ label: t("积极"), value: 1 },
		{ label: t("一般"), value: 2 },
		{ label: t("弱"), value: 3 },
		{ label: t("无"), value: 4 },
	],
});

const upsertActiveTab = ref<"base" | "bg" | "visit">("base");

const Upsert = useUpsert<any>({
	dialog: {
		width: "1100px",
	},
	props: {
		labelWidth: "130px",
	},
	items: [
		// 1. 客户基础信息
		() => {
			return () => {
				return {
					label: t("客户编码"),
					prop: "customerNo",
					span: 12,
					hidden: Upsert.value?.mode == "add",
					component: {
						name: "el-input",
						props: {
							disabled: true,
							placeholder: t("保存后自动生成"),
						},
					},
				};
			};
		},
		{
			label: t("客户名称"),
			prop: "customerName",
			span: 12,
			required: true,
			component: { name: "el-input", props: { clearable: true } },
		},
		{
			label: t("客户性质"),
			prop: "customerNature",
			required: true,
			span: 12,
			component: {
				name: "el-select",
				options: options.customerNature,
				props: { clearable: true },
			},
		},
		{
			label: t("客户级别"),
			prop: "level",
			required: true,
			span: 12,
			component: {
				name: "el-select",
				options: options.level,
				props: { clearable: true },
			},
		},
		{
			label: t("统一信用代码"),
			prop: "socialCreditCode",
			span: 12,
			component: { name: "el-input", props: { clearable: true } },
		},
		{
			label: t("管理状态"),
			prop: "manageStatus",
			span: 12,
			component: {
				name: "el-select",
				options: options.manageStatus,
				props: { clearable: true },
			},
		},
		{
			label: t("成交状态"),
			prop: "dealStatus",
			span: 12,
			component: {
				name: "el-select",
				options: options.dealStatus,
				props: { clearable: true, disabled: true },
			},
		},
		{
			label: t("合同数量"),
			prop: "contractCount",
			span: 12,
			component: {
				name: "el-input-number",
				props: { disabled: true, min: 0, controls: false },
			},
		},
		{
			label: t("赢单状态"),
			prop: "winStatus",
			span: 12,
			component: {
				name: "el-select",
				options: options.winStatus,
				props: { clearable: true, disabled: true },
			},
		},
		{
			label: t("最近成交时间"),
			prop: "latestDealTime",
			span: 12,
			component: {
				name: "cl-date-text",
				props: { format: "YYYY-MM-DD HH:mm" },
			},
		},
		{
			label: t("拜访次数"),
			prop: "visitCount",
			span: 12,
			component: {
				name: "el-input-number",
				props: {
					disabled: true,
					min: 0,
					controls: false,
				},
			},
		},
		{
			label: t("距上次合作时间（天）"),
			prop: "daysSinceLastCooperation",
			span: 12,
			component: {
				name: "el-input-number",
				props: {
					disabled: true,
					min: 0,
					controls: false,
				},
			},
		},
		{
			label: t("合同订单总额"),
			prop: "contractOrderTotalAmount",
			span: 12,
			component: {
				name: "el-input-number",
				props: { disabled: true, min: 0, controls: false },
			},
		},
		{
			label: t("应收款余额"),
			prop: "receivableBalance",
			span: 12,
			component: {
				name: "el-input-number",
				props: { disabled: true, min: 0, controls: false },
			},
		},
		{
			label: t("退款总额"),
			prop: "refundTotalAmount",
			span: 12,
			component: {
				name: "el-input-number",
				props: { disabled: true, min: 0, controls: false },
			},
		},
		{
			label: t("开票总额"),
			prop: "invoiceTotalAmount",
			span: 12,
			component: {
				name: "el-input-number",
				props: { disabled: true, min: 0, controls: false },
			},
		},
		{
			label: t("询价单数量"),
			prop: "inquiryCount",
			span: 12,
			component: {
				name: "el-input-number",
				props: { disabled: true, min: 0, controls: false },
			},
		},
		{
			label: t("报价单数量"),
			prop: "quoteCount",
			span: 12,
			component: {
				name: "el-input-number",
				props: { disabled: true, min: 0, controls: false },
			},
		},
		{
			label: t("转换率（合同数/报价单数）"),
			prop: "contractConvertRate",
			span: 12,
			component: {
				name: "el-input",
				props: { disabled: true },
			},
		},

		// 2. 客户背调信息
		{
			label: t("来源"),
			prop: "backgroundSource",
			required: true,
			span: 12,
			component: {
				name: "el-select",
				options: options.backgroundSource,
				props: { clearable: true },
			},
		},
		{
			label: t("公司背景"),
			prop: "backgroundCompanyProfile",
			required: true,
			span: 24,
			component: {
				name: "el-input",
				props: { type: "textarea", rows: 3, clearable: true },
			},
		},
		{
			label: t("成立时间"),
			prop: "backgroundEstablishDate",
			required: true,
			span: 12,
			component: {
				name: "el-date-picker",
				props: {
					type: "date",
					"value-format": "YYYY-MM-DD",
					clearable: true,
				},
			},
		},
		{
			label: t("企业注册资金"),
			prop: "backgroundRegisteredCapital",
			span: 12,
			component: {
				name: "el-input-number",
				props: { min: 0, controls: false },
			},
		},
		{
			label: t("企业性质"),
			prop: "backgroundEnterpriseType",
			required: true,
			span: 12,
			component: { name: "el-input", props: { clearable: true } },
		},
		{
			label: t("是否上市"),
			prop: "backgroundIsListed",
			required: true,
			span: 12,
			component: {
				name: "el-radio-group",
				options: options.backgroundIsListed,
			},
		},
		{
			label: t("当年营业额"),
			prop: "backgroundTurnoverCurrent",
			span: 8,
			component: {
				name: "el-input-number",
				props: { min: 0, controls: false },
			},
		},
		{
			label: t("上一年营业额"),
			prop: "backgroundTurnoverLast",
			span: 8,
			component: {
				name: "el-input-number",
				props: { min: 0, controls: false },
			},
		},
		{
			label: t("上上年营业额"),
			prop: "backgroundTurnoverPrev",
			span: 8,
			component: {
				name: "el-input-number",
				props: { min: 0, controls: false },
			},
		},
		{
			label: t("行业"),
			prop: "backgroundIndustry",
			required: true,
			span: 12,
			component: { name: "el-input", props: { clearable: true } },
		},
		{
			label: t("企业经营项目"),
			prop: "backgroundBusinessItems",
			required: true,
			span: 24,
			component: {
				name: "el-input",
				props: { type: "textarea", rows: 3, clearable: true },
			},
		},
		{
			label: t("上级客户"),
			prop: "backgroundSuperiorCustomer",
			span: 12,
			component: { name: "el-input", props: { clearable: true } },
		},
		{
			label: t("下游客户"),
			prop: "backgroundDownstreamCustomer",
			span: 12,
			component: { name: "el-input", props: { clearable: true } },
		},
		{
			label: t("机器人工艺"),
			prop: "backgroundRobotProcess",
			required: true,
			span: 24,
			component: {
				name: "el-input",
				props: { type: "textarea", rows: 3, clearable: true },
			},
		},
		{
			label: t("公司网址"),
			prop: "backgroundWebsite",
			span: 12,
			component: { name: "el-input", props: { clearable: true } },
		},
		{
			label: t("电话"),
			prop: "backgroundPhone",
			required: true,
			span: 12,
			component: { name: "el-input", props: { clearable: true } },
		},
		{
			label: t("电子邮件"),
			prop: "backgroundEmail",
			required: true,
			span: 12,
			component: { name: "el-input", props: { clearable: true } },
		},
		{
			label: t("备注"),
			prop: "backgroundRemark",
			span: 12,
			component: {
				name: "el-input",
				props: { type: "textarea", rows: 3, clearable: true },
			},
		},
		{
			label: t("国家"),
			prop: "backgroundCountry",
			required: true,
			span: 12,
			value: "中国",
			component: {
				name: "el-input",
				props: { clearable: true, placeholder: t("默认中国，可修改") },
			},
		},
		{
			label: t("省"),
			prop: "backgroundProvince",
			required: true,
			span: 6,
			component: { name: "el-input", props: { clearable: true } },
		},
		{
			label: t("市"),
			prop: "backgroundCity",
			required: true,
			span: 6,
			component: { name: "el-input", props: { clearable: true } },
		},
		{
			label: t("区"),
			prop: "backgroundDistrict",
			span: 6,
			component: { name: "el-input", props: { clearable: true } },
		},
		{
			label: t("详细地址"),
			prop: "backgroundAddressDetail",
			required: true,
			span: 12,
			component: { name: "el-input", props: { clearable: true } },
		},
		{
			label: t("负责人"),
			prop: "backgroundOwnerUserId",
			required: true,
			span: 12,
			component: {
				name: "el-input",
				props: {
					clearable: true,
					placeholder: t("请输入负责人姓名"),
				},
			},
		},
		{
			label: t("负责人所在部门"),
			prop: "backgroundOwnerDept",
			span: 12,
			value: "销售部",
			component: {
				name: "el-input",
				props: { clearable: true, placeholder: t("默认销售部，可修改") },
			},
		},
		{
			label: t("协作人"),
			prop: "backgroundCollaboratorUserIds",
			span: 12,
			component: {
				name: "el-input",
				props: {
					type: "textarea",
					rows: 2,
					placeholder: t("可选，多人用逗号分隔姓名，如：张三,李四"),
					clearable: true,
				},
			},
			hook: {
				bind(value: any) {
					if (Array.isArray(value)) return value.join(",");
					return value ?? "";
				},
				submit(value: any) {
					if (!value) return null;
					if (Array.isArray(value)) {
						return value.map((e) => String(e).trim()).filter((e) => e);
					}
					return String(value)
						.split(",")
						.map((e) => e.trim())
						.filter((e) => e);
				},
			},
		},
		// 创建与变更信息（只读）
		{
			label: t("创建人"),
			prop: "createUserId",
			span: 6,
			component: {
				name: "el-input",
				props: { disabled: true },
			},
		},
		{
			label: t("创建时间"),
			prop: "createTime",
			span: 6,
			component: {
				name: "cl-date-text",
				props: { format: "YYYY-MM-DD HH:mm" },
			},
		},
		{
			label: t("最后修改人"),
			prop: "backgroundLastModifyUserId",
			span: 6,
			component: {
				name: "el-input",
				props: { disabled: true },
			},
		},
		{
			label: t("最后修改时间"),
			prop: "updateTime",
			span: 6,
			component: {
				name: "cl-date-text",
				props: { format: "YYYY-MM-DD HH:mm" },
			},
		},
		{
			label: t("上一次负责人"),
			prop: "backgroundPreviousOwnerUserId",
			span: 6,
			component: {
				name: "el-input",
				props: { disabled: true },
			},
		},
		{
			label: t("负责人变更时间"),
			prop: "backgroundOwnerChangeTime",
			span: 6,
			component: {
				name: "cl-date-text",
				props: { format: "YYYY-MM-DD HH:mm" },
			},
		},

		// 3. 客户拜访信息
		{
			label: t("最近跟进类型"),
			prop: "lastFollowType",
			required: true,
			span: 12,
			component: {
				name: "el-select",
				options: options.lastFollowType,
				props: { clearable: true },
			},
		},
		{
			label: t("最近跟进时间"),
			prop: "lastFollowDate",
			required: true,
			span: 12,
			component: {
				name: "el-date-picker",
				props: {
					type: "date",
					"value-format": "YYYY-MM-DD",
					clearable: true,
				},
			},
		},
		{
			label: t("最近跟进人"),
			prop: "lastFollowUserId",
			span: 12,
			component: {
				name: "el-input",
				props: { clearable: true, placeholder: t("如不填写将默认当前登录人") },
			},
		},
		{
			label: t("跟进状态"),
			prop: "followStatus",
			required: true,
			span: 12,
			component: {
				name: "el-radio-group",
				options: options.followStatus,
			},
		},
		{
			label: t("距上次跟进（天）"),
			prop: "daysSinceLastFollow",
			span: 12,
			component: {
				name: "el-input-number",
				props: { disabled: true, min: 0, controls: false },
			},
		},
		{
			label: t("最近跟进内容"),
			prop: "lastFollowContent",
			required: true,
			span: 24,
			component: {
				name: "el-input",
				props: { type: "textarea", rows: 3, clearable: true },
			},
		},
		{
			label: t("工厂情况"),
			prop: "factorySituation",
			required: true,
			span: 12,
			component: {
				name: "el-select",
				options: options.factorySituation,
				props: { clearable: true },
			},
		},
		{
			label: t("设备情况（品牌、数量、型号）"),
			prop: "deviceSituation",
			required: true,
			span: 24,
			component: {
				name: "el-input",
				props: { type: "textarea", rows: 3, clearable: true },
			},
		},
		{
			label: t("机器人总数量"),
			prop: "robotTotalCount",
			required: true,
			span: 12,
			component: {
				name: "el-input-number",
				props: { min: 0, controls: false },
			},
		},
		{
			label: t("车间个数"),
			prop: "workshopCount",
			span: 12,
			component: {
				name: "el-input-number",
				props: { min: 0, controls: false },
			},
		},
		{
			label: t("应用车间"),
			prop: "applicationWorkshops",
			span: 24,
			component: {
				name: "el-input",
				props: { type: "textarea", rows: 3, clearable: true },
			},
		},
		{
			label: t("是否有固定维保供应商"),
			prop: "hasFixedMaintenanceSupplier",
			span: 12,
			component: {
				name: "el-radio-group",
				options: options.hasFixedMaintenanceSupplier,
			},
		},
		{
			label: t("合作供应商"),
			prop: "cooperationSuppliers",
			span: 24,
			component: {
				name: "el-input",
				props: { type: "textarea", rows: 3, clearable: true },
			},
		},
		{
			label: t("是否与我司有过合作"),
			prop: "hasCooperatedWithUs",
			required: true,
			span: 12,
			component: {
				name: "el-radio-group",
				options: options.hasCooperatedWithUs,
			},
		},
		{
			label: t("合作起止时间"),
			prop: "cooperationRange",
			span: 24,
			hook: {
				bind: (_: any, { form }: any) => {
					const arr = [form.cooperationStartDate, form.cooperationEndDate].filter(Boolean);
					return arr.length ? arr : [];
				},
				submit: (value: any, { form }: any) => {
					const [start, end] = value || [];
					form.cooperationStartDate = start ?? null;
					form.cooperationEndDate = end ?? null;
					return undefined;
				},
			},
			component: {
				name: "el-date-picker",
				props: {
					type: "daterange",
					"value-format": "YYYY-MM-DD",
					startPlaceholder: t("开始日期"),
					endPlaceholder: t("结束日期"),
					clearable: true,
				},
			},
		},
		{
			label: t("合作意向"),
			prop: "cooperationIntention",
			required: true,
			span: 12,
			component: {
				name: "el-select",
				options: options.cooperationIntention,
				props: { clearable: true },
			},
		},
	],

	onSubmit(data, { next, done }) {
		// 跨标签必填校验：新增客户必须三块信息都填完
		const requiredMap: Array<{ key: string; label: string; tab: "base" | "bg" | "visit" }> = [
			// 基础信息
			{ key: "customerName", label: t("客户名称"), tab: "base" },
			{ key: "customerNature", label: t("客户性质"), tab: "base" },
			{ key: "level", label: t("客户级别"), tab: "base" },
			// 背调信息
			{ key: "backgroundSource", label: t("来源"), tab: "bg" },
			{ key: "backgroundCompanyProfile", label: t("公司背景"), tab: "bg" },
			{ key: "backgroundEstablishDate", label: t("成立时间"), tab: "bg" },
			{ key: "backgroundEnterpriseType", label: t("企业性质"), tab: "bg" },
			{ key: "backgroundIsListed", label: t("是否上市"), tab: "bg" },
			{ key: "backgroundIndustry", label: t("行业"), tab: "bg" },
			{ key: "backgroundBusinessItems", label: t("企业经营项目"), tab: "bg" },
			{ key: "backgroundRobotProcess", label: t("机器人工艺"), tab: "bg" },
			{ key: "backgroundPhone", label: t("电话"), tab: "bg" },
			{ key: "backgroundEmail", label: t("电子邮件"), tab: "bg" },
			{ key: "backgroundCountry", label: t("国家"), tab: "bg" },
			{ key: "backgroundProvince", label: t("省"), tab: "bg" },
			{ key: "backgroundCity", label: t("市"), tab: "bg" },
			{ key: "backgroundAddressDetail", label: t("详细地址"), tab: "bg" },
			{ key: "backgroundOwnerUserId", label: t("负责人"), tab: "bg" },
			// 拜访信息
			{ key: "lastFollowType", label: t("最近跟进类型"), tab: "visit" },
			{ key: "lastFollowDate", label: t("最近跟进时间"), tab: "visit" },
			{ key: "followStatus", label: t("跟进状态"), tab: "visit" },
			{ key: "lastFollowContent", label: t("最近跟进内容"), tab: "visit" },
			{ key: "factorySituation", label: t("工厂情况"), tab: "visit" },
			{ key: "deviceSituation", label: t("设备情况（品牌、数量、型号）"), tab: "visit" },
			{ key: "robotTotalCount", label: t("机器人总数量"), tab: "visit" },
			{ key: "hasCooperatedWithUs", label: t("是否与我司有过合作"), tab: "visit" },
			{ key: "cooperationIntention", label: t("合作意向"), tab: "visit" },
		];

		for (const item of requiredMap) {
			const v = (data as any)[item.key];
			if (v === undefined || v === null || v === "") {
				ElMessage.error(t("请在【{section}】中填写「{field}」", {
					section:
						item.tab === "base"
							? t("客户基础信息")
							: item.tab === "bg"
								? t("客户背调信息")
								: t("客户拜访信息"),
					field: item.label,
				}));
				done();
				return;
			}
		}

		// 删除由后端自动维护的字段，避免误修改
		const payload = {
			...data,
		};

		delete payload.customerNo;
		delete payload.dealStatus;
		delete payload.contractCount;
		delete payload.winStatus;
		delete payload.latestDealTime;
		delete payload.visitCount;
		delete payload.daysSinceLastCooperation;
		delete payload.contractOrderTotalAmount;
		delete payload.receivableBalance;
		delete payload.refundTotalAmount;
		delete payload.invoiceTotalAmount;
		delete payload.inquiryCount;
		delete payload.quoteCount;
		delete payload.contractConvertRate;
		delete payload.daysSinceLastFollow;
		delete payload.createUserId;
		delete payload.createTime;
		delete payload.updateTime;
		delete payload.backgroundLastModifyUserId;
		delete payload.backgroundPreviousOwnerUserId;
		delete payload.backgroundOwnerChangeTime;

		next(payload);
	},
});

const Table = useTable<any>({
	columns: [
		{ type: "selection", width: 60 },
		{ label: t("客户编码"), prop: "customerNo", minWidth: 140 },
		{ label: t("客户名称"), prop: "customerName", minWidth: 180 },
		{
			label: t("客户性质"),
			prop: "customerNature",
			minWidth: 120,
			dict: options.customerNature,
		},
		{
			label: t("客户级别"),
			prop: "level",
			minWidth: 120,
			dict: options.level,
		},
		{ label: t("统一信用代码"), prop: "socialCreditCode", minWidth: 180 },
		{
			label: t("管理状态"),
			prop: "manageStatus",
			minWidth: 140,
			dict: options.manageStatus,
		},
		{
			label: t("成交状态"),
			prop: "dealStatus",
			minWidth: 120,
			dict: options.dealStatus,
		},
		{ label: t("合同数量"), prop: "contractCount", minWidth: 120 },
		{
			label: t("赢单状态"),
			prop: "winStatus",
			minWidth: 120,
			dict: options.winStatus,
		},
		{
			label: t("最近成交时间"),
			prop: "latestDealTime",
			minWidth: 170,
			component: { name: "cl-date-text" },
		},
		{ label: t("拜访次数"), prop: "visitCount", minWidth: 100 },
		{
			label: t("距上次合作（天）"),
			prop: "daysSinceLastCooperation",
			minWidth: 150,
		},
		{
			label: t("合同订单总额"),
			prop: "contractOrderTotalAmount",
			minWidth: 150,
		},
		{
			label: t("应收款余额"),
			prop: "receivableBalance",
			minWidth: 150,
		},
		{
			label: t("开票总额"),
			prop: "invoiceTotalAmount",
			minWidth: 150,
		},
		{
			label: t("询价单数量"),
			prop: "inquiryCount",
			minWidth: 120,
		},
		{
			label: t("报价单数量"),
			prop: "quoteCount",
			minWidth: 120,
		},
		{
			label: t("转换率"),
			prop: "contractConvertRate",
			minWidth: 120,
			formatter(row: any) {
				const v = row.contractConvertRate;
				if (v === null || v === undefined) return "--";
				const num = Number(v);
				if (isNaN(num)) return v;
				return `${(num * 100).toFixed(2)}%`;
			},
		},
		{
			label: t("最近跟进时间"),
			prop: "lastFollowDate",
			minWidth: 150,
			component: { name: "cl-date-text" },
		},
		{
			label: t("距上次跟进（天）"),
			prop: "daysSinceLastFollow",
			minWidth: 150,
		},
		{
			label: t("负责人"),
			prop: "backgroundOwnerUserId",
			minWidth: 120,
		},
		{
			label: t("最后修改人"),
			prop: "backgroundLastModifyUserId",
			minWidth: 140,
		},
		{
			label: t("上一次负责人"),
			prop: "backgroundPreviousOwnerUserId",
			minWidth: 150,
		},
		{
			label: t("负责人变更时间"),
			prop: "backgroundOwnerChangeTime",
			minWidth: 170,
			component: { name: "cl-date-text" },
		},
		{
			label: t("创建时间"),
			prop: "createTime",
			minWidth: 170,
			sortable: "desc",
			component: { name: "cl-date-text" },
		},
		{
			label: t("更新时间"),
			prop: "updateTime",
			minWidth: 170,
			sortable: "custom",
			component: { name: "cl-date-text" },
		},
		{
			type: "op",
			buttons: ["edit", "delete"],
			width: 170,
		},
	],
});

const Crud = useCrud(
	{
		service: (service as any).company?.customer,
	},
	(app) => {
		app.refresh();
	},
);
</script>

<style lang="scss" scoped>
/* 分组标题：客户基础信息 / 背调信息 / 拜访信息 */
::v-deep(.customer-section-divider) {
	/* 更接近设置面板那种分组条样式：整行浅灰背景 + 下分割线 */
	margin: 16px 0 4px;
	padding: 10px 14px;
	text-align: left;
	background-color: #f5f7fa;
	border-radius: 6px 6px 0 0;
	border: 1px solid var(--el-border-color);
	border-bottom: none;
}

/* 去掉 el-divider 默认整条横线，只用我们自己的边框 */
::v-deep(.customer-section-divider.el-divider--horizontal) {
	border-top: none;
}

::v-deep(.customer-section-divider .el-divider__text) {
	padding: 0;
	font-weight: 600;
	font-size: 14px;
	color: var(--el-text-color-primary);
}

/* 让整张表单略微紧凑一点，看起来更整洁 */
::v-deep(.cl-upsert__body .el-form-item) {
	margin-bottom: 12px;
}
</style>


