// This file is auto-generated, don't edit it
// 依赖的模块可通过下载工程中的模块依赖文件或右上角的获取 SDK 依赖信息查看
import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import Console from '@alicloud/tea-console';
import Util, * as $Util from '@alicloud/tea-util';
import * as $tea from '@alicloud/tea-typescript';


export default class Client {

  /**
   * 使用AK&SK初始化账号Client
   * @param accessKeyId
   * @param accessKeySecret
   * @return Client
   * @throws Exception
   */
  static createClient(accessKeyId: string, accessKeySecret: string): Dysmsapi20170525 {
    let config = new $OpenApi.Config({
      // 必填，您的 AccessKey ID
      accessKeyId: "LTAI5tC2GZdveoTAuuCg3NJY",
      // 必填，您的 AccessKey Secret
      accessKeySecret: "imlfirsOrv2D2vCfXn8JB6AJQjgOuu",
    });
    // Endpoint 请参考 https://api.aliyun.com/product/Dysmsapi
    config.endpoint = `dysmsapi.aliyuncs.com`;
    return new Dysmsapi20170525(config);
  }

  static async main(args: string[]): Promise<void> {
    // 请确保代码运行环境设置了环境变量 ALIBABA_CLOUD_ACCESS_KEY_ID 和 ALIBABA_CLOUD_ACCESS_KEY_SECRET。
    // 工程代码泄露可能会导致 AccessKey 泄露，并威胁账号下所有资源的安全性。以下代码示例仅供参考，建议使用更安全的 STS 方式，更多鉴权访问方式请参见：https://help.aliyun.com/document_detail/378664.html
    let client = Client.createClient(process.env['ALIBABA_CLOUD_ACCESS_KEY_ID'], process.env['ALIBABA_CLOUD_ACCESS_KEY_SECRET']);
    // 声明commandLineArgs常量，用于存储Node.js中的一个全局对象数组process.argv,该步用于测试传递给脚本的命令行参数在数组中的具体位置
    const commandLineArgs = process.argv;
    console.log(commandLineArgs);
    // 声明phoneNumber存储Node.js中的一个全局对象数组process.argv索引值为2中的数据
    const phoneNumber = process.argv[2]
    // 声明formattedNumber存储Node.js中的一个全局对象数组process.argv索引值为3中的数据
    const formattedNumber = process.argv[3]
    let sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
      signName: "hooray",
      templateCode: "SMS_462675213",
      phoneNumbers: phoneNumber,
      templateParam: `{"code":"${formattedNumber}"}`,
    });
    let runtime = new $Util.RuntimeOptions({});
    try {
      await client.sendSmsWithOptions(sendSmsRequest, runtime);
    } catch (error) {
      Util.assertAsString(error.message);
    }
  }

}

Client.main(process.argv.slice(2));