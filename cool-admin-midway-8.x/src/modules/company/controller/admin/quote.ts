import { BaseController, CoolController } from '@cool-midway/core';
import { CompanyInquiryEntity } from '../../entity/inquiry';
import { CompanyQuoteEntity } from '../../entity/quote';
import { CompanyQuoteService } from '../../service/quote';

/**
 * 公司目录-供应链部-报价
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: CompanyQuoteEntity,
  service: CompanyQuoteService,
  serviceApis: [
    {
      method: 'inquiryPage',
      summary: '销售询价需求分页（默认待报价）',
    },
  ],
  insertParam: ctx => {
    return {
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['a.quoteNo', 'a.supplier'],
    fieldEq: ['a.inquiryType', 'a.inquiryId'],
    select: [
      'a.*',
      'b.inquiryNo as inquiryNo',
      'b.customer as inquiryCustomer',
      'b.projectName as inquiryProjectName',
      'b.projectStartDate as inquiryProjectStartDate',
      'b.projectEndDate as inquiryProjectEndDate',
      'b.inquiryType as inquiryInquiryType',
    ],
    join: [
      {
        entity: CompanyInquiryEntity,
        alias: 'b',
        condition: 'a.inquiryId = b.id',
        type: 'leftJoin',
      },
    ],
  },
})
export class AdminCompanyQuoteController extends BaseController {}

