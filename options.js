// 設定を保存する関数
function saveOptions() {
  const rawFilters = document.getElementById('regex-filters').value;
  // 空行を除外して配列に変換
  const filters = rawFilters.split('\n').filter(line => line.trim() !== '');

  browser.storage.local.set({
    regexFilters: filters
  }).then(() => {
    const status = document.getElementById('status-message');
    status.textContent = '設定を保存しました。';
    setTimeout(() => {
      status.textContent = '';
    }, 2000);
  });
}

// 保存された設定を読み込んで表示する関数
function restoreOptions() {
  browser.storage.local.get('regexFilters').then(data => {
    const filters = data.regexFilters || [];
    document.getElementById('regex-filters').value = filters.join('\n');
  });
}

// イベントリスナーを設定
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save-button').addEventListener('click', saveOptions);
