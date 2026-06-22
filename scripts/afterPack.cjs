const { execFileSync } = require("node:child_process");
const path = require("node:path");

/**
 * macOS bildirimleri için .app'i bundle id'siyle eşleşen düzgün bir ad-hoc imzayla
 * yeniden imzala. electron-builder `identity: null` ile imzayı atladığında ana
 * çalıştırılabilir Electron'un fabrika imzasıyla (Identifier=Electron, Info.plist=not bound)
 * kalır; bu durumda UNUserNotificationCenter süreci com.atelier.inditex-tracker paketine
 * bağlayamaz ve bildirim kaydı sessizce başarısız olur. codesign bir bundle'ı imzalarken
 * kimliği CFBundleIdentifier'dan türetir ve Info.plist'i imzaya bağlar → sorun çözülür.
 * Apple Developer hesabı gerektirmez (ad-hoc, `--sign -`).
 */
exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== "darwin") return;
  const appName = context.packager.appInfo.productFilename; // "Atelier"
  const appPath = path.join(context.appOutDir, `${appName}.app`);
  execFileSync("codesign", ["--force", "--deep", "--sign", "-", appPath], {
    stdio: "inherit",
  });
  console.log(`[afterPack] ad-hoc imzalandı: ${appPath}`);
};
