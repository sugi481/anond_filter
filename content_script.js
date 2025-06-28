(function() {
  console.log('[はてな匿名ダイアリー カスタマイザー] スクリプト実行開始');

  // --- グローバル変数としてフィルターを保持 ---
  let regexes = [];

  /**
   * 渡された単一の記事ブロック（.section）をフィルタリングする関数
   * @param {Element} entry - .section のDOM要素
   */
  function filterSingleEntry(entry) {
    if (regexes.length === 0) return; // フィルターがなければ何もしない

    // 記事ブロック内の全テキストを取得
    const fullTextContent = entry.textContent;
    
    // いずれかの正規表現にマッチするかテスト
    const shouldHide = regexes.some(regex => regex.test(fullTextContent));

    if (shouldHide) {
      // マッチした場合、記事ブロック全体を非表示に
      entry.style.display = 'none';
      // console.log('[カスタマイザー] 記事を非表示にしました:', fullTextContent.substring(0, 50) + '...');
    }
  }

  /**
   * ページ上の既存のすべての記事をフィルタリングする関数
   */
  function filterAllExistingEntries() {
    console.log('[カスタマイザー] 既存記事のフィルタリングを実行中...');
    document.querySelectorAll('div.section').forEach(filterSingleEntry);
  }

  /**
   * ストレージからフィルター設定を読み込み、グローバル変数にセットする関数
   */
  async function loadFilters() {
    try {
      const data = await browser.storage.local.get("regexFilters");
      const filters = data.regexFilters || [];
      console.log('[カスタマイザー] 読み込んだフィルター:', filters);
      
      regexes = filters.map(pattern => {
        try {
          return new RegExp(pattern, 'i');
        } catch (e) {
          console.error(`[カスタマイザー] 無効な正規表現: "${pattern}"`);
          return null;
        }
      }).filter(Boolean); // nullになった無効な正規表現を除外

    } catch (error) {
      console.error("[カスタマイザー] フィルター設定の読み込みに失敗:", error);
    }
  }

  /**
   * その他の不要な要素を削除する関数
   */
  function removeClutter() {
    // 人気・注目エントリ
    document.querySelector('.hotentries-wrapper')?.remove();
    // その他広告など
    const selectorsToRemove = [
      '.ad-in-entry-block', '.share-button',
      '#ad-overlay-bottom-sp-1', '#ad-index-sp-3',
      '#google_ads_iframe', '.google-one-tap__module', 'noscript'
    ];
    document.querySelectorAll(selectorsToRemove.join(',')).forEach(el => el.remove());
  }


  // --- メイン処理 ---

  async function main() {
    // 1. まずフィルター設定を読み込む
    await loadFilters();

    // 2. ページに最初から存在する要素をすべて処理する
    removeClutter();
    filterAllExistingEntries();

    // 3. ページの動的な変更を監視するオブザーバーをセットアップ
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          // ノード（要素）が追加された場合
          mutation.addedNodes.forEach(node => {
            // 追加されたのが要素ノードで、かつ .section を含むか、自身が .section の場合
            if (node.nodeType === 1) {
              if (node.matches('div.section')) {
                filterSingleEntry(node);
              }
              // 追加されたノードの子孫に .section が含まれる場合も処理
              node.querySelectorAll('div.section').forEach(filterSingleEntry);
            }
          });
        }
      }
    });

    // 4. ドキュメント全体の変更監視を開始
    observer.observe(document.body, { childList: true, subtree: true });
    console.log('[カスタマイザー] ページの動的変更の監視を開始しました。');
  }

  main();

})();
