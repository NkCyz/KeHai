<template>
	<supple_agent />
	<cl-crud ref="Crud">
		<cl-row>
			<cl-refresh-btn />
			<cl-add-btn />
			<cl-multi-delete-btn />
			<cl-flex1 />

			<!-- 关键字搜索：按 inquiryNo/customer/projectName -->
			<cl-search-key :placeholder="$t('搜索询价单号/客户/项目名称')" :width="260" />
		</cl-row>

		<cl-row>
			<cl-table ref="Table">
				<template #column-quoteSummary="{ scope }">
					<template v-if="scope.row.quoteNo">
						<div class="quote-summary">
							<div class="quote-summary__no">{{ scope.row.quoteNo }}</div>

							<!-- 非备件类：显示供应商 + 未税/税率/含税/总成本 -->
							<template v-if="scope.row.inquiryType !== 4">
								<div class="quote-summary__row">
									<span class="label">{{ $t("供应商") }}</span>
									<span class="value">{{ scope.row.quoteSupplier || "-" }}</span>
								</div>
								<div class="quote-summary__row">
									<span class="label">{{ $t("未税") }}</span>
									<span class="value">{{ scope.row.quotePriceExclTax ?? "-" }}</span>
									<span class="label ml-2">{{ $t("税率") }}</span>
									<span class="value">{{ scope.row.quoteTaxRate ?? "-" }}%</span>
								</div>
								<div class="quote-summary__row">
									<span class="label">{{ $t("含税") }}</span>
									<span class="value">{{ scope.row.quotePriceInclTax ?? "-" }}</span>
									<span class="label ml-2">{{ $t("总成本") }}</span>
									<span class="value">{{ scope.row.quoteTotalCost ?? "-" }}</span>
								</div>
							</template>

							<!-- 备件类：只显示未税 / 含税 / 总成本 -->
							<template v-else>
								<div class="quote-summary__row">
									<span class="label">{{ $t("未税") }}</span>
									<span class="value">{{ scope.row.quotePriceExclTax ?? "-" }}</span>
								</div>
								<div class="quote-summary__row">
									<span class="label">{{ $t("含税") }}</span>
									<span class="value">{{ scope.row.quotePriceInclTax ?? "-" }}</span>
								</div>
								<div class="quote-summary__row">
									<span class="label">{{ $t("总成本") }}</span>
									<span class="value">{{ scope.row.quoteTotalCost ?? "-" }}</span>
								</div>
							</template>
						</div>
					</template>

					<template v-else>
						<el-tag disable-transitions effect="plain" type="danger">
							{{ $t("待报价") }}
						</el-tag>
					</template>
				</template>
			</cl-table>
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>

		<cl-upsert ref="Upsert">
			<!-- 备件类：物料列表可增删多条（绑定 spareItems） -->
			<template #slot-materialList="{ scope }">
				<!-- 此处的 scope 即为当前表单对象 -->
				<div v-if="scope">
					<el-table
						:data="scope.spareItems || []"
						size="small"
						border
						style="width: 100%; margin-bottom: 8px"
					>
						<el-table-column :label="$t('物料名称')" min-width="160">
							<template #default="{ $index }">
								<el-input
									v-model="scope.spareItems[$index].name"
									:placeholder="$t('请输入物料名称')"
									clearable
								/>
							</template>
						</el-table-column>
						<el-table-column :label="$t('物料大类')" min-width="140">
							<template #default="{ $index }">
								<el-select
									v-model="scope.spareItems[$index].categoryBig"
									:placeholder="$t('请选择物料大类')"
									clearable
								>
									<el-option
										v-for="opt in options.spareBigCategory"
										:key="opt.value"
										:label="opt.label"
										:value="opt.value"
									/>
								</el-select>
							</template>
						</el-table-column>
						<el-table-column :label="$t('物料小类')" min-width="160">
							<template #default="{ $index }">
								<el-select
									v-model="scope.spareItems[$index].categorySmall"
									:placeholder="$t('请选择物料小类')"
									clearable
								>
									<el-option
										v-for="opt in (scope.spareItems[$index].categoryBig === 'robot'
											? options.spareSubCategoryRobot
											: options.spareSubCategoryNonRobot)"
										:key="opt.value"
										:label="opt.label"
										:value="opt.value"
									/>
								</el-select>
							</template>
						</el-table-column>
						<el-table-column :label="$t('规格型号')" min-width="140">
							<template #default="{ $index }">
								<el-input
									v-model="scope.spareItems[$index].spec"
									:placeholder="$t('请输入规格型号')"
									clearable
								/>
							</template>
						</el-table-column>
						<el-table-column :label="$t('数量')" min-width="100">
							<template #default="{ $index }">
								<el-input
									v-model="scope.spareItems[$index].quantity"
									:placeholder="$t('请输入数量')"
									clearable
								/>
							</template>
						</el-table-column>
						<el-table-column :label="$t('品牌')" min-width="160">
							<template #default="{ $index }">
								<el-input
									v-model="scope.spareItems[$index].brand"
									:placeholder="$t('请输入品牌')"
									clearable
								/>
							</template>
						</el-table-column>
						<el-table-column :label="$t('操作')" width="100" align="center">
							<template #default="{ $index }">
								<el-button
									type="success"
									size="small"
									@click="removeSpareItem(scope, $index)"
								>
									{{ $t("删除") }}
								</el-button>
							</template>
						</el-table-column>
					</el-table>

					<el-button type="success" size="small" @click="addSpareItem(scope)">
						{{ $t("新增物料") }}
					</el-button>
				</div>
			</template>
		</cl-upsert>
	</cl-crud>
