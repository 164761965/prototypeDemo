import { PubConstant } from './../entity/constant.provider';
import { InvAsset, InvNotice } from './../entity/entity.provider';
import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { PhotoLibrary } from '@ionic-native/photo-library';
import 'rxjs/add/operator/map';
import { HttpUtils } from '../utils/httpUtils';
import { AttachmentWebProvider } from './attachment.web.provider';

@Injectable()
export class InvWebProvider{
    constructor(public http: Http,
        private photoLibrary: PhotoLibrary,
        private attaWebProvider:AttachmentWebProvider,) {
  }
  getUrl(){
    return HttpUtils.getUrlFromProperties()+"/inv";
  }

    /**
     * 根据单位获得盘点通知单
     * @param leadingOrg 
     */
    getInvNoticeByOrg(leadingOrg: string) {
        let params = "?leadingOrg=" + leadingOrg;
        return new Promise<InvNotice>((resolve, reject) => {
          this.http.get(this.getUrl() + '/notice' + params)
            .map(res => res.json())
            .subscribe((data) => {
              if (JSON.stringify(data) == "{}") {
                resolve(null);
              } else {
                resolve(data);
              }
            }, err => {
              reject(err);
            })
        })
    
      }

      /**
     * 根据单位获得盘点通知单
     * @param leadingOrg 
     */
    test() {
      return new Promise<InvNotice>((resolve, reject) => {
        this.http.get("http://10.88.133.45:8080/eaam-app/file/img")
          .subscribe((data) => {
            alert("返回结果");
          }, err => {
            reject(err);
          })
      })
  
    }

      /**
   * 将本地资产盘点记录数据同步到服务器
   */
  syncInvToServer(invAssets: Array<InvAsset>) {
    let options =HttpUtils.getRequestOptions();
    var json = JSON.stringify(invAssets);
    console.log(json);
    let obj: any = {
      invAssets: json
    }
    return new Promise((resolve, reject) => {
      this.http.post(this.getUrl() + "/record", HttpUtils.toQueryString(obj), options)
        .map(res => res.json())
        .subscribe((data) => {
          if (invAssets.length == 0) {
            resolve();
          } else {
            for (var i = 0; i < invAssets.length; i++) {
              //图片上传成功
              //传签名
              let invAsset = invAssets[i];
              //上传签名文件
              this.attaWebProvider.uploadSignature(invAsset.workerNumber, invAsset.signaturePath, invAsset.signature, invAsset.invRecordId, null, null, PubConstant.ATTACHMENT_TYPE_INV_SIGNATURE, this.attaWebProvider.UploadType.BASE64).then((data) => {
                //上传图片
                let photos: Array<string> = new Array<string>();
                if (invAsset.photoPath != "") {
                  photos = JSON.parse(invAsset.photoPath);
                }
                this.attaWebProvider.uploadFile(invAsset.noticeId, PubConstant.ATTACHMENT_TYPE_INV_IMG, invAsset.workerNumber, photos, this.attaWebProvider.UploadType.BASE64).then(() => {
                  if (invAsset.assetId == invAssets[invAssets.length - 1].assetId) {
                    //说明完成了最后一个的图片上传
                    resolve("同步成功");
                  }
                  //图片上传成功
                }, (fail) => {
                  //图片上传失败
                  resolve("同步成功");
                  // reject("图片上传失败"+fail+"<br>");
                });//END上传图片
              }, error => {
                reject(error + "<br>")
              })
            }
          }
        }, err => {
          reject(err + "<br>");
        });
    });
  }
  

  
}