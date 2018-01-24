import { InvNotice, OrgInfo, UserSimple } from './../entity/entity.provider';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { AlertController } from 'ionic-angular';
import { PubDBProvider } from '../storage/pub.db.provider';
import { InvDBProvider } from '../storage/inv.db.provider';
import { InvWebProvider } from '../web/inv.web.provider';
/*
  资产盘点时对于数据的操作
*/
@Injectable()
export class InvService {

  constructor(
    public alertCtrl:AlertController,
    private invWebProvider:InvWebProvider,
    private pubDBProvider:PubDBProvider,
    private invDBProvider:InvDBProvider,
  ) {
  }

  // /**
  //  * 从本地固定资产台账中获得数据
  //  */
  // queryAssetsFormInv(preWorkerNumber:string,isSignatured:string){
  //   return new Promise<Array<InvAsset>>((resolve,reject)=>{
  //     this.invDBProvider.queryAssetsFromInv(preWorkerNumber,isSignatured).then((data)=>{
  //       resolve(data);
  //     },(err)=>{
  //       reject(err);
  //     });
  //   });
  // }

  // /**
  //  * 根据资产id从资产盘点记录中获取资产信息
  //  * @param assetId 
  //  * @param noticeId
  //  */
  // queryAssetFromInvByIdAndNoticeId(assetId,noticeId){
  //   return new Promise<InvAsset>((resolve,reject)=>{
  //     if(assetId==null||noticeId==null){
  //       reject("错误：资产ID为空或通知ID为空");
  //       return;
  //     }
  //     this.invDBProvider.queryFromInvByIdAndNotice(assetId,noticeId).then((data)=>{
  //       resolve(data);
  //     },(error)=>{
  //       reject(error);
  //     })
  //   })
  // }

  /**
   * 判断盘点通知单是否可用
   * @param invNotice 
   */
  noticeIsAvailable(invNotice):boolean{
    if(invNotice!=null&&invNotice.state=="ISSUED"){
      //说明本地有通知，判断一下时间，
      var timeStart=new Date(invNotice.timeStart);
      var timeFinish=new Date(invNotice.timeFinish);
      var timeNow=new Date();
      var flag=this.isDateBetween(timeNow,timeStart,timeFinish);
      return flag;
    }else{
      return false;
    }
  }

  /**
   * 获取通知,先从本地寻找，如果本地没有则从服务器进行下载
   */
  getInvNoticeByLeadingOrgOrFromServe(leadingOrg:string){
    return new Promise<InvNotice>((resolve,reject)=>{
      if(leadingOrg==null||leadingOrg==""){
        resolve(null);
      }
      this.invDBProvider.queryFromInvNoticeByLeadingOrg(leadingOrg).then((dataNotice)=>{
        var data:InvNotice=null;
        //说明本地有通知，判断一下时间，
        var flag = this.noticeIsAvailable(dataNotice);
        if (flag) {
          //说明在时间范围内，可以盘点
          data = dataNotice;
        }
        if(data!=null){
          resolve(data);
        }else{
          //说明本地没有通知，向服务器找找
          this.invWebProvider.getInvNoticeByOrg(leadingOrg).then((noticeServer)=>{
            var notice:InvNotice=null;
            var flag1=this.noticeIsAvailable(noticeServer);
            if(flag1){
              notice=noticeServer;
            }
            if(notice==null){
              //说明没有存在该通知
              resolve(null);
            }else{
              if(notice.timeStart!=null){
                notice.timeStart=new Date(notice.timeStart);
              }
              if(notice.timeFinish!=null){
                notice.timeFinish=new Date(notice.timeFinish);
              }
              notice.state="ISSUED";

              //有该通知，看本地数据库是否存储，没有的话存下去
              this.invDBProvider.queryFromInvNoticeByLeadingOrg(notice.leadingOrg).then((invNotice)=>{
              if(invNotice==null){
                //本地没有存储，存到本地
                this.invDBProvider.insertToInvNotice(notice).then(()=>{
                  //清除本地该作业区下已经盘点的数据
                  // this.invDBProvider.deleteFromInv
                  // this.invDBProvider.deleteFromInv(notice.leadingOrg).then(()=>{
                  //   resolve(notice);
                  // },(error)=>{
                  //   reject(error);
                  // })
                },(error)=>{
                  reject(error)
                    });
                } else {
                  //每个作业区只会有一个通知记录
                  if (data != null && invNotice.noticeId != data.noticeId) {
                    //说明不是一个通知了，删除本地数据
                    //this.invDBProvider.deleteFromInv(leadingOrg).then();
                  }
                  this.invDBProvider.updateToInvNotice(notice).then(() => {
                    resolve(notice);
                  }, (error) => {
                    reject(error);
                  })
                }
              }, error => {
              reject(error);
            })
            }
          },(error)=>{
            reject("网络连接失败，请确认当前为内网环境！")
          })
        }
      },(error)=>{
        reject("获取本地通知表失败！")
      })
    })

  }


