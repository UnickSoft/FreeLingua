if exist static rd /s /q static

rem Gen for Meta
xcopy dist static /E /H /C /I
call npm run-script build_static

rem Preparing
move static static_
move package.json _package.json
move gen_snap_package.json package.json

rem class room
xcopy dist static /E /H /C /I
xcopy static\js static\classroom\js /E /H /C /I
xcopy static\translations static\classroom\translations /E /H /C /I
call npm run-script build_static

rem Merge
rd /s /q static_\classroom
mkdir static_\classroom
mkdir static_\classroom\catalog
xcopy static\classroom\classroom\catalog static_\classroom\catalog /E /H /C /I
rd /s /q static
move  static_ static

rem Remove unneeded
if exist static\css rd /s /q static\css
if exist static\en rd /s /q static\en
if exist static\fonts rd /s /q static\fonts
if exist static\images rd /s /q static\images
if exist static\js rd /s /q static\js
if exist static\translations rd /s /q static\translations

rem Last return
move package.json gen_snap_package.json
move _package.json package.json



