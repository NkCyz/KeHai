import { BaseService, CoolTransaction } from '@cool-midway/core';
import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import * as moment from 'moment';
import { In, QueryRunner, Repository } from 'typeorm';
import { CompanyInquiryEntity } from '../entity/inquiry';
import { CompanyQuoteEntity } from '../entity/quote';

/**
 * 公司目录-报价
 */
@Provide()
export class CompanyQuoteService extends BaseService {
  @Inject()
  ctx;

  @InjectEntityModel(CompanyQuoteEntity)
  companyQuoteEntity: Repository<CompanyQuoteEntity>;

  @InjectEntityModel(CompanyInquiryEntity)
  companyInquiryEntity: Repository<CompanyInquiryEntity>;

  /**
   * 新增 / 编辑报价
   * - 无 id：新增报价（自动生成报价单号，并回写询价）
   * - 有 id：在原报价记录上修改，不生成新报价
   */
  @CoolTransaction({ isolation: 'SERIALIZABLE' })
  async add(param: any, queryRunner?: QueryRunner) {
    const inquiryRepo = queryRunner.manager.getRepository(CompanyInquiryEntity);
    const quoteRepo = queryRunner.manager.getRepository(CompanyQuoteEntity);

    // ========== 有 id 的情况：视为编辑 ==========
    const idNum = param.id ? Number(param.id) : 0;
    if (idNum) {
      const exist = await quoteRepo.findOne({ where: { id: idNum } });
      if (!exist) {
        throw new Error('报价记录不存在');
      }

      // 仅更新可编辑字段，保持原 inquiryId / inquiryType / quoteNo 不变
      // 同时手动更新更新时间
      await quoteRepo.update(idNum, {
        costSpareParts: param.costSpareParts,
        costTools: param.costTools,
        costSoftware: param.costSoftware,
        costLaborItems: param.costLaborItems,
        costTraffic: param.costTraffic,
        costAfterSales: param.costAfterSales,
        costTrainingReport: param.costTrainingReport,
        totalCost: param.totalCost,
        supplier: param.supplier,
        priceExclTax: param.priceExclTax,
        taxRate: param.taxRate,
        priceInclTax: param.priceInclTax,
        spareQuoteItems: param.spareQuoteItems,
        updateTime: new Date(),
      });

      return { id: idNum };
    }

    // ========== 无 id：新增报价 ==========
    delete param.id;

    // 兼容前端可能只传递 inquiryId 或 inquiryNo 的情况
    let inquiryId = Number(param.inquiryId);

    let inquiry: CompanyInquiryEntity | null = null;

    // 优先按 ID 查询
    if (inquiryId) {
      inquiry = await inquiryRepo.findOne({ where: { id: inquiryId } });
    }

    // 如果没有有效 ID，再尝试按询价单号查询
    if (!inquiry && param.inquiryNo) {
      inquiry = await inquiryRepo.findOne({
        where: { inquiryNo: String(param.inquiryNo) },
      });
      inquiryId = inquiry?.id;
    }

    if (!inquiry || !inquiryId) {
      throw new Error('缺少有效的询价信息');
    }
    if (!inquiry) {
      throw new Error('询价不存在');
    }

    const dateStr = moment().format('YYYYMMDD');
    // 0-机械加工类 JG，1-机械维修类 WX，2-机械保养类 BY，3-项目类 XM，4-备件类 BJ
    const typeCodeMap = ['JG', 'WX', 'BY', 'XM', 'BJ'];
    const typeCode = typeCodeMap[inquiry.inquiryType] || 'JG';
    const prefix = `BJ-${typeCode}-${dateStr}`;
    const count = await quoteRepo
      .createQueryBuilder('a')
      .where('a.quoteNo like :p', { p: `${prefix}-%` })
      .getCount();
    const seq = String(count + 1).padStart(4, '0');

    const saved = await quoteRepo.save({
      ...param,
      inquiryId,
      inquiryType: inquiry.inquiryType,
      quoteNo: `${prefix}-${seq}`,
    });

    await inquiryRepo.update(inquiryId, {
      quoteStatus: 1,
      quoteId: saved.id,
    });

    return { id: saved.id };
  }

