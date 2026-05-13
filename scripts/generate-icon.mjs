import { createWriteStream } from 'fs'
import { mkdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')

// インディゴ背景 + "IN" テキストのシンプルなアイコンSVG
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#6366f1"/>
  <!-- ダンベル左 -->
  <rect x="60" y="220" width="40" height="72" rx="10" fill="white"/>
  <rect x="48" y="240" width="24" height="32" rx="6" fill="white"/>
  <!-- ダンベルバー -->
  <rect x="100" y="244" width="312" height="24" rx="8" fill="white"/>
  <!-- ダンベル右 -->
  <rect x="412" y="220" width="40" height="72" rx="10" fill="white"/>
  <rect x="440" y="240" width="24" height="32" rx="6" fill="white"/>
  <!-- IRON NOTE テキスト -->
  <text x="256" y="400" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="72" font-weight="900" fill="white" text-anchor="middle" letter-spacing="-2">IRON NOTE</text>
</svg>`

// sharpがなければsvgそのままpublicに保存してフォールバック
try {
  const { default: sharp } = await import('sharp')
  const sizes = [
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
  ]
  for (const { name, size } of sizes) {
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, name))
    console.log(`✅ ${name} (${size}x${size}) 生成完了`)
  }
} catch (e) {
  console.error('sharp が見つかりません。npm install sharp を実行してください。')
  console.error(e.message)
}
