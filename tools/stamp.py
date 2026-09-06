#!/usr/bin/env python3
"""CSS/JS の参照に ?v=<スタンプ> を打ち直し、ビルド識別子を更新する。

GitHub Pages は cache-control: max-age=600 を返すため、
ファイル名（クエリ）を変えないと古い JS が読み込まれ続けることがある。
"""
import re
import sys

stamp = sys.argv[1] if len(sys.argv) > 1 else 'dev'

html = open('index.html', encoding='utf-8').read()
html = re.sub(r'(href="assets/style\.css)(\?v=[^"]*)?"', r'\1?v=' + stamp + '"', html)
html = re.sub(r'(src="(?:js|data)/[a-z-]+\.js)(\?v=[^"]*)?"', r'\1?v=' + stamp + '"', html)
open('index.html', 'w', encoding='utf-8').write(html)

app = open('js/app.js', encoding='utf-8').read()
app = re.sub(r"const BUILD = '[^']*';", "const BUILD = '" + stamp + "';", app)
open('js/app.js', 'w', encoding='utf-8').write(app)

n = len(re.findall(r'\?v=' + re.escape(stamp), html))
print('  バージョン {} を {} 件のファイル参照に付与'.format(stamp, n))
