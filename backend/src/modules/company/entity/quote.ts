import { BaseEntity, transformerJson } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 公司目录-报价
 */
@Entity('company_quote')
export class CompanyQuoteEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '报价单号', length: 50 })
  quoteNo: string;

  @Index()
  @Column({ comment: '询价ID' })
  inquiryId: number;

  @Index()
  @Column({
    comment: '询价类型',
    dict: ['机械加工类', '机械维修类'],
    type: 'tinyint',
    default: 0,
  })
  inquiryType: number;

  @Column({ comment: '分解成本1-备件', type: 'text', nullable: true })
  costSpareParts: string;

  @Column({ comment: '分解成本2-工具', type: 'text', nullable: true })
  costTools: string;

  @Column({ comment: '分解成本3-软件', type: 'text', nullable: true })
  costSoftware: string;

  @Column({
    comment: '分解成本4-人工（可逐条添加）',
    nullable: true,
    type: 'json',
    transformer: transformerJson,
  })
  costLaborItems: string[];

  @Column({ comment: '分解成本5-交通', type: 'text', nullable: true })
  costTraffic: string;

  @Column({ comment: '分解成本6-售后', type: 'text', nullable: true })
  costAfterSales: string;

  @Column({ comment: '分解成本7-培训报告', type: 'text', nullable: true })
  costTrainingReport: string;

  @Column({
    comment: '总成本',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  totalCost: number;

  @Column({ comment: '供应商', length: 100, nullable: true })
  supplier: string;

  @Column({
    comment: '未税报价',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  priceExclTax: number;

  @Column({
    comment: '税率（%）',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  taxRate: number;

  @Column({
    comment: '含税报价',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  priceInclTax: number;

  @Column({
    comment: '备件类报价明细（多物料×多供应商）',
    nullable: true,
    type: 'json',
    transformer: transformerJson,
  })
  spareQuoteItems: {
    // 物料名称
    materialName: string;
    // 规格型号
    spec?: string;
    // 供应商报价列表
    suppliers: {
      // 供应商名称
      supplier: string;
      // 未税单价
      unitPriceExclTax: number;
      // 税率（%）
      taxRate: number;
      // 含税单价
      unitPriceInclTax: number;
      // 含税总价
      totalPriceInclTax: number;
      // 运费
      freight?: number;
      // 货期
      delivery?: string;
      // 图片（非必填，上传文件URL数组）
      images?: string[];
      // 备注
      remark?: string;
    }[];
  }[];

  @Column({ comment: '创建人ID', nullable: true })
  createUserId: number;
}

