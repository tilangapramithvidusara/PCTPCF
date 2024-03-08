import { Buffer } from 'buffer';

export const convertJsonToBase64: any = (jsonData: string) => {
  let objJsonStr = jsonData
  // JSON.stringify(jsonData);
  let objJsonB64 = Buffer.from(objJsonStr).toString("base64");
  return objJsonB64
};

export const convertBase64ToJson : any = async(base64Data: any) => {
  const convertValue = atob(base64Data)
  console.log('convertValue ==> ', convertValue, typeof convertValue);
    
  return convertValue
  // JSON.parse(atob(base64Data))
}