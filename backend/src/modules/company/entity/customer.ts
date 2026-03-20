import { BaseEntity, transformerJson } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 公司目录-客户
 */
@Entity('company_customer')
export class CompanyCustomerEntity extends BaseEntity {
  // ===================== 客户基础信息（与表格字段一一对应） =====================

  @Index({ unique: true })
  @Column({ comment: '客户编号（系统自动生成）', length: 50 })
  customerNo: string;

  @Index()
  @Column({ comment: '客户名称', length: 200 })
  customerName: string;

  @Index()
  @Column({
    comment: '客户性质（终客户/集成商）',
    dict: ['终客户', '集成商'],
    type: 'tinyint',
    default: 0,
  })
  customerNature: number;

  @Index()
  @Column({ comment: '统一社会信用代码', length: 50, nullable: true })
  socialCreditCode: string;

  @Index()
  @Column({
    comment: '客户级别（核心客户/一般客户/潜在客户）',
    dict: ['核心客户', '一般客户', '潜在客户'],
    type: 'tinyint',
    default: 1,
  })
  level: number;

  @Index()
  @Column({
    comment:
      '管理状态（系统关联生成：背调中/初次接触/需求确认/合作中/合作结束/目前无需求/放弃）',
    dict: ['背调中', '初次接触', '需求确认', '合作中', '合作结束', '目前无需求', '放弃'],
    type: 'tinyint',
    default: 0,
  })
  manageStatus: number;

  @Index()
  @Column({
    comment: '拜访次数（系统关联生成，=拜访记录条数）',
    type: 'int',
    default: 0,
  })
  visitCount: number;

  @Index()
  @Column({
    comment: '成交状态（关联合同数量，系统关联生成：未成交/已成交/多次成交）',
    dict: ['未成交', '已成交', '多次成交'],
    type: 'tinyint',
    default: 0,
    nullable: true,
  })
  dealStatus: number;

  @Index()
  @Column({
    comment: '合同数量（系统关联生成）',
    type: 'int',
    default: 0,
    nullable: true,
  })
  contractCount: number;

  @Index()
  @Column({
    comment:
      '赢单状态（可改成最新成交状态，系统关联生成：未赢单/已赢单/多次赢单）',
    dict: ['未赢单', '已赢单', '多次赢单'],
    type: 'tinyint',
    default: 0,
    nullable: true,
  })
  winStatus: number;

  @Index()
  @Column({
    comment: '最近成交时间（系统关联生成）',
    type: 'datetime',
    nullable: true,
  })
  latestDealTime: Date;

  @Column({
    comment: '距上次合作时间（天，系统关联生成，关联合作起止时间）',
    type: 'int',
    default: 0,
  })
  daysSinceLastCooperation: number;

  @Column({
    comment: '合同订单总额（系统关联生成）',
    type: 'decimal',
    precision: 16,
    scale: 2,
    default: 0,
    nullable: true,
  })
  contractOrderTotalAmount: number;

  @Column({
    comment: '应收款余额（系统关联生成）',
    type: 'decimal',
    precision: 16,
    scale: 2,
    default: 0,
    nullable: true,
  })
  receivableBalance: number;

  @Column({
    comment: '退款总额（系统关联生成）',
    type: 'decimal',
    precision: 16,
    scale: 2,
    default: 0,
    nullable: true,
  })
  refundTotalAmount: number;

  @Column({
    comment: '开票总额（系统关联生成）',
    type: 'decimal',
    precision: 16,
    scale: 2,
    default: 0,
    nullable: true,
  })
  invoiceTotalAmount: number;

  @Column({
    comment: '询价单数量（系统关联生成）',
    type: 'int',
    default: 0,
    nullable: true,
  })
  inquiryCount: number;

  @Column({
    comment: '报价单数量（系统关联生成）',
    type: 'int',
    default: 0,
    nullable: true,
  })
  quoteCount: number;

