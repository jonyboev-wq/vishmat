# -*- mode: python ; coding: utf-8 -*-

import sys
from pathlib import Path

from PyInstaller.utils.hooks import collect_submodules

if "__file__" in globals():
    spec_path = Path(__file__).resolve()
elif len(sys.argv) > 1:
    spec_path = Path(sys.argv[1]).resolve()
else:
    spec_path = Path(sys.argv[0]).resolve()
project_root = spec_path.parent.parent

block_cipher = None

datas = [(str(project_root / "docs"), "docs")]

hiddenimports = collect_submodules("sqlmodel") + collect_submodules("sympy")

pathex = [str(project_root)]


a = Analysis(
    [str(project_root / 'desktop_app' / 'app.py')],
    pathex=pathex,
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)
exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='VishMatTrainer',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,
)