</template>

<script lang="ts" setup>
defineOptions({
	name: "company-inquiry",
});

import { useCrud, useTable, useUpsert } from "@cool-vue/crud";
import { useCool } from "/@/cool";
import { useI18n } from "vue-i18n";
import { reactive } from "vue";
import { Document } from "@element-plus/icons-vue";
import Supple_agent from "./supple_agent.vue";

const { service } = useCool();
const { t } = useI18n();

const options = reactive({
	inquiryType: [
		{ label: t("项目类"), value: 3, type: "info" },
		{ label: t("机械保养类"), value: 2, type: "warning" },
		{ label: t("机械维修类"), value: 1, type: "success" },
		{ label: t("机械加工类"), value: 0, type: "danger" },
		{ label: t("备件类"), value: 4, type: "primary" },
	],
	salesCategory: [
		{ label: t("项目类"), value: 3, type: "info" },
		{ label: t("机械保养类"), value: 2, type: "warning" },
		{ label: t("机械维修类"), value: 1, type: "success" },
		{ label: t("机械加工类"), value: 0, type: "danger" },
		{ label: t("备件类"), value: 4, type: "primary" },
	],
	siteEnvironment: [
		{ label: t("本体落地装（正装）"), value: 0 },
		{ label: t("倒装"), value: 1 },
		{ label: t("高台"), value: 2 },
		{ label: t("不入场"), value: 3 },
	],
	debugOwnership: [
		{ label: t("不需要"), value: 0 },
		{ label: t("科海"), value: 1 },
		{ label: t("客户"), value: 2 },
	],
	maintenanceType: [
		{ label: t("基础"), value: 0 },
		{ label: t("高级"), value: 1 },
	],
	// 吊装需求（除备件类外通用）
	hoistingRequirement: [
		{ label: t("无"), value: 0 },
		{ label: t("吊装机"), value: 1 },
		{ label: t("龙门架"), value: 2 },
		{ label: t("现场建筑"), value: 3 },
		{ label: t("其他"), value: 4 },
	],
	projectConstructType: [
		{ label: t("工作站搬迁"), value: 0 },
		{ label: t("工作站改造"), value: 1 },
		{ label: t("工作站恢复功能"), value: 2 },
		{ label: t("工作站翻新"), value: 3 },
		{ label: t("新建工作站"), value: 4 },
	],
	repairType: [
		{ label: t("漏油"), value: "漏油" },
		{ label: t("中心手"), value: "中心手" },
		{ label: t("平衡缸"), value: "平衡缸" },
		{ label: t("轴承"), value: "轴承" },
	],
	spareBigCategory: [
		{ label: t("机器人类"), value: "robot" },
		{ label: t("非机器人类"), value: "nonRobot" },
	],
	spareSubCategoryRobot: [
		{ label: t("整机机器人"), value: "整机机器人" },
		{ label: t("本体核心部件"), value: "本体核心部件" },
		{ label: t("示教器及其配件"), value: "示教器及其配件" },
		{ label: t("电气部分"), value: "电气部分" },
	],
	spareSubCategoryNonRobot: [
		{ label: t("五金件"), value: "五金件" },
		{ label: t("风扇（非机器人）"), value: "风扇（非机器人）" },
		{ label: t("密封件"), value: "密封件" },
		{ label: t("线缆（非机器人）"), value: "线缆（非机器人）" },
		{ label: t("传感器安全类"), value: "传感器安全类" },
		{ label: t("焊机类（备件+辅料）"), value: "焊机类（备件+辅料）" },
		{ label: t("西门子备件"), value: "西门子备件" },
		{ label: t("气动液压分类"), value: "气动液压分类" },
		{ label: t("传动机械"), value: "传动机械" },
		{ label: t("硬盘"), value: "硬盘" },
		{ label: t("油脂"), value: "油脂" },
	],
});