  @Column({
    comment: '转换率（合同数/报价单数，系统关联生成）',
    type: 'decimal',
    precision: 8,
    scale: 4,
    default: 0,
    nullable: true,
  })
  contractConvertRate: number;
// ===================== 客户背调信息 =====================

@Column({
  comment: '来源（公司资源/自由开拓/客户介绍/电话咨询）',
  dict: ['公司资源', '自由开拓', '客户介绍', '电话咨询'],
  type: 'tinyint',
  default: 0,
})
backgroundSource: number;

@Column({ comment: '公司背景（简短介绍）', type: 'text' })
backgroundCompanyProfile: string;

@Column({ comment: '成立时间', type: 'date' })
backgroundEstablishDate: Date;

@Column({
  comment: '企业注册资金',
  type: 'decimal',
  precision: 16,
  scale: 2,
  nullable: true,
})
backgroundRegisteredCapital: number;

@Column({ comment: '企业性质', length: 100 })
backgroundEnterpriseType: string;

@Column({
  comment: '是否上市（0-否 1-是）',
  dict: ['否', '是'],
  type: 'tinyint',
  default: 0,
})
backgroundIsListed: number;

@Column({
  comment: '当年营业额',
  type: 'decimal',
  precision: 16,
  scale: 2,
  nullable: true,
})
backgroundTurnoverCurrent: number;

@Column({
  comment: '上一年营业额',
  type: 'decimal',
  precision: 16,
  scale: 2,
  nullable: true,
})
backgroundTurnoverLast: number;

@Column({
  comment: '上上年营业额',
  type: 'decimal',
  precision: 16,
  scale: 2,
  nullable: true,
})
backgroundTurnoverPrev: number;

@Column({ comment: '行业（必填，文本）', length: 100 })
backgroundIndustry: string;

@Column({ comment: '企业经营项目', type: 'text' })
backgroundBusinessItems: string;

@Column({ comment: '上级客户', length: 255, nullable: true })
backgroundSuperiorCustomer: string;

@Column({ comment: '下游客户', length: 255, nullable: true })
backgroundDownstreamCustomer: string;

@Column({ comment: '机器人工艺', type: 'text' })
backgroundRobotProcess: string;

@Column({ comment: '公司网址', length: 255, nullable: true })
backgroundWebsite: string;

@Column({ comment: '电话', length: 50 })
backgroundPhone: string;

@Column({ comment: '电子邮件', length: 100 })
backgroundEmail: string;

@Column({ comment: '备注', type: 'text', nullable: true })
backgroundRemark: string;

@Column({ comment: '国家', length: 50, default: '中国' })
backgroundCountry: string;

@Column({ comment: '省', length: 50 })
backgroundProvince: string;

@Column({ comment: '市', length: 50 })
backgroundCity: string;

@Column({ comment: '区', length: 50, nullable: true })
backgroundDistrict: string;

@Column({ comment: '详细地址', length: 255 })
backgroundAddressDetail: string;

// 负责人及协作人

@Index()
@Column({ comment: '负责人（文本，如姓名）', length: 50, nullable: true })
backgroundOwnerUserId: string;

@Column({ comment: '负责人所在部门', length: 50, default: '销售部' })
backgroundOwnerDept: string;

@Column({
  comment: '协作人列表（文本数组，如姓名列表）',
  type: 'json',
  nullable: true,
  transformer: transformerJson,
})
backgroundCollaboratorUserIds: string[];

// 系统自动生成信息

@Index()
@Column({ comment: '最后修改人（文本，如姓名）', length: 50, nullable: true })
backgroundLastModifyUserId: string;

// 创建人
@Column({ comment: '创建人（文本，如姓名）', length: 50, nullable: true })
createUserId: string;

@Index()
@Column({ comment: '上一次负责人（文本，如姓名）', length: 50, nullable: true })
backgroundPreviousOwnerUserId: string;

@Column({
  comment: '负责人变更时间',
  type: 'datetime',
  nullable: true,
})
backgroundOwnerChangeTime: Date;


  // ===================== 客户拜访信息 =====================

  @Column({
    comment: '最近跟进类型（电话拜访/微信拜访/钉钉拜访/网络平台/上门拜访）',
    dict: ['电话拜访', '微信拜访', '钉钉拜访', '网络平台', '上门拜访'],
    type: 'tinyint',
    default: 0,
  })
  lastFollowType: number;

  @Column({ comment: '最近跟进时间', type: 'date' })
  lastFollowDate: Date;

  @Index()
  @Column({
    comment: '最近跟进人（文本，默认填写记录人姓名）',
    nullable: true,
  })
  lastFollowUserId: string;

  @Column({
    comment: '跟进状态（无需求跟进/有需求跟进）',
    dict: ['无需求跟进', '有需求跟进'],
    type: 'tinyint',
    default: 0,
  })
  followStatus: number;

  @Column({
    comment: '距上次跟进（天，系统自动生成，当前时间-最近跟进时间）',
    type: 'int',
    default: 0,
  })
  daysSinceLastFollow: number;

  @Column({ comment: '最近跟进内容', type: 'text' })
  lastFollowContent: string;

  @Column({
    comment: '工厂情况（总厂/分厂）',
    dict: ['总厂', '分厂'],
    type: 'tinyint',
    default: 0,
  })
  factorySituation: number;

  @Column({ comment: '设备情况（品牌、数量、型号）', type: 'text' })
  deviceSituation: string;

  @Column({ comment: '机器人总数量', type: 'int' })
  robotTotalCount: number;

  @Column({ comment: '车间个数', type: 'int', nullable: true })
  workshopCount: number;

  @Column({ comment: '应用车间', type: 'text', nullable: true })
  applicationWorkshops: string;

  @Column({
    comment: '是否有固定维保供应商',
    dict: ['否', '是'],
    type: 'tinyint',
    nullable: true,
  })
  hasFixedMaintenanceSupplier: number;

  @Column({ comment: '合作供应商', type: 'text', nullable: true })
  cooperationSuppliers: string;

  @Column({
    comment: '是否与我司有过合作（否/是）',
    dict: ['否', '是'],
    type: 'tinyint',
    default: 0,
  })
  hasCooperatedWithUs: number;

  @Column({ comment: '合作起始时间', type: 'date', nullable: true })
  cooperationStartDate: Date;

  @Column({ comment: '合作结束时间', type: 'date', nullable: true })
  cooperationEndDate: Date;

  @Column({
    comment: '合作意向（愿意合作/积极/一般/弱/无）',
    dict: ['愿意合作', '积极', '一般', '弱', '无'],
    type: 'tinyint',
    default: 0,
  })
  cooperationIntention: number;
  
}

