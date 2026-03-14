import { BaseController, CoolController } from '@cool-midway/core';
import { CompanyCustomerEntity } from '../../entity/customer';
import { CompanyCustomerService } from '../../service/customer';

/**
 * 公司目录-销售部-客户管理
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: CompanyCustomerEntity,
  service: CompanyCustomerService,
  insertParam: ctx => {
    return {
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    // 关键词模糊搜索：客户编号、名称、简称
    keyWordLikeFields: ['a.customerNo', 'a.customerName', 'a.customerShortName'],
    // 精确筛选字段
    fieldEq: [
      'a.customerNature',
      'a.level',
      'a.maintainUserId',
      'a.developUserId',
      'a.ownerUserId',
    ],
    // 默认查询字段
    select: ['a.*'],
  },
})
export class AdminCompanyCustomerController extends BaseController {}

