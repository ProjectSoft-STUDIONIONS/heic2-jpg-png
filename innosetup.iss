#include "version.iss"  

#define DevAppName "Конвертор heic в jpg или png"
#define DevAppPublisher "ProjectSoft"
#define DevAppURL "https://github.com/ProjectSoft-STUDIONIONS/heic2-jpg-png"
#define DevAppSupportURL "https://github.com/ProjectSoft-STUDIONIONS/heic2-jpg-png/issues"
#define DevAppUpdateURL "https://github.com/ProjectSoft-STUDIONIONS/heic2-jpg-png/latest"
#define DevAppExeName "heic2-jpg-png.exe"

[Setup]
AppId={{D0F05F84-A7C8-4930-8FFC-E98E7FA85042}
AppName={#DevAppName}
AppVersion={#VersionApp}
AppVerName={#DevAppName} {#VersionApp}
AppPublisher={#DevAppPublisher}
AppPublisherURL={#DevAppURL}
AppSupportURL={#DevAppSupportURL}
AppUpdatesURL={#DevAppUpdateURL}
AppCopyright={#DevAppPublisher}
VersionInfoVersion={#VersionApp}
DefaultDirName={autopf}\ConverterHeic-2-JpgPng
DisableDirPage=yes
DisableProgramGroupPage=yes
; PrivilegesRequired=admin
OutputDir=install
OutputBaseFilename=ConverterHeic2JpgPng-Setup
SetupIconFile=application\favicon.ico
UninstallDisplayIcon={app}\{#DevAppExeName}
VersionInfoDescription={#DevAppName} {#VersionApp}
VersionInfoProductName={#DevAppName} {#VersionApp}
Compression=lzma
SolidCompression=yes
WizardStyle=modern
CloseApplications=force
MissingRunOnceIdsWarning=no
UsedUserAreasWarning=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl"

[CustomMessages]
english.AppName={#DevAppName}
russian.AppName={#DevAppName}
english.RunProgramm=Launch application «{#DevAppName}» v{#VersionApp}  
russian.RunProgramm=Запустить приложение «{#DevAppName}» v{#VersionApp}  
english.ProgramName={#DevAppName}
russian.ProgramName={#DevAppName}
english.StopProgramm=Stop «{#DevAppName}»...
russian.StopProgramm=Остановить «{#DevAppName}»...

[Files]
Source: "build\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Run]
Filename: "{app}\Heic2JpgPng.exe"; Flags: postinstall nowait skipifsilent; Description: "{cm:RunProgramm}";

[UninstallDelete]
Type: filesandordirs; Name: {autopf}\{cm:ProgramName}
Type: filesandordirs; Name: {localappdata}\{#DevAppName}

[UninstallRun]
Filename: {sys}\taskkill.exe; Parameters: "/F /IM Heic2JpgPng.exe /T"; Flags: skipifdoesntexist runhidden waituntilterminated; StatusMsg: "{cm:StopProgramm}"

[Icons]
Name: "{autoprograms}\{cm:ProgramName}"; Filename: "{app}\Heic2JpgPng.exe"
Name: "{autodesktop}\{cm:ProgramName}"; Filename: "{app}\Heic2JpgPng.exe"