import { LoginWebProvider } from './../../providers/web/login.web.provider';
import { DataBaseUtil } from './../../providers/utils/dataBaseUtil';
import { HttpUtils } from './../../providers/utils/httpUtils';
import { Properties } from './../../providers/properties/properties';
import { AssetService } from './../../providers/service/asset.service';
import { BackButtonService } from './../../providers/service/backButton.service';
import { NoticeService } from './../../providers/service/notice.service';
import { LocalStorageService } from './../../providers/service/localStorage.service';
import { LoginService } from './../../providers/service/login.service';
import { Component } from '@angular/core';
import {
  AlertController,
    IonicPage,
    LoadingController,
    ModalController,
    NavController,
    NavParams,
    Platform,
} from 'ionic-angular';
// declare var window;

/**
 * 登陆界面
 */
@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  public isRemember="";
  public account;  //账户
  private accountCopy;  //复制账户
  public userPwd;  //密码
  public Local_URL:string=Properties.webConfig.address+":"+Properties.webConfig.port+"/"+Properties.webConfig.project;
  constructor(public modalCtrl: ModalController,
    public navCtrl: NavController, 
    public navParams: NavParams,
    private alertCtrl:AlertController,
    public loginService: LoginService,
    private noticeService:NoticeService,
    private assetService:AssetService,
    private backButtonService: BackButtonService,
    private platform: Platform,
    private loadingCtrl:LoadingController,
    public storageService:LocalStorageService,
    private loginWebProvider:LoginWebProvider) {
      platform.ready().then(() => {
          this.backButtonService.registerBackButtonAction(null);
      });
      this.loginService.getFromStorage("account").then((val)=>{
        if(val!=null&&val!=""){
          this.account=val;
          this.accountCopy=val;
          this.userPwd=this.loginService.getFromStorage("password").then((val)=>{
            this.userPwd=val;
          })
        }
      });
  }
  ionViewWillEnter(){
    this.loginService.getFromStorage("isRemember").then((val)=>{
      if(val!=null&&val!=""){
        this.isRemember=val;
      }else{
        this.isRemember="false";
      }
    })
  }

  test(){
    // this.dbService.getSqliteObject().then((db)=>{
    //   alert(db);
    // })

    this.Local_URL=this.loginWebProvider.getUrl();
    alert(this.Local_URL);
  }
  test2(){
    //Properties.webConfig.address="123";
    alert(DataBaseUtil.getSqliteObject());
    

  }
  test3(){
    this.navCtrl.push("Test2Page");
  }

  logIn(username: HTMLInputElement, password: HTMLInputElement) {
    if (username.value.length == 0) {
      this.noticeService.showNativeToast("请输入账号");
    } else if (password.value.length == 0) {
      this.noticeService.showNativeToast("请输入密码");
    } else {
      this.loginService.queryAccountByUserNameAndPWD(username.value,password.value).then((data)=>{
        if(data==null){
          //查询不到该人信息，账户密码错误
          this.noticeService.showIonicAlert("账号或密码错误，请确认后重试!");          //%%%%%%%%可以进行判断，是账户还是密码错误，做到更智能
        }else{
          let loading=this.loadingCtrl.create({
            content:'正在登陆中.....'
          });
          loading.present();
          //如果是否登陆状态发生改变，在本地数据库进行修改
          // this.loginService.getFromStorage("isRemember").then((val)=>{
          //   if(this.isRemember!=val){
          //     alert("执行方法");
          //     this.loginService.setInStorage("isRemember",this.isRemember+"");
          //   }
          // })
          this.loginService.setInStorage("isRemember",this.isRemember+"");

          // 在本地记录登陆账户信息
          this.loginService.setInStorage("account", username.value);
          this.loginService.setInStorage("password", password.value);
          this.loginService.setInStorage("workerNumber", data.workerNumber);

          //获取该员工信息
          loading.setContent('正在获取员工信息...');
          this.loginService.getUserMessageFromServer(data.userId).then((user) => {
            this.loginService.setInStorage("workForOrg", user.workForOrg);
            this.loginService.setInStorage("wFOAddress", user.wfoAddress);
            this.loginService.setInStorage("userName", user.userName);
            this.loginService.setInStorage("workInOrg",user.workInOrg);
            this.loginService.setInStorage("userId",user.userId);
            this.loginService.setInStorage("signIn","true");
            this.loginService.setInStorage("synchroTime",user.synchroTime);
            
            //查看数据库中是否有该员工的资产信息，没有的话从服务器中更新
            this.assetService.queryAssetsFormFixedByPage(2,1,user.workerNumber).then((data)=>{
              if(data.length==0){
                //没有数据，下载资产数据
                loading.setContent('正在获取资产数据...');
                this.assetService.downloadAndSaveData(user.workerNumber).then((data)=>{
                  //同步员工精简表到本地
                  //更新完可以登陆了
                  loading.dismiss();
                  this.navCtrl.setRoot("HomePage");
                },(error)=>{
                  loading.dismiss();
                  this.noticeService.showIonicAlert("连接超时，请检查网络状况");
                })
              }else{
                //数据库中有数据，登陆
                loading.dismiss();
                this.navCtrl.setRoot("HomePage");
              }
            })
          },(error)=>{
            loading.dismiss();
            this.noticeService.showIonicAlert(error);
          })
        }
      },(error)=>{
        this.noticeService.showIonicAlert(error);
      })
    }
  }
 


  setting(){
    // this.Local_URL=HttpUtils.getUrlFromProperties();
    // var url=this.Local_URL.substring(0,this.Local_URL.lastIndexOf('/'));
    var address=HttpUtils.getUrlAddressFromProperties();
    var port=HttpUtils.getUrlPortFromProperties();
    this.alertCtrl.create({
      title:"设置服务器地址/端口",
      inputs: [
        {
          label:'地址',
          name: 'address',
          placeholder: '地址：'+address
        },
        {
          name:'port',
          placeholder:'端口：'+port
        }
      ],
      buttons:[
        {
          text:'恢复默认值',
          handler:data=>{
            HttpUtils.setDefaultUrlToProperties();
            this.noticeService.showNativeToast("设置成功！");
          }
        },
        {
          text: '确定',
          handler: data => {
            if (data.address == "") {
              this.noticeService.showNativeToast("服务器地址为空！");
            } else if (data.port == "") {
              this.noticeService.showNativeToast("服务器端口为空！");
            } else {
              if (!data.address.includes("http://") && !data.address.includes("https://")) {
                data.address = "http://" + data.address;
              }
              HttpUtils.setUrlToProperties(data.address, data.port);
              //保存到本地
              this.loginService.setInStorage("urlAddress", data.address);
              this.loginService.setInStorage("urlPort", data.port);
              this.noticeService.showNativeToast("设置成功！");
            }
          }
        }
      ]
    }).present();
  }
  
  //在输入框出现后向上移动，防止输入框被遮住
  // @ViewChild(Content) content:Content;
  // showDiv: boolean = false;
  // height=0;
  
  // scrollToUp(){
  //   // this.showDiv = !this.showDiv;
  //   // this.content.resize();

  //   // var top =this.content.scrollTop;
  // //   var eleTop=this.content.contentHeight*0.2;   //为中间用户输入块高度的一半
  // //   var realTop=top+eleTop;
  //   var realTop=this.content.scrollTop+this.content.contentHeight*0.3;
  //   this.height=realTop;
  //   setTimeout(()=>{
  //     this.content.scrollTo(0,realTop,200);
  //   },200);
  // }
  // scrollToDown(){
  //   // this.showDiv = !this.showDiv;
  //   // this.content.resize();

  //   //var realTop=-(this.content.scrollTop+this.content.contentHeight*0.2);
  //   setTimeout(()=>{
  //     this.content.scrollTo(0,-this.height,200);
  //   },200);
    
  // }

}