const Upsert = useUpsert<Eps.CompanyInquiryEntity>({
	dialog: {
		width: "1000px",
	},
	props: {
		labelWidth: "120px",
	},
	items: [
		() => {
			return () => {
				return {
					label: t("询价单号"),
					prop: "inquiryNo",
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
			label: t("客户"),
			prop: "customer",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("项目名称"),
			prop: "projectName",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
		},
		{
			label: t("项目地点（省市县）"),
			prop: "projectLocation",
			component: { name: "cl-distpicker" },
			span: 12,
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType == 4,
		},
		{
			label: t("具体地址"),
			prop: "address",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType == 4,
		},
		{
			label: t("项目工期"),
			prop: "projectDateRange",
			hook: {
				bind: (_: any, { form }: any) => {
					const arr = [form.projectStartDate, form.projectEndDate].filter(Boolean);
					return arr.length ? arr : [];
				},
				submit: (value: any, { form }: any) => {
					const [start, end] = value || [];
					form.projectStartDate = start;
					form.projectEndDate = end;
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
			span: 24,
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType == 4,
		},

		// 询价类型（放在项目工期之后）
		{
			label: t("询价类型"),
			prop: "inquiryType",
			value: 3,
			required: true,
			component: {
				name: "el-select",
				options: options.inquiryType,
				props: {
					clearable: false,
					onChange(val: number) {
						Upsert.value?.setForm("salesCategory", val);
					},
				},
			},
		},

		// 各类型专属字段（夹在询价类型和交付标准之间）

		// 加工类专属（扁平字段）
		{
			label: t("加工要求"),
			prop: "processingRequirement",
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType != 0,
			component: {
				name: "el-input",
				props: { clearable: true, type: "textarea", rows: 4 },
			},
			span: 24,
		},
		{
			label: t("图纸附件"),
			prop: "drawingAttachments",
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType != 0,
			component: {
				name: "cl-upload",
				props: {
					type: "file",
					multiple: true,
					icon: Document,
					text: t("上传图纸"),
				},
			},
			span: 24,
		},

		// 维修类专属（去掉分组卡片，仅保留字段）
		{
			label: t("维修类型（下拉+可自填）"),
			prop: "repairType",
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType != 1,
			component: {
				name: "el-select",
				options: options.repairType,
				props: {
					filterable: true,
					allowCreate: true,
					defaultFirstOption: true,
					clearable: true,
				},
			},
			span: 24,
		},
		{
			label: t("故障描述"),
			prop: "faultDescription",
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType != 1,
			component: {
				name: "el-input",
				props: { clearable: true, type: "textarea", rows: 4 },
			},
			span: 24,
		},
		{
			label: t("现场环境"),
			prop: "siteEnvironmentRepair",
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType != 1,
			component: {
				name: "el-select",
				options: options.siteEnvironment,
				props: { clearable: true },
			},
			span: 24,
		},

		{
			label: t("现场附件（图片/视频）"),
			prop: "siteAttachments",
			hidden: ({ scope }: any) => scope.inquiryType != 1,
			component: {
				name: "cl-upload",
				props: {
					type: "file",
					multiple: true,
					accept: "image/*,video/*",
					icon: Document,
					text: t("上传现场附件"),
				},
			},
			span: 24,
		},
		{
				label: t("明确调试归属"),
				prop: "debugOwnership",
				required: true,
				hidden: ({ scope }: any) => scope.inquiryType != 1,
				component: {
					name: "el-select",
					options: options.debugOwnership,
					props: { clearable: true },
				},
				span: 24,
			},

		// 保养类专属（inquiryType = 2）- 扁平字段
		{
			label: t("现场环境"),
			prop: "siteEnvironmentMaintain",
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType != 2,
			component: {
				name: "el-select",
				options: options.siteEnvironment,
				props: { clearable: true },
			},
			span: 12,
		},
		{
			label: t("保养类型"),
			prop: "maintenanceType",
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType != 2,
			component: {
				name: "el-select",
				options: options.maintenanceType,
				props: { clearable: true },
			},
			span: 12,
		},
		{
			label: t("保养范围"),
			prop: "maintenanceScope",
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType != 2,
			component: {
				name: "el-input",
				props: { clearable: true, type: "textarea", rows: 4 },
			},
			span: 24,
		},

		// 项目类专属（inquiryType = 3）- 扁平字段
		{
			label: t("施工类型"),
			prop: "projectConstructType",
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType != 3,
			component: {
				name: "el-select",
				options: options.projectConstructType,
				props: { clearable: true },
			},
			span: 24,
		},
		{
			label: t("施工内容"),
			prop: "projectConstructContent",
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType != 3,
			component: {
				name: "el-input",
				props: { clearable: true, type: "textarea", rows: 4 },
			},
			span: 24,
		},
		{
			label: t("施工内容附件（客户技术协议）"),
			prop: "projectConstructAttachments",
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType != 3,
			component: {
				name: "cl-upload",
				props: {
					type: "file",
					multiple: true,
					text: t("上传技术协议"),
				},
			},
			span: 24,
		},
		{
			label: t("现场环境说明"),
			prop: "projectSiteEnvDesc",
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType != 3,
			component: {
				name: "el-input",
				props: { clearable: true, type: "textarea", rows: 4 },
			},
			span: 24,
		},
		{
			label: t("现场环境附件（图片/视频）"),
			prop: "projectSiteEnvAttachments",
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType != 3,
			component: {
				name: "cl-upload",
				props: {
					type: "file",
					multiple: true,
					accept: "image/*,video/*",
					text: t("上传现场环境图片/视频"),
				},
			},
			span: 24,
		},
		// 统一的设备信息（除备件类外都展示）
		{
			label: t("设备品牌"),
			prop: "equipmentBrand",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType == 4,
		},
		{
			label: t("设备型号及数量"),
			prop: "equipmentModelQty",
			component: { name: "el-input", props: { clearable: true } },
			span: 12,
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType == 4,
		},

		// 询价类别字段仅作为内部映射使用，不再单独展示
		{
			label: t("销售类别"),
			prop: "salesCategory",
			value: 0,
			component: {
				name: "el-select",
				options: options.salesCategory,
				props: { disabled: true },
			},
			required: false,
			hidden: () => true,
		},

		// 备件类专属字段（inquiryType = 4）- 多物料列表（spareItems）
		{
			label: t("物料列表"),
			prop: "spareItems",
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType != 4,
			component: {
				name: "slot-materialList",
			},
			span: 24,
		},
		{
			label: t("交付标准"),
			prop: "deliverStandard",
			component: {
				name: "el-input",
				props: { clearable: true, type: "textarea", rows: 3 },
			},
			span: 12,
			required: true,
		},
		{
			label: t("售后要求"),
			prop: "afterSalesRequirement",
			component: {
				name: "el-input",
				props: { clearable: true, type: "textarea", rows: 3 },
			},
			span: 12,
			required: true,
		},

		// 新增：通用必填文本字段
		{
			label: t("备件明细"),
			prop: "sparePartsDetail",
			component: {
				name: "el-input",
				props: { clearable: true, type: "textarea", rows: 3 },
			},
			span: 12,
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType == 4,
		},
		{
			label: t("工具要求"),
			prop: "toolRequirement",
			component: {
				name: "el-input",
				props: { clearable: true, type: "textarea", rows: 3 },
			},
			span: 12,
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType == 4,
		},
		{
			label: t("软件要求"),
			prop: "softwareRequirement",
			component: {
				name: "el-input",
				props: { clearable: true, type: "textarea", rows: 3 },
			},
			span: 12,
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType == 4,
		},
		// 吊装需求（除备件类外通用）
		{
			label: t("吊装需求"),
			prop: "hoistingRequirement",
			component: {
				name: "el-select",
				options: options.hoistingRequirement,
				props: {
					clearable: true,
				},
			},
			span: 12,
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType == 4,
		},
		{
			label: t("能力需求"),
			prop: "capabilityRequirement",
			component: {
				name: "el-input",
				props: { clearable: true, type: "textarea", rows: 3 },
			},
			span: 12,
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType == 4,
		},
		{
			label: t("技术工种及人数"),
			prop: "workerTypeAndCount",
			component: {
				name: "el-input",
				props: { clearable: true, type: "textarea", rows: 3 },
			},
			span: 12,
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType == 4,
		},
		{
			label: t("具体人员（内部人员/委外）"),
			prop: "specificPersonnel",
			component: {
				name: "el-input",
				props: { clearable: true, type: "textarea", rows: 3 },
			},
			span: 12,
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType == 4,
		},
		{
			label: t("初步施工方案"),
			prop: "initialConstructionPlan",
			component: {
				name: "el-input",
				props: { clearable: true, type: "textarea", rows: 4 },
			},
			span: 24,
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType == 4,
		},

	],

	onOpened(data) {
		if (data?.inquiryType !== undefined) {
			data.salesCategory = data.inquiryType;
		}

		// 备件类：编辑时还原 spareItems 为数组
		if (data?.inquiryType === 4) {
			if (!Array.isArray(data.spareItems)) {
				data.spareItems = data.spareItems ? [].concat(data.spareItems as any) : [];
			}

			// 对齐后端字段：categoryBig/categorySmall/brand，并兼容旧字段
			data.spareItems = data.spareItems.map((item: any) => {
				const next: any = { ...(item || {}) };
				if (next.categoryBig == null) {
					next.categoryBig = next.bigCategory ?? next.category ?? "robot";
				}
				if (next.categorySmall == null) {
					next.categorySmall = next.subCategory ?? "";
				}
				if (next.brand == null) {
					next.brand = next.remark ?? "";
				}
				return next;
			});
		}

		// 维修类 / 保养类：从后端 siteEnvironment 回填到对应的下拉字段，保证编辑时能看到选中的值
		if (data?.inquiryType === 1) {
			if (data.siteEnvironmentRepair === undefined && data.siteEnvironment !== undefined) {
				(data as any).siteEnvironmentRepair = data.siteEnvironment;
			}
		}
		if (data?.inquiryType === 2) {
			if (data.siteEnvironmentMaintain === undefined && data.siteEnvironment !== undefined) {
				(data as any).siteEnvironmentMaintain = data.siteEnvironment;
			}
		}
	},

	onSubmit(data, { next }) {
		// 非备件类时，避免提交 spareItems（后端也会清理，这里做一次前端兜底）
		if (data.inquiryType !== 4) {
			data.spareItems = undefined;
		}

		// 统一修正询价类型，确保为数字并与 salesCategory 对齐
		const fixedInquiryType = Number((data as any).inquiryType);

		// 统一写入后端期望的 siteEnvironment 字段（维修 / 保养）
		let siteEnv = (data as any).siteEnvironment;
		if (fixedInquiryType === 1 && (data as any).siteEnvironmentRepair !== undefined) {
			siteEnv = (data as any).siteEnvironmentRepair;
		}
		if (fixedInquiryType === 2 && (data as any).siteEnvironmentMaintain !== undefined) {
			siteEnv = (data as any).siteEnvironmentMaintain;
		}

		next({
			...data,
			inquiryType: isNaN(fixedInquiryType) ? data.inquiryType : fixedInquiryType,
			salesCategory: isNaN(fixedInquiryType) ? data.inquiryType : fixedInquiryType,
			projectDateRange: undefined,
			// 仅当实际选择了现场环境时才提交该字段
			...(siteEnv !== undefined ? { siteEnvironment: siteEnv } : {}),
		});
	},
});

function ensureSpareItems(form: any) {
	if (!form.spareItems || !Array.isArray(form.spareItems)) {
		form.spareItems = [];
	}
}

function addSpareItem(form: any) {
	if (!form) return;
	ensureSpareItems(form);
	form.spareItems.push({
		name: "",
		categoryBig: "robot",
		categorySmall: "",
		spec: "",
		quantity: "",
		brand: "",
	});
}

function removeSpareItem(form: any, index: number) {
	if (!form) return;
	ensureSpareItems(form);
	if (index >= 0 && index < form.spareItems.length) {
		form.spareItems.splice(index, 1);
	}
}

const Table = useTable<Eps.CompanyInquiryEntity>({
	columns: [
		{ type: "selection", width: 60 },
		{ label: t("询价单号"), prop: "inquiryNo", minWidth: 160 },
		{
			label: t("询价类型"),
			prop: "inquiryType",
			minWidth: 120,
			dict: options.inquiryType,
		},
		{ label: t("客户"), prop: "customer", minWidth: 140 },
		{ label: t("项目名称"), prop: "projectName", minWidth: 180 },
		{
			label: t("项目地点（省市县）"),
			prop: "projectLocation",
			minWidth: 160,
			formatter(row: any) {
				const v = row.projectLocation;
				if (Array.isArray(v)) return v.filter(Boolean).join("");
				return v || "-";
			},
		},
		{
			label: t("项目工期"),
			prop: "projectRange",
			minWidth: 200,
			formatter(row: any) {
				const s = row.projectStartDate ? String(row.projectStartDate).slice(0, 10) : "";
				const e = row.projectEndDate ? String(row.projectEndDate).slice(0, 10) : "";
				return s || e ? `${s || "-"} ~ ${e || "-"}` : "-";
			},
		},
		{
			label: t("报价信息摘要"),
			prop: "quoteSummary",
			minWidth: 260,
		},
		{
			label: t("创建时间"),
			prop: "createTime",
			minWidth: 170,
			sortable: "desc",
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
		service: service.company.inquiry,
	},
	(app) => {
		app.refresh();
	},
);

function refresh(params?: any) {
	Crud.value?.refresh(params);
}
</script>

<style lang="scss" scoped>
.quote-summary {
	line-height: 18px;

	&__no {
		font-weight: 600;
		margin-bottom: 4px;
	}

	&__row {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;

		.label {
			color: var(--el-text-color-secondary);
		}

		.value {
			color: var(--el-text-color-primary);
		}
	}
}
</style>