  // /**
  //  * 根据所属单位获取盘点通知，服务器会判断当前时间下有没有通知
  //  * @param leadingOrg 员工所属单位编号
  //  */
  // getInvNoticeByOrgFromServe(leadingOrg:string){
  //   return new Promise<InvNotice>((resolve,reject)=>{
  //     this.invWebProvider.getInvNoticeByOrg(leadingOrg).then((data)=>{
  //       if(data==null){
  //         //说明没有存在该通知
  //         resolve(data);
  //       }else{
  //         if(data.timeStart!=null){
  //           data.timeStart=new Date(data.timeStart);
  //         }
  //         if(data.timeFinish!=null){
  //           data.timeFinish=new Date(data.timeFinish);
  //         }
  //         data.state="ISSUED";
  //         //有该通知，看本地数据库是否存储，没有的话存下去
  //         this.invDBProvider.queryFromInvNoticeByLeadingOrg(leadingOrg).then((invNotice)=>{
  //           if(invNotice==null){
  //             //本地没有存储，存到本地
  //             this.invDBProvider.insertToInvNotice(data).then(()=>{
  //               this.invDBProvider.deleteFromInv(leadingOrg).then(()=>{
  //                 resolve(data);
  //               },(error)=>{
  //                 reject(error);
  //               })
  //             },(error)=>{
  //               reject(error);
  //             });
  //           }else{
  //             if(invNotice.noticeId!=data.noticeId){
  //               //说明不是一个通知了，删除本地数据
  //               this.invDBProvider.deleteFromInv(leadingOrg).then();
  //             }
  //             //每个作业区只会有一个通知记录
  //             this.invDBProvider.updateToInvNotice(data).then(()=>{
                
  //               resolve(data);
  //             },(error)=>{
  //               reject(error);
  //             })
  //           }
  //         },error=>{
  //           reject(error);
  //         })
  //       }
  //     },(err)=>{
  //       reject(err);
  //     });
  //   });
  // }


  /**
   * 根据组织编号获取组织信息
   */
  queryFromOrgInfoByOrgCode(orgCode:string){
    return new Promise<OrgInfo>((resolve,reject)=>{
      this.pubDBProvider.queryFromOrgInfoByOrgCode(orgCode).then((data)=>{
        resolve(data);
      },(error)=>{
        reject(error);
      })
    })
  }

  /**
   * 根据通知ID获取通知单
   */
  queryFromInvNoticeByLeadingOrg(leadingOrg:string){
    return new Promise<InvNotice>((resolve,reject)=>{
      if(leadingOrg==null||leadingOrg==""){
        resolve(null);
      }
      this.invDBProvider.queryFromInvNoticeByLeadingOrg(leadingOrg).then((dataNotice)=>{
        var data: InvNotice = null;
        //说明本地有通知，判断一下时间，
        var flag = this.noticeIsAvailable(dataNotice);
        if (flag) {
          //说明在时间范围内，可以盘点
          data = dataNotice;
        }
        if(data!=null){
          resolve(data);
        }else{
          resolve(null);
        }
      },(error)=>{
        reject(error);
      })
    })
  }



  /**
   * 从本地数据库中查询所有的组织机构
   */
  queryListFromOrgInfo(){
    return new Promise<Array<OrgInfo>>((resolve,reject)=>{
      this.pubDBProvider.queryListFromOrgInfo(0,0).then((data)=>{
        resolve(data);
      },(error)=>{
        reject(error);
      })
    })
  }

  /**
   * 从本地数据库中查询所有的组织机构
   */
  queryListFromUserSimple(){
    return new Promise<Array<UserSimple>>((resolve,reject)=>{
      this.pubDBProvider.queryListFromUserSimple(0,0).then((data)=>{
        resolve(data);
      },(error)=>{
        reject(error);
      })
    })
  }

  //  /**
  //  * 向资产盘点记录表中更新数据
  //  * @param asset 
  //  */
  // updateToInv(asset:InvAsset){
  //   return new Promise((resolve,reject)=>{
  //     this.invDBProvider.updateToInv(asset).then((data)=>{
  //       resolve(data);
  //     },(error)=>{
  //       reject(error);
  //     })
  //   })
  // }

  // /**
  //  * 向资产盘点记录表中插入数据
  //  * @param asset 
  //  */
  // insertToInv(asset:InvAsset){
  //   return new Promise((resolve,reject)=>{
  //     this.invDBProvider.insertToInv(asset).then((data)=>{
  //       resolve(data);
  //     },(error)=>{
  //       this.alertCtrl.create({
  //             title:"提醒",
  //             subTitle:"插入数据失败:"+error,
  //             buttons:["确定"]
  //           }).present();
  //       reject(error);
  //     })
  //   })
  // }

  ////////////进行时间判断///////////////////////

  /**
 * 日期比较大小
 * timeFinish大于timeStart，返回1；
 * 等于返回0；
 * timeFinish小于timeStart，返回-1
 * @param timeStart 日期
 * @param timeFinish 比较的日期
 */
  private dateCompare(timeStart:Date,timeFinish:Date){
    if(timeStart==null||timeFinish==null){
      //有毛病
      alert("解析日期出错");
      return -2;
    }
    var start=timeStart.getTime();
    var finish=timeFinish.getTime();
    if(finish>start){
      return 1;
    }else if(finish==start){
      return 0;
    }else{
      return -1;
    }

  }

  /**
 * 判断日期是否在区间内，在区间内返回true，否返回false
 * @param timeNow 日期
 * @param timeStart 区间开始日期
 * @param timeFinish 区间结束日期
 * @returns {Number}
 */
  private isDateBetween(timeNow:Date,timeStart:Date,timeFinish:Date){
    if(timeNow==null||timeStart==null||timeFinish==null){
      //有毛病
      alert("解析日期出错");
      return;
    }
    var flag=false;
    var startFlag=(this.dateCompare(timeNow,timeStart)<1);
    var endFlag=(this.dateCompare(timeNow,timeFinish)>-1);
    if(startFlag&&endFlag){
      flag=true;
    }
    return flag;
  }

  ////////////进行时间判断END///////////////////////

}
 