import { BaseService, CoolTransaction } from '@cool-midway/core';
import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import * as moment from 'moment';
import { QueryRunner, Repository } from 'typeorm';
import { CompanyCustomerEntity } from '../entity/customer';

/**
 * 公司目录-客户
 */
@Provide()
export class CompanyCustomerService extends BaseService {
  @Inject()
  ctx;

  @InjectEntityModel(CompanyCustomerEntity)
  companyCustomerEntity: Repository<CompanyCustomerEntity>;

  /**
   * 新增客户（自动生成客户编号）
   */
  @CoolTransaction({ isolation: 'SERIALIZABLE' })
  async add(param: any, queryRunner?: QueryRunner) {
    delete param.id;

    const repo = queryRunner.manager.getRepository(CompanyCustomerEntity);

    const dateStr = moment().format('YYYYMMDD');
    const prefix = `KH-${dateStr}`;

    const count = await repo
      .createQueryBuilder('a')
      .where('a.customerNo like :p', { p: `${prefix}-%` })
      .getCount();

    const seq = String(count + 1).padStart(4, '0');

    // 计算拜访次数：等于当前提交的拜访记录条数
    const visitCount =
      Array.isArray(param.visitRecords) && param.visitRecords.length
        ? param.visitRecords.length
        : 0;

    // 计算距上次合作时间：以最近合作结束时间为主，没有结束时间则取开始时间
    let daysSinceLastCooperation = 0;
    const baseCoopDate = param.cooperationEndDate || param.cooperationStartDate;
    if (baseCoopDate) {
      const today = moment().startOf('day');
      const coop = moment(baseCoopDate).startOf('day');
      const diff = today.diff(coop, 'days');
      daysSinceLastCooperation = diff > 0 ? diff : 0;
    }

    // 计算距上次跟进时间：根据最近跟进时间 lastFollowDate
    let daysSinceLastFollow = 0;
    if (param.lastFollowDate) {
      const today = moment().startOf('day');
      const follow = moment(param.lastFollowDate).startOf('day');
      const diff = today.diff(follow, 'days');
      daysSinceLastFollow = diff > 0 ? diff : 0;
    }

    // 最近跟进人：默认当前登录后台用户（以用户名/姓名文本存储）
    const currentUserName =
      this.ctx?.admin?.name ||
      this.ctx?.admin?.nickName ||
      this.ctx?.admin?.username ||
      null;
    const lastFollowUserId =
      param.lastFollowUserId ?? currentUserName ?? null;

    const saved = await repo.save({
      ...param,
      customerNo: `${prefix}-${seq}`,
      visitCount,
      daysSinceLastCooperation,
      daysSinceLastFollow,
      lastFollowUserId,
      // 创建人 = 背调板块“创建人”，以用户名/姓名文本存储
      createUserId: currentUserName,
      backgroundLastModifyUserId: currentUserName,
    });

    return { id: saved.id };
  }

  /**
   * 修改之前：在新增/更新客户时，同步刷新拜访次数、距上次合作时间及负责人变更信息
   */
  async modifyBefore(data: any, type: 'delete' | 'update' | 'add') {
    if (type === 'add' || type === 'update') {
      // 记录最后修改人（文本）
      const currentUserName =
        this.ctx?.admin?.name ||
        this.ctx?.admin?.nickName ||
        this.ctx?.admin?.username ||
        null;
      if (currentUserName) {
        data.backgroundLastModifyUserId = currentUserName;
      }

      // 默认最近跟进人：若未显式传入，则使用当前登录用户
      if (
        currentUserName &&
        (data.lastFollowUserId === undefined || data.lastFollowUserId === null)
      ) {
        data.lastFollowUserId = currentUserName;
      }

      // 仅当提交中包含 visitRecords 字段时才更新拜访次数，避免无关更新把次数清零
      if (Object.prototype.hasOwnProperty.call(data, 'visitRecords')) {
        const visitCount =
          Array.isArray(data.visitRecords) && data.visitRecords.length
            ? data.visitRecords.length
            : 0;
        data.visitCount = visitCount;
      }

      // 当提交中包含合作起止时间时，重新计算距上次合作时间
      const hasStart = Object.prototype.hasOwnProperty.call(
        data,
        'cooperationStartDate',
      );
      const hasEnd = Object.prototype.hasOwnProperty.call(
        data,
        'cooperationEndDate',
      );

      if (hasStart || hasEnd) {
        const baseCoopDate = data.cooperationEndDate || data.cooperationStartDate;
        if (baseCoopDate) {
          const today = moment().startOf('day');
          const coop = moment(baseCoopDate).startOf('day');
          const diff = today.diff(coop, 'days');
          data.daysSinceLastCooperation = diff > 0 ? diff : 0;
        } else {
          data.daysSinceLastCooperation = 0;
        }
      }

      // 当提交中包含最近跟进时间时，重新计算距上次跟进时间
      if (Object.prototype.hasOwnProperty.call(data, 'lastFollowDate')) {
        if (data.lastFollowDate) {
          const today = moment().startOf('day');
          const follow = moment(data.lastFollowDate).startOf('day');
          const diff = today.diff(follow, 'days');
          data.daysSinceLastFollow = diff > 0 ? diff : 0;
        } else {
          data.daysSinceLastFollow = 0;
        }
      }

      // 负责人变更：需要在更新时对比原负责人
      if (type === 'update' && data.id) {
        const idNum = Number(data.id);
        if (idNum) {
          const origin = await this.companyCustomerEntity.findOne({
            where: { id: idNum },
          });
          if (origin && data.backgroundOwnerUserId !== undefined) {
            const newOwner = data.backgroundOwnerUserId;
            if (newOwner !== origin.backgroundOwnerUserId) {
              data.backgroundPreviousOwnerUserId = origin.backgroundOwnerUserId;
              data.backgroundOwnerChangeTime = moment().toDate();
            }
          }
        }
      }
    }
  }
}

