import { BaseService, CoolTransaction } from '@cool-midway/core';
import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import * as moment from 'moment';
import { QueryRunner, Repository } from 'typeorm';
import { CompanyInquiryEntity } from '../entity/inquiry';

/**
 * 公司目录-询价
 */
@Provide()
export class CompanyInquiryService extends BaseService {
  @Inject()
  ctx;

  @InjectEntityModel(CompanyInquiryEntity)
  companyInquiryEntity: Repository<CompanyInquiryEntity>;

  /**
   * 新增（自动生成询价单号）
   */
  @CoolTransaction({ isolation: 'SERIALIZABLE' })
  async add(param: any, queryRunner?: QueryRunner) {
    delete param.id;

    const repo = queryRunner.manager.getRepository(CompanyInquiryEntity);

    const dateStr = moment().format('YYYYMMDD');
    const inquiryType = Number(param.inquiryType ?? 0);
    param.inquiryType = inquiryType;
    param.salesCategory = Number(param.salesCategory ?? inquiryType);

    // 0-机械加工类 JG，1-机械维修类 WX，2-机械保养类 BY，3-项目类 XM，4-备件类 BJ
    const typeCodeMap = ['JG', 'WX', 'BY', 'XM', 'BJ'];
    const typeCode = typeCodeMap[inquiryType] || 'JG';
    const prefix = `XJ-${typeCode}-${dateStr}`;
    const count = await repo
      .createQueryBuilder('a')
      .where('a.inquiryNo like :p', { p: `${prefix}-%` })
      .getCount();
    const seq = String(count + 1).padStart(4, '0');

    // 不同询价类型字段清理（避免前端切换类型后残留数据）
    if (inquiryType === 0) {
      // 机械加工类：清空维修、保养、项目、备件列表相关字段
      param.repairType = null;
      param.faultDescription = null;
      param.siteEnvironment = null;
      param.siteAttachments = null;
      param.debugOwnership = null;
      param.maintenanceType = null;
      param.maintenanceContent = null;
      param.projectConstructType = null;
      param.projectConstructContent = null;
      param.projectConstructAttachments = null;
      param.projectSiteEnvDesc = null;
      param.projectSiteEnvAttachments = null;
      param.spareItems = null;
      // 机械加工类保留吊装需求字段
    } else if (inquiryType === 1) {
      // 机械维修类：清空加工、保养、项目、备件列表相关字段
      param.processingRequirement = null;
      param.drawingAttachments = null;
      param.maintenanceType = null;
      param.maintenanceContent = null;
      param.projectConstructType = null;
      param.projectConstructContent = null;
      param.projectConstructAttachments = null;
      param.projectSiteEnvDesc = null;
      param.projectSiteEnvAttachments = null;
      param.spareItems = null;
      // 机械维修类保留吊装需求字段
    } else if (inquiryType === 2) {
      // 机械保养类：清空加工、维修、项目相关字段
      param.processingRequirement = null;
      param.drawingAttachments = null;
      param.repairType = null;
      param.faultDescription = null;
      param.siteAttachments = null;
      param.debugOwnership = null;
      param.projectConstructType = null;
      param.projectConstructContent = null;
      param.projectConstructAttachments = null;
      param.projectSiteEnvDesc = null;
      param.projectSiteEnvAttachments = null;
      // 保养类也使用现场环境字段(siteEnvironment)
      // 机械保养类保留吊装需求字段
    } else if (inquiryType === 3) {
      // 项目类：清空加工、维修、保养、备件专属字段
      param.processingRequirement = null;
      param.drawingAttachments = null;
      param.repairType = null;
      param.faultDescription = null;
      param.maintenanceType = null;
      param.maintenanceContent = null;
      param.siteAttachments = null;
      param.debugOwnership = null;
      param.spareItems = null;
      // 备件类目前共用通用补充需求字段 + spareItems 列表
    } else if (inquiryType === 4) {
      // 备件类：清空加工、维修、保养、项目专属字段
      param.processingRequirement = null;
      param.drawingAttachments = null;
      param.repairType = null;
      param.faultDescription = null;
      param.maintenanceType = null;
      param.maintenanceContent = null;
      param.projectLocation = null;
      param.address = null;
      param.projectStartDate = null;
      param.projectEndDate = null;
      param.siteEnvironment = null;
      param.siteAttachments = null;
      param.debugOwnership = null;
      param.projectConstructType = null;
      param.projectConstructContent = null;
      param.projectConstructAttachments = null;
      param.projectSiteEnvDesc = null;
      param.projectSiteEnvAttachments = null;
      // 备件类不再使用这些通用补充字段
      param.sparePartsDetail = null;
      param.toolRequirement = null;
      param.softwareRequirement = null;
      param.capabilityRequirement = null;
      param.workerTypeAndCount = null;
      param.specificPersonnel = null;
      param.initialConstructionPlan = null;
      // 备件类不需要吊装需求
      param.hoistingRequirement = null;
    }

    const saved = await repo.save({
      ...param,
      inquiryNo: `${prefix}-${seq}`,
      quoteStatus: 0,
      quoteId: null,
    });

    return { id: saved.id };
  }
}

