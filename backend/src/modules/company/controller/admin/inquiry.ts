import { BaseController, CoolController } from '@cool-midway/core';
import { CompanyInquiryEntity } from '../../entity/inquiry';
import { CompanyQuoteEntity } from '../../entity/quote';
import { CompanyInquiryService } from '../../service/inquiry';

/**
 * 公司目录-销售部-询价
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: CompanyInquiryEntity,
  service: CompanyInquiryService,
  insertParam: ctx => {
    return {
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['a.inquiryNo', 'a.customer', 'a.projectName'],
    fieldEq: ['a.inquiryType', 'a.quoteStatus'],
    select: [
      'a.*',
      'b.quoteNo as quoteNo',
      'b.totalCost as quoteTotalCost',
      'b.supplier as quoteSupplier',
      'b.priceExclTax as quotePriceExclTax',
      'b.taxRate as quoteTaxRate',
      'b.priceInclTax as quotePriceInclTax',
    ],
    join: [
      {
        entity: CompanyQuoteEntity,
        alias: 'b',
        condition: 'a.quoteId = b.id',
        type: 'leftJoin',
      },
    ],
  },
})
export class AdminCompanyInquiryController extends BaseController {}

