import fs from 'fs'
import html from 'rollup-plugin-html'
import postcss from 'rollup-plugin-postcss'
import fileAsBlob from 'rollup-plugin-file-as-blob'
import vue from 'rollup-plugin-vue'

export default {
  input: 'src/main.js',
  strict: false,
  plugins: [
    vue({ autoStyles: false, styleToImports: true }),
    html({
      include: '**/*.html'
    }),
    postcss(),
    fileAsBlob({
      include: ['**/*.mp3', '**/*.wav', '**/*.png', '**/*.svg']
    })
  ],
  banner: fs.readFileSync('banner.txt'),
  output: [
    {
      name: 'asdasdasda',
      file: 'build/PendoriaPlus.user.js',
      format: 'iife'
    }
  ]
}