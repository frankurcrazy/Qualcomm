'Utilize Windows zipfldr.dll to unzip the hash file from target.
Set ShellObject = CreateObject("Shell.Application" )
Set Args = Wscript.Arguments

Set ZipFile = ShellObject.NameSpace(Args(0))
Set HashFolder = ShellObject.NameSpace(Args(1))

Set HashFile = ZipFile.Items
HashFolder.CopyHere HashFile, &H214

'Delete the temporary file that is automatically generated in system Temp Folder.
'The temporary file bumps up their number from 1 to 99 at the time of collision and start from 1 all over again. 
'This causes problems, like unzip operation could not exceed 99 times. 
'By deleting the temp file, unlimited unzip operations will be allowed.
Dim EnvTempFolder
Set EnvironmentVars = CreateObject("WScript.Shell").Environment("Process")
EnvTempFolder = EnvironmentVars ("TEMP")

Dim SysTempFileFolder
SysTempFileFolder = EnvTempFolder & "\Temporary Directory 1 for msg_hash.zip"

Set FSO = CreateObject("Scripting.FileSystemObject")
FSO.DeleteFolder (SysTempFileFolder), TRUE

