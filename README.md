# Aisatsu-Json
あいさつアシスタントで参照するエッセンス文書の埋め込み（Embedding）生成
<h2>準備</h2>
<p>　以下の手順で任意のアカウント上のGoogleSpreadSheetに、「あいさつアシスタント用埋め込み文書ファイル作成ツール」を構築します。<br>
  　以降の説明はOpenAIのAPIキー、Googleアカウントを取得していることを前提としています。<br>
  　OpenAIのAPIキーに関しては<a href="https://platform.openai.com/docs/quickstart">こちら</a>の<strong>アカウントの設定</strong>を参照してください。<br>
  　Googleアカウントに関しては<a href="https://support.google.com/accounts/answer/27441?hl=ja">こちら</a>を参考にしてください。
  <ol>
    <li>GoogleSpreadSheetを新規作成し任意の名前を付ける</li>
    <li>メニュー　-> 拡張機能 -> AppsScript を選択、<br>画面が変わったら左側のメニューの「<> エディタ」を選択</li>
    <li>Function myFunction(){    }など入力されているものがあれば全部消す</li>
    <li>このリポジトリにあるcode.gsの内容をコピーして貼り付けて保存する、（ファイル名は何でもよい）</li>
    <li>左側メニューの「⚙　プロジェクトの設定」を選択、下の方にある「<strong>スクリプトプロパティの追加</strong>」をクリック</li>
    <li>プロパティ欄に「<strong>APIKEY</strong>」、値欄にOpenAIから発行された APIキーの値をそれぞれ入力して、「<strong>スクリプトプロパティを保存</strong>」をクリック</li>
    <li>SpreadSheet本体に戻り、シートに名前を付ける ※このシート名がデフォルトのファイル名になる</li>
  </ol></p>
<h2>文章を入力して埋め込みを作成</h2>
<p>
  純粋倫理の様々なフレーズを1セクション1行（セルの行）を目安に入力していきます。<br>
  入力はB列（2列目）に行います（プログラムはこの列を参照します）。<br>
  リポジトリにあるCSVファイル「aisatsu.csv」を参考にしてください。※このファイルの内容をコピペしても動作します。</p>
<p>
  入力し終わったら、メニュー -> 埋め込み操作 -> 埋め込み参照用ファイル作成 をクリックします。<br>
  SpreadSheetと同じフォルダにJSONファイルが生成されています。このファイルを関数本体のフォルダに貼り付ければ動作します。<br>
  ※aisatsu.json以外のファイル名で生成された場合は、本体のコードを実際のファイル名に合わせて書き換える必要があります。<br>
  gptmod.jsの上の方（10行目くらい）<code>const JOUHOU_INPUT = 'aisatsu.json';</code><-ここのファイル名を実際のファイル名と合わせておきます。
</p>