  /**
   * 报价详情，附带对应的询价信息
   */
  async info(id: number, infoIgnoreProperty?: string[]) {
    // 先按默认逻辑查询报价信息
    const quote: any = await super.info(id, infoIgnoreProperty);
    if (!quote || !quote.inquiryId) {
      return quote;
    }

    // 再补充对应的询价信息
    const inquiry = await this.companyInquiryEntity.findOne({
      where: { id: quote.inquiryId },
    });

    if (!inquiry) {
      return quote;
    }

    // 以 inquiry 字段返回完整询价信息，前端可按需使用
    return {
      ...quote,
      inquiry,
    };
  }

  /**
   * 删除报价记录
   * 当某个询价下所有报价都被删除后，将该询价重新标记为待报价
   */
  @CoolTransaction({ isolation: 'SERIALIZABLE' })
  async delete(ids: number[] | string, queryRunner?: QueryRunner) {
    const idArr = Array.isArray(ids)
      ? ids.map(e => Number(e)).filter(e => !!e)
      : String(ids)
          .split(',')
          .map(e => Number(e))
          .filter(e => !!e);

    if (!idArr.length) {
      return;
    }

    const quoteRepo = queryRunner.manager.getRepository(CompanyQuoteEntity);
    const inquiryRepo = queryRunner.manager.getRepository(CompanyInquiryEntity);

    // 找出将要受影响的询价ID
    const relatedQuotes = await quoteRepo.find({
      where: {
        id: In(idArr),
      },
    });
    const inquiryIds = Array.from(
      new Set(relatedQuotes.map(e => e.inquiryId).filter(e => !!e)),
    );

    // 在同一事务中直接删除报价记录，避免嵌套事务导致锁等待
    await quoteRepo.delete(idArr);

    if (!inquiryIds.length) {
      return;
    }

    // 查询这些询价下是否还存在其它报价
    const remain = await quoteRepo
      .createQueryBuilder('q')
      .select('q.inquiryId', 'inquiryId')
      .where('q.inquiryId IN (:...ids)', { ids: inquiryIds })
      .groupBy('q.inquiryId')
      .getRawMany();

    const stillHasQuote = new Set<number>(
      remain.map(r => Number(r.inquiryId)).filter(e => !!e),
    );

    const needReset = inquiryIds.filter(id => !stillHasQuote.has(id));

    if (needReset.length) {
      await inquiryRepo
        .createQueryBuilder()
        .update(CompanyInquiryEntity)
        .set({
          quoteStatus: 0,
          quoteId: null,
        })
        .whereInIds(needReset)
        .execute();
    }
  }

  /**
   * 询价分页（给供应链端自动展示销售询价）
   * 通过 quoteStatus=0 默认筛选待报价，可按需传入 inquiryType、keyWord 等
   */
  async inquiryPage(query: any) {
    const qb = this.companyInquiryEntity.createQueryBuilder('a');
    qb.where('1=1');

    const quoteStatusNum =
      query?.quoteStatus === undefined || query?.quoteStatus === null
        ? 0
        : Number(query.quoteStatus);
    const quoteStatus = [0, 1].includes(quoteStatusNum) ? quoteStatusNum : 0;
    qb.andWhere('a.quoteStatus = :quoteStatus', { quoteStatus });

    const inquiryTypeNum =
      query?.inquiryType === undefined || query?.inquiryType === null
        ? null
        : Number(query.inquiryType);
    if (inquiryTypeNum !== null && [0, 1, 2, 3, 4].includes(inquiryTypeNum)) {
      qb.andWhere('a.inquiryType = :inquiryType', {
        inquiryType: inquiryTypeNum,
      });
    }

    if (query?.keyWord) {
      qb.andWhere(
        '(a.inquiryNo like :kw or a.customer like :kw or a.projectName like :kw)',
        { kw: `%${query.keyWord}%` }
      );
    }

    return this.entityRenderPage(qb, query);
  }
}

