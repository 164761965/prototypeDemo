import { SQLiteObject } from '@ionic-native/sqlite';
import { Injectable } from '@angular/core';
import { DBService } from './db.service';
import { CvtNonNotice, CvtNonNoticeSub, CvtNonReceive, CvtNonCheck } from '../entity/cvt.entity.provider';

/*
  盘点数据库类
*/
@Injectable()
export class ConvertDBProvider {
    private dataBase: SQLiteObject = null;
    constructor(private dbService: DBService) {
        this.dbService.getSqliteObject().then((db) => {
            this.dataBase = db;
        })
    }

    /////////非安转产通知单//////////
    /**
      * 根据员工编号获取非安设备转产通知单
      * @param noticeId 
      */
    queryFromCvtNonNoticeByWorkerNumber(workerNumber: string) {
        return new Promise<CvtNonNotice>((resolve, reject) => {
            this.dbService.executeSql('select * from cvt_noninstall_notice where RECIPIENT=?', [workerNumber])
                .then((data) => {
                    var notice: CvtNonNotice = this._getCvtNonNoticeFromDBResult(data);
                    resolve(notice);
                }, (error) => {
                    reject("数据库操作：\n查询非安设备通知表失败\n" + error.message);
                })
        })
    }

    /**
     * 根据通知ID更新通知单
     * @param changeRecord 
     */
    updateToCvtNonNotice(cvtNonNotice: CvtNonNotice) {
        return new Promise((resolve, reject) => {
            this.dbService.executeSql("update cvt_noninstall_notice set NOTICE_ID=?,INVESTPLAN_ID=?,ORG_NAME=? ,WORK_ORDER_NUMBER=?, STOREROOM_KEEPER=?,NOTICE_STATE=?,RECORD_FLAG=? where RECIPIENT=?",
                [cvtNonNotice.noticeId, cvtNonNotice.investplanId, cvtNonNotice.orgName, cvtNonNotice.workOrderNumber, cvtNonNotice.storeroomKeeper, cvtNonNotice.noticeState, cvtNonNotice.recordFlag, cvtNonNotice.recipient])
                .then((data) => {
                    resolve(data);
                })
                .catch((error) => {
                    reject("数据库操作：\n更新非安设备转产通知单失败\n" + error.message);
                })
        })
    }

    /**
     * 删除非安设备转产通知单
     */
    deleteFromCvtNonNoticeByNoticeId(noticeId: string) {
        return new Promise((resolve, reject) => {
            this.dbService.executeSql('delete from cvt_noninstall_notice where NOTICE_ID=?', [noticeId])
                .then((data) => {
                    resolve(data);
                })
                .catch((error) => {
                    reject("数据库操作：\n删除非安设备转产通知单失败\n" + error.message);
                })
        })
    }

    /**
     * 在非安资产领用通知表中插入数据
     * @param cvtNonNotice 
     */
    insertToCvtNonNotice(cvtNonNotice: CvtNonNotice) {
        return new Promise((resolve, reject) => {
            if (cvtNonNotice == null) {
                resolve();
            }
            this.dbService.executeSql('insert into cvt_noninstall_notice values (?,?,?,?,?,?,?,?)',
                [cvtNonNotice.noticeId, cvtNonNotice.investplanId, cvtNonNotice.orgName, cvtNonNotice.workOrderNumber, cvtNonNotice.recipient,
                cvtNonNotice.storeroomKeeper, cvtNonNotice.noticeState, cvtNonNotice.recordFlag])
                .then((data) => {
                    resolve(data);
                }, (error) => {
                    reject("数据库操作：\n插入非安资产领用通知表失败\n" + error.message);
                })
        })
    }


    ////////非安转产通知单END/////////


    ///////非安转产通知单明细/////////
    /**
      * 根据员工编号获取非安设备转产通知附加表
      * @param noticeId 
      */
    queryFromCvtNonNoticeSubByNoticeId(noticeId: string) {
        return new Promise<Array<CvtNonNoticeSub>>((resolve, reject) => {
            this.dbService.executeSql('select * from cvt_noninstall_notice_sub where NOTICE_ID=?', [noticeId])
                .then((data) => {
                    var notice = this._getCvtNonNoticeSubsFromDBResult(data);
                    resolve(notice);
                }, (error) => {
                    reject("数据库操作：\n查询非安设备通知表失败\n" + error.message);
                })
        })
    }

