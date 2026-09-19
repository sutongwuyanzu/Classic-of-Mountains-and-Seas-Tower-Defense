const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const templateDirectory = path.join(root, 'steam', 'build');
const placeholders = ['__STEAM_APP_ID__', '__STEAM_DEPOT_ID__', '__STEAM_CONTENT_ROOT__', '__STEAM_BUILD_OUTPUT__', '__BUILD_LABEL__'];

function read(file) {
  if (!fs.existsSync(file)) throw new Error(`找不到 SteamPipe 配置：${file}`);
  return fs.readFileSync(file, 'utf8');
}

function assertSafeTemplate(text, file) {
  if (/"(?:username|password|token)"/i.test(text)) throw new Error(`配置不得保存凭据：${file}`);
  if (!/"setlive"\s+""/i.test(text)) throw new Error(`模板必须保持空 setlive，禁止自动设为公开分支：${file}`);
}

function assertConcreteConfig(text, file) {
  if (placeholders.some((token) => text.includes(token))) throw new Error(`配置仍含占位符，禁止上传：${file}`);
  if (/"(?:username|password|token)"/i.test(text)) throw new Error(`配置不得保存凭据：${file}`);
}

function assertConcreteAppBuild(text, file) {
  assertConcreteConfig(text, file);
  if (!/"appid"\s+"\d+"/i.test(text)) throw new Error(`AppID 必须是 Steamworks 分配的数字：${file}`);
  if (!/"setlive"\s+""/i.test(text)) throw new Error(`只允许通过后台明确设置测试分支；配置不得自动 SetLive：${file}`);
}

function validateTemplate() {
  const appTemplate = path.join(templateDirectory, 'app_build_template.vdf');
  const depotTemplate = path.join(templateDirectory, 'depot_build_windows_template.vdf');
  const app = read(appTemplate);
  const depot = read(depotTemplate);
  assertSafeTemplate(app, appTemplate);
  if (!/^\s*"appbuild"/i.test(app) || !/"appid"\s+"__STEAM_APP_ID__"/i.test(app) || !/"__STEAM_DEPOT_ID__"\s+"depot_build_windows\.vdf"/i.test(app)) throw new Error('App 模板缺少 AppBuild、AppID、DepotID 或 Windows depot 引用。');
  if (!/^\s*"depotbuild"/i.test(depot) || !/"depotid"\s+"__STEAM_DEPOT_ID__"/i.test(depot) || !/"contentroot"\s+"__STEAM_CONTENT_ROOT__"/i.test(depot)) throw new Error('Depot 模板缺少 DepotBuild、DepotID 或内容根目录占位符。');
  if (!/"localpath"\s+"\*"/i.test(depot) || !/"depotpath"\s+"\."/i.test(depot) || !/"recursive"\s+"1"/i.test(depot)) throw new Error('Depot 模板必须映射已验收内容目录的全部运行时文件。');
  console.log('SteamPipe 模板结构通过；它含显式占位符，不能用于上传。');
}

function validateConcreteBuild(appBuildPath) {
  const appFile = path.resolve(appBuildPath);
  const app = read(appFile);
  assertConcreteAppBuild(app, appFile);
  const depotMatch = app.match(/"\d+"\s+"([^"\\/]+\.vdf)"/i);
  if (!depotMatch) throw new Error(`未能从 App 配置找到 depot VDF：${appFile}`);
  const depotFile = path.resolve(path.dirname(appFile), depotMatch[1]);
  const depot = read(depotFile);
  assertConcreteConfig(depot, depotFile);
  if (!/^\s*"depotbuild"/i.test(depot)) throw new Error(`Depot VDF 顶层必须是 DepotBuild：${depotFile}`);
  if (!/"depotid"\s+"\d+"/i.test(depot)) throw new Error(`DepotID 必须是 Steamworks 分配的数字：${depotFile}`);
  const contentRoot = depot.match(/"contentroot"\s+"([^"]+)"/i)?.[1];
  if (!contentRoot || !fs.existsSync(contentRoot)) throw new Error(`ContentRoot 不存在：${contentRoot || '(未配置)'}`);
  const executable = path.join(contentRoot, '山海异兽志.exe');
  if (!fs.existsSync(executable)) throw new Error(`ContentRoot 未找到候选 EXE：${executable}`);
  console.log(`SteamPipe 本地上传前校验通过：${appFile}`);
}

try {
  if (process.argv[2]) validateConcreteBuild(process.argv[2]);
  else validateTemplate();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
