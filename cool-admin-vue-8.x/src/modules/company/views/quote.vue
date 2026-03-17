<template>
	<supple_agent />
	<div class="company-quote">
		<!-- 待报价询价列表 -->
		<div class="company-quote__left">
			<div class="company-quote__left-header">
				<div class="title">{{ $t('待报价询价') }}</div>
				<el-button size="small" @click="refreshInquiryPage({ page: 1 })">
					{{ $t('刷新') }}
				</el-button>
			</div>

			<div class="company-quote__left-filters">
				<el-select
					v-model="inquiryParams.inquiryType"
					clearable
					:placeholder="$t('类型')"
					class="w-full"
					@change="refreshInquiryPage({ page: 1 })"
				>
					<el-option
						v-for="item in options.inquiryType"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					/>
				</el-select>

				<el-input
					v-model="inquiryParams.keyWord"
					clearable
					:placeholder="$t('搜索询价单号/客户/项目名称')"
					@keyup.enter="refreshInquiryPage({ page: 1 })"
					@change="refreshInquiryPage({ page: 1 })"
				/>
			</div>

			<el-scrollbar v-loading="inquiryLoading" class="company-quote__left-list">
				<div
					v-for="item in inquiryList"
					:key="item.inquiryNo || item.id || item.inquiryId"
					class="inquiry-item"
					:class="{
						'is-active':
							inquirySelectedKey === (item.inquiryNo || item.id || item.inquiryId)
					}"
					@click="openAddQuote(item)"
				>
					<div class="inquiry-item__top">
						<div class="no">{{ item.inquiryNo || '-' }}</div>
						<el-tag
							disable-transitions
							size="small"
							effect="plain"
							:type="
								options.inquiryType.find(e => e.value === item.inquiryType)?.type ||
								'info'
							"
						>
							{{
								(options.inquiryType.find(e => e.value === item.inquiryType)
									?.label as string) || '-'
							}}
						</el-tag>
					</div>

					<div class="inquiry-item__row">
						<span class="label">{{ $t('客户') }}</span>
						<span class="value">{{ item.customer || '-' }}</span>
					</div>
					<div class="inquiry-item__row">
						<span class="label">{{ $t('项目') }}</span>
						<span class="value">{{ item.projectName || '-' }}</span>
					</div>
					<div class="inquiry-item__row">
						<span class="label">{{ $t('工期') }}</span>
						<span class="value">{{
							formatRange(item.projectStartDate, item.projectEndDate)
						}}</span>
					</div>

					<div class="inquiry-item__action">
						<el-button
							size="small"
							type="success"
							plain
							@click.stop="openAddQuote(item)"
						>
							{{ $t('新增报价') }}
						</el-button>
					</div>
				</div>
			</el-scrollbar>

			<div class="company-quote__left-pagination">
				<el-pagination
					small
					background
					layout="prev, pager, next"
					:page-size="inquiryParams.size"
					:current-page="inquiryParams.page"
					:total="inquiryTotal"
					@current-change="p => refreshInquiryPage({ page: p })"
				/>
			</div>
		</div>

		<!-- 报价 CRUD -->
		<div class="company-quote__right">
			<cl-crud ref="Crud">
				<cl-row>
					<cl-refresh-btn />
					<cl-multi-delete-btn />
					<cl-flex1 />
					<cl-search-key :placeholder="$t('搜索报价单号/询价单号/供应商')" :width="260" />
				</cl-row>

				<cl-row>
					<cl-table ref="Table">
						<!-- 分解成本4-人工：按行展示 name + cost -->
						<template #column-costLaborItems="{ scope }">
							<div class="labor-col">
								<div
									v-for="(item, index) in normalizeLaborItems(
										scope.row.costLaborItems
									)"
									:key="index"
								>
									<span>{{ item.name }}</span>
									<span v-if="item.cost !== undefined && item.cost !== null">
										：{{ item.cost }}
									</span>
								</div>
							</div>
						</template>

						<!-- 备件类报价明细：每个物料 + 多供应商 -->
						<template #column-spareQuoteItems="{ scope }">
							<div v-if="scope.row.inquiryType === 4" class="spare-quote-col">
								<div
									v-for="(m, mIndex) in normalizespareQuoteItems(
										scope.row.spareQuoteItems
									)"
									:key="mIndex"
									class="mb-1"
								>
									<div class="font-bold">
										{{ $t('物料') }}{{ mIndex + 1 }}：
										{{ m.materialName || '-' }}
										<span v-if="m.spec">（{{ m.spec }}）</span>
									</div>
									<div
										v-for="(s, sIndex) in m.suppliers"
										:key="sIndex"
										class="ml-2 text-sm"
									>
										<div>
											<span class="label">{{ $t('供应商') }}：</span>
											<span class="value">{{ s.supplier || '-' }}</span>
										</div>
										<div>
											<span class="label">{{ $t('未税单价') }}：</span>
											<span class="value">{{
												s.unitPriceExclTax ?? '-'
											}}</span>
											<span class="label ml-2">{{ $t('税率(%)') }}：</span>
											<span class="value">{{ s.taxRate ?? '-' }}</span>
											<span class="label ml-2">{{ $t('含税单价') }}：</span>
											<span class="value">{{
												s.unitPriceInclTax ?? '-'
											}}</span>
											<span class="label ml-2">{{ $t('含税总价') }}：</span>
											<span class="value">{{
												s.totalPriceInclTax ?? '-'
											}}</span>
										</div>
										<div>
											<span class="label">{{ $t('运费') }}：</span>
											<span class="value">{{ s.freight ?? '-' }}</span>
											<span class="label ml-2">{{ $t('货期') }}：</span>
											<span class="value">{{ s.delivery || '-' }}</span>
										</div>
										<div v-if="s.remark">
											<span class="label">{{ $t('备注') }}：</span>
											<span class="value">{{ s.remark }}</span>
										</div>
									</div>
								</div>
							</div>
							<div v-else>-</div>
						</template>
					</cl-table>
				</cl-row>

				<cl-row>
					<cl-flex1 />
					<cl-pagination />
				</cl-row>

				<cl-upsert ref="Upsert">
					<template #slot-inquiryInfo="{ scope }">
						<!-- 右侧报价弹窗中展示完整的询价信息，便于供应链查看 -->
						<div class="quote-inquiry-info">
							<!-- 基本信息（备件类不展示项目地点 / 地址 / 工期） -->
							<el-descriptions border :column="2" class="mb-3">
								<el-descriptions-item :label="$t('询价单号')">
									{{
										getInquiryField(currentInquiryInfo || scope, 'inquiryNo') ||
										'-'
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('类型')">
									{{
										(options.inquiryType.find(
											e =>
												e.value ===
												(currentInquiryInfo || scope).inquiryType
										)?.label as string) || '-'
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('客户')">
									{{
										getInquiryField(currentInquiryInfo || scope, 'customer') ||
										'-'
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('项目名称')">
									{{
										getInquiryField(
											currentInquiryInfo || scope,
											'projectName'
										) || '-'
									}}
								</el-descriptions-item>
								<el-descriptions-item
									v-if="(currentInquiryInfo || scope).inquiryType !== 4"
									:label="$t('项目地点（省市县）')"
								>
									{{
										formatLocation(
											getInquiryField(
												currentInquiryInfo || scope,
												'projectLocation'
											)
										)
									}}
								</el-descriptions-item>
								<el-descriptions-item
									v-if="(currentInquiryInfo || scope).inquiryType !== 4"
									:label="$t('具体地址')"
								>
									{{
										getInquiryField(currentInquiryInfo || scope, 'address') ||
										'-'
									}}
								</el-descriptions-item>
								<el-descriptions-item
									v-if="(currentInquiryInfo || scope).inquiryType !== 4"
									:label="$t('工期')"
								>
									{{
										formatRange(
											getInquiryField(
												currentInquiryInfo || scope,
												'projectStartDate'
											),
											getInquiryField(
												currentInquiryInfo || scope,
												'projectEndDate'
											)
										)
									}}
								</el-descriptions-item>
							</el-descriptions>

							<!-- 通用要求（备件类报价时整体不展示） -->
							<el-descriptions
								v-if="(currentInquiryInfo || scope).inquiryType !== 4"
								border
								:column="2"
								class="mb-3"
							>
								<el-descriptions-item :label="$t('设备品牌')">
									{{
										getInquiryField(
											currentInquiryInfo || scope,
											'equipmentBrand'
										) || '-'
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('设备型号及数量')">
									{{
										getInquiryField(
											currentInquiryInfo || scope,
											'equipmentModelQty'
										) || '-'
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('吊装需求')">
									{{
										formatHoistingRequirement(
											getInquiryField(
												currentInquiryInfo || scope,
												'hoistingRequirement'
											)
										)
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('交付标准')">
									{{
										getInquiryField(
											currentInquiryInfo || scope,
											'deliverStandard'
										) || '-'
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('售后要求')">
									{{
										getInquiryField(
											currentInquiryInfo || scope,
											'afterSalesRequirement'
										) || '-'
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('备件明细')">
									{{
										getInquiryField(
											currentInquiryInfo || scope,
											'sparePartsDetail'
										) || '-'
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('工具要求')">
									{{
										getInquiryField(
											currentInquiryInfo || scope,
											'toolRequirement'
										) || '-'
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('软件要求')">
									{{
										getInquiryField(
											currentInquiryInfo || scope,
											'softwareRequirement'
										) || '-'
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('能力需求')">
									{{
										getInquiryField(
											currentInquiryInfo || scope,
											'capabilityRequirement'
										) || '-'
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('技术工种及人数')">
									{{
										getInquiryField(
											currentInquiryInfo || scope,
											'workerTypeAndCount'
										) || '-'
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('具体人员（内部人员/委外）')">
									{{
										getInquiryField(
											currentInquiryInfo || scope,
											'specificPersonnel'
										) ||
										getInquiryField(
											currentInquiryInfo || scope,
											'personnelDetail'
										) ||
										'-'
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('初步施工方案')" :span="2">
									{{
										getInquiryField(
											currentInquiryInfo || scope,
											'initialConstructionPlan'
										) || '-'
									}}
								</el-descriptions-item>
							</el-descriptions>

							<!-- 各类型专属信息 -->
							<!-- 加工类 -->
							<el-descriptions
								v-if="(currentInquiryInfo || scope).inquiryType === 0"
								border
								:column="2"
								class="mb-3"
							>
								<el-descriptions-item :label="$t('加工要求')" :span="2">
									{{
										getInquiryField(
											currentInquiryInfo || scope,
											'processingRequirement'
										) || '-'
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('图纸附件')" :span="2">
									<div
										v-if="
											normalizeFiles(
												getInquiryField(
													currentInquiryInfo || scope,
													'drawingAttachments'
												)
											).length
										"
									>
										<el-link
											v-for="(url, index) in normalizeFiles(
												getInquiryField(
													currentInquiryInfo || scope,
													'drawingAttachments'
												)
											)"
											:key="index"
											:href="url"
											type="primary"
											target="_blank"
											class="mr-2"
										>
											{{ $t('查看附件') }}{{ index + 1 }}
										</el-link>
									</div>
									<span v-else>-</span>
								</el-descriptions-item>
							</el-descriptions>

							<!-- 维修类 -->
							<el-descriptions
								v-if="(currentInquiryInfo || scope).inquiryType === 1"
								border
								:column="2"
								class="mb-3"
							>
								<el-descriptions-item :label="$t('维修类型')">
									{{
										getInquiryField(
											currentInquiryInfo || scope,
											'repairType'
										) || '-'
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('现场环境')">
									{{
										formatSiteEnv(
											getInquiryField(
												currentInquiryInfo || scope,
												'siteEnvironment'
											)
										)
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('明确调试归属')">
									{{
										formatDebugOwnership(
											getInquiryField(
												currentInquiryInfo || scope,
												'debugOwnership'
											)
										)
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('故障描述')" :span="2">
									{{
										getInquiryField(
											currentInquiryInfo || scope,
											'faultDescription'
										) || '-'
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('现场附件')" :span="2">
									<div
										v-if="
											normalizeFiles(
												getInquiryField(
													currentInquiryInfo || scope,
													'siteAttachments'
												)
											).length
										"
									>
										<el-link
											v-for="(url, index) in normalizeFiles(
												getInquiryField(
													currentInquiryInfo || scope,
													'siteAttachments'
												)
											)"
											:key="index"
											:href="url"
											type="primary"
											target="_blank"
											class="mr-2"
										>
											{{ $t('查看现场') }}{{ index + 1 }}
										</el-link>
									</div>
									<span v-else>-</span>
								</el-descriptions-item>
							</el-descriptions>

							<!-- 保养类 -->
							<el-descriptions
								v-if="(currentInquiryInfo || scope).inquiryType === 2"
								border
								:column="2"
								class="mb-3"
							>
								<el-descriptions-item :label="$t('现场环境')">
									{{
										formatSiteEnv(
											getInquiryField(
												currentInquiryInfo || scope,
												'siteEnvironment'
											)
										)
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('保养类型')">
									{{
										formatMaintenanceType(
											getInquiryField(currentInquiryInfo || scope, [
												'maintenanceType',
												'maintenanceContent'
											])
										)
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('保养范围')" :span="2">
									{{
										getInquiryField(currentInquiryInfo || scope, [
											'maintenanceScope',
											'maintenanceContent'
										]) || '-'
									}}
								</el-descriptions-item>
							</el-descriptions>

							<!-- 项目类 -->
							<el-descriptions
								v-if="(currentInquiryInfo || scope).inquiryType === 3"
								border
								:column="2"
								class="mb-3"
							>
								<el-descriptions-item :label="$t('施工类型')">
									{{
										formatConstructionType(
											getInquiryField(currentInquiryInfo || scope, [
												'projectConstructType',
												'constructionType'
											])
										)
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('施工内容')" :span="2">
									{{
										getInquiryField(currentInquiryInfo || scope, [
											'projectConstructContent',
											'constructionContent'
										]) || '-'
									}}
								</el-descriptions-item>
								<el-descriptions-item :label="$t('现场环境说明')" :span="2">
									{{
										getInquiryField(currentInquiryInfo || scope, [
											'projectSiteEnvDesc',
											'projectSiteEnvironment'
										]) || '-'
									}}
								</el-descriptions-item>
								<el-descriptions-item
									:label="$t('施工内容附件（客户技术协议）')"
									:span="2"
								>
									<div
										v-if="
											normalizeFiles(
												getInquiryField(currentInquiryInfo || scope, [
													'projectConstructAttachments',
													'constructionContentAttachments'
												])
											).length
										"
									>
										<el-link
											v-for="(url, index) in normalizeFiles(
												getInquiryField(currentInquiryInfo || scope, [
													'projectConstructAttachments',
													'constructionContentAttachments'
												])
											)"
											:key="index"
											:href="url"
											type="primary"
											target="_blank"
											class="mr-2"
										>
											{{ $t('查看技术协议') }}{{ index + 1 }}
										</el-link>
									</div>
									<span v-else>-</span>
								</el-descriptions-item>
								<el-descriptions-item
									:label="$t('现场环境附件（图片/视频）')"
									:span="2"
								>
									<div
										v-if="
											normalizeFiles(
												getInquiryField(currentInquiryInfo || scope, [
													'projectSiteEnvAttachments',
													'projectSiteAttachments'
												])
											).length
										"
									>
										<el-link
											v-for="(url, index) in normalizeFiles(
												getInquiryField(currentInquiryInfo || scope, [
													'projectSiteEnvAttachments',
													'projectSiteAttachments'
												])
											)"
											:key="index"
											:href="url"
											type="primary"
											target="_blank"
											class="mr-2"
										>
											{{ $t('查看现场环境') }}{{ index + 1 }}
										</el-link>
									</div>
									<span v-else>-</span>
								</el-descriptions-item>
							</el-descriptions>

							<!-- 备件类：物料列表 -->
							<el-descriptions
								v-if="(currentInquiryInfo || scope).inquiryType === 4"
								border
								:column="1"
								class="mb-3"
							>
								<el-descriptions-item :label="$t('物料列表')">
									<el-table
										:data="normalizeSpareItems(currentInquiryInfo || scope)"
										size="small"
										border
										style="width: 100%"
									>
										<el-table-column
											:label="$t('物料名称')"
											prop="name"
											min-width="140"
										/>
										<el-table-column
											:label="$t('物料大类')"
											prop="categoryBig"
											min-width="120"
										/>
										<el-table-column
											:label="$t('物料小类')"
											prop="categorySmall"
											min-width="140"
										/>
										<el-table-column
											:label="$t('规格型号')"
											prop="spec"
											min-width="120"
										/>
										<el-table-column
											:label="$t('数量')"
											prop="quantity"
											min-width="100"
										/>
										<el-table-column
											:label="$t('品牌')"
											prop="brand"
											min-width="120"
										/>
									</el-table>
								</el-descriptions-item>
							</el-descriptions>
						</div>
					</template>

					<!-- 保养类报价明细：多物料 × 多供应商 -->
					<template #slot-spareQuoteItems="{ scope }">
						<div class="spare-quote">
							<el-button
								type="success"
								size="small"
								@click="addSpareMaterial(scope)"
								class="mb-2"
							>
								{{ $t('新增物料') }}
							</el-button>

							<div
								v-for="(m, mIndex) in scope.spareQuoteItems || []"
								:key="mIndex"
								class="spare-quote__material"
							>
								<el-card shadow="never" class="mb-2">
									<template #header>
										<div class="spare-quote__material-header">
											<span>{{ $t('物料') }} {{ mIndex + 1 }}</span>
											<el-button
												type="danger"
												text
												size="small"
												@click="removeSpareMaterial(scope, mIndex)"
											>
												{{ $t('删除物料') }}
											</el-button>
										</div>
									</template>

									<el-form :model="m" label-width="80px" size="small">
										<el-row :gutter="10">
											<el-col :span="12">
												<el-form-item :label="$t('物料名称')" required>
													<el-input v-model="m.materialName" clearable />
												</el-form-item>
											</el-col>
											<el-col :span="12">
												<el-form-item :label="$t('规格型号')" required>
													<el-input v-model="m.spec" clearable />
												</el-form-item>
											</el-col>
										</el-row>
									</el-form>

									<el-table
										:data="Array.isArray(m.suppliers) ? m.suppliers : []"
										size="small"
										border
										class="mt-1"
									>
										<el-table-column :label="$t('供应商')" min-width="160">
											<template #default="{ row }">
												<el-input v-model="row.supplier" clearable />
											</template>
										</el-table-column>
										<el-table-column :label="$t('未税单价')" min-width="120">
											<template #default="{ row }">
												<el-input-number
													v-model="row.unitPriceExclTax"
													:min="0"
													:controls="false"
												/>
											</template>
										</el-table-column>
										<el-table-column :label="$t('税率 (%)')" min-width="100">
											<template #default="{ row }">
												<el-input-number
													v-model="row.taxRate"
													:min="0"
													:controls="false"
												/>
											</template>
										</el-table-column>
										<el-table-column :label="$t('含税单价')" min-width="120">
											<template #default="{ row }">
												<el-input-number
													v-model="row.unitPriceInclTax"
													:min="0"
													:controls="false"
												/>
											</template>
										</el-table-column>
										<el-table-column :label="$t('含税总价')" min-width="120">
											<template #default="{ row }">
												<el-input-number
													v-model="row.totalPriceInclTax"
													:min="0"
													:controls="false"
												/>
											</template>
										</el-table-column>
										<el-table-column :label="$t('运费')" min-width="100">
											<template #default="{ row }">
												<el-input-number
													v-model="row.freight"
													:min="0"
													:controls="false"
												/>
											</template>
										</el-table-column>
										<el-table-column :label="$t('货期')" min-width="120">
											<template #default="{ row }">
												<el-input v-model="row.delivery" clearable />
											</template>
										</el-table-column>
										<el-table-column :label="$t('图片')" min-width="140">
											<template #default="{ row }">
												<cl-upload
													v-model="row.images"
													:type="'file'"
													:multiple="true"
													:accept="'image/*'"
													:text="$t('上传图片')"
												/>
											</template>
										</el-table-column>
										<el-table-column :label="$t('备注')" min-width="160">
											<template #default="{ row }">
												<el-input v-model="row.remark" clearable />
											</template>
										</el-table-column>
										<el-table-column
											:label="$t('操作')"
											width="100"
											align="center"
										>
											<template #default="{ $index }">
												<el-button
													type="danger"
													text
													size="small"
													@click="
														removeSpareSupplier(scope, mIndex, $index)
													"
												>
													{{ $t('删除') }}
												</el-button>
											</template>
										</el-table-column>
									</el-table>

									<div class="mt-2">
										<el-button
											type="primary"
											size="small"
											@click="addSpareSupplier(scope, mIndex)"
										>
											{{ $t('新增供应商报价') }}
										</el-button>
									</div>
								</el-card>
							</div>
						</div>
					</template>

					<template #slot-laborItems="{ scope }">
						<div class="labor-items">
							<el-table
								:data="
									Array.isArray(scope.costLaborItems) ? scope.costLaborItems : []
								"
								size="small"
								border
							>
								<el-table-column :label="$t('项目')" min-width="220">
									<template #default="{ row }">
										<el-input v-model="row.name" clearable />
									</template>
								</el-table-column>
								<el-table-column :label="$t('金额')" width="160">
									<template #default="{ row }">
										<el-input-number
											v-model="row.cost"
											:min="0"
											:controls="false"
										/>
									</template>
								</el-table-column>
								<el-table-column :label="$t('操作')" width="100" align="center">
									<template #default="{ $index }">
										<el-button
											size="small"
											type="danger"
											text
											@click="
												() => {
													(scope.costLaborItems || []).splice($index, 1);
												}
											"
										>
											{{ $t('删除') }}
										</el-button>
									</template>
								</el-table-column>
							</el-table>

							<div class="mt-2">
								<el-button
									size="small"
									type="success"
									plain
									@click="
										() => {
											if (!Array.isArray(scope.costLaborItems)) {
												scope.costLaborItems = [];
											}
											scope.costLaborItems.push({ name: '', cost: 0 });
										}
									"
								>
									{{ $t('添加一条') }}
								</el-button>
							</div>
						</div>
					</template>
				</cl-upsert>
			</cl-crud>
		</div>
	</div>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'company-quote'
});

import { useCrud, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { useI18n } from 'vue-i18n';
import { reactive, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { TagProps } from 'element-plus';

import Supple_agent from './supple_agent.vue';

const { service } = useCool();
const { t } = useI18n();

type InquiryTypeOption = {
	label: string;
	value: number;
	type: TagProps['type'];
};

// 选项（与询价页面保持一致）
const options = reactive<{ inquiryType: InquiryTypeOption[] }>({
	inquiryType: [
		{ label: t('项目类'), value: 3, type: 'info' },
		{ label: t('机械保养类'), value: 2, type: 'warning' },
		{ label: t('机械维修类'), value: 1, type: 'success' },
		{ label: t('机械加工类'), value: 0, type: 'danger' },
		{ label: t('备件类'), value: 4, type: 'primary' }
	]
});

// 待报价询价列表（供应链侧）
const inquiryLoading = ref(false);
const inquiryList = ref<any[]>([]);
const inquiryTotal = ref(0);
// 用于高亮选中项，可以是 inquiryNo 或 id
const inquirySelectedKey = ref<string | number | null>(null);
// 当前在报价弹窗中展示的询价详情
const currentInquiryInfo = ref<any | null>(null);

const inquiryParams = reactive({
	page: 1,
	size: 10,
	keyWord: '',
	inquiryType: undefined as number | undefined,
	quoteStatus: 0
});

async function refreshInquiryPage(params?: Partial<typeof inquiryParams>) {
	Object.assign(inquiryParams, params || {});

	inquiryLoading.value = true;

	await service.company.quote
		.inquiryPage({
			...inquiryParams,
			keyWord: inquiryParams.keyWord || undefined,
			inquiryType: inquiryParams.inquiryType ?? undefined,
			quoteStatus: 0
		})
		.then((res: any) => {
			// 后端返回的是 a_xxx 前缀字段，这里统一映射成前端使用的字段名
			inquiryList.value = (res.list || []).map((e: any) => {
				return {
					// 标准化字段（供界面和后续逻辑使用）
					id: e.a_id,
					inquiryNo: e.a_inquiryNo,
					inquiryType: e.a_inquiryType,
					customer: e.a_customer,
					projectName: e.a_projectName,
					projectStartDate: e.a_projectStartDate,
					projectEndDate: e.a_projectEndDate,
					// 保留原始字段，防止后续有需要
					...e
				};
			});
			inquiryTotal.value = res.pagination?.total || 0;
			inquiryParams.page = res.pagination?.page || inquiryParams.page;
			inquiryParams.size = res.pagination?.size || inquiryParams.size;
		})
		.catch((err: any) => {
			ElMessage.error(err.message);
		});

	inquiryLoading.value = false;
}

function formatRange(start?: any, end?: any) {
	const s = start ? String(start).slice(0, 10) : '';
	const e = end ? String(end).slice(0, 10) : '';
	return s || e ? `${s || '-'} ~ ${e || '-'}` : '-';
}

function formatLocation(v: any) {
	if (Array.isArray(v)) return v.filter(Boolean).join('');
	return v || '-';
}

function getInquiryField(info: any, key: string | string[]) {
	if (!info) return undefined;

	// 如果是报价实体且包含嵌套的 inquiry，则优先从 inquiry 上读取字段
	if (info.inquiry) {
		info = info.inquiry;
	}

	const keys = Array.isArray(key) ? key : [key];

	for (const k of keys) {
		const direct = info[k];
		if (direct !== undefined && direct !== null) {
			return direct;
		}

		const alias = info[`a_${k}`];
		if (alias !== undefined && alias !== null) {
			return alias;
		}
	}

	return undefined;
}

function formatSiteEnv(v: any) {
	const map: Record<number, string> = {
		0: t('本体落地装（正装）'),
		1: t('倒装'),
		2: t('高台'),
		3: t('不入场')
	};
	return typeof v === 'number' ? (map[v] ?? v) : (v ?? '-');
}

function formatDebugOwnership(v: any) {
	const map: Record<number, string> = {
		0: t('不需要'),
		1: t('科海'),
		2: t('客户')
	};
	return typeof v === 'number' ? (map[v] ?? v) : (v ?? '-');
}

function formatMaintenanceType(v: any) {
	const map: Record<number, string> = {
		0: t('基础'),
		1: t('高级')
	};
	return typeof v === 'number' ? (map[v] ?? v) : (v ?? '-');
}

function formatConstructionType(v: any) {
	const map: Record<number, string> = {
		0: t('工作站搬迁'),
		1: t('工作站改造'),
		2: t('工作站恢复功能'),
		3: t('工作站翻新'),
		4: t('新建工作站')
	};
	return typeof v === 'number' ? (map[v] ?? v) : (v ?? '-');
}

function formatHoistingRequirement(v: any) {
	const map: Record<number, string> = {
		0: t('无'),
		1: t('吊装机'),
		2: t('龙门架'),
		3: t('现场建筑'),
		4: t('其他')
	};
	return typeof v === 'number' ? (map[v] ?? v) : (v ?? '-');
}

function normalizeSpareItems(info: any): Array<any> {
	const raw = getInquiryField(info, 'spareItems');
	if (!raw) return [];
	let list = raw;
	if (typeof raw === 'string') {
		try {
			const parsed = JSON.parse(raw);
			list = parsed;
		} catch {
			return [];
		}
	}
	if (!Array.isArray(list)) return [];
	return list.map((e: any) => {
		return {
			name: e?.name ?? '',
			categoryBig: e?.categoryBig ?? e?.bigCategory ?? e?.category ?? '',
			categorySmall: e?.categorySmall ?? e?.subCategory ?? '',
			spec: e?.spec ?? '',
			quantity: e?.quantity ?? '',
			brand: e?.brand ?? e?.remark ?? ''
		};
	});
}

function normalizeFiles(val: any): string[] {
	if (!val) return [];

	let list = val;

	if (typeof val === 'string') {
		// 尝试解析为 JSON 数组；如果失败则认为是单个 URL
		try {
			const parsed = JSON.parse(val);
			list = parsed;
		} catch {
			return [val];
		}
	}

	if (Array.isArray(list)) {
		return list
			.map(e => {
				if (!e) return '';
				// 既兼容纯字符串 URL，也兼容 { url: '' } 结构
				return typeof e === 'string' ? e : e.url || '';
			})
			.filter(Boolean);
	}

	// 兼容 { url: '' } 单对象
	if (typeof list === 'object' && (list as any).url) {
		return [(list as any).url];
	}

	return [];
}

function ensureSpareItems(form: any) {
	if (!Array.isArray(form.spareQuoteItems)) {
		form.spareQuoteItems = [];
	}
}

function addSpareMaterial(form: any) {
	if (!form) return;
	ensureSpareItems(form);
	form.spareQuoteItems.push({
		materialName: undefined,
		spec: undefined,
		suppliers: []
	});
}

function removeSpareMaterial(form: any, materialIndex: number) {
	if (!form) return;
	ensureSpareItems(form);
	if (materialIndex >= 0 && materialIndex < form.spareQuoteItems.length) {
		form.spareQuoteItems.splice(materialIndex, 1);
	}
}

function addSpareSupplier(form: any, materialIndex: number) {
	if (!form) return;
	ensureSpareItems(form);
	const material = form.spareQuoteItems[materialIndex];
	if (!material) return;
	if (!Array.isArray(material.suppliers)) {
		material.suppliers = [];
	}
	material.suppliers.push({
		supplier: undefined,
		unitPriceExclTax: undefined,
		taxRate: undefined,
		unitPriceInclTax: undefined,
		totalPriceInclTax: undefined,
		freight: undefined,
		delivery: undefined,
		images: [],
		remark: ''
	});
}

function removeSpareSupplier(form: any, materialIndex: number, supplierIndex: number) {
	if (!form) return;
	ensureSpareItems(form);
	const material = form.spareQuoteItems[materialIndex];
	if (!material || !Array.isArray(material.suppliers)) return;
	if (supplierIndex >= 0 && supplierIndex < material.suppliers.length) {
		material.suppliers.splice(supplierIndex, 1);
	}
}

function normalizespareQuoteItems(val: any): Array<any> {
	if (!val) return [];
	let list = val;
	if (typeof val === 'string') {
		try {
			const parsed = JSON.parse(val);
			list = parsed;
		} catch {
			return [];
		}
	}
	if (!Array.isArray(list)) return [];

	return list.map((m: any) => {
		const suppliers = Array.isArray(m?.suppliers) ? m.suppliers : [];
		return {
			materialName: m?.materialName ?? '',
			spec: m?.spec ?? '',
			suppliers: suppliers.map((s: any) => ({
				supplier: s?.supplier ?? '',
				unitPriceExclTax: s?.unitPriceExclTax,
				taxRate: s?.taxRate,
				unitPriceInclTax: s?.unitPriceInclTax,
				totalPriceInclTax: s?.totalPriceInclTax,
				freight: s?.freight,
				delivery: s?.delivery ?? '',
				images: s?.images ?? [],
				remark: s?.remark ?? ''
			}))
		};
	});
}

function normalizeLaborItems(val: any): Array<{ name: string; cost?: any }> {
	if (!val) return [];

	let list = val;

	if (typeof val === 'string') {
		try {
			const parsed = JSON.parse(val);
			list = parsed;
		} catch {
			return [];
		}
	}

	if (!Array.isArray(list)) return [];

	return list.map((e: any) => {
		return {
			name: e.name ?? '',
			cost: e.cost
		};
	});
}

function openAddQuote(inquiry: Eps.CompanyInquiryEntity) {
	const inquiryId = inquiry.id;
	const inquiryNo = inquiry.inquiryNo;

	// 至少需要 id 或 单号 其一
	if (!inquiryId && !inquiryNo) {
		ElMessage.error(t('请选择有效的询价'));
		return;
	}

	// 记录当前询价详情，供弹窗里完整展示
	currentInquiryInfo.value = inquiry;

	// 用 id 优先，否则用单号做选中标识
	inquirySelectedKey.value = inquiryId || inquiryNo || null;

	Crud.value?.rowAppend({
		inquiryId: inquiryId || undefined,
		inquiryType: inquiry.inquiryType,
		inquiryNo: inquiryNo,
		inquiryCustomer: (inquiry as any).customer ?? (inquiry as any).inquiryCustomer,
		inquiryProjectName: (inquiry as any).projectName ?? (inquiry as any).inquiryProjectName,
		inquiryProjectStartDate:
			(inquiry as any).projectStartDate ?? (inquiry as any).inquiryProjectStartDate,
		inquiryProjectEndDate:
			(inquiry as any).projectEndDate ?? (inquiry as any).inquiryProjectEndDate
	});
}

const Upsert = useUpsert<Eps.CompanyQuoteEntity>({
	dialog: {
		width: '1000px'
	},
	props: {
		labelWidth: '120px'
	},
	items: [
		{
			component: { name: 'slot-inquiryInfo' }
		},
		// 隐藏字段：用于展示询价摘要（不提交）
		{ prop: 'inquiryNo', hidden: true, component: { name: 'el-input' } },
		{ prop: 'inquiryCustomer', hidden: true, component: { name: 'el-input' } },
		{ prop: 'inquiryProjectName', hidden: true, component: { name: 'el-input' } },
		{ prop: 'inquiryProjectStartDate', hidden: true, component: { name: 'el-input' } },
		{ prop: 'inquiryProjectEndDate', hidden: true, component: { name: 'el-input' } },

		() => {
			return () => {
				return {
					label: t('报价单号'),
					prop: 'quoteNo',
					span: 12,
					hidden: Upsert.value?.mode == 'add',
					component: {
						name: 'el-input',
						props: {
							disabled: true,
							placeholder: t('保存后自动生成')
						}
					}
				};
			};
		},
		{
			label: t('询价ID'),
			prop: 'inquiryId',
			component: {
				name: 'el-input-number',
				props: {
					disabled: true,
					controls: false,
					min: 1
				}
			},
			hidden: true,
			required: false
		},
		{
			label: t('询价类型'),
			prop: 'inquiryType',
			component: {
				name: 'el-radio-group',
				options: options.inquiryType,
				props: { disabled: true }
			},
			hidden: true,
			required: false
		},

		// 备件类专属：多物料 × 多供应商报价明细
		{
			label: t('备件类报价明细'),
			prop: 'spareQuoteItems',
			span: 24,
			component: { name: 'slot-spareQuoteItems' },
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType !== 4
		},

		{
			label: t('分解成本1-备件'),
			prop: 'costSpareParts',
			span: 12,
			component: { name: 'el-input', props: { clearable: true } },
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType === 4
		},
		{
			label: t('分解成本2-工具'),
			prop: 'costTools',
			span: 12,
			component: { name: 'el-input', props: { clearable: true } },
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType === 4
		},
		{
			label: t('分解成本3-软件'),
			prop: 'costSoftware',
			span: 12,
			component: { name: 'el-input', props: { clearable: true } },
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType === 4
		},
		{
			label: t('分解成本4-人工（可逐条添加）'),
			prop: 'costLaborItems',
			span: 24,
			component: { name: 'slot-laborItems' },
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType === 4
		},
		{
			label: t('分解成本5-交通'),
			prop: 'costTraffic',
			span: 12,
			component: { name: 'el-input', props: { clearable: true } },
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType === 4
		},
		{
			label: t('分解成本6-售后'),
			prop: 'costAfterSales',
			span: 12,
			component: { name: 'el-input', props: { clearable: true } },
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType === 4
		},
		{
			label: t('分解成本7-培训报告'),
			prop: 'costTrainingReport',
			span: 12,
			component: { name: 'el-input', props: { clearable: true } },
			required: true,
			hidden: ({ scope }: any) => scope.inquiryType === 4
		},
		{
			label: t('总成本'),
			prop: 'totalCost',
			span: 12,
			component: {
				name: 'el-input-number',
				props: {
					min: 0,
					controls: false
				}
			},
			required: true
		},
		{
			label: t('供应商'),
			prop: 'supplier',
			span: 12,
			required: true,
			component: { name: 'el-input', props: { clearable: true } },
			hidden: ({ scope }: any) => scope.inquiryType === 4
		},
		{
			label: t('未税报价'),
			prop: 'priceExclTax',
			span: 12,
			required: true,
			component: { name: 'el-input-number', props: { min: 0, controls: false } }
		},
		{
			label: t('税率（%）'),
			prop: 'taxRate',
			span: 12,
			required: true,
			component: { name: 'el-input-number', props: { min: 0, controls: false } },
			hidden: ({ scope }: any) => scope.inquiryType === 4
		},
		{
			label: t('含税报价'),
			prop: 'priceInclTax',
			span: 12,
			required: true,
			component: { name: 'el-input-number', props: { min: 0, controls: false } }
		}
	],

	onOpened(data) {
		// 编辑已有报价时，优先使用后端返回的嵌套 inquiry 信息
		if (Upsert.value?.mode === 'update') {
			const q: any = data || {};
			const inquiry = q.inquiry || {};

			// 直接用嵌套的 inquiry 作为展示源，字段名本身就与询价页面一致
			if (inquiry && inquiry.id) {
				// 方便前端调试查看后端返回的嵌套询价信息
				console.log('[company-quote] nested inquiry from quote.info:', inquiry);
				currentInquiryInfo.value = inquiry;
			} else {
				// 兜底：仍然用当前报价上的字段做一次映射
				currentInquiryInfo.value = {
					...q,
					inquiryNo: q.inquiryNo,
					inquiryType: q.inquiryType,
					customer: q.customer ?? q.inquiryCustomer,
					projectName: q.projectName ?? q.inquiryProjectName,
					projectStartDate: q.projectStartDate ?? q.inquiryProjectStartDate,
					projectEndDate: q.projectEndDate ?? q.inquiryProjectEndDate
				};
			}
		}

		const v = (data as any).costLaborItems;

		// 后端可能返回 string/json/object，这里统一成数组，保证可增删
		if (typeof v === 'string') {
			try {
				const parsed = JSON.parse(v);
				(data as any).costLaborItems = Array.isArray(parsed) ? parsed : [];
			} catch {
				(data as any).costLaborItems = [];
			}
		} else if (Array.isArray(v)) {
			(data as any).costLaborItems = v;
		} else {
			(data as any).costLaborItems = [];
		}

		// 保养类：初始化 spareQuoteItems 结构
		const mq = (data as any).spareQuoteItems;
		if (mq) {
			if (typeof mq === 'string') {
				try {
					const parsed = JSON.parse(mq);
					(data as any).spareQuoteItems = Array.isArray(parsed) ? parsed : [];
				} catch {
					(data as any).spareQuoteItems = [];
				}
			} else if (Array.isArray(mq)) {
				(data as any).spareQuoteItems = mq;
			} else {
				(data as any).spareQuoteItems = [];
			}
		}
	},

	onSubmit(data, { close, done }) {
		// 兜底：确保提交时至少带上 inquiryId 或 inquiryNo 其一

		// 1. 补 inquiryId：优先用表单里的，其次用选中行的 id（数字）
		if (
			!data.inquiryId &&
			inquirySelectedKey.value &&
			typeof inquirySelectedKey.value === 'number'
		) {
			data.inquiryId = inquirySelectedKey.value;
		}

		// 1.1 若仍缺少 inquiryId / inquiryNo，则从嵌套 inquiry 中兜底（编辑场景）
		const q: any = data;
		const iq: any = q.inquiry;
		if (iq) {
			if (!data.inquiryId && iq.id) {
				data.inquiryId = iq.id;
			}
			if (!data.inquiryNo && iq.inquiryNo) {
				data.inquiryNo = iq.inquiryNo;
			}
		}

		// 2. 补 inquiryNo：若表单没有，则从待报价列表里根据 key 反查
		if (!data.inquiryNo) {
			const found = inquiryList.value.find((e: any) => {
				const key = e.id || e.inquiryNo || e.inquiryId;
				return key === inquirySelectedKey.value;
			});
			if (found?.inquiryNo) {
				data.inquiryNo = found.inquiryNo;
			}
		}

		if (!data.inquiryId && !data.inquiryNo) {
			ElMessage.error(t('缺少有效的询价信息'));
			done();
			return;
		}

		if (data.inquiryId) {
			data.inquiryId = Number(data.inquiryId);
		}

		// 备件类：校验 spareQuoteItems 至少有 1 条物料，
		// 且每个物料下至少 1 个供应商，除备注与图片外字段均为必填
		// NOTE: 新增报价时表单可能未携带 inquiryType，使用当前选中询价作为兜底
		const effectiveInquiryType = Number(
			(data as any).inquiryType ??
				(data as any).inquiry?.inquiryType ??
				currentInquiryInfo.value?.inquiryType
		);

		if (effectiveInquiryType === 4) {
			const items = (data as any).spareQuoteItems;
			if (!Array.isArray(items) || items.length === 0) {
				ElMessage.error(t('请至少填写一条备件物料报价'));
				done();
				return;
			}

			for (let i = 0; i < items.length; i++) {
				const m = items[i] || {};
				if (!m.materialName || !m.spec) {
					ElMessage.error(t('备件物料的名称和规格型号为必填项'));
					done();
					return;
				}
				if (!Array.isArray(m.suppliers) || m.suppliers.length === 0) {
					ElMessage.error(t('每个备件物料至少需要一条供应商报价'));
					done();
					return;
				}
				for (let j = 0; j < m.suppliers.length; j++) {
					const s = m.suppliers[j] || {};
					if (
						!s.supplier ||
						s.unitPriceExclTax === undefined ||
						s.taxRate === undefined ||
						s.unitPriceInclTax === undefined ||
						s.totalPriceInclTax === undefined ||
						s.freight === undefined ||
						!s.delivery
					) {
						ElMessage.error(t('备件类供应商报价中除备注和图片外均为必填项'));
						done();
						return;
					}
				}
			}
		}

		// 新增 / 编辑分别调用对应接口，保证更新时间等由后端正确维护
		const mode = Upsert.value?.mode;
		const req = mode === 'update' ? service.company.quote.update : service.company.quote.add;

		req.call(service.company.quote, data)
			.then(() => {
				ElMessage.success(t('保存成功'));
				refresh();
				refreshInquiryPage({ page: 1 });
				close();
			})
			.catch((err: any) => {
				ElMessage.error(err.message);
				done();
			});
	},

	onClose(action, done) {
		// 关闭弹窗时清空当前询价缓存，避免下次编辑时沿用旧数据
		currentInquiryInfo.value = null;
		done();
	}
});

// cl-table
const Table = useTable<Eps.CompanyQuoteEntity>({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: t('报价单号'), prop: 'quoteNo', minWidth: 160 },
		{ label: t('询价单号'), prop: 'inquiryNo', minWidth: 160 },
		{
			label: t('询价类型'),
			prop: 'inquiryType',
			minWidth: 120,
			dict: options.inquiryType
		},
		{ label: t('未税报价'), prop: 'priceExclTax', minWidth: 120 },
		{ label: t('含税报价'), prop: 'priceInclTax', minWidth: 120 },
		{ label: t('总成本'), prop: 'totalCost', minWidth: 120 },
		{
			label: t('创建时间'),
			prop: 'createTime',
			minWidth: 170,
			sortable: 'desc',
			component: { name: 'cl-date-text' }
		},
		{
			label: t('更新时间'),
			prop: 'updateTime',
			minWidth: 170,
			sortable: 'custom',
			component: { name: 'cl-date-text' }
		},
		{ type: 'op', buttons: ['edit', 'delete'], width: 170 }
	]
});

// cl-crud
const Crud = useCrud(
	{
		service: service.company.quote,
		onDelete(selection, { next }) {
			return next({ ids: selection.map((e: any) => e.id) }).then(() => {
				refreshInquiryPage({ page: 1 });
			});
		}
	},
	app => {
		app.refresh();
	}
);

// 刷新
function refresh(params?: any) {
	Crud.value?.refresh(params);
}

onMounted(() => {
	refreshInquiryPage({ page: 1 });
});
</script>

<style lang="scss" scoped>
.company-quote {
	display: flex;
	gap: 12px;
	height: 100%;
}

.company-quote__left {
	width: 360px;
	min-width: 320px;
	background-color: var(--el-bg-color);
	border-radius: 6px;
	border: 1px solid var(--el-border-color-lighter);
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.company-quote__left-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px;
	border-bottom: 1px solid var(--el-border-color-lighter);

	.title {
		font-weight: 600;
	}
}

.company-quote__left-filters {
	padding: 12px;
	display: grid;
	gap: 10px;
	border-bottom: 1px solid var(--el-border-color-lighter);
}

.company-quote__left-list {
	flex: 1;
	padding: 12px;
}

.company-quote__left-pagination {
	padding: 10px 12px;
	border-top: 1px solid var(--el-border-color-lighter);
	display: flex;
	justify-content: center;
}

.company-quote__right {
	flex: 1;
	min-width: 0;
}

.inquiry-item {
	border: 1px solid var(--el-border-color-lighter);
	border-radius: 10px;
	padding: 10px 12px;
	margin-bottom: 10px;
	cursor: pointer;
	background-color: var(--el-bg-color);

	&.is-active {
		border-color: var(--el-color-primary);
		box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
	}

	&__top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;

		.no {
			font-weight: 600;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			padding-right: 10px;
		}
	}

	&__row {
		display: flex;
		gap: 8px;
		font-size: 12px;
		margin-bottom: 6px;

		.label {
			color: var(--el-text-color-secondary);
			width: 42px;
			flex-shrink: 0;
		}

		.value {
			flex: 1;
			min-width: 0;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}
	}

	&__action {
		display: flex;
		justify-content: flex-end;
		margin-top: 8px;
	}
}
</style>
