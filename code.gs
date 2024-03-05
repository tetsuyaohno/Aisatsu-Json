function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('埋め込み操作')
    .addItem('埋込参照用ファイル作成', 'makeFile')
    .addToUi();
}
/******************************************************************
 * シート単位でembedding用のデータファイルを作成
 * アクティブシートの物を実行　ファイルネーム＝シート名.json
 * */
function makeFile(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getActiveSheet();
  const valsh = sh.getDataRange().getValues();
  const shName = sh.getName();
  const ui = SpreadsheetApp.getUi();//ユーザーインターフェイスオブジェクト呼び出し
  var title = '埋込参照ファイル作成';
  var prompt = 'ファイル： ' + shName + '.json　を作成します。\n　よろしいですか？'
  var kakunin = ui.alert(title, prompt, ui.ButtonSet.OK_CANCEL);
  if(kakunin == 'OK') {
    var tyukan = valsh.map((value)=>{
      if(value[1] != ''){return {"restext":value[1]};}//アクティブシートの内容をjson形式に変換
    });
    var embedJson = tyukan.filter((value)=>{return value != null;});//null値をのける
    //Logger.log('シート名' + shName + JSON.stringify(embedJson));
    fileOutput(embedJson, shName);//埋め込み文書ファイル作成
  }
  
}
/********************************************************************
 * OpenAIのAPIを使用して埋め込みを生成
 * 引数：input＝シート内容の配列データ
 * 戻り値：inputに対応する座標データ（埋め込み）
 */  
const createEmbedding = async(input) => {
    try {
    //スクリプトプロパティに設定したOpenAIのAPIキーを取得
    const prop = PropertiesService.getScriptProperties();
    const apiKey = prop.getProperty('APIKEY');
    
    //ChatGPTのAPIのエンドポイントを設定
    const apiUrl = 'https://api.openai.com/v1/embeddings';
    const headers = {
      'Authorization':'Bearer '+ apiKey,
      'Content-type': 'application/json',
      'X-Slack-No-Retry': 1
    };
    const options = {
      'muteHttpExceptions' : true,
      'headers': headers, 
      'method': 'POST',
      'payload': JSON.stringify({
        'model': 'text-embedding-3-small',
        'input': input})
    };//model': 'text-embedding-ada-002'
    const response = await JSON.parse(UrlFetchApp.fetch(apiUrl, options).getContentText());
    const kaitou = response.data[0].embedding;//.data[0].embedding
    //Logger.log('kaitou= ' + JSON.stringify(kaitou));
    return kaitou;
  } catch(e) {
      console.error('エラー' + e);
      throw e;
  }
}
/***************************************************************
 * 参照用json文字列を作成
 * 引数：bunshoJson＝シート内容のjsonデータ
 * 戻り値：jsonデータ{text:入力文書, vector:生成された座標（埋め込み）}の配列
 */
const createVector = async (bunshoJson) => {
  try{
    const bunsho = bunshoJson.map(value => {
    return value.restext ;
    });
    //Logger.log('result= ' + bunsho);
    const promised = bunsho.map(async input => {
      return {
        text: input,
        vector: await createEmbedding(input)
      };
    });
    return await Promise.all(promised);
  } catch (error) {
    Logger.log(error);
  }
}
/*******************************************************************
 * 埋め込み文書ファイル作成
 * 引数：jsonObj＝シート内容のjsonデータ　sheetName＝アクティブシート（元データのシート）
 * 戻り値：　なし
 */
const fileOutput = async (jsonObj, sheetName) => {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const spId = ss.getId();//スプレッドシートのファイルIDを取得
  const spFile = DriveApp.getFileById(spId);//スプレッドシートをファイルオブジェクトとして取得
  const myFolder = spFile.getParents().next();//スプレッドシートの親フォルダーを取得
  //const myFolderId = myFolder.getId();//自フォルダID取得
  var ui = SpreadsheetApp.getUi();//ユーザーインターフェイスオブジェクト呼び出し
  const fileName = sheetName + '.json';
  /**************埋め込みデータを生成して、jsonファイルに書き出す************ */
  //埋め込みデータ生成
  const bunshoVector = await createVector(jsonObj);
  //戻り値を文字列化
  let jsonString = JSON.stringify(bunshoVector);
  // コンテンツタイプ
  const contentType = 'text/json';
  // 文字コード
  const charset = 'UTF-8';
  try{
    // Blob を作成する
    const blob = Utilities.newBlob('', contentType, fileName).setDataFromString(jsonString, charset);
    // ファイルに保存
    myFolder.createFile(blob);
    ui.alert('埋込参照ファイル ' + fileName + ' を作成しました。');
    Logger.log('Successfully wrote JSON file');
  }catch(err){
    ui.alert('Error writing JSON file' + err);
    Logger.log('Error writing JSON file' + err);
  }
  
}