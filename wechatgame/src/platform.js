const config = require('./config.js');

const SAVE_KEY = 'shan-hai-wechat-game-v1';

function loadSave() {
  try { return wx.getStorageSync(SAVE_KEY) || {}; } catch { return {}; }
}

function save(data) {
  try { wx.setStorageSync(SAVE_KEY, data); } catch {}
}

function showRewarded(reason) {
  if (!config.rewardedVideoAdUnitId) return Promise.resolve(Boolean(config.devGrantRewardWithoutAd));
  return new Promise((resolve) => {
    const ad = wx.createRewardedVideoAd({ adUnitId: config.rewardedVideoAdUnitId });
    const finish = (granted) => { ad.offClose?.(onClose); ad.offError?.(onError); resolve(granted); };
    const onClose = (result) => finish(result === undefined || Boolean(result.isEnded));
    const onError = () => finish(false);
    ad.onClose(onClose);
    ad.onError(onError);
    ad.show().catch(() => ad.load().then(() => ad.show()).catch(onError));
  });
}

module.exports = { loadSave, save, showRewarded };
