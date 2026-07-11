const { execFileSync } = require("node:child_process");
const path = require("node:path");

/**
 * Re-sign the .app with a proper ad-hoc signature matching the bundle id, for
 * macOS notifications. When electron-builder skips signing with `identity: null`,
 * the main executable keeps Electron's factory signature (Identifier=Electron,
 * Info.plist=not bound); UNUserNotificationCenter then cannot bind the process to
 * the com.atelier.inditex-tracker bundle and notification registration silently
 * fails. When codesign signs a bundle it derives the identity from
 * CFBundleIdentifier and binds Info.plist into the signature → problem solved.
 * Requires no Apple Developer account (ad-hoc, `--sign -`).
 */
exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== "darwin") return;
  const appName = context.packager.appInfo.productFilename; // "Atelier"
  const appPath = path.join(context.appOutDir, `${appName}.app`);
  execFileSync("codesign", ["--force", "--deep", "--sign", "-", appPath], {
    stdio: "inherit",
  });
  console.log(`[afterPack] ad-hoc signed: ${appPath}`);
};