    /**
     * 删除非安设备转产通知单附加表
     */
    deleteFromCvtNonNoticeSubByNoticeId(noticeId: string) {
        return new Promise((resolve, reject) => {
            this.dbService.executeSql('delete from cvt_noninstall_notice_sub where NOTICE_ID=?', [noticeId])
                .then((data) => {
                    resolve(data);
                })
                .catch((error) => {
                    reject("数据库操作：\n删除非安设备转产通知单附加表失败\n" + error.message);
                })
        })
    }

    /**
     * 在非安资产领用通知附加表中插入数据
     * @param noticeSub 
     */
    insertToCvtNonNoticeSub(noticeSub: CvtNonNoticeSub) {
        return new Promise((resolve, reject) => {
            this.dbService.executeSql('insert into cvt_noninstall_notice_sub values (?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [noticeSub.subNoticeId, noticeSub.noticeId, noticeSub.purchasingId, noticeSub.materialCode, noticeSub.assetName, noticeSub.specModel, noticeSub.unit,
                noticeSub.sentQuantity, noticeSub.price, noticeSub.amount, noticeSub.storageDate, noticeSub.outDate, noticeSub.recordFlag])
                .then((data) => {
                    resolve(data);
                }, (error) => {
                    reject("数据库操作：\n插入非安资产领用通知附加表失败\n" + error.message);
                })
        })
    }
    ///////非安转产通知单明细END/////////


    ///////非安转产领用通知单///////////
    /**
      * 获取领用表资产信息
      */
    queryFromCvtNonReceive(noticeId: string) {
        return new Promise<Array<CvtNonReceive>>((resolve, reject) => {
            this.dbService.executeSql('select * from cvt_noninstall_receive where NOTICE_ID=?', [noticeId])
                .then((data) => {
                    var notice = this._getCvtNonReceivesFromDBResult(data);
                    resolve(notice);
                }, (error) => {
                    reject("数据库操作：\n查询非安转产领用表失败\n" + error.message);
                })
        })
    }

    /**
      * 获取领用表资产信息
      */
      queryFromCvtNonReceiveByReceiveId(receiveId: string) {
        return new Promise<Array<CvtNonReceive>>((resolve, reject) => {
            this.dbService.executeSql('select * from cvt_noninstall_receive where RECEIVE_ID=?', [receiveId])
                .then((data) => {
                    var notice = this._getCvtNonReceivesFromDBResult(data);
                    resolve(notice);
                }, (error) => {
                    reject("数据库操作：\n查询非安转产领用表失败\n" + error.message);
                })
        })
    }

    /**
     * 根据通知ID更新领用单
     * @param changeRecord 
     */
    updateToCvtNonReceive(cvtNonReceive: CvtNonReceive) {
        return new Promise((resolve, reject) => {
            this.dbService.executeSql("update cvt_noninstall_receive set RECEIVE_ORG=?,RECEIVE_PERSON=?,RECEIVE_TIME=? ,RECEIVE_STYLE=?,RECORD_FLAG=?,RECEIVE_NAME=?,SIGNATURE_PATH=?,SIGNATURE_NAME=? where RECEIVE_ID=?",
                [cvtNonReceive.receiveOrg, cvtNonReceive.receivePerson, cvtNonReceive.receiveTime, cvtNonReceive.reveiveStyle, cvtNonReceive.recordFlag, cvtNonReceive.receiveName, cvtNonReceive.signaturePath, cvtNonReceive.signatureName, cvtNonReceive.receiveId])
                .then((data) => {
                    resolve(data);
                })
                .catch((error) => {
                    reject("数据库操作：\n更新非安设备转产领用单失败\n" + error.message);
                })
        })
    }

    /**
     * 删除非安设备转产领用单
     */
    deleteFromCvtNonReceiveByReceiveId(receiveId: string) {
        return new Promise((resolve, reject) => {
            this.dbService.executeSql('delete from cvt_noninstall_receive where RECEIVE_ID=?', [receiveId])
                .then((data) => {
                    resolve(data);
                })
                .catch((error) => {
                    reject("数据库操作：\n删除非安设备转产领用单失败\n" + error.message);
                })
        })
    }

    /**
     * 在非安资产领用记录表中插入数据
     * @param cvtNonReceive 
     */
    insertToCvtNonReceive(cvtNonReceive: CvtNonReceive) {
        return new Promise((resolve, reject) => {
            this.dbService.executeSql('insert into cvt_noninstall_receive values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [cvtNonReceive.receiveId, cvtNonReceive.noticeId, cvtNonReceive.assetId, cvtNonReceive.assetCode, cvtNonReceive.assetName, cvtNonReceive.specModel, cvtNonReceive.receiveOrg, cvtNonReceive.receivePerson, cvtNonReceive.receiveTime, cvtNonReceive.reveiveStyle, cvtNonReceive.recordFlag, cvtNonReceive.receiveName, cvtNonReceive.signaturePath, cvtNonReceive.signatureName])
                .then((data) => {
                    resolve(data);
                }, (error) => {
                    reject("数据库操作：\n插入非安资产领用记录表失败\n" + error.message);
                })
        })
    }
    ///////非安转产领用通知单END///////////




    /////////非安转产验收单/////////
    /**
      * 获取验收表资产信息
      */
    queryFromCvtNonCheck(investplanId: string) {
        return new Promise<Array<CvtNonCheck>>((resolve, reject) => {
            this.dbService.executeSql('select * from cvt_noninstall_check where INVESTPLAN_ID=?', [investplanId])
                .then((data) => {
                    var checks = this._getCvtNonChecksFromDBResult(data);
                    resolve(checks);
                }, (error) => {
                    reject("数据库操作：\n查询非安转产验收表失败\n" + error.message);
                })
        })
    }

    /**
      * 获取验收表资产信息
      */
    queryFromCvtNonCheckByCheckId(checkId: string) {
        return new Promise<Array<CvtNonCheck>>((resolve, reject) => {
            this.dbService.executeSql('select * from cvt_noninstall_check where CHECK_ID=?', [checkId])
                .then((data) => {
                    var checks = this._getCvtNonChecksFromDBResult(data);
                    resolve(checks);
                }, (error) => {
                    reject("数据库操作：\n查询非安转产验收表失败\n" + error.message);
                })
        })
    }

    /**
     * 根据通知ID更新领用单
     * @param cvtNonCheck  map 
     */
    updateToCvtNonCheck(cvtNonCheck) {
        return new Promise((resolve, reject) => {
            this.dbService.executeSql("update cvt_noninstall_check set CHECK_BILL_NUM=?,CHECK_ORG=?,CHECK_DATE=? ,CHECK_PERSON=?,CHECK_STATE=?,RECORD_FLAG=? where ASSET_ID=?",
                [cvtNonCheck.checkBillNum, cvtNonCheck.checkOrg, cvtNonCheck.checkDate, cvtNonCheck.checkPerson, cvtNonCheck.checkState, cvtNonCheck.recordFlag, cvtNonCheck.assetId])
                .then((data) => {
                    resolve(data);
                })
                .catch((error) => {
                    reject("数据库操作：\n更新非安设备转产领用单失败\n" + error.message);
                })
        })
    }

    /**
     * 删除非安转产验收单
     */
    deleteFromCvtNonCheckByCheckId(checkId: string) {
        return new Promise((resolve, reject) => {
            this.dbService.executeSql('delete from cvt_noninstall_check where CHECK_ID=?', [checkId])
                .then((data) => {
                    resolve(data);
                })
                .catch((error) => {
                    reject("数据库操作：\n删除非安设备非安转产验收单失败\n" + error.message);
                })
        })
    }

    /**
     * 在非安资产领用验收表中插入数据
     * @param cvtNonCheck 
     */
    insertToCvtNonCheck(cvtNonCheck: CvtNonCheck) {
        return new Promise((resolve, reject) => {
            this.dbService.executeSql('insert into cvt_noninstall_check values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [cvtNonCheck.checkId, cvtNonCheck.investplanId, cvtNonCheck.receiveId, cvtNonCheck.checkBillNum, cvtNonCheck.checkOrg, cvtNonCheck.checkDate, cvtNonCheck.checkPerson, cvtNonCheck.checkLeader,
                cvtNonCheck.checkOpinion, cvtNonCheck.checkState, cvtNonCheck.assetId, cvtNonCheck.fundChannel, cvtNonCheck.assetCode, cvtNonCheck.assetName, cvtNonCheck.specModel, cvtNonCheck.selfNumber, cvtNonCheck.manufacturer,
                cvtNonCheck.manufactureDate, cvtNonCheck.workInOrg, cvtNonCheck.serialNumber, cvtNonCheck.unit, cvtNonCheck.quantity, cvtNonCheck.originalValue, cvtNonCheck.isReadyForUse, cvtNonCheck.componentToolDesc, cvtNonCheck.technicalData, cvtNonCheck.recordFlag])
                .then((data) => {
                    resolve(data);
                }, (error) => {
                    reject("数据库操作：\n插入非安资产领用验收表失败\n" + error.message);
                })
        })
    }

    /////////非安转产验收单END////////






    /////////解析数据库传回值///////////


    /**
     * 从数据库查询结果中返回CvtNonNotice的值
     * @param data 
     */
    private _getCvtNonNoticeFromDBResult(data): CvtNonNotice {
        var cvtNonNotice: CvtNonNotice = null;
        if (data.rows.length > 0) {
            cvtNonNotice = new CvtNonNotice();
            cvtNonNotice.noticeId = data.rows.item(0).NOTICE_ID;
            cvtNonNotice.investplanId = data.rows.item(0).INVESTPLAN_ID;
            cvtNonNotice.orgName = data.rows.item(0).ORG_NAME;
            cvtNonNotice.workOrderNumber = data.rows.item(0).WORK_ORDER_NUMBER;
            cvtNonNotice.recipient = data.rows.item(0).RECIPIENT;
            cvtNonNotice.storeroomKeeper = data.rows.item(0).STOREROOM_KEEPER;
            cvtNonNotice.noticeState = data.rows.item(0).NOTICE_STATE;
            cvtNonNotice.recordFlag = data.rows.item(0).RECORD_FLAG;
        }
        return cvtNonNotice;
    }

    /**
     * 从数据库查询结果中返回CvtNonNoticeSub的值
     * @param data 
     */
    private _getCvtNonNoticeSubsFromDBResult(data): Array<CvtNonNoticeSub> {
        var cvtNonNoticeSubs: Array<CvtNonNoticeSub> = new Array<CvtNonNoticeSub>();
        if (data.rows.length > 0) {
            cvtNonNoticeSubs = new Array<CvtNonNoticeSub>();
            for (var i = 0; i < data.rows.length; i++) {
                var cvtNonNoticeSub = new CvtNonNoticeSub();
                cvtNonNoticeSub.subNoticeId = data.rows.item(i).SUB_NOTICE_ID;
                cvtNonNoticeSub.noticeId = data.rows.item(i).NOTICE_ID;
                cvtNonNoticeSub.purchasingId = data.rows.item(i).PURCHASING_ID;
                cvtNonNoticeSub.materialCode = data.rows.item(i).MATERIAL_CODE;
                cvtNonNoticeSub.assetName = data.rows.item(i).ASSET_NAME;
                cvtNonNoticeSub.specModel = data.rows.item(i).SPEC_MODEL;
                cvtNonNoticeSub.unit = data.rows.item(i).UNIT;
                cvtNonNoticeSub.price = data.rows.item(i).PRICE;
                cvtNonNoticeSub.amount = data.rows.item(i).AMOUNT;
                cvtNonNoticeSub.sentQuantity = data.rows.item(i).SENT_QUANTITY;
                cvtNonNoticeSub.storageDate = data.rows.item(i).STORAGE_DATE;
                cvtNonNoticeSub.outDate = data.rows.item(i).OUT_DATE;
                cvtNonNoticeSub.recordFlag = data.rows.item(i).RECORD_FLAG;
                cvtNonNoticeSubs.push(cvtNonNoticeSub);
            }
        }
        return cvtNonNoticeSubs;
    }

    /**
    * 从数据库查询结果中返回Array<CvtNonReceive>的值
    * @param data 
    */
    private _getCvtNonReceivesFromDBResult(data): Array<CvtNonReceive> {
        var cvtNonReceives: Array<CvtNonReceive> = new Array<CvtNonReceive>();
        if (data.rows.length > 0) {
            cvtNonReceives = new Array<CvtNonReceive>();
            for (var i = 0; i < data.rows.length; i++) {
                var cvtNonReceive = new CvtNonReceive();
                cvtNonReceive.receiveId = data.rows.item(i).RECEIVE_ID;
                cvtNonReceive.noticeId = data.rows.item(i).NOTICE_ID;
                cvtNonReceive.assetId = data.rows.item(i).ASSET_ID;
                cvtNonReceive.assetCode = data.rows.item(i).ASSET_CODE;
                cvtNonReceive.assetName = data.rows.item(i).ASSET_NAME;
                cvtNonReceive.specModel = data.rows.item(i).SPEC_MODEL;
                cvtNonReceive.receiveOrg = data.rows.item(i).RECEIVE_ORG;
                cvtNonReceive.receivePerson = data.rows.item(i).RECEIVE_PERSON;
                cvtNonReceive.receiveTime = data.rows.item(i).RECEIVE_TIME;
                cvtNonReceive.reveiveStyle = data.rows.item(i).RECEIVE_STYLE;
                cvtNonReceive.recordFlag = data.rows.item(i).RECORD_FLAG;
                cvtNonReceive.receiveName = data.rows.item(i).RECEIVE_NAME;
                cvtNonReceive.signaturePath = data.rows.item(i).SIGNATURE_PATH;
                cvtNonReceive.signatureName = data.rows.item(i).SIGNATURE_NAME;
                cvtNonReceives.push(cvtNonReceive);
            }
        }
        return cvtNonReceives;
    }

    /**
     * 从数据库查询结果中返回Array<CvtNonReceive>的值
     * @param data 
     */
    private _getCvtNonChecksFromDBResult(data): Array<CvtNonCheck> {
        var cvtNonChecks: Array<CvtNonCheck> = new Array<CvtNonCheck>();
        if (data.rows.length > 0) {
            cvtNonChecks = new Array<CvtNonCheck>();
            for (var i = 0; i < data.rows.length; i++) {
                var cvtNonCheck = new CvtNonCheck();
                cvtNonCheck.checkId = data.rows.item(i).CHECK_ID;
                cvtNonCheck.investplanId = data.rows.item(i).INVESTPLAN_ID;
                cvtNonCheck.receiveId = data.rows.item(i).RECEIVE_ID;
                cvtNonCheck.checkBillNum = data.rows.item(i).CHECK_BILL_NUM;
                cvtNonCheck.checkOrg = data.rows.item(i).CHECK_ORG;
                cvtNonCheck.checkDate = data.rows.item(i).CHECK_DATE;
                cvtNonCheck.checkPerson = data.rows.item(i).CHECK_PERSON;
                cvtNonCheck.checkLeader = data.rows.item(i).CHECK_LEADER;
                cvtNonCheck.checkOpinion = data.rows.item(i).CHECK_OPINION;
                cvtNonCheck.checkState = data.rows.item(i).CHECK_STATE;
                cvtNonCheck.assetId = data.rows.item(i).ASSET_ID;
                cvtNonCheck.fundChannel = data.rows.item(i).FUND_CHANNEL;
                cvtNonCheck.assetCode = data.rows.item(i).ASSET_CODE;
                cvtNonCheck.assetName = data.rows.item(i).ASSET_NAME;
                cvtNonCheck.specModel = data.rows.item(i).SPEC_MODEL;
                cvtNonCheck.selfNumber = data.rows.item(i).SELF_NUMBER;
                cvtNonCheck.manufacturer = data.rows.item(i).MANUFACTURER;
                cvtNonCheck.manufactureDate = data.rows.item(i).MANUFACTURE_DATE;
                cvtNonCheck.workInOrg = data.rows.item(i).WORK_IN_ORG;
                cvtNonCheck.serialNumber = data.rows.item(i).SERIAL_NUMBER;
                cvtNonCheck.unit = data.rows.item(i).UNIT;
                cvtNonCheck.quantity = data.rows.item(i).QUANTITY;
                cvtNonCheck.originalValue = data.rows.item(i).ORIGINAL_VALUE;
                cvtNonCheck.isReadyForUse = data.rows.item(i).IS_READY_FOR_USE;
                cvtNonCheck.componentToolDesc = data.rows.item(i).COMPONENT_TOOL_DESC;
                cvtNonCheck.technicalData = data.rows.item(i).TECHNICAL_DATA;
                cvtNonCheck.recordFlag = data.rows.item(i).RECORD_FLAG;
                cvtNonChecks.push(cvtNonCheck);
            }
        }
        return cvtNonChecks;
    }

}
